/* Mind Universe — a mind of wisdom in deep space (based on the SA Braintrix engine).
   Outside: a brain drifting through white space with glass cubes crashing.
   Inside: a vast neural field. Every destination is a neuron; you fly along axons to reach it.
   Reads window.H_DESTS + window.H_LINKS. Exposes window.SAMind. Needs three.js r128. */
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
  scene.fog=new T.Fog(0x03040a, 80, 300);
  var cam=new T.PerspectiveCamera(58,1,0.1,1400);
  function size(){ var w=innerWidth,h=innerHeight; renderer.setSize(w,h); cam.aspect=w/h; cam.updateProjectionMatrix(); }
  size(); addEventListener('resize',size);
  function narrow(){ return innerWidth<900; }

  var BLUE=new T.Color('#4f7dff'), CYAN=new T.Color('#2ee6ff'), GREEN=new T.Color('#19f0b0'), SILVER=new T.Color('#6f7aa8'), STEEL=new T.Color('#3a4170'), FOG=new T.Color('#03040a'),
      PURPLE=new T.Color('#a45cff'), GOLD=new T.Color('#ffc44d'), PINK=new T.Color('#ff4fa8');
  var PAL=[BLUE,CYAN,GREEN,PURPLE,GOLD,PINK];
  var ADD=T.AdditiveBlending;
  function rnd(a,b){ return a+Math.random()*(b-a); }
  function V(x,y,z){ return new T.Vector3(x,y,z); }
  function dotTex(inner, outer){
    var c=document.createElement('canvas'); c.width=c.height=64; var g=c.getContext('2d');
    var gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,inner); gr.addColorStop(.35,inner); gr.addColorStop(1,outer);
    g.fillStyle=gr; g.fillRect(0,0,64,64); return new T.CanvasTexture(c);
  }
  var DOT=dotTex('rgba(255,255,255,1)','rgba(255,255,255,0)');
  var glowB=dotTex('rgba(80,150,255,1)','rgba(31,107,255,0)'), glowG=dotTex('rgba(60,235,160,1)','rgba(18,217,138,0)');

  scene.add(new T.AmbientLight(0xffffff,.75));
  var key=new T.DirectionalLight(0xdfe9ff,.9); key.position.set(-20,30,40); scene.add(key);

  /* ── shared: wire a point cloud to its nearest neighbours, with firing pulses ── */
  function wire(P, col, M, maxD2, longN, longMax, parent, opacity){
    var edges=[], adj=P.map(function(){return [];});
    for(var e=0;e<M;e++){
      var ai=(Math.random()*P.length)|0, best=[1e9,1e9], bi=[-1,-1];
      for(var j=e%2;j<P.length;j+=2){ if(j===ai) continue; var d=P[ai].distanceToSquared(P[j]);
        if(d<best[0]){ best[1]=best[0]; bi[1]=bi[0]; best[0]=d; bi[0]=j; } else if(d<best[1]){ best[1]=d; bi[1]=j; } }
      for(var t=0;t<2;t++) if(bi[t]>=0 && best[t]<maxD2){ edges.push([ai,bi[t]]); adj[ai].push(edges.length-1); adj[bi[t]].push(edges.length-1); }
    }
    for(var e2=0;e2<longN;e2++){ var a1=(Math.random()*P.length)|0, a2=(Math.random()*P.length)|0; if(a1!==a2 && P[a1].distanceTo(P[a2])<longMax){ edges.push([a1,a2]); adj[a1].push(edges.length-1); adj[a2].push(edges.length-1);} }
    var lp=new Float32Array(edges.length*6), lc=new Float32Array(edges.length*6);
    edges.forEach(function(E,i){ var A=P[E[0]],B=P[E[1]]; lp.set([A.x,A.y,A.z,B.x,B.y,B.z],i*6);
      var c=col[E[0]].clone().lerp(SILVER,.35); lc.set([c.r,c.g,c.b,c.r,c.g,c.b],i*6); });
    var lg=new T.BufferGeometry(); lg.setAttribute('position',new T.BufferAttribute(lp,3)); lg.setAttribute('color',new T.BufferAttribute(lc,3));
    parent.add(new T.LineSegments(lg,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:opacity,depthWrite:false,blending:ADD})));
    return {edges:edges,adj:adj};
  }
  function pulses(P, net, n, sz, parent){
    var list=[], pp=new Float32Array(n*3), pc=new Float32Array(n*3);
    for(var i=0;i<n;i++){ list.push({e:(Math.random()*net.edges.length)|0,t:Math.random(),v:rnd(.8,2.2),fw:Math.random()<.5});
      var c=PAL[(Math.random()*PAL.length)|0]; pc.set([c.r,c.g,c.b],i*3); }
    var g=new T.BufferGeometry(); g.setAttribute('position',new T.BufferAttribute(pp,3)); g.setAttribute('color',new T.BufferAttribute(pc,3));
    parent.add(new T.Points(g,new T.PointsMaterial({size:sz,map:DOT,vertexColors:true,transparent:true,depthWrite:false,blending:ADD})));
    return { list:list, step:function(dt){
      for(var k=0;k<n;k++){ var p=list[k], E=net.edges[p.e]; p.t+=dt*p.v;
        if(p.t>=1){ var end=p.fw?E[1]:E[0], nx=net.adj[end]; p.e=nx.length?nx[(Math.random()*nx.length)|0]:(Math.random()*net.edges.length)|0;
          E=net.edges[p.e]; p.fw=E[0]===end; p.t=0; p.v+=(1.4-p.v)*.3; }
        var A=P[p.fw?E[0]:E[1]], B=P[p.fw?E[1]:E[0]];
        pp[k*3]=A.x+(B.x-A.x)*p.t; pp[k*3+1]=A.y+(B.y-A.y)*p.t; pp[k*3+2]=A.z+(B.z-A.z)*p.t; }
      g.attributes.position.needsUpdate=true; },
      burst:function(m,v){ for(var i=0;i<m;i++){ list[(Math.random()*n)|0].v=v||rnd(2.5,4.5); } } };
  }

  /* ══════════ OUTSIDE: the brain at the gate ══════════ */
  var brain=new T.Group(); scene.add(brain);
  var N=small?1300:2400, BP=[], bcol=[];
  function fold(x,y,z){ return 1+0.075*Math.sin(9*x+2*y)*Math.sin(8*y+3*z)*Math.sin(7*z+x)+0.03*Math.sin(23*x*y+11*z); }
  for(var i=0;i<N;i++){
    var s=i%2?1:-1, u=Math.random()*2-1, th=Math.random()*Math.PI*2, r=Math.sqrt(1-u*u);
    var x=r*Math.cos(th), y=u, z=r*Math.sin(th), inner=Math.random()<0.14?rnd(.35,.8):1, f=fold(x,y,z)*inner;
    x=x*0.62*f; y=y*0.78*f; z=z*1.05*f; if(y<-0.25) y*=0.72; if(z>0.55 && y<0) y*=0.85; x=s*(0.06+Math.abs(x));
    BP.push(V(x*16,y*16,z*16));
  }
  for(var k=0;k<(small?160:280);k++){ var a=Math.random()*Math.PI*2,b=Math.random()*Math.PI, rr=rnd(.7,1);
    BP.push(V(Math.cos(a)*Math.sin(b)*5.4*rr, -9+Math.cos(b)*2.6*rr, -11+Math.sin(a)*Math.sin(b)*3.4*rr)); }
  for(var k2=0;k2<(small?40:70);k2++) BP.push(V(rnd(-1.2,1.2), rnd(-17,-9), rnd(-6,-3)));
  function colourCloud(P,cols){ var pos=new Float32Array(P.length*3), pc=new Float32Array(P.length*3);
    P.forEach(function(p,i){ pos[i*3]=p.x; pos[i*3+1]=p.y; pos[i*3+2]=p.z;
      var q=Math.random(), c=q<.4?SILVER.clone().lerp(STEEL,Math.random()):PAL[(Math.random()*PAL.length)|0].clone().lerp(SILVER,Math.random()*.3);
      cols.push(c); pc[i*3]=c.r; pc[i*3+1]=c.g; pc[i*3+2]=c.b; });
    var g=new T.BufferGeometry(); g.setAttribute('position',new T.BufferAttribute(pos,3)); g.setAttribute('color',new T.BufferAttribute(pc,3)); return g; }
  var bpts=new T.Points(colourCloud(BP,bcol),new T.PointsMaterial({size:small?.55:.48,map:DOT,vertexColors:true,transparent:true,opacity:.95,depthWrite:false,blending:ADD}));
  brain.add(bpts);
  var bnet=wire(BP,bcol,small?700:1300,9,small?40:80,22,brain,.42);
  var bpul=pulses(BP,bnet,small?50:110,small?1.5:1.35,brain);
  var core=new T.Sprite(new T.SpriteMaterial({map:dotTex('rgba(164,92,255,.55)','rgba(46,230,255,0)'),transparent:true,opacity:.3,depthWrite:false,blending:ADD})); core.scale.set(46,40,1); brain.add(core);

  // glass cubes that crash and shatter (gate only)
  var boxG=new T.BoxGeometry(1,1,1), edgeG=new T.EdgesGeometry(boxG);
  function makeCube(tint){ var g=new T.Group();
    var m=new T.Mesh(boxG,new T.MeshPhongMaterial({color:0x1b1f3a,specular:0xffffff,shininess:110,transparent:true,opacity:.55,depthWrite:false}));
    var l=new T.LineSegments(edgeG,new T.LineBasicMaterial({color:tint,transparent:true,opacity:.95}));
    g.add(m); g.add(l); g.userData={mesh:m,line:l}; g.visible=false; scene.add(g); return g; }
  var cubes=[], frags=[], flashes=[];
  for(var cI=0;cI<(small?10:16);cI++) cubes.push({g:makeCube([0x4f7dff,0xa45cff,0x19f0b0,0xffc44d][cI%4]),on:false});
  for(var fI=0;fI<(small?50:100);fI++) frags.push({g:makeCube([0x2ee6ff,0xff4fa8,0xffc44d][fI%3]),on:false});
  for(var hI=0;hI<5;hI++){ var fsp=new T.Sprite(new T.SpriteMaterial({map:dotTex('rgba(120,190,255,1)','rgba(18,217,138,0)'),transparent:true,depthWrite:false,opacity:0})); scene.add(fsp); flashes.push({s:fsp,t:1}); }
  function free(list){ for(var i=0;i<list.length;i++) if(!list[i].on) return list[i]; return null; }
  function spawnPair(){ var A=free(cubes); if(!A) return; A.on=true; var B=free(cubes); if(!B){ A.on=false; return; } B.on=true;
    var M=V(rnd(-38,38),rnd(-20,20),rnd(-95,-45)), sz=rnd(3.5,7), T0=rnd(1.8,3);
    [[A,-1],[B,1]].forEach(function(o){ var c=o[0], s=o[1]; c.size=sz*rnd(.8,1.15); c.g.scale.setScalar(c.size); c.g.visible=true;
      c.p=V(M.x+s*rnd(40,70), M.y+rnd(-18,18), M.z-rnd(10,40)); c.v=M.clone().sub(c.p).divideScalar(T0);
      c.rv=V(rnd(-1.5,1.5),rnd(-1.5,1.5),rnd(-1.5,1.5)); c.mate=(c===A?B:A); c.solo=false; }); }
  function spawnSolo(){ var c=free(cubes); if(!c) return; c.on=true; c.size=rnd(2,5); c.g.scale.setScalar(c.size); c.g.visible=true;
    c.p=V(rnd(-60,60),rnd(-35,35),-220); c.v=V(rnd(-3,3),rnd(-2,2),rnd(10,25)); c.rv=V(rnd(-1,1),rnd(-1,1),rnd(-1,1)); c.mate=null; c.solo=true; }
  function explode(at){ for(var k=0;k<(small?10:16);k++){ var f=free(frags); if(!f) break; f.on=true; f.life=rnd(1.1,1.9); f.age=0;
      f.size=rnd(.5,1.4); f.g.visible=true; f.g.scale.setScalar(f.size); f.p=at.clone().add(V(rnd(-1,1),rnd(-1,1),rnd(-1,1)));
      f.v=V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize().multiplyScalar(rnd(10,32)); f.rv=V(rnd(-6,6),rnd(-6,6),rnd(-6,6)); }
    for(var i=0;i<flashes.length;i++) if(flashes[i].t>=1){ flashes[i].t=0; flashes[i].s.position.copy(at); break; }
    bpul.burst(12); }

  /* deep space: stars in every colour */
  (function(){ var n=small?1400:2600, sp=new Float32Array(n*3), sc2=new Float32Array(n*3);
    for(var i=0;i<n;i++){ var u=Math.random()*2-1, th=Math.random()*Math.PI*2, r=600+Math.random()*250, q=Math.sqrt(1-u*u);
      sp[i*3]=q*Math.cos(th)*r; sp[i*3+1]=u*r; sp[i*3+2]=q*Math.sin(th)*r; var c=Math.random()<.6?new T.Color(1,1,1):PAL[(Math.random()*PAL.length)|0]; sc2.set([c.r,c.g,c.b],i*3); }
    var g=new T.BufferGeometry(); g.setAttribute('position',new T.BufferAttribute(sp,3)); g.setAttribute('color',new T.BufferAttribute(sc2,3));
    var stars=new T.Points(g,new T.PointsMaterial({size:2.2,map:DOT,vertexColors:true,transparent:true,opacity:.85,depthWrite:false,fog:false,blending:ADD,sizeAttenuation:false}));
    scene.add(stars); window.__stars=stars; })();

  /* ══════════ INSIDE: the mind ══════════ */
  var mind=new T.Group(); mind.visible=false; scene.add(mind);
  var DESTS=window.H_DESTS||[], LINKS=window.H_LINKS||[], D={};
  DESTS.forEach(function(d){ D[d.id]=d; d.v=V(d.pos[0],d.pos[1],d.pos[2]); });
  // the field: thousands of neurons, denser around each destination
  var FP=[], fcol=[], FN=small?1500:2800;
  for(var q=0;q<FN;q++){
    if(q%5<2 && DESTS.length){ var dd=DESTS[(Math.random()*DESTS.length)|0]; FP.push(dd.v.clone().add(V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize().multiplyScalar(rnd(9,30)))); }
    else { var uu=Math.random()*2-1, tt=Math.random()*Math.PI*2, rr2=Math.cbrt(Math.random())*250, rq=Math.sqrt(1-uu*uu);
      FP.push(V(rq*Math.cos(tt)*rr2+40, uu*rr2*.55, rq*Math.sin(tt)*rr2-80)); }
  }
  var fpts=new T.Points(colourCloud(FP,fcol),new T.PointsMaterial({size:small?1.05:.95,map:DOT,vertexColors:true,transparent:true,opacity:.9,depthWrite:false,blending:ADD}));
  mind.add(fpts);
  var fnet=wire(FP,fcol,small?1000:1900,260,small?60:120,60,mind,.3);
  var fpul=pulses(FP,fnet,small?90:180,small?2.6:2.3,mind);

  // destination neurons: soma, rings, branching dendrites with signals running in
  var DEST_IDS=[], MINITEX={};
  DESTS.forEach(function(d,i){
    DEST_IDS.push(d.id);
    var g=new T.Group(); g.position.copy(d.v); mind.add(g); d.g=g;
    var sc=d.scale||1, green=d.c==='g', col=new T.Color(d.col||(green?'#19f0b0':'#4f7dff')), hex=col.getHex();
    var cs='rgba('+Math.round(col.r*255)+','+Math.round(col.g*255)+','+Math.round(col.b*255)+',';
    var glowC=d.mini?(MINITEX[d.col]||(MINITEX[d.col]=dotTex(cs+'1)',cs+'0)'))):dotTex(cs+'1)',cs+'0)');
    d.halo=new T.Sprite(new T.SpriteMaterial({map:glowC,transparent:true,depthWrite:false,opacity:.75,blending:ADD})); d.halo.scale.set(8*sc,8*sc,1); g.add(d.halo);
    d.core=new T.Sprite(new T.SpriteMaterial({map:DOT,color:0xffffff,transparent:true,depthWrite:false})); d.core.scale.set(2.2*sc,2.2*sc,1); g.add(d.core);
    d.ring=new T.Mesh(new T.RingGeometry(3.3*sc,3.45*sc,64),new T.MeshBasicMaterial({color:hex,transparent:true,opacity:.6,side:T.DoubleSide,depthWrite:false})); g.add(d.ring);
    d.ring2=new T.Mesh(new T.RingGeometry(4.6*sc,4.68*sc,64,1,0,Math.PI*1.3),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.45,side:T.DoubleSide,depthWrite:false})); g.add(d.ring2);
    d.shock=new T.Mesh(new T.RingGeometry(.94,1,64),new T.MeshBasicMaterial({color:hex,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false})); g.add(d.shock); d.shockT=1;
    // dendrites
    var branches=[];
    function grow(start,dir,len,depth){ var pts=[start.clone()], p=start.clone(), dv=dir.clone(), segs=3+((Math.random()*3)|0);
      for(var j=0;j<segs;j++){ dv.add(V(rnd(-.5,.5),rnd(-.5,.5),rnd(-.5,.5))).normalize(); p=p.clone().addScaledVector(dv,len*rnd(.6,1.1)); pts.push(p);
        if(depth<2 && Math.random()<.38) grow(p,dv.clone().add(V(rnd(-.9,.9),rnd(-.9,.9),rnd(-.9,.9))).normalize(),len*.7,depth+1); }
      branches.push(pts); }
    var nb=d.mini?5:Math.round((d.secret?6:10)*(sc>1?1.2:1));
    for(var b2=0;b2<nb;b2++){ var dir=V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize(); grow(dir.clone().multiplyScalar(1.6*sc),dir,2.6*sc,0); }
    var segs=[], cols=[], base=col;
    branches.forEach(function(pts){ for(var j=1;j<pts.length;j++){ var a=pts[j-1], bb=pts[j];
      var ca=base.clone().lerp(FOG,Math.min(.85,(j-1)*.17)), cb=base.clone().lerp(FOG,Math.min(.9,j*.17));
      segs.push(a.x,a.y,a.z,bb.x,bb.y,bb.z); cols.push(ca.r,ca.g,ca.b,cb.r,cb.g,cb.b); } });
    var dg=new T.BufferGeometry(); dg.setAttribute('position',new T.Float32BufferAttribute(segs,3)); dg.setAttribute('color',new T.Float32BufferAttribute(cols,3));
    d.dend=new T.LineSegments(dg,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.85,depthWrite:false,blending:ADD})); g.add(d.dend);
    d.branches=branches; d.sig=[];
    for(var s2=0;s2<(d.mini?2:(d.secret?3:7));s2++){ var sp=new T.Sprite(new T.SpriteMaterial({map:glowC,transparent:true,depthWrite:false,blending:ADD})); sp.scale.set(.9*sc,.9*sc,1); g.add(sp);
      d.sig.push({s:sp,b:(Math.random()*branches.length)|0,t:Math.random(),v:rnd(.35,.7)}); }
    d.i=i; d.fire=0;
    if(d.secret){ d.halo.material.opacity=.35; }
  });
  function along(pts,t,out){ var L=pts.length-1, x=t*L, j=Math.min(L-1,Math.floor(x)), f=x-j; return out.copy(pts[j]).lerp(pts[j+1],f); }

  // axons between destinations, with comets drifting along them
  var axons=[];
  LINKS.forEach(function(L,k){
    var A=D[L[0]], B=D[L[1]]; if(!A||!B) return;
    var a=A.v, b=B.v, dl=a.distanceTo(b), w=Math.min(14,dl*.12);
    var c1=a.clone().lerp(b,.33).add(V(rnd(-w,w),rnd(-w,w),rnd(-w,w))), c2=a.clone().lerp(b,.66).add(V(rnd(-w,w),rnd(-w,w),rnd(-w,w)));
    var curve=new T.CatmullRomCurve3([a.clone(),c1,c2,b.clone()]);
    var seg=Math.max(40,Math.round(dl));
    var tube=new T.Mesh(new T.TubeGeometry(curve,mini?Math.max(12,seg>>2):seg,mini?.07:.16,mini?4:6,false),new T.MeshBasicMaterial({color:mini?(B.col?new T.Color(B.col).getHex():0x4f7dff):(k%2?0x2ee6ff:0xa45cff),transparent:true,opacity:.22,depthWrite:false,blending:ADD}));
    var line=new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(seg)),new T.LineBasicMaterial({color:k%3?0x4f7dff:0x19f0b0,transparent:true,opacity:.6,blending:ADD}));
    if(A.secret||B.secret){ tube.material.opacity=.06; line.material.opacity=.12; }
    mind.add(tube); mind.add(line);
    var mini=A.mini||B.mini, comets=[], nC=mini?1:Math.min(4,1+Math.round(dl/60));
    for(var c=0;c<nC;c++){ var parts=[];
      for(var q2=0;q2<(mini?4:7);q2++){ var sp=new T.Sprite(new T.SpriteMaterial({map:(k+c)%2?glowG:glowB,transparent:true,depthWrite:false,opacity:1-q2/7,blending:ADD})); var sz=(q2?1.0:1.6)*(1-q2/9); sp.scale.set(sz,sz,1); mind.add(sp); parts.push(sp); }
      comets.push({t:Math.random(),v:rnd(.05,.1)*60/Math.max(60,dl),dir:Math.random()<.5?1:-1,parts:parts}); }
    var ax={a:L[0],b:L[1],key:[L[0],L[1]].sort().join('|'),curve:curve,tube:tube,line:line,comets:comets,boost:0,len:dl,secret:A.secret||B.secret,seen:false,col:line.material.color.getHex()};
    axons.push(ax); pathLook(ax);
  });
  function routeBetween(a,b){ if(!a||!b||a===b) return null; var prev={}, q=[a], seen={}; seen[a]=1;
    while(q.length){ var n=q.shift(); if(n===b) break; axons.forEach(function(L){ var m=L.a===n?L.b:(L.b===n?L.a:null); if(m && !seen[m]){ seen[m]=1; prev[m]=n; q.push(m); } }); }
    if(!seen[b]) return null; var path=[b]; while(path[0]!==a) path.unshift(prev[path[0]]); return path; }
  /* explored paths glow solid; unexplored ones are faint dashes, inviting you to take them */
  function pathLook(L){ var old=L.line.material;
    if(L.seen){ L.line.material=new T.LineBasicMaterial({color:0xffe9a8,transparent:true,opacity:.85,blending:ADD}); }
    else { L.line.material=new T.LineDashedMaterial({color:L.col,transparent:true,opacity:.35,dashSize:1.1,gapSize:1.6,blending:ADD}); L.line.computeLineDistances(); }
    if(old) old.dispose(); if(theme==='light'){ L.line.material.userData.add=true; L.line.material.blending=T.NormalBlending; } }
  var pathHook=null;
  function setSeen(keys){ var set={}; (keys||[]).forEach(function(k){ set[k]=1; }); axons.forEach(function(L){ var v=!!set[L.key]; if(v!==L.seen){ L.seen=v; pathLook(L); } }); }
  function markRoute(route){ var fresh=[]; for(var i=0;i<route.length-1;i++){ var L=axonBetween(route[i],route[i+1]); if(L&&!L.seen){ L.seen=true; pathLook(L); fresh.push(L.key); } } if(fresh.length&&pathHook) pathHook(fresh); }
  function unexploredFrom(id){ return axons.filter(function(L){ return (L.a===id||L.b===id)&&!L.seen; }).map(function(L){ return L.a===id?L.b:L.a; }); }
  function axonBetween(a,b){ for(var i=0;i<axons.length;i++){ var L=axons[i]; if((L.a===a&&L.b===b)||(L.a===b&&L.b===a)) return L; } return null; }

  // dust streaks — always rushing toward the viewer, faster while you travel
  var ND=small?380:800, dust=[], dp=new Float32Array(ND*6), dc=new Float32Array(ND*6);
  for(var q3=0;q3<ND;q3++){ dust.push({x:rnd(-90,90),y:rnd(-55,55),z:rnd(-230,5)});
    var c4=Math.random()<.5?SILVER:PAL[(Math.random()*PAL.length)|0]; dc.set([c4.r,c4.g,c4.b,1,1,1],q3*6); }
  var dg2=new T.BufferGeometry(); dg2.setAttribute('position',new T.BufferAttribute(dp,3)); dg2.setAttribute('color',new T.BufferAttribute(dc,3));
  var dustObj=new T.LineSegments(dg2,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.7,depthWrite:false,blending:ADD})); scene.add(dustObj);

  /* ── camera poses: the neuron sits left of the words on desktop, above them on phones ── */
  function pose(id,P,L){
    var d=D[id]; if(!d){ P.set(0,0,40); L.set(0,0,0); return; }
    var yaw=d.yaw||0, dist=(d.dist||30)*(narrow()?1.25:1), v=d.v;
    P.set(v.x+Math.sin(yaw)*dist, v.y+dist*.14, v.z+Math.cos(yaw)*dist);
    if(d.centre){ L.copy(v); if(narrow()) L.y-=dist*.12; return; }
    if(narrow()){ L.copy(v); L.y-=dist*.31; }
    else { var sh=d.shift||.38; L.set(v.x+Math.cos(yaw)*dist*sh, v.y-dist*.02, v.z-Math.sin(yaw)*dist*sh); }
  }

  /* ── state ── */
  var mode='outside', speed=16, baseSpeed=16, rotTarget=0, mx=0, my=0, shake=0;
  var OUT_POS=V(0,0,-62);
  brain.position.set(0,0,-150);
  addEventListener('pointermove',function(e){ mx=(e.clientX/innerWidth-.5); my=(e.clientY/innerHeight-.5); },{passive:true});
  var fly={mode:'return',t:0,next:16,v:0}, tmpV=V(0,0,0), tmpA=V(0,0,0), tmpB=V(0,0,0);
  var camPos=V(0,0,0), camLook=V(0,0,-60), prevCam=V(0,0,0), camVel=0;
  var cur=DESTS[0]?DESTS[0].id:null, travel=null, drift=0, orbY=0, orbP=0, orbYt=0, orbPt=0;
  var enterCb=null, enterT=0, enterFrom=null, enterSwap=false;


  /* inside, the brain's outline wraps the whole mind: zoom out at Home to see its shape */
  function brainShell(){ brain.visible=true; brain.position.set(0,-6,-95); brain.scale.setScalar(13); brain.rotation.set(-.05,Math.PI/2,0);
    bpts.material.size=small?7:6; bpts.material.opacity=.55;
    brain.children.forEach(function(c){ if(c.type==='LineSegments'&&c!==bpts) c.material.opacity=.16; if(c.type==='Points'&&c!==bpts) c.material.size=small?4.5:4; if(c.type==='Sprite') c.visible=false; });
    scene.fog.far=520; }

  /* ── the voyage: drift through space, past the Earth and the planets, and back into the mind ── */
  var planets=new T.Group(); planets.visible=false; scene.add(planets); var PL=[];
  function ptex(kind){ var c=document.createElement('canvas'); c.width=512; c.height=256; var g=c.getContext('2d'), i, x, y;
    function blob(col,n,rmin,rmax){ g.fillStyle=col; for(i=0;i<n;i++){ x=Math.random()*512; y=30+Math.random()*196; var r=rmin+Math.random()*(rmax-rmin); g.beginPath(); g.ellipse(x,y,r*1.6,r,Math.random()*3,0,Math.PI*2); g.fill(); g.beginPath(); g.ellipse(x-512,y,r*1.6,r,0,0,Math.PI*2); g.fill(); } }
    if(kind==='earth'){ g.fillStyle='#1d5fb8'; g.fillRect(0,0,512,256); blob('#2f8f4e',26,10,34); blob('#7a6a3a',10,6,16); g.fillStyle='#eef6ff'; g.fillRect(0,0,512,14); g.fillRect(0,242,512,14); }
    else if(kind==='clouds'){ g.clearRect(0,0,512,256); blob('rgba(255,255,255,.55)',60,4,16); }
    else if(kind==='moon'){ g.fillStyle='#9a9ca3'; g.fillRect(0,0,512,256); blob('rgba(70,72,80,.5)',40,3,14); }
    else if(kind==='mars'){ g.fillStyle='#b5532c'; g.fillRect(0,0,512,256); blob('rgba(120,40,20,.6)',30,6,20); g.fillStyle='#f3e2d6'; g.fillRect(0,0,512,8); }
    else if(kind==='jupiter'||kind==='saturn'){ var cols=kind==='jupiter'?['#c9a27a','#e8d3b5','#a87c56','#f1e4cf','#b8865f']:['#d9c18f','#efe0b9','#c4a66e','#f4e9cc'];
      for(y=0;y<256;y+=8){ g.fillStyle=cols[(y/8+(Math.random()<.3?1:0))%cols.length|0]; g.fillRect(0,y,512,8); } if(kind==='jupiter'){ g.fillStyle='#b5523a'; g.beginPath(); g.ellipse(330,160,26,14,0,0,Math.PI*2); g.fill(); } }
    else if(kind==='ring'){ c.width=256; c.height=8; g=c.getContext('2d'); for(x=0;x<256;x++){ g.fillStyle='rgba(225,205,160,'+(.15+.6*Math.abs(Math.sin(x*.21)*Math.sin(x*.05)))+')'; g.fillRect(x,0,1,8); } }
    var t2=new T.CanvasTexture(c); return t2; }
  function planet(kind,pos,r){ var m=new T.Mesh(new T.SphereGeometry(r,48,32),new T.MeshPhongMaterial({map:ptex(kind),shininess:kind==='earth'?25:5,fog:false})); m.position.set(pos[0],pos[1],pos[2]); planets.add(m); PL.push({m:m,r:r,kind:kind}); return m; }
  (function(){ var sun=new T.Sprite(new T.SpriteMaterial({map:dotTex('rgba(255,240,200,1)','rgba(255,170,60,0)'),transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending})); sun.scale.set(420,420,1); sun.position.set(900,300,1350); planets.add(sun);
    var sl=new T.PointLight(0xfff1d6,1.6,0,0); sl.position.copy(sun.position); planets.add(sl); planets.add(new T.AmbientLight(0x334466,.35));
    var earth=planet('earth',[-130,0,520],34); var cl=new T.Mesh(new T.SphereGeometry(34.8,48,32),new T.MeshPhongMaterial({map:ptex('clouds'),transparent:true,depthWrite:false,fog:false})); earth.add(cl); earth.userData.clouds=cl;
    var atm=new T.Sprite(new T.SpriteMaterial({map:dotTex('rgba(90,170,255,.5)','rgba(90,170,255,0)'),transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending})); atm.scale.set(96,96,1); earth.add(atm);
    planet('moon',[-50,40,470],9); planet('mars',[190,30,760],20); planet('jupiter',[-300,-40,980],70);
    var sat=planet('saturn',[330,70,1180],52); var ring=new T.Mesh(new T.RingGeometry(66,110,96),new T.MeshBasicMaterial({map:ptex('ring'),transparent:true,side:T.DoubleSide,depthWrite:false,fog:false}));
    var rp=ring.geometry.attributes.position, uv=ring.geometry.attributes.uv, v3=new T.Vector3(); for(var i=0;i<rp.count;i++){ v3.fromBufferAttribute(rp,i); uv.setXY(i,(v3.length()-66)/44,.5); }
    ring.rotation.x=-1.2; ring.rotation.y=.3; sat.add(ring); })();
  var voyage=null, VPATH=new T.CatmullRomCurve3([V(0,90,1600),V(240,110,1320),V(150,60,1080),V(-150,-10,1060),V(-170,-60,880),V(60,40,820),V(170,10,680),V(20,20,600),V(-70,10,430),V(-20,5,300),V(0,0,140),V(40,10,20),V(-30,-5,-90),V(30,20,-200),V(-60,30,-120),V(-20,60,300),V(-120,120,900)],true,'centripetal',.5);
  function voyageStart(){ if(mode!=='inside') return; flight=null; travel=null; voyage={t0:performance.now(),dur:150000,u0:0}; planets.visible=true; scene.fog.far=2600; }
  function voyageStop(){ if(!voyage) return; voyage=null; planets.visible=false; scene.fog.far=520; }
  function voyageStep(dt){ var k=((performance.now()-voyage.t0)/voyage.dur)%1; VPATH.getPointAt(k,camPos); VPATH.getPointAt((k+.006)%1,tmpA);
    var best=null,bd=1e9; PL.forEach(function(q){ var d=q.m.position.distanceTo(camPos)-q.r; if(d<bd){ bd=d; best=q; } });
    if(best&&bd<260){ var w=Math.max(0,1-bd/260)*.65; tmpA.lerp(best.m.position,w); }
    camLook.lerp(tmpA,Math.min(1,dt*1.5));
    PL.forEach(function(q){ q.m.rotation.y+=dt*(q.kind==='earth'?.05:.02); if(q.m.userData.clouds) q.m.userData.clouds.rotation.y+=dt*.012; }); }
  function enter(cb){
    if(mode!=='outside'){ cb&&cb(); return; }
    mode='entering'; enterT=performance.now(); enterCb=cb; speed=260; shake=1.2; bpul.burst(80);
    enterFrom={p:brain.position.clone()};
  }
  function go(id,cb){
    if(!D[id]){ cb&&cb(); return; }
    if(mode!=='inside'){ cur=id; cb&&cb(); return; }
    if(voyage) voyageStop(); var wasFree=!!flight; flight=null; orbY=orbYt=0; orbP=orbPt=0;
    if(id===cur && !travel && !wasFree){ cb&&cb(); return; }
    var from=cur; cur=id;
    var P1=V(0,0,0), L1=V(0,0,0); pose(id,P1,L1);
    var dist=camPos.distanceTo(P1), dirv=P1.clone().sub(camPos).normalize();
    var side=V(0,1,0).cross(dirv).normalize().multiplyScalar(dist*rnd(.12,.22)*(Math.random()<.5?-1:1));
    var lift=V(0,dist*.12,0);
    var curve=new T.CubicBezierCurve3(camPos.clone(), camPos.clone().addScaledVector(dirv,dist*.3).add(side).add(lift), P1.clone().addScaledVector(dirv,-dist*.3).add(side).add(lift), P1.clone());
    var A=axonBetween(from,id); if(A){ A.boost=2.5; if(!A.seen){ A.seen=true; pathLook(A); pathHook&&pathHook([A.key]); } }
    var dur=reduce?10:Math.max(2600,Math.min(5600,1500+dist*16)), la=.06;
    var route=reduce?null:routeBetween(from,id);
    if(route && route.length>1){
      var pts=[camPos.clone()], up=V(0,1.8,0);
      for(var r=0;r<route.length-1;r++){ var ax=axonBetween(route[r],route[r+1]); if(!ax) continue; var fw=ax.a===route[r]; ax.boost=3;
        for(var sI=1;sI<=16;sI++){ var tt=sI/17; ax.curve.getPoint(fw?tt:1-tt,tmpA); pts.push(tmpA.clone().add(up)); } }
      pts.push(P1.clone());
      curve=new T.CatmullRomCurve3(pts,false,'centripetal',.5); markRoute(route);
      dur=Math.max(3800,Math.min(9500,2400+curve.getLength()*13)); la=.02;
    }
    travel={t0:performance.now(),dur:dur,curve:curve,fromLook:camLook.clone(),toLook:L1,cb:cb,to:id,la:la};
    fpul.burst(60);
    return dur;
  }
  /* ── free flight: the visitor takes the controls ── */
  var flight=null, nearHook=null, fwd=V(0,0,-1), CENTER=V(40,0,-80), BOUND=290;
  function reach(d){ return (d.scale||1)*5+3; }
  function freeStart(target){
    if(mode!=='inside') return false;
    if(travel){ travel=null; }
    var dir=(target&&D[target])?D[target].v.clone().sub(camPos).normalize():camLook.clone().sub(camPos).normalize();
    flight={t0:performance.now(),yaw:Math.atan2(-dir.x,-dir.z),pitch:Math.asin(Math.max(-1,Math.min(1,dir.y))),vel:0,thrust:0,turn:0,tilt:0,max:small?55:70,ignore:cur,ignoreR:D[cur]?reach(D[cur])+14:0};
    return true;
  }
  function freeStep(dt){
    var f=flight;
    f.yaw+=f.turn*dt*1.3; f.pitch=Math.max(-1.25,Math.min(1.25,f.pitch+f.tilt*dt*.9));
    f.vel+=(f.thrust*f.max-f.vel)*Math.min(1,dt*(f.thrust?1.5:2.2));
    fwd.set(-Math.sin(f.yaw)*Math.cos(f.pitch), Math.sin(f.pitch), -Math.cos(f.yaw)*Math.cos(f.pitch));
    camPos.addScaledVector(fwd,f.vel*dt);
    tmpA.copy(camPos).sub(CENTER); var r=tmpA.length(); if(r>BOUND) camPos.addScaledVector(tmpA.normalize(),-(r-BOUND)*Math.min(1,dt*2));
    tmpB.copy(camPos).addScaledVector(fwd,40); camLook.lerp(tmpB,Math.min(1,dt*3.5));
    if(f.ignore && D[f.ignore].v.distanceTo(camPos)>f.ignoreR) f.ignore=null;
    if(performance.now()-f.t0>3000) for(var i=0;i<DESTS.length;i++){ var d=DESTS[i]; if(d.id===f.ignore) continue;
      if(d.v.distanceTo(camPos)<reach(d)){ f.ignore=d.id; f.ignoreR=reach(d)+14; if(nearHook) nearHook(d.id); break; } }
  }
  function nearest(){ var best=null, bd=1e9; DESTS.forEach(function(d){ var dd=d.v.distanceTo(camPos); if(dd<bd){ bd=dd; best=d.id; } }); return {id:best,dist:bd}; }
  function fire(id){ var d=D[id]; if(!d) return; d.fire=1; d.shockT=0; fpul.burst(40,3.5); }
  function warp(){ shake=.5; speed=mode==='inside'?60:220; }

  var clock=new T.Clock(), pairT=0.4, soloT=1.2, running=true;
  document.addEventListener('visibilitychange',function(){ running=!document.hidden; if(running){ clock.getDelta(); loop(); } });
  function ease(x){ return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2; }
  function smooth(a,b,x){ var t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }

  function frame(dt){
    var t=clock.elapsedTime;
    // dust
    var dSpeed=mode==='inside'?(10+camVel*1.6):speed;
    speed+=(baseSpeed-speed)*Math.min(1,dt*1.6);
    var len=0.6+dSpeed*0.05;
    for(var i=0;i<ND;i++){ var d=dust[i]; d.z+=dSpeed*dt*(mode==='inside'?1:1); if(d.z>5){ d.z=-230; d.x=rnd(-90,90); d.y=rnd(-55,55); }
      dp[i*6]=d.x; dp[i*6+1]=d.y; dp[i*6+2]=d.z; dp[i*6+3]=d.x; dp[i*6+4]=d.y; dp[i*6+5]=d.z-len; }
    dg2.attributes.position.needsUpdate=true;
    dustObj.material.opacity=mode==='inside'?Math.min(.75,.18+camVel*.02):.7;

    if(mode==='outside'){
      rotTarget+=dt*0.1; brain.rotation.y+=(rotTarget-brain.rotation.y)*Math.min(1,dt*1.8);
      brain.rotation.x=Math.sin(t*.2)*.08-0.12; fly.t+=dt;
      if(fly.mode==='rest'){ var bob=Math.sin(fly.t*.45)*14; tmpV.copy(OUT_POS); tmpV.z+=bob-6; brain.position.lerp(tmpV,Math.min(1,dt*1.2));
        if(fly.t>fly.next){ fly.mode='pass'; fly.t=0; fly.v=6; } }
      else if(fly.mode==='pass'){ fly.v=Math.min(fly.v+dt*55,95); brain.position.z+=fly.v*dt; brain.position.x*=1-Math.min(1,dt*1.2);
        if(brain.position.z>28){ brain.position.set(rnd(-10,10),rnd(-5,5),-270); fly.mode='return'; fly.t=0; bpul.burst(30); } }
      else { brain.position.lerp(OUT_POS,Math.min(1,dt*.55)); if(Math.abs(brain.position.z-OUT_POS.z)<3){ fly.mode='rest'; fly.t=0; fly.next=rnd(14,22); } }
      brain.scale.setScalar(1+Math.sin(t*1.3)*.012);
      camPos.set(mx*6,-my*4,0); camLook.set(mx*2,-my*1.5,-60);
    } else if(mode==='entering'){
      var el=performance.now()-enterT;
      if(el<1300){ var kk=el/1300, e=kk*kk*kk; brain.position.lerpVectors(enterFrom.p,tmpV.set(0,0,45),e); brain.rotation.y+=dt*.6; camPos.set(0,0,0); camLook.set(0,0,-60); }
      else {
        if(!enterSwap){ enterSwap=true; mind.visible=true; scene.fog.near=60; scene.fog.far=330; brainShell();
          cubes.forEach(function(c){ c.on=false; c.g.visible=false; }); frags.forEach(function(f){ f.on=false; f.g.visible=false; });
          var cb=enterCb; enterCb=null; cb&&cb(); }
        var k1=Math.min(1,(el-1300)/2600), e1=ease(k1), P0=V(0,0,0), L0=V(0,0,0); pose(cur,P0,L0);
        camPos.lerpVectors(D[cur].v.clone().add(V(0,0,3)),P0,e1); camLook.lerpVectors(D[cur].v.clone().add(V(0,0,-40)),L0,e1);
        if(k1>=1){ mode='inside'; }
      }
    } else {
      var P1=V(0,0,0), L1=V(0,0,0);
      if(voyage){ voyageStep(dt); }
      else if(flight && !travel){ freeStep(dt); }
      else if(travel){
        var k2=Math.min(1,(performance.now()-travel.t0)/travel.dur), e2=ease(k2);
        travel.curve.getPoint(e2,camPos);
        travel.curve.getPoint(Math.min(1,e2+(travel.la||.06)),tmpA);
        if(e2>.94) tmpA.copy(travel.toLook);
        var lookAhead=tmpB.copy(camLook);
        if(k2<.18) lookAhead.lerpVectors(travel.fromLook,tmpA,smooth(0,.18,k2));
        else lookAhead.copy(tmpA);
        camLook.copy(lookAhead).lerp(travel.toLook,smooth(.55,1,k2));
        if(k2>=1){ var cb2=travel.cb; travel=null; drift=0; cb2&&cb2(); }
      } else {
        drift+=dt; pose(cur,P1,L1);
        // look around by dragging: orbit the camera around the current neuron
        orbY+=(orbYt-orbY)*Math.min(1,dt*6); orbP+=(orbPt-orbP)*Math.min(1,dt*6);
        if(Math.abs(orbY)>1e-4||Math.abs(orbP)>1e-4){ var cv=D[cur].v, rel=P1.clone().sub(cv), lrel=L1.clone().sub(cv), qy=new T.Quaternion().setFromAxisAngle(V(0,1,0),orbY);
          var side=V(1,0,0).applyQuaternion(qy), qp=new T.Quaternion().setFromAxisAngle(side,orbP), q=qp.multiply(qy); rel.applyQuaternion(q); lrel.applyQuaternion(q); P1.copy(cv).add(rel); L1.copy(cv).add(lrel); }
        P1.x+=Math.sin(drift*.25)*1.2+mx*2.4; P1.y+=Math.sin(drift*.31)*.9-my*1.8;
        camPos.lerp(P1,Math.min(1,dt*2)); camLook.lerp(L1,Math.min(1,dt*2));
      }
      // neurons breathe; signals run in along dendrites; the active one fires
      DESTS.forEach(function(d){
        var on=d.id===cur, sc=d.scale||1, p=1+Math.sin(t*2+d.i)*.08;
        d.fire*=Math.pow(.3,dt);
        var hs=(on?9.5:8)*sc*p*(1+d.fire*.5); d.halo.scale.set(hs,hs,1);
        d.halo.material.opacity=(d.secret?.3:.72)+d.fire*.25;
        var cs=2.2*sc*(1+d.fire*.8); d.core.scale.set(cs,cs,1);
        d.ring.lookAt(cam.position); d.ring.rotateZ(t*.3+d.i); d.ring2.lookAt(cam.position); d.ring2.rotateZ(-t*.5-d.i);
        d.ring.material.opacity=on?.7:.45; d.ring2.material.opacity=on?.55:.3;
        if(d.shockT<1){ d.shockT+=dt*.9; d.shock.lookAt(cam.position); var ss=3+d.shockT*16*sc; d.shock.scale.set(ss,ss,1); d.shock.material.opacity=.7*(1-d.shockT); } else d.shock.material.opacity=0;
        d.sig.forEach(function(g){ g.t-=dt*g.v*(1+d.fire*4); if(g.t<0){ g.t=1; g.b=(Math.random()*d.branches.length)|0; }
          along(d.branches[g.b],g.t,g.s.position); g.s.material.opacity=Math.min(1,(1-g.t)*2)*(d.secret?.5:1); });
      });
      axons.forEach(function(L){ L.boost*=Math.pow(.35,dt); var hot=(L.a===cur||L.b===cur);
        if(!L.secret){ L.tube.material.opacity=(L.seen?.22:.08)+(hot?.12:0)+L.boost*.2; L.line.material.opacity=L.seen?(.75+(hot?.2:0)):(.28+(hot?.25:0)); }
        L.comets.forEach(function(c){ c.t+=dt*c.v*(1+L.boost*5)*c.dir; if(c.t>1) c.t-=1; if(c.t<0) c.t+=1;
          for(var q=0;q<c.parts.length;q++){ var tt=c.t-c.dir*q*.012; tt=tt<0?tt+1:(tt>1?tt-1:tt); L.curve.getPoint(tt,c.parts[q].position);
            var dd=c.parts[q].position.distanceTo(cam.position); c.parts[q].material.opacity=(1-q/7)*Math.max(0,Math.min(1,(dd-10)/30))*(L.secret?.35:1); } }); });
      fpul.step(dt);
    }
    if(brain.visible) bpul.step(dt);
    core.material.opacity=.22+Math.sin(t*1.7)*.05;

    // cubes (gate only)
    pairT-=dt; soloT-=dt;
    var cubesOn=mode==='outside';
    if(cubesOn){ if(pairT<=0){ spawnPair(); pairT=rnd(1.4,2.6); } if(soloT<=0){ spawnSolo(); soloT=rnd(.9,2); } }
    var worldDz=(speed-baseSpeed)*dt;
    cubes.forEach(function(c){ if(!c.on) return;
      c.p.addScaledVector(c.v,dt); c.p.z+=worldDz+(c.solo?0:baseSpeed*.15*dt);
      c.g.position.copy(c.p); c.g.rotation.x+=c.rv.x*dt; c.g.rotation.y+=c.rv.y*dt; c.g.rotation.z+=c.rv.z*dt;
      if(c.mate && c.mate.on && c.p.distanceTo(c.mate.p)<(c.size+c.mate.size)*.55){ explode(c.p.clone().add(c.mate.p).multiplyScalar(.5));
        c.on=false; c.g.visible=false; c.mate.on=false; c.mate.g.visible=false; return; }
      if(c.p.z>8||Math.abs(c.p.x)>140||!cubesOn){ c.on=false; c.g.visible=false; } });
    frags.forEach(function(f){ if(!f.on) return; f.age+=dt; var k3=1-f.age/f.life;
      if(k3<=0){ f.on=false; f.g.visible=false; return; }
      f.v.multiplyScalar(1-dt*.9); f.p.addScaledVector(f.v,dt); f.p.z+=worldDz; f.g.position.copy(f.p);
      f.g.rotation.x+=f.rv.x*dt; f.g.rotation.y+=f.rv.y*dt; f.g.scale.setScalar(f.size*Math.max(.05,k3));
      f.g.userData.mesh.material.opacity=.6*k3; f.g.userData.line.material.opacity=k3; });
    flashes.forEach(function(fl){ if(fl.t>=1){ fl.s.material.opacity=0; return; } fl.t+=dt*1.8; var s2=4+fl.t*26; fl.s.scale.set(s2,s2,1); fl.s.material.opacity=Math.max(0,.9*(1-fl.t)); });

    // camera
    shake*=Math.pow(.02,dt);
    camVel=camVel*.85+(prevCam.distanceTo(camPos)/Math.max(dt,.001))*.15; prevCam.copy(camPos);
    cam.position.copy(camPos); cam.position.x+=(Math.random()-.5)*shake*.6; cam.position.y+=(Math.random()-.5)*shake*.6;
    cam.lookAt(camLook);
    dustObj.position.copy(cam.position); dustObj.quaternion.copy(cam.quaternion);
    if(mode==='inside' && labelHook) labelHook();
  }
  function loop(){ if(!running) return; var dt=Math.min(clock.getDelta(),.05); frame(dt); renderer.render(scene,cam); requestAnimationFrame(loop); }

  /* ── screen positions, for labels and for words pouring out of the neuron ── */
  var tcam=new T.PerspectiveCamera(58,1,0.1,900), pv=V(0,0,0);
  function screenOf(id){ var d=D[id]; if(!d) return null; pv.copy(d.v).project(cam);
    return {x:(pv.x+1)/2*innerWidth, y:(1-pv.y)/2*innerHeight, z:pv.z, on:pv.z<1, dist:d.v.distanceTo(cam.position)}; }
  function restScreen(id){ var d=D[id]; if(!d) return null; var P=V(0,0,0), L=V(0,0,0); pose(id,P,L);
    tcam.aspect=cam.aspect; tcam.updateProjectionMatrix(); tcam.position.copy(P); tcam.lookAt(L); tcam.updateMatrixWorld();
    pv.copy(d.v).project(tcam); return {x:(pv.x+1)/2*innerWidth, y:(1-pv.y)/2*innerHeight}; }
  var labelHook=null;

  /* themes: deep space (dark) or daylight mind (light) */
  var theme='dark';
  function setTheme(th){ theme=th; var light=th==='light';
    scene.fog.color.set(light?0xeef2f8:0x03040a);
    if(window.__stars) window.__stars.visible=!light;
    scene.traverse(function(o){ var m=o.material; if(!m) return; (Array.isArray(m)?m:[m]).forEach(function(mm){
      if(mm.userData.add===undefined) mm.userData.add=(mm.blending===T.AdditiveBlending);
      if(mm.userData.add){ mm.blending=light?T.NormalBlending:T.AdditiveBlending; mm.needsUpdate=true; } }); });
  }
  /* pictures and charts floating in space beside a neuron */
  function addBillboard(id,src,w,h,off){ var d=D[id]; if(!d) return null;
    var tex=src.tagName==='CANVAS'?new T.CanvasTexture(src):src.tagName==='VIDEO'?new T.VideoTexture(src):new T.Texture(src); tex.needsUpdate=true;
    var sp=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false})); sp.scale.set(w,h,1);
    sp.position.copy(d.v).add(V(off[0],off[1],off[2])); mind.add(sp);
    return {sprite:sp,update:function(){ tex.needsUpdate=true; },remove:function(){ mind.remove(sp); tex.dispose(); sp.material.dispose(); }};
  }
  function setColor(id,hex){ var d=D[id]; if(!d) return; var c=new T.Color(hex); d.ring.material.color.copy(c); d.shock.material.color.copy(c);
    var cs='rgba('+Math.round(c.r*255)+','+Math.round(c.g*255)+','+Math.round(c.b*255)+','; d.halo.material.map=dotTex(cs+'1)',cs+'0)'); d.halo.material.needsUpdate=true; }
  function orbit(dx,dy){ orbYt-=dx*.006; orbPt=Math.max(-1.1,Math.min(1.1,orbPt-dy*.004)); }
  window.HMind={voyageStart:voyageStart,voyageStop:voyageStop,voyaging:function(){ return !!voyage; },setSeen:setSeen,onPath:function(fn){ pathHook=fn; },unexploredFrom:unexploredFrom,orbit:orbit,setTheme:setTheme,addBillboard:addBillboard,setColor:setColor,enter:enter,go:go,fire:fire,warp:warp,screenOf:screenOf,restScreen:restScreen,ids:DEST_IDS,
    mode:function(){ return mode; }, current:function(){ return cur; }, travelling:function(){ return !!travel; },
    onFrame:function(fn){ labelHook=fn; },
    freeStart:freeStart, isFree:function(){ return !!flight; }, onNear:function(fn){ nearHook=fn; }, nearest:nearest,
    freeLook:function(dx,dy){ if(!flight) return; flight.yaw-=dx*.0045; flight.pitch=Math.max(-1.25,Math.min(1.25,flight.pitch-dy*.0035)); },
    freeThrust:function(v){ if(flight) flight.thrust=v; }, freeTurn:function(v){ if(flight) flight.turn=v; }, freeTilt:function(v){ if(flight) flight.tilt=v; },
    freeKick:function(v){ if(flight) flight.vel=Math.max(-25,Math.min(flight.max*1.2,flight.vel+v)); }};
  if(reduce){
    window.HMind.enter=function(cb){ mode='inside'; mind.visible=true; brainShell(); scene.fog.near=60; scene.fog.far=330; var P=V(0,0,0),L=V(0,0,0); pose(cur,P,L); camPos.copy(P); camLook.copy(L); cb&&cb(); };
  }
  loop();
})();
