# 🌍 Universal Developer Registry

[![Registry Maintenance](https://github.com/Ambastha-Org/crossplatform-desktop-apps-for-dev/actions/workflows/maintain_registry.yml/badge.svg)](https://github.com/Ambastha-Org/crossplatform-desktop-apps-for-dev/actions/workflows/maintain_registry.yml)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC_BY--NC_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

The **Universal Developer Registry** is a cross-platform mapping of developer-focused desktop tools. It serves as the primary "Source of Truth" for bridging the gap between Windows (**WinGet**) and macOS (**Homebrew**).

---

## 📊 Registry Status
**Current Version:** `1.0.0`  
**Total Tools Verified:** `1`  
**Last Updated:** `2026-01-02 14:30:00`
---

## 🚀 Why this exists
Setting up a cross-platform environment is difficult because package IDs vary across operating systems. 
- **Windows:** `Microsoft.VisualStudioCode`
- **macOS:** `visual-studio-code`
- **Our Registry:** Maps both to a single, unified ID: `vscode`.

This registry only tracks **OS-level/Desktop applications** (e.g., MongoDB Compass, Docker Desktop) that exist on both platforms.

---

## 🛠️ High-Tech Automation (Gatekeeper System)
This repository uses a self-healing, automated infrastructure to ensure 100% data integrity:

1. **Intelligent Verification:** Every PR/Issue triggers a virtual Windows and macOS environment to verify that IDs actually exist in `winget` and `brew`.
2. **Duplicate Detection:** Our bot automatically scans `os_tools.json` using platform-level ID matching to prevent redundant entries.
3. **Semantic Versioning:** The registry uses a $MAJOR.MINOR.PATCH$ system:
   - **Minor** increments for new tool additions.
   - **Patch** increments for bug fixes or ID updates.
4. **Auto-Maintenance:** On every merge, the registry is automatically alphabetized and reformatted for consistency.

---

## 🤝 How to Contribute
Please use our official issue templates to ensure your contribution is processed by the verification engine.

### [➕ Add a New Tool](.github/ISSUE_TEMPLATE/add_tool.yml)
Suggest a new developer tool. **Note:** If the tool already exists, the bot will automatically notify you and close the issue to prevent duplicates.

### [🚨 Report a Broken ID](.github/ISSUE_TEMPLATE/broken_tool.yml)
Is a tool no longer installing? Use this to report a deprecated or changed ID.

---

## 📄 License

This data registry is owned by **Ambastha** and is licensed under the  
**Creative Commons Attribution–NonCommercial 4.0 International (CC BY-NC 4.0)**.

---

## 📜 Terms of Use

- **Attribution**  
  You must give appropriate credit to **Ambastha** and provide a link to this repository.

- **Non-Commercial**  
  You may not use this material for commercial purposes, including monetary compensation or commercial advantage.

- **No Additional Restrictions**  
  You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

---

🔗 **Full License Text:**  
http://creativecommons.org/licenses/by-nc/4.0/

---

Maintained by **Ambastha-Org**
