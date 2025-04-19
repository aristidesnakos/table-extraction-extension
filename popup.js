// Get references to the HTML elements
const extractButton = document.getElementById('extractButton');
const statusDiv = document.getElementById('status');
const sheetIdInput = document.getElementById('sheetId');
const sheetNameInput = document.getElementById('sheetName');

// Add event listener to the button
extractButton.addEventListener('click', () => {
    statusDiv.textContent = 'Extracting...'; // Provide feedback
    const sheetId = sheetIdInput.value.trim();
    const sheetName = sheetNameInput.value.trim() || 'Sheet1'; // Default to 'Sheet1'

    if (!sheetId) {
        statusDiv.textContent = 'Error: Please enter a Google Sheet ID.';
        return;
    }

    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab || !activeTab.id) {
             statusDiv.textContent = 'Error: Could not get active tab.';
             console.error('Could not get active tab.');
             return;
        }

        // Send a message to the content script to start extraction
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: extractTableData, // Function defined in content.js
        }, (injectionResults) => {
             // Error handling for script injection
            if (chrome.runtime.lastError || !injectionResults || !injectionResults[0]) {
                statusDiv.textContent = `Error injecting script: ${chrome.runtime.lastError?.message || 'Unknown error'}`;
                console.error(`Script injection failed: ${chrome.runtime.lastError?.message}`);
                return;
            }

            const result = injectionResults[0].result;

            if (result && result.success && result.data) {
                // Send the extracted data to the background script
                chrome.runtime.sendMessage(
                    {
                        action: 'sendToGoogleSheets',
                        data: result.data,
                        sheetId: sheetId,
                        sheetName: sheetName
                    },
                    (response) => {
                        if (chrome.runtime.lastError) {
                             statusDiv.textContent = `Error: ${chrome.runtime.lastError.message}`;
                             console.error("Error sending message:", chrome.runtime.lastError);
                        } else if (response && response.success) {
                            statusDiv.textContent = 'Success! Data sent to Google Sheets.';
                        } else {
                            statusDiv.textContent = `Error: ${response?.message || 'Failed to send data.'}`;
                        }
                    }
                );
            } else {
                statusDiv.textContent = `Error: ${result?.message || 'Could not extract table data.'}`;
            }
        });
    });
});

// --- This function will be injected into the content page ---
// --- It cannot access variables from the popup's scope ---
function extractTableData() {
    // Find the first visible table on the page.
    // You might need more specific selectors for complex pages like Ahrefs.
    // Consider targeting tables with specific IDs or classes if possible.
    const tables = Array.from(document.querySelectorAll('table'));
    const visibleTable = tables.find(table => table.offsetParent !== null); // Basic check for visibility

    if (!visibleTable) {
        return { success: false, message: 'No visible table found on the page.' };
    }

    const data = [];
    // Extract header row (thead)
    const headers = [];
    const headerCells = visibleTable.querySelectorAll('thead th');
    if (headerCells.length > 0) {
        headerCells.forEach(th => headers.push(th.innerText.trim()));
        data.push(headers);
    } else {
        // Fallback if no thead, try first row th
        const firstRowTh = visibleTable.querySelectorAll('tbody tr:first-child th');
         if (firstRowTh.length > 0) {
             firstRowTh.forEach(th => headers.push(th.innerText.trim()));
             data.push(headers);
         }
         // If still no headers, don't add a header row
    }


    // Extract body rows (tbody)
    const rows = visibleTable.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const rowData = [];
        // Handle both th (sometimes used for row headers) and td cells
        row.querySelectorAll('td, th').forEach(cell => {
            rowData.push(cell.innerText.trim());
        });
         // Only add row if it has data matching header count (if headers exist) or has any data
        if (rowData.length > 0 && (headers.length === 0 || rowData.length === headers.length)) {
            data.push(rowData);
        } else if (rowData.some(cell => cell)) { // Add if row has *any* data, even if columns mismatch (might be less structured table)
            data.push(rowData);
        }
    });

    if (data.length === 0 || (data.length === 1 && headers.length > 0)) { // No data rows found
         return { success: false, message: 'Found a table, but could not extract data rows.' };
    }

    return { success: true, data: data };
}
// --- End of injected function ---
