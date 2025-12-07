# EmailJS Setup Guide

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com
2. Click "Sign Up" and create a free account
3. Verify your email

## Step 2: Add Email Service
1. Go to Dashboard → Email Services
2. Click "Add Service"
3. Choose your email provider (Gmail recommended):
   - **Gmail**: Select "Gmail" and authorize
   - **Other Email**: Select provider and enter credentials
4. Click "Create Service"
5. Copy your **Service ID** (looks like: `service_xxxxxxxxxx`)

## Step 3: Create Email Template
1. Go to Dashboard → Email Templates
2. Click "Create New Template"
3. Name it: `portfolio_contact` (or any name you prefer)
4. Copy the HTML from `EMAILJS_TEMPLATE.html` into the template editor
5. Make sure these variables are in your template:
   - `{{from_name}}` - Sender's name
   - `{{from_email}}` - Sender's email
   - `{{message}}` - Message content
6. Click "Save"
7. Copy your **Template ID** (looks like: `template_xxxxxxxxxx`)

## Step 4: Get Public Key
1. Go to Dashboard → Account
2. Copy your **Public Key** (looks like: `xxxxxxxxxxxxxxxxxxxxxxxx`)

## Step 5: Update Your Portfolio
Open `index.html` and find this section:

```javascript
const EMAILJS_CONFIG = {
    serviceID: 'service_YOUR_SERVICE_ID',      // Replace here
    templateID: 'template_YOUR_TEMPLATE_ID',    // Replace here
    publicKey: 'YOUR_PUBLIC_KEY'                // Replace here
};
```

Replace with your actual credentials:

```javascript
const EMAILJS_CONFIG = {
    serviceID: 'service_abc123def456',
    templateID: 'template_xyz789uvw012',
    publicKey: 'abc123def456xyz789uvw012'
};
```

## Step 6: Test It
1. Open your portfolio in browser
2. Go to Contact section
3. Fill in the form and submit
4. Check your email inbox for the message

## Email Template Features

✅ **Professional Design**
- Dark header with your name
- Clean, modern layout
- Responsive design

✅ **Message Details**
- Sender's name and email
- Full message content
- Reply button

✅ **Footer**
- Links to your portfolio
- Social media links
- Copyright notice

## Troubleshooting

**Email not sending?**
- Check credentials are correct
- Verify email service is connected
- Check spam folder
- Ensure template variables match ({{from_name}}, {{from_email}}, {{message}})

**Template not showing correctly?**
- Make sure you're using the HTML template provided
- Check all variables are spelled correctly
- Test with a simple message first

**Need help?**
- EmailJS Docs: https://www.emailjs.com/docs/
- Check browser console for errors (F12)

## Security Notes

⚠️ **Important:**
- Never share your Public Key publicly
- Keep credentials in environment variables for production
- For Vercel deployment, use environment variables

## For Vercel Deployment

1. Go to your Vercel project settings
2. Add Environment Variables:
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
3. Update your code to use: `process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID`

---

**Your portfolio is now ready to receive messages!** 🚀
