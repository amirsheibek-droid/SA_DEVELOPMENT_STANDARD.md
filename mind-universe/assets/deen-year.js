/* 365 hidden lights — one for each day of the year — Qur’an and authentic hadith.
   Built from the surahs, the ayah bank, and the hadith already in the mind. */
(function(){
  var SURAHS=[
    [1,'Al-Fatihah','الفاتحة'],[2,'Al-Baqarah','البقرة'],[3,'Aal Imran','آل عمران'],[4,'An-Nisa','النساء'],[5,'Al-Maidah','المائدة'],
    [6,'Al-Anam','الأنعام'],[7,'Al-Araf','الأعراف'],[8,'Al-Anfal','الأنفال'],[9,'At-Tawbah','التوبة'],[10,'Yunus','يونس'],
    [11,'Hud','هود'],[12,'Yusuf','يوسف'],[13,'Ar-Rad','الرعد'],[14,'Ibrahim','إبراهيم'],[15,'Al-Hijr','الحجر'],
    [16,'An-Nahl','النحل'],[17,'Al-Isra','الإسراء'],[18,'Al-Kahf','الكهف'],[19,'Maryam','مريم'],[20,'Ta-Ha','طه'],
    [21,'Al-Anbiya','الأنبياء'],[22,'Al-Hajj','الحج'],[23,'Al-Muminun','المؤمنون'],[24,'An-Nur','النور'],[25,'Al-Furqan','الفرقان'],
    [26,'Ash-Shuara','الشعراء'],[27,'An-Naml','النمل'],[28,'Al-Qasas','القصص'],[29,'Al-Ankabut','العنكبوت'],[30,'Ar-Rum','الروم'],
    [31,'Luqman','لقمان'],[32,'As-Sajdah','السجدة'],[33,'Al-Ahzab','الأحزاب'],[34,'Saba','سبأ'],[35,'Fatir','فاطر'],
    [36,'Ya-Sin','يس'],[37,'As-Saffat','الصافات'],[38,'Sad','ص'],[39,'Az-Zumar','الزمر'],[40,'Ghafir','غافر'],
    [41,'Fussilat','فصلت'],[42,'Ash-Shura','الشورى'],[43,'Az-Zukhruf','الزخرف'],[44,'Ad-Dukhan','الدخان'],[45,'Al-Jathiyah','الجاثية'],
    [46,'Al-Ahqaf','الأحقاف'],[47,'Muhammad','محمد'],[48,'Al-Fath','الفتح'],[49,'Al-Hujurat','الحجرات'],[50,'Qaf','ق'],
    [51,'Adh-Dhariyat','الذاريات'],[52,'At-Tur','الطور'],[53,'An-Najm','النجم'],[54,'Al-Qamar','القمر'],[55,'Ar-Rahman','الرحمن'],
    [56,'Al-Waqiah','الواقعة'],[57,'Al-Hadid','الحديد'],[58,'Al-Mujadila','المجادلة'],[59,'Al-Hashr','الحشر'],[60,'Al-Mumtahanah','الممتحنة'],
    [61,'As-Saff','الصف'],[62,'Al-Jumuah','الجمعة'],[63,'Al-Munafiqun','المنافقون'],[64,'At-Taghabun','التغابن'],[65,'At-Talaq','الطلاق'],
    [66,'At-Tahrim','التحريم'],[67,'Al-Mulk','الملك'],[68,'Al-Qalam','القلم'],[69,'Al-Haqqah','الحاقة'],[70,'Al-Maarij','المعارج'],
    [71,'Nuh','نوح'],[72,'Al-Jinn','الجن'],[73,'Al-Muzzammil','المزمل'],[74,'Al-Muddaththir','المدثر'],[75,'Al-Qiyamah','القيامة'],
    [76,'Al-Insan','الإنسان'],[77,'Al-Mursalat','المرسلات'],[78,'An-Naba','النبأ'],[79,'An-Naziat','النازعات'],[80,'Abasa','عبس'],
    [81,'At-Takwir','التكوير'],[82,'Al-Infitar','الانفطار'],[83,'Al-Mutaffifin','المطففين'],[84,'Al-Inshiqaq','الانشقاق'],[85,'Al-Buruj','البروج'],
    [86,'At-Tariq','الطارق'],[87,'Al-Ala','الأعلى'],[88,'Al-Ghashiyah','الغاشية'],[89,'Al-Fajr','الفجر'],[90,'Al-Balad','البلد'],
    [91,'Ash-Shams','الشمس'],[92,'Al-Layl','الليل'],[93,'Ad-Duha','الضحى'],[94,'Ash-Sharh','الشرح'],[95,'At-Tin','التين'],
    [96,'Al-Alaq','العلق'],[97,'Al-Qadr','القدر'],[98,'Al-Bayyinah','البينة'],[99,'Az-Zalzalah','الزلزلة'],[100,'Al-Adiyat','العاديات'],
    [101,'Al-Qariah','القارعة'],[102,'At-Takathur','التكاثر'],[103,'Al-Asr','العصر'],[104,'Al-Humazah','الهمزة'],[105,'Al-Fil','الفيل'],
    [106,'Quraysh','قريش'],[107,'Al-Maun','الماعون'],[108,'Al-Kawthar','الكوثر'],[109,'Al-Kafirun','الكافرون'],[110,'An-Nasr','النصر'],
    [111,'Al-Masad','المسد'],[112,'Al-Ikhlas','الإخلاص'],[113,'Al-Falaq','الفلق'],[114,'An-Nas','الناس']
  ];
  window.H_SURAHS=SURAHS.map(function(x){ return {n:x[0], en:x[1], ar:x[2]}; });

  var EXTRA=[
    [2,255,'Ayat al-Kursi','God — there is no god but He, the Ever-Living, the Self-Sustaining.'],
    [2,152,'Remember Me','Remember Me, and I will remember you.'],[2,153,'Patience and prayer','Seek help through patience and prayer. God is with the patient.'],
    [2,186,'I am near','I am near. I answer the call of the caller when they call on Me.'],[2,201,'Good in both worlds','Our Lord, give us good in this world and good in the next.'],
    [2,286,'A soul’s measure','God does not burden a soul beyond what it can bear.'],[3,8,'Do not let hearts slip','Our Lord, do not let our hearts slip after You have guided us.'],
    [3,139,'Do not lose heart','Do not lose heart, and do not grieve.'],[3,159,'By mercy you were gentle','It is by mercy from God that you were gentle with them.'],
    [3,173,'God is sufficient','God is enough for us, and He is the best disposer of affairs.'],[4,36,'Worship God','Worship God, and do not associate anything with Him. Be good to parents.'],
    [4,86,'Return the greeting','When you are greeted, greet with something better, or return it.'],[5,3,'This day I have perfected','This day I have perfected your religion for you, and completed My favour.'],
    [5,8,'Stand for justice','Be people who stand up for God, witnesses to justice.'],[6,162,'My prayer','My prayer, my sacrifice, my living and my dying are for God, Lord of the worlds.'],
    [7,23,'We have wronged ourselves','Our Lord, we have wronged ourselves. If You do not forgive us we will be lost.'],[7,56,'Do not spread corruption','Do not spread corruption on the earth after it has been set right.'],
    [7,199,'Take to pardon','Take to pardon, enjoin what is right, and turn away from the ignorant.'],[8,2,'The believers','The believers are those whose hearts tremble when God is mentioned.'],
    [8,46,'Be patient','Be patient. God is with the patient.'],[9,40,'Do not grieve','Do not grieve. God is with us.'],
    [9,51,'Nothing befalls us','Nothing befalls us except what God has written for us.'],[9,129,'He is enough','God is enough for me. There is no god but He.'],
    [10,57,'A healing','O people, there has come to you an admonition from your Lord, and a healing for what is in the chests.'],[10,62,'No fear','The friends of God — no fear shall be upon them, nor shall they grieve.'],
    [11,88,'My success is only with God','My success is only with God. In Him I trust, and to Him I turn.'],[12,87,'Do not despair of God’s spirit','Do not despair of the spirit of God. Only people who cover the truth despair of it.'],
    [13,11,'A people change','God does not change what is with a people until they change what is with themselves.'],[13,28,'Hearts find rest','Surely, in the remembrance of God do hearts find rest.'],
    [14,7,'If you are grateful','If you are grateful, I will surely increase you.'],[14,41,'Forgive my parents','My Lord, forgive me, my parents, and the believers on the Day the account is raised.'],
    [15,49,'Tell My servants','Tell My servants that I am the Forgiving, the Merciful.'],[16,18,'You cannot count them','If you tried to count the blessings of God, you could not number them.'],
    [16,90,'God commands justice','God commands justice, doing good, and giving to relatives.'],[16,97,'A good life','Whoever does good, male or female, and is a believer — they will live a good life.'],
    [17,23,'Parents','Your Lord has decreed that you worship none but Him, and that you be good to parents.'],[17,24,'Mercy on them','My Lord, have mercy on them as they raised me when I was small.'],
    [17,32,'Do not go near','Do not go near adultery. It is an indecency and an evil path.'],[17,53,'Tell My servants to say what is best','Tell My servants to say that which is best.'],
    [17,70,'We honoured the children of Adam','We have honoured the children of Adam.'],[17,82,'A healing and a mercy','We send down of the Qur’an that which is a healing and a mercy for the believers.'],
    [18,10,'Mercy from Your side','Our Lord, grant us mercy from Yourself, and set our affair right.'],[18,24,'If God wills','And remember your Lord when you forget, and say: Perhaps my Lord will guide me.'],
    [18,46,'Lasting good deeds','Wealth and children are the adornment of this life. Lasting good deeds are better with your Lord.'],[19,4,'My bones are weak','My Lord, my bones have weakened, and my head is lit with grey, and I have never been disappointed in a prayer to You.'],
    [20,25,'Expand my chest','My Lord, expand my chest for me, and make my affair easy for me.'],[20,46,'I am with you','Do not fear. I am with you; I hear and I see.'],
    [20,114,'Increase me','My Lord, increase me in knowledge.'],[21,47,'The scales','We will set up the scales of justice on the Day of Rising. No soul will be wronged at all.'],
    [21,83,'Harm has touched me','Harm has touched me, and You are the most merciful of the merciful.'],[21,87,'There is no god but You','There is no god but You. Glory be to You. I have been of the wrongdoers.'],
    [22,77,'Bow and worship','O you who believe, bow, prostrate, worship your Lord, and do good.'],[23,1,'The believers have succeeded','The believers have succeeded — those who are humble in their prayer.'],
    [23,97,'I seek refuge','My Lord, I seek refuge in You from the whisperings of the satans.'],[24,35,'God is the Light','God is the Light of the heavens and the earth.'],
    [24,30,'Lower the gaze','Tell the believing men to lower their gaze and guard their chastity.'],[25,63,'Walk gently','The servants of the Most Merciful are those who walk on the earth gently.'],
    [25,74,'Coolness of the eyes','Our Lord, gift us from our spouses and our children a coolness of the eyes.'],[26,80,'He heals me','And when I am ill, it is He who heals me.'],
    [26,87,'Do not disgrace me','And do not disgrace me on the Day they are raised.'],[27,19,'Enable me to be grateful','My Lord, enable me to be grateful for Your blessing, and to do good that pleases You.'],
    [27,62,'Who answers the desperate','Who is it that answers the desperate when they call on Him, and removes the harm?'],[28,24,'I am in need','My Lord, I am in need of whatever good You send down to me.'],
    [29,45,'Prayer stops indecency','Prayer stops indecency and wrong. The remembrance of God is greater.'],[29,69,'Those who strive','Those who strive for Us — We will surely guide them to Our paths.'],
    [30,21,'Affection and mercy','He made between you affection and mercy. In that are signs for people who think.'],[31,13,'Do not associate','O my son, do not associate anything with God. Association is a great injustice.'],
    [31,17,'Establish the prayer','O my son, establish the prayer, enjoin what is right, and be patient with what befalls you.'],[32,16,'Their sides leave the beds','Their sides leave the beds; they call on their Lord in fear and hope, and they spend of what We have given them.'],
    [33,21,'A beautiful example','In the Messenger of God you have a beautiful example.'],[33,41,'Remember God often','O you who believe, remember God with much remembrance.'],
    [33,56,'Send blessings','God and His angels send blessings on the Prophet. O you who believe, send blessings on him and greet him.'],[33,70,'Speak a straight word','Be mindful of God and speak a straight word.'],
    [35,29,'They hope for a trade','Those who recite the Book of God, establish the prayer, and spend — they hope for a trade that will not fail.'],[36,58,'Peace','Peace — a word from a Merciful Lord.'],
    [39,10,'The patient are paid in full','The patient will be paid their reward in full, without account.'],[39,53,'Do not despair','O My servants who have been excessive against themselves, do not despair of the mercy of God.'],
    [40,60,'Call on Me','Your Lord has said: Call on Me; I will answer you.'],[41,30,'Do not fear','Those who say “Our Lord is God” then go straight — the angels come down to them: do not fear, and do not grieve.'],
    [41,34,'Repel with what is better','The good deed and the bad deed are not equal. Repel with that which is better.'],[42,36,'What is with God is better','Whatever you have been given is the enjoyment of this life. What is with God is better and more lasting.'],
    [43,36,'A devil assigned','Whoever turns away from the remembrance of the Most Merciful, We assign for him a devil, and he is a companion to him.'],[44,3,'A blessed night','We sent it down on a blessed night. We have always been warning.'],
    [46,15,'At forty','When he reaches forty years he says: My Lord, enable me to be grateful, and make my children good.'],[47,7,'If you help God','If you help God, He will help you and plant your feet firmly.'],
    [48,4,'He sent down the sakina','He is the One who sent down the sakina into the hearts of the believers, so that they might increase in faith.'],[49,10,'The believers are brothers','The believers are brothers, so make peace between your brothers.'],
    [49,12,'Avoid much suspicion','Avoid much suspicion. Some suspicion is a sin. Do not spy, and do not backbite one another.'],[49,13,'The most honoured','O people, We made you nations and tribes so that you may know one another. The most honoured of you with God is the most mindful.'],
    [50,16,'Closer than the jugular','We created the human, and We know what his soul whispers to him. We are closer to him than his jugular vein.'],[51,56,'I did not create jinn and humans','I did not create jinn and humans except to worship Me.'],
    [53,32,'He knows you','Do not claim purity for yourselves. He knows best who is mindful.'],[53,39,'A person has only what they strive for','A person has nothing except what they strive for.'],
    [55,13,'Which of the favours','So which of the favours of your Lord will you deny?'],[55,60,'Is the reward of good','Is the reward of good anything but good?'],
    [57,4,'He is with you','He is with you wherever you are.'],[57,20,'Know that the life of this world','Know that the life of this world is play and amusement and adornment.'],
    [58,11,'God raises those who believe','God will raise those of you who believe, and those given knowledge, in degrees.'],[59,18,'Let a soul look','O you who believe, be mindful of God, and let a soul look to what it has sent ahead for tomorrow.'],
    [59,21,'If We had sent this Qur’an','If We had sent this Qur’an down on a mountain, you would have seen it humbled, split from fear of God.'],[61,2,'Why do you say','O you who believe, why do you say what you do not do?'],
    [62,9,'When the call is made','When the call is made for the prayer on Friday, go to the remembrance of God and leave trade.'],[64,11,'No disaster','No disaster strikes except by permission of God. Whoever believes in God, He guides his heart.'],
    [65,2,'Whoever is mindful','Whoever is mindful of God, He makes a way out for them.'],[65,3,'Whoever relies','Whoever puts their trust in God — He is enough for them.'],
    [67,2,'He created death and life','He created death and life to test you which of you is best in deed.'],[68,4,'A tremendous character','You are surely on a tremendous character.'],
    [73,8,'Remember the name of your Lord','Remember the name of your Lord, and devote yourself to Him completely.'],[73,20,'Read what is easy','Read what is easy of the Qur’an.'],
    [76,3,'We guided him the way','We guided him the way, whether he is grateful or ungrateful.'],[87,14,'The one who purifies has succeeded','The one who purifies himself has succeeded, and remembers the name of his Lord and prays.'],
    [89,27,'O soul at rest','O soul at rest, return to your Lord, pleased and pleasing.'],[90,17,'Then he was of those who believed','Then he was of those who believed, and advised one another to patience, and advised one another to mercy.'],
    [91,9,'The one who purifies it','The one who purifies it has succeeded, and the one who buries it has failed.'],[93,3,'Your Lord has not left you','Your Lord has not left you, and He has not hated you.'],
    [93,5,'Your Lord will give you','Your Lord will give you, and you will be pleased.'],[94,5,'With hardship, ease','For indeed, with hardship comes ease.'],
    [94,8,'Turn your longing','And to your Lord turn your longing.'],[95,4,'In the best form','We created the human in the best form.'],
    [96,1,'Read','Read in the name of your Lord who created.'],[97,1,'We sent it down','We sent it down on the Night of Decree.'],
    [99,7,'An atom’s weight','Whoever does an atom’s weight of good will see it.'],[102,1,'Competition in plenty','Competition in plenty has distracted you.'],
    [103,1,'By time','By time, the human is surely in loss — except those who believe, do good, and advise one another to truth and to patience.'],[107,4,'Woe to those who pray','Woe to those who pray, but are heedless of their prayer.'],
    [108,1,'We have given you al-Kawthar','We have given you al-Kawthar, so pray to your Lord and sacrifice.'],[110,3,'Celebrate the praise','Then celebrate the praise of your Lord, and seek His forgiveness. He is ever turning.'],
    [112,1,'He is One','Say: He is God, One. God, the Eternal. He did not beget and was not begotten. And there is none comparable to Him.'],[113,1,'The daybreak','Say: I seek refuge in the Lord of the daybreak, from the evil of what He created.'],
    [114,1,'The people','Say: I seek refuge in the Lord of people, the King of people, the God of people.'],
    [2,45,'Seek help','Seek help through patience and prayer. It is hard, except for the humble.'],
    [2,152,'Give thanks','Give thanks to Me, and do not be ungrateful.'],
    [2,177,'Righteousness','Righteousness is not turning your faces east or west. Righteousness is belief, giving, prayer, and keeping the promise.'],
    [3,103,'Hold the rope','Hold fast, all of you, to the rope of God, and do not be divided.'],
    [3,133,'A garden as wide as the heavens','Race to forgiveness from your Lord, and a garden as wide as the heavens and the earth.'],
    [3,200,'Be patient','O you who believe, be patient, outdo one another in patience, remain stationed, and be mindful of God.'],
    [4,1,'Be mindful of your Lord','Be mindful of your Lord, who created you from a single soul.'],
    [5,32,'Whoever kills a soul','Whoever kills a soul, it is as if he had killed all people. Whoever saves one, it is as if he had saved all people.'],
    [6,17,'If God touches you','If God touches you with harm, none can remove it but He.'],
    [7,204,'When the Qur’an is recited','When the Qur’an is recited, listen to it and be silent, so that you may be shown mercy.'],
    [8,61,'If they incline to peace','If they incline to peace, incline to it, and trust in God.'],
    [9,18,'Who maintains the mosques','The mosques of God are maintained by those who believe in God and the Last Day, establish the prayer, and give zakat.'],
    [10,12,'When harm touches the human','When harm touches the human, he calls Us on his side, sitting, or standing. When We remove it, he passes on as if he had never called.'],
    [11,115,'Do not weaken','Be patient. God does not waste the reward of those who do good.'],
    [12,90,'Whoever is mindful','Whoever is mindful and patient — God does not waste the reward of those who do good.'],
    [13,22,'They are patient','Those who are patient, seeking the face of their Lord, establish the prayer, and spend secretly and openly.'],
    [15,56,'Who despairs','Who despairs of the mercy of his Lord except those who are astray?'],
    [16,125,'Call to the way','Call to the way of your Lord with wisdom and good instruction, and argue with them in a way that is best.'],
    [17,9,'This Qur’an guides','This Qur’an guides to that which is most upright.'],
    [18,28,'Keep yourself patient','Keep yourself patient with those who call on their Lord morning and evening, seeking His face.'],
    [19,96,'Love','Those who believe and do good — the Most Merciful will assign them love.'],
    [21,35,'Every soul will taste death','Every soul will taste death. We test you with bad and with good as a trial, and to Us you will be returned.'],
    [22,54,'Those given knowledge','Those who have been given knowledge know that it is the truth from your Lord, so they believe in it, and their hearts soften to it.'],
    [24,21,'If not for the grace','If not for the grace of God upon you and His mercy, not one of you would have been purified, ever.'],
    [25,70,'Except the one who turns','Except the one who turns, believes, and does good. For those, God will change their bad deeds into good.'],
    [26,89,'A sound heart','The Day when neither wealth nor children will benefit, except one who comes to God with a sound heart.'],
    [28,83,'The home of the next life','That home of the next life We assign to those who do not want exaltation on the earth, nor corruption.'],
    [29,2,'Do people think','Do people think they will be left to say “We believe” and they will not be tested?'],
    [33,43,'He is the One who blesses you','He is the One who blesses you, and His angels, to bring you out of darkness into light.'],
    [35,10,'To Him ascends the good word','Whoever wants honour — honour belongs to God altogether. To Him ascends the good word, and the good deed raises it.'],
    [42,40,'The recompense of a harm','The recompense of a harm is a harm like it. Whoever pardons and sets things right, his reward is with God.'],
    [49,11,'Do not ridicule','O you who believe, let not a people ridicule another people. Perhaps they are better than them.']
  ];

  var pool=[], seen={};
  function add(o){ if(!o||!o.id||seen[o.id]) return; seen[o.id]=1; pool.push(o); }

  (window.H_QURAN||[]).forEach(function(x){
    add({id:x.id, kind:'qayah', title:x.title, ar:x.ar, en:x.en, src:x.src, col:'#19f0b0'});
  });
  (window.H_HADITH||[]).forEach(function(x){
    add({id:x.id, kind:'hadith', title:x.title, ar:x.ar, en:x.en, src:x.src, theme:x.theme, col:'#ffc44d'});
  });
  EXTRA.forEach(function(x,i){
    add({id:'qa'+x[0]+'_'+x[1], kind:'qayah', title:x[2], ar:'', en:x[3], src:'Qur’an '+x[0]+':'+x[1], n:x[0], a:x[1], col:'#19f0b0'});
  });
  SURAHS.forEach(function(x){
    add({id:'ys_'+x[0], kind:'qsurah', title:x[1], ar:x[2], en:'Open Surah '+x[1]+' in the Qur’an that hangs in your mind. Read it. Recite it. Time here is kept.', src:'Qur’an '+x[0], n:x[0], col:'#2ee6ff'});
  });
  (window.H_DUAS||[]).forEach(function(x){
    add({id:x.id, kind:'dua', title:x.title, ar:x.ar, en:x.en, src:x.src, cat:x.cat, col:'#ffc44d'});
  });

  window.H_YEAR=pool.slice(0,365);
  window.H_DEEN_FOCUS=[
    ['A page of Qur’an','Memorise one dua','One hadith to memory'],
    ['Recite Al-Fatihah slowly','Morning adhkar','Write what I learned'],
    ['Read Yasin','Evening adhkar','Review a memorised saying'],
    ['A juz, even if split','After-salah 33','A kind word is charity']
  ];
})();
