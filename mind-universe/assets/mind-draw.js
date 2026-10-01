/* Magic drawing — full studio + live AI (public image URL, no API keys). */
(function(){
  var TOOLS=[
    {id:'pencil', n:'Pencil'},
    {id:'ink', n:'Ink'},
    {id:'marker', n:'Marker'},
    {id:'glow', n:'Glow'},
    {id:'air', n:'Airbrush'},
    {id:'wash', n:'Wash'},
    {id:'neon', n:'Neon'},
    {id:'spray', n:'Spray'},
    {id:'calligraphy', n:'Nib'},
    {id:'eraser', n:'Eraser'},
    {id:'smudge', n:'Smudge'},
    {id:'fill', n:'Fill'},
    {id:'line', n:'Line'},
    {id:'rect', n:'Rect'},
    {id:'oval', n:'Oval'},
    {id:'poly', n:'Star'},
    {id:'drop', n:'Dropper'},
    {id:'stamp', n:'Stamp'},
    {id:'text', n:'Text'},
    {id:'select', n:'Lasso'}
  ];
  var PAL={
    neon:['#2ee6ff','#a45cff','#ff4fa8','#ffc44d','#19f0b0','#ffffff','#ff4f6d','#4f7dff'],
    pastel:['#ffd6e8','#d6e8ff','#e8d6ff','#ffe8c8','#d6ffe8','#fff5f0','#c8f0ff','#f0d6ff'],
    ink:['#eef1ff','#cfd6ff','#8b93b8','#4a5070','#1a1e32','#0a0c14','#2ee6ff','#ff6bd6'],
    garden:['#6b8f3a','#8fbf5a','#c47a3a','#ff6bd6','#ffc44d','#2ee6ff','#a45cff','#5a3a28'],
    fire:['#ff4f6d','#ff8a3d','#ffc44d','#fff1c8','#ff4fa8','#a45cff','#2ee6ff','#ffffff']
  };
  var STYLES=[
    {id:'neon universe painting, glowing nebula, cinematic lighting', n:'Neon universe'},
    {id:'delicate watercolor on dark paper, luminous washes', n:'Watercolor'},
    {id:'oil painting, rich impasto, moonlight', n:'Oil'},
    {id:'graphite pencil sketch, detailed hatching', n:'Pencil'},
    {id:'stained glass window, lead lines, jewel colours', n:'Stained glass'},
    {id:'pixel art, 32-bit, night garden', n:'Pixel'},
    {id:'soft anime illustration, night sky, gentle light', n:'Anime night'},
    {id:'photograph, shallow depth of field, moonlight', n:'Photo'},
    {id:'constellation star map, gold on indigo, engraved', n:'Star map'},
    {id:'botanical illustration of a night garden, scientific plate', n:'Botanical'},
    {id:'sumi-e ink wash, mist, moon', n:'Ink wash'},
    {id:'embroidery on black velvet, metallic thread', n:'Embroidery'},
    {id:'clay sculpture photograph, studio light', n:'Clay'},
    {id:'risograph print, two colour, grain', n:'Risograph'},
    {id:'art nouveau poster, alphonse mucha inspired, moon lilies', n:'Nouveau'}
  ];
  var STAMPS=['star','heart','moon','spark','leaf','bloom','diamond','cross'];
  var PAPERS=['void','parchment','graph','garden','velvet'];

  var api=null, st=null, cv=null, g=null, dpr=1, cssW=0, cssH=0;

  function $(id){ return document.getElementById(id); }
  function toast(m){ api&&api.toast&&api.toast(m); }
  function esc(s){ return api&&api.esc?api.esc(s):String(s).replace(/[&<>]/g,function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]; }); }

  function html(){
    var pal=''; Object.keys(PAL).forEach(function(k){
      pal+='<div class="swatches" data-pal="'+k+'">'+PAL[k].map(function(c){ return '<button type="button" data-dsw="'+c+'" style="--sc:'+c+'"></button>'; }).join('')+'</div>';
    });
    return '<div id="drawStudio">'+
      '<h2>Draw anything — or describe it.</h2>'+
      '<p>A full studio: twenty tools, layers of undo, symmetry, stamps, paper, and a live AI painter that can fill the canvas or bloom a clip from your words. Saved drawings live in Memories.</p>'+
      '<input class="field" id="aiPrompt" placeholder="A moonlit greenhouse of glass pomegranates, neon mist…" maxlength="400">'+
      '<div class="drow dsty" id="aiStyles">'+STYLES.map(function(s,i){ return '<button type="button" class="ghost'+(i===0?' on':'')+'" data-dstyle="'+esc(s.id)+'">'+esc(s.n)+'</button>'; }).join('')+'</div>'+
      '<div class="drow">'+
        '<button class="btn" type="button" data-dai="gen" style="--c:#ff6bd6">✦ Paint with AI</button>'+
        '<button class="ghost" type="button" data-dai="add">Add on top</button>'+
        '<button class="ghost" type="button" data-dai="video">▶ AI clip (5 frames)</button>'+
        '<button class="ghost" type="button" data-dai="var">Four variations</button>'+
      '</div>'+
      '<p class="tag" id="aiStat">AI paints through a public generator — no keys in this mind. Describe boldly.</p>'+
      '<div class="drawwrap studio"><canvas id="pad"></canvas></div>'+
      '<p class="dhint" id="dHint">Pencil · drag to draw. Pinch not needed — use size.</p>'+
      '<div class="drow dstools">'+TOOLS.map(function(t,i){ return '<button type="button" class="ghost'+(i===0?' on':'')+'" data-dtool="'+t.id+'">'+t.n+'</button>'; }).join('')+'</div>'+
      '<div class="drow">'+
        '<button class="ghost" type="button" data-dact="undo">Undo</button>'+
        '<button class="ghost" type="button" data-dact="redo">Redo</button>'+
        '<button class="ghost" type="button" data-dact="size">Size</button>'+
        '<button class="ghost" type="button" data-dact="opa">Opacity</button>'+
        '<button class="ghost" type="button" data-dact="sym">Symmetry</button>'+
        '<button class="ghost" type="button" data-dact="grid">Grid</button>'+
        '<button class="ghost" type="button" data-dact="paper">Paper</button>'+
        '<button class="ghost" type="button" data-dact="stamp">Stamp kind</button>'+
        '<input type="color" class="dcol" id="dCol" value="#2ee6ff" title="Custom colour">'+
      '</div>'+
      pal+
      '<div class="drow">'+
        '<button class="ghost" type="button" data-dact="import">Import photo</button>'+
        '<button class="ghost" type="button" data-dact="new">New canvas</button>'+
        '<button class="btn" type="button" data-dact="save" style="--c:#ff6bd6">Save to memories</button>'+
        '<button class="ghost" type="button" data-dact="download">Download PNG</button>'+
        '<span class="tag" id="padSaved"></span>'+
      '</div>'+
      '<input type="file" accept="image/*" class="file" id="dFile">'+
      '<div id="aiClip" class="aiclip" hidden></div>'+
      '</div>';
  }

  function hint(){
    var h=$('dHint'); if(!h||!st) return;
    var map={
      pencil:'Pencil · thin grainy line, pressure from speed.',
      ink:'Ink · wet black-ish line with a little bleed.',
      marker:'Marker · fat translucent stroke.',
      glow:'Glow · the original mind brush, halo around the line.',
      air:'Airbrush · soft cloud of colour.',
      wash:'Wash · watery glaze. Layer it.',
      neon:'Neon · hot core, wide bloom.',
      spray:'Spray · scattered specks.',
      calligraphy:'Nib · thick on slow, thin on fast.',
      eraser:'Eraser · lifts paint back to paper.',
      smudge:'Smudge · pull wet colour.',
      fill:'Fill · tap a region. Big areas take a breath.',
      line:'Line · drag, release to commit.',
      rect:'Rect · drag a box.',
      oval:'Oval · drag an ellipse.',
      poly:'Star · tap to stamp a geometric star.',
      drop:'Dropper · tap to steal a colour.',
      stamp:'Stamp · tap to place '+STAMPS[st.stamp]+'.',
      text:'Text · tap where the words should sit.',
      select:'Lasso · drag a loop, then Fill or Eraser uses it.'
    };
    h.textContent=(map[st.tool]||'')+' · size '+st.w+' · opa '+Math.round(st.a*100)+'% · sym '+st.sym+(st.grid?' · grid':'')+' · '+PAPERS[st.paper];
  }

  function paperFill(ctx,w,h,kind,clear){
    if(clear) ctx.clearRect(0,0,w,h);
    if(kind===0){
      var gr=ctx.createRadialGradient(w*.5,h*.38,8,w*.5,h*.4,Math.max(w,h)*.7);
      gr.addColorStop(0,'rgba(164,92,255,.10)'); gr.addColorStop(1,'rgba(4,6,16,0)');
      ctx.fillStyle=gr; ctx.fillRect(0,0,w,h); return;
    }
    if(kind===1){ ctx.fillStyle='#f3e6c8'; ctx.fillRect(0,0,w,h); ctx.fillStyle='rgba(160,120,60,.08)'; for(var i=0;i<40;i++) ctx.fillRect(Math.random()*w,Math.random()*h,2,2); return; }
    if(kind===2){
      ctx.fillStyle='#0a1020'; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='rgba(80,120,180,.18)'; ctx.lineWidth=1;
      for(var x=20;x<w;x+=20){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
      for(var y=20;y<h;y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
      return;
    }
    if(kind===3){
      ctx.fillStyle='#0c1810'; ctx.fillRect(0,0,w,h);
      ctx.fillStyle='rgba(80,140,90,.12)';
      for(var j=0;j<30;j++){ ctx.beginPath(); ctx.ellipse(Math.random()*w,Math.random()*h,20,8,Math.random(),0,Math.PI*2); ctx.fill(); }
      return;
    }
    ctx.fillStyle='#14081a'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(255,107,214,.05)'; ctx.fillRect(0,0,w,h);
  }

  function snap(){
    if(!cv) return;
    st.undo.push(cv.toDataURL('image/png'));
    if(st.undo.length>28) st.undo.shift();
    st.redo=[];
  }
  function loadUrl(url,cb){
    var im=new Image(); im.onload=function(){ g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,cv.width,cv.height); g.drawImage(im,0,0,cv.width,cv.height); g.setTransform(dpr,0,0,dpr,0,0); cb&&cb(); };
    im.src=url;
  }
  function undo(){ if(!st.undo.length){ toast('Nothing to undo'); return; } st.redo.push(cv.toDataURL('image/png')); loadUrl(st.undo.pop()); }
  function redo(){ if(!st.redo.length){ toast('Nothing to redo'); return; } st.undo.push(cv.toDataURL('image/png')); loadUrl(st.redo.pop()); }

  function pt(e){ var r=cv.getBoundingClientRect(); return [e.clientX-r.left, e.clientY-r.top]; }

  function withSym(fn,x,y,x2,y2){
    var pts=[[x,y,x2,y2]];
    var cx=cssW/2, cy=cssH/2;
    if(st.sym>=2) pts.push([cx*2-x,y, x2==null?null:cx*2-x2, y2]);
    if(st.sym>=4){ pts.push([x,cy*2-y, x2, y2==null?null:cy*2-y2]); pts.push([cx*2-x,cy*2-y, x2==null?null:cx*2-x2, y2==null?null:cy*2-y2]); }
    if(st.sym>=8){
      var extra=pts.slice(); extra.forEach(function(p){
        pts.push([cy-(p[1]-cy)+cx- (cy-cx), cx-(p[0]-cx)+cy-(cx-cy), p[2]==null?null:cy-(p[3]-cy)+cx-(cy-cx), p[3]==null?null:cx-(p[2]-cx)+cy-(cx-cy)]);
      });
      // simpler 8-way: rotate 90 on the 4-way set
      var rot=[]; pts.slice(0,4).forEach(function(p){
        var rx=cx-(p[1]-cy), ry=cy+(p[0]-cx);
        var rx2=p[2]==null?null:cx-(p[3]-cy), ry2=p[3]==null?null:cy+(p[2]-cx);
        rot.push([rx,ry,rx2,ry2]);
      });
      pts=pts.concat(rot);
    }
    pts.forEach(function(p){ fn(p[0],p[1],p[2],p[3]); });
  }

  function hexA(h,a){
    h=h.replace('#',''); if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n=parseInt(h,16); return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';
  }

  function strokeSeg(x0,y0,x1,y1, forceW){
    var dx=x1-x0, dy=y1-y0, dist=Math.hypot(dx,dy)||1;
    var spd=Math.min(40,dist);
    var tool=st.tool, col=st.c, w=forceW||st.w, a=st.a;
    g.save();
    g.lineCap='round'; g.lineJoin='round';
    if(tool==='eraser'){
      g.globalCompositeOperation='destination-out';
      g.strokeStyle='rgba(0,0,0,'+a+')'; g.lineWidth=w*1.6; g.shadowBlur=0;
      g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke();
      g.restore(); return;
    }
    g.globalAlpha=a;
    if(tool==='pencil'){
      g.strokeStyle=col; g.lineWidth=Math.max(0.6,w*(.35+Math.min(1,8/spd)*.4)); g.shadowBlur=0;
      g.globalAlpha=a*(.55+Math.random()*.35);
      g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke();
    } else if(tool==='ink'){
      g.strokeStyle=col; g.lineWidth=w*1.1; g.shadowColor=hexA(col,.35); g.shadowBlur=w*.4;
      g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke();
    } else if(tool==='marker'){
      g.strokeStyle=hexA(col,.55); g.lineWidth=w*2.2; g.shadowBlur=0;
      g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke();
    } else if(tool==='glow'){
      g.strokeStyle=col; g.lineWidth=w; g.shadowColor=col; g.shadowBlur=w*2.4;
      g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke();
    } else if(tool==='neon'){
      g.strokeStyle='#fff'; g.lineWidth=Math.max(1,w*.35); g.shadowColor=col; g.shadowBlur=w*3.2;
      g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke();
      g.strokeStyle=col; g.lineWidth=w*1.2; g.shadowBlur=w*1.4; g.stroke();
    } else if(tool==='air'||tool==='wash'){
      var steps=Math.max(1,dist/2), i;
      g.fillStyle=hexA(col, tool==='wash'? .08:.04);
      g.shadowBlur=0;
      for(i=0;i<=steps;i++){
        var t=i/steps, x=x0+dx*t, y=y0+dy*t;
        g.beginPath(); g.arc(x,y,w*(tool==='wash'?1.8:1.3),0,Math.PI*2); g.fill();
      }
    } else if(tool==='spray'){
      var n=Math.max(4, dist*1.4), j;
      g.fillStyle=col; g.shadowBlur=0;
      for(j=0;j<n;j++){ var t=Math.random(), x=x0+dx*t+(Math.random()-.5)*w*2.4, y=y0+dy*t+(Math.random()-.5)*w*2.4;
        g.globalAlpha=a*Math.random(); g.fillRect(x,y,1.2,1.2); }
    } else if(tool==='calligraphy'){
      var nw=Math.max(1, w*(.4+Math.min(1.6, 14/spd)));
      g.strokeStyle=col; g.lineWidth=nw; g.shadowBlur=0;
      g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke();
    } else {
      g.strokeStyle=col; g.lineWidth=w; g.shadowColor=col; g.shadowBlur=w;
      g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke();
    }
    g.restore();
  }

  function smudgeAt(x,y){
    var s=Math.max(4, st.w*2)|0;
    try{
      var img=g.getImageData(Math.max(0,(x-s/2)*dpr), Math.max(0,(y-s/2)*dpr), s*dpr, s*dpr);
      g.putImageData(img, Math.max(0,(x-s/2+1.2)*dpr), Math.max(0,(y-s/2+0.6)*dpr));
    }catch(e){}
  }

  function drawStamp(kind,x,y){
    var s=st.w*2.2;
    g.save(); g.translate(x,y); g.fillStyle=st.c; g.strokeStyle=st.c; g.globalAlpha=st.a; g.shadowColor=st.c; g.shadowBlur=st.w;
    g.beginPath();
    if(kind==='star'||kind==='spark'){
      for(var i=0;i<5;i++){ var a=-Math.PI/2+i*Math.PI*2/5, a2=a+Math.PI/5;
        g.lineTo(Math.cos(a)*s, Math.sin(a)*s); g.lineTo(Math.cos(a2)*s*.4, Math.sin(a2)*s*.4); }
      g.closePath(); g.fill();
    } else if(kind==='heart'){
      g.moveTo(0,s*.3); g.bezierCurveTo(-s,-s*.2,-s*.9,s*.6,0,s); g.bezierCurveTo(s*.9,s*.6,s,-s*.2,0,s*.3); g.fill();
    } else if(kind==='moon'){
      g.arc(0,0,s,.4,Math.PI*2-.4); g.arc(s*.35,-s*.1,s*.7,Math.PI+.2,-.2,true); g.fill();
    } else if(kind==='leaf'){
      g.ellipse(0,0,s*.45,s, -.4,0,Math.PI*2); g.fill();
    } else if(kind==='bloom'){
      for(var k=0;k<6;k++){ g.beginPath(); g.ellipse(Math.cos(k)*s*.5, Math.sin(k)*s*.5, s*.35, s*.18, k, 0, Math.PI*2); g.fill(); }
    } else if(kind==='diamond'){
      g.moveTo(0,-s); g.lineTo(s*.7,0); g.lineTo(0,s); g.lineTo(-s*.7,0); g.closePath(); g.fill();
    } else {
      g.lineWidth=Math.max(1.5,st.w/3); g.moveTo(-s,0); g.lineTo(s,0); g.moveTo(0,-s); g.lineTo(0,s); g.stroke();
    }
    g.restore();
  }

  function flood(px,py){
    var W=cv.width, H=cv.height;
    px=(px*dpr)|0; py=(py*dpr)|0;
    if(px<0||py<0||px>=W||py>=H) return;
    var img=g.getImageData(0,0,W,H), d=img.data, i=(py*W+px)*4;
    var tr=d[i], tg=d[i+1], tb=d[i+2], ta=d[i+3];
    var tmp=document.createElement('canvas'); tmp.width=1; tmp.height=1;
    var tgx=tmp.getContext('2d'); tgx.fillStyle=st.c; tgx.fillRect(0,0,1,1);
    var fd=tgx.getImageData(0,0,1,1).data;
    var fr=fd[0], fg=fd[1], fb=fd[2], fa=Math.round(st.a*255);
    if(tr===fr&&tg===fg&&tb===fb&&Math.abs(ta-fa)<8) return;
    var stack=[px,py], seen={}, n=0, max=W*H;
    function same(o){ return Math.abs(d[o]-tr)+Math.abs(d[o+1]-tg)+Math.abs(d[o+2]-tb)+Math.abs(d[o+3]-ta)<48; }
    while(stack.length&&n<max){
      var x=stack.pop(), y=stack.pop(), o=(y*W+x)*4, k=y*W+x;
      if(seen[k]||x<0||y<0||x>=W||y>=H||!same(o)) continue;
      seen[k]=1; n++;
      d[o]=fr; d[o+1]=fg; d[o+2]=fb; d[o+3]=fa;
      stack.push(x+1,y, x-1,y, x,y+1, x,y-1);
    }
    g.putImageData(img,0,0);
  }

  function drawShape(kind, x0,y0,x1,y1){
    g.save(); g.strokeStyle=st.c; g.fillStyle=hexA(st.c,.18); g.lineWidth=st.w; g.globalAlpha=st.a; g.shadowColor=st.c; g.shadowBlur=st.w;
    g.beginPath();
    if(kind==='line'){ g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke(); }
    else if(kind==='rect'){ g.strokeRect(Math.min(x0,x1),Math.min(y0,y1),Math.abs(x1-x0),Math.abs(y1-y0)); }
    else { var rx=Math.abs(x1-x0)/2, ry=Math.abs(y1-y0)/2; g.ellipse((x0+x1)/2,(y0+y1)/2,rx||1,ry||1,0,0,Math.PI*2); g.stroke(); }
    g.restore();
  }

  function paintGrid(){
    if(!st.grid) return;
    g.save(); g.strokeStyle='rgba(200,210,255,.12)'; g.lineWidth=.6; g.shadowBlur=0;
    var s=24;
    for(var x=s;x<cssW;x+=s){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,cssH); g.stroke(); }
    for(var y=s;y<cssH;y+=s){ g.beginPath(); g.moveTo(0,y); g.lineTo(cssW,y); g.stroke(); }
    g.restore();
  }

  function sizeCanvas(){
    if(!cv) return;
    dpr=Math.min(2, window.devicePixelRatio||1);
    cssW=cv.clientWidth; cssH=cv.clientHeight;
    var prev=null;
    try{ prev=cv.toDataURL('image/png'); }catch(e){}
    cv.width=cssW*dpr; cv.height=cssH*dpr;
    g=cv.getContext('2d'); g.setTransform(dpr,0,0,dpr,0,0); g.lineCap='round'; g.lineJoin='round';
    if(prev) loadUrl(prev); else { paperFill(g,cssW,cssH,st.paper,true); }
  }

  function setTool(id){
    st.tool=id;
    document.querySelectorAll('#drawStudio [data-dtool]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-dtool')===id); });
    hint();
  }
  function setColor(c){
    st.c=c;
    var col=$('dCol'); if(col) col.value=c.length===7?c:'#2ee6ff';
    document.querySelectorAll('#drawStudio [data-dsw]').forEach(function(b){ b.classList.toggle('sel', b.getAttribute('data-dsw')===c); });
    if(api&&api.padState) api.padState.c=c;
  }

  function styleOf(){
    var on=document.querySelector('#aiStyles button.on');
    return on?on.getAttribute('data-dstyle'):STYLES[0].id;
  }
  function promptOf(){
    var el=$('aiPrompt'); return ((el&&el.value)||'').trim();
  }
  function aiUrl(prompt, seed, w, h){
    var p=styleOf()+', '+prompt+', highly detailed, masterpiece lighting';
    return 'https://image.pollinations.ai/prompt/'+encodeURIComponent(p)+'?width='+(w||768)+'&height='+(h||768)+'&nologo=true&enhance=true&seed='+(seed||((Math.random()*1e9)|0));
  }
  function loadAi(url, mode, done){
    var im=new Image(); im.crossOrigin='anonymous';
    im.onload=function(){
      g.setTransform(dpr,0,0,dpr,0,0);
      if(mode==='fill'){ g.drawImage(im,0,0,cssW,cssH); }
      else {
        var s=Math.min(cssW,cssH)*.72, x=(cssW-s)/2, y=(cssH-s)/2;
        g.save(); g.globalAlpha=.92; g.drawImage(im,x,y,s,s); g.restore();
      }
      done&&done(true);
    };
    im.onerror=function(){ done&&done(false); };
    im.src=url;
  }
  function stat(t){ var el=$('aiStat'); if(el) el.textContent=t; }

  function aiGen(kind){
    var p=promptOf();
    if(!p){ toast('Describe what you want first'); return; }
    if(st.busy){ toast('Still painting…'); return; }
    st.busy=1; snap();
    if(kind==='gen'||kind==='add'){
      stat('The mind is mixing pigments…');
      loadAi(aiUrl(p), kind==='add'?'add':'fill', function(ok){
        st.busy=0;
        if(!ok){ stat('The painter could not reach the canvas — try again in a moment.'); toast('AI missed — try again'); return; }
        stat('Painted from your words.'); toast('AI painting landed');
        autosave(); api.FX&&api.FX('warp'); api.quest&&api.quest('draw');
      });
      return;
    }
    if(kind==='var'){
      stat('Four variations brewing…');
      var n=0, fails=0;
      function next(){
        if(n>=4){ st.busy=0; stat(fails?'Some variations missed.':'Four variations — pick with Undo if you liked an earlier one.'); autosave(); return; }
        loadAi(aiUrl(p+' variation '+(n+1), (Date.now()+n*97)|0), 'fill', function(ok){
          if(!ok) fails++; n++; setTimeout(next, 400);
        });
      }
      next(); return;
    }
    if(kind==='video'){
      stat('Shooting a 5-frame clip… this takes a little while.');
      var frames=[], i=0;
      function frame(){
        if(i>=5){ st.busy=0; playClip(frames); return; }
        var im=new Image(); im.crossOrigin='anonymous';
        im.onload=function(){ frames.push(im); i++; stat('Clip frame '+(i)+' / 5'); setTimeout(frame, 350); };
        im.onerror=function(){ i++; stat('Missed a frame — continuing'); setTimeout(frame, 350); };
        im.src=aiUrl(p+', cinematic still from a short film, frame '+(i+1)+' of 5', (Date.now()+i*131)|0, 640, 640);
      }
      frame();
    }
  }

  function playClip(frames){
    var box=$('aiClip'); if(!box) return;
    if(!frames.length){ toast('Clip came back empty'); stat('Clip failed — try a shorter prompt.'); return; }
    box.hidden=false; box.innerHTML='<canvas id="clipCv"></canvas><div class="drow"><button class="btn" type="button" data-dact="saveClip" style="--c:#ff6bd6">Save clip to memories</button><button class="ghost" type="button" data-dact="hideClip">Hide</button></div>';
    var c=$('clipCv'), x=c.getContext('2d'), fi=0;
    c.width=320; c.height=320; c.style.width='min(100%,320px)'; c.style.height='auto'; c.style.margin='12px auto'; c.style.display='block'; c.style.borderRadius='18px';
    st.clip=frames;
    clearInterval(st.clipT);
    st.clipT=setInterval(function(){ var im=frames[fi%frames.length]; x.fillStyle='#04060f'; x.fillRect(0,0,320,320); if(im) x.drawImage(im,0,0,320,320); fi++; }, 220);
    stat('Clip looping below. Save it into Memories if you like it.');
    toast('AI clip ready');
    g.setTransform(dpr,0,0,dpr,0,0); g.drawImage(frames[0],0,0,cssW,cssH);
    autosave();
  }

  function saveClip(){
    if(!st.clip||!st.clip.length){ toast('No clip yet'); return; }
    var jobs=[], i;
    for(i=0;i<st.clip.length;i++){
      var c=document.createElement('canvas'); c.width=640; c.height=640; c.getContext('2d').drawImage(st.clip[i],0,0,640,640);
      jobs.push(api.mPut({id:'m'+Date.now()+i, type:'image', url:c.toDataURL('image/png'), ts:Date.now()+i, drawing:true, album:'Drawings'}));
    }
    Promise.all(jobs).then(function(){ toast('Clip saved as frames'); api.refreshBoards&&api.refreshBoards(); api.quest&&api.quest('draw'); });
  }

  var saveT=null;
  function autosave(){
    if(!cv||!api||!api.mPut) return;
    var mark=$('padSaved'); if(mark) mark.textContent='saving…';
    clearTimeout(saveT);
    saveT=setTimeout(function(){
      try{
        api.mPut({id:st.id, type:'image', url:cv.toDataURL('image/png'), ts:Date.now(), drawing:true, album:'Drawings'}).then(function(){
          if(mark) mark.textContent='saved ✓';
          api.refreshBoards&&api.refreshBoards(); api.quest&&api.quest('draw');
        });
      }catch(e){ if(mark) mark.textContent=''; }
    }, 700);
  }

  function placeText(x,y){
    var t=prompt('Words to place');
    if(!t) return;
    snap();
    g.save(); g.fillStyle=st.c; g.globalAlpha=st.a; g.font='bold '+Math.max(14,st.w*4)+'px Inter, Georgia, serif';
    g.textAlign='center'; g.textBaseline='middle'; g.shadowColor=st.c; g.shadowBlur=st.w*2;
    withSym(function(px,py){ g.fillText(t, px, py); }, x,y);
    g.restore(); autosave();
  }

  function bindPad(){
    var down=false, last=null, start=null, preview=null;
    cv.onpointerdown=function(e){
      e.preventDefault();
      var p=pt(e); down=true; last=p; start=p; cv.setPointerCapture(e.pointerId);
      if(st.tool==='drop'){
        try{ var pix=g.getImageData(p[0]*dpr,p[1]*dpr,1,1).data; setColor('#'+[pix[0],pix[1],pix[2]].map(function(n){ return n.toString(16).padStart(2,'0'); }).join('')); }catch(err){}
        down=false; return;
      }
      if(st.tool==='text'){ down=false; placeText(p[0],p[1]); return; }
      if(st.tool==='fill'){ snap(); flood(p[0],p[1]); down=false; autosave(); return; }
      if(st.tool==='stamp'||st.tool==='poly'){ snap(); withSym(function(x,y){ drawStamp(st.tool==='poly'?'star':STAMPS[st.stamp], x,y); }, p[0],p[1]); down=false; autosave(); return; }
      if(st.tool==='line'||st.tool==='rect'||st.tool==='oval'||st.tool==='select'){ preview=cv.toDataURL('image/png'); return; }
      snap();
      withSym(function(x,y){ strokeSeg(x,y,x+.01,y+.01); }, p[0],p[1]);
    };
    cv.onpointermove=function(e){
      if(!down||!last) return;
      var p=pt(e);
      if(st.tool==='line'||st.tool==='rect'||st.tool==='oval'){
        loadUrl(preview, function(){ withSym(function(x,y,x2,y2){ drawShape(st.tool,x,y,x2,y2); }, start[0],start[1],p[0],p[1]); });
        last=p; return;
      }
      if(st.tool==='select'){ last=p; return; }
      if(st.tool==='smudge'){ withSym(function(x,y){ smudgeAt(x,y); }, p[0],p[1]); last=p; return; }
      withSym(function(x,y,x2,y2){ strokeSeg(x,y,x2,y2); }, last[0],last[1], p[0],p[1]);
      last=p;
    };
    function up(){
      if(!down) return; down=false;
      if((st.tool==='line'||st.tool==='rect'||st.tool==='oval')&&start&&last&&preview){
        loadUrl(preview, function(){ snap(); withSym(function(x,y,x2,y2){ drawShape(st.tool,x,y,x2,y2); }, start[0],start[1],last[0],last[1]); autosave(); });
      } else autosave();
      last=null; start=null; preview=null;
    }
    cv.onpointerup=cv.onpointercancel=up;
  }

  function act(a){
    if(a==='undo') return undo();
    if(a==='redo') return redo();
    if(a==='size'){ st.w=st.w>=28?2:st.w+3; hint(); toast('Size '+st.w); return; }
    if(a==='opa'){ st.a=st.a>=.95?.15:Math.min(1, st.a+.2); hint(); toast('Opacity '+Math.round(st.a*100)+'%'); return; }
    if(a==='sym'){ st.sym=st.sym===0?2:st.sym===2?4:st.sym===4?8:0; hint(); toast(st.sym?('Symmetry '+st.sym+'-way'):'Symmetry off'); return; }
    if(a==='grid'){ st.grid=!st.grid; hint(); toast(st.grid?'Grid on — it is a guide, not paint':'Grid off'); return; }
    if(a==='paper'){
      if(!confirm('Change paper? This lays a new ground (your last undo can bring the old one back).')) return;
      snap(); st.paper=(st.paper+1)%PAPERS.length; paperFill(g,cssW,cssH,st.paper,false); hint(); toast('Paper: '+PAPERS[st.paper]); autosave(); return;
    }
    if(a==='stamp'){ st.stamp=(st.stamp+1)%STAMPS.length; setTool('stamp'); toast('Stamp: '+STAMPS[st.stamp]); return; }
    if(a==='import'){ var f=$('dFile'); if(!f) return; f.onchange=function(){ var file=f.files[0]; if(!file) return; var r=new FileReader(); r.onload=function(){ snap(); var im=new Image(); im.onload=function(){ g.drawImage(im,0,0,cssW,cssH); autosave(); toast('Imported'); }; im.src=r.result; }; r.readAsDataURL(file); }; f.click(); return; }
    if(a==='new'){ if(!confirm('New canvas? The last version is in undo and autosave.')) return; snap(); st.id='d'+Date.now(); paperFill(g,cssW,cssH,st.paper,true); toast('Fresh paper'); return; }
    if(a==='save'){ if(!api.mPut) return; api.mPut({id:st.id,type:'image',url:cv.toDataURL('image/png'),ts:Date.now(),drawing:true,album:'Drawings'}).then(function(){ toast('Saved to Memories'); var s=$('padSaved'); if(s) s.textContent='saved ✓'; api.refreshBoards&&api.refreshBoards(); api.quest&&api.quest('draw'); }); return; }
    if(a==='download'){ var ael=document.createElement('a'); ael.href=cv.toDataURL('image/png'); ael.download='mind-drawing.png'; ael.click(); return; }
    if(a==='saveClip') return saveClip();
    if(a==='hideClip'){ var box=$('aiClip'); if(box) box.hidden=true; clearInterval(st.clipT); return; }
  }

  function init(a){
    api=a||{};
    st={id:'d'+Date.now(), tool:'pencil', c:'#2ee6ff', w:6, a:.92, sym:0, grid:0, paper:0, stamp:0, undo:[], redo:[], busy:0, clip:null, clipT:null};
    cv=$('pad'); if(!cv) return;
    sizeCanvas(); bindPad();
    var prompt=$('aiPrompt');
    if(prompt && api.drawPrompt){ prompt.value=api.drawPrompt; prompt.placeholder=api.drawPrompt; }
    var studio=$('drawStudio');
    studio.addEventListener('click', function(e){
      var b=e.target.closest('button'); if(!b) return;
      if(b.dataset.dtool){ setTool(b.dataset.dtool); return; }
      if(b.dataset.dsw){ setColor(b.dataset.dsw); return; }
      if(b.dataset.dstyle){ studio.querySelectorAll('[data-dstyle]').forEach(function(x){ x.classList.toggle('on', x===b); }); return; }
      if(b.dataset.dai){ aiGen(b.dataset.dai); return; }
      if(b.dataset.dact){ act(b.dataset.dact); return; }
    });
    var col=$('dCol');
    col&&col.addEventListener('input', function(){ setColor(col.value); });
    addEventListener('resize', function(){ if(cv&&document.contains(cv)) sizeCanvas(); });
    setColor(st.c); hint();
  }

  window.MUDraw={html:html, init:init, setColor:setColor, ai:function(a){ if(a==='aiVideo') aiGen('video'); else if(a==='aiImage') aiGen('add'); else aiGen('gen'); }};
})();
