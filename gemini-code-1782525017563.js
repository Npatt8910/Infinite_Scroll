// Unique key for session storage based on the current URL
const getScrollKey = () => `scroll_pos_${window.location.href}`;

// 1. Save scroll position before navigating away
window.addEventListener('beforeunload', () => {
  const scrollData = {
    x: window.scrollX || window.pageXOffset,
    y: window.scrollY || window.pageYOffset
  };
  // Store it in sessionStorage (wiped when tab closes)
  sessionStorage.setItem(getScrollKey(), JSON.stringify(scrollData));
});

// 2. Restore scroll position if the user navigated back
function restoreScroll() {
  const savedData = sessionStorage.getItem(getScrollKey());
  
  if (savedData) {
    const { x, y } = JSON.parse(savedData);
    
    // We use a slight timeout because dynamic pages (infinite scroll) 
    // often need a split second to render content before they can be scrolled.
    setTimeout(() => {
      window.scrollTo({
        top: y,
        left: x,
        behavior: 'smooth' // Smooth scroll looks nicer, use 'auto' for instant jump
      });
    }, 100); 
  }
}

// Run the restore function when the script loads
if (document.readyState === 'complete') {
  restoreScroll();
} else {
  window.addEventListener('load', restoreScroll);
}

// Handle Single Page Apps (SPAs) like YouTube/Facebook that change content without full reloads
window.addEventListener('popstate', restoreScroll);