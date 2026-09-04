

/* ============================================================
   GSAP choreography
   ============================================================ */
if(HAS_GSAP && HAS_ST && !REDUCED){
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ignoreMobileResize:true});

  /* lenis <-> gsap */
  if(lenis){
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(time){ lenis.raf(time*1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- preloader ---------- */
  var plDone=false;
  function heroIntro(){
    if(GL.ok && GL.introS) gsap.to(GL.introS,{v:1,duration:2.6,ease:'power3.out',delay:.15});
    var tl=gsap.timeline({defaults:{ease:'power4.out'}});
    tl.to('#heroTitle .ht-word span',{
        y:function(i,t){return parseFloat(t.dataset.jy)||0;},
        rotate:function(i,t){return parseFloat(t.dataset.jr)||0;},
        duration:1.5,stagger:.065},0)
      .to('.hero-sub',{opacity:1,duration:1.4,ease:'power2.out'},.7)
      .to('#nav',{opacity:1,duration:1.2,ease:'power2.out'},.9)
      .to('.hero-scroll',{opacity:1,duration:1.2,ease:'power2.out'},1.1)
      .to('.hero-edge',{opacity:.8,duration:1.2,ease:'power2.out'},1.15)
      .to('.hero-frame .fT',{scaleX:1,duration:1.3,ease:'power3.inOut'},.45)
      .to('.hero-frame .fR',{scaleY:1,duration:1.0,ease:'power3.inOut'},1.0)
      .to('.hero-frame .fB',{scaleX:1,duration:1.3,ease:'power3.inOut'},1.35)
      .to('.hero-frame .fL',{scaleY:1,duration:1.0,ease:'power3.inOut'},1.9);
    /* the word arrives whole in ink; the full name is stitched in beneath,
       and on that beat the S turns the colour of thread */
    tl.to('.ht-name',{opacity:.55,duration:.9,ease:'power2.out'},1.5)
      .to('.ht-name .nm-st',{scaleX:1,duration:1,ease:'power3.out'},1.6)
      .add(function(){
        var s=document.querySelector('.hero-title .ht-s');
        if(s) s.classList.add('threaded');
      },1.78);
    /* letters breathe under the pointer */
    if(!TOUCH){
      [].forEach.call(document.querySelectorAll('#heroTitle .ht-word span'),function(ch){
        ch.addEventListener('pointerenter',function(){
          var rest=parseFloat(ch.dataset.jy)||0;
          gsap.to(ch,{y:rest-16,duration:.32,ease:'power3.out',overwrite:'auto'});
          gsap.to(ch,{y:rest,duration:1.2,ease:'elastic.out(1,.32)',delay:.32});
        });
      });
    }
  }
  function runPreloader(){
    if(plDone) return; plDone=true;
    if(document.documentElement.classList.contains('clinic')){
      var plc=document.getElementById('preloader');
      if(plc){ plc.style.display='none'; }
      heroIntro();
      ScrollTrigger.refresh();
      return;
    }
    var count={v:0};
    var plCount=document.getElementById('plCount');
    var plS=document.getElementById('plS');
    var sW=plS?plS.offsetWidth:0;
    if(plS) gsap.set(plS,{width:0,opacity:0});
    var tl=gsap.timeline();
    /* punti sets first — the word the two names share */
    tl.to('#plP span',{y:0,duration:1.1,stagger:.07,ease:'power4.out'},.15)
      /* then the S is drawn in, and the whole word shifts to make room:
         punti becomes spunti, and the two names are one */
      .to(plS,{width:sW,opacity:1,duration:.95,ease:'power3.inOut'},1.05)
      .to('.pl-tag',{opacity:.8,duration:.7,ease:'power2.out'},1.7)
      .to('.pl-tag .nm-st',{scaleX:1,duration:.9,ease:'power3.out'},1.8)
      .to(count,{v:100,duration:2.6,ease:'power2.inOut',
          onUpdate:function(){ plCount.textContent=String(Math.round(count.v)).padStart(3,'0'); }},.3)
      .to('#plBar',{clipPath:'inset(0 0% 0 0)',duration:2.6,ease:'power2.inOut'},.3)
      .to(['#plP span','#plS'],{y:'-120%',duration:.8,stagger:.04,ease:'power3.in'},'+=.35')
      .to(['.pl-tag','#plCount','.pl-line'],{opacity:0,duration:.5,ease:'power2.in'},'<')
      .to('#plVeil',{y:'0%',duration:.75,ease:'power4.inOut'},'-=.3')
      .to('#preloader',{yPercent:-100,duration:1.05,ease:'power4.inOut',
          onStart:heroIntro,
          onComplete:function(){
            document.getElementById('preloader').style.display='none';
            ScrollTrigger.refresh();
          }},'+=.05');
  }
  gsap.set('#plVeil',{y:'101%'});
  if(document.fonts && document.fonts.ready){
    var raced=false;
    document.fonts.ready.then(function(){ if(!raced){raced=true; runPreloader();} });
    setTimeout(function(){ if(!raced){raced=true; runPreloader();} },1800);
  } else { runPreloader(); }

  /* ---------- collection pin FIRST (pin spacer must exist before
     any trigger positioned below it is created) ---------- */
  var mm=gsap.matchMedia();

  mm.add('(min-width:1024px)', function(){
    var track=document.getElementById('colTrack');
    var wrap=document.getElementById('colWrap');
    function dist(){ return Math.max(0, track.scrollWidth - window.innerWidth); }
    var frac=document.createElement('div');
    frac.className='col-frac'; frac.innerHTML='<b>01</b>— 04';
    wrap.appendChild(frac);
    var tween=gsap.to(track,{x:function(){return -dist();},ease:'none',
      scrollTrigger:{
        id:'colPin', trigger:wrap, start:'top top',
        end:function(){ return '+=' + (dist()+window.innerHeight*.2); },
        pin:true, scrub:1, invalidateOnRefresh:true, anticipatePin:1, refreshPriority:10,
        onToggle:function(self){ frac.style.opacity=self.isActive?'.78':'0'; },
        onUpdate:function(){
          /* whichever piece is nearest the middle of the room is the one
             the counter names — not a guess from raw scroll progress */
          var mid=window.innerWidth/2, best=1, bd=1e9;
          [].forEach.call(document.querySelectorAll('.piece'), function(pc,pi){
            var r=pc.querySelector('.piece-art').getBoundingClientRect();
            var d=Math.abs(r.left+r.width/2-mid);
            if(d<bd){ bd=d; best=pi+1; }
          });
          var b=frac.querySelector('b');
          if(b.textContent!=='0'+best) b.textContent='0'+best;
        }
      }});
    [].forEach.call(document.querySelectorAll('.piece'), function(piece){
      var art=piece.querySelector('.piece-art');
      var num=piece.querySelector('.piece-num');
      /* the piece's own lateral drift is driven per-frame from her live
         position in the viewport (see the turn engine) — a containerAnimation
         trigger starting at 'left right' begins mid-flight for the first
         piece, which is what threw her out of her column. */
      gsap.fromTo(num,{x:120},{x:-160,ease:'none',
        scrollTrigger:{trigger:piece,containerAnimation:tween,start:'left right',end:'right left',scrub:true}});
      gsap.from(piece.querySelector('.piece-info'),{opacity:0,y:40,duration:1,ease:'power3.out',
        scrollTrigger:{trigger:piece,containerAnimation:tween,start:'left 72%'}});
    });
    gsap.to('#colCue',{opacity:.3,scrollTrigger:{trigger:wrap,start:'top 60%'}});
    return function(){};
  });

  mm.add('(max-width:1023px)', function(){
    [].forEach.call(document.querySelectorAll('.piece'), function(piece){
      var art=piece.querySelector('.piece-art');
      var num=piece.querySelector('.piece-num');
      gsap.from(art,{scale:.82,y:70,opacity:0,duration:1.4,ease:'power3.out',
        scrollTrigger:{trigger:piece,start:'top 74%'}});
      gsap.from(piece.querySelector('.piece-info'),{opacity:0,y:44,duration:1.2,ease:'power3.out',
        scrollTrigger:{trigger:piece,start:'top 62%'}});
      gsap.fromTo(num,{yPercent:26},{yPercent:-26,ease:'none',
        scrollTrigger:{trigger:piece,start:'top bottom',end:'bottom top',scrub:true}});
    });
    return function(){};
  });

  /* ---------- theme journey ----------
     Only sections that are ON THE PAGE get a trigger. A display:none section
     is zero-high at scroll 0, so every hidden trigger fires at once and the
     last one wins — which is how the animal route opened on the terracotta of
     a section three houses away. Routes hide sections, so this has to be
     rebuilt whenever the route changes. */
  var themeTriggers=[];
  buildThemeJourney=function(){
    themeTriggers.forEach(function(t){ t.kill(); });
    themeTriggers=[];
    [].forEach.call(document.querySelectorAll('section[data-bg]'), function(sec){
      if(sec.offsetParent===null && getComputedStyle(sec).display==='none') return;
      themeTriggers.push(ScrollTrigger.create({
        trigger:sec, start:'top 55%', end:'bottom 55%',
        onEnter:function(){ applyTheme(sec.dataset.bg, sec.dataset.ink, sec.dataset.line); },
        onEnterBack:function(){ applyTheme(sec.dataset.bg, sec.dataset.ink, sec.dataset.line); }
      }));
    });
    /* and set the ground we are actually standing on right now */
    var first=document.querySelector('section[data-bg]');
    if(first) applyTheme(first.dataset.bg, first.dataset.ink, first.dataset.line);
  };
  buildThemeJourney();

  /* ---------- progress hairline ---------- */
  gsap.to('#progress',{clipPath:'inset(0 0% 0 0)',ease:'none',
    scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:.4}});

  /* ---------- hero drift out ---------- */
  gsap.to('#hero',{yPercent:22,opacity:.25,ease:'none',
    scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});

  /* ---------- manifesto + quote word scrubs (rebuilt on language switch) ---------- */
  var mfTween=null, qTween=null;
  rebuildWordScrubs=function(){
    if(mfTween){ if(mfTween.scrollTrigger) mfTween.scrollTrigger.kill(); mfTween.kill(); }
    if(qTween){ if(qTween.scrollTrigger) qTween.scrollTrigger.kill(); qTween.kill(); }
    mfTween=gsap.to('#mfText .w',{opacity:1,stagger:.6,ease:'none',
      scrollTrigger:{trigger:'#manifesto',start:'top 72%',end:'center 42%',scrub:.6}});
    gsap.set('#atQuote .w',{opacity:.1});
    qTween=gsap.to('#atQuote .w',{opacity:1,stagger:.5,ease:'none',
      scrollTrigger:{trigger:'#atelier',start:'top 60%',end:'center 45%',scrub:.6}});
  };
  rebuildWordScrubs();
  gsap.from('.mf-sig',{opacity:0,x:-24,duration:1.2,ease:'power3.out',
    scrollTrigger:{trigger:'.mf-sig',start:'top 88%'}});

  /* ---------- line reveals ---------- */
  [].forEach.call(document.querySelectorAll('.rl>span'), function(sp){
    gsap.from(sp,{yPercent:115,duration:1.35,ease:'power4.out',
      scrollTrigger:{trigger:sp.closest('section')||sp,start:'top 72%'},
      delay:(Array.prototype.indexOf.call(sp.closest('h2,h3,.craft-title,.col-head')?sp.closest('h2,h3,.craft-title,.col-head').querySelectorAll('.rl>span'):[sp],sp))*.14});
  });

  /* floating idle for every bag (shadow breathing lives in the turn engine) */
  [].forEach.call(document.querySelectorAll('.piece-art'), function(el,i){
    gsap.to(el,{y:-14,rotate:i%2? -1.2:1.2,duration:3.6+i*.7,ease:'sine.inOut',yoyo:true,repeat:-1,delay:i*.4});
  });

  /* ---------- craft counters ---------- */
  [].forEach.call(document.querySelectorAll('.stat b'), function(b){
    var target=parseInt(b.dataset.count,10);
    ScrollTrigger.create({trigger:b,start:'top 85%',once:true,
      onEnter:function(){
        var o={v:0};
        gsap.to(o,{v:target,duration:2,ease:'power3.out',
          onUpdate:function(){ b.textContent=String(Math.round(o.v)); }});
      }});
  });
  [].forEach.call(document.querySelectorAll('.step'), function(stp,i){
    gsap.from(stp,{opacity:0,y:44,duration:1.1,ease:'power3.out',
      scrollTrigger:{trigger:stp,start:'top 84%'}});
  });
  gsap.from('.stats .stat',{opacity:0,y:36,stagger:.12,duration:1.1,ease:'power3.out',
    scrollTrigger:{trigger:'.stats',start:'top 82%'}});

  /* ---------- marquee ---------- */
  var mq1t=gsap.to('#mq1 .mq-inner',{xPercent:-100,ease:'none',duration:34,repeat:-1});
  var mq2t=gsap.fromTo('#mq2 .mq-inner',{xPercent:-100},{xPercent:0,ease:'none',duration:40,repeat:-1});
  ScrollTrigger.create({
    trigger:'#materials',start:'top bottom',end:'bottom top',
    onUpdate:function(self){
      var v=self.getVelocity()/1200;
      var sk=Math.max(-8,Math.min(8,v));
      gsap.to(['#mq1','#mq2'],{skewX:sk,duration:.5,ease:'power2.out',overwrite:'auto'});
      mq1t.timeScale(1+Math.min(2.5,Math.abs(v)*.5));
      mq2t.timeScale(1+Math.min(2.5,Math.abs(v)*.5));
    }
  });

  /* ---------- atelier landscape ---------- */
  gsap.fromTo('.at-l1',{yPercent:16},{yPercent:-2,ease:'none',
    scrollTrigger:{trigger:'#atelier',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.fromTo('.at-l2',{yPercent:26},{yPercent:-5,ease:'none',
    scrollTrigger:{trigger:'#atelier',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.fromTo('.at-l3',{yPercent:38},{yPercent:-8,ease:'none',
    scrollTrigger:{trigger:'#atelier',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.fromTo('.at-moon',{scale:.7,opacity:.4,transformOrigin:'center'},{scale:1.15,opacity:1,ease:'none',
    scrollTrigger:{trigger:'#atelier',start:'top bottom',end:'center center',scrub:true}});
  gsap.to('.at-mist.m1',{x:90,duration:14,ease:'sine.inOut',yoyo:true,repeat:-1});
  gsap.to('.at-mist.m2',{x:-70,duration:18,ease:'sine.inOut',yoyo:true,repeat:-1});
  gsap.from('.at-cite',{opacity:0,duration:1.4,ease:'power2.out',
    scrollTrigger:{trigger:'#atelier',start:'center 55%'}});

  /* ---------- footer ---------- */
  /* the chrome bows out so the sewn name has the stage */
  (function(){
    var nv=document.getElementById('nav');
    ScrollTrigger.create({trigger:'#ftWord',start:'top 78%',
      onEnter:function(){ gsap.to(nv,{opacity:0,duration:.6,ease:'power2.out',
        onComplete:function(){ nv.style.pointerEvents='none'; }}); },
      onLeaveBack:function(){ nv.style.pointerEvents=''; gsap.to(nv,{opacity:1,duration:.6,ease:'power2.out'}); }});
  })();

  /* she sews her name as you arrive */
  gsap.to('.ft-stitchwrap',{clipPath:'inset(0 0% 0 0)',ease:'none',
    scrollTrigger:{trigger:'#footer-sec',start:'top 58%',end:'bottom bottom',scrub:.65}});
  gsap.from('.ft-invite > *',{opacity:0,y:30,stagger:.12,duration:1.1,ease:'power3.out',
    scrollTrigger:{trigger:'.ft-invite',start:'top 80%'}});
  gsap.from('.ft-row',{opacity:0,duration:1.4,ease:'power2.out',
    scrollTrigger:{trigger:'.ft-row',start:'top 94%'}});

  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
}