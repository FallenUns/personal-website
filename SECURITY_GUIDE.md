# 🔐 Secure Environment Variables Guide

This guide explains how to securely manage environment variables for your personal website, especially API keys and secrets.

## 🏗️ Architecture Overview

Your website has two components:
- **Frontend (React/Vite)**: Runs in the browser, environment variables prefixed with `VITE_`
- **Backend (Node.js Server)**: Runs on the server, can access all environment variables

## 🔒 Security Principles

### ⚠️ NEVER expose sensitive data in frontend
- Any `VITE_` prefixed variable becomes publicly accessible in the browser
- Only use `VITE_` prefix for non-sensitive configuration (API URLs, public keys)
- API keys and secrets should NEVER have the `VITE_` prefix

### ✅ Safe for frontend (`VITE_` prefix)
```bash
VITE_LLM_API_URL=https://models.github.ai/inference/chat/completions
VITE_LLM_MODEL=openai/gpt-4o-mini
VITE_APP_VERSION=1.0.0
```

### ❌ Dangerous in frontend (would expose secrets)
```bash
# DON'T DO THIS - API keys should not be VITE_ prefixed
VITE_LLM_API_KEY=github_pat_xxxxx  # ❌ EXPOSED TO BROWSER
VITE_SECRET_KEY=my_secret_key      # ❌ EXPOSED TO BROWSER
```

### ✅ Safe for backend only (no VITE_ prefix)
```bash
LLM_API_KEY=github_pat_xxxxx       # ✅ Server-only
SECRET_KEY=my_secret_key           # ✅ Server-only
DATABASE_URL=postgresql://...      # ✅ Server-only
```

## 🛠️ Local Development Setup

1. **Create `.env.local`** (copy from `.env.example`):
```bash
cp .env.example .env.local
```

2. **Fill in your actual values**:
```bash
# .env.local - for development only
VITE_LLM_API_URL=https://models.github.ai/inference/chat/completions
VITE_LLM_API_KEY=github_pat_your_actual_token_here
VITE_LLM_MODEL=openai/gpt-4o-mini
PORT=3001
```

3. **Add to `.gitignore`** (already done):
```
.env.local
.env.production
.env
```

## 🚀 Production Deployment

### Option 1: Automated Setup (Recommended)

Run the secure setup script on your server:
```bash
# On your production server
./secure-env-setup.sh
```

This script will:
- Create `/var/www/.env.production` with secure permissions (600)
- Prompt for sensitive values with hidden input
- Set up systemd service with proper security restrictions
- Start the server with environment file

### Option 2: Manual Setup

1. **Create secure environment file**:
```bash
# On your production server
sudo touch /var/www/.env.production
sudo chmod 600 /var/www/.env.production  # Only root can read
sudo chown root:root /var/www/.env.production
```

2. **Add variables** (use `sudo nano /var/www/.env.production`):
```bash
NODE_ENV=production
PORT=3001

# LLM Configuration
VITE_LLM_API_URL=https://models.github.ai/inference/chat/completions
VITE_LLM_API_KEY=github_pat_your_production_token
VITE_LLM_MODEL=openai/gpt-4o-mini

# Server secrets (not accessible to browser)
SECRET_KEY=your_random_64_character_secret
ADMIN_PASSWORD_HASH=your_hashed_admin_password
```

3. **Configure systemd service**:
```bash
sudo systemctl edit portfolio-server --full
```

Add `EnvironmentFile=/var/www/.env.production` to the service file.

## 🔄 Migration Strategy

If you currently have API keys in frontend code:

### Step 1: Move API calls to backend
```typescript
// Instead of calling LLM API from frontend:
const response = await fetch(llmApiUrl, {
  headers: { 'Authorization': `Bearer ${apiKey}` }  // ❌ Exposes API key
});

// Create a backend endpoint:
// server/routes/llm.js
app.post('/api/llm/chat', async (req, res) => {
  const response = await fetch(process.env.LLM_API_URL, {
    headers: { 'Authorization': `Bearer ${process.env.LLM_API_KEY}` }  // ✅ Secure
  });
  res.json(response.data);
});

// Frontend calls your backend:
const response = await fetch('/api/llm/chat', {
  method: 'POST',
  body: JSON.stringify(messages)
});
```

### Step 2: Update environment variables
```bash
# Remove VITE_ prefix from sensitive variables
LLM_API_KEY=github_pat_xxxxx  # ✅ Server-only now
```

## 🏥 Health Checks & Monitoring

Add environment validation to your server:
```javascript
// server/index.js
function validateEnvironment() {
  const required = ['LLM_API_KEY', 'SECRET_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
}

validateEnvironment();
```

## 🔐 API Key Management

### GitHub Personal Access Tokens
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Create fine-grained token with "Models" permissions
3. Set expiration and rotate regularly
4. Use different tokens for development and production

### Key Rotation Strategy
```bash
# 1. Generate new API key
# 2. Update production environment
sudo nano /var/www/.env.production

# 3. Restart service
sudo systemctl restart portfolio-server

# 4. Test functionality
curl https://yoursite.com/api/health

# 5. Revoke old key only after confirming new one works
```

## 🚨 Security Incidents

If API key is compromised:
1. **Immediately revoke the exposed key**
2. **Generate new key**
3. **Update production environment**
4. **Restart services**
5. **Check logs for unauthorized usage**
6. **Consider adding rate limiting**

## 📋 Checklist

- [ ] `.env.local` in `.gitignore`
- [ ] No `VITE_` prefix on sensitive variables
- [ ] Production `.env.production` has 600 permissions
- [ ] API keys are not in source code
- [ ] Different keys for dev/prod environments
- [ ] Regular key rotation schedule
- [ ] Environment validation in startup
- [ ] Monitoring for unauthorized API usage

## 🛟 Troubleshooting

### Frontend can't access environment variables
- Ensure variables are prefixed with `VITE_`
- Restart development server after adding variables
- Check browser dev tools > Sources > Static assets to see which variables are bundled

### Server can't access environment variables
- Ensure `.env.production` is loaded by systemd service
- Check file permissions and ownership
- Verify `EnvironmentFile` path in service configuration
- Use `sudo systemctl show portfolio-server | grep Environment` to debug

### API keys not working
- Verify key has correct permissions
- Check for extra whitespace in environment file
- Ensure key isn't expired
- Test key manually with curl before debugging application