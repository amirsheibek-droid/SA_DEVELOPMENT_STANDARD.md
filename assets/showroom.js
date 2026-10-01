/* Neuron Pulse portfolio: real iPhones hanging in the 3D mind around the neuron you are looking at. */
(function(){
  var page=document.getElementById('p-portfolio');
  if(!page) return;
  var lite=Math.min(innerWidth,innerHeight)<700 || innerWidth<900 || !!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
  var logos=page.querySelectorAll('#npLogos img, .folio-logo-chip img');
  var V='/voltz/assets/screens/', U='/mind-universe/assets/screens/';
  var DEVS=[
    {name:'Voltz CRM',status:'Live on the App Store',href:'/voltz',cta:'Open Voltz CRM',card:0,accent:'#1f6bff',
      say:'Voltz is a voice-first job app for tradespeople. Speak a job and it books it, quotes it and invoices it.',
      screens:[[V+'clean-01-home.jpg','AI voice home'],[V+'clean-02-birds-eye.jpg',"Bird's-eye view"],[V+'clean-03-schedule.jpg','Your diary'],[V+'clean-05-new-client.jpg','New client'],[V+'clean-04-command-icons.jpg','Command centre']]},
    {name:'Mind Universe',status:'In progress · open preview',href:'/mind-universe/',cta:'Enter Mind Universe',mu:true,card:1,accent:'#a45cff',
      say:'Mind Universe is your mind as a place you can fly through. Moods, diary, goals and memories live as glowing neurons.',
      screens:[[U+'mu-02-home.jpg','Your mind'],[U+'mu-03-mood.jpg','Mood'],[U+'mu-01-enter.jpg','Enter your mind']]},
    {name:'SpareDrive',status:'In development',card:2,accent:'#12b877',text:['Spare','Drive'],tag:'Launching soon',
      say:'SpareDrive is in development. A Neuron Pulse app, still being built.'},
    {name:'Qlarvia',status:'In the pipeline',card:3,accent:'#6d4aff',tag:'Software intelligence',
      say:'Qlarvia is a software intelligence platform, still in the pipeline.'},
    {name:'NEX License',status:'In the pipeline',card:4,accent:'#1f6bff',tag:'Consulting',
      say:'NEX is a consulting platform, still in the pipeline.'},
    {name:'The Talking Therapist',status:'In the pipeline',card:5,accent:'#14b8a6',tag:'Therapy and wellbeing',
      say:'The Talking Therapist is a wellbeing app, still in the pipeline.'},
    {name:'Eid in Bedford',status:'In the pipeline',card:6,accent:'#d4a017',tag:'Community events',
      say:'Eid in Bedford is a community events app, still in the pipeline.'},
    {name:'Contract Analyser',status:'In development',card:7,accent:'#334155',text:['Contract','Analyser'],tag:'Contract review',
      say:'Contract Analyser reads contracts and highlights what matters. It is in development now.'}
  ];

  var caps=document.createElement('div'); caps.id='npCaps'; document.body.appendChild(caps);
  var light=document.getElementById('npLight');
  if(!light){ light=document.createElement('div'); light.id='npLight'; document.body.appendChild(light); }

  function el(t,c,p,h){ var e=document.createElement(t); if(c) e.className=c; if(h!=null) e.innerHTML=h; if(p) p.appendChild(e); return e; }
  function hexA(h,a){ var n=parseInt((h||'#1f6bff').slice(1),16); return 'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'; }
  function loadImg(src){ return new Promise(function(res){ if(!src) return res(null); var im=new Image(); im.onload=function(){ res(im); }; im.onerror=function(){ res(null); }; im.src=src; }); }
  function logoOf(i){ var im=logos[i]; return im?im.src:null; }
  function rr(c,x,y,w,h,r){ c.beginPath(); if(c.roundRect) c.roundRect(x,y,w,h,r); else c.rect(x,y,w,h); }

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
      c.fillText(kind==='build'?'Building the app…':(d.tag||d.name),W/2,H*.58);
      c.textAlign='left'; return a;
    }
    out.push([paint('hero'),d.name]);
    out.push([paint('build'),'The build']);
    return out;
  }

  var placed=false, list=[], cycling=false, flying=null, lastVoice=null, voiceT=0;

  function placeNow(){
    if(placed) return true;
    var M=window.SAMind; if(!M||!M.addPhone) return false;
    placed=true;
    var n=DEVS.length;
    DEVS.forEach(function(d,i){
      if(!d.imgs||!d.imgs.length){ var sp=splashScreens(d,null); d.imgs=sp.map(function(s){ return s[0]; }); d.captions=sp.map(function(s){ return s[1]; }); }
      var a=(i/n)*Math.PI*2 + .28, r=36+(i%3)*14, y=(i%3-1)*12;
      var rec=M.addPhone('core', d.imgs[0], [Math.cos(a)*r, y, Math.sin(a)*r], {name:d.name, href:d.href, cta:d.cta, status:d.status, col:parseInt((d.accent||'#1f6bff').slice(1),16), i:i});
      if(!rec) return;
      d.rec=rec; d.cur=0;
      var cap=el('div','np-floatcap',caps);
      cap.innerHTML='<b>'+d.name+'</b>'+(d.href?'<a class="np-go'+(d.mu?' mu':'')+'" href="'+d.href+'">'+(d.cta||'Open')+'</a>':'');
      d.cap=cap;
      list.push(d);
    });
    if(M.anchorPhones) M.anchorPhones('core');
    cycle();
    return true;
  }

  function around(id){
    var M=window.SAMind;
    if(!placeNow()) return false;
    if(M&&M.anchorPhones) M.anchorPhones(id||'core');
    document.body.classList.add('np-phones');
    return true;
  }

  function fillScreens(){
    DEVS.forEach(function(d){
      if(d.screens && typeof d.screens[0][0]==='string'){
        Promise.all(d.screens.map(function(s){ return loadImg(s[0]).then(function(im){ return [im||s[0], s[1]]; }); }))
          .then(function(rows){
            d.imgs=rows.map(function(r){ return r[0]; });
            d.captions=rows.map(function(r){ return r[1]; });
            if(d.rec && d.imgs[0]) d.rec.setScreen(d.imgs[0]);
          });
      } else {
        loadImg(logoOf(d.card)).then(function(im){
          var sp=splashScreens(d,im); d.imgs=sp.map(function(s){ return s[0]; }); d.captions=sp.map(function(s){ return s[1]; });
          if(d.rec && d.imgs[0]) d.rec.setScreen(d.imgs[0]);
        });
      }
    });
  }

  function boot(){
    if(placeNow()){ fillScreens(); hookFrame(); return; }
    setTimeout(boot,80);
  }

  function cycle(){
    if(cycling) return; cycling=true;
    function tick(){
      list.forEach(function(d){
        if(!d.imgs||d.imgs.length<2||!d.rec) return;
        d.cur=(d.cur+1)%d.imgs.length;
        d.rec.setScreen(d.imgs[d.cur]);
      });
      setTimeout(tick, 4800);
    }
    setTimeout(tick, 3600);
  }

  function speakNear(d){
    if(!d||!d.say) return;
    var now=performance.now();
    if(lastVoice===d && now-voiceT<18000) return;
    lastVoice=d; voiceT=now;
    try{ if(window.Jess&&Jess.say) Jess.say(d.say); }catch(e){}
  }

  function paintCaps(){
    var M=window.SAMind; if(!M||!M.screenOfPhone) return;
    var show=document.body.classList.contains('inside');
    caps.classList.toggle('on', show);
    var nearest=null, nd=1e9;
    list.forEach(function(d){
      if(!d.rec||!d.cap) return;
      var s=M.screenOfPhone(d.rec);
      var vis=show&&s&&s.on&&s.dist<320&&s.x>-60&&s.x<innerWidth+60&&s.y>-60&&s.y<innerHeight+60;
      if(!vis){ d.cap.style.opacity='0'; d.cap.style.pointerEvents='none'; return; }
      if(s.dist<nd){ nd=s.dist; nearest=d; }
      var closeK=Math.max(0,Math.min(1,(110-s.dist)/85));
      var sc=0.9+closeK*1.55;
      d.cap.style.opacity=(0.3+closeK*0.7).toFixed(2);
      d.cap.style.pointerEvents=closeK>0.45?'auto':'none';
      d.cap.classList.toggle('near', closeK>0.45);
      d.cap.style.transform='translate('+s.x.toFixed(1)+'px,'+s.y.toFixed(1)+'px) translate(-50%,78%) scale('+sc.toFixed(3)+')';
    });
    if(nearest && nd<70) speakNear(nearest);
  }

  var hooked=false;
  function hookFrame(){
    if(hooked) return; hooked=true;
    (function loop(){ paintCaps(); requestAnimationFrame(loop); })();
  }

  function openDev(d){
    if(!d||flying) return;
    if(!d.href){ try{ window.SAMind&&SAMind.fire('portfolio'); }catch(e){} light.innerHTML='<h3>'+d.name+'</h3><p>Still being built</p>';
      light.animate([{opacity:0},{opacity:.9,offset:.4},{opacity:1}],{duration:700,fill:'forwards'});
      setTimeout(function(){ light.animate([{opacity:1},{opacity:0}],{duration:700,fill:'forwards'}); },1400); return; }
    flying=d;
    try{ SAMind.fire('portfolio'); SAMind.warp(); }catch(e){}
    location.href=d.href;
  }

  function tap(e){
    var M=window.SAMind; if(!M||!M.pickPhone||!document.body.classList.contains('inside')) return false;
    if(e.target.closest('#stage,button,a,input,textarea,.nl,#dock,#flyHelp,#npCaps')) return false;
    var rec=M.pickPhone(e.clientX,e.clientY); if(!rec) return false;
    var s=M.screenOfPhone(rec);
    if(!s||s.dist>48){ var t=document.getElementById('toast'); if(t){ t.textContent='Fly closer — the phone gets bigger as you close in'; t.classList.add('on'); setTimeout(function(){ t.classList.remove('on'); },2200); } return true; }
    var d=list.filter(function(x){ return x.rec===rec; })[0];
    if(d){ speakNear(d); openDev(d); }
    return true;
  }

  window.NPShow={
    boot:boot,
    around:around,
    open:function(){ document.body.classList.add('np-phones'); around('core'); boot(); },
    tap:tap
  };
  boot();
})();
