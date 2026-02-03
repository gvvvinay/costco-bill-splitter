# Google Gemini Vision API Setup Guide

This application now uses **Google Gemini Vision API** for intelligent receipt parsing instead of Tesseract OCR. This provides much better accuracy for extracting item information from receipt images.

## Prerequisites

- Google account with access to Google Cloud
- A Google Cloud Project

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "Bill Splitter")
5. Click "CREATE"
6. Wait for the project to be created

## Step 2: Enable the Generative AI API

1. In the Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Generative AI API" or "Google AI API"
3. Click on the result
4. Click **ENABLE**
5. Wait for it to be enabled

## Step 3: Create an API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **API Key**
4. A dialog will appear with your new API key
5. Click the **Copy** button to copy the key
6. Click **CLOSE**

## Step 4: Add API Key to Environment Variables

1. Open `backend/.env` in your editor
2. Add the following line:
```env
GOOGLE_API_KEY=your-api-key-here
```
3. Replace `your-api-key-here` with the API key you copied in Step 3
4. Save the file

Example `.env` file:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
UPLOAD_DIR="./uploads"
GOOGLE_API_KEY="AIza..."
```

## Step 5: Restart the Backend

```bash
# Kill any running Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start the development server
cd c:\tmp\costco-bill-splitter
npm run dev
```

## Step 6: Test Receipt Upload

1. Go to http://localhost:3000
2. Create a new bill split session
3. Upload a receipt image
4. The Gemini Vision API will automatically parse the items from the receipt!

## How It Works

When you upload a receipt image:

1. **Image Validation**: The file is checked to ensure it's a valid image
2. **Gemini Analysis**: The image is sent to Google's Gemini Vision API
3. **Smart Extraction**: Gemini uses advanced vision and language understanding to:
   - Identify all items on the receipt
   - Extract quantities and prices
   - Calculate subtotal, tax, and total
   - Understand item names and structure
4. **JSON Response**: The API returns structured JSON with all extracted data
5. **Population**: Items are automatically populated in your bill splitter

## Advantages over OCR

- **Much more accurate** for receipts with varying layouts
- **Context-aware** - understands what's an item vs. metadata
- **Handles different formats** - works with different receipt styles
- **Extracts quantities** automatically
- **Structured data** - returns proper JSON, not just text
- **Intelligent** - understands prices, taxes, and totals

## Troubleshooting

### Error: "GOOGLE_API_KEY environment variable not set"
- Make sure you added `GOOGLE_API_KEY` to your `.env` file
- Restart the backend server after updating `.env`

### Error: "Invalid API Key"
- Verify the API key is correct (copy it again from Google Cloud Console)
- Make sure you enabled the Generative AI API in Google Cloud

### Error: "Quota exceeded"
- Free tier has rate limits
- Upgrade to a paid plan if needed: [Google Cloud Billing](https://console.cloud.google.com/billing)

### Items not extracting
- Try uploading a clearer receipt image
- Ensure the receipt is fully visible in the image
- If still not working, use the manual entry option

## Cost

The Google Generative AI API offers:
- **Free tier**: Limited requests (check current limits at [Google AI Studio](https://aistudio.google.com/))
- **Paid tier**: $0.075 per 1M input tokens, $0.30 per 1M output tokens
- Most receipt images use minimal tokens (typically < 5000 tokens)

## Security Notes

- Keep your API key secret
- Never commit `.env` to version control
- The `.env` file is already in `.gitignore`
- Use environment variables in production, not hardcoded keys

## Support

For issues with the Google API:
- [Google Generative AI Docs](https://ai.google.dev/)
- [Google Cloud Console Help](https://cloud.google.com/support)

For issues with this app:
- Check the console logs for detailed error messages
- Make sure the receipt image is clear and readable
- Try with a different receipt image
