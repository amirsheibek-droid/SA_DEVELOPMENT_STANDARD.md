/* Cube Keep — built like the mind.
   Destinations in space. Axons between them. Drag to look. Hold to fly.
   Each floor is a cube-neuron with real things hanging around it. */
(function(){
  var T=window.THREE;
  if(!T) return;
  var small=Math.min(innerWidth,innerHeight)<700 || innerWidth<900 || !!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
  var lite=small, ADD=T.AdditiveBlending;
  var host=null, hud=null, renderer=null, scene=null, cam=null, clock=null, running=false, group=null;
  var D={}, DESTS=[], axons=[], tvList=[], boards=[], rings=[], bits=[], floaters=[];
  var keys={}, drag=null, holding=0, ride=null, cur='sky', stopI=0, nearId=null;
  var camPos, camLook, prevCam, fwd, tmpA, tmpB, camVel=0;
  var flight=null, CENTER, BOUND=2400;
  var LOOK=140;

  function V(x,y,z){ return new T.Vector3(x,y,z); }
  function rnd(a,b){ return a+Math.random()*(b-a); }
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function ease(x){ return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2; }
  function toast(t){ try{ var el=document.getElementById('toast'); if(!el) return; el.textContent=t; el.classList.add('on'); clearTimeout(toast._t); toast._t=setTimeout(function(){ el.classList.remove('on'); },2400); }catch(e){} }
  function FX(n){ try{ window.SAFX&&SAFX[n]&&SAFX[n](); }catch(e){} }
  function mindSave(){ try{ return JSON.parse(localStorage.getItem('mindu.v1')||'{}'); }catch(e){ return {}; } }

  function dotTex(inner, outer){
    var c=document.createElement('canvas'); c.width=c.height=64; var g=c.getContext('2d');
    var gr=g.createRadialGradient(32,32,2,32,32,32);
    gr.addColorStop(0,inner); gr.addColorStop(1,outer);
    g.fillStyle=gr; g.fillRect(0,0,64,64); return new T.CanvasTexture(c);
  }
  var glowW=null, glowC=null;
  function glowMap(hex){
    if(hex===0x2ee6ff){ if(!glowC) glowC=dotTex('rgba(46,230,255,1)','rgba(46,230,255,0)'); return glowC; }
    if(!glowW) glowW=dotTex('rgba(255,255,255,1)','rgba(255,255,255,0)'); return glowW;
  }

  /* ── the map of the keep: destinations, the way the mind has neurons ── */
  var FLOORS=[
    {id:'gate', name:'The Gate', col:'#4f7dff', pos:[0,0,0], yaw:0, dist:52, scale:1.35, hint:'the way back to your mind'},
    {id:'course', name:'The Course', col:'#7ec8ff', pos:[8,78,-18], yaw:.4, dist:48, scale:1.15, hint:'fly through the rings'},
    {id:'garden', name:'Night Garden', col:'#19f0b0', pos:[-22,156,12], yaw:-.35, dist:46, scale:1.2, play:'garden', hint:'a living floor you can tend'},
    {id:'arcade', name:'The Arcade', col:'#ff8a3d', pos:[18,234,-8], yaw:.2, dist:50, scale:1.25, hint:'real games on hanging screens'},
    {id:'sage', name:'The Sage Floor', col:'#ffc44d', pos:[-14,312,16], yaw:-.25, dist:48, scale:1.2, hint:'sayings that already live in this mind'},
    {id:'memory', name:'Your Week', col:'#ff4fa8', pos:[16,390,-14], yaw:.3, dist:50, scale:1.2, hint:'this week of moods, hanging in space'},
    {id:'sky', name:'Observatory', col:'#f4f7ff', pos:[0,468,0], yaw:0, dist:56, scale:1.45, hint:'named stars, and a moon you can tap'}
  ];
  var LINKS=[['sky','memory'],['memory','sage'],['sage','arcade'],['arcade','garden'],['garden','course'],['course','gate']];
  var GAMES=[
    {id:'cube', n:'Star roll', c:'#2ee6ff'},
    {id:'ball', n:'Balance ball', c:'#19f0b0'},
    {id:'merge', n:'Merge', c:'#ffc44d'},
    {id:'pet', n:'Light companion', c:'#cfd6ff'},
    {id:'pulse', n:'Heartbeat', c:'#ff6bd6'},
    {id:'jewels', n:'Jewel drift', c:'#ff4fa8'}
  ];
  var STARS=[
    {n:'Sirius', f:'The brightest star we see. Eight light-years away.'},
    {n:'Vega', f:'The summer diamond. Earth is flying toward it.'},
    {n:'Betelgeuse', f:'A red giant in Orion. It will one day become a supernova.'},
    {n:'Polaris', f:'The north star. Ships used it when the sea had no lights.'},
    {n:'Rigel', f:'A blue-white sun in Orion’s foot. Forty thousand times our sun.'},
    {n:'Altair', f:'Close, fast, and part of the Summer Triangle.'},
    {n:'Deneb', f:'So far that its light left when woolly mammoths were here.'},
    {n:'Antares', f:'The heart of the Scorpion. A red sun you could fit our sun inside a thousand times.'}
  ];

  function cubeCore(col, scale){
    var g=new T.Group(), s=(scale||1)*2.4;
    var mesh=new T.Mesh(new T.BoxGeometry(s,s,s), new T.MeshPhongMaterial({color:col,emissive:col,emissiveIntensity:.35,shininess:30}));
    var edge=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(s,s,s)), new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.7}));
    var halo=new T.Sprite(new T.SpriteMaterial({map:glowMap(0xffffff),color:col,transparent:true,depthWrite:false,blending:ADD,opacity:.7}));
    halo.scale.set(s*6.5,s*6.5,1);
    var ring=new T.Mesh(new T.TorusGeometry(s*1.7, .06, 8, lite?20:40), new T.MeshBasicMaterial({color:col,transparent:true,opacity:.55,blending:ADD,depthWrite:false}));
    var ring2=new T.Mesh(new T.TorusGeometry(s*2.3, .04, 8, lite?16:32), new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.28,blending:ADD,depthWrite:false}));
    g.add(mesh, edge, halo, ring, ring2);
    g.userData={mesh:mesh,halo:halo,ring:ring,ring2:ring2};
    return g;
  }

  function addBillboard(id, src, w, h, off){
    var d=D[id]; if(!d) return null;
    var tex=src.tagName==='CANVAS'?new T.CanvasTexture(src):new T.Texture(src);
    tex.needsUpdate=true;
    var sp=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));
    sp.scale.set(w,h,1);
    sp.position.copy(d.v).add(V(off[0],off[1],off[2]));
    group.add(sp);
    var rec={sprite:sp,tex:tex,update:function(){ tex.needsUpdate=true; },remove:function(){ group.remove(sp); tex.dispose(); }};
    boards.push(rec); return rec;
  }
  function cardTex(title, body, hex){
    var c=document.createElement('canvas'); c.width=640; c.height=360; var g=c.getContext('2d');
    g.fillStyle='rgba(8,12,28,.82)'; g.fillRect(0,0,640,360);
    g.strokeStyle=hex||'#2ee6ff'; g.lineWidth=6; g.strokeRect(10,10,620,340);
    g.fillStyle=hex||'#2ee6ff'; g.font='700 42px Inter,sans-serif'; g.fillText(title,36,78);
    g.fillStyle='#e8eeff'; g.font='28px Inter,sans-serif';
    var words=String(body||'').split(' '), line='', y=130;
    words.forEach(function(w){ var t=line?line+' '+w:w; if(g.measureText(t).width>560){ g.fillText(line,36,y); line=w; y+=40; } else line=t; });
    g.fillText(line,36,y);
    return c;
  }
  function addTV(id, src, w, h, off, meta){
    var d=D[id]; if(!d) return null;
    w=Math.max(8,w||16); h=Math.max(6,h||9);
    var tex=src.tagName==='CANVAS'?new T.CanvasTexture(src):src.tagName==='VIDEO'?new T.VideoTexture(src):new T.Texture(src);
    tex.minFilter=T.LinearFilter; tex.needsUpdate=true;
    var g=new T.Group();
    var chassis=new T.Mesh(new T.BoxGeometry(w+1.1,h+1.1,.5), new T.MeshBasicMaterial({color:0x070910}));
    chassis.position.z=-.28;
    var lip=new T.Mesh(new T.PlaneGeometry(w+.2,h+.2), new T.MeshBasicMaterial({color:0x151c32}));
    var screen=new T.Mesh(new T.PlaneGeometry(w,h), new T.MeshBasicMaterial({map:tex}));
    screen.position.z=.06;
    g.add(chassis, lip, screen);
    var base=d.v.clone().add(V(off[0],off[1],off[2]));
    g.position.copy(base); group.add(g);
    var rec={group:g,screen:screen,tex:tex,kind:(meta&&meta.kind)||'image',meta:meta||{},base:base,bob:Math.random()*6,w:w,h:h,
      update:function(){ tex.needsUpdate=true; },
      remove:function(){ group.remove(g); tex.dispose(); }};
    screen.userData.rec=rec; chassis.userData.rec=rec;
    tvList.push(rec); return rec;
  }

  function pose(id,P,L){
    var d=D[id]; if(!d){ P.set(0,40,80); L.set(0,0,0); return; }
    var yaw=d.yaw||0, dist=(d.dist||48)*(small?1.2:1), v=d.v;
    P.set(v.x+Math.sin(yaw)*dist, v.y+dist*.16, v.z+Math.cos(yaw)*dist);
    if(small){ L.copy(v); L.y-=dist*.22; }
    else { var sh=d.shift||.36; L.set(v.x+Math.cos(yaw)*dist*sh, v.y-dist*.02, v.z-Math.sin(yaw)*dist*sh); }
  }

  function buildWorld(){
    scene.fog=new T.Fog(0x03040a, 80, 1400);
    scene.background=new T.Color(0x03040a);
    group.add(new T.HemisphereLight(0xb7c6e4, 0x0b1018, .85));
    var sun=new T.DirectionalLight(0xfff4dc, .9); sun.position.set(80, 220, 60); group.add(sun);
    group.add(new T.AmbientLight(0x223355, .35));

    var nStars=lite?90:280, sp=new Float32Array(nStars*3);
    for(var i=0;i<nStars;i++){ sp[i*3]=rnd(-900,900); sp[i*3+1]=rnd(-80,900); sp[i*3+2]=rnd(-900,900); }
    var sg=new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp,3));
    group.add(new T.Points(sg, new T.PointsMaterial({color:0xffffff,size:1.4,transparent:true,opacity:.8,depthWrite:false,sizeAttenuation:true})));
    makeDust();

    FLOORS.forEach(function(raw,i){
      var d=Object.assign({}, raw);
      d.v=V(raw.pos[0], raw.pos[1], raw.pos[2]);
      d.g=cubeCore(raw.col, raw.scale);
      d.g.position.copy(d.v);
      d.g.userData.dest=d.id;
      d.g.traverse(function(c){ c.userData.dest=d.id; });
      group.add(d.g);
      var lamp=new T.PointLight(raw.col, 1.1, 160); lamp.position.copy(d.v); lamp.position.y+=18; group.add(lamp);
      DESTS.push(d); D[d.id]=d;
      hangFloor(d, i);
    });

    LINKS.forEach(function(L,k){
      var A=D[L[0]], B=D[L[1]]; if(!A||!B) return;
      var a=A.v, b=B.v, mid=a.clone().lerp(b,.5);
      mid.x+=rnd(-8,8); mid.z+=rnd(-8,8);
      var curve=new T.CatmullRomCurve3([a.clone(), mid, b.clone()]);
      var line=new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(28)), new T.LineBasicMaterial({color:k%2?0x2ee6ff:0xffe9a8,transparent:true,opacity:.7,blending:ADD}));
      group.add(line);
      var comets=[];
      for(var c=0;c<(lite?1:2);c++){
        var parts=[];
        for(var q=0;q<5;q++){ var sp=new T.Sprite(new T.SpriteMaterial({map:glowMap(0x2ee6ff),transparent:true,depthWrite:false,blending:ADD,opacity:1-q/5})); sp.scale.set(2-q*.25,2-q*.25,1); group.add(sp); parts.push(sp); }
        comets.push({t:Math.random(),v:rnd(.08,.14),parts:parts});
      }
      axons.push({a:L[0],b:L[1],curve:curve,line:line,comets:comets,seen:false});
    });

    /* a cube spine so the keep reads as one tower from far away */
    for(var s=0;s<6;s++){
      var y=s*78+36;
      var beam=new T.Mesh(new T.BoxGeometry(1.6, 70, 1.6), new T.MeshPhongMaterial({color:0x2ee6ff,emissive:0x2ee6ff,emissiveIntensity:.25}));
      beam.position.set((s%2?-6:6), y, (s%2?4:-4)); group.add(beam);
    }
  }

  function hangFloor(d){
    if(d.id==='sky') hangSky(d);
    else if(d.id==='memory') hangMemory(d);
    else if(d.id==='sage') hangSage(d);
    else if(d.id==='arcade') hangArcade(d);
    else if(d.id==='garden') hangGarden(d);
    else if(d.id==='course') hangCourse(d);
    else hangGate(d);
    addBillboard(d.id, cardTex(d.name, d.hint, d.col), 18, 10, [0, 16, 10]);
  }

  function hangSky(){
    STARS.forEach(function(s,i){
      var a=i/STARS.length*Math.PI*2, r=28+(i%3)*6;
      var off=[Math.cos(a)*r, 8+Math.sin(a*2)*6, Math.sin(a)*r];
      var tv=addTV('sky', cardTex(s.n, s.f, '#ffe7b0'), 14, 8, off, {kind:'star', title:s.n, fact:s.f});
      floaters.push({kind:'orbit', rec:tv, a:a, r:r, y:8+Math.sin(a*2)*6, sp:.08+i*.01});
    });
    var moon=new T.Mesh(new T.SphereGeometry(7, lite?12:28, lite?10:22), new T.MeshPhongMaterial({color:0xe8e4d8,emissive:0x665544,emissiveIntensity:.2}));
    moon.position.copy(D.sky.v).add(V(-22,18,16)); group.add(moon);
    moon.userData.rec={kind:'moon', meta:{title:'The Moon', fact:'The same face always looks at us. Tap a star for its name.'}};
    tvList.push({group:moon,screen:moon,kind:'moon',meta:{title:'The Moon', fact:'The same face always looks at us.'},base:moon.position.clone(),bob:1,w:14,h:14});
  }

  function hangMemory(){
    var S=mindSave(), moods=S.moods||[], days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    var now=new Date(); now.setHours(12,0,0,0); var mon=new Date(now); mon.setDate(now.getDate()-((now.getDay()+6)%7));
    var MOOD={Joyful:'#ffc44d',Grateful:'#19f0b0',Hopeful:'#ff4fa8',Calm:'#2ee6ff',Tired:'#a45cff',Anxious:'#ff8a3d',Low:'#4f7dff'};
    days.forEach(function(n,i){
      var d=new Date(mon); d.setDate(mon.getDate()+i);
      var k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      var m=(moods.filter(function(x){ return x.day===k; })[0])||null;
      var col=m?(MOOD[m.m]||'#cfd6ff'):'#3a4170';
      var body=m?(m.m+(m.note?' — '+m.note:'')):'Nothing logged yet.';
      addTV('memory', cardTex(n+' '+d.getDate(), body, col), 12, 12, [-24+i*8, 6, 18], {kind:'mood', title:n, fact:body});
    });
    (S.ideas||[]).slice(0,4).forEach(function(x,i){
      addTV('memory', cardTex('Idea', x.t||'', '#a45cff'), 12, 7, [Math.cos(i)*16, 14, Math.sin(i)*16], {kind:'idea', title:'Idea', fact:x.t});
    });
  }

  function hangSage(){
    var lights=(window.H_LIGHT||[]).slice(0,6);
    var hadith=(window.H_HADITH||[]).slice(0,4);
    var pack=lights.concat(hadith.map(function(h){ return {t:h.title||'Saying', b:h.en||''}; }));
    if(!pack.length) pack=[{t:'Light',b:'A kind word you say today can still be shining later.'},{t:'Patience',b:'The keep was built one cube at a time.'}];
    pack.slice(0,8).forEach(function(x,i){
      var a=i/Math.max(1,pack.length)*Math.PI*2, r=22;
      addTV('sage', cardTex(x.t||x.title||'Light', x.b||x.en||'', '#ffc44d'), 16, 9, [Math.cos(a)*r, 4+Math.sin(i)*5, Math.sin(a)*r], {kind:'wisdom', title:x.t||x.title, fact:x.b||x.en});
    });
  }

  function hangArcade(){
    GAMES.forEach(function(g,i){
      var a=i/GAMES.length*Math.PI*2, r=24;
      var tv=addTV('arcade', cardTex(g.n, 'Tap to play on the mind TV', g.c), 14, 8, [Math.cos(a)*r, 3, Math.sin(a)*r], {kind:'play', play:g.id, title:g.n});
      floaters.push({kind:'orbit', rec:tv, a:a, r:r, y:3, sp:.12});
    });
  }

  function hangGarden(){
    for(var i=0;i<(lite?8:14);i++){
      var g=new T.Group();
      var stem=new T.Mesh(new T.BoxGeometry(.35, 3+i%3, .35), new T.MeshPhongMaterial({color:0x19f0b0,emissive:0x0a4,emissiveIntensity:.3}));
      stem.position.y=1.6;
      var leaf=new T.Mesh(new T.BoxGeometry(1.4,1.4,1.4), new T.MeshPhongMaterial({color:i%2?0xff4fa8:0xffc44d,emissive:i%2?0xff4fa8:0xffc44d,emissiveIntensity:.25}));
      leaf.position.y=3.4+(i%3)*.4;
      g.add(stem, leaf);
      var a=i/14*Math.PI*2, r=16+(i%3)*4;
      g.position.copy(D.garden.v).add(V(Math.cos(a)*r, 0, Math.sin(a)*r));
      group.add(g);
      floaters.push({kind:'grow', g:g, leaf:leaf, a:a, base:g.position.y});
    }
    addTV('garden', cardTex('Night garden', 'Open the farm. Hoe, plant, water, sleep.', '#19f0b0'), 16, 9, [0, 10, 20], {kind:'play', play:'garden', title:'Night garden'});
  }

  function hangCourse(){
    for(var i=0;i<8;i++){
      var a=i/8*Math.PI*2, r=26;
      var ring=new T.Mesh(new T.TorusGeometry(4.2, .35, 8, lite?16:28), new T.MeshBasicMaterial({color:0x7ec8ff,transparent:true,opacity:.75,blending:ADD,depthWrite:false}));
      ring.position.copy(D.course.v).add(V(Math.cos(a)*r, 4+Math.sin(i)*5, Math.sin(a)*r));
      ring.lookAt(D.course.v);
      group.add(ring);
      rings.push({m:ring, hit:0, i:i});
    }
  }

  function hangGate(){
    addTV('gate', cardTex('Back to Mind', 'Tap this door. The neurons are waiting.', '#4f7dff'), 18, 10, [0, 4, 18], {kind:'home', title:'The Gate'});
    addTV('gate', cardTex('Cube Keep', 'Seven cube-neurons. Fly them the way you fly the mind. Hold the orb. Drag the sky.', '#2ee6ff'), 16, 9, [-20, 6, 4], {kind:'lore'});
    addTV('gate', cardTex('Down a floor', 'Or look at the next cube and hold. The golden line is the axon between them.', '#ffe9a8'), 16, 9, [20, 6, 4], {kind:'lore'});
  }

  function makeDust(){
    var ND=lite?40:120, dust=[], dp=new Float32Array(ND*6);
    for(var i=0;i<ND;i++) dust.push({x:rnd(-70,70),y:rnd(-40,40),z:rnd(-180,8)});
    var geo=new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(dp,3));
    var obj=new T.LineSegments(geo, new T.LineBasicMaterial({color:0xd5e6ff,transparent:true,opacity:.35,depthWrite:false,blending:ADD}));
    scene.add(obj);
    makeDust._= {dust:dust, obj:obj, ND:ND};
  }
  function tickDust(dt){
    var X=makeDust._; if(!X) return;
    var sp=10+camVel*.04, pos=X.obj.geometry.attributes.position.array, len=.8+camVel*.01;
    for(var i=0;i<X.dust.length;i++){
      var d=X.dust[i]; d.z+=sp*dt; if(d.z>8){ d.z=-180; d.x=rnd(-70,70); d.y=rnd(-40,40); }
      var o=i*6; pos[o]=d.x; pos[o+1]=d.y; pos[o+2]=d.z; pos[o+3]=d.x; pos[o+4]=d.y; pos[o+5]=d.z-len;
    }
    X.obj.geometry.attributes.position.needsUpdate=true;
    X.obj.position.copy(cam.position); X.obj.quaternion.copy(cam.quaternion);
    X.obj.material.opacity=Math.min(.65,.16+camVel*.003);
  }

  function freeStart(){
    var dir=camLook.clone().sub(camPos); if(!dir.lengthSq()) dir.set(0,0,-1); dir.normalize();
    flight={t0:performance.now(),yaw:Math.atan2(-dir.x,-dir.z),pitch:Math.asin(clamp(dir.y,-1,1)),vel:0,thrust:0,turn:0,tilt:0,max:small?140:220};
    return true;
  }
  function freeStep(dt){
    var f=flight;
    f.yaw+=f.turn*dt*1.3; f.pitch=clamp(f.pitch+f.tilt*dt*.9, -1.25, 1.25);
    f.vel+=(f.thrust*f.max-f.vel)*Math.min(1,dt*(f.thrust?1.5:2.2));
    fwd.set(-Math.sin(f.yaw)*Math.cos(f.pitch), Math.sin(f.pitch), -Math.cos(f.yaw)*Math.cos(f.pitch));
    camPos.addScaledVector(fwd, f.vel*dt);
    tmpA.copy(camPos).sub(CENTER); var r=tmpA.length(); if(r>BOUND) camPos.addScaledVector(tmpA.normalize(), -(r-BOUND)*Math.min(1,dt*2));
    tmpB.copy(camPos).addScaledVector(fwd, LOOK); camLook.lerp(tmpB, Math.min(1,dt*3.5));
  }
  function go(id){
    var d=D[id]; if(!d) return;
    var P=V(0,0,0), L=V(0,0,0); pose(id,P,L);
    var dist=camPos.distanceTo(P), dirv=P.clone().sub(camPos).normalize();
    var side=V(0,1,0).cross(dirv); if(!side.lengthSq()) side.set(1,0,0); side.normalize().multiplyScalar(dist*.16);
    var curve=new T.CubicBezierCurve3(camPos.clone(), camPos.clone().addScaledVector(dirv,dist*.3).add(side), P.clone().addScaledVector(dirv,-dist*.28).add(side), P.clone());
    var ax=null; axons.forEach(function(A){ if((A.a===cur&&A.b===id)||(A.b===cur&&A.a===id)) ax=A; });
    if(ax){ ax.seen=true; ax.line.material.color.set(0xffe9a8); }
    ride={t0:performance.now(), dur:Math.max(1600, Math.min(4200, 900+dist*6)), curve:curve, toLook:L, to:id};
    flight=null; cur=id; paintHud(); FX('warp');
  }
  function rideStep(){
    var k=Math.min(1,(performance.now()-ride.t0)/ride.dur), e=ease(k);
    ride.curve.getPoint(e, camPos);
    ride.curve.getPoint(Math.min(1,e+.06), tmpA);
    camLook.lerp(tmpA, .4); camLook.lerp(ride.toLook, ease(Math.max(0,(k-.55)/.45)));
    if(k>=1){ cur=ride.to; ride=null; freeStart(); flight.vel=0; paintHud(); }
  }

  function nearest(){
    var best=null, bd=1e9;
    DESTS.forEach(function(d){ var dd=d.v.distanceTo(camPos); if(dd<bd){ bd=dd; best=d; } });
    return {d:best, dist:bd};
  }
  function pickTV(cx,cy){
    if(!tvList.length) return null;
    var ndc=new T.Vector2((cx/innerWidth)*2-1, -(cy/innerHeight)*2+1);
    var ray=new T.Raycaster(); ray.setFromCamera(ndc, cam);
    var meshes=[]; tvList.forEach(function(t){ if(t.screen) meshes.push(t.screen); });
    var hits=ray.intersectObjects(meshes,false);
    return hits.length?hits[0].object.userData.rec||null:null;
  }
  function pickDest(cx,cy){
    var ndc=new T.Vector2((cx/innerWidth)*2-1, -(cy/innerHeight)*2+1);
    var ray=new T.Raycaster(); ray.setFromCamera(ndc, cam);
    var meshes=[]; DESTS.forEach(function(d){ if(d.g&&d.g.userData.mesh) meshes.push(d.g.userData.mesh); });
    var hits=ray.intersectObjects(meshes,true);
    if(hits.length) return hits[0].object.userData.dest||null;
    return null;
  }
  function useThing(rec){
    if(!rec) return;
    if(rec.kind==='home'||(rec.meta&&rec.meta.kind==='home')){ leave(); return; }
    if(rec.kind==='play'||(rec.meta&&rec.meta.play)){
      var game=rec.meta.play; leave();
      setTimeout(function(){ if(window.MUPlay) MUPlay.open(game); }, 240);
      return;
    }
    var title=(rec.meta&&(rec.meta.title||rec.meta.n))||'';
    var fact=(rec.meta&&rec.meta.fact)||'';
    if(title||fact){ setBlurb((title?title+'. ':'')+fact); toast(title||fact); FX('zoop'); }
  }
  function setBlurb(t){ var p=hud&&hud.querySelector('#whBlurb'); if(p) p.textContent=t; }

  function paintHud(){
    if(!hud) return;
    var d=D[cur]||{};
    var name=hud.querySelector('#whName'); if(name) name.textContent='Cube Keep';
    var stop=hud.querySelector('#whStop'); if(stop) stop.textContent=d.name||'';
    var hint=hud.querySelector('#whHint'); if(hint) hint.textContent='Drag to turn · hold the orb or W · A D turn · the next cube is a floor';
    var card=hud.querySelector('#whCard');
    if(card){
      var extra=d.play?'<button type="button" data-wplay="'+d.play+'">Play '+d.name+'</button>':'';
      if(d.id==='gate') extra='<button type="button" id="whHome">Back to Mind</button>';
      card.innerHTML='<b>'+(d.name||'')+'</b><p id="whBlurb">'+(d.hint||'')+'</p>'+extra;
    }
    var map=document.getElementById('whMap'); if(map) map.innerHTML='';
    var path=hud.querySelector('#whPath');
    if(path) path.innerHTML=DESTS.slice().reverse().map(function(s,i){ return '<button type="button" data-floor="'+s.id+'" class="'+(s.id===cur?'on':'')+'" title="'+s.name+'"></button>'; }).join('');
    stopI=DESTS.indexOf(d);
  }

  function tickWorld(t, dt){
    DESTS.forEach(function(d,i){
      var on=d.id===cur, u=d.g.userData, sc=d.scale||1;
      d.g.rotation.y=t*.25+i;
      if(u.halo){ var hs=(on?11:8)*sc*(1+Math.sin(t*2+i)*.08); u.halo.scale.set(hs,hs,1); u.halo.material.opacity=on?.85:.55; }
      if(u.ring){ u.ring.lookAt(cam.position); u.ring.rotateZ(t*.3+i); }
      if(u.ring2){ u.ring2.lookAt(cam.position); u.ring2.rotateZ(-t*.45-i); }
    });
    axons.forEach(function(A){
      A.comets.forEach(function(c){ c.t+=dt*c.v; if(c.t>1) c.t-=1;
        c.parts.forEach(function(p,q){ var tt=c.t-q*.03; if(tt<0) tt+=1; A.curve.getPoint(tt, p.position); });
      });
    });
    tvList.forEach(function(tv){
      if(!tv.group||!tv.base) return;
      tv.group.quaternion.copy(cam.quaternion);
      tv.group.position.copy(tv.base);
      tv.group.position.y+=Math.sin(t*.7+tv.bob)*.7;
    });
    floaters.forEach(function(o){
      if(o.kind==='orbit'&&o.rec&&o.rec.base){
        var hub=o.rec.kind==='star'?(D.sky&&D.sky.v):(D.arcade&&D.arcade.v);
        if(hub){ var a=o.a+t*o.sp; o.rec.base.set(hub.x+Math.cos(a)*o.r, hub.y+o.y, hub.z+Math.sin(a)*o.r); }
      }
      if(o.kind==='grow'&&o.leaf){ o.leaf.rotation.y=t*.6; o.g.position.y=o.base+Math.sin(t*1.2+o.a)*.35; }
    });
    var passed=0;
    rings.forEach(function(r){
      if(r.m.position.distanceTo(camPos)<5.2){ r.hit=1; r.m.material.color.set(0x19f0b0); }
      if(r.hit) passed++;
    });
    if(rings.length&&passed===rings.length&&cur==='course') setBlurb('Every ring. The course is yours.');
    for(var i=bits.length-1;i>=0;i--){ var b=bits[i]; b.life-=dt; if(b.life<=0){ group.remove(b.m); bits.splice(i,1); } }
  }

  function loop(){
    if(!running||!renderer) return;
    var dt=Math.min(clock.getDelta(), .05), t=clock.elapsedTime;
    if(ride) rideStep();
    else if(flight) freeStep(dt);
    cam.position.copy(camPos); cam.lookAt(camLook);
    camVel=camVel*.85+(prevCam.distanceTo(camPos)/Math.max(dt,.001))*.15; prevCam.copy(camPos);
    tickWorld(t, dt); tickDust(dt);
    var n=nearest();
    if(n.d&&n.d.id!==cur&&n.dist<36){ cur=n.d.id; paintHud(); }
    renderer.render(scene, cam);
    requestAnimationFrame(loop);
  }

  function boot(){
    kill();
    host=document.getElementById('worldLayer'); hud=document.getElementById('worldHud');
    if(!host||!T) return;
    renderer=new T.WebGLRenderer({antialias:!lite, alpha:false, powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1, lite?1.2:1.6));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x03040a,1);
    host.appendChild(renderer.domElement);
    scene=new T.Scene();
    cam=new T.PerspectiveCamera(58, innerWidth/innerHeight, .1, 4000);
    clock=new T.Clock(); group=new T.Group(); scene.add(group);
    D={}; DESTS=[]; axons=[]; tvList=[]; boards=[]; rings=[]; bits=[]; floaters=[]; ride=null; keys={}; holding=0;
    camPos=V(0,0,0); camLook=V(0,0,-1); prevCam=V(0,0,0); fwd=V(0,0,-1); tmpA=V(0,0,0); tmpB=V(0,0,0);
    CENTER=V(0,230,0);
    buildWorld();
    cur='sky';
    pose('sky', camPos, camLook);
    freeStart(); flight.vel=0;
    paintHud();
    running=true; loop();
    addEventListener('resize', onResize);
  }
  function onResize(){ if(!renderer||!cam) return; renderer.setSize(innerWidth,innerHeight); cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); }
  function kill(){
    running=false; removeEventListener('resize', onResize);
    if(renderer){ try{ renderer.dispose(); }catch(e){} if(renderer.domElement&&renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); }
    renderer=null; scene=null; cam=null; group=null; flight=null;
    D={}; DESTS=[]; axons=[]; tvList=[]; boards=[]; rings=[]; makeDust._=null;
  }
  function enter(){
    document.body.classList.add('in-world');
    try{ if(window.HMind&&HMind.pause) HMind.pause(true); }catch(e){}
    try{ if(window.MUWorldSeen) MUWorldSeen('cube'); }catch(e){}
    FX('warp'); toast('Cube Keep · fly it like the mind');
    boot();
  }
  function leave(){
    kill();
    document.body.classList.remove('in-world');
    holding=0;
    var b=document.getElementById('whFly'); if(b) b.classList.remove('on');
    try{ if(window.HMind&&HMind.pause) HMind.pause(false); }catch(e){}
    FX('zoop');
    try{ if(window.MUResumeMind) window.MUResumeMind(); }catch(e){}
  }
  function floorList(){ return ['sky','memory','sage','arcade','garden','course','gate']; }
  function goFloor(dir){
    var list=floorList(), i=list.indexOf(cur);
    var j=i+(dir>0?1:-1);
    if(j<0){ toast('You are at the roof'); return; }
    if(j>=list.length){ toast('You are at the gate'); return; }
    go(list[j]);
  }
  function lookBy(dx,dy){
    if(!flight) return;
    var k=small?.008:.005;
    flight.yaw-=dx*k; flight.pitch=clamp(flight.pitch-dy*k*.8, -1.25, 1.25);
  }
  function syncKeys(){
    if(!flight) return;
    var f=(keys.w||keys.arrowup||keys[' '])?1:((keys.s||keys.arrowdown)?-.45:0);
    if(!holding) flight.thrust=f;
    flight.turn=(keys.a||keys.arrowleft)?1:((keys.d||keys.arrowright)?-1:0);
    var b=document.getElementById('whFly'); if(b) b.classList.toggle('on', flight.thrust>0);
  }

  function bind(){
    hud=document.getElementById('worldHud'); host=document.getElementById('worldLayer');
    if(!hud||!host||hud.dataset.keep2) return;
    hud.dataset.keep2='1';
    hud.addEventListener('click', function(e){
      var b=e.target.closest('button'); if(!b) return;
      if(b.id==='whExit'||b.id==='whHome'){ leave(); return; }
      if(b.id==='whPrev'){ goFloor(-1); return; }
      if(b.id==='whNext'){ goFloor(1); return; }
      if(b.dataset.floor){ go(b.dataset.floor); return; }
      if(b.dataset.wplay&&window.MUPlay){ var g=b.dataset.wplay; leave(); setTimeout(function(){ MUPlay.open(g); }, 240); }
    });
    var flyBtn=document.getElementById('whFly');
    if(flyBtn){
      flyBtn.addEventListener('pointerdown', function(e){ e.preventDefault(); e.stopPropagation(); try{ flyBtn.setPointerCapture(e.pointerId); }catch(_){} holding=1; if(flight) flight.thrust=1; flyBtn.classList.add('on'); });
      ['pointerup','pointercancel','lostpointercapture'].forEach(function(n){ flyBtn.addEventListener(n, function(){ holding=0; syncKeys(); }); });
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
        var tap=n==='pointerup'&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<10&&Date.now()-drag.t<350;
        var x=e.clientX, y=e.clientY; drag=null;
        if(!tap) return;
        var tv=pickTV(x,y); if(tv){ useThing(tv); return; }
        var dest=pickDest(x,y); if(dest) go(dest);
      });
    });
    addEventListener('keydown', function(e){
      if(!running||e.target.closest('input,textarea')) return;
      var k=e.key.toLowerCase();
      if(k==='escape'){ leave(); return; }
      if(['w','a','s','d',' ','arrowup','arrowdown','arrowleft','arrowright'].indexOf(k)<0) return;
      e.preventDefault(); keys[k]=1; syncKeys();
    });
    addEventListener('keyup', function(e){ var k=e.key.toLowerCase(); if(keys[k]){ delete keys[k]; if(running) syncKeys(); } });
    addEventListener('wheel', function(e){ if(!running||!flight||ride) return; flight.vel=Math.max(-80, Math.min(flight.max*1.4, flight.vel+(-e.deltaY*.06))); }, {passive:true});
  }

  window.MUWorlds={enter:enter, leave:leave, bind:bind, current:function(){ return cur; }, active:function(){ return running; }};
})();
