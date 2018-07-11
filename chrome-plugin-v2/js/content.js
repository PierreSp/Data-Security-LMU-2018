const storageGet = chrome.storage.local.get;
const TimeoutDelay = 2 * 1000;

let allowInjection = true;
let storedObjectPrefix = getRandomString();
let storageElems;
let notificationTimeoutID;


if (window.frameElement != null && window.frameElement.sandbox != null) {
    allowInjection = false;
    for (let i = 0; i < window.frameElement.sandbox.length; i++) {
        const val = window.frameElement.sandbox[i];
        if (val == 'allow-scripts') {
            allowInjection = true;
        }
    }
}

if (allowInjection) {
    storageGet(["docId", "data", "enabled", "whitelist"], (elems)=>{
        const {docId, data, enabled = true, whitelist = {}} = elems || {};
        if (inWhiteList(whitelist) || !data){
            return;
        }
        storageElems = elems;
        if (enabled) {
            overrideMethods(docId, JSON.parse(data));
        } else {
            restoreMethods(docId, JSON.parse(data));
        }
    });
}

function inWhiteList(whitelist) {
    if (window.location.href in whitelist){
        return true
    }
    const {hostname, host} = window.location;
    if (hostname in whitelist || host in whitelist) {
        return true;
    }
    return false;
}

function overrideMethods(docId, data) {
    const script = document.createElement('script');
    script.id = getRandomString();
    script.type = "text/javascript";
    if (allowInjection) {
        var newChild = document.createTextNode('try{(' + overrideDefaultMethods + ')(' + data.r + ',' + data.g + ',' + data.b + ',' + data.a + ',"' + script.id + '", "' + storedObjectPrefix + '");} catch (e) {console.error(e);}');
        script.appendChild(newChild);
        var node = (document.documentElement || document.head || document.body);
        if (typeof node[docId] === 'undefined') {
            node.insertBefore(script, node.firstChild);
            node[docId] = getRandomString();
        }
    }
}

function restoreMethods(docId, data) {
    const script = document.createElement('script');
    script.id = getRandomString();
    script.type = "text/javascript";
    if (allowInjection) {
        var newChild = document.createTextNode('try{(' + restoreDefaultMethods + ')(' + data.r + ',' + data.g + ',' + data.b + ',' + data.a + ',"' + script.id + '", "' + storedObjectPrefix + '");} catch (e) {console.error(e);}');
        script.appendChild(newChild);
        var node = (document.documentElement || document.head || document.body);
        if (node[docId]) {
            node.insertBefore(script, node.firstChild);
            delete node[docId];
        }
    }
}

