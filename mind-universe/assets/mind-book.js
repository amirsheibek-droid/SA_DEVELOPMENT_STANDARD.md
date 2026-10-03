/* Floating journal in the mind — a book you turn beside the Diary neuron. */
(function(){
  var T=window.THREE, book=null, pageI=0, notes=[], flipping=0;
  function pageCanvas(note, side){
    var c=document.createElement('canvas'); c.width=512; c.height=640; var g=c.getContext('2d');
    g.fillStyle='#f4e7c8'; g.fillRect(0,0,512,640);
    g.fillStyle='rgba(40,24,8,.08)'; for(var y=70;y<620;y+=28) g.fillRect(36,y,440,1);
    g.fillStyle='#5a3a16'; g.font='700 28px Inter,serif';
    g.fillText(side==='L'?'Journal':'', 40, 42);
    if(!note){ g.fillStyle='#8a7050'; g.font='22px Inter,serif'; g.fillText('Write a page. It hangs here.', 40, 120); return c; }
    g.fillStyle='#3a2410'; g.font='700 26px Inter,serif';
    var title=String(note.title||'Untitled').slice(0,28);
    g.fillText(title, 40, 88);
    g.fillStyle='#6a5030'; g.font='16px JetBrains Mono,monospace';
    g.fillText(new Date(note.ts||Date.now()).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}), 40, 118);
    g.fillStyle='#2a1a0c'; g.font='22px Inter,serif';
    var words=String(note.text||'').split(/\s+/), line='', y=160;
    words.forEach(function(w){
      var t=line?line+' '+w:w;
      if(g.measureText(t).width>430){ g.fillText(line,40,y); line=w; y+=30; }
      else line=t;
    });
    if(line&&y<610) g.fillText(line,40,y);
    return c;
  }
  function texOf(note, side){
    var tex=new T.CanvasTexture(pageCanvas(note, side));
    tex.minFilter=T.LinearFilter; tex.needsUpdate=true; return tex;
  }
  function build(){
    var M=window.HMind; if(!M||!M.attach||!M.anchor) return;
    var v=M.anchor('diary'); if(!v) return;
    kill();
    book=new T.Group();
    var cover=new T.Mesh(new T.BoxGeometry(18, 22, 1.1), new T.MeshPhongMaterial({color:0x5a2a12,emissive:0x2a1008,emissiveIntensity:.25}));
    cover.position.z=-0.7;
    var L=new T.Mesh(new T.PlaneGeometry(8.4, 20), new T.MeshBasicMaterial({map:texOf(null,'L')}));
    L.position.set(-4.3,0,.2);
    var R=new T.Mesh(new T.PlaneGeometry(8.4, 20), new T.MeshBasicMaterial({map:texOf(null,'R')}));
    R.position.set(4.3,0,.2);
    var flap=new T.Mesh(new T.PlaneGeometry(8.4, 20), new T.MeshBasicMaterial({map:texOf(null,'R')}));
    flap.position.set(4.3,0,.28); flap.visible=false;
    book.add(cover, L, R, flap);
    book.position.copy(v).add(new T.Vector3(16, 2, 10));
    book.userData={L:L,R:R,flap:flap,cover:cover};
    M.attach(book);
    paint();
  }
  function paint(){
    if(!book) return;
    var L=book.userData.L, R=book.userData.R;
    var a=notes[pageI]||null, b=notes[pageI+1]||null;
    if(L.material.map) L.material.map.dispose();
    if(R.material.map) R.material.map.dispose();
    L.material.map=texOf(a,'L'); L.material.needsUpdate=true;
    R.material.map=texOf(b,'R'); R.material.needsUpdate=true;
  }
  function setNotes(list){ notes=list||[]; if(pageI>=notes.length) pageI=Math.max(0, notes.length-1); paint(); }
  function turn(dir){
    if(!book||flipping) return;
    var n=Math.max(0, notes.length);
    var next=pageI+(dir>0?2:-2);
    if(next<0){ next=0; if(pageI===0) return false; }
    if(next>=n && pageI>=n-1) return false;
    pageI=Math.max(0, Math.min(n?n-1:0, next));
    flipping=1;
    var flap=book.userData.flap;
    flap.visible=true;
    flap.material.map=book.userData.R.material.map;
    var t0=performance.now();
    function step(){
      var k=Math.min(1,(performance.now()-t0)/420);
      var e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      flap.rotation.y=dir>0?(-e*Math.PI):(-Math.PI+e*Math.PI);
      flap.position.x=Math.cos(flap.rotation.y)*4.3;
      if(k<1) requestAnimationFrame(step);
      else { flap.visible=false; flap.rotation.y=0; flap.position.x=4.3; flipping=0; paint(); }
    }
    step();
    return true;
  }
  function pick(cx,cy,cam){
    if(!book||!cam||!T) return null;
    var ndc=new T.Vector2((cx/innerWidth)*2-1, -(cy/innerHeight)*2+1);
    var ray=new T.Raycaster(); ray.setFromCamera(ndc, cam);
    var hits=ray.intersectObject(book, true);
    return hits.length?book:null;
  }
  function tick(cam){
    if(!book||!cam) return;
    book.quaternion.copy(cam.quaternion);
    book.position.y+=(Math.sin(performance.now()/900)*0.012);
  }
  function kill(){
    if(!book) return;
    try{ if(book.parent) book.parent.remove(book); }catch(e){}
    book=null;
  }
  window.MUBook={boot:build, setNotes:setNotes, turn:turn, pick:pick, tick:tick, page:function(){ return pageI; }, kill:kill};
})();
