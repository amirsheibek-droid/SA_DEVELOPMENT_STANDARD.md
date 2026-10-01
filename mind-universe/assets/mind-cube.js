/* Star roll — 3D ball on floating space cubes. Jump, dodge, boost. */
(function(){
  function nu(C){
    var THREE=window.THREE, cv=C.canvas;
    if(!THREE||!cv){ C.toast&&C.toast('3D engine missing'); return {dead:1,bad:1}; }
    var w=cv.clientWidth||640, h=cv.clientHeight||420;
    var scene=new THREE.Scene();
    scene.background=new THREE.Color(0x05070f);
    scene.fog=new THREE.Fog(0x05070f, 14, 52);
    var cam=new THREE.PerspectiveCamera(62, w/h, 0.1, 80);
    var renderer=new THREE.WebGLRenderer({canvas:cv, antialias:true, alpha:false});
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
    renderer.setSize(w,h,false);
    renderer.shadowMap&&(renderer.shadowMap.enabled=false);

    scene.add(new THREE.AmbientLight(0x445588, .55));
    var hemi=new THREE.HemisphereLight(0x88aaff, 0x110818, .7); scene.add(hemi);
    var lamp=new THREE.PointLight(0x66e0ff, 1.1, 28); scene.add(lamp);
    var rim=new THREE.PointLight(0xff66c8, .55, 22); scene.add(rim);

    var starGeo=new THREE.BufferGeometry();
    var starN=420, starPos=new Float32Array(starN*3), i;
    for(i=0;i<starN;i++){ starPos[i*3]=(Math.random()-.5)*60; starPos[i*3+1]=Math.random()*24-4; starPos[i*3+2]=Math.random()*-80; }
    var starAttr=new THREE.BufferAttribute(starPos,3);
    if(starGeo.setAttribute) starGeo.setAttribute('position', starAttr); else starGeo.addAttribute('position', starAttr);
    var starMat=new THREE.PointsMaterial({color:0xd8ccff, size:.08, transparent:true, opacity:.9});
    var starPts=new THREE.Points(starGeo, starMat); scene.add(starPts);

    var ballGeo=new THREE.SphereGeometry(.42, 28, 20);
    var ballMat=new THREE.MeshStandardMaterial({color:0x7af0ff, emissive:0x1ad0e8, emissiveIntensity:.55, roughness:.25, metalness:.35});
    var ball=new THREE.Mesh(ballGeo, ballMat); scene.add(ball);
    var ring=new THREE.Mesh(new THREE.TorusGeometry(.5,.04,8,24), new THREE.MeshBasicMaterial({color:0xff6bd6, transparent:true, opacity:.7}));
    ring.rotation.x=Math.PI/2; scene.add(ring);

    var cubeGeo=new THREE.BoxGeometry(1.18, .38, 1.18);
    var mats={
      a:new THREE.MeshStandardMaterial({color:0x1c2a4a, emissive:0x12203a, roughness:.5}),
      b:new THREE.MeshStandardMaterial({color:0x24183a, emissive:0x1a1030, roughness:.5}),
      pad:new THREE.MeshStandardMaterial({color:0x1a4a40, emissive:0x19f0b0, emissiveIntensity:.4, roughness:.4}),
      wall:new THREE.MeshStandardMaterial({color:0x4a1830, emissive:0xff4f6d, emissiveIntensity:.35, roughness:.45}),
      hurdle:new THREE.MeshStandardMaterial({color:0x4a3a10, emissive:0xffc44d, emissiveIntensity:.3, roughness:.45})
    };
    var edgeMat=new THREE.LineBasicMaterial({color:0x2ee6ff, transparent:true, opacity:.35});

    var pool=[], items=[], nextZ=0, laneX=[-1.35,0,1.35];

    function mkCube(kind){
      var m=new THREE.Mesh(cubeGeo, mats.a);
      var e=new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeo), edgeMat);
      m.add(e); scene.add(m);
      return {mesh:m, kind:kind||'a', z:0, lane:0, live:0, y:0, ox:0};
    }
    for(i=0;i<96;i++) pool.push(mkCube());

    var colGeo=new THREE.SphereGeometry(.18, 12, 10);
    var colMat=new THREE.MeshStandardMaterial({color:0xffd27a, emissive:0xffc44d, emissiveIntensity:.8});
    var coins=[];
    for(i=0;i<24;i++){ var cm=new THREE.Mesh(colGeo, colMat); cm.visible=false; scene.add(cm); coins.push({mesh:cm, z:0, lane:0, live:0}); }

    function takeCube(){ for(var i=0;i<pool.length;i++) if(!pool[i].live) return pool[i]; return null; }
    function takeCoin(){ for(var i=0;i<coins.length;i++) if(!coins[i].live) return coins[i]; return null; }

    function placeRow(z){
      var zInt=z|0, pat=zInt%19, dens=Math.min(.55, zInt/140);
      var lanes=[1,1,1], walls=[0,0,0], hurdle=0, pad=-1, gapAll=0;
      if(zInt<4) lanes=[1,1,1];
      else if(pat===4){ lanes=[1,0,1]; }
      else if(pat===7){ lanes=[0,1,0]; }
      else if(pat===10){ lanes=[1,1,0]; }
      else if(pat===13){ lanes=[0,1,1]; }
      else if(pat===16){ hurdle=1; }
      else if(pat===6){ walls[0]=1; }
      else if(pat===8){ walls[2]=1; }
      else if(pat===11){ walls[1]=1; }
      else if(pat===17){ pad=1; }
      else if(pat===3 && zInt>12){ lanes=[1,0,0]; if(Math.random()<.5) lanes=[0,0,1]; }
      else if(Math.random()<dens*.35){ var k=(Math.random()*3)|0; lanes[k]=0; }
      if(Math.random()<dens*.2) walls[(Math.random()*3)|0]=1;
      var L;
      for(L=0;L<3;L++){
        if(!lanes[L]) continue;
        var c=takeCube(); if(!c) continue;
        c.live=1; c.z=zInt; c.lane=L; c.kind=pad===L?'pad':(walls[L]?'wall':(hurdle?'hurdle':'a'));
        c.mesh.material=mats[c.kind]||mats.a;
        c.mesh.position.set(laneX[L], c.kind==='wall'?0.85:(c.kind==='hurdle'?0.55:0), zInt);
        c.mesh.scale.set(1, c.kind==='wall'?4.2:(c.kind==='hurdle'?2.1:1), 1);
        c.mesh.visible=true;
      }
      if(zInt%5===2){
        var open=[]; for(L=0;L<3;L++) if(lanes[L]&&!walls[L]) open.push(L);
        if(open.length){ var coin=takeCoin(); if(coin){ var ln=open[(Math.random()*open.length)|0]; coin.live=1; coin.lane=ln; coin.z=zInt; coin.mesh.position.set(laneX[ln], 1.05, zInt); coin.mesh.visible=true; } }
      }
    }

    function seedTrack(){ nextZ=0; while(nextZ<28){ placeRow(nextZ); nextZ++; } }

    var st={
      x:0,y:.55,z:0, vx:0,vy:0, speed:9, boost:0, dist:0, stars:0, grounded:1, dead:0, win:0, t:0,
      best:C.best?C.best('cube'):0, inv:0,
      scene:scene, cam:cam, renderer:renderer, ball:ball
    };
    seedTrack();

    st.resize=function(cw,ch,d){
      if(!cw||!ch) return;
      cam.aspect=cw/ch; cam.updateProjectionMatrix();
      renderer.setPixelRatio(d||Math.min(2,window.devicePixelRatio||1));
      renderer.setSize(cw,ch,false);
    };
    st.kill=function(){
      renderer.dispose();
      [ballGeo,cubeGeo,colGeo,starGeo].forEach(function(geo){ geo.dispose&&geo.dispose(); });
      [ballMat,starMat,colMat,edgeMat,mats.a,mats.b,mats.pad,mats.wall,mats.hurdle].forEach(function(m){ m.dispose&&m.dispose(); });
      pool.forEach(function(c){ scene.remove(c.mesh); });
      coins.forEach(function(c){ scene.remove(c.mesh); });
    };

    st._tick=function(C){
      var dt=C.dt, ax=C.ax();
      st.t+=dt;
      if(st.dead){
        if(C.ptr.tap||C.press.jump){ try{ st.kill(); }catch(_){} return nu(C); }
        render(C); return st;
      }
      st.boost=!!(C.keys.z||C.keys.w||C.keys.arrowup||C.keys.shift||(C.ptr.on&&C.ptr.ny>0.78));
      var want=9+Math.min(14, st.dist*0.04)+(st.boost?7:0);
      st.speed+=(want-st.speed)*Math.min(1,dt*3);
      st.z+=st.speed*dt;
      st.dist=st.z;
      st.vx+=(ax*22-st.vx)*Math.min(1,dt*10);
      st.x+=st.vx*dt;
      if(st.x>2.05){ st.x=2.05; st.vx*=.2; }
      if(st.x<-2.05){ st.x=-2.05; st.vx*=.2; }

      var jump=C.press.jump||C.ptr.swipe==='up'||(C.ptr.tap&&C.ptr.ny<0.4);
      if(jump&&st.grounded){ st.vy=7.1; st.grounded=0; C.FX&&C.FX('zoop',.2); }
      st.vy-=26*dt; st.y+=st.vy*dt;

      while(nextZ<st.z+30){ placeRow(nextZ); nextZ++; }

      var gz=-99, hitWall=0, onPad=0, L, c, i;
      for(i=0;i<pool.length;i++){
        c=pool[i]; if(!c.live) continue;
        if(c.z<st.z-8){ c.live=0; c.mesh.visible=false; continue; }
        var dx=st.x-laneX[c.lane], dz=st.z-c.z;
        if(Math.abs(dz)<.62 && Math.abs(dx)<.62){
          if(c.kind==='wall' && st.y<1.55) hitWall=1;
          else if(c.kind==='hurdle' && st.y<.95 && st.vy<=2) hitWall=1;
          else { gz=Math.max(gz, .55); if(c.kind==='pad') onPad=1; }
        }
      }
      if(onPad) st.speed=Math.min(24, st.speed+8*dt);
      if(st.y<=gz+.42 && st.vy<=0 && gz>-50){ st.y=gz+.42; st.vy=0; st.grounded=1; }
      else st.grounded=0;
      if(hitWall && st.inv<=0){ die(C,'Smashed a cube'); }
      if(st.y<-5) die(C,'Fell through the night');

      for(i=0;i<coins.length;i++){
        var k=coins[i]; if(!k.live) continue;
        if(k.z<st.z-6){ k.live=0; k.mesh.visible=false; continue; }
        k.mesh.position.y=1.05+Math.sin(st.t*5+k.z)*.12;
        k.mesh.rotation.y+=dt*3;
        if(Math.abs(st.z-k.z)<.5 && Math.abs(st.x-laneX[k.lane])<.55 && Math.abs(st.y-1.05)<.8){
          k.live=0; k.mesh.visible=false; st.stars++; C.FX&&C.FX('zoop',.15);
        }
      }
      if(st.inv>0) st.inv-=dt;
      render(C);
      return st;
    };

    function die(C,msg){
      st.dead=1; st.best=C.saveBest?C.saveBest('cube', Math.floor(st.dist)+st.stars*8):st.best;
      C.toast&&C.toast(msg+' · '+Math.floor(st.dist)+'m'); C.FX&&C.FX('warp',.35);
    }
    function render(C){
      ball.position.set(st.x, st.y, st.z);
      ball.rotation.x=st.z*1.6; ball.rotation.z=-st.vx*.08;
      ring.position.set(st.x, .12, st.z);
      ring.visible=st.grounded&&!st.dead;
      lamp.position.set(st.x, st.y+2.2, st.z+1);
      rim.position.set(st.x-2, st.y+1.5, st.z-2);
      cam.position.set(st.x*.55, st.y+3.8, st.z-7.2);
      cam.lookAt(st.x*.2, st.y+.4, st.z+4);
      starPts.position.z=st.z;
      renderer.render(scene, cam);
      var hud='Star roll · '+Math.floor(st.dist)+'m · '+st.stars+' stars'+(st.best?' · best '+st.best:'');
      if(st.dead) hud='Down · tap to retry · '+Math.floor(st.dist)+'m';
      C.hud('<span>'+hud+'</span><span>'+(st.boost?'BOOST':'hold W / bottom to roll fast')+' · tap top / space jump · hold sides dodge · '+C.tiltBtn+'</span>');
    }
    st.resize(w,h);
    return st;
  }

  function step(C,st){
    if(!st||st.bad){ C.hud&&C.hud('<span>Star roll needs WebGL</span><span></span>'); return st; }
    if(st._tick) return st._tick(C);
    return st;
  }

  function attach(){ if(window.MUArcade&&window.MUArcade.impl) window.MUArcade.impl.cube={nu:nu,step:step,gl:1}; }
  attach();
  window.MUCube={attach:attach};
})();
