chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {
        //alert(JSON.stringify(info));
        // Replace the User-Agent header
        var headers = info.requestHeaders;
        // var req = new XMLHttpRequest();
        // req.open(
        //         "GET",
        //         "http://localhost:1991/browserreq/de", false);
        // //req.onreadystatechange = function() {
        // //  if (req.readyState == 4) {
        //     // Wait till done
        // //    var resp = JSON.parse(req.responseText);
        // //  }
        // //}
        // req.send(null);
        var resp = JSON.parse(req.responseText); // Parse to get json object, and avoid attacks
        
        headers.forEach(function(header, i) {
            if (header.name.toLowerCase() == 'user-agent') { 
                // header.value = JSON.stringify(resp["user_agent"]);
                header.value = "Mozilla/5.0 (Windows NT 6.1; rv:52.0) Gecko/20100101 Firefox/52.0";
            }
            if (header.name.toLowerCase() == 'accept') { 
                //alert("changing"); text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
                // header.value = JSON.stringify(resp["accept"]);
                header.value = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8";
    
            }
            if (header.name.toLowerCase() == 'accept-language') { 
                header.value = '';
            }
            if (header.name.toLowerCase() == 'accept-encoding') { 
                // header.value = JSON.stringify(resp["accept_encoding"]);
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
            "https://panopticlick.eff.org/*",
            "<all_urls>"
        ],
        // In the main window and frames
        types: ["main_frame", "sub_frame"]
    },
    ["blocking", "requestHeaders"]
);