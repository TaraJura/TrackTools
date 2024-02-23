chrome.runtime.sendMessage({action: "getCookies"}, function(response) {
    console.log(response.cookies);
  });