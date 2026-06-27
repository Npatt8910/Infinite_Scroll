const getScrollKey = () => `scroll_pos_${window.location.href.split('?')[0]}`; // Strips query tracking IDs common on social media

// 1. Save scroll position aggressively as the user scrolls
let saveTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const scrollData = {
      y: window.scrollY || window.pageYOffset,
      timestamp: Date.now()
    };
    // Only save if we are actually scrolled down
    if (scrollData.y > 100) {
      sessionStorage.setItem(getScrollKey(), JSON.stringify(scrollData));
    }
  }, 200); // Debounce to prevent performance lag
});

// 2. The Force-Load Recovery Loop
function restoreInfiniteScroll() {
  const savedData = sessionStorage.getItem(getScrollKey());
  if (!savedData) return;

  const { y, timestamp } = JSON.parse(savedData);
  
  // If the data is older than 20 minutes, ignore it (stale feed)
  if (Date.now() - timestamp > 20 * 60 * 1000) {
    sessionStorage.removeItem(getScrollKey());
    return;
  }

  let attempts = 0;
  const maxAttempts = 100; // Hard stop safeguard so it doesn't loop infinitely
  
  const scrollInterval = setInterval(() => {
    const currentMaxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const currentY = window.scrollY;

    // Check if we've successfully reached or surpassed the target
    if (currentY >= y || attempts > maxAttempts) {
      clearInterval(scrollInterval);
      window.scrollTo(0, y); // Final precise alignment
      return;
    }

    // If the feed has stalled, simulate an incremental scroll step down 
    // to trigger Facebook/Instagram's "load more content" triggers.
    if (currentMaxScroll < y) {
      window.scrollTo(0, currentMaxScroll);
    } else {
      // If the page has generated enough height, execute the jump
      window.scrollTo({
        top: y,
        behavior: 'instant'
      });
      clearInterval(scrollInterval);
      return;
    }

    attempts++;
  }, 350); // Give the site's network API 350ms per jump to fetch and render posts
}

// 3. Multi-trigger initialization for modern SPAs
window.addEventListener('load', () => setTimeout(restoreInfiniteScroll, 500));
window.addEventListener('popstate', () => setTimeout(restoreInfiniteScroll, 300));

// Facebook/Instagram specific internal navigation monitoring
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(restoreInfiniteScroll, 500);
  }
}).observe(document, { subtree: true, childList: true });