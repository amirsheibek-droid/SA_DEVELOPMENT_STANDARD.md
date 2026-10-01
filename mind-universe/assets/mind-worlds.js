/* Mind Universe — other worlds.
   Mind stays the home universe (neurons, health, quotes).
   Each other world has its own travel: walk floors, garden paths, orbital hops, exhibit rails. */
(function(){
  var T=window.THREE;
  if(!T) return;
  var small=Math.min(innerWidth,innerHeight)<700 || innerWidth<900 || !!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
  var lite=small;
  var host=null, hud=null, renderer=null, scene=null, cam=null, clock=null, running=false, cur=null, group=null;
  var pads=[], stops=[], stopI=0, ride=null, lookYaw=0, lookPitch=0, keys={}, drag=null, walkOn=0;
  var px=0, py=2.2, pz=0, vy=0, eye=2.2, anims=[], planets=[], herd=[], plaqueEl=null;

  function V(x,y,z){ return new T.Vector3(x,y,z); }
  function col(h){ return new T.Color(h); }
  function rnd(a,b){ return a+Math.random()*(b-a); }
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function toast(t){ try{ var el=document.getElementById('toast'); if(!el) return; el.textContent=t; el.classList.add('on'); clearTimeout(toast._t); toast._t=setTimeout(function(){ el.classList.remove('on'); },2400); }catch(e){} }
  function FX(n){ try{ window.SAFX&&SAFX[n]&&SAFX[n](); }catch(e){} }

  var META={
    gate:{name:'Worlds gate', hint:'Walk the ring. Each doorway is a different universe.', move:'walk'},
    cube:{name:'Cube Keep', hint:'You are on a floor. Walk. Take the spiral down. This is not space-fly.', move:'walk'},
    garden:{name:'The Gardens', hint:'Follow the path through garden after garden.', move:'walk'},
    planets:{name:'Nearby worlds', hint:'An orbital path between the real planets of our sun.', move:'rail'},
    science:{name:'Science hall', hint:'Ride the exhibit rail. Each stop is a living animation.', move:'rail'},
    animals:{name:'The Living Path', hint:'Walk the dirt track. Animals stand and walk beside you — look as you pass.', move:'walk'}
  };

  function ptex(kind){
    var c=document.createElement('canvas'); c.width=256; c.height=128; var g=c.getContext('2d'), i,x,y;
    function blob(col,n,rmin,rmax){ g.fillStyle=col; for(i=0;i<n;i++){ x=Math.random()*256; y=20+Math.random()*90; var r=rmin+Math.random()*(rmax-rmin); g.beginPath(); g.ellipse(x,y,r*1.5,r,0,0,Math.PI*2); g.fill(); } }
    if(kind==='sun'){ g.fillStyle='#ffb347'; g.fillRect(0,0,256,128); blob('#fff3c4',18,6,18); blob('#ff7a2d',10,4,12); }
    else if(kind==='mercury'){ g.fillStyle='#8a8680'; g.fillRect(0,0,256,128); blob('rgba(50,48,44,.55)',40,2,8); }
    else if(kind==='venus'){ g.fillStyle='#d9c08a'; g.fillRect(0,0,256,128); blob('#efe0b8',20,8,20); }
    else if(kind==='earth'){ g.fillStyle='#1d5fb8'; g.fillRect(0,0,256,128); blob('#2f8f4e',16,8,18); blob('#eef6ff',6,4,10); }
    else if(kind==='moon'){ g.fillStyle='#9a9ca3'; g.fillRect(0,0,256,128); blob('rgba(70,72,80,.5)',30,2,8); }
    else if(kind==='mars'){ g.fillStyle='#b5532c'; g.fillRect(0,0,256,128); blob('rgba(120,40,20,.55)',18,4,12); }
    else if(kind==='jupiter'){ for(y=0;y<128;y+=6){ g.fillStyle=['#c9a27a','#e8d3b5','#a87c56','#f1e4cf'][(y/6)%4|0]; g.fillRect(0,y,256,6); } g.fillStyle='#b5523a'; g.beginPath(); g.ellipse(170,80,14,8,0,0,Math.PI*2); g.fill(); }
    else if(kind==='saturn'){ for(y=0;y<128;y+=6){ g.fillStyle=['#d9c18f','#efe0b9','#c4a66e'][(y/6)%3|0]; g.fillRect(0,y,256,6); } }
    else if(kind==='uranus'){ g.fillStyle='#9ad7e0'; g.fillRect(0,0,256,128); }
    else if(kind==='neptune'){ g.fillStyle='#2b5fce'; g.fillRect(0,0,256,128); blob('#4f86ff',8,6,14); }
    else { g.fillStyle='#667'; g.fillRect(0,0,256,128); }
    var t=new T.CanvasTexture(c); t.needsUpdate=true; return t;
  }

  function box(w,h,d,c,x,y,z,par){ var m=new T.Mesh(new T.BoxGeometry(w,h,d), new T.MeshLambertMaterial({color:c})); m.position.set(x,y,z); (par||group).add(m); return m; }
  function sph(r,c,x,y,z,tex,par){ var mat=tex?new T.MeshLambertMaterial({map:tex}):new T.MeshLambertMaterial({color:c}); var m=new T.Mesh(new T.SphereGeometry(r, lite?12:28, lite?8:18), mat); m.position.set(x,y,z); (par||group).add(m); return m; }
  function cyl(rt,rb,h,c,x,y,z,par){ var m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,lite?8:12), new T.MeshLambertMaterial({color:c})); m.position.set(x,y,z); (par||group).add(m); return m; }
  function pad(x,z,w,d,y){ pads.push({x:x,z:z,w:w,d:d,y:y}); }

  function lights(amb, keyCol, keyPos){
    group.add(new T.AmbientLight(amb,.55));
    var k=new T.DirectionalLight(keyCol,.85); k.position.set(keyPos[0],keyPos[1],keyPos[2]); group.add(k);
  }
  function phong(tex, shine){ return new T.MeshPhongMaterial({map:tex, shininess:shine==null?12:shine, specular:0x222222, color:0xffffff}); }
  function fur(kind){
    var c=document.createElement('canvas'); c.width=c.height=512; var g=c.getContext('2d'), x,y,i;
    function noise(a){ for(i=0;i<9000;i++){ x=Math.random()*512; y=Math.random()*512; g.fillStyle=a; g.globalAlpha=.08+Math.random()*.18; g.fillRect(x,y,1.2,2.8); } g.globalAlpha=1; }
    function grain(n){ for(i=0;i<n;i++){ x=Math.random()*512; y=Math.random()*512; g.fillStyle='rgba(0,0,0,'+(Math.random()*.12)+')'; g.fillRect(x,y,1,1+Math.random()*2); } }
    if(kind==='lion'){ g.fillStyle='#c4a05a'; g.fillRect(0,0,512,512); noise('#8a6230'); grain(4000); }
    else if(kind==='mane'){ g.fillStyle='#6b3d12'; g.fillRect(0,0,512,512); noise('#3a1e08'); noise('#c47a28'); }
    else if(kind==='zebra'){ g.fillStyle='#f4f1ea'; g.fillRect(0,0,512,512); g.fillStyle='#1a1612'; for(y=0;y<512;y+=18){ g.beginPath(); var o=Math.sin(y*.04)*10; g.rect(0,y+o,512,8+Math.random()*6); g.fill(); } grain(2000); }
    else if(kind==='giraffe'){ g.fillStyle='#e8c36a'; g.fillRect(0,0,512,512); g.fillStyle='#7a4a1e'; for(i=0;i<70;i++){ x=Math.random()*512; y=Math.random()*512; g.beginPath(); g.ellipse(x,y,18+Math.random()*16,14+Math.random()*12,Math.random(),0,Math.PI*2); g.fill(); } grain(2500); }
    else if(kind==='elephant'){ g.fillStyle='#9a958c'; g.fillRect(0,0,512,512); noise('#6e6a64'); for(i=0;i<40;i++){ g.strokeStyle='rgba(50,48,44,.35)'; g.beginPath(); y=Math.random()*512; g.moveTo(0,y); g.bezierCurveTo(180,y+20,320,y-18,512,y+8); g.stroke(); } grain(3000); }
    else if(kind==='deer'){ g.fillStyle='#8b5a32'; g.fillRect(0,0,512,512); noise('#5a3418'); grain(2800); }
    else if(kind==='fox'){ g.fillStyle='#d06020'; g.fillRect(0,0,512,512); noise('#8a2e0c'); g.fillStyle='#f3efe6'; g.fillRect(0,380,512,132); grain(2000); }
    else if(kind==='wolf'){ g.fillStyle='#7a7a7e'; g.fillRect(0,0,512,512); noise('#3d3d42'); grain(3200); }
    else if(kind==='bear'){ g.fillStyle='#4a3424'; g.fillRect(0,0,512,512); noise('#2a1c12'); grain(3500); }
    else if(kind==='polar'){ g.fillStyle='#e8eef4'; g.fillRect(0,0,512,512); noise('#c5d0dc'); grain(2000); }
    else if(kind==='horse'){ g.fillStyle='#5c3310'; g.fillRect(0,0,512,512); noise('#2e1808'); grain(2800); }
    else if(kind==='hippo'){ g.fillStyle='#8a7a7a'; g.fillRect(0,0,512,512); noise('#5a4a4a'); grain(1800); }
    else if(kind==='croc'){ g.fillStyle='#3d5a32'; g.fillRect(0,0,512,512); g.fillStyle='#2a3c22'; for(i=0;i<80;i++){ x=Math.random()*512; y=Math.random()*512; g.fillRect(x,y,10,8); } }
    else if(kind==='penguin'){ g.fillStyle='#1a1a1e'; g.fillRect(0,0,512,512); g.fillStyle='#f2efe8'; g.fillRect(140,80,232,400); }
    else if(kind==='gazelle'){ g.fillStyle='#c9a36a'; g.fillRect(0,0,512,512); noise('#7a5428'); g.fillStyle='#efe6d4'; g.fillRect(0,400,512,112); }
    else { g.fillStyle='#8a7a60'; g.fillRect(0,0,512,512); noise('#4a3a28'); }
    var t=new T.CanvasTexture(c); t.needsUpdate=true; return t;
  }
  function oval(rx,ry,rz, mat, x,y,z, par){
    var m=new T.Mesh(new T.SphereGeometry(1, lite?10:22, lite?8:16), mat);
    m.scale.set(rx,ry,rz); m.position.set(x,y,z); (par||group).add(m); return m;
  }
  function limb(mat, len, r, par){
    var hip=new T.Group(); par.add(hip);
    var upper=new T.Mesh(new T.CylinderGeometry(r, r*.82, len*.55, lite?6:10), mat); upper.position.y=-len*.275; hip.add(upper);
    var knee=new T.Group(); knee.position.y=-len*.55; hip.add(knee);
    var lower=new T.Mesh(new T.CylinderGeometry(r*.82, r*.52, len*.42, lite?6:10), mat); lower.position.y=-len*.21; knee.add(lower);
    var foot=new T.Mesh(new T.SphereGeometry(r*.55, 8, 6), mat); foot.scale.set(1.35,.45,1.9); foot.position.y=-len*.44; knee.add(foot);
    return {hip:hip, knee:knee};
  }
  function eyePair(head, sx, sy, sz, r){
    var w=new T.MeshPhongMaterial({color:0xf4f0e6, shininess:80}), iris=new T.MeshPhongMaterial({color:0x1a120c, shininess:90});
    [[-1],[1]].forEach(function(s){
      var e=new T.Mesh(new T.SphereGeometry(r, 8, 6), w); e.position.set(s[0]*sx, sy, sz); head.add(e);
      var p=new T.Mesh(new T.SphereGeometry(r*.45, 8, 6), iris); p.position.set(s[0]*sx, sy, sz+r*.55); head.add(p);
    });
  }
  function makeQuad(kind, scale, facing){
    var TEX={lion:'lion',zebra:'zebra',giraffe:'giraffe',elephant:'elephant',deer:'deer',fox:'fox',wolf:'wolf',bear:'bear',polar:'polar',horse:'horse',hippo:'hippo',gazelle:'gazelle'};
    var mat=phong(fur(TEX[kind]||'deer'), kind==='hippo'?40:8);
    var root=new T.Group(); var body=new T.Group(); root.add(body);
    var S={
      lion:{bx:1.15,by:.7,bz:.55, ny:.35, nx:1.15, hx:.42,hy:.38,hz:.38, leg:1.05, lr:.16, neck:.2},
      zebra:{bx:1.2,by:.62,bz:.42, ny:.42, nx:1.2, hx:.38,hy:.32,hz:.28, leg:1.15, lr:.12, neck:.28},
      giraffe:{bx:1.35,by:.7,bz:.45, ny:1.55, nx:.55, hx:.32,hy:.28,hz:.28, leg:1.55, lr:.12, neck:1.4},
      elephant:{bx:1.7,by:1.05,bz:.95, ny:.15, nx:1.45, hx:.55,hy:.45,hz:.5, leg:1.25, lr:.28, neck:.05},
      deer:{bx:.95,by:.5,bz:.35, ny:.45, nx:.95, hx:.32,hy:.28,hz:.26, leg:1.05, lr:.09, neck:.35},
      fox:{bx:.7,by:.32,bz:.28, ny:.18, nx:.72, hx:.28,hy:.22,hz:.22, leg:.55, lr:.07, neck:.12},
      wolf:{bx:1.05,by:.48,bz:.38, ny:.28, nx:1.0, hx:.36,hy:.28,hz:.28, leg:.9, lr:.1, neck:.22},
      bear:{bx:1.2,by:.75,bz:.7, ny:.1, nx:.95, hx:.45,hy:.4,hz:.4, leg:.7, lr:.16, neck:.08},
      polar:{bx:1.35,by:.8,bz:.75, ny:.12, nx:1.05, hx:.48,hy:.42,hz:.42, leg:.75, lr:.18, neck:.1},
      horse:{bx:1.35,by:.7,bz:.48, ny:.45, nx:1.25, hx:.38,hy:.32,hz:.3, leg:1.25, lr:.13, neck:.4},
      hippo:{bx:1.55,by:.85,bz:.85, ny:-.05, nx:1.2, hx:.55,hy:.4,hz:.5, leg:.55, lr:.22, neck:.02},
      gazelle:{bx:.85,by:.45,bz:.3, ny:.5, nx:.85, hx:.28,hy:.24,hz:.22, leg:1.1, lr:.08, neck:.4}
    }[kind]||{bx:1,by:.5,bz:.4, ny:.3, nx:1, hx:.35,hy:.3,hz:.28, leg:1, lr:.12, neck:.25};
    oval(S.bx,S.by,S.bz, mat, 0, S.leg*.55+S.by*.15, 0, body);
    var neck=new T.Group(); neck.position.set(S.nx*.15, S.leg*.55+S.by*.4, 0); body.add(neck);
    oval(Math.max(.12,S.neck*.35), Math.max(.2,S.ny*.55), Math.max(.12,S.neck*.35), mat, 0, S.ny*.35, 0, neck);
    var head=new T.Group(); head.position.set(0, S.ny*.85, 0); neck.add(head);
    oval(S.hx,S.hy,S.hz, mat, S.hx*.4, 0, 0, head);
    oval(S.hx*.7, S.hy*.45, S.hz*.45, mat, S.hx*1.05, -S.hy*.15, 0, head);
    eyePair(head, S.hx*.35, S.hy*.15, S.hz*.55, kind==='elephant'?.07:.055);
    if(kind==='lion') oval(.7,.55,.7, phong(fur('mane'),4), -.05, .05, 0, head);
    if(kind==='elephant'){
      oval(.85,.7,.12, mat, -.15, .05, .42, head); oval(.85,.7,.12, mat, -.15, .05, -.42, head);
      var trunk=new T.Group(); trunk.position.set(S.hx*1.15, -.1, 0); head.add(trunk);
      for(var ti=0;ti<6;ti++) oval(.16-ti*.015, .16-ti*.015, .16-ti*.015, mat, .08, -ti*.22, 0, trunk);
      var tusk=new T.MeshPhongMaterial({color:0xf2ead0, shininess:60});
      [-1,1].forEach(function(s){ var u=new T.Mesh(new T.CylinderGeometry(.04,.02,.7,6), tusk); u.rotation.z=.7*s; u.position.set(.35,-.15,s*.22); head.add(u); });
    }
    if(kind==='deer'||kind==='gazelle'){
      [-1,1].forEach(function(s){ var a=cyl(.02,.01, kind==='gazelle'?.45:.7, 0xddd4c4, s*.12, .45, 0, head); a.rotation.z=s*.25; });
    }
    if(kind==='fox'||kind==='wolf'){
      [-1,1].forEach(function(s){ oval(.08,.16,.04, mat, s*.18, .28, 0, head); });
    }
    oval(.08,.08, kind==='fox'?.35:.55, mat, -S.bx*.9, .1, 0, body);
    var legs=[];
    [[.45,.28],[.45,-.28],[-.5,.28],[-.5,-.28]].forEach(function(p){
      var L=limb(mat, S.leg, S.lr, body); L.hip.position.set(p[0]*S.bx, S.leg*.15, p[1]*S.bz*1.4); legs.push(L);
    });
    root.scale.setScalar(scale||1); root.rotation.y=facing||0;
    group.add(root);
    return {g:root, body:body, neck:neck, head:head, legs:legs, gait:1.7+Math.random()*.6, phase:Math.random()*6, graze:Math.random()<.35, walk:Math.random()>.38};
  }
  function makePenguin(scale, facing){
    var mat=phong(fur('penguin'), 20), root=new T.Group();
    oval(.32,.55,.3, mat, 0, .7, 0, root);
    oval(.2,.18,.18, mat, 0, 1.28, 0, root);
    oval(.12,.08,.1, new T.MeshPhongMaterial({color:0xf0a020, shininess:40}), 0, 1.18, .16, root);
    [-1,1].forEach(function(s){ oval(.06,.28,.16, mat, s*.28, .7, 0, root); });
    root.scale.setScalar(scale||1); root.rotation.y=facing||0; group.add(root);
    return {g:root, body:root, neck:root, head:root, legs:[], gait:2.2, phase:Math.random()*4, waddle:true};
  }

  function knownWorld(id){
    if(!id||id==='mind'||id==='gate') return true;
    try{ return !!(window.MUWorldKnown&&MUWorldKnown(id)); }catch(e){ return false; }
  }
  function markSeen(id){ try{ if(window.MUWorldSeen) MUWorldSeen(id); }catch(e){} }
  function signTex(text, hex){
    var c=document.createElement('canvas'); c.width=512; c.height=180; var g=c.getContext('2d');
    g.textAlign='center'; g.textBaseline='middle';
    g.shadowColor='rgba(0,0,0,.95)'; g.shadowBlur=22;
    g.fillStyle=hex||'#eef1ff';
    g.font=text==='?'?'800 120px Inter,system-ui,sans-serif':'800 52px Inter,system-ui,sans-serif';
    g.fillText(text,256,90);
    var t=new T.CanvasTexture(c); t.needsUpdate=true; return t;
  }
  function doorLabel(text, hex, x,y,z){
    var sp=new T.Sprite(new T.SpriteMaterial({map:signTex(text,hex),transparent:true,depthWrite:false,fog:false}));
    sp.scale.set(text==='?'?6:9, text==='?'?2.1:3.2, 1);
    sp.position.set(x,y,z); group.add(sp); return sp;
  }

  /* ── Worlds gate: five unique doorways on a ring ── */
  function buildGate(){
    scene.fog=new T.Fog(0x070814, 12, 90); scene.background=new T.Color(0x070814);
    lights(0x334466, 0xffe9c8, [20,30,10]);
    box(48,.6,48,0x1a1f3a, 0,0,0); pad(0,0,46,46,0);
    cyl(1.2,1.2,.4, 0xffc44d, 0,.5,0);
    var doors=[
      {id:'mind', name:'Mind Universe', col:0x4f7dff, a:0, note:'Home. Moods, quotes, tracking, diary — neurons in deep space.'},
      {id:'cube', name:'Cube Keep', col:0x2ee6ff, a:1.047, note:'A tower of cubes. You walk floors, top to bottom.'},
      {id:'garden', name:'The Gardens', col:0x19f0b0, a:2.094, note:'Garden after garden along a living path.'},
      {id:'animals', name:'The Living Path', col:0xe8a050, a:3.141, note:'Walk past real-scale animals. They breathe, graze and walk beside you.'},
      {id:'planets', name:'Nearby worlds', col:0xffc44d, a:4.189, note:'The real planets of our sun, close enough to stand by.'},
      {id:'science', name:'Science hall', col:0xff4fa8, a:5.236, note:'Living animations — atom, DNA, gravity, light.'}
    ];
    doors.forEach(function(d,i){
      var r=16, x=Math.cos(d.a)*r, z=Math.sin(d.a)*r;
      box(5,9,.8, d.col, x,4.5,z);
      box(3.2,6.4,.2, 0x05060c, x+Math.cos(d.a)*.6, 3.6, z+Math.sin(d.a)*.6);
      box(2,2,2, d.col, x, 10.2, z);
      pad(x,z,8,8,0);
      var hex='#'+('000000'+d.col.toString(16)).slice(-6);
      var known=knownWorld(d.id);
      doorLabel(known?d.name:'?', hex, x, 12.4, z);
      stops.push({id:d.id, name:known?d.name:'?', trueName:d.name, pos:V(x*.7,.2,z*.7), look:V(x,3,z), plaque:known?d.note:'A sealed doorway. Walk in to discover this universe.', world:d.id==='mind'?'mind':d.id, col:hex});
    });
    for(var s=0;s<(lite?40:90);s++) sph(.06+Math.random()*.08, 0xffffff, rnd(-40,40), rnd(4,28), rnd(-40,40));
    px=0; pz=8; py=eye; lookYaw=Math.PI; lookPitch=0; stopI=0;
  }

  /* ── Cube Keep: stacked floors, walk, spiral down ── */
  function buildCube(){
    scene.fog=new T.Fog(0x0a1020, 18, 120); scene.background=new T.Color(0x0a1020);
    lights(0x445577, 0xaad4ff, [30,80,20]);
    var FLOORS=[
      {n:'Deep gate', note:'The bottom. A doorway toward the planets.', play:null, link:'planets'},
      {n:'Training cubes', note:'Learn the walk. Hold to move. Drag to look. No flying here.', play:null},
      {n:'Night farm door', note:'A greenhouse cube. Opens the garden world, or the farm game.', play:'garden', link:'garden'},
      {n:'Action floor', note:'Star roll and neon cabinets live on this storey.', play:'cube'},
      {n:'Arcade floor', note:'Original games on the keep. Sit at a cabinet.', play:'ball'},
      {n:'Cozy floor', note:'Softer rooms. Heartbeat, jewels, a companion.', play:'pet'},
      {n:'Puzzle floor', note:'Quiet cubes for thinking.', play:'merge'},
      {n:'Observatory', note:'The roof of the keep. You start here and walk down.'}
    ];
    var FH=15, size=22;
    for(var f=0;f<FLOORS.length;f++){
      var y=f*FH, tint=f%2?0x243056:0x1b2444;
      box(size,.7,size, tint, 0,y,0); pad(0,0,size-1.5,size-1.5,y);
      box(3,2.2,3, 0x0d1224, size/2-3, y+1.4, size/2-3);
      box(2.4,3.5,2.4, [0x2ee6ff,0x19f0b0,0xffc44d,0xff4fa8,0xa45cff,0x4f7dff,0xff8a3d,0xffffff][f], -size/2+4, y+2.4, -size/2+4);
      for(var k=0;k<4;k++) box(1.6+k%2,.9,1.6, 0x2a3558, rnd(-8,8), y+.8, rnd(-8,8));
      var steps=lite?6:10;
      for(var s=0;s<steps;s++){
        var a=(s/steps)*Math.PI*2 + f*.4, rr=7.2, sy=y - (s+1)*(FH/steps) + FH;
        if(sy<0) continue;
        var sx=Math.cos(a)*rr, sz=Math.sin(a)*rr;
        box(2.2,.45,2.2, 0x3dffd0, sx, sy, sz); pad(sx,sz,2.4,2.4,sy);
      }
      var look=V(0, y+eye, size*.32);
      stops.push({id:'f'+f, name:'Floor '+(FLOORS.length-f)+' · '+FLOORS[f].n, pos:V(0,y, size*.28), look:V(0,y+1.4,0), plaque:FLOORS[f].note, play:FLOORS[f].play, world:FLOORS[f].link, y:y});
    }
    box(3, FLOORS.length*FH+4, 3, 0x12182c, 0, FLOORS.length*FH/2, 0);
    stops.reverse();
    var top=FLOORS.length-1;
    px=0; pz=size*.28; py=top*FH+eye; lookYaw=Math.PI; lookPitch=-.12; stopI=0;
  }

  /* ── Gardens: sequential gardens along a path ── */
  function tree(x,y,z,h,leaf){
    cyl(.18,.28,h, 0x5a3a22, x, y+h/2, z);
    sph(h*.55, leaf||0x2d8a4e, x, y+h+.2, z);
  }
  function flower(x,y,z,c){ sph(.18,c,x,y+.3,z); cyl(.04,.04,.4,0x2d6a3a,x,y+.15,z); }
  function buildGarden(){
    scene.fog=new T.Fog(0xcfe8c4, 20, 110); scene.background=new T.Color(0xb7d7a8);
    lights(0xfff4d6, 0xffe7a8, [10,40,20]);
    var GARDENS=[
      {n:'Welcome meadow', note:'The first garden. Walk the pale path. More gardens wait ahead.', ground:0x7bb35a},
      {n:'Herb knot', note:'Rosemary, mint, thyme in a knot. Smell is imagined. The path is real.', ground:0x6aa34e},
      {n:'Night vegetable', note:'The night farm’s cousins, grown in rows. Open the farm game from here.', ground:0x4e8a3d, play:'garden'},
      {n:'Orchard', note:'Fruit trees in two ranks. Walk between them.', ground:0x5b9144},
      {n:'Water garden', note:'A still pool. Lilies. The path skirts the edge.', ground:0x4a7d6a},
      {n:'Rose court', note:'A square of roses. Slow down.', ground:0x6b8f4a},
      {n:'Wildflower ridge', note:'Colour without order. Bees would like it.', ground:0x7aa356},
      {n:'Moon garden', note:'White blooms for night. A doorway toward the living animals at the end.', ground:0x5d7a62, link:'animals'}
    ];
    var pathZ=0;
    GARDENS.forEach(function(g,i){
      var z=-i*38; pathZ=z;
      box(34,.4,32, g.ground, 0,0,z); pad(0,z,32,30,0);
      box(3.2,.12,32, 0xcbb896, 0,.28,z);
      if(i===4){ var pool=new T.Mesh(new T.CircleGeometry(6, lite?12:24), new T.MeshLambertMaterial({color:0x3aa0c8})); pool.rotation.x=-Math.PI/2; pool.position.set(0,.35,z); group.add(pool); }
      for(var t=0;t<(lite?4:8);t++) tree(rnd(-14,14),0,z+rnd(-12,12), rnd(2.4,4.2), i===7?0xdde8d0:0x2d8a4e);
      for(var fl=0;fl<(lite?8:18);fl++) flower(rnd(-12,12),0,z+rnd(-10,10), [0xff4fa8,0xffc44d,0xffffff,0xff8a3d,0xa45cff][fl%5]);
      if(i===2){ for(var r=0;r<6;r++) box(1.1,.35,8, 0x6b4423, -8+r*3.2, .4, z); }
      stops.push({id:'g'+i, name:g.n, pos:V(0,.2,z+10), look:V(0,1.6,z-6), plaque:g.note, play:g.play, world:g.link});
    });
    box(3.2,.12, GARDENS.length*38+20, 0xcbb896, 0,.26, -GARDENS.length*19);
    px=0; pz=12; py=eye; lookYaw=Math.PI; lookPitch=-.08; stopI=0;
  }

  /* ── Living Path: walk past animals at true scale ── */
  function grassTex(){
    var c=document.createElement('canvas'); c.width=c.height=256; var g=c.getContext('2d'), i;
    g.fillStyle='#3e6b2e'; g.fillRect(0,0,256,256);
    for(i=0;i<5000;i++){ g.strokeStyle='rgba('+(40+Math.random()*40)+','+(90+Math.random()*50)+',30,'+(0.2+Math.random()*.45)+')';
      var x=Math.random()*256, y=Math.random()*256; g.beginPath(); g.moveTo(x,y); g.lineTo(x+(Math.random()-.5)*4, y-5-Math.random()*10); g.stroke(); }
    var t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(28,90); t.needsUpdate=true; return t;
  }
  function dirtTex(){
    var c=document.createElement('canvas'); c.width=c.height=128; var g=c.getContext('2d'), i;
    g.fillStyle='#8a6a3e'; g.fillRect(0,0,128,128);
    for(i=0;i<800;i++){ g.fillStyle='rgba(60,40,18,'+Math.random()*.25+')'; g.fillRect(Math.random()*128,Math.random()*128,2,2); }
    var t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(2,80); t.needsUpdate=true; return t;
  }
  function placeBeast(a, x, z){
    a.g.position.set(x, 0, z);
    a.g.rotation.y = Math.PI/2 + (x>0 ? -0.18 : 0.18);
    a.homeX=x; a.homeZ=z; a.side=x>0?1:-1;
    herd.push(a);
  }
  function buildAnimals(){
    scene.fog=new T.Fog(0xc9d6b8, 22, 95); scene.background=new T.Color(0x9ec4ea);
    group.add(new T.HemisphereLight(0xcfe8ff, 0x6b8f4a, .85));
    var sun=new T.DirectionalLight(0xfff1d0, .9); sun.position.set(18,40,10); group.add(sun);
    var LEN=320;
    var ground=new T.Mesh(new T.PlaneGeometry(70, LEN), new T.MeshLambertMaterial({map:grassTex()}));
    ground.rotation.x=-Math.PI/2; ground.position.set(0,0,-LEN/2+20); group.add(ground);
    var path=new T.Mesh(new T.PlaneGeometry(3.4, LEN), new T.MeshLambertMaterial({map:dirtTex()}));
    path.rotation.x=-Math.PI/2; path.position.set(0,.04,-LEN/2+20); group.add(path);
    pad(0, -LEN/2+20, 8, LEN, 0);
    var BIOMES=[
      {z:8, n:'The gate meadow', note:'A dirt track. Animals live beside it, not in space. Walk slowly. Look as you pass.', sky:null},
      {z:-36, n:'Horses of the field', note:'A mare and foal. Hide, muscle, breath. They graze as you go by.', kinds:[['horse',1.15],['horse',.78]]},
      {z:-78, n:'Savanna edge', note:'Zebra and gazelle. Stripes and tan coats in real sun.', kinds:[['zebra',1],['zebra',.9],['gazelle',.85],['gazelle',.8]]},
      {z:-122, n:'The watering place', note:'Elephant and hippo. Wrinkled grey, wet hide. Stand a moment.', kinds:[['elephant',1.35],['hippo',1.15]]},
      {z:-164, n:'Cat country', note:'A lion in the grass. The mane is the first thing you see.', kinds:[['lion',1.05],['gazelle',.82]]},
      {z:-206, n:'Tall grass', note:'Giraffe. You look up. That is how close they are.', kinds:[['giraffe',1.45],['giraffe',1.2]]},
      {z:-248, n:'The woods', note:'Deer, fox, wolf, bear — the forest standing off the path.', kinds:[['deer',.95],['deer',.8],['fox',.7],['wolf',.95],['bear',1.05]]},
      {z:-288, n:'The white shore', note:'Polar bear and penguins. Cold light, still walking.', kinds:[['polar',1.1]], extra:'cold', link:'garden'}
    ];
    BIOMES.forEach(function(b,i){
      var gcol=b.extra==='cold'?0xdde8ea:0x4a7a32;
      box(22,.08,18, gcol, 0, .02, b.z);
      (b.kinds||[]).forEach(function(k,j){
        var side=j%2?1:-1, x=side*(6.4+j*.7), z=b.z+(j-1)*2.4;
        placeBeast(makeQuad(k[0], k[1], 0), x, z);
      });
      if(b.extra==='cold'){
        placeBeast(makePenguin(.95, 0), 5.5, b.z+3);
        placeBeast(makePenguin(.8, 0), 6.6, b.z+1.2);
        placeBeast(makePenguin(.7, 0), -6.2, b.z+2);
      }
      if(i>1 && i<6){ for(var t=0;t<(lite?2:4);t++) tree(rnd(10,18)*(t%2?1:-1),0,b.z+rnd(-6,6), rnd(3.2,5.2)); }
      stops.push({id:'a'+i, name:b.n, pos:V(0, eye, b.z+8), look:V(7, 1.4, b.z), plaque:b.note, world:b.link});
    });
    px=0; pz=14; py=eye; lookYaw=Math.PI; lookPitch=-.06; stopI=0;
  }

  /* ── Planets: real solar-system bodies, orbital transfer path ── */
  var PLANET_DATA=[
    {id:'sun', n:'The Sun', kind:'sun', au:0, r:18, fact:'A star. 99.8% of the solar system’s mass. Light takes 8 minutes to reach Earth.'},
    {id:'mercury', n:'Mercury', kind:'mercury', au:.39, r:1.6, fact:'Closest planet. No moons. A day is longer than its year. −170°C to 430°C.'},
    {id:'venus', n:'Venus', kind:'venus', au:.72, r:2.4, fact:'Earth’s twin in size. Hottest planet — thick CO₂ air and a runaway greenhouse.'},
    {id:'earth', n:'Earth', kind:'earth', au:1, r:2.6, fact:'The only world known to hold life. 71% water. One large moon.'},
    {id:'moon', n:'The Moon', kind:'moon', au:1.08, r:.9, fact:'Earth’s companion. 384,000 km away. Same face always toward us.'},
    {id:'mars', n:'Mars', kind:'mars', au:1.52, r:1.8, fact:'The red planet. Two small moons. Polar ice. The most visited after Earth.'},
    {id:'jupiter', n:'Jupiter', kind:'jupiter', au:5.2, r:8.4, fact:'Largest planet. A gas giant. The Great Red Spot is a storm older than we are.'},
    {id:'saturn', n:'Saturn', kind:'saturn', au:9.5, r:7.2, fact:'The ringed world. Its rings are ice and dust, tens of thousands of kilometres wide.'},
    {id:'uranus', n:'Uranus', kind:'uranus', au:19.2, r:4.2, fact:'Ice giant, tilted on its side. Faint rings. 27 known moons.'},
    {id:'neptune', n:'Neptune', kind:'neptune', au:30, r:4.0, fact:'The farthest planet. Winds over 2,000 km/h. Discovered by maths before it was seen.'}
  ];
  function buildPlanets(){
    scene.fog=new T.Fog(0x020208, 40, 420); scene.background=new T.Color(0x020208);
    lights(0x223355, 0xfff1d6, [40,20,80]);
    var sunL=new T.PointLight(0xfff1d6, 1.4, 500); sunL.position.set(0,0,0); group.add(sunL);
    PLANET_DATA.forEach(function(p,i){
      var x=p.au===0?0: 28+Math.sqrt(p.au)*38;
      var mesh=sph(p.r, 0xffffff, x, 0, 0, ptex(p.kind));
      if(p.id==='saturn'){
        var ring=new T.Mesh(new T.RingGeometry(p.r*1.35, p.r*2.2, lite?24:48), new T.MeshBasicMaterial({color:0xe8d3a4, side:T.DoubleSide, transparent:true, opacity:.7}));
        ring.rotation.x=-1.15; mesh.add(ring);
      }
      planets.push({d:p, m:mesh, x:x});
      var vx=x + p.r + 9, vz=p.r*1.6+6;
      stops.push({id:p.id, name:p.n, pos:V(vx, p.r*.4+3, vz), look:V(x,0,0), plaque:p.fact});
    });
    for(var s=0;s<(lite?80:220);s++){
      var u=Math.random()*2-1, th=Math.random()*Math.PI*2, rr=180+Math.random()*400, q=Math.sqrt(1-u*u);
      sph(.15, 0xffffff, q*Math.cos(th)*rr, u*rr*.4, q*Math.sin(th)*rr);
    }
    stopI=3; var st=stops[stopI]; px=st.pos.x; py=st.pos.y; pz=st.pos.z;
    lookYaw=Math.atan2(-(st.look.x-px), -(st.look.z-pz)); lookPitch=-.15;
  }

  /* ── Science hall: exhibit rail with living animations ── */
  function buildScience(){
    scene.fog=new T.Fog(0x0c1024, 16, 90); scene.background=new T.Color(0x0c1024);
    lights(0x556688, 0xffffff, [8,20,10]);
    var HALL=[
      {n:'The atom', note:'A nucleus, electrons in shells. Most of an atom is empty space.', kind:'atom'},
      {n:'DNA', note:'A double helix. The code of living things, turning slowly.', kind:'dna'},
      {n:'Light', note:'A wave and a particle. Colour is wavelength.', kind:'wave'},
      {n:'Gravity', note:'Mass tells space how to curve. Moons fall around a world.', kind:'grav'},
      {n:'The cell', note:'A living room. Membrane, nucleus, the quiet work of being alive.', kind:'cell'},
      {n:'Pendulum', note:'Same time, every swing — if the length stays the same.', kind:'pend'},
      {n:'Fusion', note:'How the Sun shines. Hydrogen into helium, light as leftover.', kind:'fusion'},
      {n:'A neuron', note:'Back toward Mind. A cell that sparks. You have about 86 billion.', kind:'neuron', link:'gate'}
    ];
    box(16,.5, HALL.length*28+20, 0x1a2040, 0,0, -HALL.length*14); pad(0, -HALL.length*14, 14, HALL.length*28+16, 0);
    HALL.forEach(function(h,i){
      var z=-i*28;
      box(14,.2,10, 0x222a52, 0,.2,z);
      var g=new T.Group(); g.position.set(0, 3.2, z-2); group.add(g); anims.push({kind:h.kind, g:g});
      if(h.kind==='atom'){ sph(.45,0xff8a3d,0,0,0,null,g); for(var e=0;e<3;e++){ var el=sph(.12,0x2ee6ff,1.6,0,0,null,g); el.userData={shell:e}; } }
      if(h.kind==='dna'){ for(var k=0;k<12;k++){ var yk=k*.38-2.2, a=k*.7; sph(.14,0x4f7dff, Math.cos(a)*.7, yk, Math.sin(a)*.7,null,g); sph(.14,0xff4fa8, Math.cos(a+Math.PI)*.7, yk, Math.sin(a+Math.PI)*.7,null,g); } }
      if(h.kind==='wave'){ var pts=[]; for(var w=0;w<24;w++) pts.push(V(-3+w*.26, Math.sin(w*.5), 0)); var line=new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({color:0xffc44d})); g.add(line); g.userData.wave=line; }
      if(h.kind==='grav'){ sph(1.1,0x4f7dff,0,0,0,null,g); var mo=sph(.28,0xcfd6ff,2.4,0,0,null,g); g.userData.moon=mo; }
      if(h.kind==='cell'){ sph(1.6,0x19f0b0,0,0,0,null,g); sph(.55,0xffc44d,0,.15,0,null,g); }
      if(h.kind==='pend'){ cyl(.04,.04,2.4,0xcfd6ff,0,-.4,0,g); var bob=sph(.35,0xffc44d,0,-1.7,0,null,g); g.userData.bob=bob; }
      if(h.kind==='fusion'){ sph(.8,0xffb347,0,0,0,null,g); sph(.35,0xff7a2d,.9,.2,0,null,g); sph(.35,0xff7a2d,-.8,-.1,0,null,g); }
      if(h.kind==='neuron'){ sph(.5,0x4f7dff,0,0,0,null,g); for(var d=0;d<6;d++){ var ang=d/6*Math.PI*2; cyl(.05,.02,1.6,0x7aa0ff, Math.cos(ang)*.8, Math.sin(ang)*.8, 0, g); } }
      stops.push({id:'s'+i, name:h.n, pos:V(0, eye, z+7), look:V(0,3.2,z-2), plaque:h.note, world:h.link});
    });
    stopI=0; px=0; pz=7; py=eye; lookYaw=Math.PI; lookPitch=.05;
  }

  function stepAnims(t){
    anims.forEach(function(a){
      if(a.kind==='atom') a.g.children.forEach(function(ch,i){ if(ch.userData.shell==null) return; var s=1.2+ch.userData.shell*.55, w=t*(1.2+i); ch.position.set(Math.cos(w)*s, Math.sin(w*.7)*s*.3, Math.sin(w)*s); });
      if(a.kind==='dna') a.g.rotation.y=t*.4;
      if(a.kind==='wave'&&a.g.userData.wave){ var geo=a.g.userData.wave.geometry, p=geo.attributes&&geo.attributes.position; if(p){ for(var i=0;i<p.count;i++) p.setY(i, Math.sin(i*.5+t*2)*.6); p.needsUpdate=true; } }
      if(a.kind==='grav'&&a.g.userData.moon){ var m=a.g.userData.moon; m.position.set(Math.cos(t)*2.4, Math.sin(t*.3)*.4, Math.sin(t)*2.4); }
      if(a.kind==='pend'&&a.g.userData.bob){ var ang=Math.sin(t*1.4)*.55; a.g.userData.bob.position.set(Math.sin(ang)*1.7, -1.7*Math.cos(ang), 0); }
      if(a.kind==='fusion') a.g.rotation.y=t*.8;
      if(a.kind==='neuron') a.g.rotation.y=t*.2;
      if(a.kind==='cell') a.g.scale.setScalar(1+Math.sin(t)*.06);
    });
    planets.forEach(function(p){ p.m.rotation.y+=0.003; });
  }

  function onPad(x,z){
    var best=null, by=-1e9;
    for(var i=0;i<pads.length;i++){ var p=pads[i]; if(Math.abs(x-p.x)<p.w/2 && Math.abs(z-p.z)<p.d/2 && p.y>by && p.y<=py+0.6){ by=p.y; best=p; } }
    return best;
  }

  function lookDir(){
    var c=Math.cos(lookPitch), fx=-Math.sin(lookYaw)*c, fy=Math.sin(lookPitch), fz=-Math.cos(lookYaw)*c;
    return V(fx,fy,fz);
  }

  function applyLook(){
    var d=lookDir();
    cam.position.set(px,py,pz);
    cam.lookAt(px+d.x, py+d.y, pz+d.z);
  }

  function walkStep(dt){
    var spd=(keys.shift?9:5.4)*dt, f=0, s=0;
    if(keys.w||keys.arrowup||keys[' ']||walkOn) f+=1;
    if(keys.s||keys.arrowdown) f-=1;
    if(keys.a||keys.arrowleft) s-=1;
    if(keys.d||keys.arrowright) s+=1;
    var yaw=lookYaw, nx=px+(-Math.sin(yaw)*f + Math.cos(yaw)*s)*spd, nz=pz+(-Math.cos(yaw)*f - Math.sin(yaw)*s)*spd;
    var p=onPad(nx,nz);
    if(p){ px=nx; pz=nz; var want=p.y+eye; py+=(want-py)*Math.min(1,dt*10); vy=0; }
    else {
      var p2=onPad(px,nz); if(p2){ pz=nz; py=p2.y+eye; }
      var p3=onPad(nx,pz); if(p3){ px=nx; py=p3.y+eye; }
    }
    applyLook();
  }

  function startRide(i){
    i=(i+stops.length)%stops.length; if(!stops[i]) return;
    var to=stops[i], from=V(px,py,pz), lookFrom=lookDir().add(V(px,py,pz));
    var mid=from.clone().lerp(to.pos,.5); mid.y+=6;
    ride={t0:performance.now(), dur: META[cur]&&META[cur].move==='rail'? 2200: 1600, curve:new T.CatmullRomCurve3([from, mid, to.pos.clone()]), to:to, i:i};
    stopI=i; paintHud(); FX('warp');
  }

  function rideStep(){
    var k=Math.min(1,(performance.now()-ride.t0)/ride.dur), e=k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    ride.curve.getPoint(e, cam.position); px=cam.position.x; py=cam.position.y; pz=cam.position.z;
    var L=ride.to.look; cam.lookAt(L.x,L.y,L.z);
    lookYaw=Math.atan2(-(L.x-px), -(L.z-pz));
    if(k>=1){ var st=ride.to; ride=null; px=st.pos.x; py=st.pos.y; pz=st.pos.z; applyLook(); paintHud(); }
  }

  function paintHud(){
    if(!hud) return;
    var m=META[cur]||{}, st=stops[stopI]||{};
    var known=!st.world||st.world==='mind'||knownWorld(st.world);
    var nm=known?(st.trueName||st.name):'?';
    hud.querySelector('#whName').textContent=m.name||'';
    hud.querySelector('#whStop').textContent=nm;
    hud.querySelector('#whHint').textContent=m.hint||'';
    hud.querySelector('#whCard').innerHTML='<b>'+nm+'</b><p>'+(known?(st.plaque||''):'A sealed doorway. Walk in to discover this universe.')+'</p>'+(known&&st.play?'<button type="button" data-wplay="'+st.play+'">Play here</button>':'')+(st.world?'<button type="button" data-wworld="'+st.world+'">'+(st.world==='mind'?'Back to Mind':(known?'Enter this world':'Enter ?'))+'</button>':'');
    var map=document.getElementById('whMap');
    if(map){
      var worlds=[{id:'gate',n:'Gate',ch:'G'},{id:'cube',n:'Cube Keep',ch:'C'},{id:'garden',n:'Gardens',ch:'N'},{id:'animals',n:'Living Path',ch:'A'},{id:'planets',n:'Planets',ch:'P'},{id:'science',n:'Science',ch:'S'}];
      map.innerHTML=worlds.map(function(w){ var k=w.id==='gate'||knownWorld(w.id); return '<button type="button" data-ww="'+w.id+'" class="'+(w.id===cur?'here':'')+(k?'':' unk')+'" title="'+(k?w.n:'Unknown world')+'">'+(k?w.ch:'?')+'</button>'; }).join('');
    }
    hud.querySelectorAll('[data-ww]').forEach(function(b){ b.classList.toggle('here', b.dataset.ww===cur); });
    hud.querySelector('#whPath').innerHTML=stops.map(function(s,i){ var k=!s.world||s.world==='mind'||knownWorld(s.world); return '<i class="'+(i===stopI?'on':'')+(k?'':' unk')+'" title="'+(k?(s.trueName||s.name):'?')+'"></i>'; }).join('');
  }

  function nearestStop(){
    var best=0, bd=1e9;
    stops.forEach(function(s,i){ var d=Math.hypot(s.pos.x-px, s.pos.z-pz); if(d<bd){ bd=d; best=i; } });
    if(best!==stopI){ stopI=best; paintHud(); }
  }

  function boot(id){
    kill();
    host=document.getElementById('worldLayer'); hud=document.getElementById('worldHud');
    if(!host||!T) return;
    renderer=new T.WebGLRenderer({antialias:!lite, alpha:false, powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1, lite?1.15:1.5));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x000000,1);
    host.appendChild(renderer.domElement);
    scene=new T.Scene(); cam=new T.PerspectiveCamera(62, innerWidth/innerHeight, .12, 2000);
    clock=new T.Clock(); group=new T.Group(); scene.add(group);
    pads=[]; stops=[]; anims=[]; planets=[]; ride=null; keys={}; walkOn=0;
    cur=id;
    if(id==='cube') buildCube();
    else if(id==='garden') buildGarden();
    else if(id==='animals') buildAnimals();
    else if(id==='planets') buildPlanets();
    else if(id==='science') buildScience();
    else { cur='gate'; buildGate(); }
    applyLook(); paintHud();
    running=true; loop();
    addEventListener('resize', onResize);
  }

  function onResize(){ if(!renderer) return; renderer.setSize(innerWidth,innerHeight); cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); }

  function kill(){
    running=false;
    removeEventListener('resize', onResize);
    if(renderer){ try{ renderer.dispose(); }catch(e){} if(renderer.domElement&&renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); }
    renderer=null; scene=null; cam=null; group=null; pads=[]; stops=[]; anims=[]; planets=[];
  }

  function loop(){
    if(!running||!renderer) return;
    var dt=Math.min(clock.getDelta(), .05), t=clock.elapsedTime;
    if(ride) rideStep();
    else if(META[cur] && META[cur].move==='walk'){ walkStep(dt); nearestStop(); }
    else applyLook();
    stepAnims(t);
    renderer.render(scene,cam);
    requestAnimationFrame(loop);
  }

  function enter(id){
    if(id==='mind'){ leave(); return; }
    document.body.classList.add('in-world');
    try{ if(window.HMind&&HMind.pause) HMind.pause(true); }catch(e){}
    markSeen(id||'gate');
    FX('warp'); toast(knownWorld(id||'gate')?'Crossing into another world':'Crossing into ?');
    boot(id||'gate');
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
    if(!hud||!host) return;
    hud.addEventListener('click', function(e){
      var b=e.target.closest('button'); if(!b) return;
      if(b.id==='whExit'){ leave(); return; }
      if(b.id==='whPrev'){ startRide(stopI-1); return; }
      if(b.id==='whNext'){ startRide(stopI+1); return; }
      if(b.dataset.ww){ enter(b.dataset.ww); return; }
      if(b.dataset.wworld){ if(b.dataset.wworld==='mind') leave(); else enter(b.dataset.wworld); return; }
      if(b.dataset.wplay && window.MUPlay){ leave(); setTimeout(function(){ MUPlay.open(b.dataset.wplay); }, 200); }
    });
    host.addEventListener('pointerdown', function(e){ if(!running) return; drag={x:e.clientX,y:e.clientY,id:e.pointerId}; if(small) walkOn=1; try{ host.setPointerCapture(e.pointerId); }catch(_){} });
    host.addEventListener('pointermove', function(e){ if(!drag||e.pointerId!==drag.id) return; lookYaw-=(e.clientX-drag.x)*0.0045; lookPitch=clamp(lookPitch-(e.clientY-drag.y)*0.0035, -1.1, 1.1); drag.x=e.clientX; drag.y=e.clientY; if(!ride && META[cur]&&META[cur].move!=='walk') applyLook(); });
    ['pointerup','pointercancel'].forEach(function(n){ host.addEventListener(n, function(e){ if(drag&&e.pointerId===drag.id){ drag=null; walkOn=0; } }); });
    addEventListener('keydown', function(e){ if(!running||e.target.closest('input,textarea')) return; var k=e.key.toLowerCase();
      if(k==='escape'){ leave(); return; }
      if(k==='enter'){ var st=stops[stopI]; if(st&&st.world){ if(st.world==='mind') leave(); else enter(st.world); return; } }
      if(k==='q'){ startRide(stopI-1); return; }
      if(k==='e'){ startRide(stopI+1); return; }
      keys[k]=1; });
    addEventListener('keyup', function(e){ delete keys[e.key.toLowerCase()]; });
  }

  window.MUWorlds={enter:enter, leave:leave, bind:bind, current:function(){ return cur; }, active:function(){ return running; }};
})();
