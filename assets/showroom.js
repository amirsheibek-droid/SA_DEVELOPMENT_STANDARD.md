/* Neuron Pulse showroom: every product as a 3D iPhone floating around the Vault neuron.
   Screens preview the app (or a branded splash if it is still in the pipeline). They hover and slowly rotate. */
(function(){
  var page=document.getElementById('p-portfolio');
  if(!page) return;
  var row=document.createElement('div'); row.id='npLane'; document.body.appendChild(row);
  var light=document.createElement('div'); light.id='npLight'; document.body.appendChild(light);
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lite=Math.min(innerWidth,innerHeight)<700 || innerWidth<900 || !!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
  var cards=page.querySelectorAll('.folio-card');
  var V='/voltz/assets/screens/', M='/mind-universe/assets/screens/';
  var DEVS=[
    {name:'Voltz CRM',status:'Live on the App Store',href:'/voltz',cta:'See Voltz CRM \u2192',card:0,accent:'#1f6bff',
      back:'linear-gradient(160deg,#3d86ff,#0b3fb8)',backHtml:'<img src="/voltz/assets/voltz-icon.png" alt="">Voltz CRM<small>by Neuron Pulse</small>',
      screens:[[V+'clean-01-home.jpg','AI voice home'],[V+'clean-02-birds-eye.jpg',"Bird's-eye view"],[V+'clean-03-schedule.jpg','Your diary'],[V+'clean-05-new-client.jpg','New client'],[V+'clean-04-command-icons.jpg','Command centre']]},
    {name:'Mind Universe',status:'In progress \u00b7 open preview',href:'/mind-universe/',cta:'Enter the Mind Universe \u2192',mu:true,card:1,accent:'#a45cff',
      back:'radial-gradient(circle at 30% 22%,rgba(255,79,168,.85),transparent 46%),radial-gradient(circle at 72% 80%,rgba(46,230,255,.75),transparent 46%),linear-gradient(160deg,#3b1d7a,#0b0820)',
      backHtml:'<span style="font-size:1.05rem">Mind<span style="color:#d4b8ff">Universe</span></span><small>by Neuron Pulse</small>',
      screens:[[M+'mu-02-home.jpg','Your mind'],[M+'mu-03-mood.jpg','Mood'],[M+'mu-01-enter.jpg','Enter your mind']]},
    {name:'SpareDrive',status:'In development',card:2,accent:'#12b877',text:['Spare','Drive'],tag:'Launching soon'},
    {name:'Qlarvia',status:'In the pipeline',card:3,accent:'#6d4aff',tag:'Software intelligence platform'},
    {name:'NEX License',status:'In the pipeline',card:4,accent:'#1f6bff',tag:'Consulting platform'},
    {name:'The Talking Therapist',status:'In the pipeline',card:5,accent:'#14b8a6',tag:'Therapy and wellbeing'},
    {name:'Eid in Bedford',status:'In the pipeline',card:6,accent:'#d4a017',tag:'Community events'},
    {name:'Contract Analyser',status:'In development',card:7,accent:'#334155',text:['Contract','Analyser'],tag:'Intelligent contract review'}
  ];

  function el(t,c,p,h){ var e=document.createElement(t); if(c) e.className=c; if(h!=null) e.innerHTML=h; if(p) p.appendChild(e); return e; }
  function R_(a,b){ return a+Math.random()*(b-a); }
  function hexA(h,a){ var n=parseInt(h.slice(1),16); return 'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'; }
  function loadImg(src){ return new Promise(function(res){ if(!src) return res(null); var im=new Image(); im.onload=function(){ res(im); }; im.onerror=function(){ res(null); }; im.src=src; }); }
  function logoOf(i){ var im=cards[i]&&cards[i].querySelector('.folio-logo-chip img'); return im?im.src:null; }
  function rr(c,x,y,w,h,r){ c.beginPath(); if(c.roundRect) c.roundRect(x,y,w,h,r); else c.rect(x,y,w,h); }

  /* apps still in the pipeline get a branded phone splash so every device still has a live preview */
  function splashScreens(d,logo){
    var W=lite?390:780, H=lite?844:1688, out=[];
    function paint(kind){
      var a=document.createElement('canvas'); a.width=W; a.height=H; var c=a.getContext('2d');
      var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0b1730'); g.addColorStop(1,'#05070f'); c.fillStyle=g; c.fillRect(0,0,W,H);
      var rg=c.createRadialGradient(W*.5,H*.38,20,W*.5,H*.38,W*.7); rg.addColorStop(0,hexA(d.accent,.45)); rg.addColorStop(1,hexA(d.accent,0)); c.fillStyle=rg; c.fillRect(0,0,W,H);
      c.fillStyle='rgba(255,255,255,.08)'; rr(c,W*.08,H*.06,W*.84,H*.04,H*.02); c.fill();
      if(logo){ var s=Math.min((W*.46)/logo.width,(H*.16)/logo.height), w=logo.width*s, h=logo.height*s; c.drawImage(logo,(W-w)/2,H*.28,w,h); }
      else { var t=d.text||[d.name,'']; c.textAlign='center'; c.textBaseline='middle'; c.font='800 '+Math.round(W*.11)+'px Inter,system-ui,sans-serif';
        c.fillStyle='#fff'; c.fillText(t[0],W/2,H*.34); c.fillStyle=d.accent; c.fillText(t[1]||'',W/2,H*.34+W*.13); c.textBaseline='alphabetic'; c.textAlign='left'; }
      c.textAlign='center'; c.fillStyle='rgba(255,255,255,.72)'; c.font='600 '+Math.round(W*.045)+'px Inter,system-ui,sans-serif';
      c.fillText(kind==='build'?'Building the app\u2026':(d.tag||d.name),W/2,H*.58);
      c.font='700 '+Math.round(W*.032)+'px "JetBrains Mono",monospace'; c.fillStyle=d.accent;
      c.fillText('NEURON PULSE',W/2,H*.66);
      if(kind==='build'){ for(var i=0;i<5;i++){ c.fillStyle=i===0?hexA(d.accent,.35):'rgba(255,255,255,.08)'; rr(c,W*.16,H*.72+i*(H*.035),W*(i===0?.5:.28+((i*17)%20)/100),H*.018,H*.009); c.fill(); } }
      c.textAlign='left'; return a.toDataURL('image/jpeg',lite?.7:.86);
    }
    out.push([paint('hero'),d.name]);
    out.push([paint('build'),'The build']);
    return out;
  }

  function phoneBack(d){
    if(d.backHtml) return d;
    d.back=d.back||('linear-gradient(160deg,'+d.accent+',#0b1220)');
    d.backHtml='<span>'+d.name+'</span><small>by Neuron Pulse</small>';
    return d;
  }

  var list=DEVS.map(function(d,idx){
    phoneBack(d);
    var item=el('div','np-item phone',row), dev=el('div','np-dev',item), flo=el('div','np-float',dev), spin=el('div','np-spin',flo), rig=el('div','np-rig',spin), front;
    el('div','np-shadow',dev);
    dev.setAttribute('role','img'); dev.setAttribute('aria-label',d.name+' on a floating iPhone');
    front=el('div','np-f np-ph-front',rig); el('i','np-notch',front);
    el('div','np-f np-ph-back',rig,'<i class="cam"></i>'+d.backHtml).style.background=d.back;
    ['l','r','t','b'].forEach(function(s){ el('div','np-f np-ph-side '+s,rig); });
    d.C=lite?3:5; d.R=lite?6:10; d.rad='21px'; d.off=0; d.rx0=-8; d.home=idx*18;
    var scr=el('div','np-screen',front); d.tiles=[];
    scr.style.gridTemplateColumns='repeat('+d.C+',1fr)'; scr.style.gridTemplateRows='repeat('+d.R+',1fr)';
    for(var r=0;r<d.R;r++) for(var c=0;c<d.C;c++){
      var t=el('div','np-tile',scr);
      t.style.backgroundSize=(d.C*100)+'% '+(d.R*100)+'%'; t.style.backgroundPosition=(c/(d.C-1)*100)+'% '+(r/(d.R-1)*100)+'%';
      if(r===0&&c===0) t.style.borderTopLeftRadius=d.rad; if(r===0&&c===d.C-1) t.style.borderTopRightRadius=d.rad;
      if(r===d.R-1&&c===0) t.style.borderBottomLeftRadius=d.rad; if(r===d.R-1&&c===d.C-1) t.style.borderBottomRightRadius=d.rad;
      t.dataset.r=r; t.dataset.c=c; d.tiles.push(t);
    }
    d.scan=el('i','np-scan',scr); d.glare=el('i','np-glare',scr);
    var cap=el('div','np-cap',item); d.hudEl=el('div','np-hud',cap,'&nbsp;'); el('h4','',cap,d.name); el('div','st',cap,d.status);
    if(d.href){ var go=el('a','np-go'+(d.mu?' mu':''),cap,d.cta); go.href=d.href; }
    spin.style.opacity=(reduce||lite)?1:0;
    if(reduce||lite) d.tiles.forEach(function(t){ t.style.opacity=1; });
    d.item=item; d.dev=dev; d.spin=spin; d.rig=rig; d.ry=d.home; d.rx=d.rx0; d.vy=0; d.ph=idx*1.3; d.idle=0; d.cur=0;
    d.i=idx; d.kf=idx;
    var ang=idx/DEVS.length*Math.PI*2, ring=idx%2;
    d.local={x:Math.cos(ang)*(22+ring*12), y:(ring?7:-6)+Math.sin(ang*2)*3, z:Math.sin(ang)*(22+ring*12)};
    dev.addEventListener('pointerdown',function(e){ if(e.button||flying) return; d.drag=true; d.moved=0; d.lx=e.clientX; d.ly=e.clientY; d.vy=0; try{ dev.setPointerCapture(e.pointerId); }catch(_){} });
    dev.addEventListener('pointermove',function(e){ if(!d.drag) return; var dx=e.clientX-d.lx, dy=e.clientY-d.ly; d.lx=e.clientX; d.ly=e.clientY;
      d.moved+=Math.abs(dx)+Math.abs(dy); d.ry+=dx*.6; d.vy=dx*.6; d.rx=Math.max(-70,Math.min(45,d.rx-dy*.35)); });
    dev.addEventListener('pointerup',function(){ if(!d.drag) return; d.drag=false; d.idle=performance.now();
      if(d.moved<6){ if(d.i===focus) openDev(d); else setFocus(d.i); } });
    dev.addEventListener('wheel',function(e){ e.preventDefault(); wheel(e.deltaY||e.deltaX); },{passive:false});
    dev.addEventListener('pointercancel',function(){ d.drag=false; d.idle=performance.now(); });
    return d;
  });

  var focus=0, flying=null, wheelAcc=0, wheelT=0;
  var nav=el('div','np-nav',row,'<button type="button" aria-label="Previous app">&lsaquo;</button><span></span><button type="button" aria-label="Next app">&rsaquo;</button>');
  var navB=nav.querySelectorAll('button'), navN=nav.querySelector('span');
  navB[0].onclick=function(){ setFocus(focus-1); }; navB[1].onclick=function(){ setFocus(focus+1); };
  function setFocus(i){
    focus=Math.max(0,Math.min(list.length-1,i));
    list.forEach(function(d){ d.item.classList.toggle('back',d.i!==focus); });
    navB[0].disabled=focus===0; navB[1].disabled=focus===list.length-1; navN.textContent=(focus+1)+' / '+list.length;
  }
  function wheel(dy){ var now=performance.now(); if(now-wheelT>400) wheelAcc=0; wheelT=now; wheelAcc+=dy;
    if(Math.abs(wheelAcc)>60){ setFocus(focus+(wheelAcc>0?1:-1)); wheelAcc=0; wheelT=now+250; } }
  addEventListener('keydown',function(e){ if(!row.classList.contains('on')||flying) return;
    if(e.key==='ArrowRight'||e.key==='ArrowDown'){ setFocus(focus+1); e.preventDefault(); }
    else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){ setFocus(focus-1); e.preventDefault(); }
    else if(e.key==='Enter'&&document.activeElement===document.body) openDev(list[focus]); });
  setFocus(0);

  function orb(){ var M=window.SAMind, s=M&&M.screenOf&&M.screenOf('portfolio'); if(s&&s.on) return s;
    return {x:innerWidth<900?innerWidth/2:innerWidth*.22, y:innerWidth<900?innerHeight*.32:innerHeight*.48}; }
  function geom(){
    var small=innerWidth<900, W=innerWidth, H=innerHeight;
    if(small) return {mode:'row', S:Math.min(.36,H*.20/372), fx:0, fy:22, step:Math.max(188, Math.min(230, W*.52))};
    return {mode:'grid', S:Math.min(.5,H/1450), fx:Math.min(200,W*.15), fy:8, cols:4,
      gapX:Math.max(300, Math.min(380,W*.21)), gapY:Math.max(340, Math.min(430,H*.40))};
  }

  /* travel into the light, then the app takes over */
  function openDev(d){
    if(flying||!d.built) return; flying={d:d,t0:performance.now()};
    var r=d.dev.getBoundingClientRect(); light.style.setProperty('--lx',(r.left+r.width/2)+'px'); light.style.setProperty('--ly',(r.top+r.height/2)+'px');
    light.innerHTML=d.href?'':'<h3>'+d.name+'</h3><p>In development &middot; Neuron Pulse</p>';
    try{ SAMind.fire('portfolio'); SAMind.warp(); }catch(e){}
    light.animate([{opacity:0},{opacity:.35,offset:.45},{opacity:1}],{duration:950,easing:'cubic-bezier(.5,0,.7,1)',fill:'forwards'});
    setTimeout(function(){
      if(d.href){ location.href=d.href; return; }
      setTimeout(function(){ light.animate([{opacity:1},{opacity:0}],{duration:800,easing:'ease-out',fill:'forwards'}); flying=null; },1100);
    },1000);
  }
  addEventListener('pageshow',function(e){ if(e.persisted){ flying=null; light.getAnimations().forEach(function(a){ a.cancel(); }); } });
  function hud(d,h){ d.hudEl.innerHTML=h; }
  function setScreen(d,i){ var u='url("'+d.screens[i][0]+'")'; d.tiles.forEach(function(t){ t.style.backgroundImage=u; }); }

  function assemble(d){
    d.built=true; setScreen(d,0);
    if(reduce || lite){ d.tiles.forEach(function(t){ t.style.opacity=1; }); d.spin.style.opacity=1; hud(d,'<b>'+d.screens[0][1]+'</b> &middot; online'); setTimeout(function(){ cycle(d); }, lite?2800:0); return; }
    d.spin.animate([{opacity:0,transform:'translateZ(-700px) rotateY(540deg) rotateX(25deg) scale(.6)'},
                    {opacity:1,offset:.75,transform:'translateZ(30px) rotateY(-8deg) scale(1.02)'},
                    {opacity:1,transform:'none'}],{duration:1300,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
    var start=700;
    if(d.lid){ d.lid.animate([{transform:'translateZ(-84px) rotateX(-88deg)'},{transform:'translateZ(-84px) rotateX(22deg)',offset:.8},{transform:'translateZ(-84px) rotateX(14deg)'}],{duration:1000,delay:900,easing:'cubic-bezier(.3,.7,.2,1)',fill:'forwards'}); start=1500; }
    var order=d.tiles.slice().sort(function(a,b){ return (+a.dataset.r + +a.dataset.c*.6 + Math.random()*1.4)-(+b.dataset.r + +b.dataset.c*.6 + Math.random()*1.4); });
    var done=0, total=order.length, step=Math.max(16,1000/total);
    hud(d,'Assembling <b>'+d.name+'</b> &middot; 0%');
    order.forEach(function(t,k){
      var a=t.animate([
        {opacity:0,transform:'translate3d('+R_(-1,1)*380+'px,'+R_(-1,1)*320+'px,'+R_(-700,300)+'px) rotateX('+R_(-540,540)+'deg) rotateY('+R_(-540,540)+'deg) rotateZ('+R_(-180,180)+'deg) scale(.5)'},
        {opacity:1,offset:.62,transform:'translate3d(0,0,40px) rotateX(0) rotateY(0) rotateZ(0) scale(1.04)'},
        {opacity:1,offset:.8,transform:'translate3d(0,0,40px)'},
        {opacity:1,offset:.9,transform:'translate3d(0,0,-3px)'},
        {opacity:1,transform:'none'}],{duration:950,delay:start+k*step,easing:'cubic-bezier(.25,.8,.3,1)',fill:'forwards'});
      a.onfinish=function(){ t.classList.add('glow'); setTimeout(function(){ t.classList.remove('glow'); },240);
        done++; hud(d,'Assembling <b>'+d.name+'</b> &middot; '+Math.round(done/total*100)+'%'); if(done===total) locked(d); };
    });
  }
  function locked(d){
    hud(d,'<b>'+d.screens[0][1]+'</b> &middot; online');
    d.scan.animate([{opacity:0,top:'0%'},{opacity:1,offset:.1},{opacity:1,offset:.9},{opacity:0,top:'100%'}],{duration:1100,easing:'ease-in-out'});
    setTimeout(function(){ d.glare.classList.add('on'); setTimeout(function(){ d.glare.classList.remove('on'); },1300); },700);
    setTimeout(function(){ cycle(d); },3200+Math.random()*1500);
  }
  /* panels flip over in a wave to show the next screen */
  function cycle(d){
    if(!row.classList.contains('on')||d.kf>2.5){ setTimeout(function(){ cycle(d); },2000); return; }
    var nxt=(d.cur+1)%d.screens.length, u='url("'+d.screens[nxt][0]+'")', last=0;
    hud(d,'Loading <b>'+d.screens[nxt][1]+'</b>');
    if(lite || reduce){ d.tiles.forEach(function(t){ t.style.backgroundImage=u; }); hud(d,'<b>'+d.screens[nxt][1]+'</b> &middot; online'); d.cur=nxt; setTimeout(function(){ cycle(d); },5200); return; }
    d.tiles.forEach(function(t){
      var w=d.lid?(+t.dataset.r*90+ +t.dataset.c*60):(+t.dataset.r*70+ +t.dataset.c*90); if(w>last) last=w;
      if(!reduce) t.animate([{transform:'none'},{transform:'rotateY(90deg) translateZ(14px)',offset:.5},{transform:'none'}],{duration:620,delay:w,easing:'ease-in-out'});
      setTimeout(function(){ t.style.backgroundImage=u; },reduce?0:w+310);
    });
    setTimeout(function(){ hud(d,'<b>'+d.screens[nxt][1]+'</b> &middot; online'); },last+700);
    d.cur=nxt; setTimeout(function(){ cycle(d); },4600+Math.random()*1800);
  }

  var opened=false, queue=[], qT=null;
  function enqueue(d){ if(d.built||d.queued) return; d.queued=true; queue.push(d); pump(); }
  function pump(){ if(qT||!queue.length) return; var d=queue.shift(); assemble(d); qT=setTimeout(function(){ qT=null; pump(); },lite?160:380); }
  function prepare(){
    return Promise.all(list.map(function(d){
      if(d.screens){ d.screens.forEach(function(s){ new Image().src=s[0]; }); return null; }
      return loadImg(logoOf(d.card)).then(function(im){ d.screens=splashScreens(d,im); });
    })).then(function(){ list.forEach(enqueue); });
  }

  function frame(now){
    requestAnimationFrame(frame);
    var show=opened&&page.classList.contains('on')&&!page.classList.contains('out')&&document.body.classList.contains('inside');
    if(row.classList.contains('on')!==show) row.classList.toggle('on',show);
    if(!show&&!flying) return;
    var o=orb(), g=geom(), ft=flying?Math.min(1,(now-flying.t0)/950):0, fe=ft*ft*(3-2*ft), n=list.length;
    var M=window.SAMind, hub=M&&M.anchor&&M.anchor('portfolio'), spatial=!!(hub&&M.project);
    list.forEach(function(d){
      d.kf+=((d.i-focus)-d.kf)*.14;
      var k=d.kf, ak=Math.abs(k), x, y, sc, op;
      if(spatial){
        var p=M.project(hub.x+d.local.x, hub.y+d.local.y, hub.z+d.local.z);
        var near=Math.max(8, Math.min(160, p.dist));
        x=p.x; y=p.y;
        sc=(innerWidth<900?.4:.58)*Math.max(.28, Math.min(2.6, 46/near))*(d.i===focus?1.06:1);
        op=p.on&&p.z>-1?Math.max(0, Math.min(1, 1.15-near/140)):0;
        d.depth=near;
      } else if(g.mode==='grid'){
        var col=d.i%g.cols, rw=(d.i/g.cols)|0;
        x=o.x+g.fx+(col-(g.cols-1)/2)*g.gapX;
        y=o.y+g.fy+(rw-0.42)*g.gapY;
        sc=g.S*(d.i===focus?1.08:.88);
        op=1;
      } else {
        x=o.x+g.fx+k*g.step;
        y=o.y+g.fy+ak*18;
        sc=g.S*(ak<.2?1.1:Math.max(.5,1-ak*.14));
        op=ak>2.4?Math.max(0,1-(ak-2.4)*.9):Math.max(.32,1-ak*.1);
      }
      if(flying){ if(d===flying.d){ x+=(innerWidth/2-x)*fe; y+=(innerHeight/2-y)*fe; sc*=1+fe*5; } else op*=1-fe; }
      d.item.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) scale('+sc.toFixed(3)+')';
      d.item.style.opacity=op.toFixed(3); d.item.style.zIndex=String(spatial?Math.round(500-(d.depth||80)):(200-Math.round(ak*12)));
      d.item.style.visibility=op<.04?'hidden':'visible';
      if(!d.drag){
        if(reduce){ d.ry+=(d.home-d.ry)*.04; d.rx+=(d.rx0-d.rx)*.04; }
        else { d.ry+=lite?.12:.2; d.rx=d.rx0+Math.sin(now/2600+d.ph)*6; }
      } else { d.ry+=d.vy; d.vy*=.93; }
      d.rig.style.transform='translateY('+d.off+'px) rotateX('+d.rx.toFixed(2)+'deg) rotateY('+d.ry.toFixed(2)+'deg)';
    });
    var fy=g.mode==='grid'
      ? o.y+g.fy+((Math.ceil(n/g.cols)-1)-0.42)*g.gapY+210*g.S
      : o.y+g.fy+186*g.S+(innerWidth<900?56:96);
    nav.style.transform=spatial
      ? 'translate('+(innerWidth/2)+'px,'+(innerHeight-86)+'px) translateX(-50%)'
      : 'translate('+(o.x+g.fx).toFixed(1)+'px,'+Math.min(innerHeight-56,fy).toFixed(1)+'px) translateX(-50%)';
    nav.style.opacity=(flying||document.body.classList.contains('flying'))?0:1;
  }
  requestAnimationFrame(frame);

  window.NPShow={open:function(){ if(opened) return; opened=true; document.body.classList.add('np-phones'); prepare(); }};
})();
