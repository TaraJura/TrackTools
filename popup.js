document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['userToken'], function(result) {
        const userToken = result.userToken || 'Token not found (refresh the page)';
        document.getElementById('userId').textContent = `User ID: ${userToken}`;
    });
});