function getRandomString() {
    var text = "";
    var charset = "abcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < 5; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}

function showNotification() {
    console.log("showNotification");
    chrome.runtime.sendMessage({action: "show-notification", url: window.location.href});
}

(function addBodyListener() {
    window.addEventListener(storedObjectPrefix + "_show_notification", (evt)=>{
        if (notificationTimeoutID) {
            clearTimeout(notificationTimeoutID);
        }
        notificationTimeoutID = setTimeout(showNotification, TimeoutDelay)
    });
})();

function overrideDefaultMethods(r, g, b, a, scriptId, storedObjectPrefix) {
    var scriptNode = document.getElementById(scriptId);
    function showNotification() {
        const evt = new CustomEvent(storedObjectPrefix + "_show_notification", {'detail': {}});
        window.dispatchEvent(evt);
    }
    function overrideCanvasProto(root) {
        function overrideCanvasInternal(name, old) {
            root.prototype[storedObjectPrefix + name] = old;
            Object.defineProperty(root.prototype, name,
                {
                    value: function () {
                        var width = this.width;
                        var height = this.height;
                        var context = this.getContext("2d");
                        var imageData = context.getImageData(0, 0, width, height);
                        for (var i = 0; i < height; i++) {
                            for (var j = 0; j < width; j++) {
                                var index = ((i * (width * 4)) + (j * 4));
                                imageData.data[index + 0] = imageData.data[index + 0] + r;
                                imageData.data[index + 1] = imageData.data[index + 1] + g;
                                imageData.data[index + 2] = imageData.data[index + 2] + b;
                                imageData.data[index + 3] = imageData.data[index + 3] + a;
                            }
                        }
                        context.putImageData(imageData, 0, 0);
                        showNotification();
                        return old.apply(this, arguments);
                    }
                }
            );
        }
        overrideCanvasInternal("toDataURL", root.prototype.toDataURL);
        overrideCanvasInternal("toBlob", root.prototype.toBlob);
        //overrideCanvasInternal("mozGetAsFile", root.prototype.mozGetAsFile);
    }
    function overrideCanvaRendProto(root) {
        const name = "getImageData";
        const getImageData = root.prototype.getImageData;

        root.prototype[storedObjectPrefix + name] = getImageData;

        Object.defineProperty(root.prototype, "getImageData",
            {
                value: function () {
                    var imageData = getImageData.apply(this, arguments);
                    var height = imageData.height;
                    var width = imageData.width;
                    // console.log("getImageData " + width + " " + height);
                    for (var i = 0; i < height; i++) {
                        for (var j = 0; j < width; j++) {
                            var index = ((i * (width * 4)) + (j * 4));
                            imageData.data[index + 0] = imageData.data[index + 0] + r;
                            imageData.data[index + 1] = imageData.data[index + 1] + g;
                            imageData.data[index + 2] = imageData.data[index + 2] + b;
                            imageData.data[index + 3] = imageData.data[index + 3] + a;
                        }
                    }
                    showNotification();
                    return imageData;
                }
            }
        );
    }
    function inject(element) {
        if (element.tagName.toUpperCase() === "IFRAME" && element.contentWindow) {
            try {
                var hasAccess = element.contentWindow.HTMLCanvasElement;
            } catch (e) {
                console.log("can't access " + e);
                return;
            }
            overrideCanvasProto(element.contentWindow.HTMLCanvasElement);
            overrideCanvaRendProto(element.contentWindow.CanvasRenderingContext2D);
            overrideDocumentProto(element.contentWindow.Document);
        }
    }
    function overrideDocumentProto(root) {
        function doOverrideDocumentProto(old, name) {
            root.prototype[storedObjectPrefix + name] = old;
            Object.defineProperty(root.prototype, name,
                {
                    value: function () {
                        var element = old.apply(this, arguments);
                        // console.log(name+ " everridden call"+element);
                        if (element == null) {
                            return null;
                        }
                        if (Object.prototype.toString.call(element) === '[object HTMLCollection]' ||
                            Object.prototype.toString.call(element) === '[object NodeList]') {
                            for (var i = 0; i < element.length; ++i) {
                                var el = element[i];
                                // console.log("elements list inject " + name);
                                inject(el);
                            }
                        } else {
                            // console.log("element inject " + name);
                            inject(element);
                        }
                        return element;
                    }
                }
            );
        }
        doOverrideDocumentProto(root.prototype.createElement, "createElement");
        doOverrideDocumentProto(root.prototype.createElementNS, "createElementNS");
        doOverrideDocumentProto(root.prototype.getElementById, "getElementById");
        doOverrideDocumentProto(root.prototype.getElementsByName, "getElementsByName");
        doOverrideDocumentProto(root.prototype.getElementsByClassName, "getElementsByClassName");
        doOverrideDocumentProto(root.prototype.getElementsByTagName, "getElementsByTagName");
        doOverrideDocumentProto(root.prototype.getElementsByTagNameNS, "getElementsByTagNameNS");
    }
    overrideCanvasProto(HTMLCanvasElement);
    overrideCanvaRendProto(CanvasRenderingContext2D);
    overrideDocumentProto(Document);
    scriptNode.parentNode.removeChild(scriptNode);
}


function restoreDefaultMethods(r, g, b, a, scriptId, storedObjectPrefix) {
    var scriptNode = document.getElementById(scriptId);
    function overrideCanvasProto(root) {
        function overrideCanvasInternal(name, old) {
            root.prototype[name] = root.prototype[storedObjectPrefix + name];
        }
        overrideCanvasInternal("toDataURL", root.prototype.toDataURL);
        overrideCanvasInternal("toBlob", root.prototype.toBlob);
        //overrideCanvasInternal("mozGetAsFile", root.prototype.mozGetAsFile);
    }
    function overrideCanvaRendProto(root) {
        const name = "getImageData";
        root.prototype[name] = root.prototype[storedObjectPrefix + name];
    }
    function inject(element) {
        if (element.tagName.toUpperCase() === "IFRAME" && element.contentWindow) {
            try {
                var hasAccess = element.contentWindow.HTMLCanvasElement;
            } catch (e) {
                console.log("can't access " + e);
                return;
            }
            overrideCanvasProto(element.contentWindow.HTMLCanvasElement);
            overrideCanvaRendProto(element.contentWindow.CanvasRenderingContext2D);
            overrideDocumentProto(element.contentWindow.Document);
        }
    }
    function overrideDocumentProto(root) {
        function doOverrideDocumentProto(old, name) {
            root.prototype[name] = root.prototype[storedObjectPrefix + name];
        }
        doOverrideDocumentProto(root.prototype.createElement, "createElement");
        doOverrideDocumentProto(root.prototype.createElementNS, "createElementNS");
        doOverrideDocumentProto(root.prototype.getElementById, "getElementById");
        doOverrideDocumentProto(root.prototype.getElementsByName, "getElementsByName");
        doOverrideDocumentProto(root.prototype.getElementsByClassName, "getElementsByClassName");
        doOverrideDocumentProto(root.prototype.getElementsByTagName, "getElementsByTagName");
        doOverrideDocumentProto(root.prototype.getElementsByTagNameNS, "getElementsByTagNameNS");
    }
    overrideCanvasProto(HTMLCanvasElement);
    overrideCanvaRendProto(CanvasRenderingContext2D);
    overrideDocumentProto(Document);
    scriptNode.parentNode.removeChild(scriptNode);
}


// Plugin Privacy extension for Chrome by Ben Caller
// Thanks to https://stackoverflow.com/questions/23202136/changing-navigator-useragent-using-chrome-extension
var pluginPrivacy = '(' + function () {
    'use strict';
    //Set the following line to false in order to hide the Flash plugin
    //This may prevent websites which use Flash from working
    var ALLOW_FLASH = false;
    
    if(!window.navigator.mimeTypes) return;
    
    function vecw(val, e, c, w) {
        // Makes an object describing a property
        return {
            value: val,
            enumerable: !!e,
            configurable: !!c,
            writable: !!w
        }
    }
    
    var properties = {};
    for(var property in window.navigator) {
        var val = window.navigator[property];
        properties[property] = vecw(typeof(val) == 'function' ? val.bind(window.navigator) : val)
    }
    properties.mimeTypes = vecw({}, true);
    properties.plugins = vecw({}, true);
    properties.userAgent = vecw({}, true);
    // properties.platform = vecw(function (){return "Win32";}, false);

    
    Object.defineProperty(properties.plugins.value, "refresh", vecw(function() {}));
    
    //Expose Flash
    var flashMime = ALLOW_FLASH && window.navigator.mimeTypes["application/x-shockwave-flash"];
    if(flashMime) {
        var flash = flashMime.enabledPlugin;
        Object.defineProperties(properties.mimeTypes.value, {
            'length': vecw(1),
            "application/x-shockwave-flash": vecw(flashMime, true),
            0: vecw(flashMime)
        })
        Object.defineProperties(properties.plugins.value, {
            'length': vecw(1),
            0: vecw(flash)
        })
        Object.defineProperty(properties.plugins.value, flash["name"], vecw(flash, true))
    } else {
        //Empty 'arrays'
        Object.defineProperty(properties.plugins.value, 'length', vecw(0))
        Object.defineProperty(properties.userAgent.value, 'length', vecw(0))
        Object.defineProperty(properties.mimeTypes.value, 'length', vecw(0))
    }
    
    var navigator = Object.create(window.navigator);
    Object.defineProperties(navigator, properties);
    try {
        Object.defineProperty(window, 'navigator', vecw(navigator));
        console.log("PluginPrivacy has removed the plugins and mimeTypes", location.href)
    } catch(e) {/*Cannot redefine property: navigator*/}


    // var USERAGENT = '';
    // var VENDOR = '';
    // var PLATFORM = 'Win32';

    // var defProp = function (prop, value) {
    //     Object.defineProperty(window.navigator, prop, {
    //         get: function () {
    //             return value;
    //         }
    //     });
    // };

    // defProp('userAgent', USERAGENT);
    // defProp('appVersion', USERAGENT);
    // defProp('vendor', VENDOR);
    // defProp('platform', PLATFORM);
} + ')();';

//Without CSP
document.documentElement.setAttribute('onreset', pluginPrivacy);
document.documentElement.dispatchEvent(new CustomEvent('reset'));
document.documentElement.removeAttribute('onreset');

//With CSP
var script = document.createElement('script');
script.textContent = pluginPrivacy;
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);


// var s = document.createElement('script');
// s.src = chrome.extension.getURL('js/spoof_agent_js.js');
// s.onload = function() {
//     this.parentNode.removeChild(this);
// };
// (document.head||document.documentElement).appendChild(s);
// s.parentNode.removeChild(s);
