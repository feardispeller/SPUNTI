

/* ============================================================
   La Lente — photographic loupe with selectable optics,
   and the living angle (each piece turns as you pass)
   ============================================================ */
(function(){
  if(REDUCED) return;
  var ZOOMS=[2,4,6], zi=1;
  var stages=[];
  var isDesk=function(){ return window.innerWidth>=1024; };

  [].forEach.call(document.querySelectorAll('.piece-art'), function(art, idx){
    var photo=art.querySelector('.art-photo'); if(!photo) return;
    var sketch=art.querySelector('.art-sketch');
    var altImg=art.querySelector('.ph-alt');
    var frontURL=art.dataset.front;

    /* ---- the magnifying glass ---- */
    var loupe=document.createElement('div'); loupe.className='loupe'; loupe.setAttribute('aria-hidden','true');
    var arm=document.createElement('i'); arm.className='lens-arm';
    var lens=document.createElement('div'); lens.className='lens';
    lens.style.backgroundImage='url("'+frontURL+'")';
    /* the atelier drawing, magnified, whenever a photograph cannot be had */
    var inner=document.createElement('div'); inner.className='lens-inner';
    var srcSvg=art.querySelector('.art-sketch svg');
    if(srcSvg){
      inner.innerHTML=srcSvg.outerHTML
        .replace(/id="([^"]+)"/g,'id="$1-LN'+idx+'"')
        .replace(/url\(#([^)]+)\)/g,'url(#$1-LN'+idx+')');
    }
    var tag=document.createElement('span'); tag.className='lens-tag'; tag.textContent='×'+ZOOMS[zi];
    lens.appendChild(inner); lens.appendChild(tag);
    loupe.appendChild(arm); loupe.appendChild(lens);
    art.appendChild(loupe);

    var active=false, M=null, lastX=0, lastY=0;
    function hasPhoto(){ return !art.classList.contains('no-photo'); }
    function metrics(){
      var r=art.getBoundingClientRect();
      var L=Math.min(196, Math.max(136, r.width*.6));
      loupe.style.setProperty('--lens', L+'px');
      return {r:r, L:L};
    }
    function place(cx,cy){
      var m=M||metrics(), r=m.r, L=m.L, Z=ZOOMS[zi];
      lastX=cx; lastY=cy;
      var x=Math.max(0,Math.min(r.width, cx-r.left));
      var y=Math.max(0,Math.min(r.height, cy-r.top));
      loupe.style.left=(x-L/2)+'px';
      loupe.style.top =(y-L/2)+'px';
      if(hasPhoto()){
        inner.style.display='none';
        lens.style.backgroundImage='url("'+frontURL+'")';
        lens.style.backgroundSize=(r.width*Z)+'px auto';
        lens.style.backgroundPosition=(L/2-x*Z)+'px '+(L/2-y*Z)+'px';
      }else{
        lens.style.backgroundImage='none';
        inner.style.display='block';
        var isvg=inner.firstElementChild;
        if(isvg){ isvg.style.width=(r.width*Z)+'px'; isvg.style.height='auto'; }
        inner.style.transform='translate('+(L/2-x*Z)+'px,'+(L/2-y*Z)+'px)';
      }
    }
    function show(cx,cy){
      if(active) return;
      active=true; M=metrics();
      document.body.classList.add('lens-active');
      place(cx,cy);
      if(HAS_GSAP) gsap.to(loupe,{opacity:1,scale:1,duration:.45,ease:'back.out(1.6)'});
      else { loupe.style.opacity=1; loupe.style.transform='scale(1)'; }
      if(TOUCH && navigator.vibrate){ try{ navigator.vibrate(8); }catch(e){} }
    }
    function hide(){
      if(!active) return; active=false; M=null;
      document.body.classList.remove('lens-active');
      if(HAS_GSAP) gsap.to(loupe,{opacity:0,scale:.6,duration:.35,ease:'power3.in'});
      else { loupe.style.opacity=0; }
    }
    var S={art:art, photo:photo, sketch:sketch, alt:altImg,
      front:art.querySelector('.ph-front'),
      sheen:art.querySelector('.ph-sheen'), shadow:art.querySelector('.piece-shadow'),
      idx:idx, A:.12, drag:null, hover:null, phase:idx*1.7,
      depth:parseFloat(art.dataset.depth||1), dx:0,
      refreshLens:function(){ if(active){ M=metrics(); place(lastX,lastY); } },
      updateTag:function(){ tag.textContent='×'+ZOOMS[zi]; }};

    /* desktop — hover raises the loupe & the piece follows the light;
       press and drag to turn her; click changes the glass */
    var downX=0, downY=0, moved=false;
    art.addEventListener('pointerenter', function(e){ if(e.pointerType==='mouse' && !S.drag) show(e.clientX,e.clientY); });
    art.addEventListener('pointerleave', function(e){ if(e.pointerType==='mouse'){ hide(); S.hover=null; } });
    art.addEventListener('pointermove',  function(e){
      if(e.pointerType!=='mouse') return;
      if(S.drag){
        var r=art.getBoundingClientRect();
        S.drag.v=S.drag.start+(e.clientX-S.drag.x0)/r.width*1.7;
        return;
      }
      if(active){ place(e.clientX,e.clientY); return; } /* the piece holds her pose under the glass */
      var r2=art.getBoundingClientRect();
      S.hover=Math.max(0,Math.min(1,(e.clientX-r2.left)/r2.width));
    });
    var preActive=false;
    art.addEventListener('pointerdown', function(e){
      if(e.pointerType!=='mouse') return;
      downX=e.clientX; downY=e.clientY; moved=false; preActive=active;
      S.drag={x0:e.clientX, start:S.A, v:S.A};
      photo.classList.add('dragging');
      hide();
      try{ art.setPointerCapture(e.pointerId); }catch(err){}
    });
    art.addEventListener('pointerup', function(e){
      if(e.pointerType!=='mouse') return;
      var wasDrag=Math.abs(e.clientX-downX)>7||Math.abs(e.clientY-downY)>7;
      S.drag=null; photo.classList.remove('dragging');
      if(!wasDrag && preActive) setZoom((zi+1)%ZOOMS.length);
      show(e.clientX,e.clientY);
    });
    art.addEventListener('pointercancel', function(){ S.drag=null; photo.classList.remove('dragging'); });

    /* touch — hold for la lente; horizontal swipe turns her */
    var holdTimer=null, sx=0, sy=0, touching=false, turning=false;
    art.addEventListener('touchstart', function(e){
      var t=e.touches[0]; sx=t.clientX; sy=t.clientY; turning=false;
      clearTimeout(holdTimer);
      holdTimer=setTimeout(function(){ if(!turning){ touching=true; show(sx,sy); } },280);
    },{passive:true});
    art.addEventListener('touchmove', function(e){
      var t=e.touches[0];
      if(touching){ e.preventDefault(); place(t.clientX,t.clientY); return; }
      var dx=t.clientX-sx, dy=t.clientY-sy;
      if(turning){
        e.preventDefault();
        var r=art.getBoundingClientRect();
        S.drag.v=S.drag.start+dx/r.width*1.7;
        return;
      }
      if(Math.abs(dx)>14 && Math.abs(dx)>Math.abs(dy)*1.4){
        clearTimeout(holdTimer); turning=true;
        S.drag={x0:sx, start:S.A, v:S.A};
        if(TOUCH && navigator.vibrate){ try{ navigator.vibrate(5); }catch(err){} }
      } else if(Math.abs(dy)>12){ clearTimeout(holdTimer); }
    },{passive:false});
    ['touchend','touchcancel'].forEach(function(ev){
      art.addEventListener(ev, function(){
        clearTimeout(holdTimer); touching=false; hide();
        if(turning){ turning=false; S.drag=null; }
      });
    });

    stages.push(S);
  });

  function setZoom(n){
    zi=n;
    stages.forEach(function(s){ s.updateTag(); s.refreshLens(); });
    [].forEach.call(document.querySelectorAll('.lens-opts button'), function(b){
      b.classList.toggle('on', parseInt(b.dataset.z,10)===zi);
    });
    if(TOUCH && navigator.vibrate){ try{ navigator.vibrate(5); }catch(e){} }
  }
  [].forEach.call(document.querySelectorAll('.lens-opts button'), function(b){
    b.addEventListener('click', function(){ setZoom(parseInt(b.dataset.z,10)); });
  });
  setZoom(zi);

  /* ---- the masthead scrim: raised the moment the hero is behind us ---- */
  (function(){
    var b=document.body, on=false;
    function upd(){
      var want=window.scrollY>window.innerHeight*.62;
      if(want!==on){ on=want; b.classList.toggle('past-hero',on); }
    }
    window.addEventListener('scroll',upd,{passive:true}); upd();
  })();

  /* ---- the turn engine: drag physics, hover-follow, scroll drift,
     crossfaded angles, swept light, breathing ground shadow ---- */
  function tick(){
    var vw=window.innerWidth, vh=window.innerHeight, desk=isDesk();
    var t=performance.now()/1000;
    stages.forEach(function(s){
      var r=s.art.getBoundingClientRect();
      /* lateral drift — identical maths for all four, so the piece parked at
         the head of the track drifts exactly as much as the one at the tail */
      if(desk){
        var pc=(r.left+r.width/2)/vw;
        var off=Math.max(-1,Math.min(1,(pc-.5)*2));
        /* eased so a piece sitting near her presenting mark barely moves and
           only the far approach and exit carry the full parallax */
        var dx=(off<0?-1:1)*Math.pow(Math.abs(off),1.6)*60*s.depth;
        if(Math.abs(dx-s.dx)>.05){ s.dx=dx; s.art.style.setProperty('--drift',dx.toFixed(1)+'px'); }
      } else if(s.dx!==0){ s.dx=0; s.art.style.setProperty('--drift','0px'); }
      if(s.art.classList.contains('no-photo')) return;
      if(r.bottom<-120||r.top>vh+120) return;
      var target, ease=.08;
      if(s.drag){ target=Math.max(-.18,Math.min(1.18,s.drag.v)); ease=.3; }
      else if(s.hover!=null){ target=s.hover; ease=.09; }
      else{
        /* At rest every piece presents her FRONT. The ambient drift is a
           breath of angle either side of neutral, measured symmetrically
           from the centre of the viewport so a piece parked at the left
           edge of the pinned track behaves exactly like one at the right.
           The band is held below the .44 crossfade so the turned frame is
           only ever reached deliberately — by hover, drag or swipe. */
        var cen=desk ? (r.left+r.width/2)/vw : (r.top+r.height/2)/vh;
        var off=Math.max(-1,Math.min(1,(cen-.5)*2));
        target=.28-off*.14;                      /* .14 … .42 */
      }
      s.A+=(target-s.A)*ease;
      var a=s.A, c=a-.35;
      s.photo.style.transform='perspective(850px) rotateY('+(c*24).toFixed(2)+'deg) rotateX('+(Math.sin(t*.5+s.phase)*1.2).toFixed(2)+'deg)';
      /* one angle at a time — a narrow dissolve, never a double exposure */
      var alt=Math.max(0,Math.min(1,(a-.44)/.18));
      if(s.alt && !s.art.classList.contains('no-alt')){
        s.alt.style.opacity=alt.toFixed(3);
        if(s.front) s.front.style.opacity=(1-alt).toFixed(3);
      }
      if(s.sheen){ var mp=((a*150-25).toFixed(1))+'% 0';
        s.sheen.style.webkitMaskPosition=mp; s.sheen.style.maskPosition=mp;
        s.sheen.style.opacity=(0.2*(1-alt)).toFixed(3);
      }
      if(s.sketch) s.sketch.style.transform='translate('+(-5+c*-9).toFixed(2)+'%,4%) scale(1.02) ';
      if(s.shadow){
        var breathe=Math.sin(t*(2*Math.PI/(3.6+s.idx*.7))+s.phase)*.5+.5;
        s.shadow.style.transform='translateX('+(c*-24).toFixed(1)+'px) scaleX('+(1-Math.abs(c)*.3-breathe*.14).toFixed(3)+')';
        s.shadow.style.opacity=(.85-breathe*.3-Math.abs(c)*.2).toFixed(3);
      }
    });
  }
  if(HAS_GSAP){ gsap.ticker.add(tick); }
  else { (function loop(){ tick(); requestAnimationFrame(loop); })(); }
})();