/* Cube Keep — the only world besides the mind.
   Solid cube floors. A stairwell cut out of each floor so the steps are real ground.
   Hold to walk. Drag to look. Pale stairs on the left and the right, one flight at a time. */
(function(){
  var T=window.THREE;
  if(!T) return;
  var small=Math.min(innerWidth,innerHeight)<700 || innerWidth<900 || !!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
  var lite=small;
  var host=null, hud=null, renderer=null, scene=null, cam=null, clock=null, running=false, group=null;
  var pads=[], stops=[], stopI=0, ride=null, lookYaw=0, lookPitch=0, keys={}, drag=null, walkOn=0;
  var px=0, py=1.62, pz=0, eye=1.62, floaters=[], stairMat=null;

  var FH=5.6, STEPS=10, RISE=FH/STEPS;
  var FZ0=-6.2, FZ1=6.2, SZ0=-4.45, SZ1=4.45;
  var LX=-4.85, RX=4.85, SW=3.35;

  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function toast(t){ try{ var el=document.getElementById('toast'); if(!el) return; el.textContent=t; el.classList.add('on'); clearTimeout(toast._t); toast._t=setTimeout(function(){ el.classList.remove('on'); },2400); }catch(e){} }
  function FX(n){ try{ window.SAFX&&SAFX[n]&&SAFX[n](); }catch(e){} }
  function pad(x,z,w,d,y){ if(w<=.05||d<=.05) return; pads.push({x:x,z:z,w:w,d:d,y:y}); }

  var GEOS={}, MATS={};
  function geoBox(w,h,d){ var k=w+'|'+h+'|'+d; if(!GEOS[k]) GEOS[k]=new T.BoxGeometry(w,h,d); return GEOS[k]; }
  function mat(hex, em){
    var k=hex+'|'+(em||0);
    if(!MATS[k]) MATS[k]=new T.MeshPhongMaterial({color:hex,emissive:hex,emissiveIntensity:em==null?0.2:em,shininess:22,specular:0x1a2433});
    return MATS[k];
  }
  function addBox(w,h,d,material,x,y,z){
    var g=new T.Group();
    var m=new T.Mesh(geoBox(w,h,d), material);
    var e=new T.LineSegments(new T.EdgesGeometry(geoBox(w,h,d)), new T.LineBasicMaterial({color:0xd7f6ff,transparent:true,opacity:.5}));
    g.add(m); g.add(e);
    g.position.set(x, y+h/2, z);
    group.add(g);
    return g;
  }
  function block(w,h,d,hex,x,y,z){ return addBox(w,h,d,mat(hex),x,y,z); }

  var GLOW=null;
  function glowTex(){
    if(GLOW) return GLOW;
    var c=document.createElement('canvas'); c.width=c.height=64; var g=c.getContext('2d');
    var gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.45,'rgba(255,255,255,.35)'); gr.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=gr; g.fillRect(0,0,64,64); GLOW=new T.CanvasTexture(c); return GLOW;
  }
  function glow(hex,s,x,y,z){
    var sp=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:hex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
    sp.scale.set(s,s,1); sp.position.set(x,y,z); group.add(sp); return sp;
  }
  function sign(text, hex, x, y, z){
    var c=document.createElement('canvas'); c.width=512; c.height=128; var g=c.getContext('2d');
    g.font='700 72px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle=hex; g.fillText(text, 256, 68);
    var sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));
    sp.scale.set(3.4,.85,1); sp.position.set(x,y,z); group.add(sp);
  }

  var FLOORS=[
    {n:'Ground', note:'The foot of the keep. Back to Mind is the way out.', col:0x4f7dff, css:'#9eb6ff'},
    {n:'Training', note:'Hold anywhere to walk forward. Drag to look. The pale cubes are the only stairs.', col:0x7ec8ff, css:'#d7f3ff'},
    {n:'Action', note:'Star roll lives on this floor. Walk the stair when you want the next one.', col:0xff4fa8, css:'#ffd0e8', play:'cube'},
    {n:'Arcade', note:'A floor of games. Play one, then keep walking.', col:0xff8a3d, css:'#ffd7bf', play:'ball'},
    {n:'Cozy', note:'Quieter light. A companion keeps this floor.', col:0xc9a6ff, css:'#efe4ff', play:'pet'},
    {n:'Puzzle', note:'A grid of cubes, and a puzzle if you want one.', col:0xffc44d, css:'#ffe7b0', play:'merge'},
    {n:'Observatory', note:'You start on the roof. The pale stair on your left goes down. At the bottom, cross to the other stair.', col:0xf4f7ff, css:'#ffffff'}
  ];

  function floorPads(y){
    pad(0, 0, 5.8, FZ1-FZ0, y);
    pad(LX, (FZ0+SZ0)/2, 5.8, SZ0-FZ0, y);
    pad(LX, (SZ1+FZ1)/2, 5.8, FZ1-SZ1, y);
    pad(RX, (FZ0+SZ0)/2, 5.8, SZ0-FZ0, y);
    pad(RX, (SZ1+FZ1)/2, 5.8, FZ1-SZ1, y);
  }
  function floorMesh(y){
    var slab=0x121a2c, h=.5;
    block(5.8, h, FZ1-FZ0, slab, 0, y-h, 0);
    block(5.8, h, SZ0-FZ0, slab, LX, y-h, (FZ0+SZ0)/2);
    block(5.8, h, FZ1-SZ1, slab, LX, y-h, (SZ1+FZ1)/2);
    block(5.8, h, SZ0-FZ0, slab, RX, y-h, (FZ0+SZ0)/2);
    block(5.8, h, FZ1-SZ1, slab, RX, y-h, (SZ1+FZ1)/2);
  }

  function furnish(f, y, hex){
    if(f===6){
      for(var k=0;k<(lite?5:9);k++){
        var g=block(.62,.62,.62, k%2?0xffffff:hex, 0, y+1.1, 0);
        floaters.push({g:g, a:k/9*Math.PI*2, r:1.5+(k%3)*.55, base:y+1.8, sp:.28+k*.03});
      }
      return;
    }
    if(f===5){
      for(var gx=-1;gx<=1;gx++) for(var gz=-1;gz<=1;gz++) if(gx||gz) block(.55,.4+((gx+gz+4)%3)*.28,.55, (gx+gz)%2?0xffffff:hex, gx*.85, y, gz*.85);
      return;
    }
    if(f===4){
      block(1.8,.45,.9, hex, 0, y, -.2);
      block(.6,.6,.6, 0xffffff, -.7, y, .8);
      block(.6,.95,.6, hex, .7, y, .7);
      return;
    }
    if(f===3){
      for(var i=0;i<3;i++) block(.7,1.15+(i%2)*.4,.6, i%2?0xffffff:hex, -1+i*1, y, 0);
      return;
    }
    if(f===2){
      block(.9,2.2,.9, hex, -.4, y, -.3);
      block(.55,1.1,.55, 0xffffff, .7, y, .5);
      return;
    }
    if(f===1){
      for(var s=0;s<4;s++) block(.55,.3+s*.1,.55, s%2?0xffffff:hex, -1.2+s*.75, y, .2);
      return;
    }
    block(1.6,2.4,1.6, hex, 0, y, -.2);
    block(.8,1.05,.8, 0xffffff, 0, y+2.4, -.2);
  }

  function buildCube(){
    scene.fog=new T.Fog(0x070b16, 22, 78);
    scene.background=new T.Color(0x070b16);
    group.add(new T.HemisphereLight(0xb7c6e4, 0x0b1018, .78));
    var sun=new T.DirectionalLight(0xfff4dc, .9); sun.position.set(18, 36, 14); group.add(sun);
    var fill=new T.DirectionalLight(0x6e86ff, .28); fill.position.set(-20, 12, -10); group.add(fill);

    var nStars=lite?90:260, sp=new Float32Array(nStars*3);
    for(var i=0;i<nStars;i++){ sp[i*3]=(Math.random()-.5)*90; sp[i*3+1]=4+Math.random()*78; sp[i*3+2]=(Math.random()-.5)*90; }
    var sg=new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp,3));
    group.add(new T.Points(sg, new T.PointsMaterial({color:0xffffff,size:.16,transparent:true,opacity:.8,depthWrite:false,sizeAttenuation:true})));

    stairMat=new T.MeshPhongMaterial({color:0xe7f3ff,emissive:0x9fd4ff,emissiveIntensity:.45,shininess:40,specular:0x88aacc});
    var run=(SZ1-SZ0)/STEPS;
    var tread=run+.5;

    for(var f=0;f<FLOORS.length;f++){
      var y=f*FH, hex=FLOORS[f].col, info=FLOORS[f];
      floorMesh(y);
      floorPads(y);

      var lamp=new T.PointLight(hex, 1.25, 18); lamp.position.set(-2.4, y+3.2, 0); group.add(lamp);
      glow(hex, lite?6:10, -2.4, y+2.2, 0);
      sign(info.n, info.css, -3.1, y+3.35, -1.4);

      var wallH=(f===FLOORS.length-1)?0.4:1.05;
      [-1.4,0,1.4].forEach(function(p){
        block(.7, wallH, .7, hex, p, y, FZ0+.7);
        block(.7, wallH, .7, hex, p, y, FZ1-.7);
      });

      furnish(f, y, hex);

      if(f<FLOORS.length-1){
        var left=f%2===1, sx=left?LX:RX;
        for(var st=0;st<STEPS;st++){
          var sy=y+st*RISE;
          var sz=left?(SZ1-run*(st+.5)):(SZ0+run*(st+.5));
          addBox(SW, RISE*.94, tread, stairMat, sx, sy, sz);
          pad(sx, sz, SW+.2, tread+.08, sy+RISE);
          block(.26,.26,.26, 0xffffff, sx-SW/2+.2, sy+RISE, sz);
          block(.26,.26,.26, 0xffffff, sx+SW/2-.2, sy+RISE, sz);
        }
        glow(0xbfe6ff, 2.2, sx, y+1.4, left?SZ0+.6:SZ1-.6);
      }

      stops.push({
        name:info.n,
        pos:new T.Vector3(-1.4, y, 2.2),
        look:new T.Vector3(f%2?LX:RX, y+1.2, 0),
        plaque:info.note,
        play:info.play||null,
        y:y
      });
    }

    block(.4, FLOORS.length*FH+1, .4, 0x2ee6ff, LX, 0, SZ0-.3);
    block(.4, FLOORS.length*FH+1, .4, 0x2ee6ff, RX, 0, SZ1+.3);
    stops.reverse();
    var top=(FLOORS.length-1)*FH;
    px=.2; pz=-.6; py=top+eye; lookYaw=.85; lookPitch=-.14; stopI=0;
  }

  function stepFloat(t){
    if(stairMat) stairMat.emissiveIntensity=.32+Math.sin(t*2.2)*.14;
    floaters.forEach(function(o){
      var a=o.a+t*o.sp;
      o.g.position.x=Math.cos(a)*o.r-1.2;
      o.g.position.z=Math.sin(a)*o.r*.8;
      o.g.position.y=o.base+Math.sin(t*1.3+o.a)*.22;
      o.g.rotation.y=t*.5;
    });
  }

  function onPad(x,z){
    var feet=py-eye, best=null, by=-1e9;
    for(var i=0;i<pads.length;i++){
      var p=pads[i];
      if(p.y<feet-.72||p.y>feet+.9) continue;
      if(Math.abs(x-p.x)<p.w/2 && Math.abs(z-p.z)<p.d/2 && p.y>by){ by=p.y; best=p; }
    }
    return best;
  }
  function applyLook(){
    var c=Math.cos(lookPitch);
    var dx=-Math.sin(lookYaw)*c, dy=Math.sin(lookPitch), dz=-Math.cos(lookYaw)*c;
    cam.position.set(px,py,pz);
    cam.lookAt(px+dx, py+dy, pz+dz);
  }
  function walkStep(dt){
    var spd=(keys.shift?5.4:3.15)*dt, f=0, s=0;
    if(keys.w||keys.arrowup||keys[' ']||walkOn) f+=1;
    if(keys.s||keys.arrowdown) f-=1;
    if(keys.a||keys.arrowleft) s-=1;
    if(keys.d||keys.arrowright) s+=1;
    if(!f&&!s){ applyLook(); return; }
    var nx=px+(-Math.sin(lookYaw)*f + Math.cos(lookYaw)*s)*spd;
    var nz=pz+(-Math.cos(lookYaw)*f - Math.sin(lookYaw)*s)*spd;
    var hit=onPad(nx,nz);
    if(hit){ px=nx; pz=nz; py=hit.y+eye; }
    else {
      var a=onPad(px,nz); if(a){ pz=nz; py=a.y+eye; }
      var b=onPad(nx,pz); if(b){ px=nx; py=b.y+eye; }
    }
    applyLook();
  }

  function paintHud(){
    if(!hud) return;
    var st=stops[stopI]||{};
    var name=hud.querySelector('#whName'); if(name) name.textContent='Cube Keep';
    var stop=hud.querySelector('#whStop'); if(stop) stop.textContent=st.name||'';
    var hint=hud.querySelector('#whHint'); if(hint) hint.textContent='Hold to walk · drag to look · pale stairs on both sides · Esc leaves';
    var card=hud.querySelector('#whCard');
    if(card) card.innerHTML='<b>'+(st.name||'')+'</b><p>'+(st.plaque||'')+'</p>'+(st.play?'<button type="button" data-wplay="'+st.play+'">Play on this floor</button>':'');
    var map=document.getElementById('whMap'); if(map) map.innerHTML='';
    var path=hud.querySelector('#whPath');
    if(path) path.innerHTML=stops.map(function(s,i){ return '<i class="'+(i===stopI?'on':'')+'" title="'+s.name+'"></i>'; }).join('');
  }
  function nearestStop(){
    var best=0, bd=1e9, feet=py-eye;
    for(var i=0;i<stops.length;i++){ var d=Math.abs(stops[i].y-feet); if(d<bd){ bd=d; best=i; } }
    if(best!==stopI){ stopI=best; paintHud(); }
  }
  function startRide(i){
    i=((i%stops.length)+stops.length)%stops.length;
    var to=stops[i]; if(!to) return;
    var from=new T.Vector3(px,py,pz);
    var mid=from.clone().lerp(to.pos,.5); mid.y=Math.max(from.y, to.pos.y)+2.4;
    ride={t0:performance.now(), dur:1100, curve:new T.CatmullRomCurve3([from, mid, to.pos.clone()]), to:to};
    stopI=i; paintHud(); FX('warp');
  }
  function rideStep(){
    var k=Math.min(1,(performance.now()-ride.t0)/ride.dur);
    var e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    var p=ride.curve.getPoint(e);
    px=p.x; py=p.y; pz=p.z; cam.position.copy(p);
    var L=ride.to.look; cam.lookAt(L.x,L.y,L.z);
    lookYaw=Math.atan2(-(L.x-px), -(L.z-pz));
    if(k>=1){ var land=stops[stopI]; ride=null; px=land.pos.x; py=land.pos.y+eye; pz=land.pos.z; lookYaw=.4; lookPitch=-.08; applyLook(); paintHud(); }
  }

  function boot(){
    kill();
    host=document.getElementById('worldLayer'); hud=document.getElementById('worldHud');
    if(!host||!T) return;
    renderer=new T.WebGLRenderer({antialias:!lite, alpha:false, powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1, lite?1.25:1.75));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x070b16,1);
    host.appendChild(renderer.domElement);
    scene=new T.Scene();
    cam=new T.PerspectiveCamera(62, innerWidth/innerHeight, .08, 240);
    clock=new T.Clock(); group=new T.Group(); scene.add(group);
    pads=[]; stops=[]; floaters=[]; ride=null; keys={}; walkOn=0;
    buildCube(); applyLook(); paintHud();
    running=true; loop();
    addEventListener('resize', onResize);
  }
  function onResize(){ if(!renderer||!cam) return; renderer.setSize(innerWidth,innerHeight); cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); }
  function kill(){
    running=false;
    removeEventListener('resize', onResize);
    if(renderer){ try{ renderer.dispose(); }catch(e){} if(renderer.domElement&&renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); }
    renderer=null; scene=null; cam=null; group=null;
    pads=[]; stops=[]; floaters=[]; stairMat=null;
  }
  function loop(){
    if(!running||!renderer) return;
    var dt=Math.min(clock.getDelta(), .05);
    if(ride) rideStep();
    else { walkStep(dt); nearestStop(); }
    stepFloat(clock.elapsedTime);
    renderer.render(scene,cam);
    requestAnimationFrame(loop);
  }
  function enter(){
    document.body.classList.add('in-world');
    try{ if(window.HMind&&HMind.pause) HMind.pause(true); }catch(e){}
    try{ if(window.MUWorldSeen) MUWorldSeen('cube'); }catch(e){}
    FX('warp'); toast('Cube Keep');
    boot();
  }
  function leave(){
    kill();
    document.body.classList.remove('in-world');
    try{ if(window.HMind&&HMind.pause) HMind.pause(false); }catch(e){}
    FX('zoop');
    try{ if(window.MUResumeMind) window.MUResumeMind(); }catch(e){}
  }
  function bind(){
    hud=document.getElementById('worldHud'); host=document.getElementById('worldLayer');
    if(!hud||!host||hud.dataset.keep) return;
    hud.dataset.keep='1';
    hud.addEventListener('click', function(e){
      var b=e.target.closest('button'); if(!b) return;
      if(b.id==='whExit'){ leave(); return; }
      if(b.id==='whPrev'){ startRide(stopI-1); return; }
      if(b.id==='whNext'){ startRide(stopI+1); return; }
      if(b.dataset.wplay && window.MUPlay){ leave(); setTimeout(function(){ MUPlay.open(b.dataset.wplay); }, 220); }
    });
    host.addEventListener('pointerdown', function(e){
      if(!running) return;
      drag={x:e.clientX,y:e.clientY,id:e.pointerId};
      walkOn=1;
      try{ host.setPointerCapture(e.pointerId); }catch(_){}
    });
    host.addEventListener('pointermove', function(e){
      if(!drag||e.pointerId!==drag.id) return;
      lookYaw-=(e.clientX-drag.x)*.0042;
      lookPitch=clamp(lookPitch-(e.clientY-drag.y)*.0032, -.85, .65);
      drag.x=e.clientX; drag.y=e.clientY;
    });
    ['pointerup','pointercancel'].forEach(function(n){
      host.addEventListener(n, function(e){ if(drag&&e.pointerId===drag.id){ drag=null; walkOn=0; } });
    });
    addEventListener('keydown', function(e){
      if(!running||e.target.closest('input,textarea')) return;
      var k=e.key.toLowerCase();
      if(k==='escape'){ leave(); return; }
      if(k==='q'){ startRide(stopI-1); return; }
      if(k==='e'){ startRide(stopI+1); return; }
      keys[k]=1;
    });
    addEventListener('keyup', function(e){ delete keys[e.key.toLowerCase()]; });
  }

  window.MUWorlds={enter:enter, leave:leave, bind:bind, current:function(){ return 'cube'; }, active:function(){ return running; }};
})();
