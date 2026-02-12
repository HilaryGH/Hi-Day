# Connection Troubleshooting Guide

## Quick Fix

If you're getting "Network request failed" errors:

### Step 1: Check Server is Running
```bash
cd server
npm start
```
You should see: `Server running on port 5000`

### Step 2: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.x.x.x)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```
Look for "inet" address (usually starts with 192.168.x.x or 10.x.x.x)

### Step 3: Configure API URL in app.json

Edit `mobile/app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_IP_ADDRESS:5000/api"
    }
  }
}
```

**Example:** If your IP is `192.168.1.100`, use:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.100:5000/api"
    }
  }
}
```

### Step 4: Restart Expo
```bash
cd mobile
npm start -- --clear
```

## Platform-Specific Notes

### Android Emulator
- Uses `10.0.2.2` by default (maps to host machine's localhost)
- Should work automatically if server is running

### iOS Simulator
- Uses `localhost` by default
- Should work automatically if server is running

### Physical Devices
- **MUST** use your computer's actual IP address
- Device and computer must be on the same WiFi network
- Configure in `app.json` as shown above

## Testing Connection

After configuring, check the console for:
- `[API Config] Using configured API URL: ...` - Shows which URL is being used
- `[API] GET http://...` - Shows each API request
- `[Connection Test] ✅ Successfully connected` - Connection successful
- `[Connection Test] ❌ Failed` - Connection failed (check error message)

## Common Issues

### "Network request failed"
- Server not running → Start server
- Wrong IP address → Update app.json
- Different networks → Connect device to same WiFi
- Firewall blocking → Allow port 5000 in firewall

### "Connection refused"
- Server not running on port 5000
- Wrong port number in app.json

### Works on emulator but not physical device
- Physical devices need actual IP address, not localhost
- Configure in app.json

## Alternative: Use Production Server

To test against the production server instead:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://hi-day.onrender.com/api"
    }
  }
}
```
