// src/background.jsx

console.log('Background service worker is running!');

// Example: Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received:', message);
  if (message.type === 'PING') {
    sendResponse({ type: 'PONG', data: 'Hello from Background' });
  }
});
