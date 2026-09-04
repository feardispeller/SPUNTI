
/* ============================================================
   PUNTI PICCOLI — THE FITTING FORM
   She is a stuffed calico animal, hand-cut and stood on a brass
   rimmed base. The silhouette is the one already drawn for the
   flat stage — the one that unmistakably reads as a dog, and as
   a cat — lifted into three dimensions by extruding it with a
   soft bevel and standing the layers apart: far legs and tail
   behind, the body in the middle, the near legs in front. Move
   and they separate. It is a workshop object, not a rendering
   of an animal, and that is the only way this reads as made.

   The garment is not modelled twice. The flat engine already
   cuts it from the three measurements; this reads the path it
   just wrote and extrudes THAT, so the coat on the wooden dog
   is the same coat, cut the same way, every time.
   ============================================================ */
var picGL=null;
(function(){
  var wrap=document.getElementById('picGLWrap'), cv=document.getElementById('picGL'),
      sec=document.getElementById('piccoli'), handles=document.getElementById('picHandles');
  if(!wrap||!cv||!sec||!HAS_THREE||REDUCED) return;
  if(!THREE.ExtrudeGeometry||!THREE.Shape) return;

  var renderer;
  try{ renderer=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true}); }
  catch(e){ return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));

  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(30,1,.1,80);

  /* ---------- the light of a workroom ---------- */
  scene.add(new THREE.AmbientLight(0xE8D9C2,.58));
  var key=new THREE.DirectionalLight(0xFFF6E8,.95); key.position.set(2.6,4.4,5.2); scene.add(key);
  var fill=new THREE.DirectionalLight(0xDCC3A8,.30); fill.position.set(-4.4,1.0,3.4); scene.add(fill);
  var rim=new THREE.DirectionalLight(0xFFE6C9,.42); rim.position.set(-2.6,3.0,-4.2); scene.add(rim);

  var root=new THREE.Group(); scene.add(root);
  var body=new THREE.Group(); root.add(body);

  /* ---------- the drawing's own coordinate system ---------- */
  var VB={x:106,y:96,w:466,h:330};
  var SC=7.6/VB.w;
  var CX=VB.x+VB.w/2, CY=250;
  var GROUND=392;                       /* where her feet are, in the drawing */
  function wx(x){ return (x-CX)*SC; }
  function wy(y){ return -(y-CY)*SC; }
  var FLOOR=wy(GROUND);
  /* Measured, never assumed: a dachshund and a cat do not occupy the same
     rectangle, and a frame guessed from the viewBox leaves one of them
     stranded in a corner with half the picture empty. */
  var BND={x0:VB.x,x1:VB.x+VB.w,y0:VB.y};
  function measure(g,w){
    var x0=1e9,x1=-1e9,y0=1e9;
    [].forEach.call(g.querySelectorAll('path'),function(e){
      flatten(e.getAttribute('d')||'',8).forEach(function(sub){
        sub.forEach(function(p0){
          var p=w?w(p0[0],p0[1]):{x:p0[0],y:p0[1]};
          if(p.x<x0)x0=p.x; if(p.x>x1)x1=p.x; if(p.y<y0)y0=p.y;
        });
      });
    });
    if(x0>x1) return;
    BND={x0:x0,x1:x1,y0:y0};
    CX=(x0+x1)/2;
  }

  function smoothstep(a,b,x){ x=(x-a)/(b-a); x=x<0?0:x>1?1:x; return x*x*(3-2*x); }

  /* ---------- reading the drawing ---------- */
  /* A small path reader. Only what these paths actually use:
     M L H V C S Q T Z, absolute and relative. No arcs — the arcs
     in this file are all tapes, and tapes are built as rings. */
  function toks(d){
    var out=[], re=/([a-zA-Z])|(-?\d*\.?\d+(?:[eE][-+]?\d+)?)/g, m;
    while((m=re.exec(d))!==null) out.push(m[1]!==undefined?m[1]:parseFloat(m[2]));
    return out;
  }
  /* walk a path, handing every segment to the sink */
  function walk(d,sink){
    var T=toks(d), i=0, c='', x=0,y=0, sx=0,sy=0, lcx=0,lcy=0, last='';
    function num(){ return T[i++]; }
    while(i<T.length){
      if(typeof T[i]==='string'){ c=T[i++]; }
      else if(c==='M') c='L'; else if(c==='m') c='l';
      var rel=(c>='a');
      var C=c.toUpperCase(), ax,ay,bx,by,X,Y;
      if(C==='M'){ X=num(); Y=num(); if(rel){X+=x;Y+=y;} x=X;y=Y; sx=x;sy=y; sink.move(x,y); }
      else if(C==='L'){ X=num(); Y=num(); if(rel){X+=x;Y+=y;} sink.line(x,y,X,Y); x=X;y=Y; }
      else if(C==='H'){ X=num(); if(rel)X+=x; sink.line(x,y,X,y); x=X; }
      else if(C==='V'){ Y=num(); if(rel)Y+=y; sink.line(x,y,x,Y); y=Y; }
      else if(C==='C'){ ax=num();ay=num();bx=num();by=num();X=num();Y=num();
        if(rel){ax+=x;ay+=y;bx+=x;by+=y;X+=x;Y+=y;}
        sink.cubic(x,y,ax,ay,bx,by,X,Y); lcx=bx;lcy=by; x=X;y=Y; }
      else if(C==='S'){ bx=num();by=num();X=num();Y=num();
        if(rel){bx+=x;by+=y;X+=x;Y+=y;}
        ax=(last==='C'||last==='S')?2*x-lcx:x; ay=(last==='C'||last==='S')?2*y-lcy:y;
        sink.cubic(x,y,ax,ay,bx,by,X,Y); lcx=bx;lcy=by; x=X;y=Y; }
      else if(C==='Q'){ ax=num();ay=num();X=num();Y=num();
        if(rel){ax+=x;ay+=y;X+=x;Y+=y;}
        sink.quad(x,y,ax,ay,X,Y); lcx=ax;lcy=ay; x=X;y=Y; }
      else if(C==='T'){ X=num();Y=num(); if(rel){X+=x;Y+=y;}
        ax=(last==='Q'||last==='T')?2*x-lcx:x; ay=(last==='Q'||last==='T')?2*y-lcy:y;
        sink.quad(x,y,ax,ay,X,Y); lcx=ax;lcy=ay; x=X;y=Y; }
      else if(C==='Z'){ sink.close(sx,sy); x=sx; y=sy; }
      else { i++; }
      last=C;
    }
  }
  /* flatten to points, so a stroke can become a cord in space */
  function flatten(d,steps){
    steps=steps||14;
    var subs=[], cur=null;
    function push(px,py){ if(cur) cur.push([px,py]); }
    walk(d,{
      move:function(x,y){ cur=[[x,y]]; subs.push(cur); },
      line:function(x0,y0,x1,y1){ push(x1,y1); },
      cubic:function(x0,y0,ax,ay,bx,by,x1,y1){
        for(var s=1;s<=steps;s++){ var t=s/steps,u=1-t;
          push(u*u*u*x0+3*u*u*t*ax+3*u*t*t*bx+t*t*t*x1,
               u*u*u*y0+3*u*u*t*ay+3*u*t*t*by+t*t*t*y1); } },
      quad:function(x0,y0,ax,ay,x1,y1){
        for(var s=1;s<=steps;s++){ var t=s/steps,u=1-t;
          push(u*u*x0+2*u*t*ax+t*t*x1, u*u*y0+2*u*t*ay+t*t*y1); } },
      close:function(sx,sy){ push(sx,sy); }
    });
    return subs.filter(function(s){ return s.length>1; });
  }
  /* and to a Shape, so an outline can become a solid */
  function toShape(d,fn){
    var shapes=[], sh=null;
    function P(x,y){ var p=fn?fn(x,y):{x:x,y:y}; return [wx(p.x),wy(p.y)]; }
    walk(d,{
      move:function(x,y){ sh=new THREE.Shape(); shapes.push(sh); var p=P(x,y); sh.moveTo(p[0],p[1]); },
      line:function(x0,y0,x1,y1){ if(!sh)return; var p=P(x1,y1); sh.lineTo(p[0],p[1]); },
      cubic:function(x0,y0,ax,ay,bx,by,x1,y1){ if(!sh)return;
        /* the warp is not affine, so the control points are flattened too */
        for(var s=1;s<=10;s++){ var t=s/10,u=1-t;
          var p=P(u*u*u*x0+3*u*u*t*ax+3*u*t*t*bx+t*t*t*x1,
                  u*u*u*y0+3*u*u*t*ay+3*u*t*t*by+t*t*t*y1);
          sh.lineTo(p[0],p[1]); } },
      quad:function(x0,y0,ax,ay,x1,y1){ if(!sh)return;
        for(var s=1;s<=10;s++){ var t=s/10,u=1-t;
          var p=P(u*u*x0+2*u*t*ax+t*t*x1, u*u*y0+2*u*t*ay+t*t*y1);
          sh.lineTo(p[0],p[1]); } },
      close:function(){ if(sh) sh.autoClose=true; }
    });
    return shapes;
  }

  /* ---------- how tall she is at any point along her ---------- */
  /* Everything that has to sit ON her — the cloth, the tapes, the post —
     asks this instead of trusting an anchor. It is why the coat can never
     hang off her belly into thin air and a tape can never wrap less than
     the animal it is wrapping. */
  /* A proper scanline, not a window. Taking the highest and lowest points
     near an x conflates the NECK with the CHEST UNDERNEATH IT — which is
     exactly why the collar came out as a slab across her shoulder. Crossing
     the outline at x gives the real spans, and each thing that sits on her
     says which span it means. */
  function silhouette(d,w){
    var loops=flatten(d,12).map(function(sub){
      return sub.map(function(p){ var q=w?w(p[0],p[1]):{x:p[0],y:p[1]}; return [q.x,q.y]; });
    });
    function spans(x){
      var ys=[];
      loops.forEach(function(pts){
        var n=pts.length;
        for(var i=0;i<n;i++){
          var a=pts[i], b=pts[(i+1)%n];
          if((a[0]<=x&&b[0]>x)||(b[0]<=x&&a[0]>x)){
            ys.push(a[1]+(b[1]-a[1])*((x-a[0])/(b[0]-a[0])));
          }
        }
      });
      ys.sort(function(p,q){ return p-q; });
      var out=[];
      for(var k=0;k+1<ys.length;k+=2)
        out.push({top:ys[k],bot:ys[k+1],mid:(ys[k]+ys[k+1])/2,half:(ys[k+1]-ys[k])/2});
      return out;
    }
    return {
      spans:spans,
      /* the span that holds refY — or, with no reference, the deepest one */
      at:function(x,refY){
        var sp=spans(x); if(!sp.length) return null;
        var best=null, bd=1e9;
        sp.forEach(function(z){
          var d2 = (refY==null) ? -(z.bot-z.top)
                 : (refY>=z.top&&refY<=z.bot) ? 0
                 : Math.min(Math.abs(refY-z.top),Math.abs(refY-z.bot));
          if(d2<bd){ bd=d2; best=z; }
        });
        return best;
      },
      /* the topline, for a tape laid along her back */
      topAt:function(x){
        var sp=spans(x); return sp.length?sp[0].top:null;
      }
    };
  }

  /* ---------- materials ---------- */
  function grainTex(base,warp,weft,rep){
    var c=document.createElement('canvas'); c.width=c.height=256;
    var x=c.getContext('2d'), i,j;
    x.fillStyle=base; x.fillRect(0,0,256,256);
    for(i=0;i<256;i+=3){
      x.fillStyle='rgba('+warp+','+(.05+Math.random()*.07).toFixed(3)+')'; x.fillRect(i,0,1.6,256);
      x.fillStyle='rgba('+weft+','+(.03+Math.random()*.05).toFixed(3)+')'; x.fillRect(i+1.8,0,1.1,256);
    }
    for(j=0;j<256;j+=3){
      x.fillStyle='rgba('+warp+','+(.04+Math.random()*.06).toFixed(3)+')'; x.fillRect(0,j,256,1.5);
      x.fillStyle='rgba('+weft+','+(.025+Math.random()*.045).toFixed(3)+')'; x.fillRect(0,j+1.7,256,1);
    }
    for(i=0;i<800;i++){
      x.fillStyle='rgba('+(Math.random()<.5?warp:weft)+','+(.05+Math.random()*.12).toFixed(3)+')';
      x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*3,1);
    }
    var t=new THREE.CanvasTexture(c);
    t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep||3,rep||3);
    return t;
  }
  var calico=grainTex('#D6C4A8','255,250,238','120,98,72',4);
  var HAS_PHYS=!!THREE.MeshPhysicalMaterial;
  function soft(col,tex,ruf){
    var o={color:col,roughness:ruf===undefined?.98:ruf,metalness:0};
    if(tex) { o.map=tex; o.bumpMap=tex; o.bumpScale=.010; }
    return HAS_PHYS ? new THREE.MeshPhysicalMaterial(
      Object.assign(o,{sheen:.30,sheenColor:new THREE.Color(0xFFF6E8),sheenRoughness:.78}))
      : new THREE.MeshStandardMaterial(o);
  }
  /* An unbleached calico TOILE — the muslin first fitting a tailor cuts
     before touching the real cloth — not a varnished tan. The old colour
     read as plywood, and a plywood animal makes the whole bench look like
     a school project instead of a fitting. */
  var faceMat = soft(0xE3DACB,calico,1);
  var edgeMat = soft(0xD3C7B4,calico,1);        /* the seamed edge, a shade deeper */
  var farMat  = soft(0xCABEAB,calico,1);        /* the limbs behind her            */
  var wood=new THREE.MeshStandardMaterial({color:0x7E6142,roughness:.70,metalness:0});
  var brass=new THREE.MeshStandardMaterial({color:0xC9A45E,roughness:.36,metalness:.72});
  var tapeTex=(function(){
    var c=document.createElement('canvas'); c.width=512; c.height=32;
    var x=c.getContext('2d');
    x.fillStyle='#F6EBD2'; x.fillRect(0,0,512,32);
    x.strokeStyle='rgba(90,66,44,.55)'; x.lineWidth=1.4;
    for(var i=0;i<512;i+=16){
      var big=(i%64===0);
      x.beginPath(); x.moveTo(i+.5,0); x.lineTo(i+.5,big?13:7); x.stroke();
      x.beginPath(); x.moveTo(i+.5,32); x.lineTo(i+.5,32-(big?13:7)); x.stroke();
    }
    x.fillStyle='rgba(90,66,44,.30)';
    for(var j=0;j<512;j+=64){ x.fillRect(j+4,14,7,4); }
    var t=new THREE.CanvasTexture(c);
    t.wrapS=THREE.RepeatWrapping; t.wrapT=THREE.ClampToEdgeWrapping; t.repeat.set(6,1);
    return t;
  })();
  var tapeMat=new THREE.MeshStandardMaterial({color:0xffffff,map:tapeTex,
    roughness:.96,metalness:0});
  var jetMat=new THREE.MeshStandardMaterial({color:0x2A1F18,roughness:.28,metalness:.12});
  var clothTexCv=document.createElement('canvas'); clothTexCv.width=512; clothTexCv.height=512;
  var clothCtx=clothTexCv.getContext('2d');
  var clothTex=new THREE.CanvasTexture(clothTexCv);
  clothTex.wrapS=clothTex.wrapT=THREE.RepeatWrapping; clothTex.repeat.set(1.15,1.15);
  var clothMat=soft(0xffffff,clothTex,.74); clothMat.map=clothTex;
  var clothEdge=soft(0xffffff,null,.82);
  var trimMat=new THREE.MeshStandardMaterial({color:0xA9773F,roughness:.52,metalness:.02});

  /* ---------- depth: what stands in front of what ---------- */
  /* How thick she is. She was 1.30 — eighty drawing-units of depth against a
     neck thirty-seven units tall, which is why every band round her came out
     wider than the part it was wrapping. */
  var DB=1.02;
  var Z_FAR=-DB*.52, Z_NEAR=DB*.52;
  /* Anything meant to be SEEN on her has to clear her own half-depth plus the
     bevel — and anything on the CLOTH has to clear the cloth as well. Getting
     these two numbers wrong is how a collar, and then a monogram, end up
     invisible inside the animal they are supposed to be on. */
  var Z_SKIN=DB*.5+.062, Z_CLOTH=DB*.55+.075;

  /* ================= WHAT THE THREE NUMBERS ACTUALLY DO =================
     They describe an ANIMAL, so the animal takes them. Pull the torace and
     her ribcage deepens; pull the dorso and she lengthens behind the
     shoulder; pull the collo and her neck thickens. Her legs keep their feet
     on the base while their tops travel with her belly.

     This is the whole point, and it is what was missing. While she was a
     fixed mannequin with a changing coat, the coat could only ever look
     badly fitted — because the body it was cut for was not the body it was
     sitting on. Now the garment is cut FROM her, at build time, from the
     outline she has just been warped into. It fits by construction.
     ====================================================================== */
  function warper(A,P){
    var d=A.def;
    var sx=1+(P.back -d.back )/d.back *.55;   /* longer through the loin  */
    var sy=1+(P.chest-d.chest)/d.chest*.42;   /* deeper through the ribs  */
    var sn=1+(P.neck -d.neck )/d.neck *.55;   /* thicker through the neck */
    var wX=A.W[0], spineY=A.W[1]-6, ncx=A.NC[0], ncy=A.NC[1];
    return function(x,y){
      var X = x>wX ? wX+(x-wX)*sx : x;
      var torso=smoothstep(wX-46,wX+26,x);
      var Y = spineY+(y-spineY)*(1+(sy-1)*torso);
      var neck=Math.exp(-Math.pow((x-ncx)/30,2))*(1-smoothstep(wX-14,wX+30,x));
      Y = ncy+(Y-ncy)*(1+(sn-1)*neck);
      return {x:X,y:Y};
    };
  }
  var fn=null;

  /* ---------- her cloth's own texture, with her name in it ---------- */
  var tileImgs={}, lastPaint='';
  ['lana','lino','trap','cera'].forEach(function(k){
    var im=new Image();
    im.onload=function(){ tileImgs[k]=im; lastPaint=''; paintCloth(); };
    im.src=CLOTH_TILES[k];
  });
  function paintCloth(force){
    var key=st.cloth+'|'+st.trim;
    if(key===lastPaint && !force) return;
    lastPaint=key;
    var C=CLOTHS[st.cloth], im=tileImgs[st.cloth];
    clothCtx.fillStyle=C.fill; clothCtx.fillRect(0,0,512,512);
    if(im){ for(var y=0;y<512;y+=256) for(var x=0;x<512;x+=256) clothCtx.drawImage(im,x,y,256,256); }
    clothTex.needsUpdate=true;
    clothMat.color.set(0xffffff);
    clothEdge.color.set(C.edge);
    trimMat.color.set(TRIMS[st.trim].tr);
  }

  /* ---------- the stand ---------- */
  var postMesh=null, standG=new THREE.Group();
  root.add(standG);
  (function(){
    var base=new THREE.Mesh(new THREE.CylinderGeometry(1.72,1.86,.09,64),wood);
    base.position.y=FLOOR-.045; standG.add(base);
    var lip=new THREE.Mesh(new THREE.TorusGeometry(1.74,.028,10,64),brass);
    lip.rotation.x=Math.PI/2; lip.position.y=FLOOR; standG.add(lip);
    var c=document.createElement('canvas'); c.width=c.height=256;
    var g2=c.getContext('2d');
    var gr=g2.createRadialGradient(128,132,6,128,132,124);
    gr.addColorStop(0,'rgba(58,40,26,.40)'); gr.addColorStop(.44,'rgba(58,40,26,.16)');
    gr.addColorStop(1,'rgba(58,40,26,0)');
    g2.fillStyle=gr; g2.fillRect(0,0,256,256);
    var sh=new THREE.Mesh(new THREE.PlaneGeometry(6.2,6.2),
      new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));
    sh.rotation.x=-Math.PI/2; sh.position.y=FLOOR+.006; standG.add(sh);
  })();

  /* ---------- building her ---------- */
  var parts=[], piece=[];
  function add(m,z,isPiece){
    m.position.z=z||0; body.add(m); parts.push(m);
    if(isPiece) piece.push(m);
    return m;
  }
  function clear(){
    parts.forEach(function(m){
      if(m.geometry) m.geometry.dispose();
      if(m.children) m.children.forEach(function(c){ if(c.geometry) c.geometry.dispose(); });
      if(m.parent) m.parent.remove(m); else body.remove(m);
    });
    parts=[]; piece=[];
  }
  function slab(d,depth,bevel,mats,fn){
    var shapes=toShape(d,fn);
    if(!shapes.length) return null;
    var g=new THREE.ExtrudeGeometry(shapes,{
      depth:depth, bevelEnabled:true, bevelThickness:bevel, bevelSize:bevel,
      bevelSegments:3, curveSegments:2, steps:1});
    g.translate(0,0,-depth/2);
    return new THREE.Mesh(g,mats);
  }
  function cord(d,rad,mat,fn,z){
    var subs=flatten(d,12), out=new THREE.Group();
    subs.forEach(function(pts){
      var v=pts.map(function(p){ var q=fn?fn(p[0],p[1]):{x:p[0],y:p[1]};
        return new THREE.Vector3(wx(q.x),wy(q.y),0); });
      if(v.length<2) return;
      var closed=v[0].distanceTo(v[v.length-1])<1e-4;
      if(closed) v.pop();
      if(v.length<2) return;
      out.add(new THREE.Mesh(new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(v,closed,'centripetal'),
        Math.max(24,v.length*2), rad, 8, closed), mat));
    });
    return out;
  }
  /* A leg is not a dowel. It is thick at the shoulder, narrow at the pastern,
     and it ends in a paw — which is the difference between an animal standing
     and a table. So the sweep carries its own radius down the length. */
  function taper(v,r0,r1,mat){
    var curve=new THREE.CatmullRomCurve3(v,false,'centripetal');
    var NS=26, NR=12, pos=[],idx=[],i,j;
    for(i=0;i<=NS;i++){
      var t=i/NS, c=curve.getPoint(t), tg=curve.getTangent(t);
      var r=r0+(r1-r0)*Math.pow(t,.78);
      var px=-tg.y, py=tg.x, m=Math.hypot(px,py)||1; px/=m; py/=m;
      for(j=0;j<=NR;j++){
        var a=j/NR*Math.PI*2, ca=Math.cos(a)*r, sa=Math.sin(a)*r;
        pos.push(c.x+px*ca, c.y+py*ca, c.z+sa);
      }
    }
    for(i=0;i<NS;i++) for(j=0;j<NR;j++){
      var a2=i*(NR+1)+j, b2=a2+NR+1;
      idx.push(a2,b2,a2+1, b2,b2+1,a2+1);
    }
    var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setIndex(idx); g.computeVertexNormals();
    var out=new THREE.Group();
    out.add(new THREE.Mesh(g,mat));
    var paw=new THREE.Mesh(new THREE.SphereGeometry(r1*1.30,16,12),mat);
    paw.position.copy(v[v.length-1]); paw.position.y+=r1*.30; paw.scale.y=.80;
    out.add(paw);
    return out;
  }
  function legCord(d,rad,mat,w){
    var subs=flatten(d,12), out=new THREE.Group();
    subs.forEach(function(pts){
      var n=pts.length;
      var v=pts.map(function(p,i){
        /* her shoulder travels with her barrel; her paw stays on the base */
        var q=w?w(p[0],p[1]):{x:p[0],y:p[1]};
        var k=1-i/(n-1);
        return new THREE.Vector3(wx(p[0]+(q.x-p[0])*k), wy(p[1]+(q.y-p[1])*k), 0);
      });
      if(v.length<2) return;
      /* run the top of the leg up inside her, so the cut end never shows */
      var d0=v[0].clone().sub(v[1]).normalize().multiplyScalar(.34);
      v.unshift(v[0].clone().add(d0));
      out.add(taper(v,rad*1.16,rad*.60,mat));
    });
    return out;
  }
  /* A tape is not a wire. Seen from the side a band round an animal is a
     flat strap crossing her, and a round tube of it projects to a hairline
     you cannot tell you are pulling. So it is built as a ribbon: an ellipse
     round her, given width along her own length, lying on her. */
  function ringAt(cx,cy,rx,ry,deg,zHalf,wid,mat){
    var a=deg*Math.PI/180, N=88, pos=[],idx=[],uv=[],k;
    var nx=Math.cos(a)*wid*.5*SC, ny=-Math.sin(a)*wid*.5*SC;
    /* She is cut from board, so her section is a rounded rectangle, not an
       oval. An oval tape dives through her at the top and the bottom and you
       are left with a sticker on her ribs. A superellipse hugs the cut. */
    function se(v,e){ var c=Math.cos(v),s2=Math.sin(v);
      return [Math.sign(c)*Math.pow(Math.abs(c),2/e), Math.sign(s2)*Math.pow(Math.abs(s2),2/e)]; }
    for(k=0;k<=N;k++){
      var th=k/N*Math.PI*2, q=se(th,3.4);
      var uy=q[0]*ry, uz=q[1]*zHalf;
      var X=wx(cx)+(-uy*Math.sin(a))*SC, Y=wy(cy)-(uy*Math.cos(a))*SC;
      pos.push(X-nx,Y-ny,uz, X+nx,Y+ny,uz);
      uv.push(k/N,0, k/N,1);
    }
    for(k=0;k<N;k++){
      var i0=k*2;
      idx.push(i0,i0+1,i0+2, i0+1,i0+3,i0+2);
    }
    var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.setIndex(idx); g.computeVertexNormals();
    var m2=mat.clone(); m2.side=THREE.DoubleSide;
    return new THREE.Mesh(g,m2);
  }

  /* ---------- cutting the cloth off HER, not off a separate drawing ----------
     Everything here is read from the outline she has just been warped into,
     so the panel follows her topline, stops where her body stops, and can
     never hang in the air beside her. Change the torace and the panel gets
     deeper because she got deeper; change the dorso and it runs further back
     because she got longer. That is what "made to measure" has to mean. */
  var coatSpan={x0:0,x1:0};
  function shapeFromPts(pts){
    var sh=new THREE.Shape();
    pts.forEach(function(p,i){
      if(i===0) sh.moveTo(wx(p[0]),wy(p[1])); else sh.lineTo(wx(p[0]),wy(p[1]));
    });
    sh.autoClose=true;
    return [sh];
  }
  function slabPts(pts,depth,bevel,mats){
    var g2=new THREE.ExtrudeGeometry(shapeFromPts(pts),{depth:depth,bevelEnabled:true,
      bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:2,steps:1});
    g2.translate(0,0,-depth/2);
    return new THREE.Mesh(g2,mats);
  }
  function cordPts(pts,rad,mat){
    var v=pts.map(function(p){ return new THREE.Vector3(wx(p[0]),wy(p[1]),0); });
    if(v.length<3) return null;
    return new THREE.Mesh(new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(v,true,'centripetal'),Math.max(90,v.length*2),rad,7,true),mat);
  }
  function cutGarment(A,SIL){
    if(st.garment==='collar') return null;
    var cape=(st.garment==='cape');
    var backLen=map(dsp.back,M.back.min,M.back.max,M.back.vis[0],M.back.vis[1]);
    var sx=1+(dsp.back-A.def.back)/A.def.back*.55;
    var x0=A.W[0]-6;
    var x1=Math.min(x0+backLen*(cape?.80:1), BND.x1-12);
    coatSpan={x0:x0,x1:x1};
    /* how far down her flank the cloth comes, read off the torace */
    var deep=map(dsp.chest,M.chest.min,M.chest.max,.46,.97);
    var N=34, top=[], bot=[], i,t,x,sp,h,corner,d0;
    for(i=0;i<=N;i++){
      t=i/N; x=x0+(x1-x0)*t;
      sp=SIL.at(x,A.W[1]); if(!sp) continue;
      h=sp.bot-sp.top;
      /* the corners round off rather than ending in a point */
      corner=.70+.30*smoothstep(0,.12,t)*smoothstep(0,.10,1-t);
      d0=h*deep*corner*(cape? .72+.44*t : 1);
      top.push([x, sp.top+2.4]);
      bot.push([x, Math.min(sp.bot-2.4, sp.top+2.4+d0)]);
    }
    if(top.length<3) return null;
    return top.concat(bot.reverse());
  }

  var pairG=null;
  var Q=null;   /* what she was built from last, so we only rebuild on change */
  function build(){
    var A=SPECIES[st.sp], P={back:dsp.back,chest:dsp.chest,neck:dsp.neck};
    var g=document.getElementById(st.sp==='cat'?'anCat':'anDog');
    if(!g) return;
    clear();
    fn=warper(A,P);
    measure(g,fn);
    var SIL=null;

    var bodyD=g.querySelector('.an-body').getAttribute('d');
    SIL=silhouette(bodyD,fn);
    var earEl=g.querySelector('.an-ear'), tailEl=g.querySelector('.an-tail');
    var farLegs=[].map.call(g.querySelectorAll('.an-far .an-leg'),function(e){return e.getAttribute('d');});
    var nearLegs=[].map.call(g.querySelectorAll(':scope > .an-leg'),function(e){return e.getAttribute('d');});
    if(!nearLegs.length) nearLegs=[].map.call(g.querySelectorAll('.an-leg'),function(e){return e.getAttribute('d');}).slice(2);

    /* behind her */
    farLegs.forEach(function(d){ add(legCord(d,9.4*SC,farMat,fn),Z_FAR); });
    if(tailEl){
      var tv=(flatten(tailEl.getAttribute('d'),12)[0]||[]).map(function(p){
        var q=fn(p[0],p[1]); return new THREE.Vector3(wx(q.x),wy(q.y),0); });
      if(tv.length>1) add(taper(tv,6.4*SC,3.2*SC,farMat),Z_FAR*.55);
    }

    /* her */
    var bm=slab(bodyD,DB,.036,[faceMat,edgeMat],fn);
    if(bm) add(bm,0);
    if(earEl){ var em=slab(earEl.getAttribute('d'),DB*.42,.026,[edgeMat,edgeMat],fn);
      if(em) add(em,DB*.40); }

    /* her eye, a jet button sewn on */
    var eye=g.querySelector('.an-eye');
    var eyeQ=eye;
    if(eye){
      var ex=+eye.getAttribute('cx'), ey=+eye.getAttribute('cy'), er=+eye.getAttribute('r');
      var eR=er*1.35*SC, ew=fn(ex,ey);
      var eb=new THREE.Mesh(new THREE.SphereGeometry(eR,18,14),jetMat);
      eb.position.set(wx(ew.x),wy(ew.y),DB*.5+eR*.35); eb.scale.z=.7;
      body.add(eb); parts.push(eb);
    }
    /* and her nose, at the very front of the muzzle */
    (function(){
      /* The muzzle, not the chin. The leftmost point of a cat's head is the
         underside of her jaw, and a nose stuck there looks like a beard. So
         take the front of the head at roughly the height of the eye. */
      var pts=flatten(bodyD,10)[0]||[], minx=1e9, best=null;
      pts.forEach(function(p){ if(p[0]<minx) minx=p[0]; });
      var ny=(eyeQ? +eyeQ.getAttribute('cy') : 170)+16;
      pts.forEach(function(p){
        if(p[0]>minx+20) return;
        if(!best || Math.abs(p[1]-ny)<Math.abs(best[1]-ny)) best=p;
      });
      if(!best) return;
      var nR=12*SC;
      var nb=new THREE.Mesh(new THREE.SphereGeometry(nR,20,16),jetMat);
      /* it sits on the tip of the muzzle, half of it out in the air */
      nb.position.set(wx(best[0])-nR*.26,wy(best[1])-nR*.45,0); nb.scale.z=.62;
      body.add(nb); parts.push(nb);
    })();

    /* the cloth she is being fitted for — the flat engine's own cut */
    var gb=document.getElementById('gmBody');
    var coatOut=cutGarment(A,SIL);
    if(coatOut){
      var cm=slabPts(coatOut,DB*1.10,.05,[clothMat,clothEdge]);
      if(cm) add(cm,0,true);
      var pipe=cordPts(coatOut,3.1*SC,trimMat);
      if(pipe){ pipe.position.z=Z_CLOTH-.01; body.add(pipe); parts.push(pipe); piece.push(pipe);
        var pipe2=pipe.clone(); pipe2.position.z=-(Z_CLOTH-.01); body.add(pipe2); parts.push(pipe2); piece.push(pipe2); }
      /* the belly band, inside the panel it belongs to */
      var bx=A.W[0]-6+(coatSpan.x1-(A.W[0]-6))*.30;
      var sc2=SIL.at(bx,A.W[1]);
      if(sc2) add(ringAt(bx,sc2.mid,26,sc2.half+2.5,A.CR,Z_CLOTH+.02,8,trimMat),0,true);
    }
    /* or the collar, when that is the whole commission */
    if(st.garment==='collar'){
      var cA=SPECIES[st.sp];
      var nc2=SIL.at(cA.NC[0],cA.NC[1]);
      var cMid=nc2?nc2.mid:cA.NC[1], cHalf=(nc2?nc2.half:14);
      /* the collar is a band on the NECK — not a slab across her shoulder,
         which is what it was while the outline lookup could not tell the
         two apart */
      add(ringAt(cA.NC[0],cMid,13,cHalf+2.5,cA.NR,Z_SKIN+.02,20,clothMat),0,true);
      add(ringAt(cA.NC[0],cMid,13,cHalf+3.8,cA.NR,Z_SKIN+.055,5,trimMat),0,true);
      /* and the buckle it fastens with */
      var bq=new THREE.Mesh(new THREE.BoxGeometry(9*SC,13*SC,5*SC),brass);
      bq.position.set(wx(cA.NC[0]),wy(cMid+cHalf*.35),Z_SKIN+.09);
      bq.rotation.z=-cA.NR*Math.PI/180;
      body.add(bq); parts.push(bq); piece.push(bq);
      /* a tag hanging from it, because that is what a collar has */
      var tg=new THREE.Mesh(new THREE.CircleGeometry(7*SC,22),brass);
      tg.position.set(wx(cA.NC[0]+4),wy(cMid+cHalf+12),Z_SKIN+.10);
      body.add(tg); parts.push(tg); piece.push(tg);
    }

    /* ---------- and the piece for you, folded on the base beside her ----------
       "And for you" was a row of buttons that changed nothing you could see.
       It is the whole commercial idea of this business — the matching pair —
       so it is made, in the same cloth and the same leather, and it sits on
       the base where she is standing. */
    if(st.pair && st.pair!=='none'){
      var pg=new THREE.Group(), fold;
      if(st.pair==='sciarpa'){
        [[0,.052,.68,.30,.024],[.030,.078,.62,.27,.022],[.058,.101,.55,.24,.020]]
          .forEach(function(f,i){
            fold=new THREE.Mesh(new THREE.BoxGeometry(f[2],f[4],f[3]),clothMat);
            fold.position.set(f[0],f[1],0); fold.rotation.y=i*.03; pg.add(fold);
          });
        var roll=new THREE.Mesh(new THREE.CylinderGeometry(.030,.030,.30,16),clothMat);
        roll.rotation.x=Math.PI/2; roll.position.set(-.30,.074,0); pg.add(roll);
        var frin=new THREE.Mesh(new THREE.BoxGeometry(.05,.016,.28),trimMat);
        frin.position.set(.31,.113,0); pg.add(frin);
      } else if(st.pair==='pochette'){
        var sq=new THREE.Mesh(new THREE.BoxGeometry(.44,.026,.44),clothMat);
        sq.position.y=.055; sq.rotation.y=.22; pg.add(sq);
        var pk=new THREE.Mesh(new THREE.ConeGeometry(.13,.20,4),clothMat);
        pk.position.set(-.02,.16,0); pk.rotation.y=.78; pg.add(pk);
        var bnd=new THREE.Mesh(new THREE.BoxGeometry(.46,.014,.07),trimMat);
        bnd.position.set(0,.072,.11); bnd.rotation.y=.22; pg.add(bnd);
      } else {
        /* il nastro — a bow, tied */
        [-1,1].forEach(function(w){
          var lp=new THREE.Mesh(new THREE.TorusGeometry(.17,.040,10,28),clothMat);
          lp.position.set(w*.17,.10,0);
          lp.rotation.set(Math.PI/2,0,w*.36);
          lp.scale.set(1,.52,1); pg.add(lp);
        });
        var kn=new THREE.Mesh(new THREE.SphereGeometry(.058,16,12),trimMat);
        kn.position.set(0,.115,0); kn.scale.y=.72; pg.add(kn);
        [-1,1].forEach(function(w){
          var tl=new THREE.Mesh(new THREE.BoxGeometry(.055,.014,.22),clothMat);
          tl.position.set(w*.09,.045,.16); tl.rotation.set(.10,w*.22,0); pg.add(tl);
        });
      }
      /* on the base she is standing on, at the front where it can be seen */
      pg.position.set(-.42, FLOOR+.02, 1.00);
      pg.rotation.y=-.34;
      standG.add(pg); parts.push(pg);
      pairG=pg;
    }

    /* ---------- her name, worked into the flank ---------- */
    if(coatOut && (st.name||'').trim()){
      var nm=(st.name||'').trim(), C2=CLOTHS[st.cloth];
      var lo2=1e9,hi2=-1e9,lx=1e9,rx=-1e9;
      coatOut.forEach(function(pt){
        if(pt[0]<lx)lx=pt[0]; if(pt[0]>rx)rx=pt[0];
        if(pt[1]<lo2)lo2=pt[1]; if(pt[1]>hi2)hi2=pt[1];
      });
      var cw2=document.createElement('canvas'); cw2.width=512; cw2.height=160;
      var cx2=cw2.getContext('2d');
      cx2.clearRect(0,0,512,160);
      cx2.font='600 96px Italiana, Didot, Georgia, serif';
      cx2.textAlign='center'; cx2.textBaseline='middle';
      cx2.lineJoin='round'; cx2.lineWidth=9; cx2.strokeStyle=C2.thDk;
      cx2.strokeText(nm,256,84); cx2.fillStyle=C2.th; cx2.fillText(nm,256,84);
      var nt=new THREE.CanvasTexture(cw2);
      var wS=Math.min((rx-lx)*.62, 190)*SC;
      var nmMesh=new THREE.Mesh(new THREE.PlaneGeometry(wS,wS*160/512),
        new THREE.MeshBasicMaterial({map:nt,transparent:true,depthWrite:false}));
      nmMesh.position.set(wx((lx+rx)/2), wy((lo2+hi2)/2+4), Z_CLOTH+.012);
      body.add(nmMesh); parts.push(nmMesh); piece.push(nmMesh);
      var nmB=nmMesh.clone(); nmB.position.z=-(Z_CLOTH+.012); nmB.rotation.y=Math.PI;
      body.add(nmB); parts.push(nmB); piece.push(nmB);
    }

    /* in front of her */
    nearLegs.forEach(function(d){ add(legCord(d,9.4*SC,faceMat,fn),Z_NEAR); });
    var wh=g.querySelector('.an-whisk');
    if(wh) add(cord(wh.getAttribute('d'),1.1*SC,edgeMat,fn),DB*.5);

    /* the three tapes, lying on her */
    var Ab=SPECIES[st.sp];
    (function(){
      var ry=map(dsp.neck,M.neck.min,M.neck.max,M.neck.vis[0],M.neck.vis[1]);
      var cy=Ab.NC[1], nx=Ab.NC[0];
      var nc3=SIL.at(nx,cy);
      if(nc3){ cy=nc3.mid; ry=Math.max(nc3.half+2,Math.min(ry,nc3.half+3.5)); }
      /* when the commission IS a collar, the collar is the neck measurement —
         a second band in the same place is just clutter */
      if(st.garment==='collar'){
        HP.neck.set(wx(nx)-ry*SC*.62, wy(cy)-ry*SC*.98, Z_SKIN);
        return;
      }
      add(ringAt(nx,cy,13,ry,Ab.NR,Z_SKIN,7,tapeMat),0);
      HP.neck.set(wx(nx)-ry*SC*.62, wy(cy)-ry*SC*.98, Z_SKIN);
    })();
    (function(){
      /* over the cloth, not under it — a tape swallowed by the coat panel
         is a tape nobody can see they are pulling */
      var ry=map(dsp.chest,M.chest.min,M.chest.max,M.chest.vis[0],M.chest.vis[1]);
      var cy=Ab.CC[1], zh=Z_SKIN;
      var c=SIL.at(Ab.CC[0],Ab.CC[1]);
      if(c){ ry=Math.max(c.half+3,Math.min(ry,c.half+11)); cy=c.mid; }
      if(coatOut){
        var lo=1e9,hi=-1e9;
        coatOut.forEach(function(pt){
          if(Math.abs(pt[0]-Ab.CC[0])<22){ if(pt[1]<lo)lo=pt[1]; if(pt[1]>hi)hi=pt[1]; }
        });
        if(hi>lo){ ry=Math.max(ry,(hi-lo)/2+4); cy=(hi+lo)/2; zh=Z_CLOTH; }
      }
      add(ringAt(Ab.CC[0],cy,26,ry,Ab.CR,zh,10,tapeMat),0);
      HP.chest.set(wx(Ab.CC[0])+ry*SC*.10, wy(cy)-ry*SC*1.02, zh);
    })();
    (function(){
      /* Not a bar hovering over her. The topline is read off the outline she
         is actually cut from, and the tape is laid down on it. */
      var Lp=map(dsp.back,M.back.min,M.back.max,M.back.vis[0],M.back.vis[1]);
      var x0=Ab.BO[0], x1=x0+Lp;
      function topAt(X){ return SIL.topAt(X); }
      var v=[], N=16, anyTop=null;
      for(var i=0;i<=N;i++){
        var X=x0+(x1-x0)*i/N, Y=topAt(X);
        if(Y===null) Y = anyTop!==null ? anyTop : Ab.BO[1];
        else anyTop=Y;
        v.push(new THREE.Vector3(wx(X),wy(Y-7),DB*.30));
      }
      add(new THREE.Mesh(new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(v,false,'centripetal'),90,2.6*SC,7,false),tapeMat),0);
      var e=v[v.length-1];
      HP.back.set(e.x,e.y,DB*.34);
    })();

    /* the post, cut to meet her belly */
    if(postMesh){ standG.remove(postMesh); postMesh.geometry.dispose(); }
    /* under her feet, not under an anchor: a base she is standing off the
       edge of is worse than no base at all */
    var footX=(function(){
      var xs=[];
      [].concat(farLegs,nearLegs).forEach(function(d){
        var sub=flatten(d,6)[0]; if(sub&&sub.length) xs.push(sub[sub.length-1][0]);
      });
      if(!xs.length) return Ab.CC[0];
      return xs.reduce(function(a,b){return a+b;},0)/xs.length;
    })();
    var bc=SIL.at(Ab.CC[0],Ab.CC[1]);
    var bellyY=bc?bc.bot:Ab.CC[1]+46;
    var top=wy(bellyY)+.05, h=Math.max(.3,top-FLOOR);
    postMesh=new THREE.Mesh(new THREE.CylinderGeometry(.07,.095,h,22),wood);
    postMesh.position.set(wx(Ab.CC[0])-wx(footX),FLOOR+h/2,0); standG.add(postMesh);
    if(standG) standG.position.x=wx(footX);


    paintCloth(true);
    frameCamera();
  }

  /* ---------- framing ---------- */
  var HP={neck:new THREE.Vector3(),chest:new THREE.Vector3(),back:new THREE.Vector3()};
  var CAM_R=9, LOOK=new THREE.Vector3(0,0,0);
  function frameCamera(){
    if(!sizeW||!sizeH) return;
    var asp=sizeW/sizeH, vf=camera.fov*Math.PI/180, tn=Math.tan(vf/2);
    var top=wy(BND.y0), bot=FLOOR-.16;                 /* head to base rim */
    var W=(BND.x1-BND.x0)*SC+DB*.75+.28, H=(top-bot)+.26;
    var dH=(H/2)/tn, dW=(W/2)/(tn*asp);
    CAM_R=Math.max(dH,dW)*1.03;
    LOOK.set(0,(top+bot)/2,0);
  }

  /* ---------- turning her, and the breath of the room ---------- */
  var YAW=.40;                    /* she is a relief: she must not turn edge-on */
  var yaw=-.16, yawT=-.16, pitch=.02, pitchT=.02, dragging=null, px=0, py=0;
  var turnHint=document.getElementById('picTurn');
  cv.addEventListener('pointerdown',function(e){
    if(e.target!==cv) return;
    dragging={x:e.clientX,y:e.clientY,y0:yawT,p0:pitchT};
    cv.classList.add('turning');
    try{ cv.setPointerCapture(e.pointerId); }catch(err){}
    if(turnHint) turnHint.style.opacity='0';
  });
  cv.addEventListener('pointermove',function(e){
    if(!dragging) return;
    yawT  = Math.max(-YAW,Math.min(YAW, dragging.y0+(e.clientX-dragging.x)*.006));
    pitchT= Math.max(-.16,Math.min(.24, dragging.p0+(e.clientY-dragging.y)*.003));
    e.preventDefault();
  });
  ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
    cv.addEventListener(ev,function(){ dragging=null; cv.classList.remove('turning'); });
  });
  wrap.addEventListener('pointermove',function(e){
    if(dragging) return;
    var r=wrap.getBoundingClientRect();
    px=((e.clientX-r.left)/r.width-.5); py=((e.clientY-r.top)/r.height-.5);
  },{passive:true});
  wrap.addEventListener('pointerleave',function(){ px=0; py=0; });
  /* a phone has no pointer to hover with, so the tilt of the handset drives it */
  if(TOUCH && window.DeviceOrientationEvent){
    window.addEventListener('deviceorientation',function(e){
      if(dragging||e.gamma==null) return;
      px=Math.max(-.6,Math.min(.6,e.gamma/38));
      py=Math.max(-.5,Math.min(.5,((e.beta||45)-45)/50));
    },{passive:true});
  }

  /* ---------- pulling a tape ---------- */
  [].forEach.call(handles.querySelectorAll('.ph'),function(h){
    var k=h.dataset.m, d=null;
    h.addEventListener('pointerdown',function(e){
      d={x:e.clientX,y:e.clientY,v:st[k]}; h.classList.add('dragging');
      dspEase.neck=dspEase.chest=dspEase.back=.55;
      try{ h.setPointerCapture(e.pointerId); }catch(err){}
      e.preventDefault(); e.stopPropagation();
    });
    h.addEventListener('pointermove',function(e){
      if(!d) return;
      var m=M[k], gain=(TOUCH?1.05:.7);
      var mx=e.clientX-d.x, my=d.y-e.clientY;
      /* on the stacked layout the card is not over her, so let the thumb
         push in whichever direction it is actually travelling */
      var dv=(stacked ? (Math.abs(mx)>Math.abs(my)?mx:my)
                      : (k==='back' ? mx : my)) * gain * m.pull;
      st[k]=Math.max(m.min,Math.min(m.max, d.v+dv));
      render(k); e.preventDefault(); e.stopPropagation();
    });
    ['pointerup','pointercancel'].forEach(function(ev){
      h.addEventListener(ev,function(){ d=null; h.classList.remove('dragging'); });
    });
    h.addEventListener('keydown',function(e){
      var step=e.shiftKey?5:1, m=M[k], dv=0;
      if(e.key==='ArrowRight'||e.key==='ArrowUp') dv=step;
      else if(e.key==='ArrowLeft'||e.key==='ArrowDown') dv=-step;
      else if(e.key==='Home'){ st[k]=m.min; render(k); e.preventDefault(); return; }
      else if(e.key==='End'){ st[k]=m.max; render(k); e.preventDefault(); return; }
      else return;
      st[k]=Math.max(m.min,Math.min(m.max,st[k]+dv)); render(k); e.preventDefault();
    });
    h.addEventListener('click',function(e){ e.preventDefault(); });
  });

  /* ---------- the loop ---------- */
  var sizeW=0,sizeH=0, sig='', t0=performance.now();
  function fit(){
    var r=wrap.getBoundingClientRect();
    if(!r.width||!r.height) return;
    if(Math.abs(r.width-sizeW)<1 && Math.abs(r.height-sizeH)<1) return;
    sizeW=r.width; sizeH=r.height;
    renderer.setSize(sizeW,sizeH,false);
    camera.aspect=sizeW/sizeH; camera.updateProjectionMatrix();
    frameCamera(); checkLayout();
    [].forEach.call(handles.querySelectorAll('.ph'),function(h){ h._pw=0; });
  }
  var v3=new THREE.Vector3(), vC=new THREE.Vector3();
  var lines=document.getElementById('picLines'), leader={};
  if(lines){
    ['neck','chest','back'].forEach(function(k){
      var gg=document.createElementNS('http://www.w3.org/2000/svg','g');
      var ln=document.createElementNS('http://www.w3.org/2000/svg','line');
      var dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
      dot.setAttribute('r','2.1'); gg.appendChild(ln); gg.appendChild(dot);
      lines.appendChild(gg); leader[k]={g:gg,ln:ln,dot:dot};
    });
  }
  /* On a phone the pills are laid out by CSS in a row beneath her, so the
     only thing that follows the 3D here is the dot each one is tied to. */
  var stacked=false;
  function checkLayout(){
    /* the pills are laid out by CSS; this only needs to know which of the two
       layouts is live, and the breakpoint is the honest answer */
    stacked = window.innerWidth<=640;
  }
  function place(k){
    var h=handles.querySelector('.ph[data-m="'+k+'"]'); if(!h) return;
    v3.copy(HP[k]); body.localToWorld(v3); root.localToWorld(v3); v3.project(camera);
    var ax=(v3.x*.5+.5)*sizeW, ay=(-v3.y*.5+.5)*sizeH;
    var l=leader[k];
    if(l){ l.dot.setAttribute('cx',ax.toFixed(1)); l.dot.setAttribute('cy',ay.toFixed(1)); }
    if(stacked){ h.style.left=''; h.style.top=''; return; }
    vC.set(0,0,0); root.localToWorld(vC); vC.project(camera);
    var cx=(vC.x*.5+.5)*sizeW, cy=(-vC.y*.5+.5)*sizeH;
    var dx=ax-cx, dy=ay-cy, m=Math.sqrt(dx*dx+dy*dy)||1;
    var push=Math.max(14,Math.min(34,Math.min(sizeW,sizeH)*.075));
    var px2=ax+dx/m*push, py2=ay+dy/m*push;
    if(!h._pw||h._pw<2){ h._pw=h.offsetWidth; h._ph=h.offsetHeight; }
    var pad=h._pw/2+3, padY=h._ph/2+3;
    px2=Math.max(pad,Math.min(sizeW-pad,px2));
    py2=Math.max(padY,Math.min(sizeH-padY,py2));
    h.style.left=px2.toFixed(1)+'px'; h.style.top=py2.toFixed(1)+'px';
    if(l){
      l.ln.setAttribute('x1',ax.toFixed(1)); l.ln.setAttribute('y1',ay.toFixed(1));
      l.ln.setAttribute('x2',px2.toFixed(1)); l.ln.setAttribute('y2',py2.toFixed(1));
    }
  }
  var onScreen=true;
  if(window.IntersectionObserver){
    new IntersectionObserver(function(en){ onScreen=en[0].isIntersecting; },{rootMargin:'140px'})
      .observe(wrap);
  }
  /* ---------- the reveal ----------
     "See the finished piece" is the best moment in the section, so it has to
     work here and not only on the flat stage it was written for: she steps
     out of the light, the piece is left turning on its own, and the camera
     closes on it. */
  var insp=false, inspAmt=0, box=new THREE.Box3(), bC=new THREE.Vector3(), bS=new THREE.Vector3();
  function setInspect(on){
    if(on===insp) return;
    insp=on;
    parts.forEach(function(m){ m.visible = on ? (piece.indexOf(m)>=0) : true; });
    standG.visible=!on;
    var pl=document.getElementById('picPlate3');
    if(pl) pl.classList.toggle('on',on);
  }
  var slow=0, eased=false, lastF=0;
  function frame(){
    requestAnimationFrame(frame);
    if(!sec.classList.contains('gl')) return;
    if(!onScreen || document.hidden) return;
    fit(); if(!sizeW) return;
    var now=performance.now(), t=(now-t0)/1000;
    if(!eased){
      if(lastF && now-lastF>34){ if(++slow>45){ eased=true;
        renderer.setPixelRatio(1); renderer.setSize(sizeW,sizeH,false); } }
      lastF=now;
    }
    var s=[st.sp,st.garment,st.pair,st.name||'',Math.round(dsp.neck),Math.round(dsp.chest),Math.round(dsp.back)].join('|');
    if(s!==sig){ sig=s; build(); insp=null; }   /* new meshes: re-apply */
    setInspect(sec.classList.contains('inspecting'));
    inspAmt += ((insp?1:0)-inspAmt)*.10;

    if(insp){ yawT += .0042; }
    else if(!dragging){ yawT += (-.16-yawT)*.012; }
    yaw   += (yawT + px*.26 - yaw)*.075;
    pitch += (pitchT - py*.09 - pitch)*.075;
    root.rotation.y=insp?yawT:yaw; root.rotation.x=pitch*.5;
    body.position.y=Math.sin(t*.85)*.014;
    body.scale.y=1+Math.sin(t*.85)*.005;

    /* when the piece is alone, the camera closes on the piece */
    var cy2=LOOK.y, cr=CAM_R;
    if(inspAmt>.002 && piece.length){
      box.makeEmpty();
      for(var q=0;q<piece.length;q++) box.expandByObject(piece[q]);
      if(!box.isEmpty()){
        box.getCenter(bC); box.getSize(bS);
        var tn2=Math.tan(camera.fov*Math.PI/360);
        var need=Math.max(bS.y/2/tn2, (Math.max(bS.x,bS.z)/2)/(tn2*Math.max(.6,sizeW/sizeH)))*1.16;
        cy2=LOOK.y+(bC.y-LOOK.y)*inspAmt;
        cr=CAM_R+(need-CAM_R)*inspAmt;
      }
    }
    camera.position.set(0, cy2+cr*.055, cr);
    camera.lookAt(0,cy2,0);
    renderer.render(scene,camera);
    ['neck','chest','back'].forEach(place);
  }

  picGL={
    live:true,
    parts:function(){ return {body:body,root:root,post:postMesh}; },
    sync:function(){
      paintCloth();
      var pl=document.getElementById('picPlate3');
      if(pl){
        var t2=L(), nm2=(st.name||'').trim();
        pl.querySelector('.pp3-name').textContent = nm2 || (t2.yours||'');
        pl.querySelector('.pp3-spec').textContent =
          [ (GARMENTS[st.garment]||{}).it, (CLOTHS[st.cloth]||{}).it, (TRIMS[st.trim]||{}).it ]
            .filter(Boolean).join(' · ');
        pl.querySelector('.pp3-size').textContent =
          Math.round(dsp.neck)+' · '+Math.round(dsp.chest)+' · '+Math.round(dsp.back)+' cm';
      }
      ['neck','chest','back'].forEach(function(k){
        var h=handles.querySelector('.ph[data-m="'+k+'"]');
        if(!h) return;
        h.querySelector('b').textContent=Math.round(dsp[k])+' cm';
        h.querySelector('u').textContent=(L().cap[k]||k);
        h.setAttribute('aria-valuenow',Math.round(st[k]));
        h.setAttribute('aria-label',L().aria[k]);
      });
      if(document.getElementById('picTurn'))
        document.getElementById('picTurn').textContent=L().turn;
    }
  };
  sec.classList.add('gl'); wrap.hidden=false;
  window.addEventListener('resize',function(){ sizeW=0; });
  frame();
})();


})();