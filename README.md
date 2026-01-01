# 🌍 Universal Developer Registry

The **Universal Developer Registry** is a cross-platform mapping of developer-focused desktop tools. It serves as the primary "Source of Truth" for the **Unified Compatibility Matrix**, bridging the gap between Windows (**WinGet**) and macOS (**Homebrew**).

---

## 🚀 Why this exists
Setting up a cross-platform environment is difficult because package IDs vary. 
- Windows: `Microsoft.VisualStudioCode`
- macOS: `visual-studio-code`
- **Our Registry:** Maps both to a single, unified ID: `vscode`.

This registry only tracks **OS-level/Desktop applications** (e.g., MongoDB Compass, VS Code, Docker Desktop) that require installation via a system package manager.

---

## 🛠️ High-Tech Verification (Self-Healing)
To ensure the integrity of the data, this repository uses an automated **Gatekeeper System**:

1.  **Automated Probes:** Every Pull Request triggers a virtual Windows and macOS environment to verify the provided IDs.
2.  **Self-Healing Search:** If a contributor provides an incorrect ID, our 🤖 **Registry-Bot** automatically searches the WinGet/Brew databases to find the correct one.
3.  **Double-Verification:** The bot will post the correct ID as a "Suggested Change" on the PR. The maintainer and contributor can then verify and apply the fix with one click.

---

## 🤝 How to Contribute
We welcome community contributions! Please use the official templates to ensure your data is processed by the verification engine.

### [➕ Add a New Tool](.github/ISSUE_TEMPLATE/add_tool.yml)
Use this to suggest a new developer tool. You will need to provide:
- The Unified ID (e.g., `mongodb-compass`)
- The WinGet ID
- The Homebrew Cask/Formula ID

### [🛠️ Report a Broken ID](.github/ISSUE_TEMPLATE/broken_tool.yml)
Is a tool no longer installing? Use this to report a deprecated or changed ID.

---

## 📄 License
This project is licensed under the **MIT License**. We encourage open use and integration into setup scripts, CLI tools, and automation workflows.

---
*Maintained by [Your Org Name/Handle]*
