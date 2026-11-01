import * as THREE from 'three';

// Photograph-based arched cornice and shell crest. Dimensions remain interpretative.
export const CROWN={halfSpan:1.14,spring:7.18,rise:.64,band:.32};
export function crownArchHeight(x){const t=Math.min(1,Math.abs(x)/CROWN.halfSpan);return CROWN.spring+CROWN.rise*Math.cos(t*Math.PI/2);}
export function buildCrown(M){
 M={...M,gold:M.gold.clone()};M.gold.roughness=.44;
 const root=new THREE.Group();root.name='photograph-crown';
 const v=(x,y,z)=>new THREE.Vector3(x,y,z);
 function add(geometry,material,x=0,y=0,z=0,parent=root){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function box(w,h,d,x,y,z,material=M.white){return add(new THREE.BoxGeometry(w,h,d),material,x,y,z);}
 function tube(points,r,material=M.gold){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>v(...p))),48,r,8,false),material);}
 function bead(r,x,y,z,material=M.gold){return add(new THREE.SphereGeometry(r,12,8),material,x,y,z);}
 function extrude(shape,depth,material,x=0,y=0,z=0){return add(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2,curveSegments:24}),material,x,y,z);}
 const shadedGold=M.gold.clone();shadedGold.color.set('#947137');shadedGold.roughness=.58;
 const oldGold=M.gold.clone();oldGold.color.set('#b6944e');oldGold.roughness=.5;
 const groove=M.gold.clone();groove.color.set('#6c532d');groove.roughness=.7;
 function acanthus(x,y,z,w,h,angle=0,variant=0){
  const shape=new THREE.Shape();
  const left=[[-.25,.12],[-.74,.19],[-.43,.31],[-1,.39],[-.51,.52],[-.86,.62],[-.35,.73],[-.44,.84],[0,1]];
  const outline=[[0,0],...left,...left.slice(0,-1).reverse().map(([px,py])=>[-px,py])].map(([px,py])=>[px*w,py*h]);
  const last=outline.at(-1),first=outline[0];shape.moveTo((last[0]+first[0])/2,(last[1]+first[1])/2);
  outline.forEach((point,i)=>{const next=outline[(i+1)%outline.length];shape.quadraticCurveTo(point[0],point[1],(point[0]+next[0])/2,(point[1]+next[1])/2);});shape.closePath();
  const material=variant%4===0?shadedGold:variant%3===0?oldGold:M.gold;
  const group=new THREE.Group();group.position.set(x,y,z);group.rotation.z=angle;root.add(group);
  const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelThickness:.009,bevelSize:.007,bevelSegments:2}),material);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  // A folded central ridge and branching veins distinguish carved acanthus from oval petals.
  const ridge=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([v(0,.04*h,.04),v(.035*w,.5*h,.065),v(0,.92*h,.04)]),16,.006,6,false),oldGold);group.add(ridge);
  for(const side of [-1,1])for(const t of [.28,.5,.7]){
   const vein=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([v(0,(t-.06)*h,.045),v(side*w*.32,t*h,.044),v(side*w*.55,(t+.07)*h,.04)]),8,.0038,5,false),groove);group.add(vein);
  }
  return group;
 }
 function smallScroll(x,y,z,size,side){
  const points=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI*2.2,r=size*(1-.78*i/32);points.push([x+side*r*Math.cos(a),y+r*Math.sin(a),z+.012*Math.sin(a)]);}tube(points,.015,oldGold);
 }
 // Dark recess behind the raised pipe tips; no ivory infill across the opening.
 const recess=new THREE.Shape();recess.moveTo(-1.1,6.8);recess.lineTo(1.1,6.8);
 for(let i=0;i<=48;i++){const x=1.1-2.2*i/48;recess.lineTo(x,crownArchHeight(x));}recess.closePath();
 add(new THREE.ShapeGeometry(recess),M.dark,0,0,-.815).name='arched-pipe-recess';
 // An open arch band, rather than a filled triangular pediment.
 const arch=new THREE.Shape(),samples=64;
 for(let i=0;i<=samples;i++){const x=-CROWN.halfSpan+2*CROWN.halfSpan*i/samples,y=crownArchHeight(x)+CROWN.band;i?arch.lineTo(x,y):arch.moveTo(x,y);}
 for(let i=samples;i>=0;i--){const x=-CROWN.halfSpan+2*CROWN.halfSpan*i/samples;arch.lineTo(x,crownArchHeight(x));}arch.closePath();
 extrude(arch,.43,M.white,0,0,.15).name='open-arched-cornice';
 for(const offset of [0,CROWN.band]){
  const path=Array.from({length:49},(_,i)=>{const x=-CROWN.halfSpan+2*CROWN.halfSpan*i/48;return [x,crownArchHeight(x)+offset,.625];});
  tube(path,.04,M.white);tube(path.map(([x,y,z])=>[x,y+.032,z+.043]),.017);
 }
 // Dentils and small gilt squares follow the arch instead of a flat lintel.
 for(let i=0;i<29;i++){
  const x=-1.07+2.14*i/28,y=crownArchHeight(x);
  const slope=-CROWN.rise*Math.PI/(2*CROWN.halfSpan)*Math.sin(x/CROWN.halfSpan*Math.PI/2),angle=Math.atan(slope);
  const tooth=box(.037,.067,.063,x,y+.085,.635);tooth.rotation.z=angle;
  const slot=box(.022,.071,.014,x,y+.205,.59,oldGold);slot.rotation.z=angle;
 }
 // Stepped side shoulders and urn plinths, aligned with the existing pilasters.
 for(const side of [-1,1]){
  box(.59,.28,.64,side*1.445,7.33,.15);
  box(.64,.065,.72,side*1.445,7.505,.18);
  box(.64,.035,.76,side*1.445,7.555,.2,M.gold);
  box(.57,.035,.66,side*1.445,7.16,.18,M.gold);
  for(let i=0;i<9;i++)box(.033,.059,.048,side*(1.19+i*.063),7.365,.495);
  // Dense carved apron around the pipe tips, rather than exposed circular hooks.
  tube([[side*.22,7.75,.69],[side*.5,7.58,.7],[side*.82,7.28,.72],[side*1.03,6.96,.73]],.022,oldGold);
  for(let j=0;j<6;j++){
   const t=j/5,x=side*(.34+.67*t),y=crownArchHeight(x)-.12;
   smallScroll(x,y-.095,.74,.095-.018*t,side);
   acanthus(x,y-.2,.72,.064,.19,side*(.8+.2*t),j);
   acanthus(x-side*.045,y-.32,.735,.06,.18,-side*(.65+.35*t),j+1);
  }
  for(let j=0;j<6;j++){
   const t=j/5,x=side*(.5+.48*t),y=7.48-.53*t;
   acanthus(x,y,.75,.067,.18,-side*(1.1+.45*t),j+2);
   smallScroll(x+side*.035,y-.04,.78,.065,side);
  }
  // Fluted gilt urn with a flame finial.
  const profile=[[0,0],[.12,0],[.12,.04],[.065,.08],[.07,.12],[.145,.19],[.155,.25],[.12,.31],[.065,.35],[.10,.375],[0,.39]].map(([x,y])=>new THREE.Vector2(x,y));
  add(new THREE.LatheGeometry(profile,32),M.gold,side*1.43,7.59,.1);
  for(let j=0;j<12;j++){const a=j/12*Math.PI*2;tube([[side*1.43+Math.cos(a)*.075,7.72,.1+Math.sin(a)*.075],[side*1.43+Math.cos(a)*.154,7.82,.1+Math.sin(a)*.154],[side*1.43+Math.cos(a)*.11,7.89,.1+Math.sin(a)*.11]],.009,M.white);}
  acanthus(side*1.43,7.975,.1,.025,.14,-side*.12,1);
 }
 // The reference shell has a broad foot and nearly vertical ribs, not a pointed fan.
 const pedestal=new THREE.Shape();pedestal.moveTo(-.43,8.13);pedestal.lineTo(.43,8.13);pedestal.lineTo(.51,8.25);pedestal.quadraticCurveTo(0,8.32,-.51,8.25);pedestal.closePath();
 extrude(pedestal,.22,M.white,0,0,.38);
 tube([[-.47,8.18,.625],[0,8.225,.65],[.47,8.18,.625]],.012,oldGold);
 tube([[-.5,8.26,.625],[0,8.29,.65],[.5,8.26,.625]],.016,oldGold);
 for(let j=0;j<15;j++)box(.016,.032,.018,-.4+j*.8/14,8.195,.63,oldGold);
 const shell=new THREE.Shape();shell.moveTo(-.29,8.285);shell.bezierCurveTo(-.31,8.39,-.43,8.43,-.43,8.49);
 for(let i=0;i<=40;i++){const a=-Math.PI/2+Math.PI*i/40;const scallop=.008*Math.cos(i/40*Math.PI*18);shell.lineTo(Math.sin(a)*(.43+scallop),8.49+Math.cos(a)*(.205+scallop));}
 shell.bezierCurveTo(.43,8.43,.31,8.39,.29,8.285);shell.closePath();
 extrude(shell,.065,M.white,0,0,.43).name='ivory-scallop-shell';
 for(let i=0;i<9;i++){
  const t=-1+2*i/8,topX=t*.415,topY=8.49+.2*Math.sqrt(Math.max(0,1-t*t)),bottomX=t*.275;
  tube([[bottomX,8.30,.515],[t*.31,8.43,.54],[topX,topY-.017,.522]],.009,oldGold);
  tube([[bottomX+.012,8.31,.519],[t*.31+.012,8.43,.548],[topX+.008,topY-.018,.526]],.012,M.white);
 }
 // Close-set lobed foliage embraces the shell: no detached halo or petal-shaped ring.
 for(const side of [-1,1]){
  tube([[side*.3,8.27,.38],[side*.51,8.47,.38],[side*.37,8.72,.38],[side*.09,8.8,.38]],.018,shadedGold);
  const cluster=[
   [.08,8.75,.066,.2,.14],[.18,8.73,.07,.19,.45],[.29,8.69,.078,.2,.72],
   [.39,8.61,.08,.21,1.02],[.46,8.52,.087,.2,1.25],[.49,8.42,.08,.19,1.43],
   [.46,8.32,.075,.2,1.65],[.34,8.29,.07,.17,1.82]
  ];
  cluster.forEach(([x,y,w,h,a],j)=>{
   acanthus(side*x,y,.39,w,h,-side*a,j+1);
   acanthus(side*(x+.025),y-.035,.42,w*.73,h*.8,side*(.5+a*.25),j+2);
  });
  // Compact rolled leaves descend onto the shoulders of the pedestal.
  tube([[side*.38,8.32,.56],[side*.6,8.35,.55],[side*.62,8.48,.54],[side*.52,8.51,.54],[side*.49,8.44,.55]],.02,oldGold);
  const shoulderPath=[];for(let j=0;j<=16;j++){const x=side*(.36+.7*j/16);shoulderPath.push([x,crownArchHeight(x)+CROWN.band+.04,.5]);}tube(shoulderPath,.017,oldGold);
  for(let j=0;j<8;j++){const x=side*(.4+.085*j);acanthus(x,crownArchHeight(x)+CROWN.band+.015,.51,.05,.13,-side*(.7+.1*j),j+2);}
 }
 acanthus(-.045,8.78,.42,.055,.19,.3,1);acanthus(.045,8.78,.44,.055,.19,-.3,2);acanthus(0,8.81,.45,.058,.17,0,1);
 // Small central pendant at the crown of the pipe opening.
 for(const side of [-1,1])acanthus(side*.045,7.82,.72,.048,.16,side*2.7,1);
 root.userData.reference='docs/references/orgao-coroa-close.png (2026-11-01)';
 return root;
}
