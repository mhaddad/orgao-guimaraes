import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3} from 'three';
import {buildInteractiveKeyboards} from '../src/keyboards.js';
import {frontalPose} from '../src/navigation.js';

test('Ambos os manuais mantêm as 61 notas e pivôs independentes',()=>{
 const {keys}=buildInteractiveKeyboards();assert.equal(keys.length,122);
 for(const manual of [0,1]){const notes=keys.filter(k=>k.userData.manual===manual);assert.deepEqual(notes.map(k=>k.userData.midi),Array.from({length:61},(_,i)=>36+i));assert.equal(new Set(notes.map(k=>k.userData.pivot)).size,61);for(const key of notes)assert.equal(key.userData.pivot.userData.rest,key.userData.pivot.position.y);}
});
test('Os manuais cabem na abertura da consola refinada',()=>{
 const {group}=buildInteractiveKeyboards();group.position.set(0,.72,-.26);group.scale.set(.63,.65,.65);group.updateMatrixWorld(true);const bounds=new Box3().setFromObject(group);
 assert.ok(bounds.min.x>-.535&&bounds.max.x<.535);assert.ok(bounds.min.y>=.70&&bounds.max.y<.88);assert.ok(bounds.min.z>-.55&&bounds.max.z<.19);
});
test('O percurso limita o zoom à frente, sem acesso à traseira ou à parte inferior',()=>{
 for(const aspect of [.5,1,2,3])for(const progress of [-10,0,.25,.5,.75,1,10]){
  const pose=frontalPose(progress,aspect,aspect<1);assert.equal(pose.position[0],0);assert.equal(pose.target[0],0);assert.equal(pose.offsetX,0);assert.equal(pose.offsetY,0);assert.ok(pose.position[2]>=2.95);assert.ok(pose.position[1]>=pose.target[1]);
 }
 assert.deepEqual(frontalPose(-10,1),frontalPose(0,1));assert.deepEqual(frontalPose(10,1),frontalPose(1,1));
});
