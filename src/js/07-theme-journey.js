

/* ============================================================
   Theme journey — background & ink morph per section
   ============================================================ */
function hexToRgbStr(hex){
  var h=hex.replace('#','');
  var n=parseInt(h,16);
  return ((n>>16)&255)+','+((n>>8)&255)+','+(n&255);
}
var themeTween=null;
function applyTheme(bg, ink, line){
  var root=document.documentElement;
  var isLight=(function(){var n=parseInt(bg.slice(1),16);var r=(n>>16)&255,g=(n>>8)&255,b=n&255;return (r*.299+g*.587+b*.114)>150;})();
  if(HAS_GSAP){
    if(themeTween) themeTween.kill();
    themeTween=gsap.to(root,{'--bg':bg,'--ink':ink,'--line':line,duration:1.1,ease:'power2.out',
      onUpdate:function(){ root.style.setProperty('--ink-rgb', hexToRgbStr(ink)); }});
  }else{
    root.style.setProperty('--bg',bg); root.style.setProperty('--ink',ink);
    root.style.setProperty('--line',line); root.style.setProperty('--ink-rgb',hexToRgbStr(ink));
  }
  /* the shared S must stay the brightest note in the wordmark on every
     ground the journey passes through — clay on the creams, a lifted
     peach once the page turns terracotta */
  root.style.setProperty('--mark', isLight ? '#B0562F' : '#F2C7A8');
  var vg=document.getElementById('vignette');
  if(vg){
    if(HAS_GSAP) gsap.to(vg,{opacity:isLight?.28:.55,duration:1.2,ease:'power2.out'});
    else vg.style.opacity=isLight?.28:.55;
  }
  if(HAS_GSAP && GL && GL.ok){
    var fogC=new THREE.Color(bg);
    gsap.to(GL.fog.color,{r:fogC.r,g:fogC.g,b:fogC.b,duration:1.2,ease:'power2.out'});
    var dustC=new THREE.Color(isLight?0x8A5A3C:0xF6E4CC);
    gsap.to(GL.pMat.uniforms.uColor.value,{r:dustC.r,g:dustC.g,b:dustC.b,duration:1.2});
    gsap.to(GL.pMat.uniforms.uOpacity,{value:isLight?.45:GL.dustBase,duration:1.2});
    GL.glows.forEach(function(g){ gsap.to(g.material,{opacity:isLight?.05:GL.glowBase,duration:1.2}); });
  }
}