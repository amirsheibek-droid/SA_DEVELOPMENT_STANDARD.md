/* S·A Intelligent Designs: "flight through a neural mind" background.
   White/silver space, electric-blue + green synapses, glass cubes that crash and shatter.
   Needs three.js r128 (window.THREE). Exposes window.SANeural.{warp(dir), page(id)}. */
(function(){
  var T=window.THREE, host=document.getElementById('neural');
  if(!T||!host) return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small=Math.min(innerWidth,innerHeight)<700;
  var renderer; try{ renderer=new T.WebGLRenderer({antialias:!small,alpha:true,powerPreference:'high-performance'}); }catch(e){ return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, small?1.5:1.75));
  renderer.setClearColor(0x000000,0);
  host.appendChild(renderer.domElement);
  var scene=new T.Scene();
  scene.fog=new T.Fog(0xeef2f8, 80, 280);
  var cam=new T.PerspectiveCamera(60,1,0.1,500);
  function size(){ var w=innerWidth,h=innerHeight; renderer.setSize(w,h); cam.aspect=w/h; cam.updateProjectionMatrix(); }
  size(); addEventListener('resize',size);

  var BLUE=new T.Color('#1f6bff'), CYAN=new T.Color('#12a8ff'), GREEN=new T.Color('#12d98a'), SILVER=new T.Color('#8f9bb0'), STEEL=new T.Color('#5d6b84');
  function rnd(a,b){ return a+Math.random()*(b-a); }

  // soft round sprite
  function dotTex(inner, outer){
    var c=document.createElement('canvas'); c.width=c.height=64; var g=c.getContext('2d');
    var gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,inner); gr.addColorStop(.35,inner); gr.addColorStop(1,outer);
    g.fillStyle=gr; g.fillRect(0,0,64,64); var t=new T.CanvasTexture(c); return t;
  }
  var DOT=dotTex('rgba(255,255,255,1)','rgba(255,255,255,0)');

  scene.add(new T.AmbientLight(0xffffff,.75));
  var key=new T.DirectionalLight(0xdfe9ff,.9); key.position.set(-20,30,40); scene.add(key);
  var gl=new T.PointLight(0x12d98a,1.1,160); gl.position.set(30,-10,-40); scene.add(gl);
  var bl=new T.PointLight(0x1f6bff,1.2,160); bl.position.set(-30,20,-30); scene.add(bl);

  /* ── The brain: point cloud + neural wiring + firing synapses ── */
  var brain=new T.Group(); scene.add(brain);
  var N=small?1300:2400, P=[], col=[];
  function fold(x,y,z){ return 1+0.075*Math.sin(9*x+2*y)*Math.sin(8*y+3*z)*Math.sin(7*z+x)+0.03*Math.sin(23*x*y+11*z); }
  for(var i=0;i<N;i++){
    var s=i%2?1:-1, u=Math.random()*2-1, th=Math.random()*Math.PI*2, r=Math.sqrt(1-u*u);
    var x=r*Math.cos(th), y=u, z=r*Math.sin(th), inner=Math.random()<0.14?rnd(.35,.8):1;
    var f=fold(x,y,z)*inner;
    x=x*0.62*f; y=y*0.78*f; z=z*1.05*f;
    if(y<-0.25) y*=0.72;                         // flatter underside
    if(z>0.55 && y<0) y*=0.85;
    x=s*(0.06+Math.abs(x));                      // two hemispheres with a gap
    P.push(new T.Vector3(x*16,y*16,z*16));
  }
  // cerebellum + stem
  for(var k=0;k<(small?160:280);k++){
    var a=Math.random()*Math.PI*2,b=Math.random()*Math.PI, rr=rnd(.7,1);
    P.push(new T.Vector3(Math.cos(a)*Math.sin(b)*5.4*rr, -9+Math.cos(b)*2.6*rr, -11+Math.sin(a)*Math.sin(b)*3.4*rr));
  }
  for(var k2=0;k2<(small?40:70);k2++){ P.push(new T.Vector3(rnd(-1.2,1.2), rnd(-17,-9), rnd(-6,-3))); }
  var pos=new Float32Array(P.length*3), pc=new Float32Array(P.length*3);
  P.forEach(function(p,i){ pos[i*3]=p.x; pos[i*3+1]=p.y; pos[i*3+2]=p.z;
    var q=Math.random(), c=q<.52?SILVER.clone().lerp(STEEL,Math.random()):(q<.82?BLUE.clone().lerp(CYAN,Math.random()):GREEN);
    col.push(c); pc[i*3]=c.r; pc[i*3+1]=c.g; pc[i*3+2]=c.b; });
  var bg=new T.BufferGeometry(); bg.setAttribute('position',new T.BufferAttribute(pos,3)); bg.setAttribute('color',new T.BufferAttribute(pc,3));
  var bpts=new T.Points(bg,new T.PointsMaterial({size:small?.55:.48,map:DOT,vertexColors:true,transparent:true,opacity:.95,depthWrite:false,sizeAttenuation:true}));
  brain.add(bpts);
  // wiring: connect each sampled neuron to its 2 nearest neighbours
  var edges=[], adj=P.map(function(){return [];}), M=small?700:1300;
  for(var e=0;e<M;e++){
    var ai=(Math.random()*P.length)|0, best=[1e9,1e9], bi=[-1,-1];
    for(var j=0;j<P.length;j+=2){ if(j===ai) continue; var d=P[ai].distanceToSquared(P[j]);
      if(d<best[0]){ best[1]=best[0]; bi[1]=bi[0]; best[0]=d; bi[0]=j; } else if(d<best[1]){ best[1]=d; bi[1]=j; } }
    for(var t=0;t<2;t++) if(bi[t]>=0 && best[t]<9){ edges.push([ai,bi[t]]); adj[ai].push(edges.length-1); adj[bi[t]].push(edges.length-1); }
  }
  // long-range axons across the brain
  for(var e2=0;e2<(small?40:80);e2++){ var a1=(Math.random()*N)|0, a2=(Math.random()*N)|0; if(P[a1].distanceTo(P[a2])<22){ edges.push([a1,a2]); adj[a1].push(edges.length-1); adj[a2].push(edges.length-1);} }
  var lp=new Float32Array(edges.length*6), lc=new Float32Array(edges.length*6);
  edges.forEach(function(E,i){ var A=P[E[0]],B=P[E[1]]; lp.set([A.x,A.y,A.z,B.x,B.y,B.z],i*6);
    var c=col[E[0]].clone().lerp(SILVER,.35); lc.set([c.r,c.g,c.b,c.r,c.g,c.b],i*6); });
  var lg=new T.BufferGeometry(); lg.setAttribute('position',new T.BufferAttribute(lp,3)); lg.setAttribute('color',new T.BufferAttribute(lc,3));
  brain.add(new T.LineSegments(lg,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.42,depthWrite:false})));
  // synapse pulses travelling along the wiring
  var NP=small?50:110, pulses=[], pp=new Float32Array(NP*3), pcol=new Float32Array(NP*3);
  for(var n=0;n<NP;n++){ pulses.push({e:(Math.random()*edges.length)|0,t:Math.random(),v:rnd(.8,2.2),fw:Math.random()<.5});
    var c3=Math.random()<.55?BLUE:GREEN; pcol.set([c3.r,c3.g,c3.b],n*3); }
  var pg=new T.BufferGeometry(); pg.setAttribute('position',new T.BufferAttribute(pp,3)); pg.setAttribute('color',new T.BufferAttribute(pcol,3));
  var pulsePts=new T.Points(pg,new T.PointsMaterial({size:small?1.5:1.35,map:DOT,vertexColors:true,transparent:true,depthWrite:false}));
  brain.add(pulsePts);
  // soft glow core
  var glowTex=dotTex('rgba(31,107,255,.55)','rgba(18,217,138,0)');
  var core=new T.Sprite(new T.SpriteMaterial({map:glowTex,transparent:true,opacity:.35,depthWrite:false})); core.scale.set(46,40,1); brain.add(core);

  /* ── Space dust: streaks rushing past (the flight) ── */
  var ND=small?420:900, dust=[], dp=new Float32Array(ND*6), dc=new Float32Array(ND*6);
  for(var q=0;q<ND;q++){ dust.push({x:rnd(-90,90),y:rnd(-55,55),z:rnd(-230,5)});
    var c4=Math.random()<.7?STEEL:(Math.random()<.6?BLUE:GREEN); dc.set([c4.r,c4.g,c4.b,1,1,1],q*6); }
  var dg=new T.BufferGeometry(); dg.setAttribute('position',new T.BufferAttribute(dp,3)); dg.setAttribute('color',new T.BufferAttribute(dc,3));
  scene.add(new T.LineSegments(dg,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.7,depthWrite:false})));

  /* ── Glass cubes that crash into each other and shatter ── */
  var boxG=new T.BoxGeometry(1,1,1), edgeG=new T.EdgesGeometry(boxG);
  function makeCube(tint){
    var g=new T.Group();
    var m=new T.Mesh(boxG,new T.MeshPhongMaterial({color:0xb9c4d4,specular:0xffffff,shininess:110,transparent:true,opacity:.6,depthWrite:false}));
    var l=new T.LineSegments(edgeG,new T.LineBasicMaterial({color:tint,transparent:true,opacity:.95}));
    g.add(m); g.add(l); g.userData={mesh:m,line:l}; g.visible=false; scene.add(g); return g;
  }
  var cubes=[], frags=[], flashes=[];
  for(var cI=0;cI<(small?10:18);cI++) cubes.push({g:makeCube(cI%2?0x1f6bff:0x12d98a),on:false});
  for(var fI=0;fI<(small?60:120);fI++) frags.push({g:makeCube(fI%3?0x1f6bff:0x12d98a),on:false});
  for(var hI=0;hI<6;hI++){ var sp=new T.Sprite(new T.SpriteMaterial({map:dotTex('rgba(120,190,255,1)','rgba(18,217,138,0)'),transparent:true,depthWrite:false,opacity:0})); scene.add(sp); flashes.push({s:sp,t:1}); }
  function free(list){ for(var i=0;i<list.length;i++) if(!list[i].on) return list[i]; return null; }
  function spawnPair(){
    var A=free(cubes); if(!A) return; A.on=true; var B=free(cubes); if(!B){ A.on=false; return; } B.on=true;
    var M=new T.Vector3(rnd(-38,38),rnd(-20,20),rnd(-95,-45)), sz=rnd(3.5,7), T0=rnd(1.8,3);
    [[A,-1],[B,1]].forEach(function(o){ var c=o[0], s=o[1];
      c.size=sz*rnd(.8,1.15); c.g.scale.setScalar(c.size); c.g.visible=true; c.g.userData.mesh.material.opacity=.6;
      c.p=new T.Vector3(M.x+s*rnd(40,70), M.y+rnd(-18,18), M.z-rnd(10,40));
      c.v=M.clone().sub(c.p).divideScalar(T0); c.rv=new T.Vector3(rnd(-1.5,1.5),rnd(-1.5,1.5),rnd(-1.5,1.5)); c.mate=(c===A?B:A); c.solo=false; });
  }
  function spawnSolo(){
    var c=free(cubes); if(!c) return; c.on=true; c.size=rnd(2,5); c.g.scale.setScalar(c.size); c.g.visible=true;
    c.p=new T.Vector3(rnd(-60,60),rnd(-35,35),-220); c.v=new T.Vector3(rnd(-3,3),rnd(-2,2),rnd(10,25));
    c.rv=new T.Vector3(rnd(-1,1),rnd(-1,1),rnd(-1,1)); c.mate=null; c.solo=true;
  }
  function explode(at, tint){
    for(var k=0;k<(small?10:16);k++){ var f=free(frags); if(!f) break; f.on=true; f.life=rnd(1.1,1.9); f.age=0;
      f.size=rnd(.5,1.4); f.g.visible=true; f.g.scale.setScalar(f.size); f.p=at.clone().add(new T.Vector3(rnd(-1,1),rnd(-1,1),rnd(-1,1)));
      f.v=new T.Vector3(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize().multiplyScalar(rnd(10,32)); f.rv=new T.Vector3(rnd(-6,6),rnd(-6,6),rnd(-6,6)); }
    var fl=null; for(var i=0;i<flashes.length;i++) if(flashes[i].t>=1){ fl=flashes[i]; break; }
    if(fl){ fl.t=0; fl.s.position.copy(at); }
    burst(12);
  }
  function burst(n){ for(var i=0;i<n;i++){ var p=pulses[(Math.random()*pulses.length)|0]; p.v=rnd(2.5,4.5); } }

  /* ── Page nodes inside the brain, joined by glowing connectors with slow light streaks ── */
  var NODE_IDS=['home','packages','referral','portfolio','process','book','about'];
  var NODE_POS={home:[0,2,9],packages:[-6.5,5,4],referral:[6.5,5,3],portfolio:[-6.5,-2.5,-3],process:[6.5,-2.5,-4],book:[0,-5.5,-9],about:[0,8.5,-8]};
  var NODE_NAME={home:'Home',packages:'Services',referral:'Referral',portfolio:'Portfolio',process:'Process',book:'Contact',about:'About'};
  var nodes={}, nodeGroup=new T.Group(); brain.add(nodeGroup); nodeGroup.visible=false;
  var glowB=dotTex('rgba(80,150,255,1)','rgba(31,107,255,0)'), glowG=dotTex('rgba(60,235,160,1)','rgba(18,217,138,0)');
  NODE_IDS.forEach(function(id,i){
    var v=new T.Vector3().fromArray(NODE_POS[id]);
    var halo=new T.Sprite(new T.SpriteMaterial({map:i%2?glowG:glowB,transparent:true,depthWrite:false,opacity:.85})); halo.scale.set(4.2,4.2,1); halo.position.copy(v);
    var core=new T.Sprite(new T.SpriteMaterial({map:DOT,color:0xffffff,transparent:true,depthWrite:false})); core.scale.set(1.1,1.1,1); core.position.copy(v);
    var ring=new T.Mesh(new T.RingGeometry(1.5,1.62,48),new T.MeshBasicMaterial({color:i%2?0x12d98a:0x1f6bff,transparent:true,opacity:.7,side:T.DoubleSide,depthWrite:false}));
    ring.position.copy(v);
    nodeGroup.add(halo); nodeGroup.add(core); nodeGroup.add(ring);
    nodes[id]={v:v,halo:halo,core:core,ring:ring,i:i};
  });
  var LINKS=[['home','packages'],['packages','referral'],['referral','portfolio'],['portfolio','process'],['process','book'],['book','about'],
             ['home','referral'],['home','process'],['packages','portfolio'],['about','packages'],['book','home'],['about','referral']];
  var links=[];
  LINKS.forEach(function(L,k){
    var a=nodes[L[0]].v, b=nodes[L[1]].v, mid=a.clone().add(b).multiplyScalar(.5).add(new T.Vector3(rnd(-3,3),rnd(-3,3),rnd(-3,3)));
    var curve=new T.QuadraticBezierCurve3(a.clone(),mid,b.clone());
    var tube=new T.Mesh(new T.TubeGeometry(curve,48,.09,6,false),new T.MeshBasicMaterial({color:k%2?0x12a8ff:0x1f6bff,transparent:true,opacity:.28,depthWrite:false}));
    var line=new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(60)),new T.LineBasicMaterial({color:k%3?0x1f6bff:0x12d98a,transparent:true,opacity:.75}));
    nodeGroup.add(tube); nodeGroup.add(line);
    // comets: a bright head with a fading tail, drifting slowly along the connector
    var comets=[];
    for(var c=0;c<2;c++){ var parts=[];
      for(var q=0;q<7;q++){ var sp=new T.Sprite(new T.SpriteMaterial({map:(k+c)%2?glowG:glowB,transparent:true,depthWrite:false,opacity:1-q/7})); var sz=(q?0.7:1.1)*(1-q/9); sp.scale.set(sz,sz,1); nodeGroup.add(sp); parts.push(sp); }
      comets.push({t:Math.random(),v:rnd(.05,.11),dir:Math.random()<.5?1:-1,parts:parts}); }
    links.push({a:L[0],b:L[1],curve:curve,tube:tube,line:line,comets:comets,boost:0});
  });

  /* ── Modes: outside (the gate), entering (pulled in), inside (flying node to node) ── */
  var mode='outside', speed=16, baseSpeed=16, rotTarget=0, mx=0, my=0, shake=0;
  var OUT_POS=new T.Vector3(0,0,-62), IN_SCALE=3.2, IN_ROT=new T.Euler(-.08,.35,0);
  brain.position.set(0,0,-270);
  addEventListener('pointermove',function(e){ mx=(e.clientX/innerWidth-.5); my=(e.clientY/innerHeight-.5); },{passive:true});
  var fly={mode:'return',t:0,next:16,v:0}, tmpV=new T.Vector3();
  var curNode='home', travel=null, camPos=new T.Vector3(0,0,0), camLook=new T.Vector3(0,0,-60), tmpA=new T.Vector3(), tmpB=new T.Vector3();
  function narrow(){ return innerWidth<900; }
  function poseFor(id, outPos, outLook){
    var w=nodes[id].v.clone().applyMatrix4(brain.matrixWorld);
    if(narrow()){ outPos.copy(w).add(tmpA.set(0,3,15)); outLook.copy(w).add(tmpB.set(0,-4.5,-10)); }
    else { outPos.copy(w).add(tmpA.set(6.5,1.5,15)); outLook.copy(w).add(tmpB.set(-5.5,-.5,-10)); }
  }
  function linkBetween(a,b){ for(var i=0;i<links.length;i++){ var L=links[i]; if((L.a===a&&L.b===b)||(L.a===b&&L.b===a)) return L; } return null; }
  function page(id){
    if(!nodes[id]) id='home';
    if(mode!=='inside'){ curNode=id; return; }
    if(id===curNode && !travel) return;
    var from=curNode; curNode=id;
    var L=linkBetween(from,id); if(L) L.boost=2.2;
    travel={t:0,dur:reduce?0.01:1.9,fromPos:camPos.clone(),fromLook:camLook.clone()};
  }
  function warp(dir){ speed=mode==='inside'?120:220; rotTarget+=(dir||1)*1.1; shake=mode==='inside'?.4:1; burst(40); if(mode!=='inside' && Math.random()<.9) setTimeout(spawnPair,350); }
  var enterCb=null, enterT=0;
  function enter(cb){
    if(mode!=='outside'){ cb&&cb(); return; }
    mode='entering'; enterT=0; enterCb=cb; speed=260; shake=1.2; burst(80); nodeGroup.visible=true;
  }

  var clock=new T.Clock(), pairT=0.4, soloT=1.2, running=true;
  document.addEventListener('visibilitychange',function(){ running=!document.hidden; if(running){ clock.getDelta(); loop(); } });
  function ease(x){ return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2; }
  function frame(dt){
    var t=clock.elapsedTime;
    speed+=(baseSpeed-speed)*Math.min(1,dt*1.6);
    // dust streaks
    var len=0.6+speed*0.05;
    for(var i=0;i<ND;i++){ var d=dust[i]; d.z+=speed*dt*(mode==='inside'?.35:1); if(d.z>5){ d.z=-230; d.x=rnd(-90,90); d.y=rnd(-55,55); }
      dp[i*6]=d.x; dp[i*6+1]=d.y; dp[i*6+2]=d.z; dp[i*6+3]=d.x; dp[i*6+4]=d.y; dp[i*6+5]=d.z-len; }
    dg.attributes.position.needsUpdate=true;

    if(mode==='outside'){
      rotTarget+=dt*0.1; brain.rotation.y+=(rotTarget-brain.rotation.y)*Math.min(1,dt*1.8);
      brain.rotation.x=Math.sin(t*.2)*.08-0.12;
      fly.t+=dt;
      if(fly.mode==='rest'){ var bob=Math.sin(fly.t*.45)*14; tmpV.copy(OUT_POS); tmpV.z+=bob-6; brain.position.lerp(tmpV,Math.min(1,dt*1.2));
        if(fly.t>fly.next){ fly.mode='pass'; fly.t=0; fly.v=6; } }
      else if(fly.mode==='pass'){ fly.v=Math.min(fly.v+dt*55,95); brain.position.z+=fly.v*dt; brain.position.x*=1-Math.min(1,dt*1.2);
        if(brain.position.z>28){ brain.position.set(rnd(-10,10),rnd(-5,5),-270); fly.mode='return'; fly.t=0; burst(30); } }
      else { brain.position.lerp(OUT_POS,Math.min(1,dt*.55)); if(Math.abs(brain.position.z-OUT_POS.z)<3){ fly.mode='rest'; fly.t=0; fly.next=rnd(14,22); } }
      brain.scale.setScalar(1+Math.sin(t*1.3)*.012);
      camPos.set(mx*6,-my*4,0); camLook.set(mx*2,-my*1.5,-60);
    } else if(mode==='entering'){
      enterT+=dt; var k=Math.min(1,enterT/2.6), e=ease(k);
      brain.position.lerp(tmpV.set(0,0,0),Math.min(1,dt*2.2));
      var sc=brain.scale.x+(IN_SCALE-brain.scale.x)*Math.min(1,dt*2.2); brain.scale.setScalar(sc);
      brain.rotation.x+=(IN_ROT.x-brain.rotation.x)*Math.min(1,dt*2.5); brain.rotation.y+=(IN_ROT.y-brain.rotation.y)*Math.min(1,dt*2.5);
      brain.updateMatrixWorld();
      var P0=new T.Vector3(), L0=new T.Vector3(); poseFor('home',P0,L0);
      camPos.lerpVectors(new T.Vector3(0,0,0),P0,e); camLook.lerpVectors(new T.Vector3(0,0,-60),L0,e);
      if(k>=1){ mode='inside'; curNode='home'; speed=baseSpeed; var cb=enterCb; enterCb=null; cb&&cb(); }
    } else {
      // inside: the brain breathes and sways gently; the camera rides node to node
      brain.rotation.y=IN_ROT.y+Math.sin(t*.12)*.05; brain.rotation.x=IN_ROT.x+Math.sin(t*.17)*.03;
      brain.scale.setScalar(IN_SCALE*(1+Math.sin(t*1.1)*.006)); brain.updateMatrixWorld();
      var P1=new T.Vector3(), L1=new T.Vector3(); poseFor(curNode,P1,L1);
      if(travel){ travel.t+=dt/travel.dur; var k2=Math.min(1,travel.t), e2=ease(k2);
        camPos.lerpVectors(travel.fromPos,P1,e2); camPos.y+=Math.sin(Math.PI*k2)*5;          // arc along the connector
        camLook.lerpVectors(travel.fromLook,L1,e2);
        if(k2>=1) travel=null;
      } else { camPos.lerp(P1.add(tmpA.set(mx*2.2,-my*1.6,0)),Math.min(1,dt*2)); camLook.lerp(L1,Math.min(1,dt*2)); }
    }
    // nodes + comets
    if(nodeGroup.visible){
      NODE_IDS.forEach(function(id){ var n=nodes[id], on=id===curNode, p=1+Math.sin(t*2.2+n.i)*.12;
        var hs=(on?6.2:4.2)*p; n.halo.scale.set(hs,hs,1); n.halo.material.opacity=on?1:.75;
        n.ring.lookAt(cam.position); n.ring.rotation.z+=dt*.4; n.ring.scale.setScalar(on?1.35+Math.sin(t*3)*.08:1); });
      links.forEach(function(L){ L.boost*=Math.pow(.25,dt); var hot=(L.a===curNode||L.b===curNode);
        L.tube.material.opacity=.22+(hot?.18:0)+L.boost*.2; L.line.material.opacity=.55+(hot?.3:0);
        L.comets.forEach(function(c){ c.t+=dt*c.v*(1+L.boost*4)*c.dir; if(c.t>1) c.t-=1; if(c.t<0) c.t+=1;
          for(var q=0;q<c.parts.length;q++){ var tt=c.t-c.dir*q*.018; tt=tt<0?tt+1:(tt>1?tt-1:tt); L.curve.getPoint(tt,c.parts[q].position); } }); });
    }
    // brain neurons: pulses always fire
    core.material.opacity=(mode==='inside'?.06:.26)+Math.sin(t*1.7)*.05;
    bpts.material.opacity=mode==='inside'?.8:.95;
    for(var k3=0;k3<NP;k3++){ var p=pulses[k3], E=edges[p.e]; p.t+=dt*p.v;
      if(p.t>=1){ var end=p.fw?E[1]:E[0], nx=adj[end]; p.e=nx.length?nx[(Math.random()*nx.length)|0]:(Math.random()*edges.length)|0;
        E=edges[p.e]; p.fw=E[0]===end; p.t=0; p.v+=(1.4-p.v)*.3; }
      var A=P[p.fw?E[0]:E[1]], B=P[p.fw?E[1]:E[0]];
      pp[k3*3]=A.x+(B.x-A.x)*p.t; pp[k3*3+1]=A.y+(B.y-A.y)*p.t; pp[k3*3+2]=A.z+(B.z-A.z)*p.t; }
    pg.attributes.position.needsUpdate=true;
    // cubes only crash out in space (outside the brain)
    pairT-=dt; soloT-=dt;
    if(mode==='outside'){ if(pairT<=0){ spawnPair(); pairT=rnd(1.4,2.6); } if(soloT<=0){ spawnSolo(); soloT=rnd(.9,2); } }
    var worldDz=(speed-baseSpeed)*dt;
    cubes.forEach(function(c){ if(!c.on) return;
      c.p.addScaledVector(c.v,dt); c.p.z+=worldDz+(c.solo?0:baseSpeed*.15*dt);
      c.g.position.copy(c.p); c.g.rotation.x+=c.rv.x*dt; c.g.rotation.y+=c.rv.y*dt; c.g.rotation.z+=c.rv.z*dt;
      if(c.mate && c.mate.on && c.p.distanceTo(c.mate.p)<(c.size+c.mate.size)*.55){
        var mid=c.p.clone().add(c.mate.p).multiplyScalar(.5); explode(mid);
        c.on=false; c.g.visible=false; c.mate.on=false; c.mate.g.visible=false; return; }
      if(c.p.z>8||Math.abs(c.p.x)>140||mode!=='outside'&&c.p.z>-20){ c.on=false; c.g.visible=false; }
    });
    frags.forEach(function(f){ if(!f.on) return; f.age+=dt; var k2=1-f.age/f.life;
      if(k2<=0){ f.on=false; f.g.visible=false; return; }
      f.v.multiplyScalar(1-dt*.9); f.p.addScaledVector(f.v,dt); f.p.z+=worldDz; f.g.position.copy(f.p);
      f.g.rotation.x+=f.rv.x*dt; f.g.rotation.y+=f.rv.y*dt; f.g.scale.setScalar(f.size*Math.max(.05,k2));
      f.g.userData.mesh.material.opacity=.6*k2; f.g.userData.line.material.opacity=k2; });
    flashes.forEach(function(fl){ if(fl.t>=1){ fl.s.material.opacity=0; return; } fl.t+=dt*1.8;
      var s2=4+fl.t*26; fl.s.scale.set(s2,s2,1); fl.s.material.opacity=Math.max(0,.9*(1-fl.t)); });
    // camera
    shake*=Math.pow(.02,dt);
    cam.position.copy(camPos); cam.position.x+=(Math.random()-.5)*shake*.6; cam.position.y+=(Math.random()-.5)*shake*.6;
    cam.lookAt(camLook);
    // floating page labels next to the nodes
    if(labels && nodeGroup.visible && mode==='inside'){
      NODE_IDS.forEach(function(id){ var el=labels[id]; tmpA.copy(nodes[id].v).applyMatrix4(brain.matrixWorld).project(cam);
        var vis=tmpA.z<1 && id!==curNode && Math.abs(tmpA.x)<1.1 && Math.abs(tmpA.y)<1.1;
        el.style.opacity=vis?Math.max(.25,Math.min(.9,1.4-tmpA.z*1.2)).toFixed(2):'0';
        if(vis) el.style.transform='translate('+((tmpA.x+1)/2*innerWidth).toFixed(1)+'px,'+((1-tmpA.y)/2*innerHeight).toFixed(1)+'px) translate(-50%,-160%)'; });
    }
  }
  var labels=null, lwrap=document.getElementById('nodeLabels');
  if(lwrap){ labels={}; NODE_IDS.forEach(function(id){ var d=document.createElement('div'); d.className='node-label'; d.textContent=NODE_NAME[id]; lwrap.appendChild(d); labels[id]=d; }); }
  function loop(){ if(!running) return; var dt=Math.min(clock.getDelta(),.05); frame(dt); renderer.render(scene,cam); requestAnimationFrame(loop); }
  window.SANeural={warp:warp,page:page,enter:enter,mode:function(){ return mode; }};
  if(reduce){ window.SANeural.enter=function(cb){ mode='inside'; nodeGroup.visible=true; brain.position.set(0,0,0); brain.scale.setScalar(IN_SCALE); brain.rotation.copy(IN_ROT); frame(.016); renderer.render(scene,cam); cb&&cb(); };
    window.SANeural.warp=function(){}; window.SANeural.page=function(id){ curNode=nodes[id]?id:'home'; if(mode==='inside'){ frame(.016); renderer.render(scene,cam); } };
    brain.position.copy(OUT_POS); frame(.016); renderer.render(scene,cam); return; }
  loop();
})();
