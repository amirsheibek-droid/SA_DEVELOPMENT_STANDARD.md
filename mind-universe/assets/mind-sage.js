/* Sage voice — English translations, spoken on this device.
   The visitor chooses a wise man or a woman. Uses the voices already on the phone. */
(function(){
  var gender='man', ready=[], last='';
  function load(){
    try{
      ready=speechSynthesis.getVoices()||[];
      if(!ready.length) speechSynthesis.onvoiceschanged=function(){ ready=speechSynthesis.getVoices()||[]; };
    }catch(e){ ready=[]; }
  }
  load();
  function pick(){
    var list=ready.length?ready:(speechSynthesis.getVoices?speechSynthesis.getVoices():[]);
    var en=list.filter(function(v){ return /en(-|_|$)/i.test(v.lang||''); });
    var pool=en.length?en:list;
    function score(v){
      var n=(v.name||'')+' '+(v.voiceURI||''), s=0;
      if(/en-GB|UK English|Daniel|Arthur|Malcolm|Oliver|Google UK/i.test(n)) s+=4;
      if(gender==='man'){
        if(/male|man|daniel|arthur|alex|fred|david|george|james|thomas|rishi/i.test(n)) s+=8;
        if(/female|woman|samantha|karen|moira|tessa|fiona|siri|zira|susan/i.test(n)) s-=6;
      } else {
        if(/female|woman|samantha|karen|moira|tessa|fiona|susan|zira|serena|martha/i.test(n)) s+=8;
        if(/male|man|daniel|arthur|alex|fred|david/i.test(n)) s-=6;
      }
      return s;
    }
    var best=null, bs=-99;
    pool.forEach(function(v){ var n=score(v); if(n>bs){ bs=n; best=v; } });
    return best||pool[0]||null;
  }
  function speak(text, src){
    if(!text) return;
    try{
      speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(text+(src?'. '+src:''));
      u.rate=gender==='man'?0.86:0.92;
      u.pitch=gender==='man'?0.72:1.05;
      u.lang='en-GB';
      var v=pick(); if(v) u.voice=v;
      last=text; speechSynthesis.speak(u);
    }catch(e){}
  }
  function stop(){ try{ speechSynthesis.cancel(); }catch(e){} }
  function setGender(g){ gender=g==='woman'?'woman':'man'; try{ if(window.MUSageSave) MUSageSave(gender); }catch(e){} }
  function todayLine(){
    var t=window.H_TODAY?H_TODAY():null; if(!t) return '';
    return t.en;
  }
  window.MUSage={
    speak:speak, stop:stop, setGender:setGender, gender:function(){ return gender; },
    speakToday:function(){ var t=window.H_TODAY&&H_TODAY(); if(!t) return; speak(t.en, t.src); return t; },
    speakItem:function(x){ if(!x) return; speak(x.en, x.src); },
    today:function(){ return window.H_TODAY?H_TODAY():null; },
    todayLine:todayLine,
    boot:function(g){ if(g) setGender(g); load(); }
  };
})();
