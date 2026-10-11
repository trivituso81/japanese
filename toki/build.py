import json, runpy
from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).parent
runpy.run_path(str(ROOT/'build_content.py'))
runpy.run_path(str(ROOT/'build_activities.py'))
data=json.loads((ROOT/'content.json').read_text())
activities=json.loads((ROOT/'activities.json').read_text())
# Everything required for learning is embedded. Only optional source links leave the app.
html='''<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#f7f5ee"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="TOKI"><meta name="description" content="A playful, iPhone-first journey through Japanese history. 90 missions, decision stories, spaced review, and saved progress."><link rel="manifest" href="./manifest.webmanifest"><link rel="apple-touch-icon" href="./icon-192.png"><link rel="icon" href="./icon-192.png"><title>TOKI - A journey through Japanese history</title><style>CSS_HERE</style></head>
<body><div class="app-shell"><div class="storage-warning" role="alert">This browser could not restore or save local progress. Use Passport to export a backup; private browsing or blocked storage may be responsible.</div><header class="topbar"><button class="brand" data-nav="journey" aria-label="TOKI, your journey"><span class="brand-mark" lang="ja">&#26178;</span>TOKI</button><div id="header-stats" class="header-stats"></div></header><main id="app" tabindex="-1" aria-label="TOKI learning content"></main><nav class="nav" aria-label="Main navigation">NAV_HERE</nav></div><div id="toast" class="toast" role="status" aria-live="polite"></div><input type="file" id="import-file" accept="application/json,.json" hidden><dialog id="confirm-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-text"><h2 id="dialog-title"></h2><p id="dialog-text"></p><div class="stack"><button id="dialog-confirm" class="btn warm"></button><button id="dialog-cancel" class="btn secondary">Keep current progress</button></div></dialog><noscript><p style="padding:30px">TOKI needs JavaScript to run its interactive lessons. The source material and curriculum are included in the app folder.</p></noscript><script>DATA_HERE</script><script>APP_HERE</script></body></html>'''
icons={
'journey':'<path d="M5 19c0-5 14-3 14-9 0-3-5-3-5-6"/><circle cx="5" cy="19" r="2"/><path d="m11 7 3-4 4 2"/>',
'explore':'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5z"/>',
'dojo':'<path d="m12 3 2.7 5.6L21 9.5 16.5 14l1.1 6.2L12 17.3l-5.6 2.9L7.5 14 3 9.5l6.3-.9z"/>',
'passport':'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M8 3v18M11 17h6"/><circle cx="14" cy="10" r="3"/>'}
nav=''.join(f'<button data-nav="{k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{v}</svg>{k.title()}</button>' for k,v in icons.items())
inline='const DATA='+json.dumps(data,ensure_ascii=False).replace('</','<\\/')+';\nconst ACTIVITIES='+json.dumps(activities,ensure_ascii=False).replace('</','<\\/')+';'
html=html.replace('CSS_HERE',(ROOT/'style.css').read_text()).replace('NAV_HERE',nav).replace('DATA_HERE',inline).replace('APP_HERE',(ROOT/'app.js').read_text())
(ROOT/'index.html').write_text(html,encoding='utf-8')
(ROOT/'TOKI-Japanese-History.html').write_text(html,encoding='utf-8')
for size in [192,512]:
 scale=3;s=size*scale
 im=Image.new('RGB',(s,s),'#214c3c');d=ImageDraw.Draw(im)
 d.rounded_rectangle((s*.1,s*.1,s*.9,s*.9),radius=s*.19,fill='#f7f5ee')
 d.ellipse((s*.48,s*.22,s*.73,s*.47),fill='#bc5638')
 d.polygon([(s*.15,s*.70),(s*.38,s*.36),(s*.58,s*.61),(s*.72,s*.44),(s*.85,s*.68),(s*.85,s*.85),(s*.15,s*.85)],fill='#738869')
 d.polygon([(s*.15,s*.75),(s*.35,s*.60),(s*.62,s*.77),(s*.85,s*.58),(s*.85,s*.85),(s*.15,s*.85)],fill='#214c3c')
 d.line([(s*.62,s*.60),(s*.46,s*.71),(s*.53,s*.77),(s*.43,s*.85)],fill='#edd5a0',width=int(s*.026))
 im.resize((size,size),Image.Resampling.LANCZOS).save(ROOT/f'icon-{size}.png')
manifest={'id':'./','name':'TOKI - Japanese History','short_name':'TOKI','description':'Explore Japan through time, people, power, and language.','start_url':'./index.html','scope':'./','display':'standalone','orientation':'portrait','background_color':'#f7f5ee','theme_color':'#f7f5ee','lang':'en','icons':[{'src':f'icon-{n}.png','sizes':f'{n}x{n}','type':'image/png','purpose':'any maskable'}for n in [192,512]]}
(ROOT/'manifest.webmanifest').write_text(json.dumps(manifest,indent=2))
print('Built self-contained HTML:',len(html.encode()),'bytes')
