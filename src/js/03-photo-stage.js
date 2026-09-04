

/* ============================================================
   Photo stage — the photograph, with the atelier drawing beneath
   ============================================================ */
[].forEach.call(document.querySelectorAll('.piece-art'), function(art, pi){
  var SRC = PHOTOGRAPHS[pi] || {};
  if(SRC.front) art.dataset.front = SRC.front;
  if(SRC.alt)   art.dataset.alt   = SRC.alt;
  var svg=art.querySelector('svg'); if(!svg) return;
  var sketch=document.createElement('div'); sketch.className='art-sketch';
  sketch.appendChild(svg);
  var photo=document.createElement('div'); photo.className='art-photo';
  var front=document.createElement('img'); front.className='ph-front';
  front.loading='lazy'; front.decoding='async';
  front.alt=svg.getAttribute('aria-label')||'';
  var alt=document.createElement('img'); alt.className='ph-alt';
  alt.loading='lazy'; alt.decoding='async'; alt.alt=''; alt.setAttribute('aria-hidden','true');
  photo.appendChild(front); photo.appendChild(alt);
  var sheen=document.createElement('img'); sheen.className='ph-sheen';
  sheen.alt=''; sheen.setAttribute('aria-hidden','true');
  sheen.loading='lazy'; sheen.decoding='async';
  sheen.addEventListener('error',function(){ sheen.style.display='none'; });
  sheen.src=art.dataset.front||'';
  photo.appendChild(sheen);
  var gshadow=document.createElement('div'); gshadow.className='piece-shadow';
  art.appendChild(gshadow); art.appendChild(sketch); art.appendChild(photo);
  front.addEventListener('load',function(){ art.classList.add('has-photo'); art.classList.remove('no-photo'); });
  front.addEventListener('error',function(){
    art.classList.add('no-photo'); art.classList.remove('has-photo');
    if(!front.dataset.retried){            /* one honest retry before giving up */
      front.dataset.retried='1';
      setTimeout(function(){ front.src=(art.dataset.front||'')+'?r=1'; },600);
    }
  });
  alt.addEventListener('error',function(){ alt.style.display='none'; art.classList.add('no-alt'); });
  front.src=art.dataset.front||''; alt.src=art.dataset.alt||'';
  /* the optics row */
  var info=art.closest('.piece-inner').querySelector('.piece-info');
  if(info){
    var lo=document.createElement('div'); lo.className='lens-opts';
    lo.innerHTML='<span class="lo-name">La Lente</span>'+
      '<button data-z="0" data-hover>×2</button><button data-z="1" data-hover>×4</button><button data-z="2" data-hover>×6</button>';
    info.appendChild(lo);
  }
});