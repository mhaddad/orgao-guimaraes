"""Convert the retained MusicXML edition without inventing or quantizing events."""
import zipfile, xml.etree.ElementTree as E, json
from pathlib import Path
project_root=Path(__file__).resolve().parent.parent
z=zipfile.ZipFile(project_root/'data/scores/bwv846.mxl')
root=E.fromstring(z.read(next(n for n in z.namelist() if n.endswith('.xml') and not n.startswith('META'))))
events=[]; divisions=1; base=0; ties={}; tempo=72
for measure in root.find('part').findall('measure'):
 cursor=0; end=0; previous=0
 for node in measure:
  if node.tag=='attributes' and node.find('divisions') is not None: divisions=int(node.findtext('divisions'))
  if node.tag in ('backup','forward'):
   cursor+=(-1 if node.tag=='backup' else 1)*int(node.findtext('duration'))/divisions
  if node.tag!='note': continue
  duration=int(node.findtext('duration','0'))/divisions
  chord=node.find('chord') is not None
  start=previous if chord else cursor
  pitch=node.find('pitch')
  if pitch is not None:
   midi=(int(pitch.findtext('octave'))+1)*12+{'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}[pitch.findtext('step')]+int(pitch.findtext('alter','0'))
   key=(node.findtext('voice'),midi); types=[t.get('type') for t in node.findall('tie')]
   if 'stop' in types and key in ties: ties[key]['duration']+=duration*60/tempo
   else:
    event={'midi':midi,'time':round((base+start)*60/tempo,6),'duration':round(duration*60/tempo,6),'staff':int(node.findtext('staff','1')),'measure':int(measure.get('number'))};events.append(event)
    if 'start' in types: ties[key]=event
   if 'stop' in types and 'start' not in types: ties.pop(key,None)
  if not chord: previous=start;cursor+=duration
  end=max(end,cursor,start+duration)
 base+=end
out={'title':'Prelúdio em Dó maior','catalogue':'BWV 846','composer':'Johann Sebastian Bach','tempo':tempo,'measures':len(root.findall('.//measure')),'duration':base*60/tempo,'source':'https://github.com/cuthbertLab/music21/blob/master/music21/corpus/bach/bwv846.mxl','editionNote':'Edição MusicXML do acervo music21, 34 compassos; alturas, durações e vozes preservadas. Timbre e registação adaptados para órgão.','notes':sorted(events,key=lambda n:n['time'])}
(project_root/'public/music/bwv846.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')))
print(len(events),'notes;',out['duration'],'seconds; range',min(n['midi'] for n in events),max(n['midi'] for n in events))
