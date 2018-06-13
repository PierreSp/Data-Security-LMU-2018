from flask import Flask
from flask_restful import reqparse, abort, Api, Resource

app = Flask(__name__)
api = Api(app)

LANGUAGE_SUPPORT = ["de", "en", "en-US", "ru"]
REQUESTEDLANGUAGE = []


def Mobiledata(lang):
    # Here we need to pass a dict, which will be made to a json response containing
    # the user agend, encoding and language which fits perfectly
    return "tbd"


def abort_if_invalid_country(lang):
    if str(lang) not in LANGUAGE_SUPPORT:
        abort(410, message="Video does exist and shall not be deleted")


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
        return Mobiledata(lang)


# shows a list of all sipported languages
class Supported_languages(Resource):

    def get(self):
        return LANGUAGE_SUPPORT


api.add_resource(Supported_languages, '/browserreq')
api.add_resource(BrowserRequest, '/browserreq/<lang>')
api.add_resource(Supported_languages, '/mobilereq')
api.add_resource(MobileRequest, '/mobilereq/<lang>')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
