import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Group,Mesh,MeshStandardMaterial,BoxGeometry,Box3,Vector3} from 'three';
import {batchStaticMeshes} from '../src/static-model.js';

test('Agrupa a caixa sem alterar os limites ou agregar as teclas móveis',()=>{
 const root=new Group(),material=new MeshStandardMaterial();
 const boxes=[-1,1].map(x=>{const m=new Mesh(new BoxGeometry(1,1,1),material);m.position.x=x;root.add(m);return m;});
 const key=new Mesh(new BoxGeometry(.1,.02,.2),material);key.position.y=2;root.add(key);
 root.updateMatrixWorld(true);const before=new Box3().setFromObject(root);const result=batchStaticMeshes(root,new Set([key]));root.updateMatrixWorld(true);
 assert.equal(result.batches,1);assert.equal(result.originalMeshes,2);assert.equal(key.parent,root);assert.equal(root.children.length,2);assert.ok(before.equals(new Box3().setFromObject(root)));assert.ok(boxes.every(m=>m.parent===null));
});
test('Preserva a orientação das faces das alas espelhadas',()=>{
 const root=new Group(),wing=new Group();wing.scale.x=-1;root.add(wing);wing.add(new Mesh(new BoxGeometry(1,1,1),new MeshStandardMaterial()));batchStaticMeshes(root);
 const mesh=root.children.find(m=>m.isMesh),g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,index=g.index.array;
 for(let i=0;i<index.length;i+=3){const a=new Vector3().fromBufferAttribute(p,index[i]),b=new Vector3().fromBufferAttribute(p,index[i+1]),c=new Vector3().fromBufferAttribute(p,index[i+2]);const winding=b.sub(a).cross(c.sub(a)).normalize(),normal=new Vector3().fromBufferAttribute(n,index[i]);assert.ok(winding.dot(normal)>.99);}
});
