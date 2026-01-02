const fs = require('fs');
const path = require('path');
const child = require('child_process');
const os = require('os');

function run(cmd, opts = {}) {
    console.log('>', cmd);
    return child.execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts });
}

(async function main() {
    const repoRoot = process.cwd();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'udr-test-'));
    console.log('🏗️ Created temp sandbox:', tmp);

    const filesToCopy = [
        'scripts/issue_aggregator.js', 
        'scripts/verify_brew.sh', 
        'scripts/add_tool_entry.py', 
        'os_tools.json'
    ];

    filesToCopy.forEach(f => {
        const src = path.join(repoRoot, f);
        const dst = path.join(tmp, path.basename(f));
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dst);
        } else {
            console.error(`⚠️ Warning: ${f} not found in root.`);
        }
    });

    const issueBody = `
### 📛 Tool Name
Example Tool

### 🪟 WinGet ID (Windows)
Example.Tool.Id

### 🍎 Homebrew ID (macOS/Darwin)
example-tool

---
### 🤖 Internal Registry Data (Do Not Edit)
\`\`\`yaml
type: new-tool
win_id: Example.Tool.Id
brew_id: example-tool
name: Example Tool
\`\`\`
`;

    console.log('\n-- 🧠 Running Aggregator Parser (Simulated) --');
    const aggregator = require(path.join(tmp, 'issue_aggregator.js'));

    const mockContext = {
        payload: { issue: { body: issueBody, number: 123 } },
        repo: { owner: 'test-owner', repo: 'test-repo' },
        issue: { number: 123 }
    };

    const mockCore = {
        exportVariable: (name, val) => { 
            console.log(`   [EXPORT] ${name}=${val}`);
            process.env[name] = val; 
        },
        setFailed: (msg) => console.error(`   [FAILED] ${msg}`),
        setOutput: (name, val) => console.log(`   [OUTPUT] ${name}=${val}`)
    };

    const mockGithub = {
        rest: {
            issues: {
                createComment: async () => console.log('   [GITHUB] Comment created'),
                addLabels: async () => console.log('   [GITHUB] Labels added'),
                update: async () => console.log('   [GITHUB] Issue updated/closed')
            }
        }
    };

    try {
        await aggregator({ github: mockGithub, context: mockContext, core: mockCore });
    } catch (e) {
        console.log('Aggregator execution error:', e.message);
    }

    console.log('\n-- 🍎 Running verify_brew.sh (Mocking Homebrew) --');
    try {
        const verify = run(`bash ${path.join(tmp, 'verify_brew.sh')} "${process.env.REQ_BREW_ID}"`, { cwd: tmp });
        console.log(verify);
    } catch (e) {
        console.log('Verification log:', e.stdout || e.message);
    }

    console.log('\n-- 🐍 Running add_tool_entry.py (Local Registry Update) --');
    const entry = { 
        win_id: process.env.REQ_WIN_ID, 
        brew_id: process.env.REQ_BREW_ID, 
        name: process.env.TOOL_NAME 
    };
    
    const entryPath = path.join(tmp, 'entry.json');
    fs.writeFileSync(entryPath, JSON.stringify(entry));

    try {
        const res = run(`python3 ${path.join(tmp, 'add_tool_entry.py')} ${entryPath}`, { cwd: tmp });
        console.log(res);
        
        const updatedJson = JSON.parse(fs.readFileSync(path.join(tmp, 'os_tools.json'), 'utf8'));
        const lastEntry = updatedJson.os_tools[updatedJson.os_tools.length - 1];
        console.log('✅ Update Verified in JSON:', JSON.stringify(lastEntry, null, 2));
    } catch (e) {
        console.log('Update error:', e.stdout || e.stderr || e.message);
    }

    console.log('\n✨ Test finished. Cleaning up files but keeping directory for inspection.');
})();