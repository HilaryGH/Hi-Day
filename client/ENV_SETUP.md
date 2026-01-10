# Environment Setup

## API Configuration

The application uses environment variables to configure the API URL. 

### For Production (Render Backend)

The default API URL is set to: `https://hi-day.onrender.com/api`

If you need to override this, create a `.env` file in the `client` directory with:

```env
VITE_API_URL=https://hi-day.onrender.com/api
```

### For Local Development

To use a local backend, create a `.env.local` file in the `client` directory with:

```env
VITE_API_URL=http://localhost:5000/api
```

**Note:** The `.env.local` file takes precedence over the default value and `.env` file.

### Environment Variables

- `VITE_API_URL` - The base URL for the backend API (default: `https://hi-day.onrender.com/api`)

After changing environment variables, restart the Vite development server for changes to take effect.

