(() => {
 const video=document.querySelector('#comparison-video'),seek=document.querySelector('#comparison-seek'),time=document.querySelector('#comparison-time'),workout=document.querySelector('#workout-video');
 if(!video||!workout)return;
 const format=n=>`${Math.floor(n/60).toString().padStart(2,'0')}:${Math.floor(n%60).toString().padStart(2,'0')}`;
 const update=()=>{const duration=Number.isFinite(video.duration)?video.duration:0;seek.value=duration?video.currentTime/duration*100:0;time.textContent=format(video.currentTime||0);seek.setAttribute('aria-valuetext',`${format(video.currentTime||0)} / ${format(duration)}`);};
 video.addEventListener('timeupdate',update);video.addEventListener('loadedmetadata',update);
 seek.addEventListener('input',()=>{if(Number.isFinite(video.duration))video.currentTime=Number(seek.value)/100*video.duration;});
 const phases=[{name:'热身步行',start:0,end:300,km:0,speed:4,pace:'15′00″'},{name:'慢跑探索',start:300,end:1020,km:1/3,speed:8,pace:'7′30″'},{name:'放松步行',start:1020,end:1200,km:1/3+1.6,speed:4,pace:'15′00″'}];
 const buttons=[...document.querySelectorAll('[data-workout-phase]')];
 let phase=1,elapsed=204,last=0;
 const paint=()=>{const p=phases[phase],seconds=Math.min(p.end,p.start+elapsed);document.querySelector('#workout-stage').textContent=p.name;document.querySelector('#workout-time').textContent=format(seconds);document.querySelector('#workout-distance').textContent=(p.km+(seconds-p.start)*p.speed/3600).toFixed(2);document.querySelector('#workout-pace').textContent=p.pace;document.querySelector('#workout-trace').style.strokeDashoffset=String(100-seconds/1200*100);};
 buttons.forEach((button,index)=>button.addEventListener('click',()=>{phase=index;elapsed=0;last=workout.currentTime;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));paint();}));
 workout.addEventListener('timeupdate',()=>{const delta=workout.currentTime-last;last=workout.currentTime;if(!workout.paused&&delta>0&&delta<2)elapsed+=delta;paint();});
 paint();
})();
