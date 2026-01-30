# Facebook Login Setup Guide

## Overview
Facebook login has been successfully implemented. Users logging in via Facebook will automatically be assigned the **"buyer"** role by default.

## Environment Variables Required

### Server (.env file in `server/` directory)
Add the following variables:
```
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Client (.env file in `client/` directory)
Add the following variable:
```
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

## Facebook App Configuration

### Callback URLs (Valid OAuth Redirect URIs)

You need to add the following URLs in your Facebook App settings under **Settings > Basic > Add Platform > Website**:

#### Development:
```
http://localhost:5173
http://localhost:3000
http://localhost:5174
```

#### Production:
```
https://hi-day.onrender.com
https://your-production-domain.com
```

### Site URL

Set the **Site URL** in Facebook App settings to your main domain:

#### Development:
```
http://localhost:5173
```

#### Production:
```
https://hi-day.onrender.com
```

## Facebook App Settings Configuration Steps

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app (or create a new one)
3. Go to **Settings > Basic**
4. Add your **App Domains**:
   - `localhost` (for development)
   - `hi-day.onrender.com` (for production)
   - Your production domain (if different)

5. Go to **Settings > Basic > Add Platform > Website**
   - Enter **Site URL**: `http://localhost:5173` (development) or your production URL
   - Click **Save Changes**

6. Go to **Products > Facebook Login > Settings**
   - Add **Valid OAuth Redirect URIs**:
     - `http://localhost:5173`
     - `http://localhost:3000`
     - `http://localhost:5174`
     - `https://hi-day.onrender.com`
     - Your production domain (if different)
   - Click **Save Changes**

7. Go to **Products > Facebook Login > Settings > Client OAuth Settings**
   - Enable **Client OAuth Login**: Yes
   - Enable **Web OAuth Login**: Yes
   - **Valid OAuth Redirect URIs**: (same as above)
   - **Deauthorize Callback URL**: `https://your-domain.com/auth/facebook/deauthorize` (optional)
   - **Delete Data Request URL**: `https://your-domain.com/auth/facebook/delete` (optional)

## API Endpoints

### Facebook Login Endpoint
- **URL**: `POST /api/auth/facebook`
- **Body**: 
  ```json
  {
    "accessToken": "facebook_access_token"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Facebook login successful",
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "buyer",
      "avatar": "profile_picture_url"
    }
  }
  ```

## How It Works

1. User clicks "Continue with Facebook" button on the login page
2. Facebook SDK opens a popup for authentication
3. User authorizes the app
4. Facebook returns an access token
5. Frontend sends the access token to `/api/auth/facebook`
6. Backend verifies the token with Facebook Graph API
7. Backend creates or updates user with role "buyer"
8. Backend returns JWT token
9. User is logged in and redirected to `/products`

## User Role Assignment

- All users logging in via Facebook are automatically assigned the **"buyer"** role
- If a user with the same email already exists, the Facebook account will be linked to the existing account
- The existing user's role will be preserved (not changed to "buyer")

## Testing

1. Make sure environment variables are set correctly
2. Start the development server:
   ```bash
   cd client
   npm run dev
   ```
3. Start the backend server:
   ```bash
   cd server
   npm start
   ```
4. Navigate to the login page
5. Click "Continue with Facebook"
6. Complete Facebook authentication
7. Verify you're logged in with "buyer" role

## Troubleshooting

### "Facebook SDK not loaded" error
- Check that `VITE_FACEBOOK_APP_ID` is set in client `.env` file
- Check browser console for Facebook SDK loading errors
- Verify Facebook App ID is correct

### "Invalid Facebook access token" error
- Verify `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` are set correctly in server `.env`
- Check that the redirect URIs are configured in Facebook App settings
- Ensure the app is not in development mode restrictions (if testing with non-admin users)

### CORS errors
- Verify your domain is added to Facebook App Domains
- Check that redirect URIs match exactly (including http/https and trailing slashes)

## Security Notes

- Never commit `.env` files to version control
- Keep `FACEBOOK_APP_SECRET` secure and never expose it to the client
- Regularly rotate your Facebook App Secret
- Use HTTPS in production
- Enable App Review for production apps if using additional permissions


