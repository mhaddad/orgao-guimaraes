import {Group,Mesh,BoxGeometry} from 'three';

// Separate volumes: the gilt lips do not overlap the white fascia's top faces.
export const GALLERY_SECTIONS=[
 {name:'gallery-floor',bounds:[-4.45,4.45,-.15,0,-2.25,1.9],material:'wood'},
 {name:'gallery-fascia',bounds:[-4.5,4.5,-.64,-.06,1.9,2.15],material:'white'},
 {name:'gallery-upper-lip',bounds:[-4.52,4.52,-.06,0,1.9,2.17],material:'gold'},
 {name:'gallery-lower-lip',bounds:[-4.52,4.52,-.7,-.64,1.9,2.17],material:'gold'}
];
export function buildGallery(materials){
 const root=new Group();root.name='gallery';
 for(const {name,bounds:[x0,x1,y0,y1,z0,z1],material} of GALLERY_SECTIONS){
  const mesh=new Mesh(new BoxGeometry(x1-x0,y1-y0,z1-z0),materials[material]);mesh.name=name;mesh.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);
 }
 return root;
}
