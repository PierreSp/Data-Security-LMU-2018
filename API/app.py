from flask import Flask
from flask_restful import reqparse, abort, Api, Resource

app = Flask(__name__)
api = Api(app)

LANGUAGE_SUPPORT = ["de", "en", "en-US", "ru"]
REQUESTEDLANGUAGE = []


def Mobiledata(lang):
    # Here we need to pass a dict, which will be made to a json response containing
    # the user agend, encoding and language which fits perfectly

    # 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36';
    accept_encoding = ""
    user_agent = ""
    accept = ""
    accept_lang = "en en_US;q=0.5"  # lang
    newheader = {"accept_encoding": accept_encoding, "accept": accept,
                 "user_agent": user_agent, "accept_lang": accept_lang}
    return newheader


def Browserdata(lang):
    # Here we need to pass a dict, which will be made to a json response containing
    # the user agend, encoding and language which fits perfectly

    # 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36';
    accept_encoding = ""
    user_agent = ""
    accept = ""
    accept_lang = "en en_US;q=0.5"  # lang
    newheader = {"accept_encoding": accept_encoding, "accept": accept,
                 "user_agent": user_agent, "accept_lang": accept_lang}
    return newheader


def abort_if_invalid_country(lang):
    if str(lang) not in LANGUAGE_SUPPORT:
        abort(410, message="Language is not supported so far")


parser = reqparse.RequestParser()
parser.add_argument('lang')


# Mobile Area
class MobileRequest(Resource):

    def get(self, lang):
        abort_if_invalid_country(lang)
        return Mobiledata(lang)

    # def put(self, lang):
    # Not needed so far
    #     args = parser.parse_args()
    #     lang = {'language': args['lang']}
    #     return lang, 201


class BrowserRequest(Resource):

    def get(self, lang):
        abort_if_invalid_country(lang)
        return Browserdata(lang)


# shows a list of all supported languages
class Supported_languages(Resource):

    def get(self):
        return LANGUAGE_SUPPORT


api.add_resource(Supported_languages, '/langreq')
api.add_resource(BrowserRequest, '/browserreq/<lang>')
api.add_resource(MobileRequest, '/mobilereq/<lang>')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=1991)
