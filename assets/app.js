// Minimal app: load data.json, render cards, sentinel lazy append, simple search
(function(){
  'use strict';
  const DATA_URL = (window.SITE_BASE || '') + '/data.json';
  const BATCH = 6;
  const container = document.getElementById('cardsArea');
  const spinner = document.getElementById('spinner');
  const endmsg = document.getElementById('endMessage');
  const sentinel = document.getElementById('sentinel');
  let data = [], idx = 0, obs = null;

  function qs(sel) { return document.querySelector(sel); }

  function createCard(it){
    const a = document.createElement('article'); a.className='card';
    a.innerHTML = `
      <div class="media"><img src="${it.img}" alt="${it.title}"></div>
      <div class="body">
        <h3 class="title">${it.title}</h3>
        <p class="desc">${it.desc||''}</p>
        <div><a class="btn" href="${it.link}" target="_blank" rel="noopener">Buy Now</a></div>
      </div>
    `;
    return a;
  }

  function appendBatch(){
    if(!container) return;
    spinner && (spinner.hidden=false);
    setTimeout(()=> {
      const batch = data.slice(idx, idx+BATCH);
      for(const it of batch) container.appendChild(createCard(it));
      idx += batch.length;
      spinner && (spinner.hidden=true);
      if(idx >= data.length) {
        endmsg && (endmsg.hidden=false);
        if(obs && sentinel) obs.unobserve(sentinel);
      }
    }, 120);
  }

  async function load(){
    try{
      const r = await fetch(DATA_URL);
      if(!r.ok) throw new Error('HTTP '+r.status);
      data = await r.json();
      appendBatch();
    }catch(e){
      console.error('load data error',e);
    }
  }

  function initObserver(){
    if(!sentinel) return;
    obs = new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting) appendBatch(); });
    }, { rootMargin:'300px' });
    obs.observe(sentinel);
  }

  // mobile menu toggle
  document.addEventListener('click', function(ev){
    const t = ev.target;
    if(t && t.id === 'mobileMenuToggle'){ document.getElementById('mobileMenu').classList.add('open'); }
    if(t && t.id === 'mobileMenuClose'){ document.getElementById('mobileMenu').classList.remove('open'); }
  });

  // small search binding
  document.addEventListener('includes:loaded', ()=>{ /* noop */ });
  document.addEventListener('DOMContentLoaded', ()=>{ load(); initObserver(); });

})();
