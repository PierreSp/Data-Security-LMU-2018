chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {
        //alert(JSON.stringify(info));
        // Replace the User-Agent header
        var headers = info.requestHeaders;
        //headers.delete("X-DevTools-Emulate-Network-Conditions-Client-Id");
        var req = new XMLHttpRequest();
        req.open(
                "GET",
                "http://localhost:1991/browserreq/de", false);
        //req.onreadystatechange = function() {
        //  if (req.readyState == 4) {
            // Wait till done and do not let attack code work here
        //    var resp = JSON.parse(req.responseText);
        //  }
        //}
        req.send(null);
        var resp = JSON.parse(req.responseText);
        //alert(JSON.stringify(resp));
        headers.forEach(function(header, i) {
            if (header.name.toLowerCase() == 'user-agent') { 
                header.value = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36';
            }
            if (header.name.toLowerCase() == 'accept') { 
                //alert("changing");
                header.value = '';
            }
            if (header.name.toLowerCase() == 'accept-language') { 
                header.value = 'en en_US;q=0.5';
            }
            if (header.name.toLowerCase() == 'accept-encoding') { 
                header.value = '';
            }
            if (header.name.toLowerCase() == 'referer') { 
                header.value = '';
            }
          
        });  
        return {requestHeaders: headers};
    },
    // Request filter
    {
        // Modify the headers for these pages
        urls: [
            "https://www.whoishostingthis.com/*",
            "http://127.0.0.1:6789/*",
            "http://www.useragentstring.com/index.php",
            "http://www.useragentstring.com/*",
            "https://panopticlick.eff.org/*",
            "<all_urls>"
        ],
        // In the main window and frames
        types: ["main_frame", "sub_frame"]
    },
    ["blocking", "requestHeaders"]
);