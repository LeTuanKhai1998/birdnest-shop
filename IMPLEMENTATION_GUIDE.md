# Facebook Messenger Webhook Implementation Guide

## 🚨 Current Issue
Facebook Messenger webhook verification is failing with a **403 Forbidden** error because the `VERIFY_TOKEN` environment variable is not properly configured in production.

## ✅ What's Been Fixed

### 1. Enhanced Webhook Verification
- ✅ Added detailed logging to identify verification failures
- ✅ Improved error handling with specific failure reasons
- ✅ Added configuration validation
- ✅ Created debug endpoint for troubleshooting

### 2. Better Error Messages
- ✅ Shows which parameters are missing
- ✅ Logs configuration status
- ✅ Provides specific failure reasons

### 3. Debug Tools
- ✅ `/api/messenger/debug` endpoint
- ✅ `/api/messenger/health` endpoint
- ✅ Token generation script
- ✅ Comprehensive documentation

## 🚀 Implementation Steps

### Step 1: Generate Verify Token
```bash
cd birdnest-backend
node scripts/generate-verify-token.js
```

**Example Output:**
```
VERIFY_TOKEN=birdnest_webhook_me6h204o_255f8d24f451f4e85d98beb3f2fa5cb6dab0d4ede8441124e6f5320e50840cae
```

### Step 2: Set Environment Variables in Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your `birdnest-backend` project
3. Go to **Variables** tab
4. Add these environment variables:

```env
# Facebook Messenger Configuration
VERIFY_TOKEN=birdnest_webhook_me6h204o_255f8d24f451f4e85d98beb3f2fa5cb6dab0d4ede8441124e6f5320e50840cae
PAGE_ACCESS_TOKEN=your-facebook-page-access-token
FB_APP_ID=your-facebook-app-id
FB_APP_SECRET=your-facebook-app-secret
```

### Step 3: Create Facebook App (if not exists)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **Create App** → **Business**
3. App Name: `Birdnest Shop Bot`
4. Add **Messenger** product

### Step 4: Configure Messenger Settings

1. In your Facebook app dashboard:
   - Go to **Messenger** → **Settings**
   - Generate **Page Access Token** for your page
   - Copy the token to Railway environment variables

### Step 5: Set Up Webhook

1. In **Messenger** → **Webhooks**:
   - Click **Add Callback URL**
   - URL: `https://birdnest-backend-production-5b8c.up.railway.app/api/messenger/webhook`
   - Verify Token: Use the same value as `VERIFY_TOKEN`
   - Click **Verify and Save**

2. Subscribe to these events:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `messaging_optins`

### Step 6: Test Configuration

1. **Check Debug Endpoint:**
```bash
curl https://birdnest-backend-production-5b8c.up.railway.app/api/messenger/debug
```

**Expected Response:**
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "configuration": {
    "pageAccessToken": "CONFIGURED",
    "verifyToken": "CONFIGURED",
    "fbAppId": "CONFIGURED",
    "fbAppSecret": "CONFIGURED"
  },
  "webhookUrl": "https://birdnest-backend-production-5b8c.up.railway.app/api/messenger/webhook"
}
```

2. **Check Health Endpoint:**
```bash
curl https://birdnest-backend-production-5b8c.up.railway.app/api/messenger/health
```

### Step 7: Test Webhook Verification

1. **Trigger Facebook Verification:**
   - Go to Facebook Developer Console
   - Click **Verify** in webhook settings
   - Check Railway logs for verification attempt

2. **Expected Logs:**
```
Webhook verification request received:
- Mode: subscribe
- Token provided: YES
- Challenge: YES
- Expected token configured: YES
Webhook verification successful - returning challenge
```

### Step 8: Test Message Flow

1. Go to your Facebook page
2. Click **Message** to start conversation
3. Send a test message
4. Check Railway logs for message processing

## 🔧 Troubleshooting

### Issue: "VERIFY_TOKEN environment variable is not set"
**Solution:** Add `VERIFY_TOKEN` to Railway environment variables

### Issue: "Token mismatch"
**Solution:** Ensure token in Facebook matches `VERIFY_TOKEN` exactly

### Issue: "Invalid webhook mode"
**Solution:** Facebook should send `mode=subscribe` - this is usually correct

### Issue: "Challenge parameter is missing"
**Solution:** Facebook should always send a challenge - check if request is modified

### Issue: Still getting 403 errors
**Steps to debug:**
1. Check Railway logs for detailed error messages
2. Verify environment variables are set correctly
3. Test debug endpoint for configuration status
4. Ensure webhook URL is accessible

## 📊 Monitoring

### Health Check
```bash
curl https://birdnest-backend-production-5b8c.up.railway.app/api/messenger/health
```

### Statistics
```bash
curl https://birdnest-backend-production-5b8c.up.railway.app/api/messenger/stats
```

### Logs
Monitor Railway logs for:
- Webhook verification attempts
- Message processing
- Error messages
- Rate limiting

## 🔒 Security Notes

1. **Keep tokens secure** - Never commit to version control
2. **Use environment variables** - Store sensitive data in Railway
3. **Rotate tokens periodically** - For better security
4. **Monitor access** - Check logs for suspicious activity

## 📝 API Endpoints

- `GET /api/messenger/webhook` - Webhook verification
- `POST /api/messenger/webhook` - Message processing
- `GET /api/messenger/health` - Health check
- `GET /api/messenger/stats` - Statistics
- `GET /api/messenger/debug` - Debug information

## 🎯 Success Criteria

✅ Webhook verification returns 200 OK  
✅ Debug endpoint shows all configurations as "CONFIGURED"  
✅ Health endpoint returns "healthy" status  
✅ Messages are processed and bot responds  
✅ No 403 errors in logs  

## 📞 Support

If you encounter issues:
1. Check Railway logs for detailed error messages
2. Use debug endpoint to verify configuration
3. Ensure all environment variables are set
4. Verify Facebook app settings match your configuration

---

**Next Steps:** After completing this setup, the Facebook Messenger bot will be fully functional and customers can place orders, track deliveries, and get support through Messenger. 