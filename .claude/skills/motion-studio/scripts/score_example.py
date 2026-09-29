"""Example: build a score from a scene's exported cues.

    node render.mjs cues <scene.html> cues.json
    python score_example.py cues.json score.wav

cues.json is whatever the scene's window.cues() returns. This example expects
{"duration": 15, "hits": [[time, strength], ...], "reveals": [time, ...]} and ignores missing keys.
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from sfxlib import Mix, whoosh, thump, crack, bell, pad, riser, midi

cues = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else {}
out = sys.argv[2] if len(sys.argv) > 2 else 'score.wav'
dur = cues.get('duration', 10)
m = Mix(dur)
m.place(pad([50, 57, 62, 66], dur, attack=2.0, release=2.0), 0, .6, reverb=.5)       # bed
for t, s in cues.get('hits', []):                                                    # impacts
    m.place(whoosh(.25), t - .2, .3 * s); m.place(thump(.6), t, .9 * s); m.place(crack(), t, .4 * s)
for i, t in enumerate(cues.get('reveals', [])):                                       # soft chimes on reveals
    m.place(bell(midi([74, 78, 81, 86][i % 4])), t, .15, pan=(i % 3 - 1) * .4, reverb=.9)
if dur > 3: m.place(riser(1.5), dur - 2.2, .3)
m.write(out); m.report()
print('score ->', out)
