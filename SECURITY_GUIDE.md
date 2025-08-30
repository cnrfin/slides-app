# Security Guide: Handling Secrets for GitHub

## Current Status ✅

Your project is **properly configured** to handle secrets securely:

1. ✅ `.env.local` is in `.gitignore` (won't be pushed to GitHub)
2. ✅ `.env.example` has been fixed (no real secrets)
3. ✅ Your actual secrets are only in `.env.local`

## Before Pushing to GitHub

### 1. Verify Git Status
```bash
git status
```
Make sure `.env.local` does NOT appear in the files to be committed.

### 2. Check for Exposed Secrets
```bash
# Search for any hardcoded secrets in your codebase
grep -r "GOCSPX-" --exclude-dir=node_modules --exclude-dir=.git .
grep -r "sk-proj-" --exclude-dir=node_modules --exclude-dir=.git .
grep -r "eyJhbGciOiJIUzI1NiI" --exclude-dir=node_modules --exclude-dir=.git .
```

### 3. If You've Already Committed Secrets

If you've already committed secrets to git history, you need to:

#### Option A: If NOT pushed to GitHub yet
```bash
# Remove the file from git history
git rm --cached .env.local
git commit -m "Remove .env.local from tracking"

# If secrets were in other commits, rewrite history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all
```

#### Option B: If already pushed to GitHub
1. **Immediately revoke all exposed credentials:**
   - Google: Go to Google Cloud Console → Credentials → Regenerate secret
   - OpenAI: Go to platform.openai.com → Revoke and create new key
   - Supabase: Rotate keys in Supabase dashboard

2. **Clean the repository:**
```bash
# Use BFG Repo-Cleaner (recommended)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

java -jar bfg.jar --delete-files .env.local
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

## Setting Up GitHub Secrets (For CI/CD)

If you need these secrets in GitHub Actions:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret:
   - Name: `VITE_SUPABASE_URL`
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Name: `VITE_OPENAI_API_KEY`
   - Name: `VITE_GOOGLE_CLIENT_ID`
   - Name: `VITE_GOOGLE_CLIENT_SECRET`

### Using Secrets in GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
          VITE_GOOGLE_CLIENT_SECRET: ${{ secrets.VITE_GOOGLE_CLIENT_SECRET }}
        run: pnpm build
```

## Best Practices

### 1. Never Commit Secrets
- Always use `.env.local` for local development
- Keep `.env.example` with placeholder values only
- Double-check before committing

### 2. Use Different Credentials Per Environment
```env
# .env.local (development)
VITE_GOOGLE_CLIENT_ID=dev-client-id

# .env.production (production - via CI/CD)
VITE_GOOGLE_CLIENT_ID=prod-client-id
```

### 3. Rotate Credentials Regularly
- Set calendar reminders to rotate API keys
- Use short-lived tokens when possible
- Monitor API usage for unusual activity

### 4. Use Secret Scanning Tools
```bash
# Install detect-secrets
pip install detect-secrets

# Scan your repository
detect-secrets scan --baseline .secrets.baseline

# Add pre-commit hook
detect-secrets install
```

### 5. Add Pre-commit Hooks

Create `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

Install:
```bash
pip install pre-commit
pre-commit install
```

## Quick Checklist Before Pushing

- [ ] Run `git status` - no `.env.local` should appear
- [ ] Check `.gitignore` includes all env files
- [ ] `.env.example` contains only placeholders
- [ ] No secrets in source code
- [ ] No secrets in commit messages
- [ ] Credentials are in `.env.local` only
- [ ] Team members know to copy `.env.example` to `.env.local`

## If Secrets Were Exposed

1. **Immediately rotate all credentials**
2. **Check for unauthorized access in:**
   - Google Cloud Console audit logs
   - OpenAI usage dashboard
   - Supabase logs
3. **Enable 2FA on all services**
4. **Notify your team**

## Safe to Push Now! 🚀

Your repository is now configured correctly. You can safely:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Your `.env.local` with secrets will NOT be pushed to GitHub.
