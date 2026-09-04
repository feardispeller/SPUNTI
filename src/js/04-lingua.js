

/* ============================================================
   Lingua — EN / IT
   ============================================================ */
var LANG='en', LBL, rebuildWordScrubs=null, buildThemeJourney=null;
var LABELS={
  en:{menu:'Menu',close:'Close',behold:'Turn'},
  it:{menu:'Menu',close:'Chiudi',behold:'Gira'}
};
var MQ_ITEMS={
  en:['Raffia','Vegetable-tanned leather','Wild palm','Organic cotton','Brass','Olivewood','Indigo','Waxed linen'],
  it:['Rafia','Pelle a concia vegetale','Palma selvatica','Cotone biologico','Ottone',"Legno d'ulivo",'Indaco','Lino cerato']
};
var MFQ={
  en:{
    mf:'Every bag begins as a <em>single thread</em> — pulled, twisted and tamed by women who have known the loom for <em>three generations.</em> We do not manufacture. <em>We remember.</em>',
    quote:'“A bag is a <em>small architecture</em> — a room you carry.”'
  },
  it:{
    mf:'Ogni borsa nasce da un <em>unico filo</em> — tirato, ritorto e domato da donne che conoscono il telaio da <em>tre generazioni.</em> Non produciamo. <em>Ricordiamo.</em>',
    quote:'“Una borsa è una <em>piccola architettura</em> — una stanza che porti con te.”'
  }
};
var I18N=[
  {sel:'.nav-links a[href="#collection"]',en:'Collection',it:'Collezione'},
  {sel:'.nav-links a[href="#craft"]',en:'Craft',it:'Lavorazione'},
  {sel:'#doorKick',en:'Two houses, one pair of hands',it:'Due case, due mani'},
  {sel:'#doorLead',en:'Sandra cuts for animals, and for the people who walk them. Two kinds of commission, one pair of hands. Where would you like to begin?',it:'Sandra taglia per gli animali, e per chi li porta a spasso. Due tipi di commissione, un paio di mani. Da dove vuole cominciare?'},
  {sel:'.door-card[data-route="piccoli"] .label',en:'For them',it:'Per loro'},
  {sel:'#doorP1',en:'A coat cut for one animal and nothing else — measured by hand, drawn once, and never cut again.',it:"Un cappotto tagliato per un animale e per nessun altro — misurato a mano, disegnato una volta, e mai piu ritagliato."},
  {sel:'#doorGo1',en:'Take the measurements',it:'Prendere le misure'},
  {sel:'.door-card[data-route="collezione"] .label',en:'For you',it:'Per voi'},
  {sel:'#doorP2',en:'Bags and small leather, made one at a time on the bench in Milano. The work she began with.',it:'Borse e piccola pelletteria, fatte una alla volta sul banco a Milano. Il lavoro da cui e partita.'},
  {sel:'#doorGo2',en:'See the collection',it:'Vedere la collezione'},
  {sel:'#brKick',en:'The same bench',it:'Lo stesso banco'},
  {sel:'#brLine',en:'The cloth she cuts a coat from is the cloth she cuts a bag from. What follows is the other half of her work.',it:'La stoffa con cui taglia un cappotto e la stoffa con cui taglia una borsa. Quel che segue e l altra meta del suo lavoro.'},
  {sel:'#tailLine',en:'She also makes for the other half of the household.',it:"Fa anche per l'altra meta della casa."},
  {sel:'.tail-note .t-coll i',en:'See the collection',it:'Vedere la collezione'},
  {sel:'.tail-note .t-picc i',en:'Made to measure, for animals',it:'Su misura, per gli animali'},
  {sel:'.menu-links a[href="#hero"] .ml-word',en:'Overture',it:'Ouverture'},
  {sel:'.menu-links a[href="#collection"] .ml-word',en:'The Collection',it:'La Collezione'},
  {sel:'.menu-links a[href="#craft"] .ml-word',en:'The Craft',it:'La Lavorazione'},
  {sel:'.menu-links a[href="#atelier"] .ml-word',en:'The Atelier',it:"L'Atelier"},
  {sel:'.menu-links a[href="#footer-sec"] .ml-word',en:'Correspondence',it:'Corrispondenza'},
  {sel:'.menu-foot span:last-child',en:'Est. MMXVI',it:'Fond. MMXVI'},
  {sel:'.hero-kicker',html:1,en:'Atelier — Est. MMXVI &nbsp;·&nbsp; Toscana — Milano',it:'Atelier — Fond. MMXVI &nbsp;·&nbsp; Toscana — Milano'},
  {sel:'.ht-name .nm-t',html:1,en:'Punti e <span class="nm-s">S</span>punti',it:'Punti e <span class="nm-s">S</span>punti'},
  {sel:'.hs-picc',html:1,en:'Made to measure for your animal,<br>and for you.',it:'Su misura per il tuo animale,<br>e per te.'},
  {sel:'.hs-door',html:1,en:'Two kinds of commission,<br>one pair of hands.',it:'Due tipi di commissione,<br>un paio di mani.'},
  {sel:'.hs-coll',html:1,en:'Bags and small leather,<br>made one at a time.',it:'Borse e piccola pelletteria,<br>una alla volta.'},
  {sel:'.hero-scroll .label',en:'Scroll to drift',it:'Scorri, e lasciati andare'},
  {sel:'.hero-meta .hero-edge:first-child',en:'Nº 001 — Overture',it:'Nº 001 — Ouverture'},
  {sel:'.hero-meta .hero-edge:last-child',en:'By her hands, always',it:'Dalle sue mani, sempre'},
  {sel:'#manifesto .sec-label',en:'A note on slowness — 02',it:'Una nota sulla lentezza — 02'},
  {sel:'.mf-sig .label',en:'Alessandra Guetta — third generation at the loom, Milano',it:'Alessandra Guetta — terza generazione al telaio, Milano'},
  {sel:'#collection .sec-label',en:'The Collection — MMXXVI',it:'La Collezione — MMXXVI'},
  {sel:'.col-head h2 .rl:first-child',en:'Four vessels,',it:'Quattro forme,'},
  {sel:'.col-head h2 .rl:last-child',en:'one unbroken thread.',it:'un filo ininterrotto.'},
  {sel:'#colHint',en:'Drag a piece to turn it in the light. Linger, and la lente rises.',it:'Trascina un pezzo per girarlo nella luce. Indugia, e la lente si alza.'},
  {sel:'#colCue',html:1,en:'Drift sideways&nbsp;&nbsp;⟶',it:'Scivola di lato&nbsp;&nbsp;⟶'},
  {sel:'.piece:nth-child(1) .piece-info .label',en:'Piece — 01',it:'Pezzo — 01'},
  {sel:'.piece:nth-child(2) .piece-info .label',en:'Piece — 02',it:'Pezzo — 02'},
  {sel:'.piece:nth-child(3) .piece-info .label',en:'Piece — 03',it:'Pezzo — 03'},
  {sel:'.piece:nth-child(4) .piece-info .label',en:'Piece — 04',it:'Pezzo — 04'},
  {sel:'.piece:nth-child(1) h3',en:'The Nomad Tote',it:'La Tote Nomade'},
  {sel:'.piece:nth-child(2) h3',en:'La Riva Saddle',it:'La Riva'},
  {sel:'.piece:nth-child(3) h3',en:'Ombra Bucket',it:'Secchiello Ombra'},
  {sel:'.piece:nth-child(4) h3',en:'Vela Crescent',it:'Mezzaluna Vela'},
  {sel:'.piece:nth-child(1) .piece-mat',en:'Sun-dried raffia · vegetable-tanned trim',it:'Rafia essiccata al sole · finiture a concia vegetale'},
  {sel:'.piece:nth-child(2) .piece-mat',en:'Full-grain leather · hand-burnished edge',it:'Pelle pieno fiore · bordi bruniti a mano'},
  {sel:'.piece:nth-child(3) .piece-mat',en:'Midnight-dyed wild palm · brass ring',it:'Palma selvatica tinta a mezzanotte · anello in ottone'},
  {sel:'.piece:nth-child(4) .piece-mat',en:'Organic cotton cord · olivewood clasp',it:"Corda di cotone biologico · chiusura in legno d'ulivo"},
  {sel:'.piece:nth-child(1) .piece-note',en:'Woven over six days in the Tuscan hills — no two carry the same light.',it:'Intrecciata in sei giorni sulle colline toscane — nessuna porta la stessa luce.'},
  {sel:'.piece:nth-child(2) .piece-note',en:'Cut from a single hide, stitched with waxed linen — it darkens as it learns you.',it:"Tagliata da un'unica pelle, cucita con lino cerato — si scurisce mentre ti conosce."},
  {sel:'.piece:nth-child(3) .piece-note',en:'Dyed at dusk in indigo drawn from the field behind the atelier.',it:"Tinta al crepuscolo nell'indaco raccolto nel campo dietro l'atelier."},
  {sel:'.piece:nth-child(4) .piece-note',en:'Knotted, never sewn — one unbroken line from first loop to last.',it:"Annodata, mai cucita — un'unica linea dal primo all'ultimo nodo."},
  {sel:'#craft .sec-label',en:'The Craft — 03',it:'La Lavorazione — 03'},
  {sel:'.nav-links a[href="#piccoli"]',en:'Su Misura',it:'Su Misura'},
  {sel:'.menu-links a[href="#piccoli"] .ml-word',en:'Punti Piccoli',it:'Punti Piccoli'},
  {sel:'#piccoli .sec-label',en:'Su Misura — 01',it:'Su Misura — 01'},
  {sel:'#piccoli .pic-lede',en:'A coat cut for one animal and nothing else — and, if you like, something for you in the same cloth. Measured by hand, drawn once, and never cut again.',it:'Un cappotto tagliato per un animale solo — e, se vuoi, qualcosa per te nello stesso tessuto. Misurato a mano, disegnato una volta, e mai più tagliato.'},
  {sel:'.pic-species .sp[data-sp="dog"] em',en:'Il Cane',it:'Il Cane'},
  {sel:'.pic-species .sp[data-sp="cat"] em',en:'Il Gatto',it:'Il Gatto'},
  {sel:'.dk-ttl',en:'La Scheda — the docket',it:'La Scheda'},
  {sel:'.dk-name .label',en:'Her name',it:'Il suo nome'},
  {sel:'#dkRows li[data-m="neck"] .dk-en',en:'Neck',it:'Circonferenza'},
  {sel:'#dkRows li[data-m="chest"] .dk-en',en:'Chest',it:'Circonferenza'},
  {sel:'#dkRows li[data-m="back"] .dk-en',en:'Back',it:'Lunghezza'},
  {sel:'#dkLgG',en:'The garment',it:'Il capo'},
  {sel:'#dkLgC',en:'The cloth',it:'Il tessuto'},
  {sel:'#dkLgW',en:'And for you',it:'E per te'},
  {sel:'#dkPair button[data-w="sciarpa"] i',en:'The scarf',it:'Nello stesso tessuto'},
  {sel:'#dkPair button[data-w="pochette"] i',en:'The pocket square',it:'Da taschino'},
  {sel:'#dkPair button[data-w="nastro"] i',en:'The hair ribbon',it:'Per i capelli'},
  {sel:'#dkPair button[data-w="none"] em',en:'Solo per lei',it:'Solo per lei'},
  {sel:'#dkPair button[data-w="none"] i',en:'Just for them',it:'Nessun capo per te'},

  {sel:'#dkLgP',en:'She has cut these before',it:'Ne ha già tagliati così'},
  {sel:'#dkLgT',en:'The trim',it:'Il bordo'},
  {sel:'#dkTrims button[data-t="cuoio"] .label',en:'Vegetable-tanned',it:'Al vegetale'},
  {sel:'#dkTrims button[data-t="miele"] .label',en:'Honey',it:'Miele'},
  {sel:'#dkTrims button[data-t="bruno"] .label',en:'Walnut',it:'Noce'},

  {sel:'#dkGarments button[data-g="coat"] i',en:'The coat',it:"Per l'inverno"},
  {sel:'#dkGarments button[data-g="cape"] i',en:'The cape',it:'Per la pioggia'},
  {sel:'#dkGarments button[data-g="collar"] i',en:'The collar',it:'Per sempre'},
  {sel:'#dkCloths button[data-c="lana"] .label',en:'Boiled wool',it:'Lana bollita'},
  {sel:'#dkCloths button[data-c="lino"] .label',en:'Brushed linen',it:'Lino spazzolato'},
  {sel:'#dkCloths button[data-c="trap"] .label',en:'Quilted cotton',it:'Cotone trapuntato'},
  {sel:'#dkCloths button[data-c="cera"] .label',en:'Waxed canvas',it:'Tela cerata'},
  {sel:'.dk-send span',en:'Send this to the atelier',it:'Manda questa scheda in atelier'},
  {sel:'.dk-note',en:'No prices here. She writes back, and the two of you decide.',it:'Qui non ci sono prezzi. Lei risponde, e insieme decidete.'},
  {sel:'label[for="dkWho"]',en:'Your name',it:'Il tuo nome'},
  {sel:'label[for="dkHow"]',en:'Email or telephone',it:'Email o telefono'},
  {sel:'.dk-measured',html:1,en:'Don\'t have a tape? <b>Ask the clinic to measure.</b>',it:'Non hai un metro? <b>Chiedi in clinica di misurarli.</b>'},
  {sel:'.dk-sent .ds-h',en:'Your docket is with her.',it:'La tua scheda è da lei.'},
  {sel:'.dk-sent .ds-p',en:'She writes back within a week — usually sooner. Nothing is cut until you have agreed it together.',it:'Risponde entro una settimana — di solito prima. Non si taglia nulla finché non avete deciso insieme.'},
  {sel:'.pc-lg',en:'Measured at the clinic',it:'Misurati in clinica'},
  {sel:'.pc-quote',en:'A coat has to clear the shoulder and sit off the spine, or the animal will not wear it twice. I take the three measurements myself, while they are already on the table.',it:'Un cappotto deve liberare la spalla e non gravare sulla schiena, altrimenti l\'animale non lo indossa due volte. Le tre misure le prendo io, mentre sono già sul tavolo.'},
  {sel:'.pc-cite',html:1,en:'<b>Ceci</b> — veterinary surgeon, <span class="pc-clinicname">[ clinic name ]</span>, Milano',it:'<b>Ceci</b> — medico veterinario, <span class="pc-clinicname">[ nome clinica ]</span>, Milano'},
  {sel:'.pc-note',en:'Ask at the desk on your next visit and we will measure them for you. The three numbers go straight onto your docket — nothing to do at home, and no tape to buy.',it:'Chiedi alla reception alla prossima visita e li misuriamo noi. I tre numeri finiscono direttamente sulla tua scheda — niente da fare a casa, e nessun metro da comprare.'},
  {sel:'#picWelcome',en:'She measured them at the clinic. Here is what she can make.',it:'Li hanno misurati in clinica. Ecco cosa può farne.'},


  {sel:'.craft-title .rl:nth-child(1)',en:'Sixty hours.',it:'Sessanta ore.'},
  {sel:'.craft-title .rl:nth-child(2)',en:'Two hands.',it:'Due mani.'},
  {sel:'.craft-title .rl:nth-child(3)',en:'One thread.',it:'Un filo.'},
  {sel:'.stat:nth-child(1) .label',en:'Hours per vessel',it:'Ore per ogni borsa'},
  {sel:'.stat:nth-child(2) .label',en:'Artisan families',it:'Famiglie artigiane'},
  {sel:'.stat:nth-child(3) .label',en:'First loom raised',it:'Primo telaio alzato'},
  {sel:'.stat:nth-child(4) .label',en:'Machines, ever',it:'Macchine, mai'},
  {sel:'.step:nth-child(1) .step-t',en:'The Weave',it:'La Trama'},
  {sel:'.step:nth-child(2) .step-t',en:'The Dye',it:'La Tintura'},
  {sel:'.step:nth-child(3) .step-t',en:'The Stitch',it:'La Cucitura'},
  {sel:'.step:nth-child(1) p',en:"Raffia is pulled at dawn, while the fibre still holds the night's water. Each strand is rolled against the knee — the old way — until it sings under tension.",it:"La rafia si raccoglie all'alba, quando la fibra trattiene ancora l'acqua della notte. Ogni filo viene arrotolato sul ginocchio — alla vecchia maniera — finché non canta sotto tensione."},
  {sel:'.step:nth-child(2) p',en:'Indigo, cochineal and walnut hull, steeped in rain barrels behind the atelier. Colour arrives slowly here, the way dusk does.',it:"Indaco, cocciniglia e mallo di noce, macerati nelle botti di pioggia dietro l'atelier. Qui il colore arriva lentamente, come il crepuscolo."},
  {sel:'.step:nth-child(3) p',en:'Waxed linen, a saddler\'s needle, and a rhythm you can hear from the courtyard. Every seam is finished blind, so the bag keeps its secret.',it:'Lino cerato, un ago da sellaio e un ritmo che si sente dal cortile. Ogni cucitura è rifinita alla cieca, perché la borsa custodisca il suo segreto.'},
  {sel:'#atelier .sec-label',en:'The Atelier — 04',it:"L'Atelier — 04"},
  {sel:'.at-cite',en:'Alessandra Guetta — Founder, third generation',it:'Alessandra Guetta — Fondatrice, terza generazione'},
  {sel:'#footer-sec .sec-label',en:'Correspondence — 05',it:'Corrispondenza — 05'},
  {sel:'.ft-invite p',html:1,en:'The atelier receives visitors by appointment only.<br>Write to us — the coffee will be waiting.',it:"L'atelier riceve solo su appuntamento.<br>Scriveteci — il caffè vi aspetterà."},
  {sel:'.ft-social a:nth-child(3)',en:'Journal',it:'Diario'},
  {sel:'.ft-row > span:last-child',en:'© MMXXVI — Woven, not made',it:'© MMXXVI — Intrecciata, non fabbricata'}
];
function updateMarquee(items){
  ['mq1','mq2'].forEach(function(id){
    var spans=document.querySelectorAll('#'+id+' span');
    [].forEach.call(spans,function(s,i){ s.textContent=items[i%items.length]; });
  });
}
function applyLang(lang){
  LANG=lang; LBL=LABELS[lang];
  document.documentElement.setAttribute('lang', lang==='it'?'it':'en');
  I18N.forEach(function(e){
    var el=document.querySelector(e.sel); if(!el) return;
    var v=e[lang]; if(v==null) return;
    if(el.classList && el.classList.contains('rl')){
      var tgt=el.querySelector('.thin,.it') || el.firstElementChild || el;
      tgt.textContent=v;
    } else if(e.html){ el.innerHTML=v; }
    else { el.textContent=v; }
  });
  var mf=document.getElementById('mfText');
  if(mf){ mf.innerHTML=MFQ[lang].mf; splitWords(mf); }
  var q=document.getElementById('atQuote');
  if(q){ q.innerHTML=MFQ[lang].quote; splitWords(q); }
  if(typeof rebuildWordScrubs==='function') rebuildWordScrubs();
  if(typeof picRefresh==='function') picRefresh();
  updateMarquee(MQ_ITEMS[lang]);
  [].forEach.call(document.querySelectorAll('#langToggle [data-lang]'),function(s){
    s.classList.toggle('on', s.dataset.lang===lang);
  });
  var mw=document.getElementById('menuWord');
  if(mw) mw.textContent=document.body.classList.contains('menu-open')?LBL.close:LBL.menu;
  if(HAS_ST && window.ScrollTrigger) ScrollTrigger.refresh();
}
var langBusy=false;
document.getElementById('langToggle').addEventListener('click',function(){
  if(langBusy) return;
  var next=LANG==='en'?'it':'en';
  if(HAS_GSAP && !REDUCED){
    langBusy=true;
    gsap.to('#main',{opacity:0,y:14,duration:.32,ease:'power2.in',onComplete:function(){
      applyLang(next);
      gsap.to('#main',{opacity:1,y:0,duration:.6,ease:'power3.out',onComplete:function(){langBusy=false;}});
    }});
    var menuEl=document.getElementById('menu');
    if(document.body.classList.contains('menu-open')){
      gsap.fromTo(menuEl,{opacity:1},{opacity:.001,duration:.32,yoyo:true,repeat:1});
    }
  } else applyLang(next);
});
/* the plate mark is set from the true height of the masthead */
function fitNav(){
  var nv=document.getElementById('nav');
  if(nv) document.documentElement.style.setProperty('--navh', nv.offsetHeight+'px');
}
fitNav();
window.addEventListener('resize',fitNav);
if(document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);

