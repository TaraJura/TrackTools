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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// TEXT ABOVE PROTECTED 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// TEXT ABOVE PROTECTED 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// TEXT ABOVE PROTECTED 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// TEXT ABOVE PROTECTED 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// TEXT ABOVE PROTECTED 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// TEXT ABOVE PROTECTED 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// TEXT ABOVE PROTECTED 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// TEXT ABOVE PROTECTED 



function createOverlay() {
  const overlay = document.createElement('div');
  overlay.setAttribute('style', `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.75);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
  `);

  // Create an exit button to close the overlay
  const exitButton = document.createElement('button');
  exitButton.textContent = 'X';
  exitButton.setAttribute('style', `
      position: absolute;
      top: 20px;
      right: 20px;
      background-color: red;
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
  `);

  overlay.appendChild(exitButton);
  document.body.appendChild(overlay);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "showOverlay") {
      createOverlay();
  }
});
