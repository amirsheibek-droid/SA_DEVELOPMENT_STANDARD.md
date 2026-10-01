/* Cube Keep — same flight as the mind.
   Drag turns you. Hold the orb (or W) to move the way you are looking.
   A and D turn. S creeps backward. The orb is the mind's hold-to-fly.
   Down a floor is the button. Looking down and holding flies you there too. */
(function(){
  var T=window.THREE;
  if(!T) return;
  var small=Math.min(innerWidth,innerHeight)<700 || innerWidth<900 || !!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
  var lite=small;
  var SC=6, FH=5.6;
  var host=null, hud=null, renderer=null, scene=null, cam=null, clock=null, running=false, group=null;
  var stops=[], stopI=0, ride=null, keys={}, drag=null, holding=0, clickables=[], bits=[], acts=[];
  var stairMat=null, dust=null, dustLines=null, pulses=[];
  var camPos=null, camLook=null, fwd=null, lookT=null, prevCam=null, camVel=0;
  /* same numbers as HMind free flight */
  var flight={yaw:Math.PI, pitch:-.22, vel:0, thrust:0, turn:0, tilt:0, max:small?140:220};
  var LOOK=140;

  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function toast(t){ try{ var el=document.getElementById('toast'); if(!el) return; el.textContent=t; el.classList.add('on'); clearTimeout(toast._t); toast._t=setTimeout(function(){ el.classList.remove('on'); },2200); }catch(e){} }
  function FX(n){ try{ window.SAFX&&SAFX[n]&&SAFX[n](); }catch(e){} }
  function ease(x){ return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2; }

  var GEOS={}, MATS={};
  function geoBox(w,h,d){ var k=w+'|'+h+'|'+d; if(!GEOS[k]) GEOS[k]=new T.BoxGeometry(w,h,d); return GEOS[k]; }
  function mat(hex, em){
    var k=hex+'|'+(em==null?0.2:em);
    if(!MATS[k]) MATS[k]=new T.MeshPhongMaterial({color:hex,emissive:hex,emissiveIntensity:em==null?0.22:em,shininess:24,specular:0x223044});
    return MATS[k];
  }
  function addBox(w,h,d,material,x,y,z,parent){
    var g=new T.Group();
    g.add(new T.Mesh(geoBox(w,h,d), material));
    g.add(new T.LineSegments(new T.EdgesGeometry(geoBox(w,h,d)), new T.LineBasicMaterial({color:0xd7f6ff,transparent:true,opacity:.45})));
    g.position.set(x, y+h/2, z);
    (parent||group).add(g);
    return g;
  }
  function block(w,h,d,hex,x,y,z,parent){
    return addBox(w*SC,h*SC,d*SC,mat(hex),x*SC,y*SC,z*SC,parent);
  }
  var GLOW=null;
  function glowTex(){
    if(GLOW) return GLOW;
    var c=document.createElement('canvas'); c.width=c.height=64; var g=c.getContext('2d');
    var gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.4,'rgba(255,255,255,.35)'); gr.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=gr; g.fillRect(0,0,64,64); GLOW=new T.CanvasTexture(c); return GLOW;
  }
  function glow(hex,s,x,y,z){
    var sp=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:hex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
    sp.scale.set(s*SC,s*SC,1); sp.position.set(x*SC,y*SC,z*SC); group.add(sp); return sp;
  }
  function sign(text, hex, x, y, z){
    var c=document.createElement('canvas'); c.width=512; c.height=128; var g=c.getContext('2d');
    g.font='700 68px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle=hex; g.fillText(text, 256, 68);
    var sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));
    sp.scale.set(3.2*SC,.8*SC,1); sp.position.set(x*SC,y*SC,z*SC); group.add(sp); return sp;
  }
  function tag(obj, fn){
    obj.traverse(function(c){ c.userData.poke=fn; if(c.isMesh) clickables.push(c); });
  }
  var actx=null;
  function beep(freq, dur, type, gain){
    try{
      var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
      actx=actx||new AC(); if(actx.state==='suspended') actx.resume();
      var o=actx.createOscillator(), g=actx.createGain(), t0=actx.currentTime;
      o.type=type||'sine'; o.frequency.value=freq;
      g.gain.setValueAtTime(gain==null?.07:gain, t0);
      g.gain.exponentialRampToValueAtTime(.001, t0+(dur||.18));
      o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0+(dur||.18));
    }catch(e){}
  }
  function burst(x,y,z,hex,n){
    for(var i=0;i<(lite?Math.ceil(n/2):n);i++){
      var m=block(.22,.22,.22,hex,x,y,z);
      bits.push({m:m, v:new T.Vector3((Math.random()-.5)*18, 8+Math.random()*16, (Math.random()-.5)*18), life:1.5+Math.random()});
    }
  }
  function setBlurb(t){
    var p=hud&&hud.querySelector('#whBlurb');
    if(p && p.textContent!==t) p.textContent=t;
  }

  var FZ0=-6.2, FZ1=6.2, SZ0=-4.45, SZ1=4.45, LX=-4.85, RX=4.85, SW=3.35;
  var FLOORS=[
    {n:'The Door That Isn\'t', line:'It opens. Then it disagrees.', col:0x4f7dff, css:'#9eb6ff'},
    {n:'The Eager Ones', line:'They want to impress you. It goes badly.', col:0x7ec8ff, css:'#d7f3ff'},
    {n:'Tantrum Cannon', line:'A cube with a grudge and terrible aim.', col:0xff4fa8, css:'#ffd0e8'},
    {n:'Honk Cathedral', line:'Six cubes. One awful song. You are the composer.', col:0xff8a3d, css:'#ffd7bf'},
    {n:'Sir Loaf', line:'A cube that believes it is a cat.', col:0xc9a6ff, css:'#efe4ff'},
    {n:'The Liars', line:'One of them is tallest. The others are lying about it.', col:0xffc44d, css:'#ffe7b0'},
    {n:'Conduct the Sky', line:'Tap a cube. The sky falls, politely.', col:0xf4f7ff, css:'#ffffff'}
  ];

  function floorMesh(y){
    var slab=0x10182a, h=.5;
    block(5.8, h, 4.6, slab, 0, y-h, 3.9);
    block(5.8, h, 4.6, slab, 0, y-h, -3.9);
    block(1.3, h, 3.2, slab, 2.25, y-h, 0);
    block(1.3, h, 3.2, slab, -2.25, y-h, 0);
    block(5.8, h, SZ0-FZ0, slab, LX, y-h, (FZ0+SZ0)/2);
    block(5.8, h, FZ1-SZ1, slab, LX, y-h, (SZ1+FZ1)/2);
    block(5.8, h, SZ0-FZ0, slab, RX, y-h, (FZ0+SZ0)/2);
    block(5.8, h, FZ1-SZ1, slab, RX, y-h, (SZ1+FZ1)/2);
  }

  function buildAct(f, y, hex){
    if(f===6) return actConduct(y, hex);
    if(f===5) return actLiar(y, hex);
    if(f===4) return actLoaf(y, hex);
    if(f===3) return actHonk(y, hex);
    if(f===2) return actCannon(y, hex);
    if(f===1) return actEager(y, hex);
    return actDoor(y, hex);
  }

  function actConduct(y, hex){
    var orbs=[], dir=1, n=lite?6:9;
    for(var k=0;k<n;k++){
      var g=block(.7,.7,.7, k%2?0xffffff:hex, 0, y+2.2, 0);
      orbs.push({g:g, a:k/n*Math.PI*2, r:1.6+(k%3)*.45});
      tag(g, poke);
    }
    function poke(){
      dir*=-1;
      beep(392,.12,'triangle'); beep(523,.16,'sine'); beep(659,.22,'sine');
      orbs.forEach(function(o){ burst(o.g.position.x/SC, o.g.position.y/SC, o.g.position.z/SC, hex, 4); });
      setBlurb(dir<0?'The sky changed its mind.':'They are falling. Look down and fly through them.');
      FX('warp');
    }
    return {poke:poke, status:function(){ return 'Tap any cube in the ring.'; }, tick:function(t){
      orbs.forEach(function(o){
        var a=o.a+t*dir*(.35+o.r*.05);
        o.g.position.x=Math.cos(a)*o.r*SC;
        o.g.position.z=Math.sin(a)*o.r*SC*.85;
        o.g.position.y=(y+2.4)*SC+Math.sin(t*1.4+o.a)*SC*.35;
        o.g.rotation.y=t*.6*dir;
      });
    }};
  }

  function actLiar(y, hex){
    var cubes=[], caught=0;
    for(var i=0;i<5;i++){
      var h=.45+((i*3)%5)*.28;
      var g=block(.7,h,.7, i%2?0xffffff:hex, -1.6+i*.8, y, 2.6);
      cubes.push({g:g, h:h, i:i});
      tag(g, (function(ix){ return function(){ poke(ix); }; })(i));
    }
    function tallest(){ var b=0; cubes.forEach(function(c,i){ if(c.h>cubes[b].h) b=i; }); return b; }
    function poke(i){
      if(i===tallest()){
        caught++; beep(680,.14,'triangle');
        cubes.forEach(function(c){ c.h=.4+Math.random()*1.3; });
        setBlurb('Caught '+caught+'. They reshuffled. The tall one is lying again.');
        FX('zoop');
      } else {
        beep(120,.16,'square',.05);
        cubes[tallest()].h+=.25;
        setBlurb('Nope. That one is short and knows it.');
      }
    }
    return {poke:function(){ poke(tallest()); }, status:function(){ return 'Tap the tallest cube. Caught '+caught+'.'; }, tick:function(){
      cubes.forEach(function(c){
        var s=c.h/(.45+4*.28);
        c.g.scale.y+=(s-c.g.scale.y)*.2;
      });
    }};
  }

  function actLoaf(y, hex){
    var root=new T.Group(); root.position.set(0, y*SC, 2.5*SC); group.add(root);
    var body=block(1.5,.9,1.1, hex, 0, 0, 0, root);
    block(.28,.28,.28, 0xffffff, -.35, .9, .35, root);
    block(.28,.28,.28, 0xffffff, .35, .9, .35, root);
    var tail=block(.7,.22,.22, 0xffffff, 0, .4, -.7, root);
    tag(root, poke);
    var kits=[], pets=0, roll=0;
    function poke(){
      pets++; roll=1; beep(180,.25,'sine',.06);
      if(pets%3===0 && kits.length<4){
        var k=block(.38,.38,.38, 0xffffff, 0, y+1.2, 2.5);
        kits.push({g:k, a:Math.random()*6});
        setBlurb('Sir Loaf sneezed a kitten. There are '+kits.length+'.');
      } else if(kits.length>=4){
        kits.forEach(function(k){ burst(k.g.position.x/SC, k.g.position.y/SC, k.g.position.z/SC, 0xc9a6ff, 3); group.remove(k.g); });
        kits=[]; pets=0; setBlurb('Too many. They popped. Sir Loaf is an only cube again.');
      } else setBlurb('Prrt. Pet '+(3-(pets%3))+' more for a kitten.');
    }
    return {poke:poke, status:function(){ return 'Pet the cube-cat.'; }, tick:function(t,dt){
      roll=Math.max(0, roll-dt);
      root.rotation.z=Math.sin(roll*8)*.5;
      tail.rotation.z=Math.sin(t*3)*.4;
      root.position.y=y*SC+Math.sin(t*1.5)*SC*.08;
      kits.forEach(function(k){
        k.a+=dt*1.4;
        k.g.position.x=Math.cos(k.a)*2.2*SC;
        k.g.position.z=2.5*SC+Math.sin(k.a)*1.4*SC;
        k.g.position.y=(y+1.3)*SC+Math.sin(t*2+k.a)*SC*.2;
      });
    }};
  }

  function actHonk(y, hex){
    var notes=[262,311,349,392,466,523], cubes=[], loop=[], clockN=0, last=-1;
    for(var i=0;i<6;i++){
      var g=block(.62,.5+i*.08,.62, i%2?0xffffff:hex, -2+i*.8, y, 2.5);
      cubes.push(g);
      tag(g, (function(ix){ return function(){ add(ix); }; })(i));
    }
    var clear=block(.5,.5,.5, 0xff4f6d, 2.6, y, 2.5);
    tag(clear, function(){ loop=[]; last=-1; beep(90,.1,'square',.04); setBlurb('Song deleted. The cubes look relieved.'); });
    function add(i){
      beep(notes[i],.16, i%2?'square':'triangle',.06);
      cubes[i].position.y=(y*SC)+(.5+i*.08)*SC*.5+SC*.4;
      if(loop.length>7) loop.shift();
      loop.push(i);
      setBlurb('Loop of '+loop.length+'. The red cube forgets it.');
    }
    return {poke:function(){ add(0); }, status:function(){ return 'Tap the cubes. They remember.'; }, tick:function(t,dt){
      cubes.forEach(function(g,i){ var rest=(y*SC)+(.25+i*.04)*SC; g.position.y+=(rest-g.position.y)*Math.min(1,dt*6); });
      if(!loop.length || !stops[stopI] || stops[stopI].name!=='Honk Cathedral') return;
      clockN+=dt;
      var step=.32, i=Math.floor(clockN/step)%loop.length;
      if(i!==last){ last=i; var n=loop[i]; beep(notes[n],.12, n%2?'square':'sine',.045); cubes[n].position.y+=SC*.35; }
    }};
  }

  function actCannon(y, hex){
    var gun=block(.9,.7,1.3, hex, -2.2, y, 2.4);
    var targets=[], shots=[], hits=0;
    for(var i=0;i<4;i++){
      var g=block(.55,.7,.55, i%2?0xffffff:0xff4fa8, -0.4+i*.7, y, 3.1);
      targets.push({g:g, home:g.position.clone(), hop:0});
    }
    tag(gun, fire);
    function fire(){
      var t=targets[(Math.random()*targets.length)|0];
      var m=block(.28,.28,.28, 0xffffff, -2.2, y+.8, 2.4);
      var dest=t.g.position.clone();
      shots.push({m:m, to:dest, tgt:t, life:1.2});
      beep(220,.08,'square',.05);
      setBlurb('Fired. They are taking this personally.');
    }
    return {poke:fire, status:function(){ return 'Tap the cannon. Hits '+hits+'.'; }, tick:function(t,dt){
      for(var i=shots.length-1;i>=0;i--){
        var s=shots[i]; s.life-=dt;
        s.m.position.lerp(s.to, Math.min(1, dt*4));
        s.m.rotation.y+=dt*6;
        if(s.m.position.distanceTo(s.to)<SC*.4 || s.life<=0){
          s.tgt.hop=1; hits++;
          beep(480,.1,'square',.05);
          burst(s.to.x/SC, s.to.y/SC, s.to.z/SC, 0xff4fa8, 5);
          group.remove(s.m); shots.splice(i,1);
          if(hits%4===0) setBlurb('They unionised, then forgave you. Fire again.');
        }
      }
      targets.forEach(function(tg){
        tg.hop=Math.max(0, tg.hop-dt);
        var bob=Math.sin(tg.hop*14)*SC*.45;
        tg.g.position.y=tg.home.y+bob;
      });
    }};
  }

  function actEager(y, hex){
    var row=[], phase='home', pt=0;
    for(var i=0;i<6;i++){
      var g=block(.5,.4+i*.06,.5, i%2?0xffffff:hex, -1.8+i*.7, y, 2.6);
      row.push({g:g, home:g.position.clone()});
    }
    function poke(){
      if(phase==='rush'){ phase='panic'; pt=0; beep(160,.1,'square',.05); setBlurb('Too much. They scattered.'); }
      else { phase='rush'; pt=0; beep(520,.08,'triangle',.05); setBlurb('They are coming. Stand your ground. Or fly away.'); }
    }
    row.forEach(function(r){ tag(r.g, poke); });
    return {poke:poke, status:function(){ return 'Tap them. They try their best.'; }, tick:function(t,dt){
      pt+=dt;
      row.forEach(function(r,i){
        var goal=r.home;
        if(phase==='rush'){
          var dx=camPos.x-r.home.x, dz=camPos.z-r.home.z, len=Math.hypot(dx,dz)||1;
          goal={x:camPos.x-dx/len*SC*1.6, y:r.home.y, z:camPos.z-dz/len*SC*1.6};
          if(pt>1.1){ phase='bow'; pt=0; }
        } else if(phase==='panic'){
          goal={x:r.home.x+Math.sin(i+pt*4)*SC*1.4, y:r.home.y+SC*(.4+Math.sin(pt*6+i)*.3), z:r.home.z+Math.cos(i*2+pt*3)*SC};
          if(pt>1.3) phase='home';
        } else if(phase==='bow'){
          r.g.rotation.x=Math.sin(pt*6)*.6;
          if(pt>.6){ phase='home'; r.g.rotation.x=0; setBlurb('They bowed. It was a lot for them.'); }
        }
        if(phase!=='bow'){
          r.g.position.x+=(goal.x-r.g.position.x)*Math.min(1, dt*(phase==='rush'?3:2));
          r.g.position.y+=(goal.y-r.g.position.y)*Math.min(1, dt*3);
          r.g.position.z+=(goal.z-r.g.position.z)*Math.min(1, dt*(phase==='rush'?3:2));
        }
      });
    }};
  }

  function actDoor(y, hex){
    var shells=[], open=0, wave=null;
    for(var i=0;i<5;i++){
      var w=2.1-i*.32;
      var L=block(w*.5, w, .28, i%2?0xffffff:hex, -.05, y, 2.55+i*.08);
      var R=block(w*.5, w, .28, i%2?0xffffff:hex, .05, y, 2.55+i*.08);
      shells.push({L:L, R:R, w:w, homeL:L.position.x, homeR:R.position.x});
      tag(L, poke); tag(R, poke);
    }
    var label=sign('COME IN', '#d7e4ff', 0, y+2.6, 2.7);
    function poke(){
      if(open<5){
        open++; beep(300+open*40,.1,'triangle',.05);
        setBlurb(open<5?'Shell '+open+' of 5. It is still a door.':'The last cube is waving. Tap again.');
        if(open===5 && !wave){ wave=block(.3,.3,.3, 0xffffff, 0, y+.4, 2.7); }
      } else {
        open=0; beep(90,.2,'square',.05);
        if(wave){ group.remove(wave); wave=null; }
        setBlurb('Nope.');
        label.material.color.set('#ff8a9a');
      }
      if(open>0) label.material.color.set('#d7e4ff');
    }
    return {poke:poke, status:function(){ return open?'Shell '+open+' of 5.':'Tap the door.'; }, tick:function(t,dt){
      shells.forEach(function(s,i){
        var gap=i<open?(1.1+i*.15)*SC:0;
        s.L.position.x+=(s.homeL-gap-s.L.position.x)*Math.min(1, dt*5);
        s.R.position.x+=(s.homeR+gap-s.R.position.x)*Math.min(1, dt*5);
      });
      if(wave) wave.rotation.y=Math.sin(t*4)*.8;
    }};
  }

  function makeDust(){
    var n=lite?40:90, pos=new Float32Array(n*6);
    dust=new Array(n);
    for(var i=0;i<n;i++) dust[i]={x:(Math.random()-.5)*40, y:(Math.random()-.5)*24, z:-4-Math.random()*80};
    var geo=new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(pos,3));
    dustLines=new T.LineSegments(geo, new T.LineBasicMaterial({color:0xd5e6ff,transparent:true,opacity:.28}));
    scene.add(dustLines);
  }
  function tickDust(dt){
    if(!dustLines) return;
    var sp=8+Math.abs(flight.vel)*.45;
    var pos=dustLines.geometry.attributes.position.array;
    var len=.8+Math.abs(flight.vel)*.02;
    for(var i=0;i<dust.length;i++){
      var d=dust[i]; d.z+=sp*dt;
      if(d.z>6){ d.z=-90; d.x=(Math.random()-.5)*48; d.y=(Math.random()-.5)*28; }
      var o=i*6;
      pos[o]=d.x; pos[o+1]=d.y; pos[o+2]=d.z;
      pos[o+3]=d.x; pos[o+4]=d.y; pos[o+5]=d.z-len;
    }
    dustLines.geometry.attributes.position.needsUpdate=true;
    dustLines.position.copy(cam.position);
    dustLines.quaternion.copy(cam.quaternion);
    dustLines.material.opacity=Math.min(.7, .16+camVel*.004);
  }

  function buildCube(){
    scene.fog=new T.Fog(0x03040a, 40, 520);
    scene.background=new T.Color(0x03040a);
    group.add(new T.HemisphereLight(0xb7c6e4, 0x0b1018, .8));
    var sun=new T.DirectionalLight(0xfff4dc, .9); sun.position.set(40, 80, 24); group.add(sun);
    var fill=new T.DirectionalLight(0x6e86ff, .28); fill.position.set(-30, 20, -16); group.add(fill);

    var nStars=lite?80:240, sp=new Float32Array(nStars*3);
    for(var i=0;i<nStars;i++){ sp[i*3]=(Math.random()-.5)*220; sp[i*3+1]=Math.random()*260; sp[i*3+2]=(Math.random()-.5)*220; }
    var sg=new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp,3));
    group.add(new T.Points(sg, new T.PointsMaterial({color:0xffffff,size:1.1,transparent:true,opacity:.75,depthWrite:false,sizeAttenuation:true})));
    makeDust();

    stairMat=new T.MeshPhongMaterial({color:0xe7f3ff,emissive:0x9fd4ff,emissiveIntensity:.45,shininess:40,specular:0x88aacc});
    var run=(SZ1-SZ0)/10, tread=run+.5;
    for(var f=0;f<FLOORS.length;f++){
      var y=f*FH, info=FLOORS[f], hex=info.col;
      floorMesh(y);
      var lamp=new T.PointLight(hex, 1.3, 90); lamp.position.set(-2*SC, (y+3)*SC, 2*SC); group.add(lamp);
      glow(hex, 2.4, 0, y+2.2, 2.4);
      sign(info.n, info.css, 0, y+3.3, 2.2);
      [-1.2,0,1.2].forEach(function(p){
        block(.55, f===6?.35:.9, .55, hex, p, y, FZ0+.55);
        block(.55, f===6?.35:.9, .55, hex, p, y, FZ1-.55);
      });
      if(f<FLOORS.length-1){
        var left=f%2===1, sx=left?LX:RX;
        for(var st=0;st<10;st++){
          var sy=y+st*(FH/10);
          var sz=left?(SZ1-run*(st+.5)):(SZ0+run*(st+.5));
          addBox(SW*SC, (FH/10)*SC*.94, tread*SC, stairMat, sx*SC, sy*SC, sz*SC);
        }
        glow(0xbfe6ff, 1.1, sx, y+FH*.5, left?SZ0+1:SZ1-1);
      }
      var act=buildAct(f, y, hex);
      acts.push(act);
      stops.push({
        name:info.n, line:info.line, y:y*SC, act:act,
        pos:new T.Vector3(0, y*SC+14, -3.4*SC),
        yaw:Math.PI
      });
    }
    block(.35, FLOORS.length*FH+2, .35, 0x2ee6ff, LX, 0, 0);
    block(.35, FLOORS.length*FH+2, .35, 0x2ee6ff, RX, 0, 0);
    for(var p=0;p<8;p++){
      var s=glow(p%2?0x2ee6ff:0xffc44d, .7, (p%2?-.6:.6), 0, (p%3)*.4);
      pulses.push({s:s, sp:18+p*3, off:p*24});
    }
    stops.reverse();
    acts.reverse();
    var top=(FLOORS.length-1)*FH*SC;
    camPos=new T.Vector3(0, top+16, -3.4*SC);
    flight.yaw=Math.PI; flight.pitch=-.24; flight.vel=0; flight.thrust=0; flight.turn=0;
    fwd=new T.Vector3(); lookT=new T.Vector3(); camLook=new T.Vector3(); prevCam=camPos.clone();
    aim();
    camLook.copy(camPos).addScaledVector(fwd, LOOK);
    stopI=0;
  }

  function aim(){
    var c=Math.cos(flight.pitch);
    fwd.set(-Math.sin(flight.yaw)*c, Math.sin(flight.pitch), -Math.cos(flight.yaw)*c);
  }
  function contain(dt){
    var x=clamp(camPos.x,-52,52), z=clamp(camPos.z,-52,52);
    var y=clamp(camPos.y, -8, (FLOORS.length-1)*FH*SC+48);
    var k=Math.min(1, dt*2.2);
    camPos.x+=(x-camPos.x)*k; camPos.y+=(y-camPos.y)*k; camPos.z+=(z-camPos.z)*k;
  }
  /* HMind.freeStep, same curve, same look lag */
  function flyStep(dt){
    var f=flight;
    f.yaw+=f.turn*dt*1.3;
    f.pitch=clamp(f.pitch+f.tilt*dt*.9, -1.25, 1.25);
    f.vel+=(f.thrust*f.max-f.vel)*Math.min(1, dt*(f.thrust?1.5:2.2));
    aim();
    camPos.addScaledVector(fwd, f.vel*dt);
    contain(dt);
    lookT.copy(camPos).addScaledVector(fwd, LOOK);
    camLook.lerp(lookT, Math.min(1, dt*3.5));
    cam.position.copy(camPos);
    cam.lookAt(camLook);
  }
  function tickBits(dt){
    for(var i=bits.length-1;i>=0;i--){
      var b=bits[i]; b.life-=dt; b.v.y-=dt*22;
      b.m.position.addScaledVector(b.v, dt);
      b.m.rotation.y+=dt*3;
      if(b.life<=0){ group.remove(b.m); bits.splice(i,1); }
    }
  }
  function tickWorld(t, dt){
    if(stairMat) stairMat.emissiveIntensity=.3+Math.sin(t*2.1)*.16;
    var H=FLOORS.length*FH*SC+10;
    pulses.forEach(function(p){ p.s.position.y=(t*p.sp+p.off)%H; });
    for(var i=0;i<acts.length;i++) if(acts[i]&&acts[i].tick) acts[i].tick(t, dt);
    tickBits(dt);
  }

  function paintHud(){
    if(!hud) return;
    var st=stops[stopI]||{};
    var name=hud.querySelector('#whName'); if(name) name.textContent='Cube Keep';
    var stop=hud.querySelector('#whStop'); if(stop) stop.textContent=st.name||'';
    var hint=hud.querySelector('#whHint'); if(hint) hint.textContent='Drag to turn · hold the orb or W to move · A D turn · Down a floor';
    var card=hud.querySelector('#whCard');
    if(card){
      var bl=st.act&&st.act.status?st.act.status():(st.line||'');
      card.innerHTML='<b>'+(st.name||'')+'</b><p id="whBlurb">'+(st.line||'')+'</p><p id="whState">'+bl+'</p><button type="button" data-poke>Poke it</button>';
    }
    var map=document.getElementById('whMap'); if(map) map.innerHTML='';
    var path=hud.querySelector('#whPath');
    if(path) path.innerHTML=stops.map(function(s,i){ return '<button type="button" data-floor="'+i+'" class="'+(i===stopI?'on':'')+'" title="'+s.name+'"></button>'; }).join('');
  }
  function nearestStop(){
    if(ride) return;
    var best=0, bd=1e9;
    for(var i=0;i<stops.length;i++){ var d=Math.abs(stops[i].y+10-camPos.y); if(d<bd){ bd=d; best=i; } }
    if(best!==stopI){ stopI=best; paintHud(); }
  }
  function startRide(i){
    var to=stops[i]; if(!to||!camPos) return;
    var dest=to.pos.clone();
    var mid=new T.Vector3(0, (camPos.y+dest.y)*.5, 0);
    ride={t0:performance.now(), dur:1100+Math.min(900, Math.abs(dest.y-camPos.y)*6), curve:new T.CatmullRomCurve3([camPos.clone(), mid, dest]), to:to, yaw:to.yaw};
    stopI=i; flight.vel=0; paintHud(); FX('warp');
  }
  function goFloor(i){
    if(i<0){ toast('You are at the top'); return; }
    if(i>=stops.length){ toast('You are at the bottom'); return; }
    startRide(i);
  }
  function rideStep(){
    var k=Math.min(1,(performance.now()-ride.t0)/ride.dur), e=ease(k);
    ride.curve.getPoint(e, camPos);
    ride.curve.getPoint(Math.min(1, e+.06), lookT);
    camLook.lerp(lookT, .45);
    cam.position.copy(camPos);
    cam.lookAt(camLook);
    if(k>=1){
      var land=ride.to;
      camPos.copy(land.pos);
      flight.yaw=land.yaw; flight.pitch=-.22; flight.vel=0;
      aim();
      camLook.copy(camPos).addScaledVector(fwd, LOOK);
      ride=null; paintHud();
    }
  }
  function pokeHere(){
    var st=stops[stopI]; if(st&&st.act&&st.act.poke) st.act.poke();
  }
  function pokeAt(cx, cy){
    if(!cam) return false;
    var ndc=new T.Vector2((cx/innerWidth)*2-1, -(cy/innerHeight)*2+1);
    var ray=new T.Raycaster(); ray.setFromCamera(ndc, cam);
    var hits=ray.intersectObjects(clickables, false);
    if(!hits.length) return false;
    var fn=hits[0].object.userData.poke;
    if(fn){ fn(); return true; }
    return false;
  }
  function lookBy(dx, dy){
    var k=small?.008:.005;
    flight.yaw-=dx*k;
    flight.pitch=clamp(flight.pitch-dy*k*.8, -1.25, 1.25);
  }
  function syncKeys(){
    var f=(keys.w||keys.arrowup||keys[' '])?1:((keys.s||keys.arrowdown)?-.45:0);
    if(!holding) flight.thrust=f;
    flight.turn=(keys.a||keys.arrowleft)?1:((keys.d||keys.arrowright)?-1:0);
    var b=document.getElementById('whFly'); if(b) b.classList.toggle('on', flight.thrust>0);
  }

  function boot(){
    kill();
    host=document.getElementById('worldLayer'); hud=document.getElementById('worldHud');
    if(!host||!T) return;
    renderer=new T.WebGLRenderer({antialias:!lite, alpha:false, powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1, lite?1.25:1.6));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x03040a, 1);
    host.appendChild(renderer.domElement);
    scene=new T.Scene();
    cam=new T.PerspectiveCamera(58, innerWidth/innerHeight, .1, 4000);
    clock=new T.Clock(); group=new T.Group(); scene.add(group);
    stops=[]; acts=[]; clickables=[]; bits=[]; pulses=[]; ride=null; keys={}; holding=0; camVel=0;
    buildCube();
    cam.position.copy(camPos); cam.lookAt(camLook);
    paintHud();
    running=true; loop();
    addEventListener('resize', onResize);
  }
  function onResize(){ if(!renderer||!cam) return; renderer.setSize(innerWidth,innerHeight); cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); }
  function kill(){
    running=false;
    removeEventListener('resize', onResize);
    if(renderer){ try{ renderer.dispose(); }catch(e){} if(renderer.domElement&&renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); }
    renderer=null; scene=null; cam=null; group=null;
    stops=[]; acts=[]; clickables=[]; bits=[]; pulses=[]; dustLines=null; stairMat=null;
  }
  function loop(){
    if(!running||!renderer) return;
    var dt=Math.min(clock.getDelta(), .05), t=clock.elapsedTime;
    if(ride) rideStep();
    else flyStep(dt);
    camVel=camVel*.85+(prevCam.distanceTo(camPos)/Math.max(dt,.001))*.15;
    prevCam.copy(camPos);
    tickWorld(t, dt);
    tickDust(dt);
    nearestStop();
    renderer.render(scene, cam);
    requestAnimationFrame(loop);
  }
  function enter(){
    document.body.classList.add('in-world');
    try{ if(window.HMind&&HMind.pause) HMind.pause(true); }catch(e){}
    try{ if(window.MUWorldSeen) MUWorldSeen('cube'); }catch(e){}
    FX('warp'); toast('Drag to turn. Hold to fly.');
    boot();
  }
  function leave(){
    kill();
    document.body.classList.remove('in-world');
    holding=0; flight.thrust=0; flight.turn=0;
    var b=document.getElementById('whFly'); if(b) b.classList.remove('on');
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
      if(b.id==='whPrev'){ goFloor(stopI-1); return; }
      if(b.id==='whNext'){ goFloor(stopI+1); return; }
      if(b.dataset.floor!=null){ goFloor(+b.dataset.floor); return; }
      if(b.dataset.poke!=null){ pokeHere(); return; }
    });
    var flyBtn=document.getElementById('whFly');
    if(flyBtn){
      flyBtn.addEventListener('pointerdown', function(e){
        e.preventDefault(); e.stopPropagation();
        try{ flyBtn.setPointerCapture(e.pointerId); }catch(_){}
        holding=1; flight.thrust=1; flyBtn.classList.add('on');
      });
      ['pointerup','pointercancel','lostpointercapture'].forEach(function(n){
        flyBtn.addEventListener(n, function(){ holding=0; syncKeys(); });
      });
    }
    host.addEventListener('pointerdown', function(e){
      if(!running) return;
      drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:Date.now(),id:e.pointerId};
      try{ host.setPointerCapture(e.pointerId); }catch(_){}
    });
    host.addEventListener('pointermove', function(e){
      if(!drag||e.pointerId!==drag.id) return;
      lookBy(e.clientX-drag.x, e.clientY-drag.y);
      drag.x=e.clientX; drag.y=e.clientY;
    });
    ['pointerup','pointercancel'].forEach(function(n){
      host.addEventListener(n, function(e){
        if(!drag||e.pointerId!==drag.id) return;
        var tap=n==='pointerup' && Math.hypot(e.clientX-drag.sx, e.clientY-drag.sy)<10 && Date.now()-drag.t<350;
        var x=e.clientX, y=e.clientY;
        drag=null;
        if(tap) pokeAt(x, y);
      });
    });
    addEventListener('keydown', function(e){
      if(!running||e.target.closest('input,textarea')) return;
      var k=e.key.toLowerCase();
      if(k==='escape'){ leave(); return; }
      if(['w','a','s','d',' ','arrowup','arrowdown','arrowleft','arrowright'].indexOf(k)<0) return;
      e.preventDefault(); keys[k]=1; syncKeys();
    });
    addEventListener('keyup', function(e){
      var k=e.key.toLowerCase();
      if(keys[k]){ delete keys[k]; if(running) syncKeys(); }
    });
    addEventListener('wheel', function(e){
      if(!running||ride) return;
      flight.vel=Math.max(-80, Math.min(flight.max*1.4, flight.vel+(-e.deltaY*.06)));
    }, {passive:true});
  }

  window.MUWorlds={enter:enter, leave:leave, bind:bind, current:function(){ return 'cube'; }, active:function(){ return running; }};
})();
