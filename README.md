# 🌍 Universal Developer Registry

[![Registry Maintenance](https://github.com/PolyMeshStudios/Universal-Dev-Registry/actions/workflows/maintain_registry.yml/badge.svg)](https://github.com/PolyMeshStudios/Universal-Dev-Registry/actions/workflows/maintain_registry.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

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
Licensed under the **Apache License, Version 2.0** (the "License").
You may obtain a copy of the License at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

---
*Maintained by PolyMesh Studios*