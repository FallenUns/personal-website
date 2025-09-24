# Feedback Server Setup

This document explains how to set up the server-side feedback storage system for your portfolio.

## Server Setup

### 1. Install Dependencies

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

### 2. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will run on port 3001 (or the PORT environment variable).

### 3. Data Storage

The server will automatically create:
- `server/data/feedback.json` - JSON storage for feedback data
- `server/data/csv/` - Directory for CSV backups

## Frontend Configuration

The frontend automatically detects the environment:
- **Development**: Uses `http://localhost:3001/api`
- **Production**: Uses `/api` (same domain)

## Deployment

### Option 1: Same Server (Recommended)
Deploy both frontend and backend on the same server, with a reverse proxy (nginx/Apache) to handle routing:

```nginx
# Example nginx config
location /api {
    proxy_pass http://localhost:3001/api;
}

location / {
    # Serve your built React app
    try_files $uri $uri/ /index.html;
}
```

### Option 2: Separate Servers
Update the API_BASE_URL in `feedbackService.ts` to point to your backend server.

## Features

### Server-Side Storage
- ✅ Persistent JSON file storage
- ✅ Automatic CSV backups
- ✅ Data validation and error handling
- ✅ Keeps last 1000 feedback entries

### Fallback System
- ✅ Automatic fallback to localStorage if server unavailable
- ✅ Client shows appropriate messages based on storage method

### Global Access
- ✅ Press **Ctrl+Shift+F** (Windows/Linux) or **Cmd+Shift+F** (Mac) from anywhere on your site
- ✅ Opens feedback dashboard instantly
- ✅ Press **Escape** to close

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit new feedback |
| GET | `/api/feedback` | Get all feedback |
| GET | `/api/feedback/stats` | Get feedback statistics |
| GET | `/api/feedback/export-csv` | Download CSV export |
| DELETE | `/api/feedback` | Clear all feedback (requires confirmation) |
| GET | `/api/health` | Health check |

## Security Notes

- The feedback endpoints are currently open (no authentication)
- Consider adding authentication for the dashboard/admin endpoints
- The DELETE endpoint requires confirmation payload: `{ confirm: "DELETE_ALL_FEEDBACK" }`

## Troubleshooting

### Server not starting
- Check if port 3001 is available
- Ensure Node.js is installed
- Check server logs for errors

### Frontend not connecting
- Verify server is running on correct port
- Check browser console for CORS errors
- Ensure API_BASE_URL is correct in feedbackService.ts

### Data not persisting
- Check write permissions on `server/data/` directory
- Verify JSON file is being created and updated
- Check server logs for storage errors