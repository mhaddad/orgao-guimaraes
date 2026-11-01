import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MeshStandardMaterial} from 'three';
import {cameraDepthRange,surfaceOverlay} from '../src/render-stability.js';
import {frontalPose} from '../src/navigation.js';

test('A profundidade cobre o cenário durante todo o zoom, também em ecrãs estreitos',()=>{
 for(const aspect of [.25,.5,1,2,3])for(let i=0;i<=100;i++){
  const pose=frontalPose(i/100,aspect),range=cameraDepthRange(pose.position[2]);
  assert.equal(range.near,.3);assert.ok(range.far>pose.position[2]+3);assert.ok(range.near<pose.position[2]-2.17);
 }
 // The overview improves the far/near ratio from 3333 to 133.
 assert.ok(cameraDepthRange(17.2).far/.3<140);
});
test('O relevo de superfície não altera o material estrutural partilhado',()=>{
 const original=new MeshStandardMaterial({color:'#dbb56a'}),overlay=surfaceOverlay(original);
 assert.notEqual(overlay,original);assert.equal(original.polygonOffset,false);assert.equal(overlay.polygonOffset,true);assert.ok(overlay.polygonOffsetFactor<0);assert.ok(overlay.polygonOffsetUnits<0);assert.equal(overlay.color.getHex(),original.color.getHex());
});

