chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getCookies") {
      chrome.cookies.getAll({}, function(cookies) {
        sendResponse({cookies: cookies});
      });
      return true; // Indicates you wish to send a response asynchronously.
    }
  });