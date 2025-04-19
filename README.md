# Table Extraction Chrome Extension

A Chrome extension that extracts HTML tables from webpages and saves them to Google Sheets.

## How to Set Up and Use the Extension

### 1. Google Cloud Console Setup (CRITICAL STEP)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "+ CREATE CREDENTIALS" and choose "OAuth client ID"
5. If prompted, configure the consent screen:
   - Select "External" user type
   - Provide an app name, user support email, and developer contact info
   - Add the necessary scope: `https://www.googleapis.com/auth/spreadsheets`
   - Add your email address as a test user while testing
6. For "Application type", select "Chrome app"
7. Enter the Application ID. To get this ID:
   - Load the unpacked extension in Chrome first (see step 4)
   - Go to `chrome://extensions`
   - Find your loaded extension and copy its ID
   - Paste this ID into the "Application ID" field in the Google Cloud Console
8. Click "Create"
9. Copy the generated Client ID

### 2. Update manifest.json

1. Open `manifest.json`
2. Find the `oauth2` section
3. Replace `"YOUR_GOOGLE_CLOUD_OAUTH_CLIENT_ID.apps.googleusercontent.com"` with the actual Client ID you copied from the Google Cloud Console

### 3. Enable Google Sheets API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API" and enable it for your project

### 4. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (usually a toggle in the top right)
3. Click "Load unpacked"
4. Select the folder you created (`table-extractor-extension`)
5. The extension icon should appear in your toolbar

## Usage

1. Navigate to a webpage containing an HTML table (like the Ahrefs page in your example)
2. Click the extension icon in your toolbar
3. Enter the Google Sheet ID in the popup. You find this in the URL of your Google Sheet (e.g., `https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit`)
4. Optionally, enter the specific sheet name (tab name, e.g., "Ahrefs Data"). If left blank, it defaults to "Sheet1"
5. Click "Extract First Table"
6. The first time, you will likely be prompted by Google to authorize the extension to access your Google Sheets. Grant permission
7. The extension will attempt to find the first visible table, extract its data, and append it to the specified Google Sheet
8. Check the popup for status messages (success or error)

## Important Considerations

### Table Selection

The `content.js` script currently selects the first visible `<table>` element it finds. This might not always be the correct table on complex pages. You may need to modify the `extractTableData` function in `popup.js` with more specific CSS selectors (e.g., `document.querySelector('#specificTableId')` or `document.querySelector('.ahrefs-data-table')`) based on the HTML structure of the target website. You can use Chrome's Developer Tools (right-click > Inspect) to find suitable selectors.

### Error Handling

The provided code includes basic error handling, but robust error management (e.g., handling different table structures, API rate limits, network issues) would require more development.

### Security

Be cautious with permissions. This extension requests access to your Google Sheets. Ensure you understand what permissions you are granting.

### Dynamic Content

If the table loads dynamically (after the initial page load) using JavaScript, the content script might run too early. More advanced techniques might be needed (e.g., using `MutationObserver` or waiting for specific elements).