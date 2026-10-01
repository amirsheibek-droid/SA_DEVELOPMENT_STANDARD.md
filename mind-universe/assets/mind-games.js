/* Mind Universe arcade — original games that play on the mind TV.
   Free to ship. No commercial ROM dumps. */
(function(){
  function stars(n){ var a=[]; for(var i=0;i<n;i++) a.push({x:Math.random(),y:Math.random(),z:.3+Math.random()*1.4,s:Math.random()}); return a; }
  function drawStars(g,W,H,list,dx,dy){ dx=dx||0; dy=dy||0; for(var i=0;i<list.length;i++){ var s=list[i]; g.fillStyle='rgba(210,190,255,'+(0.22+s.z*.45)+')'; g.fillRect(((s.x*W*2+dx)%W+W)%W, ((s.y*H*2+dy)%H+H)%H, 1.3*s.z, 1.3*s.z); } }
  function glow(g,c){ g.shadowColor=c; g.shadowBlur=16; }
  function noGlow(g){ g.shadowBlur=0; }
  function rr(a,b){ return a+Math.random()*(b-a); }
  function clamp(v,a,b){ return v<a?a:v>b?b:v; }
  function hexRgba(h,a){ h=h.replace('#',''); if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; var n=parseInt(h,16); return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'; }
  function roundRect(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }

  var SHELVES=[
    {id:'now', n:'Play now', p:'Original games on the floating TV. Phone: drag or tilt. Laptop: arrows or WASD. Tap the TV to retry.'},
    {id:'her', n:'For girls & women', p:'Cozy, creative, puzzle and care — picked so this arcade is not only shooters. The whole arcade is still yours.'},
    {id:'action', n:'Arcade & action', p:'Old-cabinet energy, made here. No cartridge needed.'},
    {id:'puzzle', n:'Puzzle', p:'Quiet brain games. Swipe, tap, think.'},
    {id:'cozy', n:'Cozy & creative', p:'Soft worlds. Grow, pop, keep a companion, paint a constellation.'}
  ];

  var GAMES=[
    {id:'ball', n:'Balance ball', tag:'Skill', c:'#2ee6ff', s:['now','action'], hint:'Stay on the floating blocks'},
    {id:'ship', n:'Star run', tag:'Shooter', c:'#ff4f6d', s:['now','action'], hint:'Tap to fire · dodge the rocks'},
    {id:'garden', n:'Night garden', tag:'Farm', c:'#ff4fa8', s:['now','her','cozy'], hint:'Hoe, plant, water, sleep · 100 night crops'},
    {id:'cube', n:'Star roll', tag:'3D', c:'#2ee6ff', s:['now','action'], hint:'Jump · dodge · roll fast on space cubes'},
    {id:'pet', n:'Light companion', tag:'Care', c:'#cfd6ff', s:['now','her','cozy'], hint:'Feed · soothe · play'},
    {id:'bubble', n:'Aurora pop', tag:'Cozy', c:'#a45cff', s:['her','cozy'], hint:'Pop the floating lights'},
    {id:'pulse', n:'Heartbeat', tag:'Rhythm', c:'#ff6bd6', s:['her','cozy'], hint:'Tap when the ring kisses the circle'},
    {id:'stars', n:'Constellation', tag:'Creative', c:'#ffd27a', s:['her','cozy','puzzle'], hint:'Join the stars in order'},
    {id:'echo', n:'Colour echo', tag:'Memory', c:'#19f0b0', s:['her','puzzle'], hint:'Watch, then tap the same lights'},
    {id:'jewels', n:'Jewel drift', tag:'Puzzle', c:'#ff4fa8', s:['her','puzzle','cozy'], hint:'Swap neighbours to make three'},
    {id:'inv', n:'Wave guard', tag:'Shooter', c:'#4f7dff', s:['action'], hint:'Hold to move · tap to fire'},
    {id:'brk', n:'Pulse bricks', tag:'Arcade', c:'#2ee6ff', s:['action'], hint:'Bounce the light through the wall'},
    {id:'snk', n:'Coil', tag:'Arcade', c:'#3dffd0', s:['action'], hint:'Eat glow · do not bite yourself'},
    {id:'hop', n:'Sky hop', tag:'Skill', c:'#ffc44d', s:['action'], hint:'Tap to hop through the gaps'},
    {id:'png', n:'Mind pong', tag:'Sports', c:'#ffffff', s:['action'], hint:'Drag to meet the pulse'},
    {id:'rce', n:'Neon drift', tag:'Racing', c:'#ff8a3d', s:['action'], hint:'Steer between the gates'},
    {id:'merge', n:'Merge', tag:'Puzzle', c:'#ffc44d', s:['puzzle','now'], hint:'Swipe to combine the numbers'},
    {id:'mem', n:'Glow pairs', tag:'Memory', c:'#2ee6ff', s:['puzzle','her'], hint:'Find the matching lights'},
    {id:'mine', n:'Star sweep', tag:'Puzzle', c:'#a45cff', s:['puzzle'], hint:'Tap clear sky · avoid the hidden stars'}
  ];

  var RECS=[
    {n:'Night garden', play:'garden', w:'A Stardew-like night farm of our own: 100 vegetables and fruits, seasons, shop, kitchen, almanac. Hoe, water, sleep.'},
    {n:'Star roll', play:'cube', w:'A 3D ball on floating space cubes. Jump the gaps, dodge the walls, roll fast. A little Sonic, a little marble.'},
    {n:'Light companion', play:'pet', w:'A small creature that lives in this mind. Care for it the way you would a friend.'},
    {n:'Heartbeat', play:'pulse', w:'Rhythm without a leaderboard sweat. Tap when the ring meets the circle.'},
    {n:'Jewel drift', play:'jewels', w:'Match-three, pastel, the kind of puzzle people play on the sofa.'},
    {n:'Glow pairs', play:'mem', w:'Memory, but glowing. Good for two people passing the phone.'},
    {n:'Constellation', play:'stars', w:'Draw a picture out of the sky. Slow, pretty, done in a minute.'},
    {n:'Magic drawing', go:'draw', w:'Full studio in this mind — twenty tools, symmetry, stamps, paper, live AI paint and a 5-frame clip from your words.'},
    {n:'itch.io cozy (free)', href:'https://itch.io/games/free/tag-cozy', w:'Hundreds of legal free games: story, animals, tea, rain, tiny worlds.'},
    {n:'itch.io narrative (free)', href:'https://itch.io/games/free/tag-visual-novel', w:'Short stories you can finish in a lunch break. Made by independents.'},
    {n:'Sky: Children of the Light', href:'https://www.thatskygame.com/', w:'Free on phones. Social, beautiful, no combat. A good “hang out in the sky” game if you want one outside this mind.'}
  ];

  var FREEWARE=[
    {t:'DOOM (shareware)', sys:'MS-DOS', id:'doomshareware', c:'#ff4f6d'},
    {t:'Jill of the Jungle', sys:'MS-DOS', id:'msdos_Jill_of_the_Jungle_1992', c:'#ff4fa8'},
    {t:'Commander Keen', sys:'MS-DOS', id:'msdos_Commander_Keen_Goodbye_Galaxy_1991', c:'#ffc44d'},
    {t:'Crystal Caves', sys:'MS-DOS', id:'msdos_Crystal_Caves_1991', c:'#2ee6ff'},
    {t:'Wolfenstein 3D (shareware)', sys:'MS-DOS', id:'Wolfenstein3D_ShareWare', c:'#ff8a3d'}
  ];

  function get(id){ for(var i=0;i<GAMES.length;i++) if(GAMES[i].id===id) return GAMES[i]; return GAMES[0]; }

  var IMP={};

  IMP.ball={
    nu:function(){ var p=[]; for(var i=0;i<14;i++){ var ang=i*0.7, r=40+i*92; p.push({x:Math.cos(ang)*r*.35,y:i*70,w:88+((i%3)*18),h:26,goal:i===13}); }
      return {ball:{x:p[0].x+p[0].w/2,y:p[0].y+8,vx:0,vy:0},p:p,stars:stars(70),dead:0,win:0,fall:0}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g,b=st.ball;
      function onPad(p){ return b.x>p.x&&b.x<p.x+p.w&&b.y>p.y-8&&b.y<p.y+p.h+6; }
      if(!(st.dead||st.win)){
        b.vx+=C.ax()*420*C.dt; b.vy+=(C.ay()*280+92)*C.dt; b.vx*=Math.pow(.22,C.dt); b.x+=b.vx*C.dt; b.y+=b.vy*C.dt;
        var land=null; st.p.forEach(function(p){ if(onPad(p)) land=p; });
        if(land){ if(b.vy>0) b.vy*=.15; b.y=Math.min(b.y,land.y+land.h-6); st.fall=0; if(land.goal){ st.win=1; C.toast('You made it'); C.FX('warp'); } }
        else { st.fall+=C.dt; if(st.fall>.55){ st.dead=1; C.toast('Off the blocks — tap to retry'); } }
      }
      var camx=b.x, camy=b.y-H*.38;
      g.fillStyle='#03040a'; g.fillRect(0,0,W,H); drawStars(g,W,H,st.stars,-camx*.04,-camy*.03);
      st.p.forEach(function(p){ var x=W/2+(p.x-camx), y=H*.55+(p.y-camy);
        g.fillStyle=p.goal?'rgba(255,196,77,.95)':'rgba(46,230,255,.85)'; glow(g,p.goal?'#ffc44d':'#2ee6ff');
        g.fillRect(x,y,p.w,p.h); noGlow(g); g.fillStyle='rgba(8,12,28,.85)'; g.fillRect(x+3,y+p.h,p.w,10); });
      var bx=W/2+(b.x-camx), by=H*.55+(b.y-camy);
      g.beginPath(); g.arc(bx,by,11,0,Math.PI*2); g.fillStyle='#eef1ff'; glow(g,'#a45cff'); g.fill(); noGlow(g);
      C.hud('<span>'+(st.win?'Clear':st.dead?'Fallen':'Stay on the blocks')+'</span><span>'+C.tiltBtn+' · tap TV to retry</span>');
      if((st.dead||st.win)&&C.ptr.tap) return IMP.ball.nu();
      return st; }
  };

  IMP.ship={
    nu:function(C){ return {x:.5,y:.78,cool:0,score:0,best:C.best('ship'),alive:1,stars:stars(90),rocks:[],shots:[],t:0}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g;
      if(!st.alive){
        shipDraw(); C.hud('<span>Score '+Math.floor(st.score)+(st.best?' · best '+Math.floor(st.best):'')+' · tap to retry</span><span>'+C.tiltBtn+'</span>');
        if(C.ptr.tap) return IMP.ship.nu(C); return st;
      }
      st.t+=C.dt; st.x=clamp(st.x+C.ax()*C.dt*.9,.08,.92);
      st.stars.forEach(function(s){ s.y+=C.dt*(.35+s.z*1.8); if(s.y>1){ s.y=0; s.x=Math.random(); } });
      st.cool-=C.dt; if((C.keys[' ']||C.keys.z||C.ptr.fire)&&st.cool<=0){ st.shots.push({x:st.x,y:st.y-.04,v:-1.6}); st.cool=.14; C.FX('zoop',.22); }
      st.shots.forEach(function(b){ b.y+=b.v*C.dt; }); st.shots=st.shots.filter(function(b){ return b.y>-0.1; });
      if(st.rocks.length<8+Math.min(10,st.t*.4)&&Math.random()<C.dt*2.2) st.rocks.push({x:Math.random(),y:-.1,s:.03+.04*Math.random(),v:.22+.18*Math.random(),spin:Math.random()*6});
      st.rocks.forEach(function(r){ r.y+=r.v*C.dt; r.spin+=C.dt*4; });
      st.shots.forEach(function(b){ st.rocks.forEach(function(r){ if(Math.hypot(b.x-r.x,b.y-r.y)<r.s+.01){ r.hit=1; b.y=-2; st.score+=10; } }); });
      st.rocks=st.rocks.filter(function(r){ return !r.hit&&r.y<1.2; });
      st.rocks.forEach(function(r){ if(Math.hypot(r.x-st.x,r.y-st.y)<r.s+.028){ st.alive=0; st.best=C.saveBest('ship',st.score); C.toast('Ship down · '+Math.floor(st.score)); } });
      st.score+=C.dt*4; shipDraw();
      C.hud('<span>Score '+Math.floor(st.score)+(st.best?' · best '+Math.floor(st.best):'')+'</span><span>'+C.tiltBtn+' · tap to fire</span>');
      function shipDraw(){ g.fillStyle='#02030a'; g.fillRect(0,0,W,H);
        st.stars.forEach(function(s){ g.fillStyle='rgba(200,220,255,'+(.2+s.z*.5)+')'; g.fillRect(s.x*W,s.y*H,s.z*2.2,s.z*8); });
        st.rocks.forEach(function(r){ g.save(); g.translate(r.x*W,r.y*H); g.rotate(r.spin); g.fillStyle='#6b7399'; glow(g,'#ff4f6d'); g.fillRect(-r.s*W,-r.s*W,r.s*W*2,r.s*W*2); g.restore(); noGlow(g); });
        g.fillStyle='#2ee6ff'; st.shots.forEach(function(b){ g.fillRect(b.x*W-2,b.y*H-8,4,12); });
        var sx=st.x*W, sy=st.y*H; g.fillStyle='#eef1ff'; glow(g,'#2ee6ff');
        g.beginPath(); g.moveTo(sx,sy-16); g.lineTo(sx-12,sy+12); g.lineTo(sx,sy+6); g.lineTo(sx+12,sy+12); g.closePath(); g.fill(); noGlow(g); }
      return st; }
  };

  IMP.garden={
    nu:function(){ var p=[]; for(var i=0;i<12;i++) p.push({k:0,age:0,hue:['#ff4fa8','#ffc44d','#a45cff','#2ee6ff','#19f0b0'][i%5]}); return {p:p,stars:stars(50),score:0,msg:'Tap empty soil'}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g, cols=4, rows=3, pad=Math.min(W,H)*0.08, bw=(W-pad*2)/cols, bh=(H-pad*2.4)/rows;
      st.p.forEach(function(p){ if(p.k>0&&p.k<4){ p.age+=C.dt; if(p.age>2.4&&p.k<4){ p.k++; p.age=0; if(p.k===4){ st.score+=1; C.FX('zoop',.3); st.msg='A bloom'; } } } });
      if(C.ptr.tap){ var c=Math.floor((C.ptr.x-pad)/bw), r=Math.floor((C.ptr.y-pad*1.2)/bh);
        if(c>=0&&c<cols&&r>=0&&r<rows){ var p=st.p[r*cols+c]; if(p.k===0){ p.k=1; p.age=0; st.msg='Seeded'; C.FX('zoop',.2); } else if(p.k>0&&p.k<4){ p.age+=1.1; st.msg='Tended'; } else { p.k=0; p.age=0; st.msg='Gathered · +petal'; } } }
      g.fillStyle='#071018'; g.fillRect(0,0,W,H); drawStars(g,W,H,st.stars,C.now*.008,C.now*.004);
      st.p.forEach(function(p,i){ var c=i%cols, r=(i/cols)|0, x=pad+c*bw+bw*.12, y=pad*1.2+r*bh+bh*.14, w=bw*.76, h=bh*.72;
        g.fillStyle='rgba(20,36,28,.9)'; roundRect(g,x,y,w,h,12); g.fill();
        g.strokeStyle='rgba(80,140,100,.35)'; g.lineWidth=1; g.stroke();
        var cx=x+w/2, cy=y+h*.62;
        if(p.k>=1){ g.fillStyle='#6b8f4e'; g.fillRect(cx-2,cy-h*.28,4,h*.28); }
        if(p.k>=2){ g.fillStyle='#8fbf5a'; g.beginPath(); g.ellipse(cx-8,cy-h*.22,8,4, -.4,0,Math.PI*2); g.ellipse(cx+8,cy-h*.22,8,4,.4,0,Math.PI*2); g.fill(); }
        if(p.k>=3){ glow(g,p.hue); g.fillStyle=p.hue; for(var k=0;k<6;k++){ var a=k/6*Math.PI*2+C.now; g.beginPath(); g.ellipse(cx+Math.cos(a)*10, cy-h*.38+Math.sin(a)*8, 7, 4, a, 0, Math.PI*2); g.fill(); } noGlow(g); }
        if(p.k>=4){ g.fillStyle='#fff6c8'; g.beginPath(); g.arc(cx,cy-h*.38,4,0,Math.PI*2); g.fill(); }
      });
      C.hud('<span>Night garden · '+st.score+' blooms</span><span>'+st.msg+'</span>');
      return st; }
  };

  IMP.pet={
    nu:function(){ return {h: .7, j:.7, r:.7, t:0, mood:'hello', stars:stars(40), last:0}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g;
      st.t+=C.dt; st.h=clamp(st.h-C.dt*.012,0,1); st.j=clamp(st.j-C.dt*.01,0,1); st.r=clamp(st.r-C.dt*.008,0,1);
      var zones=[{n:'Feed',k:'h'},{n:'Soothe',k:'j'},{n:'Play',k:'r'}];
      if(C.ptr.tap){ var z=((C.ptr.x/W)*3)|0; z=clamp(z,0,2); st[zones[z].k]=clamp(st[zones[z].k]+.34,0,1); st.last=z; st.mood=zones[z].n; C.FX('zoop',.25); }
      var ok=(st.h+st.j+st.r)/3;
      g.fillStyle='#08061a'; g.fillRect(0,0,W,H); drawStars(g,W,H,st.stars,0,C.now*.01);
      var cx=W/2, cy=H*.42, rad=Math.min(W,H)*.16*(.92+ok*.1+Math.sin(st.t*3)*.03);
      var col=ok>.55?'#e8d6ff':ok>.3?'#ffb4d4':'#8a7aa8';
      glow(g,col); g.fillStyle=col; g.beginPath(); g.ellipse(cx,cy,rad*1.05,rad,0,0,Math.PI*2); g.fill(); noGlow(g);
      g.fillStyle='#1a1228'; g.beginPath(); g.arc(cx-rad*.32,cy-rad*.1, rad*.13,0,Math.PI*2); g.arc(cx+rad*.32,cy-rad*.1, rad*.13,0,Math.PI*2); g.fill();
      g.fillStyle='#fff'; g.beginPath(); g.arc(cx-rad*.32,cy-rad*.12, rad*.05,0,Math.PI*2); g.arc(cx+rad*.32,cy-rad*.12, rad*.05,0,Math.PI*2); g.fill();
      g.strokeStyle='#1a1228'; g.lineWidth=2; g.beginPath();
      if(ok>.5){ g.arc(cx,cy+rad*.22, rad*.22, .15, Math.PI-.15); } else { g.moveTo(cx-rad*.2,cy+rad*.28); g.quadraticCurveTo(cx,cy+rad*.12,cx+rad*.2,cy+rad*.28); }
      g.stroke();
      zones.forEach(function(z,i){ var x=(i+.5)/3*W, y=H*.82; g.fillStyle=hexRgba(['#ffc44d','#ff4fa8','#2ee6ff'][i],.18); roundRect(g,x-W*.13,y-28,W*.26,56,16); g.fill();
        g.fillStyle='#eef1ff'; g.font='700 12px Inter,sans-serif'; g.textAlign='center'; g.fillText(z.n,x,y+4);
        g.fillStyle=hexRgba(['#ffc44d','#ff4fa8','#2ee6ff'][i],.9); g.fillRect(x-W*.1,y+16,W*.2*st[z.k],4); });
      C.hud('<span>Light companion · '+(ok>.7?'glowing':ok>.4?'okay':'needs you')+'</span><span>Tap a care below</span>');
      return st; }
  };

  IMP.bubble={
    nu:function(){ return {bs:[],score:0,best:0,t:0,stars:stars(40),combo:0}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g, cols=['#ff4fa8','#a45cff','#2ee6ff','#ffd27a','#19f0b0'];
      st.t+=C.dt; st.best=C.best('bubble');
      if(st.bs.length<12 && Math.random()<C.dt*2.4) st.bs.push({x:rr(.1,.9),y:1.08,r:rr(.04,.08),v:rr(.08,.2),c:cols[(Math.random()*cols.length)|0],ph:Math.random()*6});
      st.bs.forEach(function(b){ b.y-=b.v*C.dt; b.x+=Math.sin(st.t*2+b.ph)*C.dt*.06; });
      if(C.ptr.tap){ var hit=null; st.bs.forEach(function(b){ if(Math.hypot(C.ptr.nx-b.x,C.ptr.ny-b.y)<b.r+.02) hit=b; });
        if(hit){ hit.pop=1; st.combo+=1; st.score+=10*st.combo; C.FX('zoop',.2); } else st.combo=0; }
      st.bs=st.bs.filter(function(b){ return !b.pop && b.y>-0.12; });
      g.fillStyle='#07041a'; g.fillRect(0,0,W,H); drawStars(g,W,H,st.stars,C.now*.02,0);
      st.bs.forEach(function(b){ g.beginPath(); g.arc(b.x*W,b.y*H,b.r*W,0,Math.PI*2); g.fillStyle=hexRgba(b.c,.45); glow(g,b.c); g.fill(); noGlow(g); g.strokeStyle='rgba(255,255,255,.35)'; g.stroke(); });
      C.saveBest('bubble',st.score);
      C.hud('<span>Aurora pop · '+st.score+(st.combo>1?' · x'+st.combo:'')+'</span><span>Best '+Math.floor(C.best('bubble'))+'</span>');
      return st; }
  };

  IMP.pulse={
    nu:function(){ return {t:0,wait:.9,r:0,score:0,ok:0,flash:0,stars:stars(30)}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g, cx=W/2, cy=H*.52, max=Math.min(W,H)*.38;
      st.t+=C.dt; st.r+=C.dt/st.wait; st.flash*=Math.pow(.02,C.dt);
      if(C.ptr.tap){ var err=Math.abs(st.r-1); var pts=err<.08?100:err<.16?50:err<.28?20:0;
        if(pts){ st.score+=pts; st.ok++; st.flash=1; C.FX(pts>=50?'warp':'zoop',.3); } else C.FX('zoop',.1);
        st.r=0; st.wait=clamp(st.wait-0.02,.52,.9); }
      if(st.r>1.35){ st.r=0; }
      g.fillStyle='#0a0614'; g.fillRect(0,0,W,H); drawStars(g,W,H,st.stars,0,0);
      g.strokeStyle='rgba(255,107,214,.85)'; g.lineWidth=3; glow(g,'#ff6bd6'); g.beginPath(); g.arc(cx,cy,max,0,Math.PI*2); g.stroke(); noGlow(g);
      g.strokeStyle='rgba(255,210,230,'+(0.35+st.flash*.6)+')'; g.lineWidth=2; g.beginPath(); g.arc(cx,cy,max*Math.min(1.2,st.r),0,Math.PI*2); g.stroke();
      g.fillStyle='#fff'; g.font='800 28px Inter,sans-serif'; g.textAlign='center'; g.fillText(st.score,cx,cy+8);
      C.hud('<span>Heartbeat · '+st.ok+' hits</span><span>Tap as the ring meets the circle</span>');
      C.saveBest('pulse',st.score); return st; }
  };

  IMP.stars={
    nu:function(){ var n=8, p=[]; for(var i=0;i<n;i++){ var a=-Math.PI/2+i/n*Math.PI*2, r=.28+((i%3)*.06); p.push({x:.5+Math.cos(a)*r, y:.52+Math.sin(a)*r*.9}); }
      return {p:p, i:0, done:0, stars:stars(60)}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g;
      if(C.ptr.tap&&!st.done){ var n=st.p[st.i]; if(Math.hypot(C.ptr.nx-n.x,C.ptr.ny-n.y)<.08){ st.i++; C.FX('zoop',.3); if(st.i>=st.p.length){ st.done=1; C.toast('Constellation complete'); C.FX('warp'); C.saveBest('stars',1); } } }
      if(st.done&&C.ptr.tap) return IMP.stars.nu();
      g.fillStyle='#05071a'; g.fillRect(0,0,W,H); drawStars(g,W,H,st.stars,C.now*.005,0);
      g.strokeStyle='rgba(255,210,122,.85)'; g.lineWidth=2; glow(g,'#ffd27a'); g.beginPath();
      st.p.forEach(function(p,i){ if(i>st.i) return; if(i===0) g.moveTo(p.x*W,p.y*H); else g.lineTo(p.x*W,p.y*H); }); g.stroke(); noGlow(g);
      st.p.forEach(function(p,i){ g.beginPath(); g.arc(p.x*W,p.y*H, i===st.i?8:5,0,Math.PI*2); g.fillStyle=i<st.i?'#ffd27a':i===st.i?'#fff':'rgba(255,255,255,.25)'; glow(g,'#ffd27a'); g.fill(); noGlow(g);
        g.fillStyle='#9aa3c7'; g.font='700 11px JetBrains Mono,monospace'; g.textAlign='center'; g.fillText(String(i+1),p.x*W,p.y*H-14); });
      C.hud('<span>'+(st.done?'Complete · tap to draw another':'Constellation · star '+(st.i+1)+' of '+st.p.length)+'</span><span></span>');
      return st; }
  };

  IMP.echo={
    nu:function(){ return {seq:[], wait:1, play:-1, playT:0, input:0, lose:0, round:0, flash:-1, flashT:0}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g, cols=['#2ee6ff','#ff4fa8','#ffc44d','#19f0b0'], names=['N','E','S','W'];
      var cx=W/2, cy=H*.5, R=Math.min(W,H)*.28;
      function cell(i){ var a=i*Math.PI/2-Math.PI/4; return {x:cx+Math.cos(a)*R*.7, y:cy+Math.sin(a)*R*.7}; }
      if(st.lose){ C.hud('<span>Colour echo · round '+st.round+' · tap to retry</span><span></span>'); if(C.ptr.tap) return IMP.echo.nu(); }
      else if(st.wait){ st.wait-=C.dt; if(st.wait<=0){ st.seq.push((Math.random()*4)|0); st.play=0; st.playT=0; st.input=0; st.round=st.seq.length; } }
      else if(st.play>=0){ st.playT+=C.dt; st.flash=st.seq[st.play]; st.flashT=1; if(st.playT>.46){ st.play++; st.playT=0; if(st.play>=st.seq.length){ st.play=-1; st.flash=-1; } } }
      else if(C.ptr.tap){ var hit=-1; for(var i=0;i<4;i++){ var p=cell(i); if(Math.hypot(C.ptr.x-p.x,C.ptr.y-p.y)<R*.38) hit=i; }
        if(hit>=0){ st.flash=hit; st.flashT=1; if(hit===st.seq[st.input]){ st.input++; C.FX('zoop',.2); if(st.input>=st.seq.length){ C.saveBest('echo',st.round); st.wait=.55; } } else { st.lose=1; C.toast('Echo broke · round '+st.round); } } }
      st.flashT*=Math.pow(.04,C.dt);
      g.fillStyle='#060814'; g.fillRect(0,0,W,H);
      for(var i=0;i<4;i++){ var p=cell(i), on=st.flash===i&&st.flashT>.15; g.beginPath(); g.arc(p.x,p.y,R*.36,0,Math.PI*2); g.fillStyle=hexRgba(cols[i], on?.95:.28); glow(g,cols[i]); g.fill(); noGlow(g); }
      C.hud('<span>Colour echo · round '+st.round+'</span><span>Watch, then repeat</span>');
      return st; }
  };

  IMP.jewels={
    nu:function(){ var n=6, col=['#ff4fa8','#2ee6ff','#ffc44d','#a45cff','#19f0b0'], g=[];
      for(var i=0;i<n*n;i++) g.push((Math.random()*col.length)|0); return {n:n,col:col,g:g,sel:-1,score:0,lock:0}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g, n=st.n, pad=Math.min(W,H)*0.08, size=Math.min((W-pad*2)/n,(H-pad*2.2)/n), ox=(W-size*n)/2, oy=(H-size*n)/2+10;
      function at(c,r){ return st.g[r*n+c]; }
      function set(c,r,v){ st.g[r*n+c]=v; }
      function matches(){ var m=new Array(n*n); for(var r=0;r<n;r++){ for(var c=0;c<n;c++){ var v=at(c,r), run=1; while(c+run<n&&at(c+run,r)===v) run++; if(v>=0&&run>=3) for(var k=0;k<run;k++) m[r*n+c+k]=1; } }
        for(var c2=0;c2<n;c2++){ for(var r2=0;r2<n;r2++){ var v2=at(c2,r2), run2=1; while(r2+run2<n&&at(c2,r2+run2)===v2) run2++; if(v2>=0&&run2>=3) for(var k2=0;k2<run2;k2++) m[(r2+k2)*n+c2]=1; } } return m; }
      function gravity(){ for(var c=0;c<n;c++){ var w=[]; for(var r=n-1;r>=0;r--) if(at(c,r)>=0) w.push(at(c,r)); for(var r=n-1;r>=0;r--) set(c,r, w[n-1-r]===undefined?((Math.random()*st.col.length)|0):w[n-1-r]); } }
      function clear(){ var m=matches(), nHit=0; for(var i=0;i<m.length;i++) if(m[i]){ st.g[i]=-1; nHit++; } if(nHit){ st.score+=nHit*12; C.FX('zoop',.2); gravity(); } return nHit; }
      if(C.ptr.tap){ var c=Math.floor((C.ptr.x-ox)/size), r=Math.floor((C.ptr.y-oy)/size);
        if(c>=0&&c<n&&r>=0&&r<n){ var i=r*n+c; if(st.sel<0) st.sel=i; else { var sc=st.sel%n, sr=(st.sel/n)|0; if(Math.abs(sc-c)+Math.abs(sr-r)===1){ var tmp=at(c,r); set(c,r,at(sc,sr)); set(sc,sr,tmp); if(!clear()){ set(sc,sr,at(c,r)); set(c,r,tmp); } else { var n2=0; while(clear()&&n2++<8){} } } st.sel=-1; } } }
      g.fillStyle='#100818'; g.fillRect(0,0,W,H);
      for(var r=0;r<n;r++) for(var c=0;c<n;c++){ var i=r*n+c, x=ox+c*size, y=oy+r*size, col=st.col[st.g[i]]||'#333';
        g.fillStyle=hexRgba(col, st.sel===i?.95:.8); glow(g,col); roundRect(g,x+4,y+4,size-8,size-8,10); g.fill(); noGlow(g); }
      C.saveBest('jewels',st.score);
      C.hud('<span>Jewel drift · '+st.score+'</span><span>Swap neighbours to make three</span>');
      return st; }
  };

  IMP.inv={
    nu:function(){ var e=[]; for(var r=0;r<4;r++) for(var c=0;c<8;c++) e.push({x:.15+c*.1,y:.12+r*.08,alive:1}); return {x:.5,e:e,shots:[],cool:0,dir:1,score:0,dead:0,stars:stars(50)}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g;
      if(st.dead){ C.hud('<span>Wave guard · '+st.score+' · tap retry</span><span></span>'); if(C.ptr.tap) return IMP.inv.nu(); draw(); return st; }
      st.x=clamp(st.x+C.ax()*C.dt*.9,.06,.94); st.cool-=C.dt;
      if((C.ptr.fire||C.keys[' ']||C.keys.z)&&st.cool<=0){ st.shots.push({x:st.x,y:.86,v:-1.2}); st.cool=.18; C.FX('zoop',.15); }
      st.shots.forEach(function(s){ s.y+=s.v*C.dt; });
      var edge=0; st.e.forEach(function(e){ if(!e.alive) return; e.x+=st.dir*C.dt*.12; if(e.x<.06||e.x>.94) edge=1; });
      if(edge){ st.dir*=-1; st.e.forEach(function(e){ e.y+=.03; }); }
      st.shots.forEach(function(s){ st.e.forEach(function(e){ if(e.alive&&Math.hypot(s.x-e.x,s.y-e.y)<.04){ e.alive=0; s.y=-2; st.score+=20; } }); });
      st.shots=st.shots.filter(function(s){ return s.y>-0.05; });
      if(!st.e.some(function(e){ return e.alive; })){ st.e.forEach(function(e,i){ e.alive=1; e.y=.12+((i/8)|0)*.08; }); }
      st.e.forEach(function(e){ if(e.alive&&e.y>.82) st.dead=1; });
      C.saveBest('inv',st.score); draw();
      C.hud('<span>Wave guard · '+st.score+'</span><span>'+C.tiltBtn+' · tap fire</span>');
      function draw(){ g.fillStyle='#03040c'; g.fillRect(0,0,W,H); drawStars(g,W,H,st.stars,0,C.now*.04);
        st.e.forEach(function(e){ if(!e.alive) return; g.fillStyle='#ff4fa8'; glow(g,'#ff4fa8'); g.fillRect(e.x*W-10,e.y*H-8,20,16); noGlow(g); });
        g.fillStyle='#2ee6ff'; st.shots.forEach(function(s){ g.fillRect(s.x*W-2,s.y*H-8,4,12); });
        g.fillStyle='#eef1ff'; glow(g,'#2ee6ff'); g.beginPath(); g.moveTo(st.x*W, H*.9-14); g.lineTo(st.x*W-12,H*.9+8); g.lineTo(st.x*W+12,H*.9+8); g.fill(); noGlow(g); }
      return st; }
  };

  IMP.brk={
    nu:function(){ var b=[]; for(var r=0;r<5;r++) for(var c=0;c<8;c++) b.push({x:c,y:r,on:1,c:['#2ee6ff','#a45cff','#ff4fa8','#ffc44d','#19f0b0'][r]});
      return {px:.5,bx:.5,by:.7,vx:.35,vy:-.42,b:b,lives:3,score:0,dead:0}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g;
      if(st.dead||st.b.every(function(b){ return !b.on; })){ C.hud('<span>'+(st.dead?'Missed':'Clear')+' · '+st.score+' · tap retry</span><span></span>'); if(C.ptr.tap) return IMP.brk.nu(); draw(); return st; }
      st.px=clamp(st.px+C.ax()*C.dt*1.1,.1,.9); if(C.ptr.on) st.px=clamp(C.ptr.nx,.1,.9);
      st.bx+=st.vx*C.dt; st.by+=st.vy*C.dt;
      if(st.bx<.03||st.bx>.97) st.vx*=-1; if(st.by<.04) st.vy*=-1;
      if(st.by>.86&&st.by<.92&&Math.abs(st.bx-st.px)<.1){ st.vy=-Math.abs(st.vy); st.vx=(st.bx-st.px)*3; }
      if(st.by>1.02){ st.lives--; st.bx=.5; st.by=.7; st.vy=-.42; if(st.lives<=0) st.dead=1; }
      var bw=.1, bh=.05, ox=.1, oy=.12;
      st.b.forEach(function(b){ if(!b.on) return; var x=ox+b.x*bw, y=oy+b.y*bh;
        if(st.bx>x&&st.bx<x+bw&&st.by>y&&st.by<y+bh){ b.on=0; st.vy*=-1; st.score+=10; C.FX('zoop',.15); } });
      C.saveBest('brk',st.score); draw();
      C.hud('<span>Pulse bricks · '+st.score+' · lives '+st.lives+'</span><span>Drag to move</span>');
      function draw(){ g.fillStyle='#04060f'; g.fillRect(0,0,W,H);
        st.b.forEach(function(b){ if(!b.on) return; g.fillStyle=b.c; roundRect(g,(0.1+b.x*.1)*W+2, (.12+b.y*.05)*H+2, W*.1-4, H*.05-4, 4); g.fill(); });
        g.fillStyle='#eef1ff'; g.fillRect((st.px-.1)*W, H*.88, W*.2, 10);
        g.beginPath(); g.arc(st.bx*W, st.by*H, 7,0,Math.PI*2); glow(g,'#2ee6ff'); g.fill(); noGlow(g); }
      return st; }
  };

  IMP.snk={
    nu:function(){ return {body:[[8,12],[8,13]], dir:[0,-1], next:[0,-1], food:[8,6], acc:0, score:0, dead:0, n:18}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g, n=st.n, size=Math.min(W,H)*.82, ox=(W-size)/2, oy=(H-size)/2+8, cell=size/n;
      if(C.press.left) st.next=[-1,0]; if(C.press.right) st.next=[1,0]; if(C.press.up) st.next=[0,-1]; if(C.press.down) st.next=[0,1];
      if(C.ptr.swipe){ var s=C.ptr.swipe; st.next=s==='left'?[-1,0]:s==='right'?[1,0]:s==='up'?[0,-1]:[0,1]; }
      if(st.dead){ C.hud('<span>Coil · '+st.score+' · tap retry</span><span>Swipe or arrows</span>'); if(C.ptr.tap) return IMP.snk.nu(); draw(); return st; }
      if(st.next[0]!==-st.dir[0]||st.next[1]!==-st.dir[1]) st.dir=st.next;
      st.acc+=C.dt; if(st.acc>.13){ st.acc=0; var h=[st.body[0][0]+st.dir[0], st.body[0][1]+st.dir[1]];
        if(h[0]<0||h[1]<0||h[0]>=n||h[1]>=n||st.body.some(function(p){ return p[0]===h[0]&&p[1]===h[1]; })) st.dead=1;
        else { st.body.unshift(h); if(h[0]===st.food[0]&&h[1]===st.food[1]){ st.score+=1; C.FX('zoop',.2); st.food=[(Math.random()*n)|0,(Math.random()*n)|0]; } else st.body.pop(); } }
      C.saveBest('snk',st.score); draw();
      C.hud('<span>Coil · '+st.score+'</span><span>Swipe or arrows</span>');
      function draw(){ g.fillStyle='#05080f'; g.fillRect(0,0,W,H);
        g.fillStyle='#19f0b0'; glow(g,'#19f0b0'); g.fillRect(ox+st.food[0]*cell+2, oy+st.food[1]*cell+2, cell-4, cell-4); noGlow(g);
        st.body.forEach(function(p,i){ g.fillStyle=i?hexRgba('#2ee6ff',.7):'#eef1ff'; g.fillRect(ox+p[0]*cell+2, oy+p[1]*cell+2, cell-4, cell-4); }); }
      return st; }
  };

  IMP.hop={
    nu:function(){ return {y:.5,vy:0,gap:.5,gx:1.1,score:0,dead:0,stars:stars(40)}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g;
      if(st.dead){ C.hud('<span>Sky hop · '+st.score+' · tap retry</span><span></span>'); if(C.ptr.tap) return IMP.hop.nu(); draw(); return st; }
      if(C.ptr.fire||C.keys[' ']) st.vy=-.72;
      st.vy+=1.6*C.dt; st.y+=st.vy*C.dt; st.gx-=C.dt*.35;
      if(st.gx<-0.1){ st.gx=1.15; st.gap=rr(.28,.72); st.score++; C.FX('zoop',.15); }
      if(st.y<.02||st.y>.98) st.dead=1;
      var hole=.28; if(st.gx<.18&&st.gx>-.02&&(st.y<st.gap-hole/2||st.y>st.gap+hole/2)) st.dead=1;
      C.saveBest('hop',st.score); draw();
      C.hud('<span>Sky hop · '+st.score+'</span><span>Tap to hop</span>');
      function draw(){ g.fillStyle='#070b1c'; g.fillRect(0,0,W,H); drawStars(g,W,H,st.stars,-C.now*.03,0);
        g.fillStyle='#a45cff'; g.fillRect(st.gx*W,0,W*.12,(st.gap-hole/2)*H); g.fillRect(st.gx*W,(st.gap+hole/2)*H,W*.12,H);
        g.fillStyle='#ffc44d'; glow(g,'#ffc44d'); g.beginPath(); g.arc(.28*W, st.y*H, 12,0,Math.PI*2); g.fill(); noGlow(g); }
      return st; }
  };

  IMP.png={
    nu:function(){ return {py:.5, ay:.5, bx:.5, by:.5, vx:.38, vy:.2, score:0, them:0}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g;
      st.py=clamp(st.py+C.ay()*C.dt*1.2,.12,.88); if(C.ptr.on) st.py=clamp(C.ptr.ny,.12,.88);
      st.ay+=(st.by-st.ay)*Math.min(1,C.dt*3.2);
      st.bx+=st.vx*C.dt; st.by+=st.vy*C.dt;
      if(st.by<.04||st.by>.96) st.vy*=-1;
      if(st.bx>.9&&Math.abs(st.by-st.py)<.12){ st.vx=-Math.abs(st.vx)*1.03; st.vy+=(st.by-st.py)*1.4; }
      if(st.bx<.1&&Math.abs(st.by-st.ay)<.12){ st.vx=Math.abs(st.vx)*1.03; }
      if(st.bx>1.05){ st.them++; st.bx=.5; st.by=.5; st.vx=.38; }
      if(st.bx<-.05){ st.score++; st.bx=.5; st.by=.5; st.vx=-.38; C.FX('zoop',.2); }
      C.saveBest('png',st.score); g.fillStyle='#05060c'; g.fillRect(0,0,W,H);
      g.fillStyle='rgba(255,255,255,.12)'; for(var y=0;y<H;y+=18) g.fillRect(W/2-1,y,2,10);
      g.fillStyle='#ff4fa8'; g.fillRect(W*.06, (st.ay-.12)*H, 10, H*.24);
      g.fillStyle='#2ee6ff'; g.fillRect(W*.92, (st.py-.12)*H, 10, H*.24);
      g.fillStyle='#fff'; glow(g,'#fff'); g.beginPath(); g.arc(st.bx*W,st.by*H,8,0,Math.PI*2); g.fill(); noGlow(g);
      C.hud('<span>Mind pong · you '+st.score+' · mind '+st.them+'</span><span>Drag vertically</span>');
      return st; }
  };

  IMP.rce={
    nu:function(){ return {x:.5, t:0, gates:[], score:0, dead:0, stars:stars(50)}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g;
      if(st.dead){ C.hud('<span>Neon drift · '+Math.floor(st.score)+' · tap retry</span><span></span>'); if(C.ptr.tap) return IMP.rce.nu(); draw(); return st; }
      st.t+=C.dt; st.x=clamp(st.x+C.ax()*C.dt*.85,.18,.82); if(C.ptr.on) st.x+=(C.ptr.nx-st.x)*Math.min(1,C.dt*6);
      if(Math.random()<C.dt*1.4) st.gates.push({y:-.1, x:rr(.25,.75), w:.22});
      st.gates.forEach(function(gt){ gt.y+=C.dt*(.38+st.t*.01); });
      st.gates.forEach(function(gt){ if(gt.y>.72&&gt.y<.88&&Math.abs(st.x-gt.x)>gt.w*.5) st.dead=1; if(gt.y>.88&&!gt.ok){ gt.ok=1; st.score+=1; } });
      st.gates=st.gates.filter(function(gt){ return gt.y<1.1; });
      if(st.dead) C.saveBest('rce',st.score);
      draw(); C.hud('<span>Neon drift · '+Math.floor(st.score)+'</span><span>'+C.tiltBtn+'</span>');
      function draw(){ g.fillStyle='#05040e'; g.fillRect(0,0,W,H); drawStars(g,W,H,st.stars,0,C.now*.08);
        g.fillStyle='rgba(255,138,61,.2)'; g.fillRect(W*.16,0,W*.04,H); g.fillRect(W*.8,0,W*.04,H);
        st.gates.forEach(function(gt){ g.strokeStyle='#ff8a3d'; g.lineWidth=3; g.beginPath(); g.moveTo((gt.x-gt.w/2)*W, gt.y*H); g.lineTo((gt.x+gt.w/2)*W, gt.y*H); g.stroke(); });
        g.fillStyle='#eef1ff'; glow(g,'#ff8a3d'); g.beginPath(); g.moveTo(st.x*W, H*.82-16); g.lineTo(st.x*W-11,H*.82+10); g.lineTo(st.x*W+11,H*.82+10); g.fill(); noGlow(g); }
      return st; }
  };

  IMP.merge={
    nu:function(){ var g=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; spawn(g); spawn(g); return {g:g, score:0, dead:0}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g, pad=Math.min(W,H)*0.1, size=Math.min(W,H)-pad*2, cell=size/4, ox=(W-size)/2, oy=(H-size)/2;
      var dir=C.ptr.swipe||(C.press.left?'left':C.press.right?'right':C.press.up?'up':C.press.down?'down':null);
      if(dir&&!st.dead){ var moved=slide(st.g,dir); if(moved){ spawn(st.g); } if(!canMove(st.g)) st.dead=1; }
      if(st.dead&&C.ptr.tap) return IMP.merge.nu();
      g.fillStyle='#101018'; g.fillRect(0,0,W,H);
      var cols={0:'#1a1c28',2:'#2a3348',4:'#31405c',8:'#a45cff',16:'#ff4fa8',32:'#ff8a3d',64:'#ffc44d',128:'#2ee6ff',256:'#19f0b0',512:'#4f7dff',1024:'#fff',2048:'#ffe9a8'};
      for(var i=0;i<16;i++){ var c=i%4, r=(i/4)|0, v=st.g[i], x=ox+c*cell, y=oy+r*cell;
        g.fillStyle=cols[v]||'#ffe9a8'; roundRect(g,x+5,y+5,cell-10,cell-10,10); g.fill();
        if(v){ g.fillStyle=v>=8?'#fff':'#eef1ff'; g.font='800 '+(v>512?18:22)+'px Inter,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(String(v),x+cell/2,y+cell/2+1); } }
      C.saveBest('merge',st.score=st.g.reduce(function(a,b){ return a+b; },0));
      C.hud('<span>Merge · '+st.score+(st.dead?' · tap retry':'')+'</span><span>Swipe or arrows</span>');
      function spawn(gr){ var emp=[]; for(var i=0;i<16;i++) if(!gr[i]) emp.push(i); if(!emp.length) return; gr[emp[(Math.random()*emp.length)|0]]=Math.random()<.9?2:4; }
      function lineGet(gr,dir,i){ var a=[]; for(var k=0;k<4;k++) a.push(dir==='left'?gr[i*4+k]:dir==='right'?gr[i*4+3-k]:dir==='up'?gr[k*4+i]:gr[(3-k)*4+i]); return a; }
      function lineSet(gr,dir,i,a){ for(var k=0;k<4;k++){ var v=a[k]; if(dir==='left') gr[i*4+k]=v; else if(dir==='right') gr[i*4+3-k]=v; else if(dir==='up') gr[k*4+i]=v; else gr[(3-k)*4+i]=v; } }
      function slide(gr,dir){ var ch=0; for(var i=0;i<4;i++){ var a=lineGet(gr,dir,i).filter(function(x){ return x; }), b=[];
        for(var k=0;k<a.length;k++){ if(a[k]&&a[k]===a[k+1]){ b.push(a[k]*2); k++; } else b.push(a[k]); } while(b.length<4) b.push(0);
        var old=lineGet(gr,dir,i); lineSet(gr,dir,i,b); if(old.join()!==b.join()) ch=1; } return ch; }
      function canMove(gr){ for(var i=0;i<16;i++) if(!gr[i]) return 1; for(var r=0;r<4;r++) for(var c=0;c<4;c++){ var v=gr[r*4+c]; if(c<3&&gr[r*4+c+1]===v) return 1; if(r<3&&gr[(r+1)*4+c]===v) return 1; } return 0; }
      return st; }
  };

  IMP.mem={
    nu:function(){ var v=[], cols=['#2ee6ff','#ff4fa8','#ffc44d','#19f0b0','#a45cff','#ff8a3d','#4f7dff','#cfd6ff'];
      cols.forEach(function(c){ v.push(c,c); }); for(var i=v.length-1;i>0;i--){ var j=(Math.random()*(i+1))|0, t=v[i]; v[i]=v[j]; v[j]=t; }
      return {v:v, on:new Array(16), lock:new Array(16), a:-1, wait:0, pairs:0}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g, pad=Math.min(W,H)*0.1, size=Math.min(W,H)-pad*1.6, cell=size/4, ox=(W-size)/2, oy=(H-size)/2;
      if(st.wait>0){ st.wait-=C.dt; if(st.wait<=0&&st.a>=0){ var b=st.hold; if(st.v[st.a]!==st.v[b]){ st.on[st.a]=st.on[b]=0; } else { st.lock[st.a]=st.lock[b]=1; st.pairs++; C.FX('zoop',.3); } st.a=-1; } }
      if(C.ptr.tap&&st.wait<=0){ var c=Math.floor((C.ptr.x-ox)/cell), r=Math.floor((C.ptr.y-oy)/cell);
        if(c>=0&&c<4&&r>=0&&r<4){ var i=r*4+c; if(!st.lock[i]&&!st.on[i]){ st.on[i]=1; if(st.a<0) st.a=i; else { st.hold=i; st.wait=.55; } } } }
      if(st.pairs>=8){ C.hud('<span>Glow pairs · clear · tap retry</span><span></span>'); if(C.ptr.tap) return IMP.mem.nu(); }
      else C.hud('<span>Glow pairs · '+st.pairs+'/8</span><span>Find the matching lights</span>');
      g.fillStyle='#080a16'; g.fillRect(0,0,W,H);
      for(var i=0;i<16;i++){ var x=ox+(i%4)*cell, y=oy+((i/4)|0)*cell, open=st.on[i]||st.lock[i];
        g.fillStyle=open?st.v[i]:'#161a2c'; glow(g, open?st.v[i]:'#2ee6ff'); roundRect(g,x+6,y+6,cell-12,cell-12,12); g.fill(); noGlow(g); }
      return st; }
  };

  IMP.mine={
    nu:function(){ var w=8,h=10,n=10, m=new Array(w*h), v=new Array(w*h); for(var i=0;i<n;i++){ var p; do{ p=(Math.random()*w*h)|0; } while(m[p]); m[p]=1; }
      return {w:w,h:h,m:m,v:v,dead:0,win:0,first:1}; },
    step:function(C,st){ var W=C.W,H=C.H,g=C.g, w=st.w,h=st.h, pad=12, size=Math.min((W-pad*2)/w,(H-pad*40)/h), ox=(W-size*w)/2, oy=40;
      function idx(c,r){ return r*w+c; } function neigh(c,r){ var n=0; for(var y=-1;y<=1;y++) for(var x=-1;x<=1;x++){ var cc=c+x,rr=r+y; if(cc>=0&&rr>=0&&cc<w&&rr<h&&st.m[idx(cc,rr)]) n++; } return n; }
      function flood(c,r){ if(c<0||r<0||c>=w||r>=h) return; var i=idx(c,r); if(st.v[i]||st.m[i]) return; st.v[i]=1; if(neigh(c,r)===0) for(var y=-1;y<=1;y++) for(var x=-1;x<=1;x++) flood(c+x,r+y); }
      if((st.dead||st.win)&&C.ptr.tap) return IMP.mine.nu();
      if(C.ptr.tap&&!st.dead&&!st.win){ var c=Math.floor((C.ptr.x-ox)/size), r=Math.floor((C.ptr.y-oy)/size);
        if(c>=0&&c<w&&r>=0&&r<h){ var i=idx(c,r); if(st.first){ st.m[i]=0; st.first=0; } if(st.m[i]){ st.dead=1; C.toast('A hidden star'); } else flood(c,r);
          var left=0; for(var k=0;k<w*h;k++) if(!st.m[k]&&!st.v[k]) left++; if(!left){ st.win=1; C.toast('Sky clear'); C.FX('warp'); } } }
      g.fillStyle='#070914'; g.fillRect(0,0,W,H);
      for(var r=0;r<h;r++) for(var c=0;c<w;c++){ var i=idx(c,r), x=ox+c*size, y=oy+r*size;
        g.fillStyle=st.v[i]?'#12162a':'#1c2240'; roundRect(g,x+2,y+2,size-4,size-4,6); g.fill();
        if(st.dead&&st.m[i]){ g.fillStyle='#ffc44d'; g.beginPath(); g.arc(x+size/2,y+size/2,4,0,Math.PI*2); g.fill(); }
        else if(st.v[i]){ var n=neigh(c,r); if(n){ g.fillStyle='#2ee6ff'; g.font='700 13px JetBrains Mono,monospace'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(String(n),x+size/2,y+size/2+1); } } }
      C.hud('<span>Star sweep · '+(st.win?'clear':st.dead?'tap retry':'tap empty sky')+'</span><span></span>');
      return st; }
  };

  window.MUArcade={ games:GAMES, shelves:SHELVES, recs:RECS, freeware:FREEWARE, impl:IMP, get:get };
})();
