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
    win_id: extractField("🪟 WinGet ID") || (context.payload.inputs && context.payload.inputs.winget_id) || '',
    brew_id: extractField("🍎 Homebrew ID") || (context.payload.inputs && context.payload.inputs.brew_id) || ''
  };

  core.exportVariable('REQ_WIN_ID', parsed.win_id);
  core.exportVariable('REQ_BREW_ID', parsed.brew_id);
  core.exportVariable('TOOL_NAME', parsed.name);

  const registryPath = path.join(process.cwd(), 'os_tools.json');
  const registryText = fs.readFileSync(registryPath, 'utf8');

  // 1. DUPLICATE DETECTION (WITH LINE NUMBERS)
  const checkIds = [parsed.win_id, parsed.brew_id].filter(Boolean);
  for (const id of checkIds) {
    if (registryText.includes(id)) {
      const lines = registryText.split('\n');
      const lineNum = lines.findIndex(l => l.includes(id)) + 1;
      await github.rest.issues.createComment({
        owner, repo, issue_number,
        body: `🛑 **Duplicate Entry**: \`${id}\` already exists at **line ${lineNum}** in \`os_tools.json\`. Closing issue.`
      });
      await github.rest.issues.update({ owner, repo, issue_number, state: 'closed', labels: ['🚫 duplicate'] });
      process.exit(0);
    }
  }

  // 2. PUBLISHER GUARD (Similarity Check)
  const WIN_DATA = process.env.WIN_DATA ? JSON.parse(process.env.WIN_DATA) : null;
  const BREW_DATA = process.env.BREW_DATA ? JSON.parse(process.env.BREW_DATA) : null;

  if (WIN_DATA || BREW_DATA) {
    const similarity = (a, b) => {
      a = a.toLowerCase(); b = b.toLowerCase();
      const common = a.split('').filter(c => b.includes(c)).length;
      return common / Math.max(a.length, b.length);
    };

    let securityRisk = false;
    if (WIN_DATA?.found && similarity(parsed.name, parsed.win_id) < 0.5) securityRisk = true;
    
    if (securityRisk) {
      await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['🚨 security-review'] });
      await github.rest.issues.createComment({
        owner, repo, issue_number,
        body: `🚨 **Publisher Guard Triggered**: The tool name "${parsed.name}" does not sufficiently match the ID "${parsed.win_id}". A maintainer must verify this.`
      });
    } else if (WIN_DATA?.found || BREW_DATA?.found) {
      // Signal workflow to create PR
      fs.writeFileSync('/tmp/ambastha_apply.json', JSON.stringify(parsed));
      await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['✅ auto-verified'] });
    }
  }
};