

/* ============================================================
   Cursor + magnetic
   ============================================================ */
if(!TOUCH && !REDUCED && HAS_GSAP){
  var cursor=document.getElementById('cursor');
  var cLabel=document.getElementById('cursorLabel');
  var needle=document.getElementById('needle');
  var thread=document.getElementById('thread');
  var t1=thread.querySelector('.t1'),t2=thread.querySelector('.t2'),t3=thread.querySelector('.t3');
  var cx=innerWidth/2, cy=innerHeight/2, mx=cx, my=cy;
  var TIPX=43.7, TIPY=23, ang=0.62, pts=[], shown=false;
  document.documentElement.classList.add('needle-on');
  needle.style.transformOrigin=TIPX+'px '+TIPY+'px';
  gsap.set(cursor,{opacity:0});
  window.addEventListener('pointermove', function(e){
    mx=e.clientX; my=e.clientY;
    if(!shown){ shown=true; gsap.to([needle,thread],{opacity:1,duration:.5}); }
  },{passive:true});
  function pstr(a){
    var s=''; for(var i=0;i<a.length;i++){ s+=a[i][0].toFixed(1)+','+a[i][1].toFixed(1)+' '; }
    return s;
  }
  gsap.ticker.add(function(){
    cx+=(mx-cx)*.14; cy+=(my-cy)*.14;
    gsap.set(cursor,{x:cx,y:cy});
    pts.push([mx,my]); if(pts.length>26) pts.shift();
    var n=pts.length;
    if(n>2){
      /* the needle turns to face the direction of the stitch */
      var b=pts[Math.max(0,n-6)], a=pts[n-1];
      var dx=a[0]-b[0], dy=a[1]-b[1], sp=Math.sqrt(dx*dx+dy*dy);
      if(sp>2.2) ang=Math.atan2(dy,dx);
      t1.setAttribute('points', pstr(pts.slice(-9)));
      t2.setAttribute('points', pstr(pts.slice(-18,-8)));
      t3.setAttribute('points', pstr(pts.slice(0,-17)));
      /* slack thread rests; a quick hand pulls it taut */
      if(shown) thread.style.opacity=Math.max(0,Math.min(1,(sp-1.2)/9)).toFixed(2);
    }
    needle.style.transform='translate('+(mx-TIPX)+'px,'+(my-TIPY)+'px) rotate('+ang+'rad)';
  });
  [].forEach.call(document.querySelectorAll('[data-hover], .piece-art, .stat'), function(el){
    el.addEventListener('pointerenter', function(){
      cursor.classList.add('is-hover');
      cLabel.textContent=el.classList.contains('piece-art')?(LBL||LABELS.en).behold:'';
      gsap.to(cursor,{opacity:1,duration:.3});
    });
    el.addEventListener('pointerleave', function(){
      cursor.classList.remove('is-hover'); cLabel.textContent='';
      gsap.to(cursor,{opacity:0,duration:.3});
    });
  });
  /* magnetic nav links */
  [].forEach.call(document.querySelectorAll('.nav-links a, .menu-toggle, .ft-social a'), function(el){
    var str=18;
    el.addEventListener('pointermove', function(e){
      var r=el.getBoundingClientRect();
      var dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
      gsap.to(el,{x:dx/r.width*str, y:dy/r.height*str*.8, duration:.4, ease:'power2.out'});
    });
    el.addEventListener('pointerleave', function(){
      gsap.to(el,{x:0,y:0,duration:.7,ease:'elastic.out(1,.4)'});
    });
  });
}