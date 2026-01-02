const fs = require('fs');
const path = require('path');

module.exports = async ({github, context, core}) => {
  const { WIN_FOUND, BREW_FOUND, WIN_SUG, BREW_SUG } = process.env;
  
  const winFound = WIN_FOUND === 'true';
  const brewFound = BREW_FOUND === 'true';
  const bodyText = context.payload.issue.body || "";
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const issue_number = context.issue.number;

  const isBugReport = bodyText.includes('Broken ID Report') || bodyText.includes('🚨 bug');
  const isNewTool = bodyText.includes('New Tool Proposal') || bodyText.includes('✨ new-tool');

  if (isNewTool) {
    const registryPath = path.join(process.cwd(), 'os_tools.json');
    const registryData = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    const registryLines = fs.readFileSync(registryPath, 'utf8').split('\n');

    const winIdMatch = bodyText.match(/🪟 WinGet ID \(Windows\)\s*\n\s*\n([^\s\n]+)/);
    const brewIdMatch = bodyText.match(/🍎 Homebrew ID \(macOS\/Darwin\)\s*\n\s*\n([^\s\n]+)/);
    
    const reqWinId = winIdMatch ? winIdMatch[1].trim() : null;
    const reqBrewId = brewIdMatch ? brewIdMatch[1].trim() : null;

    let duplicateFound = null;

    for (const tool of registryData.os_tools) {
      if ((reqWinId && tool.platforms.win32 === reqWinId) || 
          (reqBrewId && tool.platforms.darwin === reqBrewId)) {
        duplicateFound = tool;
        break;
      }
    }

    if (duplicateFound) {
      const lineIndex = registryLines.findIndex(line => line.includes(`"id": "${duplicateFound.id}"`)) + 1;
      const toolDetails = JSON.stringify(duplicateFound, null, 4);

      let dupBody = `### 🛑 Duplicate Detected\n\nThis tool already exists in the registry! To maintain high signal, I am closing this request.\n\n`;
      dupBody += `**Existing Entry found at:** \`os_tools.json\` (Line ${lineIndex})\n`;
      dupBody += `\`\`\`json\n${toolDetails}\n\`\`\`\n\n`;
      dupBody += `--- \n`;
      dupBody += `💡 **Is this ID broken or outdated?**\n`;
      dupBody += `If the existing ID above is no longer working, please use our [Broken Tool Template](https://github.com/${owner}/${repo}/issues/new?template=broken_tool.yml) to report it.\n\n`;
      dupBody += `*Action: Automated closure to prevent redundancy.*`;

      await github.rest.issues.createComment({ owner, repo, issue_number, body: dupBody });
      await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['🚫 duplicate'] });
      await github.rest.issues.update({ owner, repo, issue_number, state: 'closed' });
      
      core.setFailed("Duplicate entry found in registry.");
      return;
    }
  }

  const currentLabels = context.payload.issue.labels.map(l => l.name);
  let labelsToAdd = [];

  if (isBugReport && !currentLabels.includes('🚨 bug')) labelsToAdd.push('🚨 bug', '⚡ priority');
  if (isNewTool && !currentLabels.includes('✨ new-tool')) labelsToAdd.push('✨ new-tool');

  if (labelsToAdd.length > 0) {
    await github.rest.issues.addLabels({ owner, repo, issue_number, labels: labelsToAdd });
  }

  if (isBugReport) {
    if (winFound || brewFound) {
      let body = `### ❓ Verification: ID is Alive\n\nI checked the reported ID and it appears to be working correctly on my runners. \n\n**Test Results:**\n- WinGet: ${winFound ? '✅ Working' : '❌ Not Found'}\n- Homebrew: ${brewFound ? '✅ Working' : '❌ Not Found'}\n\n*Please verify your local environment or internet connection.*`;
      await github.rest.issues.createComment({ owner, repo, issue_number, body });
      await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['❓ cannot-reproduce'] });
    } else {
      let body = `### 🔥 Bug Confirmed\n\nI couldn't find this ID in the registries either. The maintainer will review this.`;
      await github.rest.issues.createComment({ owner, repo, issue_number, body });
      await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['🔥 confirmed-broken'] });
    }
    core.setFailed("Bug verification complete. Manual review required.");
    return;
  }

  if (!winFound && !brewFound) {
    let body = `### ❌ Verification Failed\n\nI couldn't find an exact match for the IDs provided. Check the registry or try these suggestions:\n\n`;
    if (WIN_SUG && WIN_SUG.trim() !== 'none') body += `#### 🪟 WinGet Suggestions\n${WIN_SUG}\n\n`;
    if (BREW_SUG && BREW_SUG.trim() !== 'none') body += `#### 🍎 Homebrew Suggestions\n${BREW_SUG}\n\n`;
    
    body += `---\n*Please **edit** this issue with the correct IDs to re-trigger the bot.*`;
    await github.rest.issues.createComment({ owner, repo, issue_number, body });
    await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['🧪 needs-verification'] });
    await github.rest.issues.update({ owner, repo, issue_number, state: 'closed' });
    core.setFailed("Verification failed.");
  } else {
    await github.rest.issues.update({ owner, repo, issue_number, state: 'open' });
    await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ['✅ auto-verified'] });
    console.log("✅ Verification passed.");
  }
}