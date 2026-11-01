// Finish at an exact position instead of leaving an exponential subpixel tail.
export const ZOOM_DURATION=.38;
export function zoomMotion(from,to,start){return {from,to,start,duration:ZOOM_DURATION};}
export function sampleZoomMotion(motion,now){
 const elapsed=Math.max(0,now-motion.start);
 const t=elapsed>=motion.duration-1e-9?1:elapsed/motion.duration;
 const eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 return {progress:t===1?motion.to:motion.from+(motion.to-motion.from)*eased,complete:t===1};
}
