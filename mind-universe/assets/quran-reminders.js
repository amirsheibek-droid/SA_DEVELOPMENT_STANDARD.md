/* Qur’an ayahs as daily reminders. Plain English renderings, with surah:ayah. */
window.H_QURAN=[
  {id:'q1', title:'Hearts find rest', ar:'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', en:'Surely, in the remembrance of God do hearts find rest.', src:'Qur’an 13:28'},
  {id:'q2', title:'With hardship, ease', ar:'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', en:'For indeed, with hardship comes ease.', src:'Qur’an 94:5'},
  {id:'q3', title:'God does not burden a soul', ar:'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', en:'God does not burden a soul beyond what it can bear.', src:'Qur’an 2:286'},
  {id:'q4', title:'I am near', ar:'فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ', en:'I am near. I answer the call of the caller when they call on Me.', src:'Qur’an 2:186'},
  {id:'q5', title:'Do not despair', ar:'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ', en:'Do not despair of the mercy of God.', src:'Qur’an 39:53'},
  {id:'q6', title:'Remember Me', ar:'فَاذْكُرُونِي أَذْكُرْكُمْ', en:'Remember Me, and I will remember you.', src:'Qur’an 2:152'},
  {id:'q7', title:'Whoever relies on God', ar:'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', en:'Whoever puts their trust in God — He is enough for them.', src:'Qur’an 65:3'},
  {id:'q8', title:'Do not lose heart', ar:'وَلَا تَهِنُوا وَلَا تَحْزَنُوا', en:'Do not lose heart, and do not grieve.', src:'Qur’an 3:139'},
  {id:'q9', title:'Patience and prayer', ar:'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', en:'Seek help through patience and prayer.', src:'Qur’an 2:153'},
  {id:'q10', title:'God is sufficient', ar:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', en:'God is enough for us, and He is the best disposer of affairs.', src:'Qur’an 3:173'},
  {id:'q11', title:'He is with you', ar:'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ', en:'He is with you wherever you are.', src:'Qur’an 57:4'},
  {id:'q12', title:'A healing and a mercy', ar:'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ', en:'We send down of the Qur’an that which is a healing and a mercy.', src:'Qur’an 17:82'},
  {id:'q13', title:'Repel with what is better', ar:'ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ', en:'Repel evil with that which is better.', src:'Qur’an 41:34'},
  {id:'q14', title:'You we worship', ar:'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', en:'You alone we worship, and You alone we ask for help.', src:'Qur’an 1:5'},
  {id:'q15', title:'There is no god but You', ar:'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ', en:'There is no god but You. Glory be to You.', src:'Qur’an 21:87'},
  {id:'q16', title:'Whoever does good', ar:'مَنْ عَمِلَ صَالِحًا مِّن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌ', en:'Whoever does good, male or female, and is a believer — they will live a good life.', src:'Qur’an 16:97'},
  {id:'q17', title:'Turn to your Lord', ar:'وَإِلَىٰ رَبِّكَ فَارْغَب', en:'And to your Lord turn your longing.', src:'Qur’an 94:8'},
  {id:'q18', title:'Nations and tribes', ar:'إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ', en:'The most honoured of you with God is the most mindful of Him.', src:'Qur’an 49:13'},
  {id:'q19', title:'God is with the patient', ar:'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', en:'God is with those who are patient.', src:'Qur’an 2:153'},
  {id:'q20', title:'A light and a book', ar:'قَدْ جَاءَكُم مِّنَ اللَّهِ نُورٌ وَكِتَابٌ مُّبِينٌ', en:'There has come to you from God a light, and a clear Book.', src:'Qur’an 5:15'}
];
window.H_TODAY=function(){
  var q=window.H_QURAN||[], h=window.H_HADITH||[];
  var all=q.concat(h);
  if(!all.length) return {kind:'quran', title:'Peace', en:'In the remembrance of God do hearts find rest.', src:'Qur’an 13:28', ar:''};
  var d=new Date(); var i=(d.getFullYear()*366+d.getMonth()*31+d.getDate())%all.length;
  var x=all[i];
  return {kind:x.src&&String(x.src).indexOf('Qur')===0?'quran':'hadith', title:x.title, en:x.en, ar:x.ar||'', src:x.src, id:x.id};
};
