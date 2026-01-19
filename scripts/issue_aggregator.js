const fs = require('fs');
const path = require('path');

module.exports = async ({ github, context, core }) => {
    const owner = context.repo.owner;
    const repo = context.repo.repo;
    
    const issue_number = context.payload.inputs?.issue_number 
                         ? parseInt(context.payload.inputs.issue_number) 
                         : context.issue.number;

    if (!issue_number) {
        core.setFailed("No issue number found in context or inputs.");
        return;
    }

    const issue = await github.rest.issues.get({
        owner, repo, issue_number
    });

    if (issue.data.state !== 'open') {
        console.log(`skipping: Issue #${issue_number} is already closed.`);
        return; 
    }

    const bodyText = issue.data.body || "";
    const issueLabels = issue.data.labels.map(l => typeof l === 'string' ? l : l.name);

    function extractField(label) {
        const re = new RegExp(`###\\s*${label}\\s*\\n\\s*([\\s\\S]*?)(?:\\n\\n|###|$)`, 'i');
        const m = bodyText.match(re);
        return m ? m[1].trim() : '';
    }

    try {
        if (issueLabels.includes('🚨 bug')) {
            const fix = extractField("💡 Suggested New ID \\(Optional\\)");
            const platform = extractField("💻 Which platform is broken\\?");
            
            if (platform.includes("WinGet") || platform.includes("Both")) core.exportVariable('REQ_WIN_ID', fix);
            if (platform.includes("Homebrew") || platform.includes("Both")) core.exportVariable('REQ_BREW_ID', fix);
            core.exportVariable('TOOL_NAME', extractField("🆔 Registry ID"));
        } else {
            core.exportVariable('REQ_WIN_ID', extractField("🪟 WinGet ID \\(Windows\\)"));
            core.exportVariable('REQ_BREW_ID', extractField("🍎 Homebrew ID \\(macOS/Darwin\\)"));
            core.exportVariable('TOOL_NAME', extractField("📛 Tool Name"));
        }

        const registryPath = path.join(process.cwd(), 'os_tools.json');
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        const WIN_DATA = process.env.WIN_DATA ? JSON.parse(process.env.WIN_DATA) : null;
        const BREW_DATA = process.env.BREW_DATA ? JSON.parse(process.env.BREW_DATA) : null;

        if (!WIN_DATA && !BREW_DATA) return;

        if (issueLabels.includes('🚨 bug')) {
            const targetId = extractField("🆔 Registry ID");
            const platformChoice = extractField("💻 Which platform is broken\\?");
            const suggestedFix = extractField("💡 Suggested New ID \\(Optional\\)");

            let toolIndex = registry.os_tools.findIndex(t => t.id === targetId);
            if (toolIndex === -1) {
                await github.rest.issues.createComment({ owner, repo, issue_number, 
                    body: `❌ **Error**: Tool ID \`${targetId}\` not found in registry.` });
                return;
            }

            let updated = false;
            let logMsg = "";

            if (platformChoice.includes("WinGet") || platformChoice.includes("Both")) {
                if (WIN_DATA?.found) {
                    registry.os_tools[toolIndex].platforms.win32 = suggestedFix || registry.os_tools[toolIndex].platforms.win32;
                    updated = true;
                    logMsg += "- WinGet ID updated ✅\n";
                } else { logMsg += "- WinGet Fix Failed ❌\n"; }
            }

            if (platformChoice.includes("Homebrew") || platformChoice.includes("Both")) {
                if (BREW_DATA?.found) {
                    registry.os_tools[toolIndex].platforms.darwin = suggestedFix || registry.os_tools[toolIndex].platforms.darwin;
                    updated = true;
                    logMsg += "- Homebrew ID updated ✅\n";
                } else { logMsg += "- Homebrew Fix Failed ❌\n"; }
            }

            if (updated) {
                finalizeRegistry(registry, registryPath, "patch", { name: targetId }, core);
                await github.rest.issues.createComment({ owner, repo, issue_number, body: `🔧 **Tool Repaired!**\n${logMsg}` });
            }
        } 
        else if (issueLabels.includes('✨ new-tool')) {
            const parsed = {
                name: extractField("📛 Tool Name"),
                win_id: extractField("🪟 WinGet ID \\(Windows\\)"),
                brew_id: extractField("🍎 Homebrew ID \\(macOS/Darwin\\)")
            };

            if (WIN_DATA?.found && BREW_DATA?.found) {
                const newEntry = {
                    id: parsed.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, ''),
                    name: parsed.name,
                    description: extractField("📝 Short Description") || "A cross-platform developer tool.",
                    platforms: { win32: parsed.win_id, darwin: parsed.brew_id }
                };
                registry.os_tools.push(newEntry);
                finalizeRegistry(registry, registryPath, "minor", parsed, core);
                await github.rest.issues.createComment({ owner, repo, issue_number, body: `✅ **Success!** New tool added.` });
            }
        }

    } catch (error) {
        handleError(error, github, context, core, owner, repo, issue_number);
    }
};

function finalizeRegistry(registry, filePath, changeType, parsed, core) {
    registry.metadata.updated = new Date().toISOString().replace('T', ' ').split('.')[0];
    registry.metadata.change = changeType;
    fs.writeFileSync(filePath, JSON.stringify(registry, null, 4));
    fs.writeFileSync('apply_signal.json', JSON.stringify(parsed));
    core.exportVariable('CHANGE_TYPE', changeType);
}

function handleError(error, github, context, core, owner, repo, issue_number) {
    if (error.status === 403 || error.status === 429) {
        github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['⏳ rate-limited'] });
        core.setFailed("Rate limit hit.");
    } else {
        core.setFailed(error.message);
    }
}