<h1 align="center">🚀 Caffora — Team Git Workflow </h1>

<p align="center">Welcome to the <b><u>Caffora</u> </b>development team! Please follow this standard Git workflow to keep our codebase clean, conflict-free, and organized.</p>

---

## 🛠 First Time Setup
Run this *only once* when you first set up the project on your local machine.

```bash
git clone https://github.com/satyam-umrao/caffora.git
cd caffora
git switch work
git pull origin work
```

---

## ☀️ Daily Workflow

### 1. Every Time You Start Working
Always ensure you have the latest code from the remote branch before writing any new features.

```bash
git switch work
git pull origin work
```

### 2. After You Finish Coding
Once your feature or fix is ready, stage, commit, and push your work.

```bash
git status
git add .
git commit -m "Describe your changes"
git push origin work
```

> **💡 Tip:** Use clear and descriptive commit messages so the team knows exactly what was changed (e.g., `added login screen` or `fixed header bug`).

---

## 🔄 Handling Merge Conflicts
If you encounter a conflict while pulling or pushing:

1. Check which files are conflicting:
   ```bash
   git status
   ```
2. Open **VS Code** and resolve the conflicts manually by accepting the incoming or current changes.
3. Stage and commit the resolved files:
   ```bash
   git add .
   git commit -m "Resolve merge conflict"
   git push origin work
   ```

---

## 🔍 Quick Command Reference

| Action | Command |
| :--- | :--- |
| **Check Your Current Branch** | `git branch` |
| **Get Latest Code** | `git pull origin work` |
| **Check Repository Status** | `git status` |

---

## ⚠️ Important Rules

> 🛑 **Please adhere to these rules strictly to avoid repository issues.**

- ❌ **DO NOT** push directly to `main`. All team development goes to the `work` branch.
- ❌ **DO NOT** use `git push --force`. This can overwrite other teammates' code.
- ❌ **DO NOT** commit or push your `.env` file (ensure it is listed in your `.gitignore`).

---
