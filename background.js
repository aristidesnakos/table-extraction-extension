// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendToGoogleSheets') {
        console.log("Received data for Google Sheets:", request.data);

        // Get OAuth token
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError || !token) {
                console.error("OAuth Error:", chrome.runtime.lastError);
                sendResponse({ success: false, message: `Authentication failed: ${chrome.runtime.lastError?.message || 'Unknown error'}` });
                return;
            }

            console.log("OAuth Token obtained.");

            // Prepare data for Google Sheets API (values are arrays of arrays)
            const values = request.data;
            const sheetId = request.sheetId;
            // Construct the range using A1 notation. Example: 'Sheet1!A1'
            // This determines where the data writing will start.
            const range = `${request.sheetName}!A1`;

            // Google Sheets API endpoint for updating values
            const SPREADSHEET_ID = sheetId;
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=OVERWRITE`;
             // Use :append to add data after the last row with content
             // Use OVERWRITE to replace existing data starting from 'range'
             // Use USER_ENTERED to allow Sheets to parse values (e.g., numbers, dates)

            console.log("Sending data to Google Sheets API:", url);

            // Make the API call using fetch
            fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    range: range, // Although using :append, range is still needed in body for structure
                    majorDimension: "ROWS",
                    values: values
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Google Sheets API Response:", data);
                if (data.error) {
                    console.error("Google Sheets API Error:", data.error);
                    sendResponse({ success: false, message: `API Error: ${data.error.message}` });
                } else {
                    console.log("Successfully appended data.");
                    sendResponse({ success: true, message: 'Data sent successfully!' });
                }
            })
            .catch(error => {
                console.error("Fetch Error:", error);
                sendResponse({ success: false, message: `Network or fetch error: ${error.message}` });
            });
        });

        // Return true to indicate you wish to send a response asynchronously
        return true;
    }
});

// Optional: Log installation or update details
chrome.runtime.onInstalled.addListener(() => {
    console.log('Table to Google Sheets Extractor installed.');
});
