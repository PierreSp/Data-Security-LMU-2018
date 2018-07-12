const storageSet = chrome.storage.local.set;
const storageGet = chrome.storage.local.get;
const HashLength = 30;
const NotificationTimer = 5000;
const NotificationInfo = {
    newHash: { title: "Data security plugin is active" },
    detected: { title: "Possible fingerprinting attempt" },
};
const DisabledDomains = {};
let data;
let dataHash;
let g_latestUpdate;
let docId = getRandomString();

storageSet({docId});

storageGet(["data", "enabled", "latestUpdate"], (items = {})=>{
    const {enabled = true, latestUpdate = 0} = items;
    console.log(enabled);
    g_latestUpdate = latestUpdate;
    data = items["data"];
    setIcon(enabled);
    
    generateNewFingerPrint()
        .then((generatedHash)=>{
            dataHash = generatedHash;
        });
    
});

// Playing with fonts 

// chrome.fontSettings.getFontList(function(f_array){
//     console.log(f_array);
//     for(var font in f_array) {
//         console.log(font[0]);

//         if (font.fontId == "Wingdings 2")
//         {
//             console.log("found webdings2");
//         }
//         else if(font.fontId == "Wingdings 2")
//         {
//             console.log("found webdings3");
//         }
//         // else
//         // {
//         //     chrome.fontSettings.clearFont(font);
//         // }
//         // properties[property] = vecw({}, true);
//     }
// })


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "panel-data-hash") {
        sendResponse({dataHash, "latestUpdate": g_latestUpdate});
    } else if (request.action === "generate-fingerprint") {
        generateNewFingerPrint()
            .then((generatedHash)=>{
                dataHash = generatedHash;
                notifyUser(NotificationInfo.newHash.title, "New canvas noise hash #" + dataHash);
            });
    } else if (request.action === "open-info") {
        chrome.tabs.create({url: "https://multiloginapp.com?utm_source=canvasdefender-gc"});
    } else if (request.action === "open-options") {
        chrome.tabs.create({url: chrome.extension.getURL("/html/options.html")});
    } else if (request.action === "show-notification"){
        generateNewFingerPrint()
            .then((generatedHash)=>{
                dataHash = generatedHash;
            });        
        var root_domain = request.url.split( '/' );
        root_domain = root_domain[2];
        var pattern_to_forbid = "*://" + root_domain + "/*"; // Create pattern to send to chrome api to block
        // alert(pattern_to_forbid);https://firstpartysimulator.org
        // Here we have code to disable JS if canvas creation is detected. 
        // But disabled too many pages including fb, whatsapp,...
    //  var test = chrome.contentSettings['javascript'].get({
    //     primaryUrl: "https://" + root_domain + "/"
    // }, function (details) {
    //     chrome.contentSettings['javascript'].set({
    //         primaryPattern: pattern_to_forbid,
    //         setting: details.setting = 'block' 
    //     })
    // })
    //    var test = chrome.contentSettings['javascript'].get({
    //     primaryUrl: "https://firstpartysimulator.org/"
    // }, function (details) {
    //     chrome.contentSettings['javascript'].set({
    //         primaryPattern: "*://firstpartysimulator.org/*",
    //         setting: details.setting = 'block' 
    //     })
    // })


        notifyUser(NotificationInfo.detected.title, `Possible attempt of reading canvas fingerprint is detected on ${root_domain} website.`, root_domain);
    }
});

setInterval(()=>{
    storageGet(["timer", "latestUpdate"], (elems = {})=>{
        const {timer = -1, latestUpdate = 0} = elems;
        if ((timer|0)=== -1) {
            storageSet({"latestUpdate": g_latestUpdate});
            return;
        }
        const currentTime = Date.now();
        if (currentTime - latestUpdate > (timer|0) * 60 * 1000){
            generateNewFingerPrint()
                .then((generatedHash)=>{
                    dataHash = generatedHash;
                    g_latestUpdate = currentTime;
                    return storageSet({"latestUpdate": g_latestUpdate});
                })
                .then(_=>{
                    console.log("Saved", dataHash, currentTime);
                });
        }
    });
}, 30 * 1000);

function setIcon(enabled){
    const path = chrome.extension.getURL(`/img/16x16${enabled? "" : "_inactive"}.png`);
    chrome.browserAction.setIcon({path})
}

function generateNewFingerPrint() {
    return new Promise((success, fail)=>{
        data = {};
        data.r = HashLength - randomIntFromInterval(0, HashLength + 10);
        data.g = HashLength - randomIntFromInterval(0, HashLength + 10);
        data.b = HashLength - randomIntFromInterval(0, HashLength + 10);
        data.a = HashLength - randomIntFromInterval(0, HashLength + 10);
        const jsonData = JSON.stringify(data);
        g_latestUpdate = Date.now();
        storageSet({"data": jsonData, "latestUpdate": g_latestUpdate}, ()=>{
            success(md5(jsonData).substring(0, HashLength));
        });
    })
    
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomString() {
    var text = "";
    var charset = "abcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < 5; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}

function needShow(url) {
    const aTag = document.createElement("a");
    aTag.href = url;
    if (!(aTag.hostname in DisabledDomains)) {
        DisabledDomains[aTag.hostname] = "";
        return true;
    }
    return false;
}

function notifyUser(title, message, url) {
    var options = {
        type: "basic", title,
        message: message,
        iconUrl: "img/64x64.png"
    };

    if (url) {
        if (needShow(url)) {
            chrome.notifications.create(`canvas-defender-${getRandomString()}`, options, (notificationId)=>{
                setTimeout(()=>{
                    chrome.notifications.clear(notificationId, ()=>{
                        console.log("cleared", notificationId);
                    });
                }, NotificationTimer);
            });
        } else {
            console.log("NO NEED");
        }
    } else {
        chrome.notifications.create("canvas-defender", options, (notificationId)=>{});
    }
}