
chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
    for(var i=0; i < details.requestHeaders.length; ++i){
        if(details.requestHeaders[i].name === "User-Agent"){
            details.requestHeaders[i].value = "Hello LMU";

            break;
        }
    }
    return {requestHeaders: details.requestHeaders};
}, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]);

let checkPage = document.getElementById('checkPage');
  
  checkPage.onclick = function(element) {
    console.log("hi");
var targetPage = "http://useragentstring.com/*";
var ua = "Opera/9.80 (X11; Linux i686; Ubuntu/14.10) Presto/2.12.388 Version/12.16";

function rewriteUserAgentHeader(e) {
  e.requestHeaders.forEach(function(header){
    if (header.name.toLowerCase() == "user-agent") {
      header.value = ua;
    }
  });
  return {requestHeaders: e.requestHeaders};
}

browser.webRequest.onBeforeSendHeaders.addListener(
  rewriteUserAgentHeader,
  {urls: [targetPage]},
  ["blocking", "requestHeaders"]
);

  };