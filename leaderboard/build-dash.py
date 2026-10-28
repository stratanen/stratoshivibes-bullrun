# Puts dash.html into worker.js as the DASH_HTML constant (run after editing dash.html).
import json, re, pathlib
here = pathlib.Path(__file__).parent
w = (here / 'worker.js').read_text()
html = (here / 'dash.html').read_text()
mark = '\n// ---------- stats page (generated from dash.html by build-dash.py) ----------\n'
w = w.split(mark)[0].rstrip('\n') + '\n' + mark + 'const DASH_HTML = ' + json.dumps(html, ensure_ascii=False) + ';\n'
(here / 'worker.js').write_text(w)
