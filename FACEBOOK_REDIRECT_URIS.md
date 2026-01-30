# Facebook Login - Redirect URIs & Domain Configuration

## 📋 Complete Configuration Checklist

Use this document to configure your Facebook App settings. Copy and paste these exact values into your Facebook Developer Console.

---

## 1. Redirect URI to Check

The redirect URI is the **current page URL** where the Facebook login button is clicked. Facebook will redirect back to this same URL after authentication.

### Development:
```
http://localhost:5173/login
http://localhost:3000/login
http://localhost:5174/login
```

### Production:
```
https://hi-day.onrender.com/login
```

**Note:** Since Facebook validates the base domain, you typically only need to add the base URLs (without `/login` path) in the settings below.

---

## 2. Valid OAuth Redirect URIs

**Location:** Facebook Developers → Your App → Products → Facebook Login → Settings → Valid OAuth Redirect URIs

### Add these EXACT URLs (one per line):

#### Development URLs:
```
http://localhost:5173
http://localhost:5173/
http://localhost:3000
http://localhost:3000/
http://localhost:5174
http://localhost:5174/
http://localhost:5000/api/auth/facebook/callback
```

#### Production URLs:
```
https://hi-day.onrender.com
https://hi-day.onrender.com/
https://hi-day.onrender.com/api/auth/facebook/callback
```

**Note:** The callback URL (`/api/auth/facebook/callback`) is available for server-side redirect flow. The current implementation uses JavaScript SDK popup flow, which doesn't require it, but it's included for compatibility.

**Copy-Paste Format:**
```
http://localhost:5173
http://localhost:5173/
http://localhost:3000
http://localhost:3000/
http://localhost:5174
http://localhost:5174/
http://localhost:5000/api/auth/facebook/callback
https://hi-day.onrender.com
https://hi-day.onrender.com/
https://hi-day.onrender.com/api/auth/facebook/callback
```

---

## 3. Allowed Domains for JavaScript SDK

**Location:** Facebook Developers → Your App → Settings → Basic → App Domains

### Add these domains (one per line, NO http/https, NO trailing slash):

#### Development:
```
localhost
```

#### Production:
```
hi-day.onrender.com
```

**Copy-Paste Format:**
```
localhost
hi-day.onrender.com
```

---

## 4. Site URL (Website Platform)

**Location:** Facebook Developers → Your App → Settings → Basic → Add Platform → Website

### Development:
```
http://localhost:5173
```

### Production:
```
https://hi-day.onrender.com
```

**Note:** You can only set ONE Site URL. Use your production URL if you have one, or development URL for testing.

---

## 5. Complete Step-by-Step Configuration

### Step 1: App Domains
1. Go to **Settings → Basic**
2. Scroll to **App Domains**
3. Add:
   - `localhost`
   - `hi-day.onrender.com`
4. Click **Save Changes**

### Step 2: Website Platform
1. In **Settings → Basic**, scroll to **Add Platform**
2. Click **Website**
3. Enter **Site URL**:
   - Development: `http://localhost:5173`
   - Production: `https://hi-day.onrender.com`
4. Click **Save Changes**

### Step 3: Valid OAuth Redirect URIs
1. Go to **Products → Facebook Login → Settings**
2. Scroll to **Valid OAuth Redirect URIs**
3. Add each URL (one per line):
   ```
   http://localhost:5173
   http://localhost:5173/
   http://localhost:3000
   http://localhost:3000/
   http://localhost:5174
   http://localhost:5174/
   http://localhost:5000/api/auth/facebook/callback
   https://hi-day.onrender.com
   https://hi-day.onrender.com/
   https://hi-day.onrender.com/api/auth/facebook/callback
   ```
4. Click **Save Changes**

**Note:** The callback URLs (`/api/auth/facebook/callback`) are optional. They're only needed if you want to use server-side redirect flow instead of the JavaScript SDK popup flow.

