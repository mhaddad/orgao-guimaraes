import * as THREE from 'three';

// The original two interactive manuals, isolated from the old organ case.
export function buildInteractiveKeyboards(){
 const group=new THREE.Group(),keys=[];
 group.name='interactive-manuals';
 const white=new THREE.MeshStandardMaterial({color:'#eee3c3',metalness:.06,roughness:.35});
 const black=new THREE.MeshStandardMaterial({color:'#24201c',metalness:.1,roughness:.3});
 for(let manual=0;manual<2;manual++){
  const natural=[0,2,4,5,7,9,11];let wi=0;const width=1.65/36;
  for(let midi=36;midi<=96;midi++){
   const isBlack=!natural.includes(midi%12);
   const x=-.825+(isBlack?wi-.08:wi+.5)*width;if(!isBlack)wi++;
   const pivot=new THREE.Group();pivot.position.set(x,manual*.13,.51-manual*.19);group.add(pivot);
   const mesh=new THREE.Mesh(new THREE.BoxGeometry(width*(isBlack?.58:.94),isBlack?.055:.035,isBlack?.22:.36),isBlack?black:white);
   mesh.position.set(0,isBlack?.041:0,isBlack?-.065:0);mesh.castShadow=true;mesh.receiveShadow=true;pivot.add(mesh);
   mesh.userData={midi,manual,pivot};pivot.userData.rest=pivot.position.y;keys.push(mesh);
  }
 }
 return {group,keys};
}
