


/* ============================================================
   PUNTI PICCOLI — the measuring table.
   Three tapes, pulled by hand. Everything she cuts follows from
   them: the coat lengthens along the dorso, deepens with the
   torace, and the collar opens to the collo. Nothing here is
   decoration — it is the measurement she would actually take.
   ============================================================ */
var picRefresh=null;
(function(){
  var sec=document.getElementById('piccoli');
  var svg=document.getElementById('picSvg');
  if(!sec||!svg) return;

  var NS='http://www.w3.org/2000/svg';

  /* where the tapes sit on each animal, and where the cloth falls */
  var SPECIES={
    dog:{ W:[262,190], R:[416,198], NC:[236,175], NR:50, GC:[252,197], CC:[300,238], CR:-4,
          BO:[268,164], def:{neck:38,chest:62,back:48} },
    cat:{ W:[284,206], R:[408,216], NC:[258,190], NR:48, GC:[274,212], CC:[318,246], CR:-3,
          BO:[290,182], def:{neck:28,chest:44,back:34} }
  };

  /* cm range, and how far the tape opens on the drawing across that range */
  var M={
    neck :{min:22,max:52,vis:[16,30], pull:.30},
    chest:{min:30,max:86,vis:[38,60], pull:.42},
    back :{min:22,max:70,vis:[72,196],pull:.30}
  };

  var CLOTHS={
    lana:{fill:'#A9573A',edge:'#5E2C18',tex:'url(#clLana)',photo:'url(#phLana)',th:'#F7EAD4',thDk:'#7A3A20',en:'Boiled wool',      it:'Lana bollita'},
    lino:{fill:'#D8C1A0',edge:'#8A6B45',tex:'url(#clLino)',photo:'url(#phLino)',th:'#6E4E28',thDk:'#F3E7CE',en:'Brushed linen',    it:'Lino spazzolato'},
    trap:{fill:'#C08A78',edge:'#7A4536',tex:'url(#clTrap)',photo:'url(#phTrap)',th:'#F9EEDC',thDk:'#8A4A38',en:'Quilted cotton',   it:'Cotone trapuntato'},
    cera:{fill:'#77754F',edge:'#3E3D26',tex:'url(#clCera)',photo:'url(#phCera)',th:'#F2E7C9',thDk:'#33341F',en:'Waxed canvas',     it:'Tela cerata'}
  };
  var GARMENTS={coat:{en:'The coat',it:'Il Cappotto'},cape:{en:'The cape',it:'La Mantella'},collar:{en:'The collar',it:'Il Collare'}};
  var PAIRS={sciarpa:{en:'La Sciarpa',it:'La Sciarpa'},pochette:{en:'La Pochette',it:'La Pochette'},
             nastro:{en:'Il Nastro',it:'Il Nastro'},none:{en:'',it:''}};

  var T={
    en:{cap:{neck:'Collo',chest:'Torace',back:'Dorso'},
        yours:'your animal',
        line:function(n){return 'Cut once, for <b>'+n+'</b>.';},
        hint:'Pull a tape to measure — or use the arrow keys',
        aria:{neck:'Neck measurement in centimetres',chest:'Chest measurement in centimetres',back:'Back length in centimetres'},
        turn:'Drag to turn the form · pull a tape to measure',
        seePiece:'See the finished piece', backFit:'Back to the fitting',
        forMe:'for me', errWho:'She will want to know who to write back to.',
        errHow:'An email address or a telephone number, so she can reach you.',
        errSend:'That did not send. Your mail app should have opened with the docket in it.',
        sending:'Sending…',
        subj:'A commission for ',
        intro:'Buongiorno Alessandra,\n\nI should like to commission something for ',
        outro:'\n\nTaken on your measuring table.\n'},
    it:{cap:{neck:'Collo',chest:'Torace',back:'Dorso'},
        yours:'il tuo animale',
        line:function(n){return 'Tagliato una volta sola, per <b>'+n+'</b>.';},
        hint:'Tira un metro per misurare — o usa le frecce',
        aria:{neck:'Misura del collo in centimetri',chest:'Misura del torace in centimetri',back:'Lunghezza del dorso in centimetri'},
        turn:'Trascina per girarla · tira un metro per misurare',
        seePiece:'Vedi il capo finito', backFit:'Torna alla prova',
        forMe:'per me', errWho:'Vorrà sapere a chi rispondere.',
        errHow:'Un indirizzo email o un numero, per poterti raggiungere.',
        errSend:'Non è partita. Dovrebbe essersi aperta la tua app di posta con la scheda.',
        sending:'Invio…',
        subj:'Una commissione per ',
        intro:'Buongiorno Alessandra,\n\nVorrei commissionare qualcosa per ',
        outro:'\n\nPrese sul suo tavolo da misura.\n'}
  };
  function L(){ return T[(typeof LANG!=='undefined' && LANG==='it')?'it':'en']; }

  var TRIMS={
    cuoio:{tr:'#A9773F',dk:'#6B4A2A',en:'Vegetable-tanned',it:'Cuoio al vegetale'},
    miele:{tr:'#C79A63',dk:'#8A6338',en:'Honey',            it:'Miele'},
    bruno:{tr:'#6B4A2A',dk:'#41291406',en:'Walnut',         it:'Noce'}
  };
  TRIMS.bruno.dk='#412914';

  /* the sizes she has cut before */
  var PRESETS={
    bice:{sp:'dog',name:'Bice',neck:32,chest:54,back:52,garment:'coat',  cloth:'lana',trim:'cuoio',pair:'sciarpa'},
    ciro:{sp:'dog',name:'Ciro',neck:30,chest:50,back:44,garment:'cape',  cloth:'cera',trim:'bruno',pair:'nastro'},
    nino:{sp:'cat',name:'Nino',neck:26,chest:40,back:32,garment:'collar',cloth:'lino',trim:'miele',pair:'pochette'},
    olmo:{sp:'dog',name:'Olmo',neck:48,chest:78,back:64,garment:'coat',  cloth:'trap',trim:'cuoio',pair:'none'}
  };

  var st={sp:'dog',garment:'coat',cloth:'lana',trim:'cuoio',pair:'sciarpa',name:'',
          neck:38,chest:62,back:48};
  /* what is drawn eases toward what is chosen, so a preset travels
     instead of snapping */
  var dsp={neck:38,chest:62,back:48};
  var dspEase={neck:.34,chest:.34,back:.34}, dspWait={neck:0,chest:0,back:0};
  var insp=0, inspTarget=0;

  /* ---------- small geometry helpers ---------- */
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function map(v,a,b,c,d){ return c+(clamp(v,a,b)-a)/(b-a)*(d-c); }
  function rot(pt,cx,cy,deg){
    var r=deg*Math.PI/180, c=Math.cos(r), s2=Math.sin(r), x=pt[0]-cx, y=pt[1]-cy;
    return [cx+x*c-y*s2, cy+x*s2+y*c];
  }
  function ellPath(cx,cy,rx,ry,side){
    /* side -1 = the near half, +1 = the half hidden behind her */
    return 'M'+cx+' '+(cy-ry)+' A'+rx+' '+ry+' 0 0 '+(side<0?0:1)+' '+cx+' '+(cy+ry);
  }
  function n2(v){ return Math.round(v*10)/10; }

  /* ---------- the tapes ---------- */
  var tapesG=document.getElementById('picTapes'), tapes={};
  ['neck','chest','back'].forEach(function(key){
    var g=document.createElementNS(NS,'g');
    g.setAttribute('class','tape'); g.setAttribute('data-m',key);
    g.setAttribute('tabindex','0'); g.setAttribute('role','slider');
    g.setAttribute('aria-valuemin',M[key].min); g.setAttribute('aria-valuemax',M[key].max);
    g.innerHTML='<path class="tp-band-b"/><path class="tp-band-o"/><path class="tp-band"/><path class="tp-ticks"/>'+
      '<circle class="tp-hit" r="30"/>'+
      '<path class="tp-grip" d="M-13 -6 h26 a6 6 0 0 1 0 12 h-26 a6 6 0 0 1 0 -12 Z"/>'+
      '<path class="tp-grip-i" d="M-6 -3 V3 M0 -3 V3 M6 -3 V3"/>'+
      '<text class="tp-val" text-anchor="middle"></text>'+
      '<text class="tp-cap" text-anchor="middle"></text>';
    tapesG.appendChild(g);
    tapes[key]={g:g,
      bandB:g.querySelector('.tp-band-b'), bandO:g.querySelector('.tp-band-o'),
      band:g.querySelector('.tp-band'),
      ticks:g.querySelector('.tp-ticks'), hit:g.querySelector('.tp-hit'),
      grip:g.querySelector('.tp-grip'), gripI:g.querySelector('.tp-grip-i'),
      val:g.querySelector('.tp-val'), cap:g.querySelector('.tp-cap'), dir:[0,1]};
  });

  /* ---------- the cloth she cuts ---------- */
  var G={ body:document.getElementById('gmBody'), tex:document.getElementById('gmTex'),
          photo:document.getElementById('gmPhoto'),
          sheen:document.getElementById('gmSheen'), edge:document.getElementById('gmEdge'),
          hem:document.getElementById('gmHem'), seam:document.getElementById('gmSeam'),
          collar:document.getElementById('gmCollar'), colhem:document.getElementById('gmColHem'),
          tag:document.getElementById('gmTag'), tagP:document.getElementById('gmTagP'),
          tagR:document.getElementById('gmTagR'), root:document.getElementById('picGarment'),
          lining:document.getElementById('gmLining'), pipe:document.getElementById('gmPipe'),
          pipeS:document.getElementById('gmPipeS'),
          facing:document.getElementById('gmFacing'), facingE:document.getElementById('gmFacingE'),
          strap:document.getElementById('gmStrap'), strapE:document.getElementById('gmStrapE'),
          buckle:document.getElementById('gmBuckle'), bkR:document.getElementById('gmBkR'),
          bkP:document.getElementById('gmBkP'), mono:document.getElementById('gmMono'),
          monoTP:document.getElementById('gmMonoTP'), monoPath:document.getElementById('mgPath') };

  function quadAt(P,C,Q,t){
    var u=1-t;
    return [u*u*P[0]+2*u*t*C[0]+t*t*Q[0], u*u*P[1]+2*u*t*C[1]+t*t*Q[1]];
  }

  function garmentPaths(){
    var A=SPECIES[st.sp], W=A.W, R=A.R;
    var dx=R[0]-W[0], dy=R[1]-W[1], len=Math.sqrt(dx*dx+dy*dy);
    var ux=dx/len, uy=dy/len;           /* along the spine, nose to tail */
    var nx=-uy,    ny=ux;               /* down her flank */

    var f     = map(dsp.back ,M.back.min ,M.back.max , .58, 1.10);
    var depth = map(dsp.chest,M.chest.min,M.chest.max, 48, 116);
    var colH  = map(dsp.neck ,M.neck.min ,M.neck.max , 15, 27);
    var tight = (dsp.chest-M.chest.min)/(M.chest.max-M.chest.min);

    if(st.garment==='collar'){
      return {body:'',hem:'',seam:'',pipe:'',facing:'',facingE:'',strap:'',mono:'',
              colH:colH*1.2, tag:true, gc:[A.GC[0],A.GC[1]], buckle:null};
    }

    var cape = st.garment==='cape';
    if(cape){ f*=.84; depth*=.98; }

    var P0=[W[0]+ux*7, W[1]+uy*7];
    var P1=[W[0]+dx*f, W[1]+dy*f];
    var flareU = cape ? 26 : 4, flareN = cape ? 12 : 0;

    var P1b=[P1[0]+nx*depth*.88+ux*flareU, P1[1]+ny*depth*.88+uy*flareU+flareN];
    var P0b=[P0[0]+nx*depth,               P0[1]+ny*depth];
    var mTop=[(P0[0]+P1[0])/2-nx*7,(P0[1]+P1[1])/2-ny*7];
    var mBot=[(P0b[0]+P1b[0])/2+nx*(cape?22:13),(P0b[1]+P1b[1])/2+ny*(cape?22:13)];
    var mRear=[P1[0]+nx*depth*.44+ux*(flareU*.5+7), P1[1]+ny*depth*.44+uy*(flareU*.5+7)];
    var mFront=[P0[0]+nx*depth*.46-ux*11, P0[1]+ny*depth*.46-uy*11];

    var body='M'+n2(P0[0])+' '+n2(P0[1])+
      ' Q'+n2(mTop[0])+' '+n2(mTop[1])+' '+n2(P1[0])+' '+n2(P1[1])+
      ' Q'+n2(mRear[0])+' '+n2(mRear[1])+' '+n2(P1b[0])+' '+n2(P1b[1])+
      ' Q'+n2(mBot[0])+' '+n2(mBot[1])+' '+n2(P0b[0])+' '+n2(P0b[1])+
      ' Q'+n2(mFront[0])+' '+n2(mFront[1])+' '+n2(P0[0])+' '+n2(P0[1])+' Z';

    var hi=6;   /* the hem stitch, set in from the raw edge */
    var hem='M'+n2(P1b[0]-nx*hi)+' '+n2(P1b[1]-ny*hi)+
      ' Q'+n2(mBot[0]-nx*hi)+' '+n2(mBot[1]-ny*hi)+' '+n2(P0b[0]-nx*hi)+' '+n2(P0b[1]-ny*hi);
    var seam='M'+n2(P0[0]+nx*10)+' '+n2(P0[1]+ny*10)+
      ' Q'+n2(mTop[0]+nx*13)+' '+n2(mTop[1]+ny*13)+' '+n2(P1[0]+nx*10)+' '+n2(P1[1]+ny*10);

    /* the facing: the front corner turned back, showing its lining */
    var fA=[P0[0]+ux*2, P0[1]+uy*2];
    var fB=[P0[0]+ux*21, P0[1]+uy*21];
    var fC=[P0[0]+ux*13+nx*22, P0[1]+uy*13+ny*22];
    var fD=[P0[0]+nx*21, P0[1]+ny*21];
    var facing='M'+n2(fA[0])+' '+n2(fA[1])+' L'+n2(fB[0])+' '+n2(fB[1])+
      ' Q'+n2(fC[0])+' '+n2(fC[1])+' '+n2(fD[0])+' '+n2(fD[1])+' Z';
    var facingE='M'+n2(fB[0])+' '+n2(fB[1])+' Q'+n2(fC[0])+' '+n2(fC[1])+' '+n2(fD[0])+' '+n2(fD[1]);

    /* the belly band: two anchors on the lower edge, and the slack it takes up */
    var S1=quadAt(P1b,mBot,P0b,.26), S2=quadAt(P1b,mBot,P0b,.62);
    var sag=28+tight*30;
    var sMid=[(S1[0]+S2[0])/2+nx*sag,(S1[1]+S2[1])/2+ny*sag];
    var strap='M'+n2(S1[0])+' '+n2(S1[1])+' Q'+n2(sMid[0])+' '+n2(sMid[1])+' '+n2(S2[0])+' '+n2(S2[1]);
    var bk=quadAt(S1,sMid,S2,.76);
    var bkT=quadAt(S1,sMid,S2,.84);
    var bkAng=Math.atan2(bkT[1]-bk[1],bkT[0]-bk[0])*180/Math.PI;

    /* her name is worked into the flank, clear of the band */
    var mA=[P0[0]+dx*f*.26+nx*depth*.54, P0[1]+dy*f*.26+ny*depth*.54];
    var mB=[P0[0]+dx*f*.92+nx*depth*.46, P0[1]+dy*f*.92+ny*depth*.46];
    var mM=[(mA[0]+mB[0])/2+nx*4,(mA[1]+mB[1])/2+ny*4];
    var mono='M'+n2(mA[0])+' '+n2(mA[1])+' Q'+n2(mM[0])+' '+n2(mM[1])+' '+n2(mB[0])+' '+n2(mB[1]);

    return {body:body, hem:hem, seam:seam, pipe:body, facing:facing, facingE:facingE,
            strap:strap, mono:mono, colH:colH, tag:false,
            gc:[(P0[0]+P1b[0])/2,(P0[1]+P1b[1])/2],
            buckle:{x:bk[0],y:bk[1],a:bkAng}};
  }

  var FIT={
    en:[[0,1.02,'A close fit — cut to the body.'],
        [1.02,1.30,'An easy fit. She can move in this.'],
        [1.30,9,'Room for a jumper underneath.']],
    it:[[0,1.02,'Aderente — tagliato sul corpo.'],
        [1.02,1.30,'Comoda. Ci si muove bene.'],
        [1.30,9,'Spazio per un maglione sotto.']]
  };
  var lastFit='', lastLetter={subject:'',body:'',mailto:'#'};
  /* The swatch you press is the same weave that lands on her. It is drawn in
     code, carried in the file, and needs no network — so a customer standing
     in a clinic with one bar of signal still gets to feel the cloth. */
  (function dressTheSwatches(){
    [].forEach.call(document.querySelectorAll('#dkCloths button'),function(b){
      var k=b.dataset.c, C=CLOTHS[k], sw=b.querySelector('i');
      if(!sw||!C) return;
      sw.style.backgroundColor=C.fill;
      if(typeof CLOTH_TILES!=='undefined' && CLOTH_TILES[k])
        sw.style.backgroundImage='url('+CLOTH_TILES[k]+')';
    });
    [].forEach.call(document.querySelectorAll('#dkTrims button'),function(b){
      var k=b.dataset.t, T=TRIMS[k], sw=b.querySelector('i');
      if(!sw||!T) return;
      sw.style.background='linear-gradient(168deg,'+T.tr+' 0%,'+T.tr+' 52%,'+T.dk+' 100%)';
      sw.style.boxShadow='inset 0 0 0 1px rgba(0,0,0,.18), inset 0 0 14px rgba(255,255,255,.12)';
    });
  })();

  function render(pulse){
    var A=SPECIES[st.sp], t=L(), lg=(typeof LANG!=='undefined'&&LANG==='it')?'it':'en';
    sec.classList.toggle('is-cat', st.sp==='cat');

    /* the cloth, and the leather that edges it */
    var gp=garmentPaths(), C=CLOTHS[st.cloth], T=TRIMS[st.trim];
    if(gp.gc) lastGC=gp.gc;
    var V=svg;
    V.style.setProperty('--cl',C.fill);
    V.style.setProperty('--clEdge',C.edge);
    V.style.setProperty('--clTex',C.tex);
    V.style.setProperty('--clPhoto',C.photo);
    V.style.setProperty('--tr',T.tr);
    V.style.setProperty('--trDk',T.dk);
    V.style.setProperty('--th',C.th);
    V.style.setProperty('--thDk',C.thDk);

    [G.lining,G.body,G.tex,G.photo,G.sheen,G.pipe,G.pipeS,G.edge].forEach(function(el){
      el.setAttribute('d',gp.body||'M0 0'); });
    G.hem.setAttribute('d',gp.hem||'M0 0');
    G.seam.setAttribute('d',gp.seam||'M0 0');
    G.facing.setAttribute('d',gp.facing||'M0 0');
    G.facingE.setAttribute('d',gp.facingE||'M0 0');
    G.strap.setAttribute('d',gp.strap||'M0 0');
    G.strapE.setAttribute('d',gp.strap||'M0 0');
    G.monoPath.setAttribute('d',gp.mono||'M0 0');

    /* the buckle that takes up the slack */
    if(gp.buckle){
      G.buckle.style.display='';
      var b=gp.buckle, tf='translate('+n2(b.x)+' '+n2(b.y)+') rotate('+n2(b.a)+')';
      G.buckle.setAttribute('transform',tf);
      G.bkR.setAttribute('x',-6.5); G.bkR.setAttribute('y',-6);
      G.bkR.setAttribute('width',13); G.bkR.setAttribute('height',12);
      G.bkP.setAttribute('d','M0 -6 V6 M-6.5 0 H-1');
    } else { G.buckle.style.display='none'; }

    /* her name, worked into the flank */
    var nm=(st.name||'').trim();
    if(nm && !gp.tag){
      G.mono.style.display='';
      G.monoTP.textContent=nm;
      var fs=15;
      G.mono.setAttribute('font-size',fs);
      try{
        var want=Math.abs(gp.gc?60:60), have=G.mono.getComputedTextLength();
        if(have>0){
          var room=68;
          if(have>room) G.mono.setAttribute('font-size',Math.max(8,fs*room/have));
        }
      }catch(e){}
    } else { G.mono.style.display='none'; G.monoTP.textContent=''; }

    var GCp=A.GC||A.NC;
    var cp=ellPath(GCp[0],GCp[1],11,gp.colH,-1)+' '+ellPath(GCp[0],GCp[1],11,gp.colH,1);
    var xf='rotate('+A.NR+' '+GCp[0]+' '+GCp[1]+')';
    var wearsBand = st.garment==='collar';
    G.collar.setAttribute('d',cp); G.collar.setAttribute('transform',xf);
    G.collar.setAttribute('style','stroke-width:11;opacity:'+(wearsBand?1:0));
    G.colhem.setAttribute('d',cp); G.colhem.setAttribute('transform',xf);
    G.colhem.setAttribute('style','opacity:'+(wearsBand?.62:0));

    if(gp.tag){
      var low=rot([GCp[0],GCp[1]+gp.colH],GCp[0],GCp[1],A.NR);
      G.tag.style.display='';
      G.tagP.setAttribute('d','M'+n2(low[0]-3)+' '+n2(low[1])+' h6 v9 h-6 Z');
      G.tagR.setAttribute('cx',n2(low[0])); G.tagR.setAttribute('cy',n2(low[1]+18));
      G.tagR.setAttribute('r','8');
    } else { G.tag.style.display='none'; }

    /* the tapes read what is drawn, not what is chosen, so they travel too */
    ['neck','chest','back'].forEach(function(k){
      var tp=tapes[k], v=dsp[k], m=M[k], grip, ang;
      if(k==='back'){
        var Lp=map(v,m.min,m.max,m.vis[0],m.vis[1]);
        var x0=A.BO[0], y0=A.BO[1], x1=x0+Lp, y1=y0+Lp*.055;
        var d='M'+x0+' '+y0+' L'+n2(x1)+' '+n2(y1);
        tp.band.setAttribute('d',d); tp.ticks.setAttribute('d',d); tp.bandO.setAttribute('d',d);
        tp.bandO.removeAttribute('transform');
        tp.bandB.setAttribute('d','M'+x0+' '+y0+' l-9 -3');
        tp.band.removeAttribute('transform'); tp.ticks.removeAttribute('transform');
        tp.bandB.removeAttribute('transform');
        grip=[x1,y1]; ang=Math.atan2(y1-y0,x1-x0)*180/Math.PI;
        tp.dir=[Math.cos(ang*Math.PI/180),Math.sin(ang*Math.PI/180)];
      } else {
        var C2=k==='neck'?A.NC:A.CC, RR=k==='neck'?A.NR:A.CR;
        var ry=map(v,m.min,m.max,m.vis[0],m.vis[1]), rx=k==='neck'?13:26;
        var near=ellPath(C2[0],C2[1],rx,ry,-1), far=ellPath(C2[0],C2[1],rx,ry,1);
        var xf2='rotate('+RR+' '+C2[0]+' '+C2[1]+')';
        tp.bandO.setAttribute('d',near); tp.bandO.setAttribute('transform',xf2);
        tp.band.setAttribute('d',near);  tp.band.setAttribute('transform',xf2);
        tp.ticks.setAttribute('d',near); tp.ticks.setAttribute('transform',xf2);
        tp.bandB.setAttribute('d',far);  tp.bandB.setAttribute('transform',xf2);
        grip=rot([C2[0],C2[1]+ry],C2[0],C2[1],RR); ang=RR+90;
        tp.dir=rot([1,0],0,0,ang);
      }
      var gx=grip[0]+tp.dir[0]*13, gy=grip[1]+tp.dir[1]*13;
      var gt='translate('+n2(gx)+' '+n2(gy)+') rotate('+n2(ang)+')';
      tp.grip.setAttribute('transform',gt); tp.gripI.setAttribute('transform',gt);
      tp.hit.setAttribute('cx',n2(gx)); tp.hit.setAttribute('cy',n2(gy));
      var lx=k==='back'? gx-4  : gx+tp.dir[0]*30,
          ly=k==='back'? gy-26 : gy+tp.dir[1]*30+4;
      tp.val.setAttribute('x',n2(lx)); tp.val.setAttribute('y',n2(ly));
      tp.val.textContent=Math.round(v)+' cm';
      tp.cap.setAttribute('x',n2(lx)); tp.cap.setAttribute('y',n2(ly+14));
      tp.cap.textContent=t.cap[k];
      tp.g.setAttribute('aria-valuenow',Math.round(st[k]));
      tp.g.setAttribute('aria-valuetext',Math.round(st[k])+' cm');
      tp.g.setAttribute('aria-label',t.aria[k]);
    });

    /* the docket */
    [].forEach.call(document.querySelectorAll('#dkRows li'),function(li){
      var k=li.dataset.m;
      li.querySelector('[data-v]').textContent=Math.round(dsp[k]);
      if(pulse===k){ li.classList.remove('pulse'); void li.offsetWidth; li.classList.add('pulse'); }
    });

    /* what the numbers actually mean */
    var ratio=st.chest/Math.max(1,st.back), fitTxt='';
    FIT[lg].forEach(function(r){ if(ratio>=r[0]&&ratio<r[1]) fitTxt=r[2]; });
    var fitEl=document.getElementById('dkFit');
    if(fitEl && fitTxt!==lastFit){
      lastFit=fitTxt; fitEl.classList.add('swap');
      setTimeout(function(){ fitEl.querySelector('span').textContent=fitTxt;
        fitEl.classList.remove('swap'); },220);
    }

    document.getElementById('picHint').textContent=t.hint;
    if(window.__picSync) window.__picSync();
    var ib=document.getElementById('dkInspect');
    if(ib) ib.querySelector('span').textContent =
      sec.classList.contains('inspecting') ? t.backFit : t.seePiece;

    /* the piece for her */
    var wantPair = st.pair && st.pair!=='none';
    sec.classList.toggle('no-pair', !wantPair);
    [['sciarpa','ppSciarpa'],['pochette','ppPochette'],['nastro','ppNastro']].forEach(function(r){
      var el=document.getElementById(r[1]);
      if(el) el.classList.toggle('on', wantPair && st.pair===r[0]);
    });
    var pm=document.getElementById('ppMono');
    if(pm){
      var ini=nm ? nm.trim().charAt(0).toUpperCase() : '';
      pm.textContent = (wantPair && st.pair!=='nastro') ? ini : '';
    }

    /* the presentation plate */
    var pn=document.getElementById('ppName'), psp=document.getElementById('ppSpec'),
        psz=document.getElementById('ppSize');
    if(pn){
      pn.textContent = nm || (lg==='it'?'Su misura':'Made to measure');
      psp.textContent = GARMENTS[st.garment][lg]
        + (wantPair ? ' & '+PAIRS[st.pair][lg] : '')
        + ' — '+CLOTHS[st.cloth][lg]+' · '+TRIMS[st.trim][lg];
      psz.textContent = Math.round(st.neck)+' · '+Math.round(st.chest)+' · '+Math.round(st.back)+' cm';
    }

    var body=t.intro+(nm||t.yours)+' — '+GARMENTS[st.garment][lg]+
      (wantPair ? ' + '+PAIRS[st.pair][lg]+' ('+t.forMe+')' : '')+
      ', '+CLOTHS[st.cloth][lg]+', '+TRIMS[st.trim][lg]+'.\n\n'+
      'Collo / neck: '+Math.round(st.neck)+' cm\n'+
      'Torace / chest: '+Math.round(st.chest)+' cm\n'+
      'Dorso / back: '+Math.round(st.back)+' cm\n'+
      (st.sp==='cat'?'Gatto / cat':'Cane / dog')+t.outro;
    lastLetter={subject:t.subj+(nm||t.yours), body:body,
      mailto:'mailto:atelier@puntiespunti.it?subject='+encodeURIComponent(t.subj+(nm||t.yours))+
             '&body='+encodeURIComponent(body)};
  }
  picRefresh=function(){ render(); };
  window.__picSync=function(){ if(picGL&&picGL.live) picGL.sync(); };
  window.__picParts=function(){ return (picGL&&picGL.parts) ? picGL.parts() : {}; };

  /* ---------- she is alive between your hands ----------------------------
     Breath through the ribcage, a tail that sways on its own clock, an ear
     that flicks, an eye that blinks. None of it is asked for; all of it is
     what separates a drawing from an animal standing still. ------------- */
  var lastGC=[330,240];
  /* the parts that move are looked up once, not sixty times a second */
  var anCache={};
  ['dog','cat'].forEach(function(k){
    var g=sec.querySelector('.an-'+k); if(!g) return;
    anCache[k]={ body:g.querySelector('.an-body'), whisk:g.querySelector('.an-whisk'),
                 tail:g.querySelector('.an-tail'), ear:g.querySelector('.an-ear'),
                 eye:g.querySelector('.an-eye') };
  });
  var LIFE={ earAt:2.5, blinkAt:3.2, wagAt:6.0 };
  var PIV={ dog:[332,300], cat:[340,306] };
  var TAILBASE={ dog:[424,205], cat:[420,226] };
  var EARBASE=[200,128];

  function ambient(t){
    var pv=PIV[st.sp], sway=Math.sin(t*.31)*.9;
    var sy=1+Math.sin(t*.92)*.0075 + Math.sin(t*1.9)*.0018;
    var breath='translate('+n2(sway)+' 0) translate('+pv[0]+' '+pv[1]+') scale(1 '+
               sy.toFixed(4)+') translate('+(-pv[0])+' '+(-pv[1])+')';

    var g=anCache[st.sp];
    if(g){
      if(g.body) g.body.setAttribute('transform',breath);
      if(g.whisk) g.whisk.setAttribute('transform',breath);

      /* the tail keeps its own time, and now and then gives a real wag */
      var tb=TAILBASE[st.sp], wag=0;
      if(t>LIFE.wagAt){
        var e=t-LIFE.wagAt;
        if(e<1.6) wag=Math.sin(e*13)*7*(1-e/1.6); else LIFE.wagAt=t+5+Math.random()*7;
      }
      var ta=Math.sin(t*.72)*2.4+Math.sin(t*.29)*1.1+wag;
      if(g.tail) g.tail.setAttribute('transform',breath+' rotate('+n2(ta)+' '+tb[0]+' '+tb[1]+')');

      /* the ear */
      var ear=g.ear;
      if(ear){
        var ea=0;
        if(t>LIFE.earAt){
          var f=t-LIFE.earAt;
          if(f<.9) ea=Math.sin(f*22)*9*(1-f/.9); else LIFE.earAt=t+4+Math.random()*8;
        }
        ear.setAttribute('transform',breath+' rotate('+n2(ea)+' '+EARBASE[0]+' '+EARBASE[1]+')');
      }

      /* the blink */
      var eye=g.eye;
      if(eye){
        var k=1;
        if(t>LIFE.blinkAt){
          var d2=t-LIFE.blinkAt;
          if(d2<.16) k=1-Math.sin(d2/.16*Math.PI)*.94; else LIFE.blinkAt=t+2.6+Math.random()*5.5;
        }
        var ex=+eye.getAttribute('cx'), ey=+eye.getAttribute('cy');
        eye.setAttribute('transform',breath+' translate('+ex+' '+ey+') scale(1 '+k.toFixed(3)+
                         ') translate('+(-ex)+' '+(-ey)+')');
      }
    }

    /* the cloth breathes with her, and steps forward when inspected */
    var S=1+insp*.62;
    var turn=1-.11*insp*(1-Math.cos(t*.5));
    var gx=lastGC[0], gy=lastGC[1];
    var tx=(272-gx)*insp, ty=(232-gy)*insp;
    var itf = insp>.001
      ? 'translate('+n2(tx)+' '+n2(ty)+') translate('+n2(gx)+' '+n2(gy)+') scale('+
        (S*turn).toFixed(4)+' '+S.toFixed(4)+') translate('+n2(-gx)+' '+n2(-gy)+') '
      : '';
    G.root.setAttribute('transform', itf+breath);

    var pr=document.getElementById('picPair');
    if(pr){
      if(insp>.001){
        var PS=1+insp*.55, px2=172, py2=340;
        var ptx=(496-px2)*insp, pty=(276-py2)*insp;
        pr.setAttribute('transform','translate('+n2(ptx)+' '+n2(pty)+') translate('+px2+' '+py2+
          ') scale('+PS.toFixed(4)+') translate('+(-px2)+' '+(-py2)+')');
      } else if(pr.getAttribute('transform')) pr.removeAttribute('transform');
    }
  }

  /* ---------- the frame: values travel, she breathes ---------- */
  var picT0=performance.now();
  function picFrame(){
    requestAnimationFrame(picFrame);
    var t=(performance.now()-picT0)/1000, moving=false;
    ['neck','chest','back'].forEach(function(k){
      if(dspWait[k]>0){ dspWait[k]-=1; moving=true; return; }
      var d=st[k]-dsp[k];
      if(Math.abs(d)>.03){ dsp[k]+=d*dspEase[k]; moving=true; }
      else if(dsp[k]!==st[k]){ dsp[k]=st[k]; moving=true; }
    });
    if(Math.abs(inspTarget-insp)>.001){ insp+=(inspTarget-insp)*.09; moving=true; }
    else if(insp!==inspTarget){ insp=inspTarget; moving=true; }
    if(moving) render();
    if(!moving && dspEase.neck<.3){ dspEase.neck=dspEase.chest=dspEase.back=.34; }
    if(!REDUCED) ambient(t);
    else if(insp>.001||G.root.getAttribute('transform')){
      var S2=1+insp*.78, gx2=lastGC[0], gy2=lastGC[1];
      G.root.setAttribute('transform', insp>.001
        ? 'translate('+n2((339-gx2)*insp)+' '+n2((238-gy2)*insp)+') translate('+n2(gx2)+' '+
          n2(gy2)+') scale('+S2.toFixed(4)+') translate('+n2(-gx2)+' '+n2(-gy2)+')'
        : '');
    }
  }

  /* ---------- pulling a tape ---------- */
  var GAIN=TOUCH?0.42:1;
  function svgScale(){
    var r=svg.getBoundingClientRect(), vb=svg.viewBox.baseVal;
    return (r.width/vb.width)||1;
  }
  Object.keys(tapes).forEach(function(k){
    var tp=tapes[k], drag=null;
    tp.g.addEventListener('pointerdown',function(e){
      drag={x:e.clientX,y:e.clientY,v:st[k],s:svgScale()};
      dspEase.neck=dspEase.chest=dspEase.back=.55;
      dspWait.neck=dspWait.chest=dspWait.back=0;
      tp.g.classList.add('dragging');
      try{ tp.g.setPointerCapture(e.pointerId); }catch(err){}
      e.preventDefault();
    });
    tp.g.addEventListener('pointermove',function(e){
      if(!drag) return;
      var dx=(e.clientX-drag.x)/drag.s*GAIN, dy=(e.clientY-drag.y)/drag.s*GAIN;
      var proj=dx*tp.dir[0]+dy*tp.dir[1];
      st[k]=clamp(drag.v+proj*M[k].pull,M[k].min,M[k].max);
      render(k); e.preventDefault();
    });
    ['pointerup','pointercancel'].forEach(function(ev){
      tp.g.addEventListener(ev,function(){ drag=null; tp.g.classList.remove('dragging'); });
    });
    tp.g.addEventListener('keydown',function(e){
      var step=e.shiftKey?5:1, d=0;
      if(e.key==='ArrowRight'||e.key==='ArrowUp') d=step;
      else if(e.key==='ArrowLeft'||e.key==='ArrowDown') d=-step;
      else if(e.key==='Home') { st[k]=M[k].min; render(k); e.preventDefault(); return; }
      else if(e.key==='End')  { st[k]=M[k].max; render(k); e.preventDefault(); return; }
      else return;
      st[k]=clamp(st[k]+d,M[k].min,M[k].max); render(k); e.preventDefault();
    });
  });

  /* ---------- the choices ---------- */
  function pick(container, attr, apply){
    [].forEach.call(container.querySelectorAll('button'),function(b){
      b.addEventListener('click',function(){
        [].forEach.call(container.querySelectorAll('button'),function(o){
          o.classList.remove('on');
          if(o.hasAttribute('aria-checked')) o.setAttribute('aria-checked','false');
          if(o.hasAttribute('aria-selected')) o.setAttribute('aria-selected','false');
        });
        b.classList.add('on');
        if(b.hasAttribute('aria-checked')) b.setAttribute('aria-checked','true');
        if(b.hasAttribute('aria-selected')) b.setAttribute('aria-selected','true');
        apply(b.getAttribute(attr));
        render();
        if(TOUCH && navigator.vibrate){ try{ navigator.vibrate(5); }catch(e){} }
      });
    });
  }
  var nameEl=document.getElementById('dkName');
  nameEl.addEventListener('input',function(){ st.name=nameEl.value; render(); });

  /* keep every picker honest when a preset changes things underneath it */
  function markOn(sel, attr, val){
    var c=document.querySelector(sel); if(!c) return;
    [].forEach.call(c.querySelectorAll('button'),function(b){
      var on=b.getAttribute(attr)===val;
      b.classList.toggle('on',on);
      if(b.hasAttribute('aria-checked')) b.setAttribute('aria-checked',on?'true':'false');
      if(b.hasAttribute('aria-selected')) b.setAttribute('aria-selected',on?'true':'false');
    });
  }
  function syncPickers(){
    markOn('.pic-species','data-sp',st.sp);
    markOn('#dkGarments','data-g',st.garment);
    markOn('#dkCloths','data-c',st.cloth);
    markOn('#dkTrims','data-t',st.trim);
    markOn('#dkPair','data-w',st.pair);
  }

  /* ---------- the sizes she has cut before ----------
     Picking one sends the three tapes travelling, on a stagger, so you watch
     the cloth find its new shape instead of finding it already there. */
  [].forEach.call(document.querySelectorAll('#dkPresets button'), function(b){
    b.addEventListener('click', function(){
      var P=PRESETS[b.dataset.p]; if(!P) return;
      [].forEach.call(document.querySelectorAll('#dkPresets button'),function(o){
        o.classList.toggle('on', o===b); });
      st.sp=P.sp; st.garment=P.garment; st.cloth=P.cloth; st.trim=P.trim; st.name=P.name;
      st.pair=P.pair||'none';
      st.neck=P.neck; st.chest=P.chest; st.back=P.back;
      nameEl.value=P.name;
      dspEase.neck=dspEase.chest=dspEase.back=.075;
      dspWait.back=0; dspWait.chest=8; dspWait.neck=16;
      syncPickers(); render();
      if(TOUCH && navigator.vibrate){ try{ navigator.vibrate([4,40,4]); }catch(e){} }
    });
  });

  /* ---------- the letter that has to reach her ----------------------------
     With no prices on the page every interested visitor has to become a
     conversation, and the form gets one attempt. Two fields, no account, and
     if the network fails it hands the whole docket to their mail app rather
     than losing it. ------------------------------------------------------ */
  var formEl=document.getElementById('dkForm'), sentEl=document.getElementById('dkSent'),
      whoEl=document.getElementById('dkWho'), howEl=document.getElementById('dkHow'),
      errEl=document.getElementById('dkErr'), sendEl=document.getElementById('dkSend');
  if(COMMISSION_ENDPOINT) formEl.setAttribute('action',COMMISSION_ENDPOINT);

  function reachable(v){
    v=(v||'').trim();
    if(v.indexOf('@')>0 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return true;
    return (v.replace(/[^\d]/g,'').length>=8);       /* a phone, however written */
  }
  function showErr(msg){
    errEl.textContent=msg; errEl.hidden=!msg;
  }
  /* The docket, as it leaves the page. Two shapes at once, on purpose:
     the *_key fields are stable identifiers a database can group and count,
     the plain fields are the words Sandra reads in the visitor's language.
     A mail-based fallback wants the second; a Commission table wants the
     first, and having both means neither end has to translate. */
  function docketPayload(){
    var lg=(typeof LANG!=='undefined'&&LANG==='it')?'it':'en';
    return {
      from_name:whoEl.value.trim(), reply_to:howEl.value.trim(),
      subject:lastLetter.subject,
      animal_name:(st.name||'').trim(), species:st.sp,
      garment:GARMENTS[st.garment][lg], for_owner:(st.pair!=='none'?PAIRS[st.pair][lg]:''),
      cloth:CLOTHS[st.cloth][lg], trim:TRIMS[st.trim][lg],
      garment_key:st.garment, for_owner_key:(st.pair!=='none'?st.pair:''),
      cloth_key:st.cloth, trim_key:st.trim,
      neck_cm:Math.round(st.neck), chest_cm:Math.round(st.chest), back_cm:Math.round(st.back),
      docket:'',
      clinic:document.documentElement.getAttribute('data-clinic')||'',
      language:lg, message:lastLetter.body
    };
  }
  function handOverToMail(){
    try{ window.location.href=lastLetter.mailto; }catch(e){}
  }
  function markSent(){
    formEl.hidden=true; sentEl.hidden=false;
    sentEl.scrollIntoView({block:'nearest',behavior:REDUCED?'auto':'smooth'});
    if(TOUCH && navigator.vibrate){ try{ navigator.vibrate([6,50,6]); }catch(e){} }
  }
  formEl.addEventListener('submit', function(e){
    e.preventDefault();
    var t=L();
    if(!whoEl.value.trim()){ showErr(t.errWho); whoEl.focus(); return; }
    if(!reachable(howEl.value)){ showErr(t.errHow); howEl.focus(); return; }
    showErr('');
    if(!COMMISSION_ENDPOINT){ handOverToMail(); markSent(); return; }
    var lab=sendEl.querySelector('span'), was=lab.textContent;
    sendEl.disabled=true; lab.textContent=t.sending;
    fetch(COMMISSION_ENDPOINT,{method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(docketPayload())})
      .then(function(r){ if(!r.ok) throw new Error(r.status); markSent(); })
      .catch(function(){
        sendEl.disabled=false; lab.textContent=was;
        showErr(t.errSend); handOverToMail();
      });
  });

  /* ---------- the finished piece, presented on its own ---------- */
  var inspectBtn=document.getElementById('dkInspect');
  inspectBtn.addEventListener('click', function(){
    var on=!sec.classList.contains('inspecting');
    sec.classList.toggle('inspecting',on);
    inspectBtn.setAttribute('aria-pressed',on?'true':'false');
    inspTarget=on?1:0;
    var lab=inspectBtn.querySelector('span'), t2=L();
    lab.textContent = on ? t2.backFit : t2.seePiece;
    if(TOUCH && navigator.vibrate){ try{ navigator.vibrate(6); }catch(e){} }
  });

  pick(document.getElementById('dkTrims'),'data-t',function(v){ st.trim=v; });
  pick(document.getElementById('dkPair'), 'data-w',function(v){ st.pair=v; });

  pick(document.querySelector('.pic-species'),'data-sp',function(v){
    st.sp=v; var d=SPECIES[v].def; st.neck=d.neck; st.chest=d.chest; st.back=d.back;
  });
  pick(document.getElementById('dkGarments'),'data-g',function(v){ st.garment=v; });
  pick(document.getElementById('dkCloths'),  'data-c',function(v){ st.cloth=v; });



  /* the real cloth, laid over the drawing */
  ['lana','lino','trap','cera'].forEach(function(k){
    var url=CLOTH_TILES[k]; if(!url) return;
    var im=document.getElementById('im'+k.charAt(0).toUpperCase()+k.slice(1));
    if(im){ im.setAttributeNS('http://www.w3.org/1999/xlink','href',url); im.setAttribute('href',url); }
    var sw=document.querySelector('#dkCloths button[data-c="'+k+'"] i');
    if(sw){ sw.style.backgroundImage='url("'+url+'")'; sw.style.backgroundSize='cover';
            sw.style.backgroundPosition='center'; }
  });

  /* the three commissions. A frame whose photograph never arrives removes
     itself rather than leaving a hole. */
  [].forEach.call(document.querySelectorAll('#picGallery figure'), function(fig, i){
    var key=['dog','cat','collar'][i], img=fig.querySelector('img'), url=PICCOLI[key];
    if(!url) return;
    img.onload=function(){
      fig.classList.add('on');
      document.getElementById('picGallery').classList.remove('empty');
      if(HAS_ST && window.ScrollTrigger) ScrollTrigger.refresh();
    };
    img.src=url;
  });

  (function(){
    var y=366;
    var r1=document.getElementById('ppR1'), r2=document.getElementById('ppR2');
    if(r1){ r1.setAttribute('d','M196 '+y+' H482'); r2.setAttribute('d','M196 '+(y+72)+' H482'); }
    var n=document.getElementById('ppName'), sp=document.getElementById('ppSpec'),
        sz=document.getElementById('ppSize');
    if(n){ n.setAttribute('x',339); n.setAttribute('y',y+28);
           sp.setAttribute('x',339); sp.setAttribute('y',y+48);
           sz.setAttribute('x',339); sz.setAttribute('y',y+64); }
  })();

  /* a docket number that is hers alone */

  syncPickers();
  render();
  picFrame();

  /* ---------- she arrives as you reach her ---------- */
  if(HAS_GSAP && HAS_ST && !REDUCED){
    gsap.from('#piccoli .pic-lede',{opacity:0,y:26,duration:1.1,ease:'power3.out',
      scrollTrigger:{trigger:'#piccoli',start:'top 66%'}});
    gsap.from('#piccoli .pic-stage',{opacity:0,y:44,duration:1.3,ease:'power3.out',
      scrollTrigger:{trigger:'.pic-table',start:'top 78%'}});
    gsap.from('#piccoli .pic-docket',{opacity:0,y:44,duration:1.3,delay:.12,ease:'power3.out',
      scrollTrigger:{trigger:'.pic-table',start:'top 78%'}});
    gsap.from('#piccoli .an-dog > *',{opacity:0,y:16,duration:.9,stagger:.07,ease:'power3.out',
      scrollTrigger:{trigger:'.pic-table',start:'top 74%'}});
    gsap.from('#piccoli .pic-garment',{opacity:0,duration:1.2,delay:.75,ease:'power2.out',
      scrollTrigger:{trigger:'.pic-table',start:'top 74%'}});
    gsap.from('#piccoli .tape',{opacity:0,duration:.9,stagger:.13,delay:1.05,ease:'power2.out',
      scrollTrigger:{trigger:'.pic-table',start:'top 74%'}});
  }

