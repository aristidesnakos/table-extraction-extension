// This script runs in the context of the web page.
// It doesn't have direct access to extension APIs like chrome.runtime.sendMessage
// unless explicitly receiving a message or invoked via chrome.scripting.executeScript.

// The main logic for extracting data is now included within the popup.js
// inside the `extractTableData` function, which is injected when the
// popup button is clicked using chrome.scripting.executeScript.

// This content script file is kept minimal or can be used for other
// page-specific interactions if needed later (e.g., adding context menus,
// highlighting tables on hover).

console.log("Table Extractor content script loaded.");

// Example: You could add listeners here if needed for more complex interactions
// document.addEventListener('mouseover', (event) => {
//   // Example: Highlight tables on hover
//   if (event.target.tagName === 'TABLE') {
//     event.target.style.outline = '2px solid blue';
//   }
// });
// document.addEventListener('mouseout', (event) => {
//   if (event.target.tagName === 'TABLE') {
//     event.target.style.outline = '';
//   }
// });
