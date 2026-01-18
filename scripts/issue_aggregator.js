const fs = require('fs');
const path = require('path');

module.exports = async ({ github, context, core }) => {
    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const issue_number = context.issue.number;
    const bodyText = context.payload.issue ? context.payload.issue.body : "";

    function extractField(label) {
        const re = new RegExp(`###\\s*${label}\\s*\\n\\s*([\\s\\S]*?)(?:\\n\\n|###|$)`, 'i');
        const m = bodyText.match(re);
        return m ? m[1].trim() : '';
    }

    const parsed = {
        name: extractField("📛 Tool Name") || (context.payload.inputs && context.payload.inputs.tool_name) || '',
        win_id: extractField("🪟 WinGet ID \\(Windows\\)") || (context.payload.inputs && context.payload.inputs.winget_id) || '',
        brew_id: extractField("🍎 Homebrew ID \\(macOS/Darwin\\)") || (context.payload.inputs && context.payload.inputs.brew_id) || ''
    };

    core.exportVariable('REQ_WIN_ID', parsed.win_id);
    core.exportVariable('REQ_BREW_ID', parsed.brew_id);
    core.exportVariable('TOOL_NAME', parsed.name);

    const registryPath = path.join(process.cwd(), 'os_tools.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    const toolSlug = parsed.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    
    const duplicate = registry.os_tools.find(tool => 
        tool.id === toolSlug || 
        tool.platforms.win32 === parsed.win_id || 
        tool.platforms.darwin === parsed.brew_id
    );

    if (duplicate) {
        await github.rest.issues.createComment({
            owner, repo, issue_number,
            body: `🛑 **Duplicate Entry**: A tool with this name or ID already exists (\`${duplicate.id}\`). Closing issue.`
        });
        await github.rest.issues.update({ owner, repo, issue_number, state: 'closed', labels: ['🚫 duplicate'] });
        process.exit(0);
    }

    const WIN_DATA = process.env.WIN_DATA ? JSON.parse(process.env.WIN_DATA) : null;
    const BREW_DATA = process.env.BREW_DATA ? JSON.parse(process.env.BREW_DATA) : null;

    if (WIN_DATA || BREW_DATA) {
        const similarity = (a, b) => {
            a = a.toLowerCase(); b = b.toLowerCase();
            const common = a.split('').filter(c => b.includes(c)).length;
            return common / Math.max(a.length, b.length);
        };

        let securityRisk = false;
        if (WIN_DATA?.found && similarity(parsed.name, parsed.win_id) < 0.4) securityRisk = true;
        
        if (securityRisk) {
            await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['🚨 security-review'] });
            await github.rest.issues.createComment({
                owner, repo, issue_number,
                body: `🚨 **Publisher Guard Triggered**: The tool name "${parsed.name}" does not match the ID "${parsed.win_id}" closely enough. A maintainer must verify this.`
            });
        } 
        else if (WIN_DATA?.found && BREW_DATA?.found) {
            const newEntry = {
                id: toolSlug,
                name: parsed.name,
                description: extractField("📝 Short Description") || "A cross-platform developer tool.",
                platforms: {
                    win32: parsed.win_id,
                    darwin: parsed.brew_id
                }
            };

            registry.os_tools.push(newEntry); 
            registry.metadata.updated = new Date().toISOString().replace('T', ' ').split('.')[0];
            fs.writeFileSync(registryPath, JSON.stringify(registry, null, 4)); 
            fs.writeFileSync('apply_signal.json', JSON.stringify(parsed));

            await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['✅ auto-verified'] });
            await github.rest.issues.createComment({
                owner, repo, issue_number,
                body: `✅ **Verification Success!** "${parsed.name}" has been verified on both WinGet and Homebrew. A Pull Request will be created automatically.`
            });
        } else {
            await github.rest.issues.createComment({
                owner, repo, issue_number,
                body: `❌ **Verification Failed**: This tool must be available on **both** WinGet and Homebrew.
                - WinGet Found: ${WIN_DATA?.found ? '✅' : '❌'}
                - Homebrew Found: ${BREW_DATA?.found ? '✅' : '❌'}`
            });
        }
    }
};