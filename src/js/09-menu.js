

/* ============================================================
   Menu overlay
   ============================================================ */
var menuOpen=false;
function openMenu(){
  if(menuOpen) return; menuOpen=true;
  var menu=document.getElementById('menu');
  document.body.classList.add('menu-open');
  document.getElementById('menuWord').textContent=(LBL||LABELS.en).close;
  document.getElementById('menuToggle').setAttribute('aria-expanded','true');
  menu.setAttribute('aria-hidden','false');
  if(lenis&&lenis.stop) lenis.stop();
  if(HAS_GSAP){
    gsap.set(menu,{visibility:'visible'});
    gsap.to(menu,{clipPath:'inset(0 0 0% 0)',duration:.85,ease:'power4.inOut'});
    gsap.to('.menu-links .ml-inner',{y:0,duration:1.05,stagger:.07,ease:'power4.out',delay:.3});
    gsap.to('.menu-foot',{opacity:1,duration:.8,delay:.7});
  }else{
    menu.style.visibility='visible'; menu.style.clipPath='inset(0 0 0% 0)';
  }
}
function closeMenu(){
  if(!menuOpen) return; menuOpen=false;
  var menu=document.getElementById('menu');
  document.body.classList.remove('menu-open');
  document.getElementById('menuWord').textContent=(LBL||LABELS.en).menu;
  document.getElementById('menuToggle').setAttribute('aria-expanded','false');
  menu.setAttribute('aria-hidden','true');
  if(HAS_GSAP){
    gsap.to('.menu-links .ml-inner',{y:'115%',duration:.5,stagger:.03,ease:'power3.in'});
    gsap.to('.menu-foot',{opacity:0,duration:.4});
    gsap.to(menu,{clipPath:'inset(0 0 100% 0)',duration:.8,ease:'power4.inOut',delay:.25,
      onComplete:function(){ gsap.set(menu,{visibility:'hidden'}); if(lenis&&lenis.start) lenis.start(); }});
  }else{
    menu.style.visibility='hidden'; menu.style.clipPath='inset(0 0 100% 0)';
    if(lenis&&lenis.start) lenis.start();
  }
}
if(HAS_GSAP && !REDUCED){
  gsap.set('.menu-links .ml-inner',{y:'115%'});
  document.getElementById('menuToggle').addEventListener('click', function(){
    menuOpen?closeMenu():openMenu();
  });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeMenu(); });
}