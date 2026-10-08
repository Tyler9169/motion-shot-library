/* Reusable scene motions reconstructed from user-supplied video references. */
(function(root){
'use strict';
const instances=new WeakMap();
const definitions={
 'reaction-stretch':{duration:.967,count:0,title:'OH',subtitle:'灵感，突然出现。'},
 'presenter-corner':{duration:1.734,count:0,title:'从人物到全景',subtitle:'给接下来的内容留出空间'},
 'blur-collage':{duration:1.667,count:4,title:'四个新的视角',subtitle:'让每个画面都有位置'},
 'headline-drop':{duration:2.738,count:2,title:'一个新故事',subtitle:'从这里开始'},
 'cards-assemble':{duration:6.174,count:5,title:'五个关键想法',subtitle:'逐个讲清，再看整体'},
 'evidence-pop':{duration:1.507,count:2,title:'让数据说话',subtitle:'把证据和结论放在一起'},
 'double-flip':{duration:2.167,count:4,title:'换一个角度',subtitle:'同一个主题，两组不同的画面'},
 'cover-punch':{duration:3.234,count:0,title:'创作',subtitle:'灵感的下一站',coverTitle:'打开新的视角'},
 'background-rise':{duration:4.134,count:3,title:'故事正在发生',subtitle:'背景在流动，人物保持清晰'}
};
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const n=(v,d,a,b)=>Number.isFinite(Number(v))?clamp(Number(v),a,b):d;
const smooth=t=>1-Math.pow(1-clamp(t),3);
const phase=(p,start,end)=>clamp((p-start)/(end-start));
const back=t=>{t=clamp(t)-1;return 1+2.70158*t*t*t+1.70158*t*t;};
function mount(container,options={}){
 if(!(container instanceof HTMLElement))throw TypeError('Expected an HTML container');
 if(!root.gsap)throw Error('Load GSAP before mounting');
 const preset=options.preset||'blur-collage',def=definitions[preset];if(!def)throw RangeError('Unknown StoryMotion preset');
 instances.get(container)?.destroy();
 const duration=n(options.duration,def.duration,.1,60),intensity=n(options.intensity,1,0,2);
 const element=document.createElement('div');element.className='story-scene';element.dataset.preset=preset;
 element.innerHTML='<div class="story-background"><div class="story-grid"></div><span>STORY / MOTION</span><b>CREATE<br>YOUR WORLD.</b></div><div class="story-backdrops"></div><div class="story-cards"></div><h3 class="story-title"></h3><div class="story-subject"><div class="story-person"><i></i><b></b></div><span>YOUR STORY</span></div><div class="story-reaction"></div><div class="story-cover"><div class="story-lockers"></div><h3></h3><span>CHAPTER 01</span></div><p class="story-caption"></p>';
 const $=s=>element.querySelector(s),subject=$('.story-subject'),title=$('.story-title'),caption=$('.story-caption'),cover=$('.story-cover'),reaction=$('.story-reaction');
 title.textContent=options.title??def.title;caption.textContent=options.subtitle??def.subtitle;cover.querySelector('h3').textContent=options.coverTitle??def.coverTitle??'新的篇章';
 const img=(src,parent)=>{if(typeof src!=='string'||!src)return;const im=document.createElement('img');im.src=src;im.alt='';im.draggable=false;parent.append(im);};
 if(options.subjectSrc){subject.replaceChildren();img(options.subjectSrc,subject);subject.classList.add('has-image');}
 img(options.backgroundSrc,$('.story-background'));
 const items=Array.isArray(options.items)?options.items:[];
 const cards=Array.from({length:def.count},(_,i)=>{const c=document.createElement('div');c.className='story-card';c.dataset.index=i;c.style.setProperty('--hue',String(140+i*38));c.innerHTML='<div class="story-art"><i></i><b></b><em></em></div><strong></strong>';c.querySelector('strong').textContent=items[i]?.label??['探索','连接','创造','分享','成长'][i];img(items[i]?.src,c);$('.story-cards').append(c);return c;});
 const backs=preset==='background-rise'?Array.from({length:3},(_,i)=>{const el=document.createElement('div');el.className='story-backdrop';el.style.setProperty('--hue',String(145+i*55));el.innerHTML='<small>IDEA / 0'+(i+1)+'</small><b></b><div class="story-art"><i></i><b></b><em></em></div>';el.querySelector('b').textContent=items[i]?.label??['EXPLORE','CREATE','SHARE'][i];img(items[i]?.src,el);$('.story-backdrops').append(el);return el;}):[];
 container.append(element);
 // All visible properties are derived from normalized progress, including reverse seeks.
 const pose=(el,x=0,y=0,scale=1,rotation=0,opacity=1,blur=0,flip=0)=>{el.style.transform=`translate(${x}%,${y}%) scale(${scale}) rotate(${rotation}deg) rotateY(${flip}deg)`;el.style.opacity=String(clamp(opacity));el.style.filter=`blur(${Math.max(0,blur)}px)`;};
 const box=(el,x,y,w,h)=>Object.assign(el.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});
 let progress=0;
 function draw(){const p=progress;pose(title);pose(subject);pose(cover,0,0,1,0,0);pose(reaction,0,0,1,0,0);box(subject,37,30,26,70);title.style.opacity='0';
  if(preset==='reaction-stretch'){
   box(subject,25,6,50,94);const t=phase(p,0,.82);reaction.textContent=Array.from(String(options.title??def.title).repeat(20)).slice(0,Math.max(0,Math.ceil(t*38))).join('');pose(reaction,0,0,1,0,p>0?1:0);pose(subject,0,0,1+Math.sin(p*25)*.008*intensity);element.style.setProperty('--flare',String(.5+.5*Math.sin(p*30)));
  }else if(preset==='presenter-corner'){
   const t=smooth(phase(p,.25,.95));box(subject,2*t,3+28*t,100-77*t,94-35*t);subject.style.borderRadius=(22*t)+'px';pose(subject);pose(title,0,0,1,0,t);
  }else if(preset==='blur-collage'){
   box(subject,36,40,28,60);const positions=[[7,6,29,52],[3,49,32,48],[58,7,38,54],[68,60,29,37]];cards.forEach((c,i)=>{box(c,...positions[i]);const t=phase(p,i*.15,i*.15+.23);pose(c,0,(1-t)*25*intensity,.35+.65*back(t),(1-t)*(i%2?7:-7)*intensity,t,18*(1-t)*intensity);});
  }else if(preset==='headline-drop'){
   box(subject,36,39,28,61);cards.forEach((c,i)=>{box(c,i?70:4,35,26,53);const t=phase(p,.03+i*.03,.21+i*.03);pose(c,0,(1-t)*30*intensity,.6+.4*back(t),0,t,8*(1-t));});const t=phase(p,.1,.24),exit=phase(p,.5,.87);pose(title,0,-160*(1-back(t))*intensity,1,0,t*(1-exit),exit*12*intensity);title.style.clipPath=`inset(0 ${exit*100}% 0 0)`;
  }else if(preset==='cards-assemble'){
   box(subject,3,26,21,67);const final=[[52,9],[34,37],[70,37],[34,65],[70,65]];cards.forEach((c,i)=>{const start=.03+i*.135,enter=phase(p,start,start+.07),settle=smooth(phase(p,start+.07,start+.17));const [x,y]=final[i];box(c,32+(x-32)*settle,16+(y-16)*settle,63-38*settle,69-43*settle);pose(c,0,0,.45+.55*back(enter),0,enter,10*(1-enter)*intensity);c.style.zIndex=String(10+i);});
  }else if(preset==='evidence-pop'){
   box(subject,3,31,30,69);cards.forEach((c,i)=>{box(c,i?53:4,i?58:8,i?43:31,36);const t=phase(p,i*.38,.15+i*.38);pose(c,0,20*(1-t)*intensity,.3+.7*back(t),0,t,6*(1-t));});const t=phase(p,.55,.85);pose(title,20*(1-t)*intensity,0,1,0,t,10*(1-t)*intensity);title.style.color='#f47967';
  }else if(preset==='double-flip'){
   box(subject,36,12,28,88);cards.forEach((c,i)=>{const side=i%2,second=i>1;box(c,side?73:2,35,25,61);const enter=phase(p,.04+side*.17,.2+side*.17),flip=phase(p,.57+side*.07,.7+side*.07);const visible=second?(flip>=.5?1:0):(flip<.5?enter:0);pose(c,0,second?0:(1-enter)*30*intensity,1,0,visible,0,second?(1-flip)*-180:flip*180);});
  }else if(preset==='cover-punch'){
   box(subject,31,8,38,92);const enter=phase(p,.06,.2),zoom=phase(p,.37,.55),reveal=phase(p,.55,.67);pose(title,0,0,.5+.5*back(enter),0,enter*(1-reveal),zoom*10*intensity);pose(subject,0,0,1+zoom*.7*intensity,0,1-reveal,zoom*8*intensity);pose(cover,0,0,1.4-.4*smooth(reveal),0,reveal,14*(1-reveal)*intensity);const t=smooth(phase(p,.65,.77));pose(cover.querySelector('h3'),0,(1-t)*50,1,0,t);pose(cover.querySelector('span'),0,(1-t)*50,1,0,t);
  }else if(preset==='background-rise'){
   box(subject,29,13,42,87);backs.forEach((b,i)=>{const start=.025+i*.235,end=start+.16,t=smooth(phase(p,start,end)),exit=i===2?smooth(phase(p,.87,1)):0;pose(b,0,(1-t)*110-exit*20,1.05,0,t*(1-exit),10*(1-t)+exit*8);});
  }
 }
 const state={get progress(){return progress;},set progress(v){progress=v;draw();}};
 const timeline=root.gsap.timeline({paused:true}).to(state,{progress:1,duration,ease:'none'});draw();
 const instance={timeline,duration,element,destroy(){timeline.kill();element.remove();if(instances.get(container)===instance)instances.delete(container);}};instances.set(container,instance);return instance;
}
root.StoryMotion=Object.freeze({mount,presets:Object.freeze(Object.keys(definitions)),definitions:Object.freeze(definitions)});
})(window);
