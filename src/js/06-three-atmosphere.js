

/* ============================================================
   THREE — dust, fog, the golden thread
   ============================================================ */
var GL={ok:false};
if(HAS_THREE && !REDUCED){
try{
  var canvas=document.getElementById('gl');
  var renderer=new THREE.WebGLRenderer({canvas:canvas, alpha:true, antialias:true, powerPreference:'high-performance'});
  var DPR=Math.min(window.devicePixelRatio||1, 1.75);
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, .1, 120);
  camera.position.set(0,0,16);

  scene.fog=new THREE.FogExp2(0xF2E6D8, 0.030);

  /* One window, high and to the right — the light an atelier actually has.
     Ambient is kept low on purpose: it is the darkness between the threads
     that makes a weave read as cloth rather than as a pale screen. */
  scene.add(new THREE.AmbientLight(0xEFDCC4, .26));
  var key=new THREE.DirectionalLight(0xFFF1DE, 1.46); key.position.set(11,5.5,4.5); scene.add(key);
  var fill=new THREE.DirectionalLight(0xE8CDB2, .30); fill.position.set(-8,-3.5,6); scene.add(fill);
  var rim=new THREE.PointLight(0xC97C5F, .95, 60); rim.position.set(-11,-6,3); scene.add(rim);
  /* a cool bounce off the wall behind, so the shadow sides are not dead */
  var bounce=new THREE.DirectionalLight(0xE2CFB8, .40); bounce.position.set(-4,-7,-8); scene.add(bounce);

  /* ------------------------------------------------------------------
     THE CLOTH ON THE LOOM
     Not a wreath. A piece of hand-woven bag cloth caught mid-make:
     warp threads running one way, weft crossing over-and-under in a
     true plain weave, the whole panel draped and curling like fabric,
     and at every edge the threads escape the weave and trail off loose
     — the single unbroken thread this house is named for, on its way
     to becoming a bag.
     ------------------------------------------------------------------ */
  var clothGroup=new THREE.Group(); scene.add(clothGroup);

  /* undyed linen, cotton and sun-dried raffia — with two strands of
     vegetable-tanned cord run through, the way the trim is */
  var STRAND_COLORS=[0xF5EBDA,0xE7D9C0,0xF8F1E4,0xDCCCAE,0xEFE3CE,0xE2D3B8,0xF2E8D6,0xD5C3A4];
  var CORD_COLORS  =[0xCBA671,0xD9B786,0xBE9660];

  /* a narrow vertical length of cloth on a phone, a wider panel on a desk */
  var CW = TOUCH ? 6.2 : 9.6;          /* cloth width  */
  var CH = TOUCH ? 8.0 : 6.0;          /* cloth height */
  var NW = TOUCH ? 33 : 55;            /* warp threads — must be odd */
  var NF = TOUCH ? 25 : 39;            /* weft threads — must be odd */
  var SEG= TOUCH ? 88 : 122;
  var pitchX=CW/(NW-1), pitchY=CH/(NF-1);
  var WEAVE = Math.min(pitchX,pitchY)*.33;   /* how far a thread rides over its crossing */

  /* the drape — a soft curl with a twist through it, so the panel hangs
     like cloth rather than standing up like a screen */
  function drape(u,v){
    return -.95*u*u
         + .40*Math.sin(1.40*v + .85*u)
         + .30*u*v
         - .26*v*v;
  }

  var clothShade=null, clothShadeMat=null, castMat=null;
  var RSEG = TOUCH ? 5 : 7;                 /* a thread is round, not a ribbon */
  var HAS_SHEEN = !TOUCH && THREE.MeshPhysicalMaterial;
  var strandMats=[], strandInfo=[], strandMeshes=[];
  function addStrand(pts, rad, color, op, info){
    var curve=new THREE.CatmullRomCurve3(pts,false,'centripetal');
    var geo=new THREE.TubeGeometry(curve,SEG,rad,RSEG,false);
    /* linen and raffia are not dead matte — they carry a low, directional
       sheen along the fibre, which is most of what makes cloth look costly */
    var mat = HAS_SHEEN
      ? new THREE.MeshPhysicalMaterial({
          color:color, roughness:.70, metalness:0,
          sheen:.72, sheenColor:new THREE.Color(0xFFF3E0), sheenRoughness:.55,
          transparent:true, opacity:op })
      : new THREE.MeshStandardMaterial({
          color:color, roughness:.70, metalness:0, transparent:true, opacity:op });
    strandMats.push(mat); strandInfo.push(info);
    var mesh=new THREE.Mesh(geo,mat);
    strandMeshes.push(mesh); clothGroup.add(mesh);
  }

  /* ---- warp: the threads held on the loom ---- */
  for(var i=0;i<NW;i++){
    var u0=-1+2*i/(NW-1);
    var x0=u0*CW/2;
    var ph=Math.random()*Math.PI*2;
    var frT=(i%4===0? .19+Math.random()*.20 : .035+Math.random()*.09),
        frB=(i%5===2? .17+Math.random()*.18 : .030+Math.random()*.08);
    var slub=.046+Math.random()*.015;                          /* hand-spun, never uniform */
    var cord=(i===Math.floor(NW*.23)||i===Math.floor(NW*.44)||i===Math.floor(NW*.79));
    var pts=[], STEPS=118;
    for(var k=0;k<=STEPS;k++){
      var v=-1-frB + (2+frT+frB)*k/STEPS;
      var vc=Math.max(-1,Math.min(1,v));
      var esc=Math.abs(v)-1;                                   /* how far past the selvedge */
      esc=esc>0?esc:0;
      var fade=Math.max(0,1-esc/.16);
      var x=x0
        + Math.sin(v*3.1+ph)*.028                              /* the thread is never dead straight */
        + (esc>0 ? Math.sin(esc*2.4+ph)*esc*.30 + esc*esc*.55*Math.sin(ph) : 0);
      var y=vc*CH/2 + (v>1? esc*CH/2*1.06 : v<-1? -esc*CH/2*1.06 : 0);
      var z=drape(u0,vc)
        + WEAVE*Math.cos(Math.PI*(vc*(CH/2)/pitchY + i))*fade
        + (esc>0 ? Math.sin(esc*2.9+ph)*esc*.34 : 0);
      /* the ply: every thread is a spiral of fibres, and the twist is what
         catches the window light in little repeating glints */
      var pt=k*1.45+ph, pa=(cord?slub*1.5:slub)*.105;
      pts.push(new THREE.Vector3(x+Math.cos(pt)*pa, y, z+Math.sin(pt)*pa));
    }
    addStrand(pts, cord? slub*1.06 : slub,
      cord? CORD_COLORS[i%CORD_COLORS.length] : STRAND_COLORS[i%STRAND_COLORS.length],
      .56, {ax:'warp', dx:(u0)*.5, dy:(i%2?1:-1)*(.2+Math.random()*.7), dz:(Math.random()-.5)*.7, rz:(Math.random()-.5)*.24});
  }

  /* ---- weft: the thread the hand carries across, over one and under one ---- */
  for(var j=0;j<NF;j++){
    var v0=-1+2*j/(NF-1);
    var y0=v0*CH/2;
    var ph2=Math.random()*Math.PI*2;
    /* the weft turns at the selvedge — except for the few working ends
       the hand has not yet carried back, which trail off into open thread */
    var carry=(j%6===2)||(j===NF-2);
    var frL=.035+Math.random()*.03;
    var frR=carry ? (.42+Math.random()*.55) : (.035+Math.random()*.03);
    var sel=Math.random()<.5?1:-1;                              /* which way the turn hooks */
    var slub2=.045+Math.random()*.016;
    var cord2=(j===Math.floor(NF*.19)||j===Math.floor(NF*.62));
    var pts2=[], STEPS2=132;
    for(var k2=0;k2<=STEPS2;k2++){
      var u=-1-frL + (2+frL+frR)*k2/STEPS2;
      var uc=Math.max(-1,Math.min(1,u));
      var esc2=Math.abs(u)-1; esc2=esc2>0?esc2:0;
      var fade2=Math.max(0,1-esc2/.16);
      var xx=uc*CW/2 + (u>1? esc2*CW/2*1.0 : u<-1? -esc2*CW/2*1.0 : 0);
      var loose=(u>1&&carry) ? esc2 : 0;                       /* only the carried end runs free */
      var turn =(esc2>0&&!loose) ? esc2 : 0;                    /* everything else simply turns */
      var yy=y0
        + Math.sin(u*2.7+ph2)*.026
        + turn*turn*4.4*sel*pitchY*.9                          /* the selvedge hook */
        + loose*loose*2.1*Math.sin(ph2*2.3)                    /* the loose end wanders */
        + Math.sin(loose*7.8+ph2)*loose*.66;                   /* and curls as it falls */
      var zz=drape(uc,v0)
        - WEAVE*Math.cos(Math.PI*(uc*(CW/2)/pitchX + j))*fade2
        + turn*turn*6.5*WEAVE
        + (loose>0 ? Math.cos(loose*6.4+ph2*1.3)*loose*.98 : 0);
      var pt2=k2*1.45+ph2, pa2=(cord2?slub2*1.5:slub2)*.105;
      pts2.push(new THREE.Vector3(xx, yy+Math.cos(pt2)*pa2, zz+Math.sin(pt2)*pa2));
    }
    addStrand(pts2, cord2? slub2*1.06 : slub2,
      cord2? CORD_COLORS[j%CORD_COLORS.length] : STRAND_COLORS[(j+3)%STRAND_COLORS.length],
      .56, {ax:'weft', dx:(j%2?1:-1)*(.3+Math.random()*1.0), dy:v0*.3, dz:(Math.random()-.5)*.6, rz:(Math.random()-.5)*.2});
  }

  /* ---- the halo: fine fibres lifting off the surface, the way linen does ---- */
  var NFUZZ=TOUCH?5:9;
  for(var f=0;f<NFUZZ;f++){
    var fu=(Math.random()*2-1)*.85, fv=(Math.random()*2-1)*.85;
    var dir=Math.random()*Math.PI*2, len=.5+Math.random()*1.5, ph3=Math.random()*Math.PI*2;
    var pf=[];
    for(var k3=0;k3<=40;k3++){
      var tt=k3/40;
      var uu=fu+Math.cos(dir)*len*tt/(CW/2);
      var vv=fv+Math.sin(dir)*len*tt/(CH/2);
      pf.push(new THREE.Vector3(
        uu*CW/2 + Math.sin(tt*6+ph3)*tt*.22,
        vv*CH/2 + Math.cos(tt*5+ph3)*tt*.20,
        drape(Math.max(-1,Math.min(1,uu)),Math.max(-1,Math.min(1,vv))) + tt*tt*.75 + Math.sin(tt*7+ph3)*tt*.18
      ));
    }
    addStrand(pf, .0095+Math.random()*.006, STRAND_COLORS[f%STRAND_COLORS.length], .4,
      {ax:'fuzz', dx:(Math.random()-.5)*1.1, dy:(Math.random()-.5)*1.1, dz:(Math.random()-.5)*.8, rz:(Math.random()-.5)*.35});
  }

  /* ---- the shadow the cloth casts on itself ----------------------------
     The single thing that separates a weave from a printed pattern is that
     you can see darkness through it. This is a soft, drape-following plane
     sitting just behind the sett: light falls on the crowns of the threads,
     and the gaps between them open onto shade instead of onto the page. */
  (function(){
    var c=document.createElement('canvas'); c.width=c.height=512;
    var g=c.getContext('2d');
    var grd=g.createRadialGradient(256,256,10,256,256,252);
    grd.addColorStop(0,   'rgba(46,28,16,.80)');
    grd.addColorStop(.46, 'rgba(52,33,19,.66)');
    grd.addColorStop(.78, 'rgba(60,39,24,.26)');
    grd.addColorStop(1,   'rgba(64,42,26,0)');
    g.fillStyle=grd; g.fillRect(0,0,512,512);
    var tex=new THREE.CanvasTexture(c);
    var gseg=TOUCH?18:28;
    var geo=new THREE.PlaneGeometry(CW*1.30, CH*1.34, gseg, Math.round(gseg*.72));
    var pos=geo.attributes.position;
    for(var vi=0; vi<pos.count; vi++){
      var uu=pos.getX(vi)/(CW*.65), vv=pos.getY(vi)/(CH*.67);
      pos.setZ(vi, drape(Math.max(-1,Math.min(1,uu)), Math.max(-1,Math.min(1,vv))) - .40);
    }
    geo.computeVertexNormals();
    clothShadeMat=new THREE.MeshBasicMaterial({
      map:tex, transparent:true, depthWrite:false, fog:false, opacity:.5
    });
    clothShade=new THREE.Mesh(geo, clothShadeMat);
    clothShade.renderOrder=-2;
    clothGroup.add(clothShade);

    /* and the shadow the whole panel throws onto the page behind it —
       offset away from the window, softer, and further back, so the cloth
       reads as an object lying above the paper rather than printed on it */
    var c2=document.createElement('canvas'); c2.width=c2.height=512;
    var g2=c2.getContext('2d');
    var gr2=g2.createRadialGradient(256,256,8,256,256,254);
    gr2.addColorStop(0,   'rgba(74,48,29,.42)');
    gr2.addColorStop(.42, 'rgba(78,52,32,.30)');
    gr2.addColorStop(.75, 'rgba(84,57,36,.10)');
    gr2.addColorStop(1,   'rgba(84,57,36,0)');
    g2.fillStyle=gr2; g2.fillRect(0,0,512,512);
    castMat=new THREE.MeshBasicMaterial({
      map:new THREE.CanvasTexture(c2), transparent:true, depthWrite:false, fog:false, opacity:.42
    });
    var cast=new THREE.Mesh(new THREE.PlaneGeometry(CW*1.55, CH*1.55), castMat);
    cast.position.set(-.62,-.72,-1.9);
    cast.renderOrder=-3;
    clothGroup.add(cast);
  })();

  clothGroup.position.set(0,0,2);
  clothGroup.rotation.x=-.30;
  clothGroup.rotation.y=.22;
  clothGroup.rotation.z=-.075;

  /* dust particles */
  var N=TOUCH?750:1600;
  var pos=new Float32Array(N*3), aScale=new Float32Array(N), aPhase=new Float32Array(N), aSpeed=new Float32Array(N);
  for(var i=0;i<N;i++){
    pos[i*3]  =(Math.random()*2-1)*26;
    pos[i*3+1]=(Math.random()*2-1)*15;
    pos[i*3+2]=(Math.random()*2-1)*9;
    aScale[i]=.35+Math.random()*1.15;
    aPhase[i]=Math.random()*Math.PI*2;
    aSpeed[i]=.15+Math.random()*.5;
  }
  var pGeo=new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  pGeo.setAttribute('aScale', new THREE.BufferAttribute(aScale,1));
  pGeo.setAttribute('aPhase', new THREE.BufferAttribute(aPhase,1));
  pGeo.setAttribute('aSpeed', new THREE.BufferAttribute(aSpeed,1));
  var pMat=new THREE.ShaderMaterial({
    transparent:true, depthWrite:false,
    uniforms:{
      uTime:{value:0},
      uColor:{value:new THREE.Color(0xC9A05A)},
      uOpacity:{value:.75},
      uSize:{value:46*DPR}
    },
    vertexShader:
      'attribute float aScale;attribute float aPhase;attribute float aSpeed;'+
      'uniform float uTime;uniform float uSize;varying float vTw;'+
      'void main(){'+
      ' vec3 p=position;'+
      ' p.y+=sin(uTime*aSpeed+aPhase)*1.4;'+
      ' p.x+=cos(uTime*aSpeed*.8+aPhase*1.7)*1.1;'+
      ' vTw=.55+.45*sin(uTime*(aSpeed*2.2)+aPhase*3.1);'+
      ' vec4 mv=modelViewMatrix*vec4(p,1.);'+
      ' gl_PointSize=uSize*aScale/(-mv.z);'+
      ' gl_Position=projectionMatrix*mv;}',
    fragmentShader:
      'uniform vec3 uColor;uniform float uOpacity;varying float vTw;'+
      'void main(){'+
      ' float d=length(gl_PointCoord-vec2(.5));'+
      ' float a=smoothstep(.5,.08,d);'+
      ' gl_FragColor=vec4(uColor, a*uOpacity*vTw);}'
  });
  var dust=new THREE.Points(pGeo,pMat); scene.add(dust);

  /* soft bloom glows */
  function glowTexture(){
    var c=document.createElement('canvas'); c.width=c.height=256;
    var g=c.getContext('2d');
    var grd=g.createRadialGradient(128,128,0,128,128,128);
    grd.addColorStop(0,'rgba(255,236,210,.7)');
    grd.addColorStop(.35,'rgba(232,178,138,.22)');
    grd.addColorStop(1,'rgba(232,178,138,0)');
    g.fillStyle=grd; g.fillRect(0,0,256,256);
    return new THREE.CanvasTexture(c);
  }
  var glowTex=glowTexture(); var glows=[];
  [[-9,4,-6,15],[10,-3,-8,20],[0,6,-10,26]].forEach(function(cfg){
    var m=new THREE.SpriteMaterial({map:glowTex, transparent:true, opacity:.14, blending:THREE.AdditiveBlending, depthWrite:false});
    var sp=new THREE.Sprite(m); sp.position.set(cfg[0],cfg[1],cfg[2]); sp.scale.setScalar(cfg[3]);
    scene.add(sp); glows.push(sp);
  });

  /* pointer parallax */
  var px=0, py=0, tx=0, ty=0;
  window.addEventListener('pointermove', function(e){
    tx=(e.clientX/window.innerWidth-.5); ty=(e.clientY/window.innerHeight-.5);
  }, {passive:true});
  window.addEventListener('deviceorientation', function(e){
    if(e.gamma==null) return;
    tx=Math.max(-.5,Math.min(.5, e.gamma/60));
    ty=Math.max(-.5,Math.min(.5,(e.beta-45)/60));
  }, true);

  /* scroll choreography for the thread */
  function lerpKeys(keys, t){
    for(var i=0;i<keys.length-1;i++){
      var a=keys[i], b=keys[i+1];
      if(t>=a[0]&&t<=b[0]){ var f=(t-a[0])/(b[0]-a[0]); return a[1]+(b[1]-a[1])*f; }
    }
    return keys[keys.length-1][1];
  }
  /* a short hero keeps the cloth in view over the reading — so it steps back */
  var CLINIC_DIM = document.documentElement.classList.contains('clinic') ? .22 : 1;
  var opKeys = TOUCH
    ? [[0,.80],[.09,.40],[.22,.14],[.42,.07],[.66,.06],[.84,.08],[1,.10]]
    : [[0,.92],[.09,.44],[.22,.15],[.42,.07],[.66,.06],[.84,.085],[1,.11]];
  var introS={v:REDUCED?1:.55};
  /* the panel is measured across its own widest reach, fringe and all, so
     a phone sees the whole weave at a size worth looking at */
  var EXTW=CW*1.62, EXTH=CH*1.36;
  var yKeys  =[[0,0],[.10,3.4],[.26,7.2],[.6,6],[.78,1.5],[1,-3]];
  var sKeys  =[[0,1],[.2,1.12],[.45,.8],[.75,.95],[1,.85]];
  var CLOTH_BASE = TOUCH ? .96 : .74;
  function fitScale(){
    var vh2=2*14*Math.tan(camera.fov*Math.PI/360);
    return CLOTH_BASE*Math.min((vh2*camera.aspect)/EXTW, vh2/EXTH);
  }
  var zRot   =[[0,0],[1,2.4]];

  GL={ok:true, renderer:renderer, scene:scene, camera:camera,
      fog:scene.fog, pMat:pMat, glows:glows, introS:introS,
      glowBase:.14, dustBase:.6};

  var clock=new THREE.Clock();
  var lastSY=window.scrollY||0, rimBoost=0;
  var running=true;
  /* If the machine cannot hold the sheen, it loses the sheen — never the
     frame rate. Measured over the first ninety frames, once only. */
  var perfN=0, perfT=0, perfLast=0, perfDone=false;
  function easeTheLoad(){
    perfDone=true;
    for(var q=0;q<strandMats.length;q++){
      var m=strandMats[q];
      if(m.sheen!==undefined && m.sheen>0){ m.sheen=0; m.roughness=.78; m.needsUpdate=true; }
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 1.2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  document.addEventListener('visibilitychange', function(){ running=!document.hidden; });

  function frame(){
    requestAnimationFrame(frame);
    if(!running) return;
    var t=clock.getElapsedTime();
    var doc=document.documentElement;
    var maxScroll=Math.max(1, doc.scrollHeight-window.innerHeight);
    var p=Math.max(0,Math.min(1,(window.scrollY||window.pageYOffset)/maxScroll));

    px+=(tx-px)*.045; py+=(ty-py)*.045;

    /* the cloth warms, never glints, as you drift faster */
    var sy=window.scrollY||0;
    var dv=Math.min(3, Math.abs(sy-lastSY)*.015); lastSY=sy;
    rimBoost+=(dv-rimBoost)*.05;
    rim.intensity=.7+rimBoost*.35;
    key.intensity=.85+rimBoost*.12;

    /* the cloth breathes on the loom — the whole panel lifts and settles
       as though air were moving through the atelier */
    clothGroup.rotation.x=-.30+py*.26+Math.sin(t*.21)*.045;
    clothGroup.rotation.y=.22+px*.38+Math.sin(t*.13)*.07;
    clothGroup.rotation.z=-.075+lerpKeys(zRot,p)*.34+Math.sin(t*.17)*.02;
    clothGroup.position.y=lerpKeys(yKeys,p)+Math.sin(t*.35)*.22;
    clothGroup.position.x=px*1.6;
    var s=lerpKeys(sKeys,p)*introS.v*fitScale(); clothGroup.scale.setScalar(s);
    var wop=lerpKeys(opKeys,p)*Math.min(1,introS.v*1.6)*CLINIC_DIM;
    for(var mi=0;mi<strandMats.length;mi++) strandMats[mi].opacity=wop*(strandInfo[mi].ax==='fuzz'?.6:1);
    /* and as the story unwinds, the weave gives: weft slides out of the
       shed, warp splays, the cloth goes back to being thread */
    var un=Math.pow(p,.75);
    for(var ci=0;ci<strandMeshes.length;ci++){
      var inf=strandInfo[ci], ch=strandMeshes[ci];
      ch.position.x=un*inf.dx; ch.position.y=un*inf.dy; ch.position.z=un*inf.dz;
      ch.rotation.z=un*inf.rz;
    }
    /* the shade goes with the cloth, and lets go faster than it does —
       once the weave opens there is nothing left to cast it */
    if(clothShadeMat) clothShadeMat.opacity=wop*.92*(1-un*.85);
    if(castMat) castMat.opacity=wop*.46*(1-un*.9);

    camera.position.x=px*1.2; camera.position.y=-py*.9;
    camera.lookAt(0,0,0);

    pMat.uniforms.uTime.value=t;
    dust.rotation.y=t*.008+p*.6;
    dust.position.y=p*4;

    glows.forEach(function(g,i){
      g.position.x+=Math.sin(t*.1+i*2.1)*.004;
      g.position.y+=Math.cos(t*.08+i*1.3)*.003;
    });

    renderer.render(scene,camera);

    if(!perfDone){
      var now=performance.now();
      if(perfLast){ perfT+=now-perfLast; perfN++; }
      perfLast=now;
      if(perfN>=90){ if(perfT/perfN>26) easeTheLoad(); else perfDone=true; }
    }
  }
  frame();

  window.addEventListener('resize', function(){
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}catch(e){ GL={ok:false}; if(window.console) console.warn('WebGL atmosphere unavailable:', e); }
}