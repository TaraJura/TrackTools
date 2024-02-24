chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getCookies") {
      chrome.cookies.getAll({}, function(cookies) {
        sendResponse({cookies: cookies});
      });
      return true;
    }
  });