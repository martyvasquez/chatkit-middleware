# Squarespace Integration Guide

This guide walks you through adding the ChatKit widget to your Squarespace website.

## Prerequisites

Before you begin, make sure you have:

1. ✅ Deployed your ChatKit app to Vercel
2. ✅ Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
3. ✅ Squarespace Business plan or higher (required for Code Injection)

## Step-by-Step Integration

### Step 1: Access Code Injection

1. Log in to your Squarespace dashboard
2. Navigate to **Settings** → **Advanced** → **Code Injection**

   ![Squarespace Settings](https://support.squarespace.com/hc/article_attachments/360020042691/Screen_Shot_2018-12-12_at_12.23.58_PM.png)

### Step 2: Add the Widget Code

Copy this code and paste it into the **Footer** section (scroll to the bottom):

```html
<!-- ChatKit Widget Configuration -->
<script>
  window.CHATKIT_CONFIG = {
    baseUrl: 'https://your-app.vercel.app',
    position: 'bottom-right',
    buttonColor: '#0066ff',
    buttonText: '💬',
  };
</script>
<script src="https://your-app.vercel.app/chatkit-embed.js"></script>
```

**Important:** Replace `https://your-app.vercel.app` with your actual Vercel URL (both occurrences).

### Step 3: Save and Test

1. Click **Save** at the top of the page
2. Visit your website in a new browser tab
3. You should see a chat button appear in the bottom-right corner
4. Click the button to open the chat widget

## Customization Examples

### Example 1: Chat Button in Bottom-Left

```html
<script>
  window.CHATKIT_CONFIG = {
    baseUrl: 'https://your-app.vercel.app',
    position: 'bottom-left',
    buttonColor: '#10b981',
    buttonText: '💬 Chat',
  };
</script>
<script src="https://your-app.vercel.app/chatkit-embed.js"></script>
```

### Example 2: Larger Chat Window

```html
<script>
  window.CHATKIT_CONFIG = {
    baseUrl: 'https://your-app.vercel.app',
    position: 'bottom-right',
    buttonColor: '#6366f1',
    buttonText: '💬',
    windowWidth: '500px',
    windowHeight: '700px',
  };
</script>
<script src="https://your-app.vercel.app/chatkit-embed.js"></script>
```

### Example 3: Inline Chat (Embedded in Page Content)

To embed the chat directly in a page:

1. Add a **Code Block** to your Squarespace page where you want the chat:

```html
<div id="chatkit-container" style="height: 600px;"></div>
```

2. Add this to **Footer** Code Injection:

```html
<script>
  window.CHATKIT_CONFIG = {
    baseUrl: 'https://your-app.vercel.app',
    position: 'inline',
    targetElement: 'chatkit-container',
  };
</script>
<script src="https://your-app.vercel.app/chatkit-embed.js"></script>
```

### Example 4: Match Your Brand Colors

```html
<script>
  window.CHATKIT_CONFIG = {
    baseUrl: 'https://your-app.vercel.app',
    position: 'bottom-right',
    buttonColor: '#YOUR_BRAND_COLOR',  // e.g., '#ff6b6b'
    buttonText: '👋',
    buttonSize: '70px',
  };
</script>
<script src="https://your-app.vercel.app/chatkit-embed.js"></script>
```

## Troubleshooting

### Widget doesn't appear

**Possible causes:**

1. **Code Injection not enabled** - Requires Business plan or higher
   - Solution: Upgrade to Business plan or check with Squarespace support

2. **Wrong Vercel URL** - Check for typos
   - Solution: Copy URL directly from Vercel dashboard

3. **Browser cache** - Old version might be cached
   - Solution: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

4. **JavaScript errors** - Check browser console
   - Solution: Press F12, check Console tab for errors

### Widget appears but doesn't work

1. **Check environment variables** - Verify they're set in Vercel
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Make sure `OPENAI_API_KEY` and `VITE_CHATKIT_WORKFLOW_ID` are set
   - Redeploy after adding variables

2. **Check browser console** - Look for error messages
   - Press F12 and check the Console tab

3. **Test directly** - Visit your Vercel URL directly
   - If it works there but not in Squarespace, check iframe settings

### Widget position conflicts with other elements

If the widget overlaps with other page elements:

```html
<script>
  window.CHATKIT_CONFIG = {
    baseUrl: 'https://your-app.vercel.app',
    position: 'bottom-right',
    buttonColor: '#0066ff',
    buttonText: '💬',
    zIndex: 10000,  // Increase this number if needed
  };
</script>
<script src="https://your-app.vercel.app/chatkit-embed.js"></script>
```

## Programmatic Control

You can control the widget using JavaScript:

```html
<script>
  // Open the chat programmatically
  window.ChatKitWidget.open();

  // Close the chat
  window.ChatKitWidget.close();

  // Toggle the chat
  window.ChatKitWidget.toggle();

  // Check if chat is open
  if (window.ChatKitWidget.isOpen()) {
    console.log('Chat is open!');
  }
</script>
```

### Example: Open chat when user clicks a custom button

1. Add a button to your Squarespace page
2. Add this code to Footer Code Injection:

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Replace 'your-button-id' with your actual button's ID or class
    const customButton = document.querySelector('.your-custom-button');
    if (customButton) {
      customButton.addEventListener('click', function() {
        window.ChatKitWidget.open();
      });
    }
  });
</script>
```

## Best Practices

1. **Position**: Most websites use `bottom-right` for familiarity
2. **Colors**: Match your brand colors for consistency
3. **Size**: Default sizes work well on mobile and desktop
4. **Testing**: Always test on mobile devices after implementing

## Support Pages Integration

For support or help pages, consider using inline mode to make the chat more prominent:

```html
<!-- In your support page Code Block -->
<div id="chatkit-container" style="height: 700px; max-width: 800px; margin: 0 auto;"></div>
```

Then configure inline mode as shown in Example 3 above.

## Need Help?

- Check the main [README.md](README.md) for more information
- Visit [OpenAI ChatKit Documentation](https://platform.openai.com/docs/guides/chatkit)
- Contact Squarespace support for Code Injection issues

---

Happy chatting! 💬
