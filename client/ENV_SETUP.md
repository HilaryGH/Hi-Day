# Environment Setup

## API Configuration

The application automatically detects the environment and uses the appropriate API URL:

### Automatic Detection

- **Development Mode**: Automatically uses `http://localhost:5000/api` when running `npm run dev`
- **Production Mode**: Automatically uses `https://hi-day.onrender.com/api` when building for production

### Manual Override

If you need to override the automatic detection, create a `.env` or `.env.local` file in the `client` directory:

**For Local Development:**
```env
VITE_API_URL=http://localhost:5000/api
```

**For Production/Testing with Render:**
```env
VITE_API_URL=https://hi-day.onrender.com/api
```

**Note:** 
- `.env.local` takes precedence over `.env`
- Environment variables take precedence over automatic detection
- After changing environment variables, restart the Vite development server

### Environment Variables

- `VITE_API_URL` - The base URL for the backend API
  - Default in development: `http://localhost:5000/api`
  - Default in production: `https://hi-day.onrender.com/api`

