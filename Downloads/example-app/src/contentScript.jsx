console.log("YouTube Stats Extension: content script loaded");

// Function to extract the YouTube video ID from the current page URL
function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("v");
}

// Function to send a message to the background script or popup
function sendMessageToExtension(message) {
    chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
            console.warn("YouTube Stats Extension: No response from background script.");
        } else {
            console.log("YouTube Stats Extension: Received response:", response);
        }
    });
}

// Function to observe changes in the URL (for YouTube's SPA navigation)
function observeUrlChanges(callback) {
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            callback();
        }
    }).observe(document, { subtree: true, childList: true });
}

// Send video ID when the script is injected
const videoId = getVideoId();
if (videoId) {
    sendMessageToExtension({ type: "VIDEO_INFO", videoId });
}

// Observe for navigation changes (when users switch videos without reloading)
observeUrlChanges(() => {
    const newVideoId = getVideoId();
    if (newVideoId) {
        sendMessageToExtension({ type: "VIDEO_INFO", videoId: newVideoId });
    }
});
