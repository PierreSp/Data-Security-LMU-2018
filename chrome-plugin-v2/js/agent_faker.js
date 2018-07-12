
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {

// chrome.contentSettings['javascript'].get({ primaryUrl: "https://google.de/"}, function(details) {
//   const value = details.setting;
//   alert(value);
// });
        
        var headers = info.requestHeaders;
        var req = new XMLHttpRequest();
        req.open(
                "GET",
                "http://localhost:1991/browserreq/de", false);
        req.send(null);
        var resp = JSON.parse(req.responseText); // Parse to get json object, and avoid attacks
        headers.forEach(function(header, i) {
            if (header.name.toLowerCase() == 'user-agent') { 
                header.value = resp["user_agent"];
            }
            if (header.name.toLowerCase() == 'accept') { 
                header.value = resp["accept_code"];
                // header.value = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"; // tmp solution
            }
            if (header.name.toLowerCase() == 'accept-language') { 
                header.value = resp["accept_lang"];
            }
            if (header.name.toLowerCase() == 'accept-encoding') { 
                header.value = resp["accept_encoding"]; // Chrome does not use that as string
            }
            if (header.name.toLowerCase() == 'referer') { 
                // The referer should be set to '' to provide maximal annonymity
                header.value = '';
            }
          
        });  

        return {requestHeaders: headers};
    },
    // Request filter
    {
        // Modify the header for each and every page
        urls: [
            "<all_urls>"
        ],
        // In the main window and frames
        types: ["main_frame", "sub_frame"]
    },
    ["blocking", "requestHeaders"]
);