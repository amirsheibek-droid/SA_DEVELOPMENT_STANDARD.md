/* Night garden — original farm sim. 100 night crops, seasons, shop, kitchen. Not Stardew IP. */
(function(){
  var SEASONS=['Dusk','Midnight','Starfall','Eclipse'];
  var SCOL=['#ff8a3d','#6b8cff','#ffd27a','#c084ff'];
  var VEG=['Carrot','Potato','Leek','Cabbage','Onion','Kale','Beet','Parsnip','Pea','Squash','Corn','Garlic','Cucumber','Chilli','Tomato','Bean','Aubergine','Lettuce','Yam','Broccoli','Radish','Fennel','Celery','Spinach','Turnip'];
  var FRU=['Strawberry','Blueberry','Raspberry','Apple','Pear','Plum','Peach','Cherry','Grape','Melon','Fig','Date','Orange','Lemon','Mango','Kiwi','Apricot','Papaya','Lychee','Pineapple','Banana','Cranberry','Mulberry','Olive','Avocado'];
  var PRE=['Night','Moon','Star','Dusk','Eclipse','Void','Lunar','Nebula','Glow','Mist'];
  var FLAV=['Drinks silver dew.','Hates harsh noon — luckily there is none here.','Ripens when the stars lean left.','Sweeter after moon-rain.','Keeps a faint pulse in the soil.','Off-season it sulks.','Loves fertiliser and gossip.','A favourite in Eclipse kitchens.','Plant beside its cousin for luck.','The almanac calls it stubborn and worth it.'];
  var VCOL=['#c47a3a','#d4a84b','#6b8f3a','#8fbf5a','#e07a3a','#9bbf4a','#c45c6a','#7a9e4a','#e0c05a','#5a8f4a'];
  var FCOL=['#ff6bd6','#ff4fa8','#ff8a3d','#ffc44d','#a45cff','#ff4f6d','#19f0b0','#2ee6ff','#ffd27a','#cfd6ff'];
  var CROPS=[];
  (function(){
    var i;
    for(i=0;i<50;i++) CROPS.push({id:i,n:PRE[i%10]+' '+VEG[i%25],k:'veg',se:i%4,days:2+(i%7),seed:8+(i%12)*3,sell:20+(i%7)*9+(i%5)*5,col:VCOL[i%10],ever:i%11===0,blurb:FLAV[i%FLAV.length]});
    for(i=0;i<50;i++) CROPS.push({id:50+i,n:PRE[i%10]+' '+FRU[i%25],k:'fruit',se:i%4,days:3+(i%8),seed:10+(i%12)*4,sell:26+(i%8)*11+(i%5)*6,col:FCOL[i%10],ever:i%13===0,blurb:FLAV[(i+3)%FLAV.length]});
  })();
  var RECIPES=[
    {id:'stew', n:'Moon stew', veg:2, fruit:0, en:40, gold:16, t:'Any two vegetables. Fills the bones.'},
    {id:'jam', n:'Star jam', veg:0, fruit:2, en:12, gold:48, t:'Two fruits, jarred in light.'},
    {id:'pie', n:'Eclipse pie', veg:1, fruit:1, en:80, gold:36, t:'One of each. Sleep can wait.'},
    {id:'salad', n:'Nebula salad', veg:3, fruit:0, en:22, gold:70, t:'Three vegetables, raw and proud.'},
    {id:'cordial', n:'Glow cordial', veg:0, fruit:3, en:55, gold:64, t:'Three fruits. You will hum.'},
    {id:'hash', n:'Void hash', veg:4, fruit:0, en:30, gold:90, t:'A skillet of four vegetables.'},
    {id:'tart', n:'Lunar tart', veg:0, fruit:4, en:18, gold:110, t:'Four fruits. Shopkeepers weep.'},
    {id:'feast', n:'Midnight feast', veg:2, fruit:2, en:100, gold:120, t:'Two and two. A proper sitting.'},
    {id:'broth', n:'Mist broth', veg:1, fruit:0, en:28, gold:8, t:'One vegetable. Humble, honest.'},
    {id:'cup', n:'Dusk cup', veg:0, fruit:1, en:16, gold:14, t:'One fruit, eaten standing up.'}
  ];
  var TOOLS=[
    {id:'hoe',n:'Hoe'},{id:'seed',n:'Seed'},{id:'water',n:'Water'},{id:'pick',n:'Pick'},
    {id:'cut',n:'Cut'},{id:'fert',n:'Feed'},{id:'bag',n:'Bag'},{id:'shop',n:'Shop'},
    {id:'cook',n:'Cook'},{id:'book',n:'Book'},{id:'sleep',n:'Sleep'},{id:'tea',n:'Tea'}
  ];
  var N=10;

  function stars(n){ var a=[],i; for(i=0;i<n;i++) a.push({x:Math.random(),y:Math.random(),z:.3+Math.random()*1.4}); return a; }
  function clamp(v,a,b){ return v<a?a:v>b?b:v; }
  function crop(id){ return CROPS[id]||CROPS[0]; }
  function seasonOf(day){ return Math.floor(((day-1)%56)/14); }
  function hexA(h,a){ h=(h||'#8fbf5a').replace('#',''); if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; var n=parseInt(h,16); return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'; }
  function rr(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }

  function emptyPlot(){ return {st:0,cid:-1,age:0,dry:0,fert:0,w:0,sc:0}; }
  function fresh(){
    var plots=[], i, seeds={};
    for(i=0;i<N*N;i++) plots.push(emptyPlot());
    [0,1,25,50,51,60].forEach(function(id){ seeds[id]=6; });
    return {day:1,gold:140,en:100,enMax:100,weather:'clear',seedSel:0,plots:plots,seeds:seeds,basket:{},fertN:2,teaN:1,disc:{0:1,1:1,50:1},scare:0,green:0,stats:{planted:0,harvest:0,goldE:0,cook:0},q:{},msg:'Hoe the soil, then seed. Water every night. Sleep to grow.'};
  }
  function hydrate(d){
    var st=fresh(), k;
    ['day','gold','en','enMax','weather','seedSel','fertN','teaN','scare','green'].forEach(function(k){ if(d[k]!=null) st[k]=d[k]; });
    if(d.plots&&d.plots.length===N*N) st.plots=d.plots;
    st.seeds=d.seeds||st.seeds; st.basket=d.basket||{}; st.disc=d.disc||st.disc; st.stats=d.stats||st.stats; st.q=d.q||{};
    return st;
  }
  function saveBlob(st){
    return {day:st.day,gold:st.gold,en:st.en,enMax:st.enMax,weather:st.weather,seedSel:st.seedSel,plots:st.plots,seeds:st.seeds,basket:st.basket,fertN:st.fertN,teaN:st.teaN,disc:st.disc,scare:st.scare,green:st.green,stats:st.stats,q:st.q};
  }
  function persist(C,st){ if(C.farmSave) C.farmSave(saveBlob(st)); st.dirty=0; }

  function ownedSeeds(st){
    var a=[], k; for(k in st.seeds) if(st.seeds[k]>0) a.push(+k);
    a.sort(function(x,y){ return x-y; }); return a;
  }
  function basketList(st){
    var a=[], k; for(k in st.basket) if(st.basket[k]>0) a.push(+k);
    a.sort(function(x,y){ return x-y; }); return a;
  }
  function unlocked(st,id){ return st.day>=1+Math.floor(id/8) || st.disc[id]; }

  function spendEn(st,n,C,why){
    if(st.en<n){ st.msg='Worn out — drink tea or sleep.'; if(C) C.toast('No energy'); return false; }
    st.en-=n; st.dirty=1; return true;
  }
  function addSeed(st,id,n){ st.seeds[id]=(st.seeds[id]||0)+n; st.disc[id]=1; }
  function addBasket(st,id,n){ st.basket[id]=(st.basket[id]||0)+n; }

  function weatherRoll(st){
    var r=Math.random();
    if(r<.12) st.weather='moonrain';
    else if(r<.18) st.weather='frost';
    else if(r<.22) st.weather='meteor';
    else st.weather='clear';
  }
  function tickNight(st,C){
    var se=seasonOf(st.day), i, p, cr, grow;
    weatherRoll(st);
    for(i=0;i<st.plots.length;i++){
      p=st.plots[i];
      if(p.st===0 && Math.random()<(st.scare?0.03:0.09)){ p.st=5; continue; }
      if(p.st===2||p.st===3||p.st===4){
        cr=crop(p.cid);
        if(st.weather==='moonrain') p.w=1;
        if(p.w){ p.dry=0; grow=1; }
        else { p.dry++; grow=0; if(p.dry>=2) p.st=4; }
        if(st.weather==='frost'&&!p.w&&p.st!==0){ if(Math.random()<.35) p.st=4; }
        if(grow && p.st===2){
          var ok=cr.ever||st.green||cr.se===se;
          if(ok || Math.random()<.45){ p.age++; if(p.fert) p.age++; }
          if(p.age>=cr.days) p.st=3;
        }
        p.w=0; p.fert=0;
      }
    }
    if(st.weather==='meteor'){ st.gold+=18; st.stats.goldE+=18; if(C) C.toast('A meteor left 18 gold in the furrows'); }
    st.day++; st.en=st.enMax;
    var names={clear:'A still night.',moonrain:'Moon-rain watered the beds.',frost:'Frost nipped the dry plots.',meteor:'Meteors stitched the sky.'};
    st.msg=SEASONS[seasonOf(st.day)]+' '+st.day+' · '+(names[st.weather]||'');
    quests(st,C);
  }

  function quests(st,C){
    var kinds=0, k, filled=0;
    for(k in st.disc) if(st.disc[k]) kinds++;
    st.plots.forEach(function(p){ if(p.st>0&&p.st<5) filled++; });
    function win(id,gold,msg){ if(st.q[id]) return; st.q[id]=1; st.gold+=gold; st.stats.goldE+=gold; st.msg=msg; if(C){ C.toast(msg); C.FX&&C.FX('warp'); } }
    if(kinds>=12) win('kinds',80,'Almanac quest · 12 crops known · +80 gold');
    if(st.stats.goldE>=400) win('gold',60,'Merchant quest · 400 earned · +60 gold');
    if(st.day>=15) win('year',100,'First year survived · +100 gold');
    if(st.stats.harvest>=40) win('harv',70,'Harvest quest · 40 gathered · +70 gold');
    if(filled>=40) win('fill',90,'The beds are busy · +90 gold');
    if(st.stats.cook>=8) win('cook',50,'Kitchen quest · +50 gold');
  }

  function tileAt(st,C,x,y,grid){
    var c=Math.floor((x-grid.x)/grid.s), r=Math.floor((y-grid.y)/grid.s);
    if(c<0||r<0||c>=N||r>=N) return -1;
    return r*N+c;
  }
  function gridOf(C){
    var top=54, bot=118, side=10;
    var s=Math.max(18, Math.min((C.W-side*2)/N, (C.H-top-bot)/N));
    var gw=s*N, gh=s*N;
    return {s:s, x:(C.W-gw)/2, y:top+Math.max(0,(C.H-top-bot-gh)/2), w:gw, h:gh};
  }

  function apply(st,C,i,hold){
    if(i<0) return;
    var p=st.plots[i], t=st.tool, cr, need;
    if(t==='hoe'){
      if(p.st===0||p.st===5){ if(!spendEn(st,2,C)) return; p.st=1; p.cid=-1; p.age=0; p.dry=0; p.w=0; p.fert=0; st.msg=p.st===1?'Tilled.':'Cleared weeds.'; }
    } else if(t==='seed'){
      if(p.st!==1){ if(!hold) st.msg='Hoe first.'; return; }
      cr=crop(st.seedSel); need=st.seeds[st.seedSel]||0;
      if(need<=0){ if(!hold) st.msg='No '+cr.n+' seed. Open Bag or Shop.'; return; }
      if(!spendEn(st,1,C)) return;
      st.seeds[st.seedSel]--; p.st=2; p.cid=st.seedSel; p.age=0; p.dry=0; p.w=0; p.fert=0; st.disc[st.seedSel]=1; st.stats.planted++; st.msg='Planted '+cr.n+'.';
    } else if(t==='water'){
      if(p.st===2||p.st===3||p.st===4){ if(p.w){ if(!hold) st.msg='Already watered.'; return; } if(!spendEn(st,1,C)) return; p.w=1; if(p.st===4){ p.st=2; p.dry=0; st.msg='Revived.'; } else st.msg='Watered.'; }
    } else if(t==='pick'){
      if(p.st===3){ if(!spendEn(st,1,C)) return; cr=crop(p.cid); addBasket(st,p.cid,1+(p.fert?1:0)); st.stats.harvest++; p.st=1; p.cid=-1; p.age=0; p.w=0; p.dry=0; p.fert=0; st.msg='Picked '+cr.n+'.'; C.FX&&C.FX('zoop',.25); }
    } else if(t==='cut'){
      if(p.st!==0){ if(!spendEn(st,2,C)) return; st.plots[i]=emptyPlot(); st.msg='Cut back.'; }
    } else if(t==='fert'){
      if((p.st===2||p.st===3)&&st.fertN>0){ if(!spendEn(st,3,C)) return; st.fertN--; p.fert=1; st.msg='Fed the soil.'; }
      else if(!hold) st.msg=st.fertN?'Only on growing beds.':'Buy feed in the shop.';
    }
    st.dirty=1;
  }

  function hitTools(C,y){ return y>C.H-108; }
  function toolAt(C,x,y){
    if(!hitTools(C,y)) return -1;
    var row=y>C.H-54?1:0, col=Math.floor(x/(C.W/6));
    col=clamp(col,0,5); return row*6+col;
  }

  function overlayList(st){
    if(st.ui==='bag') return ownedSeeds(st).map(function(id){ return {id:id, k:'seed', n:crop(id).n, sub:(st.seeds[id]||0)+' seed', col:crop(id).col}; });
    if(st.ui==='shop'){
      var a=[], i;
      for(i=0;i<CROPS.length;i++) if(unlocked(st,i)) a.push({id:i, k:'buy', n:crop(i).n, sub:'seed '+crop(i).seed+'g · sell '+crop(i).sell+'g · '+crop(i).days+' nights', col:crop(i).col});
      a.push({id:-1,k:'fert',n:'Star feed',sub:'25g · extra growth tonight',col:'#8fbf5a'});
      a.push({id:-2,k:'tea',n:'Glow tea',sub:'30g · +40 energy',col:'#ffc44d'});
      a.push({id:-3,k:'scare',n:'Scarecrow',sub:(st.scare?'already standing':'120g · fewer weeds'),col:'#ff8a3d'});
      a.push({id:-4,k:'green',n:'Glass greenhouse',sub:(st.green?'built':'450g · off-season still grows'),col:'#2ee6ff'});
      a.push({id:-5,k:'enmax',n:'Deeper rest',sub:'200g · max energy +20',col:'#a45cff'});
      a.push({id:-6,k:'sell',n:'Sell the whole basket',sub:'cash in tonight\'s harvest',col:'#ffd27a'});
      return a;
    }
    if(st.ui==='cook') return RECIPES.map(function(r){ return {id:r.id, k:'cook', n:r.n, sub:r.t+' · +'+r.en+' energy · +'+r.gold+'g', col:'#ff6bd6', rec:r}; });
    if(st.ui==='book') return CROPS.map(function(c){ var known=!!st.disc[c.id]; return {id:c.id,k:'book',n:known?c.n:'????',sub:known?(c.k+' · '+SEASONS[c.se]+(c.ever?' · everlight':'')+' · '+c.days+' nights · '+c.blurb):'Not yet grown in this garden.',col:known?c.col:'#445'}; });
    return [];
  }

  function tapOverlay(st,C,idx){
    var list=overlayList(st), it=list[idx]; if(!it) return;
    if(st.ui==='bag'&&it.k==='seed'){ st.seedSel=it.id; st.tool='seed'; st.ui='farm'; st.msg=crop(it.id).n+' selected.'; return; }
    if(st.ui==='book'&&it.k==='book'&&st.disc[it.id]&&C.setDrawPrompt){ C.setDrawPrompt(crop(it.id).n+', night garden botanical plate, glowing produce'); C.toast('Prompt ready in Magic drawing'); return; }
    if(st.ui==='shop'){
      if(it.k==='buy'){ var c=crop(it.id); if(st.gold<c.seed){ st.msg='Not enough gold.'; return; } st.gold-=c.seed; addSeed(st,it.id,1); st.msg='Bought '+c.n+' seed.'; }
      else if(it.k==='fert'){ if(st.gold<25) return; st.gold-=25; st.fertN++; st.msg='Star feed ×'+st.fertN; }
      else if(it.k==='tea'){ if(st.gold<30) return; st.gold-=30; st.teaN++; st.msg='Glow tea ×'+st.teaN; }
      else if(it.k==='scare'){ if(st.scare||st.gold<120) return; st.gold-=120; st.scare=1; st.msg='A scarecrow watches the furrows.'; }
      else if(it.k==='green'){ if(st.green||st.gold<450) return; st.gold-=450; st.green=1; st.msg='Glasshouse up. Off-season crop still climbs.'; }
      else if(it.k==='enmax'){ if(st.gold<200) return; st.gold-=200; st.enMax+=20; st.en=st.enMax; st.msg='You can work longer now.'; }
      else if(it.k==='sell'){
        var g=0, k; for(k in st.basket){ if(st.basket[k]>0){ g+=crop(+k).sell*st.basket[k]; st.basket[k]=0; } }
        st.gold+=g; st.stats.goldE+=g; st.msg=g?('Sold harvest for '+g+' gold.'):'Basket empty.';
      }
      st.dirty=1; return;
    }
    if(st.ui==='cook'){
      var r=it.rec, veg=0, fruit=0, ids=basketList(st), take=[], j, cr;
      for(j=0;j<ids.length;j++){ cr=crop(ids[j]); while(st.basket[ids[j]]>0 && ((cr.k==='veg'&&veg<r.veg)||(cr.k==='fruit'&&fruit<r.fruit))){ st.basket[ids[j]]--; take.push(ids[j]); if(cr.k==='veg') veg++; else fruit++; } }
      if(veg<r.veg||fruit<r.fruit){ take.forEach(function(id){ addBasket(st,id,1); }); st.msg='Need more produce for '+r.n+'.'; return; }
      st.en=Math.min(st.enMax, st.en+r.en); st.gold+=r.gold; st.stats.goldE+=r.gold; st.stats.cook++; st.msg='Cooked '+r.n+'.'; st.dirty=1; C.FX&&C.FX('zoop',.3); quests(st,C);
    }
  }

  function drawPlant(g,p,cx,cy,s,now){
    if(p.st===5){ g.strokeStyle='rgba(90,140,80,.7)'; g.lineWidth=1; g.beginPath(); g.moveTo(cx,cy+s*.2); g.quadraticCurveTo(cx-s*.2,cy,cx-s*.1,cy-s*.25); g.moveTo(cx,cy+s*.2); g.quadraticCurveTo(cx+s*.22,cy,cx+s*.12,cy-s*.2); g.stroke(); return; }
    if(p.st<2) return;
    var cr=crop(p.cid), col=p.st===4?'#6a5340':cr.col, ripe=p.st===3;
    g.fillStyle='#4a6a38'; g.fillRect(cx-1.2, cy-s*.18, 2.4, s*.28);
    g.fillStyle=col; g.shadowColor=ripe?col:'transparent'; g.shadowBlur=ripe?12:0;
    var rad=(s*.12)+(p.age/(cr.days||1))*s*.16+(ripe?s*.06:0);
    g.beginPath(); g.arc(cx, cy-s*.22-Math.sin(now*3+cx)* (ripe?1.5:0), rad, 0, Math.PI*2); g.fill();
    if(cr.k==='fruit'&&p.st>=2){ g.beginPath(); g.arc(cx+rad*.7, cy-s*.16, rad*.45, 0, Math.PI*2); g.fill(); }
    g.shadowBlur=0;
    if(p.w){ g.fillStyle='rgba(90,200,255,.55)'; g.beginPath(); g.ellipse(cx,cy+s*.22,s*.18,s*.06,0,0,Math.PI*2); g.fill(); }
    if(p.fert){ g.fillStyle='#ffc44d'; g.fillRect(cx+s*.18,cy+s*.1,3,3); }
  }

  function nu(C){
    var st=hydrate((C.farmLoad&&C.farmLoad())||{});
    st.stars=stars(70); st.ui='farm'; st.tool='hoe'; st.scroll=0; st.sleepT=0; st.dirty=0; st.lastTile=-1; st.holdAcc=0;
    if(!st.msg) st.msg='Hoe · seed · water · sleep. 100 night crops live here.';
    return st;
  }

  function step(C,st){
    var g=C.g, W=C.W, H=C.H, now=C.now, grd=gridOf(C), se=seasonOf(st.day);
    if(!st.stars) st.stars=stars(70);

    if(st.sleepT>0){ st.sleepT-=C.dt; if(st.sleepT<=0){ tickNight(st,C); persist(C,st); } }

    if(C.keys['1']) st.tool='hoe'; if(C.keys['2']) st.tool='seed'; if(C.keys['3']) st.tool='water';
    if(C.press&&C.press.up&&st.ui==='farm') { /* ignore */ }

    var list, rowH=44, vis;
    if(st.ui!=='farm'){
      if(C.ptr.swipe==='up') st.scroll=Math.max(0,st.scroll-3);
      if(C.ptr.swipe==='down') st.scroll+=3;
      if(C.ptr.tap){
        var ty=C.ptr.y;
        if(ty<48){ st.ui='farm'; }
        else {
          list=overlayList(st); rowH=46; vis=Math.floor((H-90)/rowH);
          var idx=Math.floor((ty-52)/rowH)+st.scroll;
          if(idx>=0&&idx<list.length) tapOverlay(st,C,idx);
        }
      }
    } else if(C.ptr.tap){
      var ti=toolAt(C,C.ptr.x,C.ptr.y);
      if(ti>=0){
        var tool=TOOLS[ti];
        if(tool.id==='bag'||tool.id==='shop'||tool.id==='cook'||tool.id==='book'){ st.ui=tool.id; st.scroll=0; }
        else if(tool.id==='sleep'){ st.sleepT=.55; st.msg='Night falls…'; C.FX&&C.FX('warp',.4); }
        else if(tool.id==='tea'){ if(st.teaN>0){ st.teaN--; st.en=Math.min(st.enMax,st.en+40); st.msg='Tea. Energy '+st.en+'.'; st.dirty=1; } else st.msg='Buy tea in the shop.'; }
        else { st.tool=tool.id; st.msg=tool.n+(tool.id==='seed'?(' · '+crop(st.seedSel).n):''); }
      } else {
        var i=tileAt(st,C,C.ptr.x,C.ptr.y,grd);
        apply(st,C,i,false);
      }
    } else if(C.ptr.on && (st.tool==='water'||st.tool==='hoe'||st.tool==='cut')){
      var j=tileAt(st,C,C.ptr.x,C.ptr.y,grd);
      if(j!==st.lastTile){ st.lastTile=j; apply(st,C,j,true); }
    } else st.lastTile=-1;

    if(st.dirty) persist(C,st);

    /* draw */
    g.fillStyle='#071018'; g.fillRect(0,0,W,H);
    var i,s;
    for(i=0;i<st.stars.length;i++){ s=st.stars[i]; g.fillStyle='rgba(210,190,255,'+(0.2+s.z*.45)+')'; g.fillRect(((s.x*W*2+now*3)%W), ((s.y*H)%H), 1.3*s.z, 1.3*s.z); }
    if(st.weather==='moonrain'){ g.fillStyle='rgba(120,180,255,.08)'; g.fillRect(0,0,W,H); for(i=0;i<18;i++){ g.fillStyle='rgba(180,220,255,.35)'; g.fillRect((now*80+i*73)%W, (now*120+i*40)%H, 1, 8); } }
    if(st.weather==='frost'){ g.fillStyle='rgba(180,210,255,.07)'; g.fillRect(0,0,W,H); }

    g.fillStyle='#eef1ff'; g.font='600 13px Inter,sans-serif'; g.textAlign='left'; g.textBaseline='top';
    g.fillText('Day '+st.day+' · '+SEASONS[se], 12, 10);
    g.textAlign='right';
    g.fillStyle='#ffd27a'; g.fillText(st.gold+'g', W-12, 10);
    g.fillStyle='#2ee6ff'; g.fillText(st.en+'/'+st.enMax+' en', W-12, 28);
    g.textAlign='center'; g.fillStyle=SCOL[se]; g.font='600 12px Inter,sans-serif';
    g.fillText(st.weather==='clear'?'still':st.weather, W/2, 10);
    if(st.scare) g.fillText('scarecrow', W/2, 26);
    if(st.green) { g.fillStyle='#2ee6ff'; g.fillText('greenhouse', W/2, 40); }

    if(st.ui==='farm'){
      var p, c, r, x, y, ts=grd.s;
      for(i=0;i<st.plots.length;i++){
        p=st.plots[i]; c=i%N; r=(i/N)|0; x=grd.x+c*ts; y=grd.y+r*ts;
        g.fillStyle=p.st===0?'#152018':p.st===1||p.st===2||p.st===3||p.st===4?'#2a2118':'#1a2418';
        rr(g,x+2,y+2,ts-4,ts-4,5); g.fill();
        g.strokeStyle='rgba(80,140,100,.22)'; g.stroke();
        drawPlant(g,p,x+ts/2,y+ts/2,ts,now);
      }
      var tb=H-108;
      g.fillStyle='rgba(6,10,20,.82)'; g.fillRect(0,tb,W,108);
      for(i=0;i<TOOLS.length;i++){
        var col=i%6, row=(i/6)|0, bx=col*(W/6), by=tb+row*54, on=st.tool===TOOLS[i].id;
        g.fillStyle=on?'rgba(255,107,214,.22)':'transparent';
        rr(g,bx+4,by+6,W/6-8,42,10); g.fill();
        g.fillStyle=on?'#ff6bd6':'#cfd6ff'; g.font='600 11px Inter,sans-serif'; g.textAlign='center'; g.textBaseline='middle';
        g.fillText(TOOLS[i].n, bx+W/12, by+27);
      }
      g.textAlign='left'; g.textBaseline='alphabetic';
    } else {
      g.fillStyle='rgba(6,10,20,.88)'; g.fillRect(0,0,W,H);
      g.fillStyle='#eef1ff'; g.font='700 16px Inter,sans-serif'; g.textAlign='center';
      g.fillText(st.ui==='bag'?'Seed bag':st.ui==='shop'?'Night market':st.ui==='cook'?'Kitchen':'Almanac of 100', W/2, 28);
      g.font='600 11px Inter,sans-serif'; g.fillStyle='#8b93b8'; g.fillText('Tap the top to close · swipe to scroll', W/2, 44);
      list=overlayList(st); rowH=46; vis=Math.max(1,Math.floor((H-90)/rowH));
      st.scroll=clamp(st.scroll,0,Math.max(0,list.length-vis));
      for(i=0;i<vis;i++){
        var it=list[i+st.scroll]; if(!it) break;
        y=52+i*rowH;
        g.fillStyle='rgba(255,255,255,.04)'; rr(g,12,y,W-24,rowH-6,10); g.fill();
        g.fillStyle=it.col; g.beginPath(); g.arc(28,y+rowH/2-3,6,0,Math.PI*2); g.fill();
        g.fillStyle='#eef1ff'; g.font='600 13px Inter,sans-serif'; g.textAlign='left'; g.textBaseline='top';
        g.fillText(it.n, 44, y+8);
        g.fillStyle='#8b93b8'; g.font='11px Inter,sans-serif'; g.fillText(it.sub, 44, y+24);
      }
    }

    if(st.sleepT>0){ g.fillStyle='rgba(4,6,16,'+(1-st.sleepT/.55)+')'; g.fillRect(0,0,W,H); g.fillStyle='#eef1ff'; g.font='700 22px Inter,sans-serif'; g.textAlign='center'; g.fillText('Night falls', W/2, H/2); }

    var hudL='Night garden · '+crop(st.seedSel).n+' · feed '+st.fertN+' · tea '+st.teaN;
    C.hud('<span>'+hudL+'</span><span>'+(st.msg||'')+' · '+C.tiltBtn+'</span>');
    return st;
  }

  function attach(){ if(window.MUArcade&&window.MUArcade.impl) window.MUArcade.impl.garden={nu:nu,step:step}; }
  attach();
  window.MUGarden={crops:CROPS,seasons:SEASONS,recipes:RECIPES};
})();
