// Keep enough room in front of the console while prioritising depth precision.
export function cameraDepthRange(cameraZ){
 return {near:.3,far:Math.max(40,cameraZ+20)};
}

// Painted/carved overlays should consistently sit ahead of the supporting case.
export function surfaceOverlay(material){
 const overlay=material.clone();
 overlay.polygonOffset=true;overlay.polygonOffsetFactor=-1;overlay.polygonOffsetUnits=-1;
 return overlay;
}

