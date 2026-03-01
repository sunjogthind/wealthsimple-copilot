# Deploying to Digital Ocean

## Recommended: App Platform (5-minute setup)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/wealthsimple-copilot.git
git push -u origin main
```

### Step 2: Create App on Digital Ocean
1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Select "GitHub" as source
4. Authorize and select your repo
5. Digital Ocean will auto-detect the Dockerfile

### Step 3: Configure
- **Environment variables:**
  - `ANTHROPIC_API_KEY` = your key (mark as encrypted)
- **Instance size:** Basic ($5/mo is fine for demo)
- **Region:** Toronto (tor1) — closest to Wealthsimple's user base

### Step 4: Deploy
Click deploy. Takes ~3-5 minutes. You'll get a URL like `https://ws-copilot-xxxxx.ondigitalocean.app`.

### Custom Domain (Optional)
1. In app settings → Domains → Add Domain
2. Add CNAME record pointing to the DO app URL
3. SSL is automatic

---

## Alternative: Droplet + Docker

If you need more control:

```bash
# Create a droplet (Ubuntu 24.04, $6/mo Basic)
# SSH in, then:

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone your repo
git clone https://github.com/YOUR_USERNAME/wealthsimple-copilot.git
cd wealthsimple-copilot

# Create .env file
echo "ANTHROPIC_API_KEY=sk-ant-your-key" > .env

# Build and run
docker-compose up -d

# App is now running on port 3000
# Set up nginx reverse proxy for SSL if needed
```

---

## Cost Estimate

| Component | Cost |
|-----------|------|
| DO App Platform (Basic) | $5/mo |
| Anthropic API (demo usage) | ~$1-5 total |
| Custom domain (optional) | ~$10/yr |
| **Total for demo** | **~$5-10** |
