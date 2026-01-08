# ChatKit for Squarespace - Vercel Deployment

A production-ready OpenAI ChatKit integration that can be deployed to Vercel and embedded in any Squarespace website with a simple script tag.

## Features

- ✅ **Serverless Backend** - Python-based API running on Vercel serverless functions
- ✅ **React Frontend** - Modern Vite + React UI with ChatKit integration
- ✅ **Easy Embedding** - Drop-in JavaScript widget for Squarespace
- ✅ **Managed ChatKit** - Uses OpenAI's hosted workflows (no infrastructure needed)
- ✅ **Customizable** - Easy styling and positioning options
- ✅ **Mobile Responsive** - Works seamlessly on all devices

## Prerequisites

Before you begin, you'll need:

1. **OpenAI Account** with API access
2. **ChatKit Workflow ID** - Create a workflow in [OpenAI Agent Builder](https://platform.openai.com/agent-builder)
3. **Vercel Account** - Free tier is sufficient ([sign up here](https://vercel.com))
4. **Squarespace Website** - Business plan or higher (required for custom code injection)

## Quick Start

### 1. Get Your OpenAI Credentials

1. Go to [OpenAI Agent Builder](https://platform.openai.com/agent-builder)
2. Create or select a workflow
3. Copy your Workflow ID (starts with `wf_...`)
4. Get your API key from [API Keys page](https://platform.openai.com/api-keys)

### 2. Deploy to Vercel

#### Option A: Deploy with Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and set environment variables when asked
```

#### Option B: Deploy from GitHub

1. Push this code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables (see below)
6. Click "Deploy"

### 3. Configure Environment Variables

In your Vercel project settings, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-proj-...` | Your OpenAI API key |
| `VITE_CHATKIT_WORKFLOW_ID` | `wf_...` | Your ChatKit workflow ID |

**Important:** After adding environment variables, redeploy your application for changes to take effect.

### 4. Add to Squarespace

Once deployed, you'll get a URL like `https://your-app.vercel.app`. Now add the widget to your Squarespace site:

1. Go to your Squarespace dashboard
2. Navigate to **Settings** → **Advanced** → **Code Injection**
3. In the **Footer** section, add this code:

```html
<!-- ChatKit Widget Configuration -->
<script>
  window.CHATKIT_CONFIG = {
    baseUrl: 'https://your-app.vercel.app',  // Replace with your Vercel URL
    position: 'bottom-right',                  // Options: 'bottom-right', 'bottom-left', 'inline'
    buttonColor: '#0066ff',                    // Customize button color
    buttonText: '💬',                          // Customize button icon/text
  };
</script>
<script src="https://your-app.vercel.app/chatkit-embed.js"></script>
```

4. Replace `https://your-app.vercel.app` with your actual Vercel deployment URL
5. Click **Save**

That's it! The chat widget will now appear on your Squarespace site.

## Customization Options

The embed script supports various configuration options:

```javascript
window.CHATKIT_CONFIG = {
  // Required
  baseUrl: 'https://your-app.vercel.app',

  // Position (default: 'bottom-right')
  position: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'inline'

  // For inline mode, specify target element ID
  targetElement: 'chatkit-container', // Only used when position is 'inline'

  // Appearance
  buttonColor: '#0066ff',    // Button background color
  buttonText: '💬',          // Button text/emoji
  buttonSize: '60px',        // Button diameter

  // Chat window size
  windowWidth: '400px',
  windowHeight: '600px',

  // Z-index (if conflicts with other elements)
  zIndex: 9999,
};
```

### Inline Mode

For embedding the chat directly in your page content:

1. Add an element with ID `chatkit-container` where you want the chat:
   ```html
   <div id="chatkit-container"></div>
   ```

2. Configure the script for inline mode:
   ```javascript
   window.CHATKIT_CONFIG = {
     baseUrl: 'https://your-app.vercel.app',
     position: 'inline',
     targetElement: 'chatkit-container',
   };
   ```

## Development

To run locally for development:

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your credentials
# OPENAI_API_KEY=sk-proj-...
# VITE_CHATKIT_WORKFLOW_ID=wf_...

# Run development server
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend API on http://localhost:8000

## Project Structure

```
chatkit-v1/
├── api/                        # Vercel serverless functions
│   └── create-session.py       # Session creation endpoint
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatKitPanel.tsx
│   │   ├── lib/
│   │   │   └── chatkitSession.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
├── public/                     # Static assets
│   └── chatkit-embed.js       # Squarespace embed script
├── vercel.json                # Vercel configuration
├── package.json               # Root package.json
└── README.md                  # This file
```

## API Reference

### POST /api/create-session

Creates a new ChatKit session and returns a client secret.

**Request:**
```json
{
  "workflow": {
    "id": "wf_..."
  }
}
```

**Response:**
```json
{
  "client_secret": "cs_...",
  "expires_after": 3600
}
```

**Environment Variables Required:**
- `OPENAI_API_KEY` - Your OpenAI API key

## Troubleshooting

### Chat widget doesn't appear

1. Check browser console for errors
2. Verify your Vercel URL is correct in the embed script
3. Ensure Code Injection is enabled in Squarespace (Business plan required)
4. Clear browser cache and reload

### "Missing OPENAI_API_KEY" error

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your API key
3. Redeploy the application

### "Missing workflow id" error

1. Verify `VITE_CHATKIT_WORKFLOW_ID` is set in Vercel environment variables
2. Ensure the workflow ID starts with `wf_`
3. Redeploy the application

### Chat not loading in iframe

1. Check if Squarespace or your browser is blocking iframes
2. Verify the `X-Frame-Options` header is set correctly in `vercel.json`
3. Check browser console for CSP (Content Security Policy) errors

## Security Notes

- API keys are stored securely in Vercel environment variables (never in code)
- Backend validates all requests before calling OpenAI
- User sessions are managed via secure HTTP-only cookies
- CORS is configured to allow embedding from any domain

## Updating

To update your deployment after making changes:

```bash
# If using Vercel CLI
vercel --prod

# If using GitHub integration
git push origin main  # Vercel auto-deploys on push
```

## Support

- **OpenAI ChatKit Documentation**: https://platform.openai.com/docs/guides/chatkit
- **Vercel Documentation**: https://vercel.com/docs
- **Squarespace Code Injection**: https://support.squarespace.com/hc/en-us/articles/205815908

## License

MIT License - see LICENSE file for details

---

Made with ❤️ using OpenAI ChatKit
