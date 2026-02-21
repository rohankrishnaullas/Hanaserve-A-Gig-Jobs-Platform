# Google Cloud Platform (GCP) Setup Guide for LLM Integration

## Step-by-Step Instructions to Set Up Vertex AI (Gemini) API

### Prerequisites
- A Google account
- A credit card (for billing, though free tier is available)

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "gig-jobs-llm")
5. Click **"Create"**
6. Wait for the project to be created (may take a minute)
7. Select your new project from the dropdown

---

## Step 2: Enable Vertex AI API

1. In the Google Cloud Console, go to **"APIs & Services"** > **"Library"**
2. Search for **"Vertex AI API"**
3. Click on **"Vertex AI API"**
4. Click **"Enable"**
5. Wait for the API to be enabled (usually takes 30-60 seconds)

**Alternative:** You can also use the **Gemini API** (simpler, no need for Vertex AI):
1. Search for **"Generative Language API"** instead
2. Enable it

---

## Step 3: Create a Service Account

1. Go to **"IAM & Admin"** > **"Service Accounts"**
2. Click **"Create Service Account"**
3. Enter a name (e.g., "gig-jobs-service")
4. Click **"Create and Continue"**
5. Under **"Grant this service account access to project"**, select role: **"Vertex AI User"** (or **"AI Platform User"**)
6. Click **"Continue"** then **"Done"**

---

## Step 4: Create and Download API Key

### Option A: Using Service Account Key (Recommended for Production)

1. Click on the service account you just created
2. Go to the **"Keys"** tab
3. Click **"Add Key"** > **"Create new key"**
4. Select **"JSON"** format
5. Click **"Create"**
6. A JSON file will download - **SAVE THIS SECURELY** (contains your credentials)
7. **DO NOT commit this file to git!**

### Option B: Using API Key (Simpler for Development)

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"API Key"**
3. Copy the API key that appears
4. (Optional) Click **"Restrict Key"** to limit usage to specific APIs
5. Save the API key securely

---

## Step 5: Enable Billing (Required for API Usage)

1. Go to **"Billing"** in the left menu
2. Click **"Link a billing account"**
3. Follow the prompts to add a payment method
4. **Note:** Google Cloud offers $300 free credit for new users and a free tier for many services

---

## Step 6: Get Your Project Details

You'll need these values for the integration:

### For Vertex AI:
- **Project ID**: Found in the project dropdown at the top (e.g., "gig-jobs-llm-123456")
- **Location**: Usually `us-central1` or `us-east1`
- **Service Account JSON**: The downloaded JSON file path

### For Gemini API (Simpler):
- **API Key**: The API key you created in Step 4
- **Model Name**: Usually `gemini-pro` or `gemini-1.5-flash`

---

## Step 7: Install Required Packages

In your project directory, run:

```bash
cd Code/gig-jobs-app
npm install @google-cloud/aiplatform
# OR for Gemini API (simpler):
npm install @google/generative-ai
```

---

## Step 8: Environment Variables

Create a `.env` file in `Code/gig-jobs-app/` (add to `.gitignore`):

```env
# For Vertex AI
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json

# OR for Gemini API (simpler)
GOOGLE_GEMINI_API_KEY=your-api-key-here
GOOGLE_GEMINI_MODEL=gemini-1.5-flash
```

---

## Quick Start: Using Gemini API (Easiest Option)

If you want the simplest setup, use the Gemini API instead of Vertex AI:

1. Enable **"Generative Language API"** (Step 2)
2. Create an **API Key** (Step 4, Option B)
3. Use the Gemini API package: `npm install @google/generative-ai`
4. No service account needed!

---

## Next Steps

Once you have your credentials, provide me with:
- Which API you're using: **Vertex AI** or **Gemini API**
- Your **Project ID** (for Vertex AI) or **API Key** (for Gemini)
- Your preferred **model name** (e.g., `gemini-1.5-flash`, `gemini-pro`)

I'll then integrate it into your app!

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit API keys or service account JSON files to git
- Add `.env` and `*.json` (service account files) to `.gitignore`
- Use environment variables for all sensitive data
- Consider using a backend proxy for production (don't expose API keys in frontend code)


