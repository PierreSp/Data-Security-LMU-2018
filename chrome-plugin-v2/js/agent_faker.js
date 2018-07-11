
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {
        // chrome.contentSettings['javascript'].set({
        //     primaryPattern: "https://panopticlick.eff.org/",
        //     setting: 'block'
        // });
    //     var test = chrome.contentSettings['javascript'].get({
    //     primaryUrl: "https://panopticlick.eff.org/"
    // }, function (details) {
    //     chrome.contentSettings['javascript'].set({
    //         primaryPattern: "<all_urls>",
    //         setting: details.setting = 'block' 
    //     })
    // })

// chrome.contentSettings['javascript'].get({ primaryUrl: "https://google.de/"}, function(details) {
//   const value = details.setting;
//   alert(value);
// });
// chrome.contentSettings['javascript'].get({ primaryUrl: "https://panopticlick.eff.org/"}, function(details) {
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
                // header.value = "Mozilla/5.0 (Windows NT 6.1; rv:52.0) Gecko/20100101 Firefox/52.0";
            }
            if (header.name.toLowerCase() == 'accept') { 
                header.value = resp["accept_code"];
                // header.value = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8";
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
        // Modify the headers for these pages
        urls: [
            "<all_urls>"
        ],
        // In the main window and frames
        types: ["main_frame", "sub_frame"]
    },
    ["blocking", "requestHeaders"]
);