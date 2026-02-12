# Fix for Expo CLI Issue

## Problem
After uninstalling `expo-cli` globally and installing `eas-cli`, you might encounter fatal errors.

## Solution

### Step 1: Clear All Caches
```bash
cd mobile
npm cache clean --force
npx expo start --clear
```

### Step 2: Verify Expo is Working
The project uses the **local** `expo` package (version 54.0.32), not the global `expo-cli`. This is correct!

### Step 3: Use npx for Expo Commands
Always use `npx expo` instead of just `expo`:

```bash
# ✅ Correct
npx expo start
npx expo start --clear
npx expo start --android
npx expo start --ios

# ❌ Don't use (if expo-cli is not installed globally)
expo start
```

### Step 4: Update package.json Scripts (Optional)
The scripts in `package.json` already use `expo` which will use the local package. If you want to be explicit, you can update them to use `npx expo`:

```json
{
  "scripts": {
    "start": "npx expo start",
    "android": "npx expo start --android",
    "ios": "npx expo start --ios",
    "web": "npx expo start --web"
  }
}
```

### Step 5: If Still Having Issues
1. Delete `node_modules` and reinstall:
   ```bash
   cd mobile
   rm -rf node_modules
   npm install
   ```

2. Clear Metro bundler cache:
   ```bash
   npx expo start --clear
   ```

3. Clear watchman (if installed):
   ```bash
   watchman watch-del-all
   ```

## Notes
- **expo-cli** is deprecated. The `expo` package includes the CLI.
- **EAS CLI** is for building and submitting apps, not for development.
- The local `expo` package (54.0.32) includes `@expo/cli@54.0.22` which provides all CLI functionality.
