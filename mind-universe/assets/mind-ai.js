/* Mind helper — does the work people usually complain these apps never do.
   One sentence: log a mood, write a page, add a to-do, run a number, search the journal. */
(function(){
  var api=null;
  function set(x){ api=x; }

  function calc(expr){
    var s=String(expr||'').replace(/[^0-9+\-*/().,%^\s]/g,'');
    if(!s||s.length>80) return null;
    s=s.replace(/\^/g,'**').replace(/%/g,'/100');
    try{ var n=Function('"use strict";return ('+s+')')(); if(typeof n==='number'&&isFinite(n)) return Math.round(n*1000)/1000; }catch(e){}
    return null;
  }
  function nearestMood(q){
    q=String(q||'').toLowerCase();
    var list=(window.H_MOODS||[]), best=null, bs=0;
    for(var i=0;i<list.length;i++){
      var n=list[i].n.toLowerCase();
      if(n===q) return list[i];
      if(q.indexOf(n)>=0 || n.indexOf(q)>=0){ var sc=n.length; if(sc>bs){ bs=sc; best=list[i]; } }
    }
    return best;
  }
  function localIntent(text){
    var t=text.trim(), low=t.toLowerCase(), acts=[], say='';
    var m=low.match(/^(?:i(?:['’]m| am)|feeling|feel|log(?: my)? mood|mood[:\s]+)(.+)/);
    if(m){
      var rest=m[1].replace(/^like\s+/,'').trim();
      var mood=nearestMood(rest.split(/[,.!\-]/)[0])||nearestMood(rest);
      if(mood){ acts.push({op:'mood', m:mood.n, note:rest}); say='Logged '+mood.e+' '+mood.n+'.'; }
    }
    var j=t.match(/^(?:write|journal|diary|note|page)[:\s]+([\s\S]+)/i);
    if(j){ acts.push({op:'note', title:'Journal', text:j[1].trim()}); say='Saved a page in your journal.'; }
    var td=t.match(/^(?:todo|to-do|remind me to|i need to|add task)[:\s]+(.+)/i);
    if(td){ acts.push({op:'todo', text:td[1].trim()}); say='Added to your to-dos.'; }
    var g=t.match(/^(?:goal|my goal is|i want to)[:\s]+(.+)/i);
    if(g){ acts.push({op:'goal', title:g[1].trim(), why:''}); say='Goal is in the mind.'; }
    var go=low.match(/^(?:open|go to|take me to|show)\s+(reminders?|mood|diary|journal|goals?|plan|todo|to-dos?|listen|progress|home|ai|helper)/);
    if(go){
      var map={reminder:'sage',reminders:'sage',mood:'mood',diary:'diary',journal:'diary',goal:'goals',goals:'goals',plan:'plan',todo:'todo','to-do':'todo','to-dos':'todo',listen:'listen',progress:'progress',home:'me',ai:'ai',helper:'ai'};
      acts.push({op:'go', id:map[go[1]]||'me'}); say='Opening that neuron.';
    }
    if(/remind|hadith|ayah|qur[a']?n|speak/.test(low) && /today|reminder|hadith|ayah/.test(low)){ acts.push({op:'speak'}); say='Speaking today’s reminder.'; }
    if(/search|find|what did i write|look up/.test(low)){
      var q=t.replace(/^(search|find|look up|what did i write about)\s+/i,'').trim();
      acts.push({op:'search', q:q}); say='Searching your journal.';
    }
    if(/how (am i|have i)|this week|streak|average mood|progress|stats|how many/.test(low)){ acts.push({op:'stats'}); }
    var math=t.match(/(?:calculate|what(?:'| i)?s|whats|math|how much is)\s+(.+)/i);
    if(math){ var n=calc(math[1]); if(n!=null){ acts.push({op:'calc', n:n, expr:math[1]}); say=math[1]+' = '+n; } }
    var bare=calc(t);
    if(!acts.length && bare!=null){ acts.push({op:'calc', n:bare, expr:t}); say=t+' = '+bare; }
    if(!acts.length && t.length>40 && !/\?$/.test(t)){ acts.push({op:'note', title:'Quick page', text:t}); say='I wrote that into your journal so you did not have to open Diary.'; }
    return {say:say, acts:acts};
  }

  function freeAsk(text, ctx, cb){
    var prompt='You help a private Islamic mind-journal app. Reply with ONLY compact JSON: {"say":"short kind English","acts":[{"op":"mood|note|todo|goal|speak|stats|go|search|none","m":"","note":"","title":"","text":"","id":"","q":""}]}. User said: '+text.slice(0,280)+'. Context: '+ctx.slice(0,220);
    var url='https://text.pollinations.ai/'+encodeURIComponent(prompt);
    fetch(url).then(function(r){ return r.text(); }).then(function(raw){
      var j=null, s=String(raw||'');
      var a=s.indexOf('{'), b=s.lastIndexOf('}');
      if(a>=0&&b>a){ try{ j=JSON.parse(s.slice(a,b+1)); }catch(e){} }
      cb(j||{say:s.slice(0,280), acts:[]});
    }).catch(function(){ cb(null); });
  }

  function handle(text, done){
    if(!api) return done({say:'Helper is still waking.'});
    var local=localIntent(text);
    if(local.acts.length){ var out=api.run(local.acts); done({say:local.say||out.say, extra:out.extra}); return; }
    freeAsk(text, api.ctx(), function(j){
      if(!j){ done({say:'I can log a mood, write a page, add a to-do, search your journal, or do a sum. Try: “I’m tired after work”.'}); return; }
      var out=api.run(j.acts||[]);
      done({say:j.say||out.say, extra:out.extra});
    });
  }

  window.MUAI={set:set, handle:handle, calc:calc, nearestMood:nearestMood};
})();
