/* Web adaptation of create-vibe-motion 1.2.2 motion formulas. See THIRD_PARTY.md. */
(function(root){
  'use strict';
  const instances=new WeakMap();
  const presets=['vibe-card','card-sway','chip-drift','progress-fill'];
  const num=(v,d,min,max)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):d;
  function mount(container,options={}){
    if(!(container instanceof HTMLElement))throw new TypeError('Expected an HTML container');
    if(!root.gsap)throw new Error('Load GSAP before mounting');
    const preset=options.preset||'vibe-card';
    if(!presets.includes(preset))throw new RangeError('Unknown VibeMotion preset');
    instances.get(container)?.destroy();
    const duration=num(options.duration,3,.1,60),speed=num(options.speed,1,0,2),intensity=num(options.intensity,1,0,2);
    const element=document.createElement('div');element.className='vibe-scene'+(options.dark?' vibe-dark':'');element.dataset.preset=preset;
    element.innerHTML='<div class="vibe-card"><span class="vibe-chip"></span><span class="vibe-symbol" aria-hidden="true">✳</span><h3></h3><p></p><div class="vibe-track"><div class="vibe-fill"></div></div><span class="vibe-percent"></span></div>';
    const card=element.querySelector('.vibe-card'),chip=element.querySelector('.vibe-chip'),fill=element.querySelector('.vibe-fill'),percent=element.querySelector('.vibe-percent');
    element.querySelector('h3').textContent=options.title??'Ideas in motion';
    element.querySelector('p').textContent=options.subtitle??'Turn a small idea into something worth sharing.';
    chip.textContent=options.badge??'VIBE MOTION';
    container.append(element);
    let progress=0;
    const state={get progress(){return progress;},set progress(value){progress=value;draw();}};
    function draw(){const p=state.progress,theta=p*Math.PI*2*speed;
      card.style.transform=`rotate(${['vibe-card','card-sway'].includes(preset)?Math.sin(theta*.8)*12*intensity:0}deg)`;
      chip.style.transform=`translateX(${['vibe-card','chip-drift'].includes(preset)?Math.sin(theta*1.6)*24*intensity:0}px)`;
      const amount=['vibe-card','progress-fill'].includes(preset)?Math.max(8,p*100):65;
      fill.style.width=amount+'%';percent.textContent=Math.round(amount)+'%';
    }
    const timeline=root.gsap.timeline({paused:true}).to(state,{progress:1,duration,ease:'none'});draw();
    const instance={timeline,duration,element,destroy(){timeline.kill();element.remove();if(instances.get(container)===instance)instances.delete(container);}};
    instances.set(container,instance);return instance;
  }
  root.VibeMotion=Object.freeze({mount,presets:Object.freeze(presets)});
})(window);
