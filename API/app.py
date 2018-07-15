from flask import Flask
import tbselenium.common as cm
from tbselenium.tbdriver import TorBrowserDriver
import cachetools.func
# import numpy as np
from flask_restful import reqparse, abort
from flask_restful_swagger_2 import Api, Resource
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Needed for cross communication
api = Api(app, api_version='1.0')  # Make nice versioning

# Requested languages, just an proof of concept for now
LANGUAGE_SUPPORT = ["de", "en", "en-US", "ru"]
REQUESTEDLANGUAGE = []

parser = reqparse.RequestParser()
parser.add_argument('lang')


@cachetools.func.ttl_cache(maxsize=10000, ttl=7 * 60 * 60 * 24)
def FakeHeader(lang):
    # Here we need to pass a dict, which will be made to a json response containing
    # the user agent, encoding and language which fits perfectly
    # The crawled information are cached for 7 days

    # Connect with tor browser and load amiunique or panopticlick (without js) and load
    # full list
    driver = TorBrowserDriver("../tor-browser_en-US/",
                              tor_cfg=cm.USE_RUNNING_TOR, socks_port=9150)
    driver.get("https://amiunique.org/fpNoJs")
    user_agent = driver.find_elements_by_xpath(
        '//td[@id="userAgentHttpVal"]')[0].text.replace('"', '')
    accept = driver.find_elements_by_xpath(
        '//td[@id="acceptHttpVal"]')[0].text.replace('"', '')
    accept_encoding = driver.find_elements_by_xpath(
        '//td[@id="encodingHttpVal"]')[0].text.replace('"', '')
    accept_lang = driver.find_elements_by_xpath(
        '//td[@id="languageHttpVal"]')[0].text.replace('"', '')

    # Panopticlick version


    # driver.get("https://panopticlick.eff.org/tracker-nojs")
    # time.sleep(30)
    # WebDriverWait(driver, 20).until(
    #     EC.presence_of_element_located((By.ID, "showFingerprintLink2")))
    # element = driver.find_element_by_id("showFingerprintLink2")
    # element.send_keys(Keys.RETURN)
    # table = driver.find_element_by_id("fingerprintTable")

    # # Read out table and get all information we want to spoof
    # table_string = table.text
    # # find and scrape user agent value
    # user_agent = re.findall(
    #     '(?<=Mozilla)(.*?)(?=\nTouch Support)', table_string, flags=re.DOTALL)[0]
    # # user_agent[(user_agent.rfind('\n') + 1):]
    # user_agent = "Mozilla" + str(user_agent)

    # # find and scrape HTTP accept headers value
    # accept_headers = re.findall(
    #     '(?<=HTTP_ACCEPT Headers)(.*?)(?=\nHash of WebGL fingerprint)', table_string, flags=re.DOTALL)[0]
    # accept_headers = accept_headers[(accept_headers.rfind('\n') + 1):]

    # # extract accept_lang value from HTTP accept headers
    # accept_lang = accept_headers[(accept_headers.rfind(' ') + 1):]

    # # extract accept_encoding value from the rest of HTTP accept headers value
    # accept_headers_rest = accept_headers[:(accept_headers.rfind(' '))]

    # start_accept_encoding = len(accept_headers_rest)
    # if 'gzip' in accept_headers_rest:
    #     if accept_headers_rest.find('gzip') < start_accept_encoding:
    #         start_accept_encoding = accept_headers_rest.find('gzip')
    # if 'compress' in accept_headers_rest:
    #     if accept_headers_rest.find('compress') < start_accept_encoding:
    #         start_accept_encoding = accept_headers_rest.find('compress')
    # if 'deflate' in accept_headers_rest:
    #     if accept_headers_rest.find('deflate') < start_accept_encoding:
    #         start_accept_encoding = accept_headers_rest.find('deflate')
    # if 'br' in accept_headers_rest:
    #     if accept_headers_rest.find('br') < start_accept_encoding:
    #         start_accept_encoding = accept_headers_rest.find('br')
    # if 'identity' in accept_headers_rest:
    #     if accept_headers_rest.find('identity') < start_accept_encoding:
    #         start_accept_encoding = accept_headers_rest.find('identity')
    # if '*' in accept_headers_rest:
    #     if '*/*' in accept_headers_rest:
    #         if accept_headers_rest.rfind('*') == (accept_headers_rest.find('*') + 2):
    #             start_accept_encoding = start_accept_encoding
    #         else:
    #             if accept_headers_rest.rfind('*') < start_accept_encoding:
    #                 start_accept_encoding = accept_headers_rest.rfind('*')
    #     else:
    #         if accept_headers_rest.find('*') < start_accept_encoding:
    #             start_accept_encoding = accept_headers_rest.find('*')
    # accept_encoding = accept_headers_rest[start_accept_encoding:]

    # # extract accept value as the rest of HTTP accept headers value
    # accept = accept_headers_rest[:(start_accept_encoding - 1)]

    # Show information
    print("----- Overview of crawled data: -----")
    print("")
    print('accept =', str(accept))
    print('accept_encoding =', str(accept_encoding))
    print('accept_lang =', str(accept_lang))

    newheader = {"accept_encoding": str(accept_encoding),
                 "user_agent": str(user_agent), "accept_lang": str(accept_lang),
                 "accept_code": str(accept)}
    return newheader


def abort_if_invalid_country(lang):
    # Feature for languate support. Not needed now. can be seen as abstract
    if str(lang) not in LANGUAGE_SUPPORT:
        abort(410, message="Language is not supported so far")


# Mobile Area
class MobileRequest(Resource):
    # Mobile version same as regular one so far. SPecial features on Roadmap
    # for version 2

    def get(self, lang):
        abort_if_invalid_country(lang)
        return FakeHeader(lang)


class BrowserRequest(Resource):

    def get(self, lang):
        abort_if_invalid_country(lang)
        return FakeHeader(lang)


# shows a list of all supported languages (placeholder)
class Supported_languages(Resource):

    def get(self):
        return LANGUAGE_SUPPORT


api.add_resource(Supported_languages, '/langreq')
api.add_resource(BrowserRequest, '/browserreq/<lang>')
api.add_resource(MobileRequest, '/mobilereq/<lang>')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=1991)
