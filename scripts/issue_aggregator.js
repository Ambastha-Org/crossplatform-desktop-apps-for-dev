const fs = require('fs');
const path = require('path');

module.exports = async ({ github, context, core }) => {
    const { WIN_DATA, BREW_DATA } = process.env;
    const bodyText = context.payload.issue.body || "";
    const { owner, repo } = context.repo;
    const issue_number = context.issue.number;

    // --- 1. INDUSTRIAL FORM PARSING ---
    // Extract values based on the specific labels in add_tool.yml
    const extractField = (label) => {
        const regex = new RegExp(`### ${label}\\s*\\n\\s*([\\s\\S]*?)(?:\\n\\n|###|$)`, 'i');
        const match = bodyText.match(regex);
        return match ? match[1].trim() : '';
    };

    const data = {
        name: extractField("📛 Tool Name"),
        win_id: extractField("🪟 WinGet ID \\(Windows\\)"),
        brew_id: extractField("🍎 Homebrew ID \\(macOS/Darwin\\)"),
        type: bodyText.includes('✨ new-tool') ? 'new-tool' : 'broken-id'
    };

    // Export parsed fields for Workflow consumption
    try {
        core.exportVariable('REQ_WIN_ID', data.win_id);
        core.exportVariable('REQ_BREW_ID', data.brew_id);
        core.exportVariable('TOOL_NAME', data.name);
    } catch (e) { /* Non-fatal */ }

    // --- 2. COLLISION CHECK (First Pass Only) ---
    if (data.type === 'new-tool' && !WIN_DATA && !BREW_DATA) {
        const registryPath = path.join(process.cwd(), 'os_tools.json');
        if (fs.existsSync(registryPath)) {
            const registryData = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
            const collision = registryData.os_tools.find(t =>
                (data.win_id && t.platforms.win32 === data.win_id) ||
                (data.brew_id && t.platforms.darwin === data.brew_id)
            );

            if (collision) {
                let dupBody = `### 🛑 Duplicate Detected\n\nThis ID is already registered under **${collision.name}** (\`${collision.id}\`).`;
                await github.rest.issues.createComment({ owner, repo, issue_number, body: dupBody });
                await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['🚫 duplicate'] });
                await github.rest.issues.update({ owner, repo, issue_number, state: 'closed' });
                core.setFailed("Collision detected.");
                return;
            }
        }
    }

    // --- 3. FINAL AGGREGATION & TRIAGE (Second Pass Only) ---
    if (WIN_DATA || BREW_DATA) {
        const win = WIN_DATA ? JSON.parse(WIN_DATA) : { found: false, suggestion: 'none' };
        const brew = BREW_DATA ? JSON.parse(BREW_DATA) : { found: false, suggestion: 'none' };

        if (!win.found && !brew.found) {
            let body = `### ❌ Verification Failed\n\nI couldn't find matches. Suggestions:\n`;
            if (win.suggestion !== 'none') body += `**WinGet:** \`${win.suggestion}\`\n`;
            if (brew.suggestion !== 'none') body += `**Homebrew:** \`${brew.suggestion}\`\n`;

            await github.rest.issues.createComment({ owner, repo, issue_number, body });
            await github.rest.issues.update({ owner, repo, issue_number, state: 'closed' });
            core.setFailed("Verification failed.");
        } else {
            await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['✅ auto-verified'] });
            await github.rest.issues.createComment({
                owner, repo, issue_number,
                body: `### ✅ Verification Passed\n\n- WinGet: ${win.found ? '✅' : '❌'}\n- Homebrew: ${brew.found ? '✅' : '❌'}`
            });
        }
    }
};