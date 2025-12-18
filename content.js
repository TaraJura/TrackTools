// TrackTools - Content Script for Page Analytics

(function() {
  // Avoid tracking chrome:// and extension pages
  if (window.location.protocol === 'chrome:' ||
      window.location.protocol === 'chrome-extension:') {
    return;
  }

  let startTime = Date.now();
  let isActive = true;
  let totalActiveTime = 0;

  // Send page visit event
  function trackPageVisit() {
    chrome.runtime.sendMessage({
      action: 'pageVisit',
      url: window.location.href,
      title: document.title,
      referrer: document.referrer
    });
  }

  // Send time spent data
  function trackTimeSpent() {
    if (totalActiveTime > 0) {
      chrome.runtime.sendMessage({
        action: 'timeSpent',
        url: window.location.href,
        title: document.title,
        duration: Math.round(totalActiveTime / 1000) // Convert to seconds
      });
    }
  }

  // Track visibility changes
  function handleVisibilityChange() {
    if (document.hidden) {
      // Page became hidden - accumulate active time
      if (isActive) {
        totalActiveTime += Date.now() - startTime;
        isActive = false;
      }
    } else {
      // Page became visible - reset start time
      startTime = Date.now();
      isActive = true;
    }
  }

  // Track when user leaves page
  function handleBeforeUnload() {
    if (isActive) {
      totalActiveTime += Date.now() - startTime;
    }
    trackTimeSpent();
  }

  // Initialize tracking
  function init() {
    // Track initial page visit
    trackPageVisit();

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track time spent when leaving
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Also track on pagehide for mobile browsers
    window.addEventListener('pagehide', handleBeforeUnload);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('TrackTools content script initialized');
})();
