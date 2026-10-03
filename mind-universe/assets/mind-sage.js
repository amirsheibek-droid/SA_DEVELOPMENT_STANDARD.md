/* Sage voice — same recorded Jess (Gemini Aoede) as Neuron Pulse.
   First listen records the line once. Every later listen plays that file. */
(function(){
  var gender='woman', last='', audio=null, tok=0;
  var TTS='https://dyurykdiuwbmadjrljzh.supabase.co/functions/v1/site-jess-tts';
  var BUCKET='https://dyurykdiuwbmadjrljzh.supabase.co/storage/v1/object/public/tmp-site-audio/jess/';

  function hashText(text,done){
    try{
      crypto.subtle.digest('SHA-256', new TextEncoder().encode('jess-aoede-v1|'+String(text||'').trim())).then(function(buf){
        done(Array.from(new Uint8Array(buf)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join(''));
      }).catch(function(){ done(''); });
    }catch(e){ done(''); }
  }
  function fallback(text){
    if(!text||!window.speechSynthesis) return;
    try{ speechSynthesis.cancel(); }catch(e){}
    var u=new SpeechSynthesisUtterance(text);
    u.lang='en-GB'; u.rate=0.92; u.pitch=1.02;
    try{
      var vs=speechSynthesis.getVoices()||[];
      var v=vs.filter(function(x){ return /en-GB|Google UK English Female|Serena|Samantha/i.test((x.name||'')+' '+(x.lang||'')); })[0];
      if(v) u.voice=v;
    }catch(e){}
    speechSynthesis.speak(u);
  }
  function playUrl(url,text,mine){
    try{ if(audio){ audio.pause(); audio=null; } }catch(e){}
    audio=new Audio(url);
    audio.onerror=function(){ if(tok===mine) fallback(text); };
    var p=audio.play(); if(p&&p.catch) p.catch(function(){ if(tok===mine) fallback(text); });
  }
  function record(text,mine){
    fetch(TTS,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:text})})
      .then(function(r){ return r.json(); })
      .then(function(j){ if(tok!==mine) return; if(j&&j.url) playUrl(j.url,text,mine); else fallback(text); })
      .catch(function(){ if(tok===mine) fallback(text); });
  }
  function speak(text, src){
    var line=(text||'')+(src?'. '+src:'');
    if(!line) return;
    last=text; var mine=++tok;
    try{ speechSynthesis.cancel(); }catch(e){}
    hashText(line,function(h){
      if(tok!==mine) return;
      if(!h){ record(line,mine); return; }
      var url=BUCKET+h+'.wav';
      fetch(url,{method:'HEAD'}).then(function(r){
        if(tok!==mine) return;
        if(r.ok) playUrl(url,line,mine);
        else record(line,mine);
      }).catch(function(){ if(tok===mine) record(line,mine); });
    });
  }
  function stop(){
    tok++;
    try{ if(audio){ audio.pause(); audio=null; } }catch(e){}
    try{ speechSynthesis.cancel(); }catch(e){}
  }
  function setGender(){ gender='woman'; try{ if(window.MUSageSave) MUSageSave(gender); }catch(e){} }
  window.MUSage={
    speak:speak, stop:stop, setGender:setGender, gender:function(){ return gender; },
    speakToday:function(){ var t=window.H_TODAY&&H_TODAY(); if(!t) return; speak(t.en, t.src); return t; },
    speakItem:function(x){ if(!x) return; speak(x.en, x.src); },
    today:function(){ return window.H_TODAY?H_TODAY():null; },
    todayLine:function(){ var t=window.H_TODAY?H_TODAY():null; return t?t.en:''; },
    boot:function(){ setGender(); }
  };
})();