### Step 4: Client OAuth Settings
1. Still in **Products → Facebook Login → Settings**
2. Under **Client OAuth Settings**, ensure:
   - ✅ **Client OAuth Login**: Enabled
   - ✅ **Web OAuth Login**: Enabled
   - ✅ **Use Strict Mode for Redirect URIs**: Disabled (for development flexibility)
3. Click **Save Changes**

---

## 6. Quick Reference Table

| Setting | Location | Development Value | Production Value |
|---------|----------|-------------------|------------------|
| **App Domains** | Settings → Basic | `localhost` | `hi-day.onrender.com` |
| **Site URL** | Settings → Basic → Website | `http://localhost:5173` | `https://hi-day.onrender.com` |
| **Valid OAuth Redirect URIs** | Products → Facebook Login → Settings | `http://localhost:5173`<br>`http://localhost:3000`<br>`http://localhost:5174`<br>`http://localhost:5000/api/auth/facebook/callback` | `https://hi-day.onrender.com`<br>`https://hi-day.onrender.com/api/auth/facebook/callback` |
| **Redirect URI (actual)** | N/A (auto-detected) | `http://localhost:5173/login` | `https://hi-day.onrender.com/login` |
| **Callback Endpoint** | Server route | `http://localhost:5000/api/auth/facebook/callback` | `https://hi-day.onrender.com/api/auth/facebook/callback` |

---

## 7. Testing Your Configuration

After configuring, test with these steps:

1. **Check App Status:**
   - Go to **App Review → Permissions and Features**
   - Ensure your app is in **Development Mode** (for testing)
   - Add yourself as a **Test User** or use your Facebook account

2. **Test Login:**
   - Open your app at `http://localhost:5173/login`
   - Click "Continue with Facebook"
   - Complete authentication
   - Verify redirect back to your app

3. **Common Issues:**
   - ❌ "Invalid OAuth Redirect URI" → Check Valid OAuth Redirect URIs match exactly
   - ❌ "App domain mismatch" → Verify App Domains are set correctly
   - ❌ "SDK not initialized" → Check VITE_FACEBOOK_APP_ID in client .env

---

## 8. Environment Variables Required

Make sure these are set:

**Client (.env):**
```
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

**Server (.env):**
```
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

---

## 9. Important Notes

⚠️ **Development Mode:**
- Facebook apps in Development Mode can only be used by:
  - App administrators
  - App developers
  - App testers
  - Users with specific roles

⚠️ **Production:**
- For production, submit your app for App Review
- Ensure all redirect URIs are HTTPS
- Remove localhost URLs from production settings (or keep them for testing)

⚠️ **Exact Match Required:**
- URLs must match EXACTLY (including http/https, trailing slashes, ports)
- Facebook is case-sensitive for domains
- No wildcards allowed in redirect URIs

---

## 10. Summary - Copy These Values

### Valid OAuth Redirect URIs (copy all):
```
http://localhost:5173
http://localhost:5173/
http://localhost:3000
http://localhost:3000/
http://localhost:5174
http://localhost:5174/
http://localhost:5000/api/auth/facebook/callback
https://hi-day.onrender.com
https://hi-day.onrender.com/
https://hi-day.onrender.com/api/auth/facebook/callback
```

### Facebook Callback Endpoint:
- **Development:** `http://localhost:5000/api/auth/facebook/callback`
- **Production:** `https://hi-day.onrender.com/api/auth/facebook/callback`

**Important:** The callback endpoint is now available but **optional**. The current implementation uses JavaScript SDK popup flow, which doesn't require the callback. The callback endpoint is included for:
- Server-side redirect flow support (if you want to switch later)
- Facebook App settings compatibility
- Future flexibility

### App Domains (copy all):
```
localhost
hi-day.onrender.com
```

### Site URL (choose one):
- Development: `http://localhost:5173`
- Production: `https://hi-day.onrender.com`

---

**Last Updated:** Based on current codebase configuration
**Login Route:** `/login`
**Default Ports:** 5173 (Vite default), 3000, 5174

