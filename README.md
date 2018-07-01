# Data Security Plugin

This is the chrome based plugin of the 2018 Data Security Class project about browser tracking. The plugin tries to spoof fingerprinting to achieve a high anonymity. For this several features are spoofed (see list). As the user agent spoofing requieres a very common browser, we simulate the Tor Browser, which is in combination with language, encoding and OS the most common browser in the web. 

If every user of the plugin would have to get the information from the Tor Browser, this would generate huge amounts of traffic, slow down loading and would be illegal as it would send large amounts of traffic to a specific website. As there are regular updates of the Tor Browser a static solution is also not possible.

Because of that we decided to get the information of the Tor Browser by remote controlling the Tor Browser on a central service, which allows caching (the headers of the Tor Browser is grabbed only once), updates and is important for future work.

### How to run

1. Run the API (Assumes a linux system)
    1. Install requirements.txt in API/ on a virtual env (make sure geckodriver version 17 is installed)
    1. Run python api.py in API/ (for development and testing only, for productive systems use gunicorn with nginx proxy)
1. Activate the plugin
   1. Run chrome://extensions in chrome browser
   1. Drag the plugin folder in the chrome browser
   1. Activate the plugin in chrome


 This plugin is also using the Canvas Defender Plugin (https://github.com/jomo/canvas-defender-firefox) for the detection of the fingerprinting. 

