// A single bounded path: front elevation → front of the console. No orbit.
export function frontalPose(progress,aspect,mobile=false){
 const t=Math.max(0,Math.min(1,progress));
 const overallDistance=Math.max(17.2,7.8/(2*Math.tan(Math.PI/10)*aspect));
 const closeDistance=Math.max(2.95,2.25/(2*Math.tan(Math.PI/10)*aspect));
 const mix=(a,b)=>a*(1-t)+b*t;
 return {position:[0,mix(4.55,1.4),mix(overallDistance,closeDistance)],target:[0,mix(4.55,.76),mix(0,-.08)],offsetX:0,offsetY:0};
}
