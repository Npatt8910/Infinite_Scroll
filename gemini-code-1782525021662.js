chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // If the page is fully loaded, tell the content script to check for a saved scroll
  if (changeInfo.status === 'complete') {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        if (typeof restoreScroll === 'function') restoreScroll();
      }
    }).catch(err => console.log("Extension context safe-guard:", err));
  }
});