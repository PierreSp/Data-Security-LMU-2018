from flask import Flask
import tbselenium.common as cm
from tbselenium.tbdriver import TorBrowserDriver
import cachetools.func
import numpy as np
from flask_restful import reqparse, abort
from flask_restful_swagger_2 import Api, Resource, Schema, swagger
from flask_cors import CORS
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import re
import time

app = Flask(__name__)
CORS(app)
api = Api(app, api_version='0.1')

# Requested languages, just an abstract for now
LANGUAGE_SUPPORT = ["de", "en", "en-US", "ru"]
REQUESTEDLANGUAGE = []

parser = reqparse.RequestParser()
parser.add_argument('lang')


class NewRequest(Schema):
    type = 'language'
    format = 'txt'


class NewHeader(Schema):
    type = 'object'
    properties = {
        'accept_encoding': {
            'type': 'string',
        },
        'user_agent': {
            'type': 'string'
        },
        'accept_lang': {
            'type': 'string'
        },
        'name': {
            'accept_code': 'string'
        }
    }
    required = ['lang']


@swagger.doc({
    'tags': ['Request'],
    'description': 'Generates common headers',
    'parameters': [
        {
            'lang': 'text',
            'schema': NewRequest,
            'required': True,
        }
    ],
    'responses': {
        '201': {
            'description': 'Send new header',
            'schema': NewHeader,
        }
    }
})
@cachetools.func.ttl_cache(maxsize=6400, ttl=60 * 60 * 24)
def FakeHeader(lang):
    # Here we need to pass a dict, which will be made to a json response containing
    # the user agent, encoding and language which fits perfectly

    driver = TorBrowserDriver("../tor-browser_en-US/",
                              tor_cfg=cm.USE_RUNNING_TOR, socks_port=9150)
    # driver.get('https://check.torproject.org')
    # driver.load_url("https://check.torproject.org", wait_on_page=3)
    # print(driver.find_element_by("h1.on").text)
    driver.get("https://panopticlick.eff.org/tracker-nojs")
    time.sleep(30)
    wait = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.ID, "showFingerprintLink2")))
    element = driver.find_element_by_id("showFingerprintLink2")
    element.send_keys(Keys.RETURN)

    table = driver.find_element_by_id("fingerprintTable")

    table_string = table.text
    user_agent = re.findall(
        '(?<=User Agent)(.*?)(?=\nTouch Support)', table_string, flags=re.DOTALL)
    user_agent = user_agent[0]
    user_agent = user_agent[(user_agent.rfind('\n') + 1):]
    print("USER AGENT:!!! " + str(user_agent))
    accept_encoding = "gzip, deflate, br"
    # user_agent = "Mozilla/5.0 (Windows NT 6.1; rv:52.0) Gecko/20100101 Firefox/52.0"
    accept = "text/html, */*; q=0.01"
    accept_lang = "en-US,en;q=0.5"  # lang
    newheader = {"accept_encoding": accept_encoding,
                 "user_agent": user_agent, "accept_lang": accept_lang,
                 "accept_code": accept}
    return newheader


def abort_if_invalid_country(lang):
    if str(lang) not in LANGUAGE_SUPPORT:
        abort(410, message="Language is not supported so far")


# Mobile Area
class MobileRequest(Resource):

    def get(self, lang):
        abort_if_invalid_country(lang)
        return FakeHeader(lang)

    # def put(self, lang):
    # Not needed so far
    #     args = parser.parse_args()
    #     lang = {'language': args['lang']}
    #     return lang, 201


class BrowserRequest(Resource):

    def get(self, lang):
        abort_if_invalid_country(lang)
        return FakeHeader(lang)


# shows a list of all supported languages
class Supported_languages(Resource):

    def get(self):
        return LANGUAGE_SUPPORT


api.add_resource(Supported_languages, '/langreq')
api.add_resource(BrowserRequest, '/browserreq/<lang>')
api.add_resource(MobileRequest, '/mobilereq/<lang>')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=1991)
