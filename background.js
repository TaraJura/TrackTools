// Magic Extension Background Service Worker

const API_BASE_URL = 'https://techtools.cz/magic-extension-api';

// State management
let activeTabId = null;
let activeTabStartTime = null;
let activeTabUrl = null;
let activeTabDomain = null;
let activeTabTitle = null;

// Generate or retrieve user ID
async function getUserId() {
  const result = await chrome.storage.local.get(['userId']);
  if (result.userId) {
    return result.userId;
  }
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  await chrome.storage.local.set({ userId });
  return userId;
}

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

// Check if URL should be tracked (exclude chrome://, extension pages, etc.)
function shouldTrackUrl(url) {
  if (!url) return false;
  const excludedProtocols = ['chrome:', 'chrome-extension:', 'moz-extension:', 'about:', 'edge:'];
  return !excludedProtocols.some(protocol => url.startsWith(protocol));
}

// Check if tracking is enabled
async function isTrackingEnabled() {
  const result = await chrome.storage.local.get(['isPaused']);
  return !result.isPaused;
}

// Send data to API
async function sendToApi(endpoint, data) {
  if (!(await isTrackingEnabled())) return false;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch (error) {
    console.error('API Error:', error);
    // Store locally for later sync
    await storeLocally(endpoint, data);
    return false;
  }
}

// Store data locally when offline
async function storeLocally(endpoint, data) {
  const result = await chrome.storage.local.get(['pendingSync']);
  const pending = result.pendingSync || [];
  pending.push({ endpoint, data, timestamp: new Date().toISOString() });
  // Keep only last 1000 entries
  if (pending.length > 1000) pending.shift();
  await chrome.storage.local.set({ pendingSync: pending });
}

// Record page visit
async function recordVisit(tab) {
  if (!shouldTrackUrl(tab.url)) return;

  const userId = await getUserId();
  const domain = extractDomain(tab.url);

  await sendToApi('/visit', {
    userId,
    timestamp: new Date().toISOString(),
    url: tab.url,
    domain,
    title: tab.title || '',
    referrer: ''
  });
}

// Record time spent on previous page
async function recordTimeSpent() {
  if (!activeTabUrl || !activeTabStartTime) return;
  if (!shouldTrackUrl(activeTabUrl)) return;

  const duration = Math.round((Date.now() - activeTabStartTime) / 1000);
  if (duration < 1) return; // Ignore very short visits

  const userId = await getUserId();

  await sendToApi('/time', {
    userId,
    timestamp: new Date().toISOString(),
    url: activeTabUrl,
    domain: activeTabDomain,
    title: activeTabTitle || '',
    duration
  });
}

// Record tab event
async function recordTabEvent(tab, eventType) {
  if (!shouldTrackUrl(tab.url)) return;

  const userId = await getUserId();
  const domain = extractDomain(tab.url);

  await sendToApi('/event', {
    userId,
    timestamp: new Date().toISOString(),
    url: tab.url,
    domain,
    title: tab.title || '',
    event: eventType
  });
}

// Tab activation handler
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Record time spent on previous tab
  await recordTimeSpent();

  // Get new active tab info
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    // Update active tab state
    activeTabId = activeInfo.tabId;
    activeTabStartTime = Date.now();
    activeTabUrl = tab.url;
    activeTabDomain = extractDomain(tab.url);
    activeTabTitle = tab.title;

    // Record tab activation event
    await recordTabEvent(tab, 'tabActivated');
  } catch (error) {
    console.log('Tab tracking error:', error.message);
  }
});

// Tab update handler (for navigation within same tab)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId !== activeTabId) return;
  if (changeInfo.status !== 'complete') return;

  // Record time spent on previous page
  await recordTimeSpent();

  // Update state for new page
  activeTabStartTime = Date.now();
  activeTabUrl = tab.url;
  activeTabDomain = extractDomain(tab.url);
  activeTabTitle = tab.title;

  // Record new page visit
  await recordVisit(tab);
});

// Window focus change handler
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus - record time spent
    await recordTimeSpent();
    activeTabStartTime = null;
  } else {
    // Browser gained focus - restart timer
    if (activeTabId) {
      activeTabStartTime = Date.now();
    }
  }
});

// Idle state change handler
chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === 'idle' || state === 'locked') {
    await recordTimeSpent();
    activeTabStartTime = null;
  } else if (state === 'active') {
    if (activeTabId) {
      activeTabStartTime = Date.now();
    }
  }
});

// Set idle detection threshold (2 minutes)
chrome.idle.setDetectionInterval(120);

// Periodic sync of pending data
chrome.alarms.create('syncPending', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncPending') {
    const result = await chrome.storage.local.get(['pendingSync']);
    const pending = result.pendingSync || [];

    if (pending.length === 0) return;

    const userId = await getUserId();
    const analytics = pending.map(item => ({
      type: item.endpoint === '/visit' ? 'pageVisit' :
            item.endpoint === '/time' ? 'timeSpent' : 'tabEvent',
      data: item.data,
      timestamp: item.timestamp
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, analytics })
      });

      if (response.ok) {
        await chrome.storage.local.set({ pendingSync: [] });
        console.log('Synced pending data successfully');
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
});

// Message handler for popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getUserId') {
    getUserId().then(userId => sendResponse({ userId }));
    return true;
  }

  if (request.action === 'toggleTracking') {
    chrome.storage.local.get(['isPaused'], (result) => {
      chrome.storage.local.set({ isPaused: !result.isPaused }, () => {
        sendResponse({ isPaused: !result.isPaused });
      });
    });
    return true;
  }

  if (request.action === 'getTrackingStatus') {
    chrome.storage.local.get(['isPaused'], (result) => {
      sendResponse({ isPaused: !!result.isPaused });
    });
    return true;
  }

  if (request.action === 'getPendingCount') {
    chrome.storage.local.get(['pendingSync'], (result) => {
      sendResponse({ count: (result.pendingSync || []).length });
    });
    return true;
  }

  if (request.action === 'forceSyncNow') {
    chrome.alarms.create('syncPending', { when: Date.now() + 100 });
    sendResponse({ success: true });
    return true;
  }
});

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  await getUserId();
  console.log('Magic Extension installed');
});

console.log('Magic Extension background service worker initialized');
