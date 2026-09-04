


/* ============================================================
   THE ROUTER
   Two addresses, one document. Switching a route is a class on
   <html> and a rewritten query string — no navigation, nothing
   re-downloaded, and the address bar still says where you are so
   the page can be shared or printed on a poster.
   ============================================================ */
(function(){
  var d=document.documentElement;
  function which(){
    return d.classList.contains('route-piccoli') ? 'piccoli'
         : d.classList.contains('route-collezione') ? 'collezione' : 'door';
  }
  function go(route,jump){
    if(which()===route){ if(jump) land(route); return; }
    d.classList.remove('route-door','route-piccoli','route-collezione');
    d.classList.add('route-'+route);
    try{ if(history.replaceState)
      history.replaceState(null,'', route==='door' ? location.pathname : '?p='+route); }catch(e){}
    /* sections have just appeared or gone; every pinned trigger on the page
       is now measuring against a layout that no longer exists */
    if(typeof buildThemeJourney==='function') buildThemeJourney();
    if(window.ScrollTrigger){ ScrollTrigger.refresh(); setTimeout(function(){
      if(typeof buildThemeJourney==='function') buildThemeJourney();
      ScrollTrigger.refresh(); },260); }
    if(jump) land(route);
  }
  function land(route){
    var t=document.getElementById(route==='collezione'?'collection':route==='piccoli'?'piccoli':'door');
    if(!t) return;
    var y=t.getBoundingClientRect().top+(window.pageYOffset||document.documentElement.scrollTop)-4;
    window.scrollTo(0,y);
  }
  [].forEach.call(document.querySelectorAll('.door-card'),function(b){
    b.addEventListener('click',function(){ go(b.dataset.route,true); });
  });
  [].forEach.call(document.querySelectorAll('.tail-note a'),function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      go(a.classList.contains('t-coll')?'collezione':'piccoli',true);
      document.body.classList.remove('menu-open');
    });
  });
  /* the masthead menu crosses between houses too */
  [['#piccoli','piccoli'],['#collection','collezione']].forEach(function(r){
    [].forEach.call(document.querySelectorAll('a[href="'+r[0]+'"]'),function(a){
      a.addEventListener('click',function(e){
        e.preventDefault(); go(r[1],true);
        document.body.classList.remove('menu-open');
      });
    });
  });
  window.__route=go;
})();