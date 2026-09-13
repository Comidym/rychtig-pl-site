'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const woods = {
  ash: {name:'Jesion',color:'#c7aa77',filter:'brightness(1.4) saturate(.48)'},
  red: {name:'Dąb czerwony',color:'#b17c56',filter:'sepia(.35) saturate(1.25) hue-rotate(-14deg)'},
  oak: {name:'Dąb',color:'#ab7848',filter:'none'},
  burgundy: {name:'Dąb burgundzki',color:'#795039',filter:'brightness(.65) saturate(.7) sepia(.2)'}
};
const defaults = {wood:'oak',width:160,depth:80};
let state = {...defaults};
try { const stored = JSON.parse(localStorage.getItem('rychtig-config-v1')); if(stored && woods[stored.wood] && Number.isInteger(stored.width) && stored.width>=60 && stored.width<=300 && Number.isInteger(stored.depth) && stored.depth>=40 && stored.depth<=150) state=stored; } catch {}
const form=$('#config-form');
$('#width').value=state.width; $('#depth').value=state.depth;
function save(){try{localStorage.setItem('rychtig-config-v1',JSON.stringify(state));}catch{}}
function render(){
 const w=woods[state.wood];
 document.documentElement.style.setProperty('--wood-color',w.color);
 document.documentElement.style.setProperty('--wood-filter',w.filter);
 $$('[data-wood]').forEach(b=>{const selected=b.dataset.wood===state.wood;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
 $('#preview-width').textContent=state.width+' cm';$('#preview-depth').textContent=state.depth+' cm';
 $('#preview-spec').textContent=`${w.name} / ${state.width} × ${state.depth} cm`;
 $('#summary').textContent=`${w.name} · ${state.width} × ${state.depth} cm`;
 const ratio=state.width/state.depth;
 $('.preview-top').style.transform=`rotate(-7deg) scale(${Math.min(1,ratio/2)},${Math.min(1,2/ratio)})`;
}
$$('[data-wood]').forEach(b=>b.addEventListener('click',()=>{state.wood=b.dataset.wood;render();save();const photo=$('.wood-photo');photo.classList.remove('revealing');void photo.offsetWidth;photo.classList.add('revealing');$('#form-status').textContent='';}));
['width','depth'].forEach(key=>$('#'+key).addEventListener('input',e=>{if(e.target.validity.valid){state[key]=Number(e.target.value);render();save();}$('#form-status').textContent='';}));
render();$('.download').disabled=false;
form.addEventListener('submit',e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const text=`RYCHTIG\nTWÓJ STÓŁ. TWOJA KONFIGURACJA.\n\nDrewno: ${woods[state.wood].name}\nSzerokość blatu: ${state.width} cm\nGłębokość blatu: ${state.depth} cm\nRegulacja wysokości: elektryczna\n\nJest to zapis preferencji, nie zamówienie ani oferta cenowa.\nDo indywidualnego ustalenia: możliwość wykonania wymiarów, wykończenie i próbka drewna, wybór stelaża, zakres wysokości, cena, dostawa i termin realizacji.\n\nWizualizacje na stronie są poglądowe. Naturalne drewno różni się kolorem i usłojeniem.\n\nData zapisu: ${new Date().toLocaleDateString('pl-PL')}\n`;
 const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download=`Rychtig-${state.width}x${state.depth}-${state.wood}.txt`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('#form-status').textContent='Karta stołu jest gotowa do pobrania. Nic nie zostało wysłane.';
});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(window.ScrollCraft)ScrollCraft.mount(document.body);
const motion=$('#ruch'),demo=$('.desk-demo'),hero=$('.hero'),obj=$('.hero-object'),halo=$('.hero-halo');
let manualLift=null,pointerX=0,pointerY=0,pending=false;
function setLift(v){
 demo.style.setProperty('--lift',v.toFixed(4));
 demo.dataset.scVerifyState='tabletop-translate-'+Math.round(v*(innerWidth<=700?78:130));
 $('#position-name').textContent=v>.55?'Przestrzeń na nowe pomysły.':'Miejsce na skupienie.';
 $$('[data-lift]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.lift)===(v>.5?1:0))));
}
function frame(){
 pending=false;
 const rect=motion.getBoundingClientRect();
 const progress=reduced.matches?0:Math.max(0,Math.min(1,-rect.top/Math.max(1,motion.offsetHeight-innerHeight)));
 setLift(manualLift===null?progress:manualLift);
 if(!reduced.matches){
  const hr=hero.getBoundingClientRect();
  if(hr.bottom>0){const travel=Math.max(0,-hr.top);obj.style.translate=`${pointerX*5}px ${travel*.13+pointerY*3}px`;halo.style.transform=`translate(${pointerX*12}px,${travel*.06+pointerY*8}px)`;}
 }else{obj.style.translate='none';halo.style.transform='none';}
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(frame);}}
addEventListener('scroll',schedule,{passive:true});
addEventListener('wheel',()=>{manualLift=null;schedule();},{passive:true});
addEventListener('touchmove',()=>{manualLift=null;schedule();},{passive:true});
addEventListener('keydown',e=>{if(['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(e.key)&&!['INPUT','TEXTAREA','BUTTON'].includes(e.target.tagName)){manualLift=null;schedule();}});
addEventListener('resize',schedule,{passive:true});
hero.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduced.matches)return;pointerX=e.clientX/innerWidth*2-1;pointerY=e.clientY/innerHeight*2-1;schedule();});
hero.addEventListener('pointerleave',()=>{pointerX=pointerY=0;schedule();});
$$('[data-lift]').forEach(b=>b.addEventListener('click',()=>{manualLift=Number(b.dataset.lift);setLift(manualLift);schedule();}));
reduced.addEventListener('change',()=>{manualLift=null;schedule();});schedule();
const privacy=$('#privacy');$('#privacy-button').addEventListener('click',()=>privacy.showModal());$('.close-dialog').addEventListener('click',()=>privacy.close());
privacy.addEventListener('click',e=>{if(e.target===privacy){const r=privacy.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)privacy.close();}});
$('#clear-data').addEventListener('click',()=>{try{localStorage.removeItem('rychtig-config-v1');}catch{}state={...defaults};$('#width').value=state.width;$('#depth').value=state.depth;render();$('#privacy-status').textContent='Zapisana konfiguracja została usunięta.';});
$('#year').textContent=new Date().getFullYear();
