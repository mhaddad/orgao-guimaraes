export class ScorePlayer {
 constructor(audio,onVisual){this.audio=audio;this.onVisual=onVisual;this.playing=false;this.position=0;this.generation=0;this.pendingPlay=false;this.scheduled=new Set();this.visible=new Set();}
 load(score){this.score=score;}
 async play(){if(!this.score||this.playing)return;const generation=++this.generation;this.pendingPlay=true;await this.audio.init();if(generation!==this.generation)return;this.pendingPlay=false;if(this.position>=this.score.duration)this.position=0;this.anchor=this.audio.ctx.currentTime-this.position;this.playing=true;this.scheduled.clear();this.tick();this.timer=setInterval(()=>this.tick(),20);}
 pause(){this.generation++;this.pendingPlay=false;if(this.playing)this.position=this.time;this.playing=false;clearInterval(this.timer);this.audio.stop('score:');this.scheduled.clear();for(const i of this.visible)this.onVisual(i,this.score.notes[i],false);this.visible.clear();}
 get time(){return this.playing?Math.min(this.score.duration,this.audio.ctx.currentTime-this.anchor):this.position;}
 seek(t){const playing=this.playing||this.pendingPlay;this.pause();this.position=Math.max(0,Math.min(this.score.duration,t));if(playing)return this.play();}
 tick(){if(!this.playing)return;const t=this.time;
  this.score.notes.forEach((n,i)=>{
   const end=n.time+n.duration;
   if(!this.scheduled.has(i)&&n.time<t+.1&&end>t){const start=Math.max(this.audio.ctx.currentTime,this.anchor+n.time);this.audio.noteOn(`score:${i}`,n.midi,start);this.audio.noteOff(`score:${i}`,this.anchor+end);this.scheduled.add(i);}
   const active=t>=n.time&&t<end;
   if(active&&!this.visible.has(i)){this.visible.add(i);this.onVisual(i,n,true);}else if(!active&&this.visible.has(i)){this.visible.delete(i);this.onVisual(i,n,false);}
  });if(t>=this.score.duration)this.pause();
 }
}
