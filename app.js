(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML};

/* progress + to-top */
var bar=$('#progress'), totop=$('#totop');
function onScroll(){
  var h=document.documentElement, max=h.scrollHeight-h.clientHeight;
  if(bar) bar.style.width=(max>0?(h.scrollTop/max*100):0)+'%';
  if(totop) totop.classList.toggle('show',h.scrollTop>700);
}
addEventListener('scroll',onScroll,{passive:true}); onScroll();
if(totop) totop.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'})});

/* mobile nav */
var burger=$('.burger'), nav=$('.nav');
if(burger&&nav){
  burger.addEventListener('click',function(){
    var o=nav.classList.toggle('open'); burger.setAttribute('aria-expanded',o);
  });
}

/* reveal */
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(en){
    if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}
  })},{threshold:.1});
  $$('.reveal').forEach(function(el){io.observe(el)});
}else{ $$('.reveal').forEach(function(el){el.classList.add('in')}); }

/* flip placards */
function setFlip(fl,on){
  fl.classList.toggle('flipped',on);
  var f=$('.front',fl), b=$('.back',fl);
  if(on){ f.setAttribute('inert',''); b.removeAttribute('inert'); }
  else { b.setAttribute('inert',''); f.removeAttribute('inert'); }
}
$$('.flipper').forEach(function(fl){ setFlip(fl,false); });
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-flip]');
  if(t){
    var fl=t.closest('.flipper'); setFlip(fl,!fl.classList.contains('flipped'));
    var tgt=$(fl.classList.contains('flipped')?'.back .btn':'.front .btn',fl); if(tgt) tgt.focus({preventScroll:true});
  }
});

/* thumbnail viewer */
function showImg(media,src,btn){
  var v=$('.viewer',media), im=$('img',v);
  v.classList.add('fade');
  setTimeout(function(){ im.src=src; v.dataset.src=src; v.style.setProperty('--bg','url("'+src+'")'); v.classList.remove('fade'); },180);
  $$('.thumb',media).forEach(function(b){b.classList.toggle('on',b===btn)});
}
$$('.ex-media').forEach(function(m){
  var v=$('.viewer',m); v.dataset.src=$('img',v).getAttribute('src'); v.style.setProperty('--bg','url("'+v.dataset.src+'")');
  $$('.thumb',m).forEach(function(b){ b.addEventListener('click',function(){showImg(m,b.dataset.src,b)}); });
});

/* overlay plumbing */
var overlay=$('#overlay'), modal=$('#modal'), lastFocus=null;
function openOverlay(html,cls){
  lastFocus=document.activeElement;
  overlay.className='overlay open '+(cls||'');
  modal.innerHTML='<button class="x" aria-label="Close">&times;</button>'+html;
  document.body.style.overflow='hidden';
  $('.x',modal).focus();
}
function closeOverlay(){
  overlay.className='overlay'; document.body.style.overflow='';
  if(lastFocus&&lastFocus.focus) lastFocus.focus();
}
if(overlay){
  overlay.addEventListener('click',function(e){ if(e.target===overlay||e.target.closest('.x')) closeOverlay(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&overlay.classList.contains('open')) closeOverlay(); });
}

/* exhibit reading modal */
function openReading(id){
  var x=(window.EX||{})[id]; if(!x) return;
  var thumbs=x.imgs.length>1?'<div class="thumbs">'+x.imgs.map(function(u,i){
    return '<button class="thumb'+(i?'':' on')+'" data-src="'+u+'" aria-label="Show image '+(i+1)+'"><img src="'+u+'" alt=""></button>';
  }).join('')+'</div>':'';
  openOverlay(
    '<div class="mh"><div class="k">'+esc(x.wing)+' &middot; '+esc(x.year)+'</div><h3>'+esc(x.title)+'</h3></div>'+
    '<div class="mhero" style="--bg:url(\''+x.imgs[0]+'\')"><img id="mhero" src="'+x.imgs[0]+'" alt="'+esc(x.title)+'"></div>'+thumbs+
    '<div class="mb">'+x.story.map(function(p){return '<p>'+esc(p)+'</p>'}).join('')+
    '<h5>Did you know?</h5><p>'+esc(x.trivia)+'</p>'+
    '<h5>Echoes in the present day</h5><p>'+esc(x.now)+'</p>'+
    '<div class="btns"><a class="btn solid" href="'+x.link+'" target="_blank" rel="noopener noreferrer">Learn More &#8599;</a><button class="btn" data-close>Close</button></div></div>',
    'reading');
  modal.style.setProperty('--accent',x.color);
}
document.addEventListener('click',function(e){
  var o=e.target.closest('[data-open]'); if(o){ openReading(o.dataset.open); return; }
  if(e.target.closest('[data-close]')){ closeOverlay(); return; }
  var th=e.target.closest('#modal .thumb');
  if(th){ $('#mhero').src=th.dataset.src; $('.mhero',modal).style.setProperty('--bg','url("'+th.dataset.src+'")'); $$('#modal .thumb').forEach(function(b){b.classList.toggle('on',b===th)}); }
});

/* lightbox (matrices + exhibit photos) */
function openLightbox(src,title,zoomable){
  openOverlay(
    '<div class="lbbar"><b>'+esc(title)+'</b><span>'+
    (zoomable?'<button class="btn" data-zoom>Zoom to actual size</button> ':'')+
    '<a class="btn" href="'+src+'" target="_blank" rel="noopener">Open original &#8599;</a></span></div>'+
    '<div class="lbscroll"><img src="'+src+'" alt="'+esc(title)+'"></div>','lightbox');
}
document.addEventListener('click',function(e){
  var z=e.target.closest('[data-zoom]');
  if(z){ var on=overlay.classList.toggle('zoomed'); z.textContent=on?'Fit to window':'Zoom to actual size'; return; }
  var lb=e.target.closest('[data-lightbox]');
  if(lb){ openLightbox(lb.dataset.lightbox,lb.dataset.title||'',true); return; }
  var vw=e.target.closest('.viewer');
  if(vw){ var t=vw.closest('.ex'); openLightbox(vw.dataset.src,($('h3',t)||{}).textContent||'',false); }
});
$$('[data-lightbox]').forEach(function(el){
  el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();} });
});

/* jump bar highlighting */
var jumps=$$('.jump a');
if(jumps.length&&'IntersectionObserver' in window){
  var spy=new IntersectionObserver(function(es){es.forEach(function(en){
    if(en.isIntersecting){ jumps.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+en.target.id)}); }
  })},{rootMargin:'-35% 0px -55% 0px'});
  $$('.ex').forEach(function(s){spy.observe(s)});
}
})();
