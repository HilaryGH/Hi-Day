# Google Maps API Setup for Delivery Fee Calculation

This application uses Google Maps API to calculate accurate delivery distances and fees, especially for Addis Ababa.

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (for address autocomplete)
   - **Geocoding API** (for address to coordinates conversion)
   - **Distance Matrix API** (for distance calculation)
   - **Places API** (for address autocomplete)

4. Create credentials (API Key):
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### 2. Configure API Key Restrictions (Recommended)

For security, restrict your API key:

1. Click on your API key to edit it
2. Under "API restrictions", select "Restrict key"
3. Choose:
   - Maps JavaScript API
   - Geocoding API
   - Distance Matrix API
   - Places API
4. Under "Application restrictions", you can restrict by:
   - HTTP referrers (for web)
   - IP addresses (for server)

### 3. Add API Key to Environment Variables

#### Server (.env file)
```env
GOOGLE_MAPS_API_KEY=your-api-key-here
```

#### Client (.env or .env.local file)
```env
VITE_GOOGLE_MAPS_API_KEY=your-api-key-here
```

### 4. Features Enabled

With Google Maps API configured, the application will:

1. **Address Autocomplete**: Users can type their address and get suggestions
2. **Current Location**: Users can use their GPS location
3. **Accurate Distance Calculation**: Uses Google Distance Matrix API for precise distance
4. **Delivery Fee Calculation**: Automatically calculates fees based on actual distance:
   - 0-5 km → 200 ETB
   - 5-10 km → 300 ETB
   - 10+ km → 400 ETB

### 5. Fallback Behavior

If Google Maps API is not configured or fails:
- The system falls back to simple city/location matching
- Delivery fees are estimated based on city matching
- Users can still manually enter addresses

### 6. Cost Considerations

Google Maps API has a free tier:
- **Free tier**: $200 credit per month
- **Maps JavaScript API**: Free for up to 28,000 loads/month
- **Geocoding API**: Free for up to 40,000 requests/month
- **Distance Matrix API**: Free for up to 40,000 elements/month

For most small to medium applications, the free tier should be sufficient.

### 7. Testing

After setup, test the delivery fee calculation:
1. Go to checkout page
2. Enter an address in Addis Ababa
3. The delivery fee should automatically calculate based on distance
4. Check browser console for any API errors
