from flask import Flask
from flask_restful import reqparse, abort, Api, Resource
import tbselenium.common as cm
from tbselenium.tbdriver import TorBrowserDriver
import cachetools.func
import numpy as np

app = Flask(__name__)
api = Api(app)

LANGUAGE_SUPPORT = ["de", "en", "en-US", "ru"]  # Requested languages, just an abstract for now
REQUESTEDLANGUAGE = []

parser = reqparse.RequestParser()
parser.add_argument('lang')


@cachetools.func.ttl_cache(maxsize=6400, ttl=60 * 60 * 24)
def FakeHeader(lang):
    # Here we need to pass a dict, which will be made to a json response containing
    # the user agent, encoding and language which fits perfectly

    # 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36';
    # driver = TorBrowserDriver("tor-browser_en-US/", tor_cfg=cm.USE_RUNNING_TOR, socks_port=9150)
    # driver.get('https://check.torproject.org')
    # driver.load_url("https://check.torproject.org", wait_on_page=3)
    # print(driver.find_element_by("h1.on").text)
    test = np.random.normal(1000, 5, 1)
    test = np.round(test)
    accept_encoding = "gzip, deflate, br" + str(test)
    user_agent = "Mozilla/5.0 (Windows NT 6.1; rv:52.0) Gecko/20100101 Firefox/52.0"
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
