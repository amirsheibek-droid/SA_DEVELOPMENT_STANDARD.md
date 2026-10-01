/* Hikmah — the hadith neurons.
   Each entry: id, theme, short title, Arabic (matn excerpt), English meaning (our own plain rendering), source.
   STATUS: first 20, chosen from the best-known authentic collections. Every Arabic line and reference is to be
   checked against sunnah.com before the Sage's voice is recorded. More to come (target: 100). */
window.H_THEMES=[
  {id:'intention', name:'Intention',          col:'#ffc44d'},
  {id:'character', name:'Character',          col:'#a45cff'},
  {id:'speech',    name:'Speech',             col:'#4f7dff'},
  {id:'mercy',     name:'Mercy & gentleness', col:'#ff4fa8'},
  {id:'charity',   name:'Charity',            col:'#19f0b0'},
  {id:'knowledge', name:'Knowledge',          col:'#2ee6ff'},
  {id:'patience',  name:'Patience',           col:'#ff8a3d'},
  {id:'family',    name:'Family & brotherhood', col:'#3dffd0'}
];
window.H_HADITH=[
  {id:'h1', theme:'intention', title:'Actions are by intentions', ar:'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى', en:'Deeds are judged by their intentions, and every person will have what they intended.', src:'Sahih al-Bukhari 1; Sahih Muslim 1907'},
  {id:'h2', theme:'family', title:'Love for your brother', ar:'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', en:'None of you truly believes until he loves for his brother what he loves for himself.', src:'Sahih al-Bukhari 13; Sahih Muslim 45'},
  {id:'h3', theme:'speech', title:'Speak good or stay silent', ar:'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ', en:'Whoever believes in God and the Last Day, let them speak good or remain silent.', src:'Sahih al-Bukhari 6018; Sahih Muslim 47'},
  {id:'h4', theme:'intention', title:'Religion is sincerity', ar:'الدِّينُ النَّصِيحَةُ', en:'The religion is sincerity — sincere goodwill.', src:'Sahih Muslim 55'},
  {id:'h5', theme:'patience', title:'Do not become angry', ar:'لاَ تَغْضَبْ', en:'Do not become angry.', src:'Sahih al-Bukhari 6116'},
  {id:'h6', theme:'character', title:'Leave what does not concern you', ar:'مِنْ حُسْنِ إِسْلاَمِ الْمَرْءِ تَرْكُهُ مَا لاَ يَعْنِيهِ', en:'Part of the excellence of a person’s faith is leaving what does not concern them.', src:'Jami’ at-Tirmidhi 2317'},
  {id:'h7', theme:'charity', title:'A good word is charity', ar:'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ', en:'A good word is an act of charity.', src:'Sahih al-Bukhari 2989; Sahih Muslim 1009'},
  {id:'h8', theme:'charity', title:'Your smile is charity', ar:'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ', en:'Your smile in the face of your brother is charity for you.', src:'Jami’ at-Tirmidhi 1956'},
  {id:'h9', theme:'patience', title:'True strength', ar:'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ', en:'The strong one is not the one who overpowers others; the strong one controls himself when angry.', src:'Sahih al-Bukhari 6114; Sahih Muslim 2609'},
  {id:'h10', theme:'mercy', title:'The merciful are shown mercy', ar:'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ', en:'The merciful are shown mercy by the Most Merciful. Be merciful to those on earth, and the One above will be merciful to you.', src:'Jami’ at-Tirmidhi 1924; Sunan Abi Dawud 4941'},
  {id:'h11', theme:'knowledge', title:'The path of knowledge', ar:'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ', en:'Whoever travels a path seeking knowledge, God makes easy for them a path to Paradise.', src:'Sahih Muslim 2699'},
  {id:'h12', theme:'knowledge', title:'The best of you', ar:'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', en:'The best of you are those who learn the Qur’an and teach it.', src:'Sahih al-Bukhari 5027'},
  {id:'h13', theme:'speech', title:'Safe from your tongue and hand', ar:'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ', en:'A Muslim is one from whose tongue and hand others are safe.', src:'Sahih al-Bukhari 10; Sahih Muslim 40'},
  {id:'h14', theme:'character', title:'Good character', ar:'اتَّقِ اللَّهِ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ', en:'Be mindful of God wherever you are; follow a bad deed with a good one to erase it; and treat people with good character.', src:'Jami’ at-Tirmidhi 1987'},
  {id:'h15', theme:'family', title:'Best to your family', ar:'خَيْرُكُمْ خَيْرُكُمْ لأَهْلِهِ', en:'The best of you are the best to their families.', src:'Jami’ at-Tirmidhi 3895'},
  {id:'h16', theme:'mercy', title:'Gentleness in all things', ar:'إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الأَمْرِ كُلِّهِ', en:'God is gentle and loves gentleness in every matter.', src:'Sahih al-Bukhari 6927; Sahih Muslim 2165'},
  {id:'h17', theme:'patience', title:'The believer’s affair', ar:'عَجَبًا لأَمْرِ الْمُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ', en:'How wonderful is the affair of the believer — all of it is good for them.', src:'Sahih Muslim 2999'},
  {id:'h18', theme:'intention', title:'Small but constant', ar:'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ', en:'The deeds most loved by God are those done consistently, even if small.', src:'Sahih al-Bukhari 6464; Sahih Muslim 783'},
  {id:'h19', theme:'character', title:'Thank people', ar:'لاَ يَشْكُرُ اللَّهَ مَنْ لاَ يَشْكُرُ النَّاسَ', en:'Whoever does not thank people has not thanked God.', src:'Sunan Abi Dawud 4811; Jami’ at-Tirmidhi 1954'},
  {id:'h20', theme:'mercy', title:'Make things easy', ar:'يَسِّرُوا وَلاَ تُعَسِّرُوا، وَبَشِّرُوا وَلاَ تُنَفِّرُوا', en:'Make things easy, not difficult. Bring good news, and do not drive people away.', src:'Sahih al-Bukhari 69; Sahih Muslim 1734'}
];
