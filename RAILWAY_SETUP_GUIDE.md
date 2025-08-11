# 🚨 Railway Environment Variables Setup

## Current Issue
The logs show: `VERIFY_TOKEN environment variable is not set`

Facebook is trying to verify the webhook with token: `Xy9%404FbWebhook2025%21`

## 🔧 Quick Fix Steps

### Step 1: Go to Railway Dashboard
1. Visit [Railway Dashboard](https://railway.app/dashboard)
2. Select your `birdnest-backend` project
3. Click on the **Variables** tab

### Step 2: Add Environment Variables
Add these variables to your Railway project:

```env
# Facebook Messenger Configuration
VERIFY_TOKEN=Xy9%404FbWebhook2025%21
PAGE_ACCESS_TOKEN=your-facebook-page-access-token
FB_APP_ID=your-facebook-app-id
FB_APP_SECRET=your-facebook-app-secret
```

### Step 3: Important Notes
- **Use the exact token from Facebook**: `Xy9%404FbWebhook2025%21`
- This token is already configured in your Facebook app
- Don't use the generated token unless you update Facebook settings too

### Step 4: Test After Adding Variables
```bash
# Test debug endpoint
curl https://birdnest-backend-production-5b8c.up.railway.app/api/messenger/debug

# Expected response should show:
# "verifyToken": "CONFIGURED"
```

## 🎯 Expected Result
After adding the environment variables:
- ✅ Webhook verification will return 200 OK
- ✅ Debug endpoint will show "CONFIGURED" for verifyToken
- ✅ Facebook will successfully verify the webhook

## 🔍 Alternative: Use Generated Token
If you prefer to use a fresh token:

1. **Update Railway:**
```env
VERIFY_TOKEN=birdnest_webhook_me6hds0o_7fe41f30250783ca0017ca2c8c452ffe178691f94568e0e6fa88e0f21cf026bf
```

2. **Update Facebook App:**
   - Go to Facebook Developer Console
   - Update webhook verify token to match
   - Re-verify the webhook

## 📞 Quick Test
After adding variables, test the webhook:
```bash
curl "https://birdnest-backend-production-5b8c.up.railway.app/api/messenger/webhook?hub.mode=subscribe&hub.verify_token=Xy9%404FbWebhook2025%21&hub.challenge=test"
```

Should return the challenge instead of "Forbidden". 