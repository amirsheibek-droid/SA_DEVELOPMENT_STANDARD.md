/* One thousand named moods, each with an emoji. Built here so the picker stays on-device. */
(function(){
  var CORE=[
    ['Joyful','😄',5,'#ffc44d','joy'],['Happy','😊',5,'#ffc44d','joy'],['Cheerful','😁',5,'#ffc44d','joy'],['Delighted','🤩',5,'#ffc44d','joy'],
    ['Grateful','🙏',5,'#19f0b0','faith'],['Thankful','🤍',5,'#19f0b0','faith'],['Blessed','✨',5,'#ffc44d','faith'],['Peaceful','🕊️',5,'#2ee6ff','peace'],
    ['Calm','😌',4,'#2ee6ff','peace'],['Serene','🌙',5,'#2ee6ff','peace'],['Content','🙂',4,'#19f0b0','peace'],['Hopeful','🌅',4,'#ff4fa8','hope'],
    ['Sakinah','🕌',5,'#19f0b0','faith'],['Tawakkul','🤲',5,'#ffc44d','faith'],['Iman','💎',5,'#4f7dff','faith'],['Tawbah','💧',3,'#7fe0c3','faith'],
    ['Humble','🙇',3,'#cfd6ff','faith'],['Awed','🌌',5,'#a45cff','faith'],['Devoted','📿',5,'#ffc44d','faith'],['Present','🟢',4,'#19f0b0','peace'],
    ['Tired','😮‍💨',2,'#a45cff','low'],['Exhausted','🥱',1,'#a45cff','low'],['Sleepy','😴',2,'#a45cff','low'],['Drained','🪫',1,'#6b7399','low'],
    ['Anxious','😰',2,'#ff8a3d','worry'],['Worried','😟',2,'#ff8a3d','worry'],['Uneasy','😬',2,'#ff8a3d','worry'],['Restless','🌀',2,'#ff8a3d','worry'],
    ['Low','😔',1,'#4f7dff','low'],['Sad','😢',1,'#4f7dff','low'],['Heavy','🪨',1,'#4f7dff','low'],['Empty','🕳️',1,'#6b7399','low'],
    ['Angry','😠',2,'#ff4f6d','fire'],['Irritated','😒',2,'#ff8a3d','fire'],['Frustrated','😤',2,'#ff8a3d','fire'],['Patient','⏳',4,'#ffc44d','peace'],
    ['Focused','🎯',4,'#2ee6ff','mind'],['Clear','💎',4,'#2ee6ff','mind'],['Confused','😕',2,'#a45cff','mind'],['Curious','🧐',4,'#2ee6ff','mind'],
    ['Loved','🥰',5,'#ff4fa8','heart'],['Lonely','🌑',1,'#6b7399','heart'],['Kind','🌷',5,'#ff4fa8','heart'],['Forgiving','🕊️',4,'#7fe0c3','faith'],
    ['Motivated','🚀',5,'#ff8a3d','fire'],['Proud','🦁',4,'#ffc44d','joy'],['Shy','😳',3,'#ff4fa8','heart'],['Brave','🛡️',4,'#4f7dff','fire'],
    ['Playful','😜',5,'#ff4fa8','joy'],['Silly','🤪',4,'#ffc44d','joy'],['Creative','🎨',4,'#a45cff','mind'],['Inspired','💡',5,'#ffc44d','mind'],
    ['Nostalgic','📻',3,'#c9a6ff','heart'],['Homesick','🏠',2,'#ff8a3d','heart'],['Safe','🏡',5,'#19f0b0','peace'],['Free','🌬️',5,'#2ee6ff','peace'],
    ['Guilty','😣',2,'#a45cff','low'],['Ashamed','🫣',1,'#6b7399','low'],['Regretful','🥀',2,'#4f7dff','low'],['Relieved','😮‍💨',4,'#19f0b0','peace'],
    ['Overwhelmed','🌊',2,'#4f7dff','worry'],['Scattered','💫',2,'#a45cff','mind'],['Grounded','🌳',4,'#19f0b0','peace'],['Centered','⏺️',4,'#2ee6ff','peace'],
    ['Eager','🤩',4,'#ff8a3d','fire'],['Bored','😑',2,'#6b7399','low'],['Apathetic','😐',2,'#6b7399','low'],['Alive','🌞',5,'#ffc44d','joy'],
    ['Tender','💗',4,'#ff4fa8','heart'],['Soft','🫧',4,'#cfd6ff','peace'],['Sharp','🗡️',3,'#ff4f6d','fire'],['Gentle','🌸',4,'#ff4fa8','heart'],
    ['Determined','💪',4,'#ff8a3d','fire'],['Steady','⚖️',4,'#2ee6ff','peace'],['Wobbly','🎢',2,'#ff8a3d','worry'],['Strong','🏔️',4,'#4f7dff','fire'],
    ['Lighthearted','🎈',5,'#ffc44d','joy'],['Heavy-hearted','💔',1,'#4f7dff','heart'],['Open','📖',4,'#7fe0c3','mind'],['Guarded','🔒',2,'#6b7399','worry'],
    ['Prayerful','🕋',5,'#ffc44d','faith'],['Remembering','📿',4,'#19f0b0','faith'],['Yearning','🌙',3,'#a45cff','faith'],['Trusting','🤝',5,'#19f0b0','faith']
  ];
  var SHADE=['quietly','deeply','gently','softly','suddenly','slowly','fully','almost','quietly still','openly','tenderly','fiercely'];
  var EXTRA=[
    ['At peace','☮️'],['In awe of God','🌌'],['Missing salah','🕌'],['After prayer','🤲'],['Before fajr','🌅'],
    ['Jummah glow','🕌'],['Qur’an afterglow','📗'],['Tears of khushu','😢'],['Heart soft','💗'],['Heart hard','🪨'],
    ['Ready to repent','💧'],['Afraid of the dunya','🌍'],['Longing for Jannah','🏡'],['Missing someone','💭'],
    ['Family warmth','👨‍👩‍👧'],['After a kind word','🌷'],['After a harsh word','🌧️'],['Need a walk','🚶'],
    ['Need silence','🤫'],['Need people','👥'],['Need God','🕋'],['Need sleep','🛌'],['Need water','💧'],
    ['Need to write','✍️'],['Need to cry','😭'],['Need to laugh','😂'],['Need to forgive','🕊️'],
    ['Need to be forgiven','🤍'],['Stuck','🧱'],['Unstuck','🔓'],['Starting again','🌱'],['Closing a door','🚪'],
    ['New beginning','🌅'],['Old wound','🩹'],['Healing','🌿'],['Waiting','⏳'],['Receiving','🎁'],
    ['Giving','🤲'],['Listening','👂'],['Speaking truth','🗣️'],['Holding back','🤐'],['Letting go','🍃']
  ];
  var EMO=CORE.map(function(x){ return x[1]; }).concat(EXTRA.map(function(x){ return x[1]; })).concat(
    '😀😃😄😁😆😅🤣😂🙂😉😇🥰😍🤩😘😗😚😋😛😜🤪🤨🧐🤓😎🥳😏😒😞😔😟😕🙁☹️😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😱😨😰😥😓🤗🤔🤭🤫🤥😶😑😬🙄😯😦😧😮😲😴🤤😪😵🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺💀👻👽🤖🎃'.split(/(?:)/u).filter(Boolean)
  );
  function hexOf(v){ return v>=5?'#ffc44d':v===4?'#2ee6ff':v===3?'#a45cff':v===2?'#ff8a3d':'#4f7dff'; }
  var seen={}, out=[], i, j, n, e, v, c, fam;
  function add(name, emoji, val, col, family){
    if(!name||seen[name]||out.length>=1000) return;
    seen[name]=1;
    out.push({n:name,e:emoji||'🙂',v:val==null?3:val,c:col||hexOf(val==null?3:val),fam:family||'mind'});
  }
  CORE.forEach(function(x){ add(x[0],x[1],x[2],x[3],x[4]); });
  EXTRA.forEach(function(x,i){ add(x[0],x[1], i%5===0?5:3, hexOf(i%5===0?5:3), i%2?'faith':'heart'); });
  for(i=0;i<CORE.length && out.length<1000;i++){
    for(j=0;j<SHADE.length && out.length<1000;j++){
      n=SHADE[j]+' '+CORE[i][0].toLowerCase();
      e=EMO[(i*13+j*7)%EMO.length]||CORE[i][1];
      add(n, e, CORE[i][2], CORE[i][3], CORE[i][4]);
    }
  }
  var fillers=['glowing','quiet','warm','cool','bright','dim','steady','fluttering','settled','raw','honest','hidden'];
  var nouns=['heart','mind','soul','chest','morning','evening','night','day'];
  for(i=0;i<fillers.length && out.length<1000;i++){
    for(j=0;j<nouns.length && out.length<1000;j++){
      add(fillers[i]+' '+nouns[j], EMO[(i*8+j)%EMO.length], 3+((i+j)%3)-1, hexOf(3), 'peace');
    }
  }
  var k=0; while(out.length<1000){ add('Mood '+(out.length+1), EMO[k++%EMO.length], 3, hexOf(3), 'mind'); }
  window.H_MOODS=out;
  window.H_MOOD_FAMS=['faith','peace','joy','hope','heart','mind','fire','worry','low'];
})();
