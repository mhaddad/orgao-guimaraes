import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {SSAARenderPass} from 'three/addons/postprocessing/SSAARenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {batchStaticMeshes} from './static-model.js';
import {buildOrgan} from './model.js';
import {frontalPose} from './navigation.js';
import {cameraDepthRange} from './render-stability.js';
import {zoomMotion,sampleZoomMotion} from './zoom-motion.js';
export function createScene(container,onDown,onUp,onViewChange=()=>{},overlay=null){
 const diagnostic=new URLSearchParams(location.search).has('diagnostico');
 const scene=new THREE.Scene();scene.background=new THREE.Color('#15110d');scene.fog=new THREE.Fog('#15110d',28,70);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=new URLSearchParams(location.search).get('sombras')!=='0';renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;container.appendChild(renderer.domElement);
 const environment=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);
 scene.environment=pmrem.fromScene(environment,.04).texture;environment.dispose();pmrem.dispose();
 const camera=new THREE.PerspectiveCamera(36,1,.3,40);
 const composer=new EffectComposer(renderer);
 const sampling=new SSAARenderPass(scene,camera);sampling.sampleLevel=3; // Eight complete scene samples, including gold highlights and cutout textures.
 composer.addPass(sampling);composer.addPass(new OutputPass());
 // Dark church ambience with local warm lighting focused on the instrument.
 scene.environmentIntensity=.38;
 scene.add(new THREE.HemisphereLight('#b7a58b','#100c08',.10));
 const organ=buildOrgan();scene.add(organ.root,organ.room,organ.gallery);
 organ.room.traverse(object=>{
  if(object.isLight)object.intensity=0;
  if(object.isMesh){const dim=material=>{const clone=material.clone();clone.envMapIntensity=.06;if(clone.emissive)clone.emissiveIntensity=.025;return clone;};object.material=Array.isArray(object.material)?object.material.map(dim):dim(object.material);}
 });
 function illuminate(position,target,power,angle,shadow=false){
  const lamp=new THREE.SpotLight('#ffe4b7',power,22,angle,.65,2);lamp.position.set(...position);lamp.target.position.set(...target);lamp.castShadow=shadow;
  if(shadow){lamp.shadow.mapSize.set(2048,2048);lamp.shadow.bias=-.0003;lamp.shadow.normalBias=.015;}
  scene.add(lamp,lamp.target);
 }
 illuminate([-3.1,7.6,4.4],[0,4.8,0],115,.56,true);
 illuminate([3.1,6.8,3.6],[0,4.3,0],78,.62);
 illuminate([0,9.8,2.4],[0,7.4,0],32,.63);
 illuminate([0,2.6,3],[0,1.1,0],22,.95);
 const batching={organ:batchStaticMeshes(organ.root,new Set(organ.keys)),room:batchStaticMeshes(organ.room),gallery:batchStaticMeshes(organ.gallery)};
 let progress=0,destination=0,mode='overview',motion=null,dirty=true;
 function announce(){const next=destination>=.72?'console':'overview';if(next!==mode){mode=next;onViewChange(mode);}}
 function moveTo(next,instant=false){
  destination=next;dirty=true;
  if(instant||Math.abs(destination-progress)<.000001){progress=destination;motion=null;positionCamera();}
  else motion=zoomMotion(progress,destination,performance.now()/1000);
  announce();
 }
 function view(which='overview',instant=false){moveTo(which==='console'?1:0,instant);}
 function zoom(factor){moveTo(THREE.MathUtils.clamp(destination-Math.log(factor)*.8,0,1));}
 // The overlay covers the bottom of the canvas; frame the instrument in the visible area above it.
 let inset=0;function measureInset(){if(!overlay)return;const stage=container.getBoundingClientRect(),dock=overlay.getBoundingClientRect();inset=Math.max(0,Math.min(stage.bottom-dock.top,stage.height*.5));}
 function positionCamera(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;const visible=h-inset,aspect=w/visible;const pose=diagnostic&&new URLSearchParams(location.search).has('coroa')?{position:[0,7.95,6],target:[0,7.95,0]}:frontalPose(progress,aspect,w<680);const depth=cameraDepthRange(pose.position[2]),view=camera.view;
  if(camera.aspect!==aspect||camera.far!==depth.far||view?.fullHeight!==visible||view?.height!==h||view?.width!==w){camera.aspect=aspect;camera.near=depth.near;camera.far=depth.far;camera.setViewOffset(w,visible,0,0,w,h);}
  camera.position.fromArray(pose.position);camera.lookAt(...pose.target);}
 function resize(){measureInset();renderer.setSize(container.clientWidth,container.clientHeight);composer.setSize(container.clientWidth,container.clientHeight);positionCamera();dirty=true;}
 const observer=new ResizeObserver(resize);observer.observe(container);if(overlay)observer.observe(overlay);
 resize();
 const active=new Map();function setKey(id,midi,manual,down){if(down)active.set(id,{midi,manual});else active.delete(id);dirty=true;}
 const ray=new THREE.Raycaster(),point=new THREE.Vector2(),pointers=new Map(),touches=new Map();let pinchDistance=null;
 function hit(e){const r=renderer.domElement.getBoundingClientRect();point.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(point,camera);return ray.intersectObjects(organ.keys,false)[0]?.object;}
 const canvas=renderer.domElement;
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(THREE.MathUtils.clamp(e.deltaY,-100,100)*.002));},{passive:false});
 canvas.addEventListener('pointerdown',e=>{
  const key=hit(e);canvas.setPointerCapture(e.pointerId);
  if(key){pointers.set(e.pointerId,key.userData);onDown(`3d:${e.pointerId}`,key.userData.midi,key.userData.manual);return;}
  if(e.pointerType==='touch'){touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2){const [a,b]=[...touches.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);}}
 });
 const release=e=>{if(pointers.has(e.pointerId)){onUp(`3d:${e.pointerId}`);pointers.delete(e.pointerId);}touches.delete(e.pointerId);if(touches.size<2)pinchDistance=null;};for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,release);
 canvas.addEventListener('pointermove',e=>{
  canvas.style.cursor=hit(e)?'pointer':'default';
  if(!touches.has(e.pointerId))return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(touches.size===2){const [a,b]=[...touches.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);if(pinchDistance>0&&distance>0)zoom(pinchDistance/distance);pinchDistance=distance;}
 });
 let prev=performance.now();function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-prev)/1000,.05);prev=now;
  if(motion){const sample=sampleZoomMotion(motion,now/1000);progress=sample.progress;positionCamera();dirty=true;if(sample.complete)motion=null;}
  const pressedKeys=new Set([...active.values()].map(n=>`${n.manual}:${n.midi}`));for(const mesh of organ.keys){const pivot=mesh.userData.pivot,pressed=pressedKeys.has(`${mesh.userData.manual}:${mesh.userData.midi}`);const previous=pivot.position.y;pivot.position.y=THREE.MathUtils.damp(previous,pivot.userData.rest-(pressed?.025:0),22,dt);if(Math.abs(previous-pivot.position.y)>.000001){renderer.shadowMap.needsUpdate=true;dirty=true;}}
  if(!dirty)return;
  const started=performance.now();composer.render(dt);dirty=false;
  if(diagnostic){canvas.dataset.renderMs=(performance.now()-started).toFixed(1);canvas.dataset.drawCalls=String(renderer.info.render.calls);canvas.dataset.staticBatches=JSON.stringify(batching);canvas.dataset.zoomProgress=String(progress);canvas.dataset.zoomMoving=String(motion!==null);canvas.dataset.lastRender=String(now);}
 }requestAnimationFrame(frame);
 return {setKey,view,renderer,organ,zoom};
}
