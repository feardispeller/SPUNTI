
/* ============================================================
   PUNTI E SPUNTI — motion & atmosphere
   ============================================================ */
(function(){
"use strict";

var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
(function(){var pl=document.getElementById('preloader'); if(pl) pl.style.animation='none';})();
if(window.console) console.log('PUNTI E SPUNTI — atelier build VII'+(REDUCED?' (reduced motion)':''));
/* the veil never stays down, whatever happens */
setTimeout(function(){
  var pl=document.getElementById('preloader');
  if(pl && pl.style.display!=='none'){
    pl.style.transition='opacity .8s ease'; pl.style.opacity='0';
    setTimeout(function(){ pl.style.display='none'; },850);
  }
},9000);
var TOUCH   = window.matchMedia('(pointer: coarse)').matches;
var HAS_GSAP  = typeof window.gsap !== 'undefined';
var HAS_ST    = typeof window.ScrollTrigger !== 'undefined';
var HAS_THREE = typeof window.THREE !== 'undefined';

/* ---------- build letter spans (always) ---------- */
function letters(el, word){
  if(!el) return;
  word = word || (el.textContent||'').trim();
  el.innerHTML = '';
  for(var i=0;i<word.length;i++){
    var s=document.createElement('span');
    s.textContent = (word[i]===' ' ? '\u00A0' : word[i]);
    el.appendChild(s);
  }
}
letters(document.getElementById('plP'));
(function(){
  var w=document.querySelector('#heroTitle .ht-word');
  if(!w) return;
  letters(w,'SPUNTI');
  if(w.firstChild) w.firstChild.className='ht-s';
  /* type set by hand never sits perfectly on the line */
  var JR=[-.42,.28,-.19,.4,-.3,.23], JY=[0,.9,-.75,.55,-.45,.8];
  [].forEach.call(w.children,function(sp,i){
    sp.dataset.jr=JR[i%JR.length];
    sp.dataset.jy=JY[i%JY.length];
  });
})();

/* the closing wordmark now lives in the HTML, already sewn */

/* ---------- marquee content (always) ---------- */
(function(){
  var items=['Raffia','Vegetable-tanned leather','Wild palm','Organic cotton','Brass','Olivewood','Indigo','Waxed linen'];
  function fill(id){
    var mq=document.getElementById(id); if(!mq) return;
    for(var c=0;c<2;c++){
      var inner=document.createElement('div'); inner.className='mq-inner';
      for(var r=0;r<2;r++){
        items.forEach(function(t){
          var s=document.createElement('span'); s.textContent=t;
          var i=document.createElement('i'); i.textContent='✦';
          inner.appendChild(s); inner.appendChild(i);
        });
      }
      mq.appendChild(inner);
    }
  }
  fill('mq1'); fill('mq2');
})();

/* ---------- split manifesto & quote into words (always) ---------- */
function splitWords(el){
  if(!el) return;
  function process(node, parent){
    var kids=[].slice.call(node.childNodes);
    kids.forEach(function(ch){
      if(ch.nodeType===3){
        var parts=ch.textContent.split(/(\s+)/);
        var frag=document.createDocumentFragment();
        parts.forEach(function(p){
          if(!p) return;
          if(/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(' ')); }
          else{ var w=document.createElement('span'); w.className='w'; w.textContent=p; frag.appendChild(w); }
        });
        node.replaceChild(frag, ch);
      } else if(ch.nodeType===1){ process(ch); }
    });
  }
  process(el);
}
splitWords(document.getElementById('mfText'));
splitWords(document.getElementById('atQuote'));

/* ---------- hand-drawn rules where hairlines used to be ---------- */
(function(){
  function rule(el,pos){
    var r=document.createElement('span');
    r.className='hrule '+pos; r.setAttribute('aria-hidden','true');
    el.appendChild(r);
  }
  var stats=document.querySelector('.stats'); if(stats) rule(stats,'top');
  [].forEach.call(document.querySelectorAll('.stat'),function(el){ rule(el,'bottom'); });
  [].forEach.call(document.querySelectorAll('.step'),function(el,i){
    if(i===0) rule(el,'top');
    rule(el,'bottom');
  });
  var ftr=document.querySelector('.ft-row'); if(ftr) rule(ftr,'top');
})();

/* ---------- wrap .rl line contents (always) ---------- */
[].forEach.call(document.querySelectorAll('.rl'), function(rl){
  var inner=document.createElement('span');
  inner.innerHTML=rl.innerHTML; rl.innerHTML=''; rl.appendChild(inner);
});
