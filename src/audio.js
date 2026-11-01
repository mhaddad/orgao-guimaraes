export const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
export class OrganAudio {
 constructor(){this.voices=new Map();this.volume=.65;}
 async init(){
  if(!this.ctx){
   this.ctx=new AudioContext({latencyHint:'interactive'});const c=this.ctx;
   this.master=c.createGain();this.master.gain.value=this.volume*.38;this.master.connect(c.destination);
   this.bus=c.createGain();this.bus.gain.value=.3;this.bus.connect(this.master);
   const convolver=c.createConvolver(),length=Math.floor(c.sampleRate*2.5),buffer=c.createBuffer(2,length,c.sampleRate);
   let seed=42;for(let ch=0;ch<2;ch++){const d=buffer.getChannelData(ch);for(let i=0;i<length;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=(seed/4294967296*2-1)*Math.pow(1-i/length,3)*.65;}}
   convolver.buffer=buffer;const wet=c.createGain();wet.gain.value=.24;this.bus.connect(convolver);convolver.connect(wet);wet.connect(this.master);
   const real=new Float32Array(24),imag=new Float32Array(24);[0,1,.35,.25,.1,.07,.045,.02,.018].forEach((a,i)=>imag[i]=a);this.wave=c.createPeriodicWave(real,imag);
  }
  await this.ctx.resume();
 }
 noteOn(id,midi,when=this.ctx.currentTime){
  this.noteOff(id,when);const c=this.ctx,osc=c.createOscillator(),gain=c.createGain();osc.setPeriodicWave(this.wave);osc.frequency.value=frequency(midi);gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(.32,when+.025);osc.connect(gain);gain.connect(this.bus);osc.start(when);const voice={osc,gain};this.voices.set(id,voice);osc.onended=()=>{if(this.voices.get(id)===voice)this.voices.delete(id);osc.disconnect();gain.disconnect();};
 }
 noteOff(id,when=this.ctx?.currentTime){const v=this.voices.get(id);if(!v)return;v.gain.gain.cancelScheduledValues(when);v.gain.gain.setTargetAtTime(0,when,.025);v.osc.stop(when+.2);if(when<=this.ctx.currentTime+.001)this.voices.delete(id);}
 setVolume(v){this.volume=v;if(this.ctx)this.master.gain.setTargetAtTime(v*.38,this.ctx.currentTime,.02);}
 stop(prefix=''){for(const id of [...this.voices.keys()])if(id.startsWith(prefix))this.noteOff(id);}
}
