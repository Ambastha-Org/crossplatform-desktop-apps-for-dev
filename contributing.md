# 🤝 Contributing to Ambastha Cross-Platform Registry

First off, **thank you for considering contributing**!  
This registry is the backbone of the **Ambastha-Org cross-platform ecosystem**.  
To maintain **high accuracy, trust, and logical consistency**, all contributions are processed through an **automated Gatekeeper system**.

---

## 🚀 How to Add a New Tool

### 1️⃣ Open an Issue
- Use the **“New Tool Request”** template available in our **Issue Tracker**.

### 2️⃣ Provide Accurate Platform IDs
You **must** include official identifiers for supported platforms:

- **WinGet ID**  
  Example: `Google.AndroidStudio`

- **Homebrew ID**  
  Example: `android-studio`

---

### 3️⃣ Automated Gatekeeper Review

Once your issue is submitted, our **Gatekeeper Bot** automatically performs the following checks:

#### ✅ Duplicate Detection
- Scans the entire registry.
- If the tool already exists, the bot reports the **exact line number**.

#### 🔗 API Validation
- Verifies WinGet and Homebrew IDs against **official live registries**.

#### 🛡️ Publisher Guard
- Compares submitted tool names with official publisher metadata.
- Prevents spoofed, misleading, or unofficial package entries.

#### 🤖 Automatic Pull Request
- If all checks pass, the bot automatically opens a **Pull Request**.
- A maintainer performs a final logic audit before merging.

---

## 🔍 Verification Standards

To preserve the registry as a **Single Source of Truth**, every submission must meet the following criteria:

- **Contextual Matching**  
  Tool name must have **≥ 60% similarity** with official publisher metadata.

- **Platform Integrity**  
  WinGet and Homebrew IDs must refer to the **same functional software**.

- **Slugification Rules**  
  Tool identifiers are auto-standardized:
  ```text
  visual_studio_code
  android_studio
  ```

---
## 🛠️ Development Workflow

If you are modifying **automation scripts** or the **registry structure**, please follow the workflow below to ensure consistency, accuracy, and security.

---

## 📁 Repository Structure

- **`os_tools.json`**  
  → The **primary source of truth** for all cross-platform tools.

- **`scripts/issue_aggregator.js`**  
  → Parses GitHub issues and applies automated validation logic.

- **`scripts/add_tool_entry.py`**  
  → Safely inserts verified tools into the registry and manages versioning.

- **`scripts/reformat_json.py`**  
  → Enforces consistent formatting, ordering, and schema compliance.

---

## 🧪 Local Testing Requirements

Before pushing any changes, ensure the following checks pass:

### ✔️ Format Validation
```bash
python3 scripts/reformat_json.py
```

## ✔️ Logic Validation

Before submitting any changes, ensure the following conditions are met:

- **No Duplicate IDs**  
  Verify that no duplicate **WinGet** or **Homebrew** IDs exist across registry entries.

- **Platform Consistency**  
  Confirm that all platform identifiers (WinGet, Homebrew, etc.) resolve to the **same real-world software**.

---

## ⚖️ Standards & Logic Philosophy

- **Truth Over Agreement**  
  Official publisher metadata always takes precedence over user-preferred or colloquial naming.

- **Security First**  
  Any similarity mismatch automatically triggers a mandatory 🚨 **security review**.

- **Clean Diffs**  
  The registry is auto-sorted alphabetically to keep Git history readable and auditable.

---

## 📜 Licensing & Intellectual Property

By contributing to this project, you agree that all contributions are licensed under:

**Creative Commons Attribution–NonCommercial 4.0 International (CC BY-NC 4.0)**
