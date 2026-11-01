import {Mesh} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Batch only static single-material meshes; keyboards and lights stay independent.
export function batchStaticMeshes(root,excluded=new Set()){
 root.updateMatrixWorld(true);
 const inverseRoot=root.matrixWorld.clone().invert(),buckets=new Map(),originals=[];
 root.traverse(mesh=>{
  if(!mesh.isMesh||excluded.has(mesh)||Array.isArray(mesh.material))return;
  const geometry=mesh.geometry.clone();
  const transform=inverseRoot.clone().multiply(mesh.matrixWorld);
  geometry.applyMatrix4(transform);
  if(!geometry.index)geometry.setIndex(Array.from({length:geometry.attributes.position.count},(_,i)=>i));
  // Source side wings use a negative scale. Preserve their visible winding.
  if(transform.determinant()<0){const index=geometry.index.array;for(let i=0;i<index.length;i+=3){const b=index[i+1];index[i+1]=index[i+2];index[i+2]=b;}}
  const key=`${mesh.material.uuid}:${mesh.castShadow}:${mesh.receiveShadow}`;
  if(!buckets.has(key))buckets.set(key,{material:mesh.material,castShadow:mesh.castShadow,receiveShadow:mesh.receiveShadow,geometries:[],meshes:[]});
  const bucket=buckets.get(key);bucket.geometries.push(geometry);bucket.meshes.push(mesh);originals.push(mesh);
 });
 let batches=0;
 for(const bucket of buckets.values()){
  const geometry=mergeGeometries(bucket.geometries,false);
  if(!geometry){for(const copy of bucket.geometries)copy.dispose();continue;}
  const mesh=new Mesh(geometry,bucket.material);mesh.name='static-batch';mesh.castShadow=bucket.castShadow;mesh.receiveShadow=bucket.receiveShadow;root.add(mesh);batches++;
  for(const original of bucket.meshes)original.removeFromParent();
  for(const copy of bucket.geometries)copy.dispose();
 }
 return {originalMeshes:originals.length,batches};
}
