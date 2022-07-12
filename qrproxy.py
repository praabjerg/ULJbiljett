#!/usr/bin/python3

import requests
#import http.server
from http.server import BaseHTTPRequestHandler, HTTPServer
from uritools import urisplit

hostname = "localhost"
PORT = 8000

class QRServer(BaseHTTPRequestHandler):
    def do_GET(self):
        query = urisplit(self.path).getquerydict()
        biljettlist = query.get('biljettnr')
        prislist = query.get('pris')
        if biljettlist != None and prislist != None and len(biljettlist) > 0 and len(prislist) > 0:
            biljettstr = biljettlist[0]
            prisstr = prislist[0]
            if biljettstr.isnumeric() and prisstr.isnumeric():
                print('Requesting QR for biljettnr ' + biljettstr + ' and pris ' + prisstr)
                pris = int(prisstr)
                resp = requests.post('https://mpc.getswish.net/qrg-swish/api/v1/prefilled', json={
                    'format': 'svg',
                    'payee': {
                        'value': '1234880530',
                        'editable': True
                    },
                    'amount': {
                        'value': pris,
                        'editable': True
                    },
                    'message': {
                        'value': biljettstr,
                        'editable': True
                    }
                })
                self.send_response(200)
                self.send_header("Content-type", "image/svg+xml")
                self.end_headers()
                self.wfile.write(resp.content)
            else:
                self.send_response(400)
                self.end_headers()
        else:
            self.send_response(400)
            self.end_headers()

if __name__ == "__main__":
    webServer = HTTPServer((hostname, PORT), QRServer)
    print("Server started http://%s:%s" % (hostname, PORT))

    try: webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
