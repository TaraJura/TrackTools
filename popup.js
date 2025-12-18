// Magic Extension Popup Script

const API_BASE_URL = 'https://techtools.cz/magic-extension-api';

async function init() {
  // Get user ID
  chrome.runtime.sendMessage({ action: 'getUserId' }, (response) => {
    if (response && response.userId) {
      document.getElementById('userId').value = response.userId;
      loadStats(response.userId);
    }
  });

  // Get tracking status
  chrome.runtime.sendMessage({ action: 'getTrackingStatus' }, (response) => {
    updateStatusUI(response && response.isPaused);
  });

  // Get pending sync count
  chrome.runtime.sendMessage({ action: 'getPendingCount' }, (response) => {
    if (response && response.count > 0) {
      document.getElementById('pendingInfo').textContent = `${response.count} events pending sync`;
    }
  });

  // Copy button handler
  document.getElementById('copyBtn').addEventListener('click', () => {
    const input = document.getElementById('userId');
    input.select();
    document.execCommand('copy');

    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });

  // Pause/Resume button handler
  document.getElementById('pauseBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggleTracking' }, (response) => {
      updateStatusUI(response && response.isPaused);
    });
  });
}

function updateStatusUI(isPaused) {
  const statusEl = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  const pauseBtn = document.getElementById('pauseBtn');

  if (isPaused) {
    statusEl.classList.add('paused');
    statusText.textContent = 'Tracking Paused';
    pauseBtn.textContent = 'Resume Tracking';
    pauseBtn.classList.add('paused');
  } else {
    statusEl.classList.remove('paused');
    statusText.textContent = 'Tracking Active';
    pauseBtn.textContent = 'Pause Tracking';
    pauseBtn.classList.remove('paused');
  }
}

async function loadStats(userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${API_BASE_URL}/analytics/${encodeURIComponent(userId)}?start_date=${today}&end_date=${today}`
    );

    if (response.ok) {
      const data = await response.json();
      document.getElementById('todayVisits').textContent = data.summary.totalVisits || 0;
      document.getElementById('todayTime').textContent = data.summary.totalTimeFormatted || '0s';
    } else {
      document.getElementById('todayVisits').textContent = '0';
      document.getElementById('todayTime').textContent = '0s';
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
    document.getElementById('todayVisits').textContent = '-';
    document.getElementById('todayTime').textContent = '-';
  }
}

document.addEventListener('DOMContentLoaded', init);

console.log('Magic Extension popup initialized');
