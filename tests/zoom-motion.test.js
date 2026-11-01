import {test} from 'node:test';
import assert from 'node:assert/strict';
import {zoomMotion,sampleZoomMotion,ZOOM_DURATION} from '../src/zoom-motion.js';
import {GALLERY_SECTIONS} from '../src/gallery.js';

test('O zoom termina exatamente em 380 ms e não mantém uma cauda de movimento',()=>{
 for(const [from,to] of [[0,1],[1,0],[.1,.13],[.93,.4]]){
  const motion=zoomMotion(from,to,10);assert.equal(sampleZoomMotion(motion,10).progress,from);
  for(const delay of [ZOOM_DURATION,ZOOM_DURATION+.00001,.5,1,2,10]){const sample=sampleZoomMotion(motion,10+delay);assert.equal(sample.progress,to);assert.equal(sample.complete,true);}
  const halfway=sampleZoomMotion(motion,10+ZOOM_DURATION/2);assert.ok(Math.abs(halfway.progress-(from+to)/2)<1e-12);
 }
});
test('As peças branca e douradas do beiral não ocupam os mesmos volumes',()=>{
 for(let i=0;i<GALLERY_SECTIONS.length;i++)for(let j=i+1;j<GALLERY_SECTIONS.length;j++){
  const a=GALLERY_SECTIONS[i].bounds,b=GALLERY_SECTIONS[j].bounds;
  const overlap=[0,2,4].map(k=>Math.max(0,Math.min(a[k+1],b[k+1])-Math.max(a[k],b[k])));
  assert.equal(overlap.reduce((volume,length)=>volume*length,1),0,`${GALLERY_SECTIONS[i].name} overlaps ${GALLERY_SECTIONS[j].name}`);
 }
});
