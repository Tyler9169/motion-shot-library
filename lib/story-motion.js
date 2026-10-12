/* Reusable scene motions reconstructed from user-supplied video references. */
(function(root){
'use strict';
const instances=new WeakMap();
const definitions={
 "text-contract-expand":{"duration": 2.067, "count": 0, "title": "对话灵感", "subtitle": "让下一句话接住上一句话", "coverTitle": "打开更多可能"},
 "triple-rise":{"duration": 10.367, "count": 3, "title": "三个新方向", "subtitle": "先看一个，再看整体"},
 "folder-collect":{"duration": 4.5, "count": 2, "title": "值得收藏", "subtitle": "把好想法收进同一个地方", "coverTitle": "随时翻阅"},
 "icon-rise-badges":{"duration": 6.533, "count": 3, "title": "灵感工具", "subtitle": "一个主角，两条亮点"},
 "avatar-circle-corner":{"duration": 1, "count": 0, "title": "新视角", "subtitle": "把舞台留给接下来的内容"},
 "side-card-reveal":{"duration": 1.133, "count": 2, "title": "两种可能", "subtitle": "左右亮点依次展开"},
 "headline-split-swap":{"duration": 2.6, "count": 0, "title": "今天", "subtitle": "从开场强调，到下一句重点", "coverTitle": "全部整理"},
 "keywords-drop":{"duration": 2.554, "count": 3, "title": "一次讲清", "subtitle": "把重点依次摆出来"},
 "panel-pop":{"duration": 3.033, "count": 1, "title": "打开一个新画面", "subtitle": "由一个图标，进入完整内容"},
 "cursor-page-pull":{"duration": 1.967, "count": 5, "title": "探索更多", "subtitle": "拉开页面，汇集灵感"},
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
 const isOctober=["text-contract-expand", "triple-rise", "folder-collect", "icon-rise-badges", "avatar-circle-corner", "side-card-reveal", "headline-split-swap", "keywords-drop", "panel-pop", "cursor-page-pull"].includes(preset);if(isOctober)element.classList.add('october-scene');
 element.innerHTML='<div class="story-background"><div class="story-grid"></div><span>STORY / MOTION</span><b>CREATE<br>YOUR WORLD.</b></div><div class="story-backdrops"></div><div class="story-cards"></div><h3 class="story-title"></h3><div class="story-subject"><div class="story-person"><i></i><b></b></div><span>YOUR STORY</span></div><div class="story-reaction"></div><div class="story-cover"><div class="story-lockers"></div><h3></h3><span>CHAPTER 01</span></div><p class="story-caption"></p>';
 const $=s=>element.querySelector(s),subject=$('.story-subject'),title=$('.story-title'),caption=$('.story-caption'),cover=$('.story-cover'),reaction=$('.story-reaction');
 title.textContent=options.title??def.title;caption.textContent=options.subtitle??def.subtitle;cover.querySelector('h3').textContent=options.coverTitle??def.coverTitle??'新的篇章';
 const img=(src,parent)=>{if(typeof src!=='string'||!src)return;const im=document.createElement('img');im.src=src;im.alt='';im.draggable=false;parent.append(im);};
 if(options.subjectSrc){subject.replaceChildren();img(options.subjectSrc,subject);subject.classList.add('has-image');}
 img(options.backgroundSrc,$('.story-background'));
 const items=Array.isArray(options.items)?options.items:[];
 const cards=Array.from({length:def.count},(_,i)=>{const c=document.createElement('div');c.className='story-card';c.dataset.index=i;c.style.setProperty('--hue',String(140+i*38));c.innerHTML='<div class="story-art"><i></i><b></b><em></em></div><strong></strong>';c.querySelector('strong').textContent=items[i]?.label??['探索','连接','创造','分享','成长'][i];img(items[i]?.src,c);$('.story-cards').append(c);return c;});
 const backs=preset==='background-rise'?Array.from({length:3},(_,i)=>{const el=document.createElement('div');el.className='story-backdrop';el.style.setProperty('--hue',String(145+i*55));el.innerHTML='<small>IDEA / 0'+(i+1)+'</small><b></b><div class="story-art"><i></i><b></b><em></em></div>';el.querySelector('b').textContent=items[i]?.label??['EXPLORE','CREATE','SHARE'][i];img(items[i]?.src,el);$('.story-backdrops').append(el);return el;}):[];
 let secondTitle,folder,cursor,page,pageTiles=[];
 if(isOctober){
  secondTitle=document.createElement('h3');secondTitle.className='oct-second-title';secondTitle.textContent=options.coverTitle??def.coverTitle??'新的可能';element.append(secondTitle);
  if(preset==='folder-collect'){folder=document.createElement('div');folder.className='oct-folder';folder.innerHTML='<div class="oct-folder-tab"></div><div class="oct-folder-paper"></div><div class="oct-folder-front"></div>';element.append(folder);}
  if(preset==='folder-collect'||preset==='cursor-page-pull'){cursor=document.createElement('div');cursor.className='oct-cursor';cursor.innerHTML='<svg viewBox="0 0 32 40"><path d="M3 2L28 26L17 27L13 38L9 36L13 25L3 29Z" fill="white" stroke="#182127" stroke-width="2"/></svg><i></i>';element.append(cursor);}
  if(preset==='cursor-page-pull'){page=document.createElement('div');page.className='oct-page';const heading=document.createElement('b');heading.textContent=options.coverTitle??'IDEA COLLECTION';page.append(heading);pageTiles=Array.from({length:9},(_,i)=>{const tile=document.createElement('div');tile.className='oct-tile';tile.style.setProperty('--tile-hue',String(150+i*27));const label=document.createElement('strong');label.textContent=items[i%5]?.label??['探索','连接','创造','分享','成长'][i%5];const icon=document.createElement('span');icon.textContent=['✦','◈','◎','◇','✳'][i%5];tile.append(icon,label);if(items[i%5]?.src){img(items[i%5].src,tile);icon.hidden=true;}page.append(tile);return tile;});element.append(page);}
 }
 container.append(element);
 // All visible properties are derived from normalized progress, including reverse seeks.
 const pose=(el,x=0,y=0,scale=1,rotation=0,opacity=1,blur=0,flip=0)=>{el.style.transform=`translate(${x}%,${y}%) scale(${scale}) rotate(${rotation}deg) rotateY(${flip}deg)`;el.style.opacity=String(clamp(opacity));el.style.filter=`blur(${Math.max(0,blur)}px)`;};
 const box=(el,x,y,w,h)=>Object.assign(el.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});
 let progress=0;
 function draw(){const p=progress;pose(title);pose(subject);pose(cover,0,0,1,0,0);pose(reaction,0,0,1,0,0);box(subject,37,30,26,70);title.style.opacity='0';
  if(isOctober){
   pose(secondTitle,0,0,1,0,0);title.style.clipPath='none';
   if(preset==='text-contract-expand'){
    box(subject,34,8,32,92);const enter=smooth(phase(p,.07,.25)),swap=phase(p,.48,.67);pose(title,0,0,(.35+.65*back(enter))*(1-.85*smooth(swap)),0,enter*(1-swap),12*(1-enter)+8*swap);
    pose(secondTitle,0,0,.55+.45*back(swap),0,swap,10*(1-swap));
   }else if(preset==='triple-rise'){
    pose(subject,0,0,1,0,0);cards.forEach((c,i)=>{const starts=[.035,.4,.7],x=[38,7,69][i],t=phase(p,starts[i],starts[i]+.065);box(c,x,24,24,57);pose(c,0,145*(1-back(t))*intensity,.86+.14*back(t),0,t,2*(1-t));});
   }else if(preset==='folder-collect'){
    box(subject,46,9,34,91);cards.forEach((c,i)=>{const enter=phase(p,.06+i*.18,.16+i*.18),collect=smooth(phase(p,.59+i*.035,.77+i*.035));box(c,4+26*collect,29+i*20-10*collect,32,16);pose(c,0,0,(.65+.35*back(enter))*(1-.93*collect),0,enter*(1-collect),4*collect);});
    const ft=phase(p,.46,.58),lift=smooth(phase(p,.77,.9)),exit=phase(p,.94,1);box(folder,22,48-20*lift,24,29);pose(folder,0,30*(1-back(ft)),.8+.2*back(ft),0,ft*(1-exit));folder.style.setProperty('--open',String(Math.sin(phase(p,.58,.83)*Math.PI)));
    box(cursor,39,59,5,9);pose(cursor,0,0,1,0,phase(p,.49,.55)*(1-phase(p,.77,.84)));pose(secondTitle,0,0,1,0,lift*(1-exit));
   }else if(preset==='icon-rise-badges'){
    pose(subject,0,0,1,0,0);const t=phase(p,.035,.14),expand=smooth(phase(p,.17,.3));box(cards[0],38-9*expand,21,24+18*expand,48);pose(cards[0],0,150*(1-back(t))*intensity,.9+.1*back(t),0,t);cards.slice(1).forEach((c,i)=>{const t=phase(p,.27+i*.23,.34+i*.23);box(c,i?75:7,55,17,27);pose(c,0,160*(1-back(t))*intensity,.6+.4*back(t),0,t);});
   }else if(preset==='avatar-circle-corner'){
    const cut=smooth(phase(p,0,.1)),move=smooth(phase(p,.08,.32));box(subject,(34*cut)*(1-move)+2*move,4*cut+65*move,100-66*cut-17*move,100-46*cut-27*move);subject.style.borderRadius=(50*cut)+'%';const t=phase(p,.27,.5);pose(title,0,0,.4+.6*back(t),0,t,5*(1-t));
   }else if(preset==='side-card-reveal'){
    box(subject,36,9,28,91);cards.forEach((c,i)=>{const t=phase(p,i===0?.01:.45,i===0?.15:.67);box(c,i===0?73:2,25,25,60);pose(c,(1-back(t))*(i===0?-110:110)*intensity,0,.85+.15*back(t),0,t,2*(1-t),(1-t)*(i===0?-85:85));});
   }else if(preset==='headline-split-swap'){
    box(subject,35,7,30,93);const t=phase(p,.025,.19),exit=phase(p,.34,.49),next=phase(p,.53,.67);pose(title,0,0,.5+.5*back(t),0,t*(1-exit),5*(1-t));title.style.letterSpacing=(1.2*(1-t)*intensity)+'em';pose(secondTitle,55*(1-smooth(next))*intensity,0,.7+.3*back(next),0,next,6*(1-next));
   }else if(preset==='keywords-drop'){
    box(subject,34,8,32,92);cards.forEach((c,i)=>{const positions=[[67,22],[35,72],[3,45]],start=[.03,.29,.55][i],t=phase(p,start,start+.13),exit=phase(p,.76,.85);box(c,...positions[i],30,15);pose(c,0,-420*(1-back(t))*intensity,1,0,t*(1-exit),8*(1-t));});const t=phase(p,.82,.96);pose(title,0,0,.5+.5*back(t),0,t);
   }else if(preset==='panel-pop'){
    box(subject,1,59,19,41);const icon=phase(p,.06,.2),panel=phase(p,.36,.51);pose(title,0,0,1,0,1-icon);pose(secondTitle,0,0,.4+.6*back(icon),0,icon*(1-panel));box(cards[0],13,9,78,80);pose(cards[0],0,0,.15+.85*back(panel),0,panel,5*(1-panel));
   }else if(preset==='cursor-page-pull'){
    box(subject,1,63,18,37);const pull=smooth(phase(p,.18,.36)),collapse=smooth(phase(p,.73,.97));pose(title,0,0,1,0,1-pull);pose(page,0,-105*(1-pull)*intensity,1,0,pull);box(cursor,50,6+39*pull,6,11);pose(cursor,0,0,1,0,phase(p,.06,.16)*(1-phase(p,.38,.45)));cursor.style.setProperty('--press',String(phase(p,.17,.23)*(1-phase(p,.29,.34))));pageTiles.forEach((tile,i)=>{const col=i%3,row=Math.floor(i/3);const x=12+col*28,y=15+row*27;box(tile,x+(28+col*13-x)*collapse,y+(71+(i%2)*6-y)*collapse,19-4*collapse,22-5*collapse);pose(tile,0,0,1,(i%3-1)*9*collapse);});
   }
  }else if(preset==='reaction-stretch'){
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