/* ---------- ora di Milano ---------- */
function tickClock(){
  try{
    var s=new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',hour:'2-digit',minute:'2-digit'}).format(new Date());
    var m=document.getElementById('clockMenu'); if(m) m.textContent='Milano — '+s;
    var f=document.getElementById('clockFt'); if(f) f.textContent=s;   /* the address already says Milano */
  }catch(e){}
}
tickClock(); setInterval(tickClock,30000);

/* ---------- static fallback (no GSAP or reduced motion) ---------- */
function staticReveal(){
  var st=document.createElement('style');
  st.textContent='.nav,.hero-sub,.hero-scroll,.hero-edge,.menu-foot,.pl-tag{opacity:1!important}'+
    '.pl-s{width:auto!important;opacity:1!important}'+
    '.hero-title span,.pl-p span,.rl>span,.ft-word span{transform:none!important}'+
    '.mf-text .w,#atQuote .w{opacity:1!important}'+
    '.mq{justify-content:center}'+
    '.ht-name{opacity:.55!important}'+
    '.stitch-label .nm-st{transform:none!important}'+
    '.hero-title .ht-s{color:var(--clay)!important}'+
    '.ft-stitchwrap{clip-path:none!important}'+
    '.progress{clip-path:inset(0 0 0 0)!important}'+
    '#preloader{transition:opacity 1s ease}#preloader.gone{opacity:0;}';
  document.head.appendChild(st);
  /* the opening still plays — as a fade, not a flourish */
  (function(){
    var pl=document.getElementById('preloader'); if(!pl) return;
    var bar=document.getElementById('plBar'); if(bar){ bar.style.transition='transform 1.4s ease'; bar.style.transform='scaleX(1)'; }
    var c=document.getElementById('plCount'), n=0;
    var iv=setInterval(function(){ n+=7; if(n>=100){n=100;clearInterval(iv);} if(c) c.textContent=String(n).padStart(3,'0'); },100);
    setTimeout(function(){ pl.classList.add('gone');
      setTimeout(function(){ pl.style.display='none'; },1050); },1800);
  })();
  /* colour is not motion — the palette journey stays */
  if('IntersectionObserver' in window){
    var io2=new IntersectionObserver(function(es){
      es.forEach(function(en){ if(en.isIntersecting){
        applyTheme(en.target.dataset.bg,en.target.dataset.ink,en.target.dataset.line); } });
    },{rootMargin:'-45% 0px -45% 0px'});
    [].forEach.call(document.querySelectorAll('section[data-bg]'),function(s){ io2.observe(s); });
  }
  document.getElementById('menuToggle').addEventListener('click', function(){
    var menu=document.getElementById('menu');
    var open=document.body.classList.toggle('menu-open');
    menu.style.visibility=open?'visible':'hidden';
    menu.style.clipPath=open?'inset(0 0 0% 0)':'inset(0 0 100% 0)';
    document.getElementById('menuWord').textContent=open?'Close':'Menu';
  });
}
if(!HAS_GSAP || REDUCED){ staticReveal(); }