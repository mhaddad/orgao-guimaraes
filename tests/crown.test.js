import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MeshStandardMaterial,Raycaster,Vector3,Box3} from 'three';
import {buildCrown,crownArchHeight} from '../src/crown.js';

test('O arco deixa uma abertura real sobre os tubos, sem o antigo frontão sólido',()=>{
 const crown=buildCrown({white:new MeshStandardMaterial(),gold:new MeshStandardMaterial(),dark:new MeshStandardMaterial()});crown.updateMatrixWorld(true);
 const arch=crown.getObjectByName('open-arched-cornice');
 const hits=(x,y)=>new Raycaster(new Vector3(x,y,5),new Vector3(0,0,-1),0,10).intersectObject(arch,false).length;
 assert.equal(hits(0,7.4),0);assert.equal(hits(.8,7.3),0);assert.ok(hits(0,7.95)>0);
 assert.ok(crown.getObjectByName('ivory-scallop-shell'));assert.ok(new Box3().setFromObject(crown).max.y<9.3);
});
test('Os dois lados do arco têm a mesma altura',()=>{for(const x of [0,.2,.5,.8,1.14])assert.equal(crownArchHeight(x),crownArchHeight(-x));});
