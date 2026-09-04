

/* ============================================================
   Smooth scroll — Lenis, or a graceful inline fallback
   ============================================================ */
var lenis=null;
function MiniLenis(){
  var self=this; this._cbs=[];
  this._current=window.scrollY; this._target=window.scrollY;
  this._stopped=false; this._selfScroll=false;
  var max=function(){ return Math.max(0, document.documentElement.scrollHeight - window.innerHeight); };
  if(!TOUCH && !REDUCED){
    window.addEventListener('wheel', function(e){
      if(self._stopped) return;
      e.preventDefault();
      var d=e.deltaY; if(e.deltaMode===1) d*=16; if(e.deltaMode===2) d*=window.innerHeight;
      self._target=Math.max(0, Math.min(max(), self._target+d));
    }, {passive:false});
  }
  window.addEventListener('scroll', function(){
    if(self._selfScroll){ self._selfScroll=false; return; }
    self._current=self._target=window.scrollY;
  }, {passive:true});
  this.raf=function(){
    var diff=self._target-self._current;
    if(Math.abs(diff)>0.1){
      self._current+=diff*0.085;
      self._selfScroll=true;
      window.scrollTo(0, self._current);
      self._cbs.forEach(function(cb){cb();});
    }
  };
  this.on=function(ev,cb){ if(ev==='scroll') self._cbs.push(cb); };
  this.stop=function(){ self._stopped=true; };
  this.start=function(){ self._stopped=false; self._current=self._target=window.scrollY; };
  this.scrollTo=function(target,opts){
    var y=typeof target==='number'?target:(target?target.getBoundingClientRect().top+window.scrollY:0);
    if(opts&&opts.offset) y+=opts.offset;
    self._target=Math.max(0,Math.min(max(),y));
    if(TOUCH||REDUCED){ window.scrollTo({top:y,behavior:REDUCED?'auto':'smooth'}); self._current=self._target=y; }
  };
}
if(!REDUCED){
  try{
    if(typeof window.Lenis!=='undefined'){
      lenis=new window.Lenis({ duration:1.15, easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t));}, smoothWheel:true, touchMultiplier:1.6 });
    }else{
      lenis=new MiniLenis();
    }
  }catch(e){ lenis=new MiniLenis(); }
}

/* anchor drift */
[].forEach.call(document.querySelectorAll('a[href^="#"]'), function(a){
  a.addEventListener('click', function(e){
    var id=a.getAttribute('href'); if(id.length<2) return;
    var t=document.querySelector(id); if(!t) return;
    e.preventDefault();
    if(document.body.classList.contains('menu-open')) closeMenu();
    setTimeout(function(){
      if(lenis&&lenis.scrollTo) lenis.scrollTo(t,{offset:0});
      else t.scrollIntoView({behavior:'smooth'});
    }, document.body.classList.contains('menu-open')?700:0);
  });
});