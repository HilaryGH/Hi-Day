# API Configuration for Mobile App

## Quick Setup

The mobile app needs to connect to your backend server. Here are the configuration options:

### Option 1: Automatic Detection (Recommended for Development)

The app will automatically detect the correct API URL based on your environment:

- **Android Emulator**: Uses `http://10.0.2.2:5000/api` (maps to host machine's localhost)
- **iOS Simulator**: Uses `http://localhost:5000/api`
- **Physical Devices**: Automatically detects your development machine's IP from Expo
- **Production**: Uses `https://hi-day.onrender.com/api`

### Option 2: Manual Configuration via app.json

Edit `mobile/app.json` and add your API URL:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_IP_ADDRESS:5000/api"
    }
  }
}
```

**To find your IP address:**
- **Windows**: Run `ipconfig` in Command Prompt, look for IPv4 Address
- **Mac/Linux**: Run `ifconfig` or `ip addr`, look for inet address
- **Example**: If your IP is `192.168.1.100`, use `http://192.168.1.100:5000/api`

### Option 3: Use Production Server

If you want to test against the production server, set:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://hi-day.onrender.com/api"
    }
  }
}
```

## Troubleshooting 500 Errors

If you're getting 500 errors, check:

1. **Server is running**: Make sure your server is running on port 5000
   ```bash
   cd server
   npm start
   ```

2. **Correct IP Address**: For physical devices, ensure you're using your computer's actual IP address, not `localhost`

3. **Network Connection**: Make sure your mobile device/emulator is on the same network as your development machine

4. **CORS Configuration**: The server should already be configured to allow mobile app requests, but verify in `server/src/configs/index.js`

5. **Check Console Logs**: The app now logs API requests. Check your Expo console for:
   - `[API] GET http://...` - Shows the request being made
   - `[API Error] 500 ...` - Shows the error details

## Testing the Connection

After configuring, restart your Expo development server:

```bash
cd mobile
npm start
```

The app will automatically use the configured API URL.
