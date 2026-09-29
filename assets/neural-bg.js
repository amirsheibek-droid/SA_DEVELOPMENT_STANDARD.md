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
  scene.fog=new T.Fog(0xeef2f8, 70, 230);
  var cam=new T.PerspectiveCamera(60,1,0.1,400);
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
    var c4=Math.random()<.7?SILVER:(Math.random()<.6?CYAN:GREEN); dc.set([c4.r,c4.g,c4.b,1,1,1],q*6); }
  var dg=new T.BufferGeometry(); dg.setAttribute('position',new T.BufferAttribute(dp,3)); dg.setAttribute('color',new T.BufferAttribute(dc,3));
  scene.add(new T.LineSegments(dg,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.55,depthWrite:false})));

  /* ── Glass cubes that crash into each other and shatter ── */
  var boxG=new T.BoxGeometry(1,1,1), edgeG=new T.EdgesGeometry(boxG);
  function makeCube(tint){
    var g=new T.Group();
    var m=new T.Mesh(boxG,new T.MeshPhongMaterial({color:0xe9eef6,specular:0xffffff,shininess:90,transparent:true,opacity:.55,depthWrite:false}));
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
    var M=new T.Vector3(rnd(-45,45),rnd(-24,24),rnd(-130,-60)), sz=rnd(3,6.5), T0=rnd(1.8,3);
    [[A,-1],[B,1]].forEach(function(o){ var c=o[0], s=o[1];
      c.size=sz*rnd(.8,1.15); c.g.scale.setScalar(c.size); c.g.visible=true; c.g.userData.mesh.material.opacity=.55;
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

  /* ── Camera, pages, warp ── */
  var speed=16, baseSpeed=16, rotY=0, rotTarget=0, mx=0, my=0, shake=0;
  var brainHome=new T.Vector3(15,1,-46), brainPage=new T.Vector3(0,0,-58), brainTo=brainHome.clone(), brainScale=1, scaleTo=1;
  brain.position.copy(brainHome);
  addEventListener('pointermove',function(e){ mx=(e.clientX/innerWidth-.5); my=(e.clientY/innerHeight-.5); },{passive:true});
  function page(id){
    var home=id==='home';
    brainTo.copy(home?(innerWidth<960?new T.Vector3(0,-2,-60):brainHome):brainPage);
    scaleTo= home?1:1.18;
  }
  function warp(dir){ speed=220; rotTarget+=(dir||1)*1.1; shake=1; burst(40); if(Math.random()<.9) setTimeout(spawnPair,350); }

  var clock=new T.Clock(), pairT=0.4, soloT=1.2, running=true;
  document.addEventListener('visibilitychange',function(){ running=!document.hidden; if(running){ clock.getDelta(); loop(); } });
  function frame(dt){
    var t=clock.elapsedTime;
    speed+= (baseSpeed-speed)*Math.min(1,dt*1.6);
    // dust streaks
    var len=0.6+speed*0.05;
    for(var i=0;i<ND;i++){ var d=dust[i]; d.z+=speed*dt; if(d.z>5){ d.z=-230; d.x=rnd(-90,90); d.y=rnd(-55,55); }
      dp[i*6]=d.x; dp[i*6+1]=d.y; dp[i*6+2]=d.z; dp[i*6+3]=d.x; dp[i*6+4]=d.y; dp[i*6+5]=d.z-len; }
    dg.attributes.position.needsUpdate=true;
    // brain
    rotY+=dt*0.08; rotTarget+=dt*0.08;
    brain.rotation.y+=(rotTarget-brain.rotation.y)*Math.min(1,dt*1.8);
    brain.rotation.x=Math.sin(t*.2)*.08-0.12;
    brain.position.lerp(brainTo,Math.min(1,dt*1.5));
    var sc=brain.scale.x+(scaleTo-brain.scale.x)*Math.min(1,dt*1.5); brain.scale.setScalar(sc*(1+Math.sin(t*1.3)*.012));
    core.material.opacity=.28+Math.sin(t*1.7)*.08;
    for(var k=0;k<NP;k++){ var p=pulses[k], E=edges[p.e]; p.t+=dt*p.v;
      if(p.t>=1){ var end=p.fw?E[1]:E[0], nx=adj[end]; p.e=nx.length?nx[(Math.random()*nx.length)|0]:(Math.random()*edges.length)|0;
        E=edges[p.e]; p.fw=E[0]===end; p.t=0; p.v+= (1.4-p.v)*.3; }
      var A=P[p.fw?E[0]:E[1]], B=P[p.fw?E[1]:E[0]];
      pp[k*3]=A.x+(B.x-A.x)*p.t; pp[k*3+1]=A.y+(B.y-A.y)*p.t; pp[k*3+2]=A.z+(B.z-A.z)*p.t; }
    pg.attributes.position.needsUpdate=true;
    // cubes
    pairT-=dt; soloT-=dt;
    if(pairT<=0){ spawnPair(); pairT=rnd(1.4,2.6); }
    if(soloT<=0){ spawnSolo(); soloT=rnd(.9,2); }
    var worldDz=(speed-baseSpeed)*dt;          // warp flings everything towards us
    cubes.forEach(function(c){ if(!c.on) return;
      c.p.addScaledVector(c.v,dt); c.p.z+=worldDz+(c.solo?0:baseSpeed*.15*dt);
      c.g.position.copy(c.p); c.g.rotation.x+=c.rv.x*dt; c.g.rotation.y+=c.rv.y*dt; c.g.rotation.z+=c.rv.z*dt;
      if(c.mate && c.mate.on && c.p.distanceTo(c.mate.p)<(c.size+c.mate.size)*.55){
        var mid=c.p.clone().add(c.mate.p).multiplyScalar(.5); explode(mid);
        c.on=false; c.g.visible=false; c.mate.on=false; c.mate.g.visible=false; return; }
      if(c.p.z>8||Math.abs(c.p.x)>140){ c.on=false; c.g.visible=false; }
    });
    frags.forEach(function(f){ if(!f.on) return; f.age+=dt; var k2=1-f.age/f.life;
      if(k2<=0){ f.on=false; f.g.visible=false; return; }
      f.v.multiplyScalar(1-dt*.9); f.p.addScaledVector(f.v,dt); f.p.z+=worldDz; f.g.position.copy(f.p);
      f.g.rotation.x+=f.rv.x*dt; f.g.rotation.y+=f.rv.y*dt; f.g.scale.setScalar(f.size*Math.max(.05,k2));
      f.g.userData.mesh.material.opacity=.55*k2; f.g.userData.line.material.opacity=k2; });
    flashes.forEach(function(fl){ if(fl.t>=1){ fl.s.material.opacity=0; return; } fl.t+=dt*1.8;
      var s=4+fl.t*26; fl.s.scale.set(s,s,1); fl.s.material.opacity=Math.max(0,.9*(1-fl.t)); });
    // camera drift + shake
    shake*=Math.pow(.02,dt);
    cam.position.x+=(mx*6-cam.position.x)*Math.min(1,dt*2)+ (Math.random()-.5)*shake*.6;
    cam.position.y+=(-my*4-cam.position.y)*Math.min(1,dt*2)+ (Math.random()-.5)*shake*.6;
    cam.lookAt(mx*2,-my*1.5,-60);
  }
  function loop(){ if(!running) return; var dt=Math.min(clock.getDelta(),.05); frame(dt); renderer.render(scene,cam); requestAnimationFrame(loop); }
  window.SANeural={warp:warp,page:page};
  page((location.hash||'#home').slice(1)||'home'); brain.position.copy(brainTo);
  if(reduce){ frame(0.016); renderer.render(scene,cam); window.SANeural.warp=function(){}; return; }
  loop();
})();
