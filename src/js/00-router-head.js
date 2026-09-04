
/* A code scanned in a waiting room arrives as ?c=... (or #misura). That visitor
   gets a short hero and lands on the measuring table, not on three screens of
   cinema. Decided before first paint so nothing flashes. */
/* And one maker with two kinds of commission needs two addresses. ?p=piccoli
   is what the QR poster in the clinic points at; ?p=collezione is what you
   hand a bag customer. With neither, nobody is sent to the wrong world — the
   hero opens onto a door and the visitor chooses. All one file: the routes
   are which house is shown, not which document is fetched. */
(function(){var d=document.documentElement;var c="js";try{
  var q=location.search,h=location.hash;
  var m=/[?&]p=([a-z]+)/.exec(q);
  var r=m?m[1]:"";
  if(h==="#collezione") r="collezione";
  if(/[?&]c=/.test(q)||h==="#misura"){
    c+=" clinic route-piccoli";
    var k=/[?&]c=([^&#]*)/.exec(q); d.setAttribute("data-clinic",k&&k[1]?decodeURIComponent(k[1]):"");
  } else if(r==="piccoli"||r==="collezione"){ c+=" route-"+r; }
  else { c+=" route-door"; }
}catch(e){ c="js route-door"; }
d.className=c;})();
