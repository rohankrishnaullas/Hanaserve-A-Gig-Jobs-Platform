# Setup Instructions for Gig Jobs App

## Step 1: Install Node.js

If Node.js is not installed on your system:

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Download the LTS (Long Term Support) version
   - This will install both Node.js and npm

2. **Install Node.js:**
   - Run the downloaded installer
   - Follow the installation wizard
   - Make sure to check "Add to PATH" option if available

3. **Verify Installation:**
   - Close and reopen your terminal/command prompt
   - Run: `node --version`
   - Run: `npm --version`
   - Both commands should show version numbers

## Step 2: Install Dependencies

Once Node.js is installed, navigate to the project directory and install dependencies:

```bash
cd "c:\Users\rohanullas\Downloads\09 Fusion and Kid Buu Sagas ( Updated on 20-07-21 )\App\gig-jobs-app"
npm install
```

## Step 3: Start the Development Server

After dependencies are installed, start the React app:

```bash
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

## Troubleshooting

- If `npm` is not recognized after installing Node.js, restart your terminal
- If port 3000 is already in use, the app will ask to use a different port
- Make sure you're in the correct directory before running commands
