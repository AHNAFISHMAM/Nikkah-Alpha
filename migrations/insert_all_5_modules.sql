-- =============================================
-- INSERT ALL 5 MODULES - COMPLETE REPLACEMENT
-- =============================================
-- This migration inserts all 5 modules with complete HTML content
-- Execute this AFTER deleting all old module data

-- Ensure the modules table has the required columns and defaults
DO $$ 
BEGIN
  -- Add content column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'modules' 
    AND column_name = 'content'
  ) THEN
    ALTER TABLE public.modules ADD COLUMN content TEXT;
  END IF;

  -- Add order_index column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'modules' 
    AND column_name = 'order_index'
  ) THEN
    ALTER TABLE public.modules ADD COLUMN order_index INTEGER;
    -- Add unique constraint if order_index doesn't have one
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'modules_order_index_key'
    ) THEN
      ALTER TABLE public.modules ADD CONSTRAINT modules_order_index_key UNIQUE (order_index);
    END IF;
  END IF;

  -- Ensure id column has a default value
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'modules' 
    AND column_name = 'id'
    AND column_default IS NULL
  ) THEN
    ALTER TABLE public.modules ALTER COLUMN id SET DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Delete all existing modules first (Phase 0.2)
DELETE FROM public.module_notes; -- Delete user notes first (foreign key constraint)
DELETE FROM public.modules; -- Delete all modules

-- =============================================
-- MODULE 1: Islamic Marriage Foundations
-- =============================================
INSERT INTO public.modules (id, title, description, content, order_index) VALUES (
  gen_random_uuid(),
  'Islamic Marriage Foundations',
  'Core Islamic principles and wisdom for a blessed marriage based on Quran and authentic Sunnah',
  '<div class="module-content">

  <section class="intro">
    <p>Marriage (Nikah) in Islam is a sacred covenant (<em>mithaqan ghaleeza</em>) between a man and woman, established upon the guidance of Allah and His Messenger ﷺ. This module covers the foundational Islamic principles that make a marriage valid, blessed, and successful according to the Quran, authentic Sunnah, and the understanding of the Salaf (righteous predecessors).</p>
  </section>

  <section class="quran">
    <h2>From the Quran</h2>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ</p>
      <p>"And among His Signs is that He created for you wives from among yourselves, that you may find repose in them, and He has put between you affection and mercy. Verily, in that are indeed signs for a people who reflect."</p>
      <cite>Surah Ar-Rum 30:21</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">وَأَنكِحُوا الْأَيَامَىٰ مِنكُمْ وَالصَّالِحِينَ مِنْ عِبَادِكُمْ وَإِمَائِكُمْ ۚ إِن يَكُونُوا فُقَرَاءَ يُغْنِهِمُ اللَّهُ مِن فَضْلِهِ</p>
      <p>"And marry those among you who are single and the righteous of your slaves and maidservants. If they be poor, Allah will enrich them out of His bounty."</p>
      <cite>Surah An-Nur 24:32</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">وَعَاشِرُوهُنَّ بِالْمَعْرُوفِ</p>
      <p>"And live with them honourably."</p>
      <cite>Surah An-Nisa 4:19</cite>
    </blockquote>
  </section>

  <section class="hadith">
    <h2>From the Sunnah</h2>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"O young men, whoever among you can afford to marry, let him marry, for it restrains the gaze and protects the private parts. And whoever cannot afford it, let him fast, for it will be a shield for him."</em></p>
      <cite>Sahih al-Bukhari 5066, Sahih Muslim 1400</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"There is no marriage except with a guardian (wali)."</em></p>
      <cite>Abu Dawud 2085, Tirmidhi 1101, Ibn Majah 1881 - Graded Sahih by Al-Albani</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"The best of you are those who are best to their wives, and I am the best of you to my wives."</em></p>
      <cite>Tirmidhi 3895 - Graded Sahih by Al-Albani</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>From the Farewell Sermon: <em>"Fear Allah concerning women! Verily you have taken them on the security of Allah, and intercourse with them has been made lawful unto you by the word of Allah. You have rights over them, and they have rights over you."</em></p>
      <cite>Sahih Muslim 1218</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"A woman cannot be married without the permission of her guardian, and a previously married woman has more right to herself than her guardian, and a virgin''s consent should be sought and her consent is her silence."</em></p>
      <cite>Sahih Muslim 1421</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"Each of you is a shepherd and each of you is responsible for his flock. The leader is a shepherd and is responsible for his flock. A man is a shepherd over his family and is responsible for them. A woman is a shepherd over her husband''s house and children and is responsible for them."</em></p>
      <cite>Sahih al-Bukhari 7138, Sahih Muslim 1829</cite>
    </blockquote>
  </section>

  <section class="explanation">
    <h2>Understanding - From the Scholars</h2>

    <h3>The Pillars of a Valid Nikah</h3>
    <p>According to the scholars of Ahlus-Sunnah, a marriage contract must fulfill these conditions to be valid:</p>
    <ol>
      <li><strong>Guardian (Wali):</strong> The woman must have a male Muslim guardian (father, then grandfather, then brother, etc.) who gives her in marriage. The Prophet ﷺ said: "There is no marriage except with a guardian." This is the position of the majority of scholars including Imam Ahmad, Ash-Shafi''i, and Malik.</li>
      <li><strong>Two Witnesses:</strong> Two trustworthy Muslim male witnesses must be present at the time of the contract.</li>
      <li><strong>Mahr (Dowry):</strong> A gift from the husband to the wife, which is her right and becomes her property. It can be paid immediately or deferred.</li>
      <li><strong>Consent:</strong> Both parties must consent to the marriage. A woman cannot be forced into marriage against her will.</li>
      <li><strong>Offer and Acceptance (Ijab and Qabul):</strong> Clear words indicating marriage from both parties or their representatives.</li>
    </ol>

    <h3>Rights of the Husband</h3>
    <p>Shaykh Ibn Uthaymeen and Shaykh Salih Al-Fawzan explain that the husband''s rights include:</p>
    <ul>
      <li>Obedience in matters that are not sinful</li>
      <li>Not leaving the house without his permission</li>
      <li>Not admitting anyone into his house without his approval</li>
      <li>Guarding his wealth and honor</li>
      <li>Care of the household and children</li>
    </ul>

    <h3>Rights of the Wife</h3>
    <p>From the explanations of the scholars:</p>
    <ul>
      <li><strong>Mahr:</strong> Her mandatory wedding gift that belongs solely to her</li>
      <li><strong>Nafaqah (Maintenance):</strong> Food, clothing, and housing according to the husband''s ability and the customs of the land</li>
      <li><strong>Kind Treatment:</strong> As Allah commanded: "And live with them honourably"</li>
      <li><strong>Justice:</strong> Fair treatment, especially in cases of polygyny</li>
      <li><strong>Physical and Emotional Companionship:</strong> The husband must not neglect her needs</li>
      <li><strong>Privacy:</strong> Her own living space where she is not obligated to live with in-laws</li>
    </ul>

    <h3>A Woman Cannot Be Forced Into Marriage</h3>
    <p>Imam Ibn Baz (rahimahullah) stated that if a woman is married without her consent, the marriage is invalid. The Prophet ﷺ returned a woman to her family when she complained that her father married her without her consent. This shows the importance Islam places on the woman''s agreement to the marriage.</p>
  </section>

  <section class="application">
    <h2>Applying This</h2>
    <ul>
      <li><strong>For Men:</strong> Understand your obligation to provide maintenance (nafaqah), treat your wife with kindness, and follow the example of the Prophet ﷺ in being the best to your family</li>
      <li><strong>For Women:</strong> Know your rights in Islam - including your right to mahr, maintenance, kind treatment, and not being forced into marriage</li>
      <li><strong>For Both:</strong> Ensure your nikah contract includes all the Islamic requirements: guardian, witnesses, mahr, and mutual consent</li>
      <li><strong>For Guardians:</strong> Do not force your daughter or ward into marriage, but also do not prevent her from a suitable match</li>
      <li>Keep the mahr reasonable - the Prophet ﷺ said the best mahr is that which is easy to give</li>
      <li>Build your marriage on the foundation of Islam - pray together, remind each other of Allah, and help each other in worship</li>
    </ul>
  </section>

  <section class="resources">
    <h2>Learn More</h2>
    <ul>
      <li><a href="https://abukhadeejah.com/there-is-no-marriage-without-a-guardian-and-the-conditions-of-a-valid-nikah/" target="_blank" rel="noopener noreferrer">No Marriage Without a Guardian - Conditions of Valid Nikah</a> - Abu Khadeejah</li>
      <li><a href="https://abukhadeejah.com/hadeeth-8-a-woman-cannot-be-forced-into-marriage-and-if-she-dislikes-it-is-nullified-40-hadeeth-women/" target="_blank" rel="noopener noreferrer">A Woman Cannot Be Forced Into Marriage</a> - 40 Hadith on Women</li>
      <li><a href="https://abukhadeejah.com/a-word-on-wedding-dowries-mahr-sadaq-in-islam-and-spending-on-a-walimah/" target="_blank" rel="noopener noreferrer">Wedding Dowries (Mahr) in Islam</a> - Abu Khadeejah</li>
      <li><a href="https://islamqa.info/en/answers/10680/rights-of-husband-and-rights-of-wife-in-islam" target="_blank" rel="noopener noreferrer">Rights of Husband and Wife in Islam</a> - IslamQA</li>
      <li><a href="https://www.troid.org/the-rights-of-the-wife-rights-of-spouses/" target="_blank" rel="noopener noreferrer">The Rights of the Wife</a> - TROID</li>
      <li><a href="https://www.troid.org/the-rights-of-the-husband/" target="_blank" rel="noopener noreferrer">The Rights of the Husband</a> - TROID</li>
      <li><a href="https://abukhadeejah.com/the-book-of-marriage-ibn-hajrs-buloogh-al-maraam-explanation-of-al-fawzaan/" target="_blank" rel="noopener noreferrer">Book of Marriage - Bulugh Al-Maram</a> - Explanation of Shaykh Al-Fawzan</li>
    </ul>
  </section>

  <section class="reflection">
    <h2>Reflect Together</h2>
    <ol>
      <li>Do we understand all the conditions required for a valid Islamic marriage?</li>
      <li>Have we discussed and agreed upon the mahr?</li>
      <li>How can we make our marriage a means of drawing closer to Allah?</li>
      <li>What does it mean to "live with them honourably" in practical terms?</li>
      <li>How will we support each other''s spiritual growth?</li>
      <li>What Islamic values are most important to us as a couple?</li>
    </ol>
  </section>

</div>',
  1
);

-- =============================================
-- MODULE 2: Communication & Conflict Resolution
-- =============================================
INSERT INTO public.modules (id, title, description, content, order_index) VALUES (
  gen_random_uuid(),
  'Communication & Conflict Resolution',
  'Master healthy communication and resolve conflicts according to the Quran and Sunnah',
  '<div class="module-content">

  <section class="intro">
    <p>Effective communication is the foundation of a strong marriage. The Prophet ﷺ and his companions demonstrated the highest level of wisdom in speech and conflict resolution. This module covers how to communicate with your spouse according to the guidance of the Quran and Sunnah, and how to resolve disagreements with patience and wisdom.</p>
  </section>

  <section class="quran">
    <h2>From the Quran</h2>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">وَقُولُوا لِلنَّاسِ حُسْنًا</p>
      <p>"And speak to people with kindness."</p>
      <cite>Surah Al-Baqarah 2:83</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">وَقُل لِّعِبَادِي يَقُولُوا الَّتِي هِيَ أَحْسَنُ ۚ إِنَّ الشَّيْطَانَ يَنزَغُ بَيْنَهُمْ</p>
      <p>"And tell My servants to say that which is best. Indeed, Satan induces dissension among them."</p>
      <cite>Surah Al-Isra 17:53</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">وَإِنْ خِفْتُمْ شِقَاقَ بَيْنِهِمَا فَابْعَثُوا حَكَمًا مِّنْ أَهْلِهِ وَحَكَمًا مِّنْ أَهْلِهَا إِن يُرِيدَا إِصْلَاحًا يُوَفِّقِ اللَّهُ بَيْنَهُمَا</p>
      <p>"And if you fear dissension between the two, send an arbitrator from his people and an arbitrator from her people. If they both desire reconciliation, Allah will cause it between them."</p>
      <cite>Surah An-Nisa 4:35</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ وَأَعْرِضْ عَنِ الْجَاهِلِينَ</p>
      <p>"Show forgiveness, enjoin what is good, and turn away from the ignorant."</p>
      <cite>Surah Al-A''raf 7:199</cite>
    </blockquote>
  </section>

  <section class="hadith">
    <h2>From the Sunnah</h2>

    <blockquote class="hadith-text">
      <p>A man asked the Prophet ﷺ for advice, and he said: <em>"Do not become angry."</em> The man asked again several times, and he ﷺ replied each time: <em>"Do not become angry."</em></p>
      <cite>Sahih al-Bukhari 6116</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"The strong person is not the one who overcomes people by his strength, but the strong person is the one who controls himself when angry."</em></p>
      <cite>Sahih al-Bukhari 6114, Sahih Muslim 2609</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"If any of you becomes angry, let him keep silent."</em></p>
      <cite>Musnad Ahmad 329 - Graded Sahih by Al-Albani in Sahih Al-Jami 693</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"Anger comes from Shaytan, and Shaytan was created from fire. Fire is extinguished by water. So if one of you becomes angry, let him make wudu."</em></p>
      <cite>Abu Dawud 4784 - Graded Hasan by Al-Albani</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"Every son of Adam makes mistakes, and the best of those who make mistakes are those who repent."</em></p>
      <cite>Tirmidhi 2499, Ibn Majah 4251 - Graded Hasan by Al-Albani</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>Aisha (may Allah be pleased with her) described the Prophet ﷺ: <em>"He was not vulgar, nor did he speak obscenities. He did not shout in the marketplace. He did not repay evil with evil, but rather he would pardon and forgive."</em></p>
      <cite>Tirmidhi 2016 - Graded Sahih by Al-Albani</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"It is not permissible for a Muslim to forsake his brother for more than three days. They both turn away when they meet. The better of them is the one who gives the greeting of salam first."</em></p>
      <cite>Sahih al-Bukhari 6077, Sahih Muslim 2560</cite>
    </blockquote>
  </section>

  <section class="explanation">
    <h2>Understanding - From the Scholars</h2>

    <h3>The Prophetic Way of Communication</h3>
    <p>The scholars explain that the Prophet ﷺ was the best example in how he communicated with his wives. He would listen attentively, speak gently, use humor appropriately, never raise his voice in anger, and give his full attention when spoken to. Aisha (may Allah be pleased with her) reported that he would listen to her complete her speech before responding.</p>

    <h3>Managing Anger - A Prophetic Approach</h3>
    <p>Shaykh Ibn Uthaymeen explained that anger is from Shaytan and is the root of many marital problems. The Prophet ﷺ gave us practical solutions:</p>
    <ul>
      <li>Remain silent when angry</li>
      <li>Make wudu (ablution)</li>
      <li>If standing, sit down; if sitting, lie down</li>
      <li>Seek refuge in Allah from Shaytan</li>
      <li>Leave the room if necessary to cool down</li>
    </ul>

    <h3>Privacy of Marital Affairs</h3>
    <p>The scholars of the Sunnah emphasize that what happens between husband and wife should remain private. The Prophet ﷺ forbade men and women from discussing intimate details of their married life with others. This extends to arguments and disagreements - do not involve unnecessary parties in your disputes.</p>

    <h3>When to Seek Help</h3>
    <p>Allah mentions in Surah An-Nisa (4:35) the system of arbitration when conflicts cannot be resolved between the spouses. Shaykh Al-Fawzan explains that this should be sought from trustworthy, knowledgeable people - ideally one from each family - who can help mediate and find solutions. This is before considering separation.</p>
  </section>

  <section class="application">
    <h2>Applying This</h2>
    <ul>
      <li><strong>Speak with kindness:</strong> Even in disagreement, use good words. The Prophet ﷺ said that a good word is charity.</li>
      <li><strong>Control your anger:</strong> When you feel anger rising, remain silent, make wudu, change your position, and seek refuge from Shaytan.</li>
      <li><strong>Listen before responding:</strong> Give your spouse your full attention. Don''t interrupt or dismiss their feelings.</li>
      <li><strong>Resolve quickly:</strong> Do not let the sun set on your anger. The Prophet ﷺ forbade Muslims to forsake each other beyond three days.</li>
      <li><strong>Apologize sincerely:</strong> The best of those who err are those who repent. Say "I''m sorry" and mean it.</li>
      <li><strong>Avoid harmful speech:</strong> Never use insulting language, bring up past forgiven mistakes, or threaten divorce in anger.</li>
      <li><strong>Keep matters private:</strong> Don''t broadcast your arguments on social media or to uninvolved parties.</li>
      <li><strong>Seek help when needed:</strong> If issues persist, involve wise, trustworthy family members or Islamic counselors as arbitrators.</li>
    </ul>
  </section>

  <section class="resources">
    <h2>Learn More</h2>
    <ul>
      <li><a href="https://islamqa.info/en/answers/2076/resolving-disputes-between-spouses" target="_blank" rel="noopener noreferrer">Resolving Disputes Between Spouses</a> - IslamQA</li>
      <li><a href="https://www.troid.org/what-does-the-command-refuse-to-share-their-beds-al-nisa-434-mean/" target="_blank" rel="noopener noreferrer">Understanding Quran 4:34 - Resolving Discord</a> - TROID</li>
      <li><a href="https://www.troid.org/a-husband-assisting-his-wife-with-household-chores-doesnt-diminish-or-negate-his-masculinity/" target="_blank" rel="noopener noreferrer">A Husband Helping His Wife at Home</a> - TROID</li>
      <li><a href="https://abukhadeejah.com/category/marriage/" target="_blank" rel="noopener noreferrer">Marriage Articles Collection</a> - Abu Khadeejah</li>
      <li><a href="https://salaficentre.com/?s=marriage" target="_blank" rel="noopener noreferrer">Marriage Guidance</a> - Salafi Centre Manchester</li>
    </ul>
  </section>

  <section class="reflection">
    <h2>Reflect Together</h2>
    <ol>
      <li>How do we typically communicate when we disagree?</li>
      <li>What triggers anger for each of us, and how can we help each other stay calm?</li>
      <li>What communication habits from the Sunnah do we want to develop?</li>
      <li>How will we handle disagreements when they arise?</li>
      <li>Who would be appropriate arbitrators from our families if we ever need outside help?</li>
      <li>What "red lines" should we agree to never cross during arguments?</li>
    </ol>
  </section>

</div>',
  2
);

-- =============================================
-- MODULE 3: Intimacy & Family Planning
-- =============================================
INSERT INTO public.modules (id, title, description, content, order_index) VALUES (
  gen_random_uuid(),
  'Intimacy & Family Planning',
  'Navigate physical intimacy and family planning according to Quran and authentic Sunnah',
  '<div class="module-content">

  <section class="intro">
    <p>Physical intimacy is a blessed and beautiful part of marriage in Islam. It is not merely permissible but encouraged as a form of worship when approached with the right intention. This module covers the Islamic perspective on marital intimacy and family planning according to the Quran, Sunnah, and the understanding of the scholars of Ahlus-Sunnah.</p>
  </section>

  <section class="quran">
    <h2>From the Quran</h2>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">هُنَّ لِبَاسٌ لَّكُمْ وَأَنتُمْ لِبَاسٌ لَّهُنَّ</p>
      <p>"They (your wives) are a garment for you and you are a garment for them."</p>
      <cite>Surah Al-Baqarah 2:187</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">نِسَاؤُكُمْ حَرْثٌ لَّكُمْ فَأْتُوا حَرْثَكُمْ أَنَّىٰ شِئْتُمْ</p>
      <p>"Your wives are a tilth for you, so go to your tilth when or how you will."</p>
      <cite>Surah Al-Baqarah 2:223</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">وَيَسْأَلُونَكَ عَنِ الْمَحِيضِ ۖ قُلْ هُوَ أَذًى فَاعْتَزِلُوا النِّسَاءَ فِي الْمَحِيضِ وَلَا تَقْرَبُوهُنَّ حَتَّىٰ يَطْهُرْنَ</p>
      <p>"And they ask you about menstruation. Say: It is harm, so keep away from wives during menstruation. And do not approach them until they are pure."</p>
      <cite>Surah Al-Baqarah 2:222</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا</p>
      <p>"Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous."</p>
      <cite>Surah Al-Furqan 25:74</cite>
    </blockquote>
  </section>

  <section class="hadith">
    <h2>From the Sunnah</h2>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"In the intimate relations of each one of you there is sadaqah (charity)."</em> The Companions said: "O Messenger of Allah! When one of us fulfills his desire, will he have a reward for that?" He ﷺ said: <em>"Do you not see that if he were to fulfill it in a haram way, he would be sinning? Likewise, if he fulfills it in a halal manner, he will have a reward."</em></p>
      <cite>Sahih Muslim 1006</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"When any of you has intercourse with his wife, let him be truthful with her. If he satisfies his desire before she satisfies hers, he should not hurry her."</em></p>
      <cite>Abu Dawud - Graded Hasan by Al-Albani in Silsilah as-Sahihah</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ taught the dua before intimacy: <em>"Bismillah, Allahumma jannibna ash-shaytana wa jannib ash-shaytana ma razaqtana"</em> (In the name of Allah, O Allah keep Satan away from us and keep Satan away from what You bless us with). He ﷺ said: <em>"If Allah decrees a child from that union, Satan will never harm him."</em></p>
      <cite>Sahih al-Bukhari 6388, Sahih Muslim 1434</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>Jabir (may Allah be pleased with him) narrated: <em>"We used to practice azl (coitus interruptus/withdrawal) during the time of the Prophet ﷺ while the Quran was being revealed."</em></p>
      <cite>Sahih al-Bukhari 5208, Sahih Muslim 1440</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"Let none of you fall upon his wife like a beast. Let there be a messenger between them."</em> They asked: "What is the messenger, O Messenger of Allah?" He said: <em>"Kisses and speech."</em></p>
      <cite>Ad-Daylami in Musnad al-Firdaws - Graded Hasan by Al-Albani</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"Cursed is the one who approaches his wife in her back passage."</em></p>
      <cite>Abu Dawud 2162 - Graded Sahih by Al-Albani</cite>
    </blockquote>
  </section>

  <section class="explanation">
    <h2>Understanding - From the Scholars</h2>

    <h3>Intimacy as Worship</h3>
    <p>The scholars explain that marital intimacy, when approached with the proper intention, becomes an act of worship. By keeping oneself and one''s spouse chaste and away from haram, one earns reward from Allah. The hadith in Sahih Muslim clearly establishes this principle.</p>

    <h3>What is Permitted and Prohibited</h3>
    <p>Shaykh Ibn Uthaymeen, Shaykh Al-Albani, and other scholars clarify:</p>
    <ul>
      <li><strong>Permitted:</strong> All forms of intimacy between husband and wife in the natural place (vaginal intercourse) in any position</li>
      <li><strong>Prohibited:</strong>
        <ul>
          <li>Anal intercourse - this is a major sin with a curse mentioned in the hadith</li>
          <li>Intercourse during menstruation - forbidden until she purifies and makes ghusl</li>
          <li>Intimacy during fasting hours in Ramadan</li>
          <li>Intimacy while in the state of Ihram for Hajj or Umrah</li>
        </ul>
      </li>
    </ul>

    <h3>Family Planning Rulings</h3>
    <p>The scholars have ruled on various aspects of family planning:</p>
    <ul>
      <li><strong>Azl (Withdrawal):</strong> Permissible with the wife''s consent, as the Companions practiced it during the Prophet''s time (Bukhari, Muslim)</li>
      <li><strong>Temporary Contraception:</strong> Shaykh Ibn Uthaymeen, Shaykh Ibn Baz, and the Permanent Committee ruled it permissible with conditions: mutual consent, no harm to health, and a valid reason (spacing children, health of mother, etc.)</li>
      <li><strong>Permanent Sterilization:</strong> Generally prohibited (haram) unless there is a genuine medical necessity that poses risk to the woman''s life. This is because it permanently prevents having children, which goes against the general Islamic encouragement to have offspring.</li>
    </ul>

    <h3>Privacy is Sacred</h3>
    <p>The Prophet ﷺ severely warned against discussing intimate marital details with others. Shaykh Al-Albani classified the hadith about this as authentic. What happens between husband and wife stays private.</p>
  </section>

  <section class="application">
    <h2>Applying This</h2>
    <ul>
      <li>Begin intimacy with the dua taught by the Prophet ﷺ: <em>"Bismillah, Allahumma jannibna ash-shaytana wa jannib ash-shaytana ma razaqtana"</em></li>
      <li>Approach intimacy with patience and consideration - the Prophet ﷺ mentioned "kisses and speech" as preliminaries</li>
      <li>Ensure mutual satisfaction - do not be selfish in this matter</li>
      <li>Maintain hygiene and perform ghusl when required</li>
      <li>Keep all intimate matters private - never discuss details with anyone</li>
      <li>Family planning decisions should be made together with mutual consent</li>
      <li>Temporary contraception is permissible with agreement and valid reason</li>
      <li>Avoid permanent sterilization unless medically necessary</li>
      <li>Make dua for righteous offspring using the Quranic duas</li>
    </ul>
  </section>

  <section class="resources">
    <h2>Learn More</h2>
    <ul>
      <li><a href="https://islamqa.info/en/answers/231777/is-it-permissible-to-use-contraception-because-of-the-husbands-debts" target="_blank" rel="noopener noreferrer">Ruling on Contraception</a> - IslamQA</li>
      <li><a href="https://islamqa.info/en/answers/36593/ruling-on-birth-control" target="_blank" rel="noopener noreferrer">Ruling on Birth Control</a> - IslamQA</li>
      <li><a href="https://islamqa.info/en/answers/3882/what-is-permissible-in-intimacy-between-the-spouses" target="_blank" rel="noopener noreferrer">What is Permissible in Marital Intimacy</a> - IslamQA</li>
      <li><a href="https://abukhadeejah.com/category/40-hadeeth-women/" target="_blank" rel="noopener noreferrer">40 Hadith on Women</a> - Abu Khadeejah</li>
    </ul>
  </section>

  <section class="reflection">
    <h2>Reflect Together</h2>
    <ol>
      <li>How will we approach intimacy in our marriage with the proper Islamic etiquette?</li>
      <li>Have we discussed our expectations regarding family planning?</li>
      <li>When do we feel ready to start having children, if Allah wills?</li>
      <li>How many children would we ideally like to have?</li>
      <li>What if we face difficulties conceiving?</li>
      <li>How will we maintain the privacy of our marital life?</li>
    </ol>
  </section>

</div>',
  3
);

-- =============================================
-- MODULE 4: Financial Harmony
-- =============================================
INSERT INTO public.modules (id, title, description, content, order_index) VALUES (
  gen_random_uuid(),
  'Financial Harmony',
  'Build financial partnership based on Quran and Sunnah - avoiding riba and ensuring halal earnings',
  '<div class="module-content">

  <section class="intro">
    <p>Financial matters are among the leading causes of marital conflict. Islam provides clear guidance on financial rights and responsibilities in marriage. Understanding these from the Quran and Sunnah helps couples build a harmonious financial life together, avoiding both disputes and the prohibited elements of riba (interest) and other unlawful earnings.</p>
  </section>

  <section class="quran">
    <h2>From the Quran</h2>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">الرِّجَالُ قَوَّامُونَ عَلَى النِّسَاءِ بِمَا فَضَّلَ اللَّهُ بَعْضَهُمْ عَلَىٰ بَعْضٍ وَبِمَا أَنفَقُوا مِنْ أَمْوَالِهِمْ</p>
      <p>"Men are the protectors and maintainers of women, because Allah has made one of them excel the other, and because they spend from their means."</p>
      <cite>Surah An-Nisa 4:34</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">لِيُنفِقْ ذُو سَعَةٍ مِّن سَعَتِهِ ۖ وَمَن قُدِرَ عَلَيْهِ رِزْقُهُ فَلْيُنفِقْ مِمَّا آتَاهُ اللَّهُ ۚ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا مَا آتَاهُهَا</p>
      <p>"Let a man of wealth spend from his wealth, and he whose provision is restricted, let him spend from what Allah has given him. Allah does not charge a soul except according to what He has given it."</p>
      <cite>Surah At-Talaq 65:7</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">وَآتُوا النِّسَاءَ صَدُقَاتِهِنَّ نِحْلَةً</p>
      <p>"And give the women their mahr (bridal gift) as a free gift."</p>
      <cite>Surah An-Nisa 4:4</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَذَرُوا مَا بَقِيَ مِنَ الرِّبَا إِن كُنتُم مُّؤْمِنِينَ</p>
      <p>"O you who believe! Fear Allah and give up what remains of riba (usury/interest) if you are believers."</p>
      <cite>Surah Al-Baqarah 2:278</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ</p>
      <p>"And cooperate in righteousness and piety."</p>
      <cite>Surah Al-Ma''idah 5:2</cite>
    </blockquote>
  </section>

  <section class="hadith">
    <h2>From the Sunnah</h2>

    <blockquote class="hadith-text">
      <p>From the Farewell Sermon, the Prophet ﷺ said: <em>"Fear Allah concerning women! You have taken them on the security of Allah. Their rights upon you are that you provide them with food and clothing in a fitting manner."</em></p>
      <cite>Sahih Muslim 1218</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"The best of mahr is that which is easy."</em></p>
      <cite>Abu Dawud 2117, Al-Hakim - Graded Sahih by Al-Albani</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"A dinar you spend in the cause of Allah, a dinar you spend to free a slave, a dinar you give in charity to a needy person, and a dinar you spend on your family - the greatest in reward is the one you spend on your family."</em></p>
      <cite>Sahih Muslim 995</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"When a man spends on his family with the intention of reward, it is counted as charity for him."</em></p>
      <cite>Sahih al-Bukhari 55, Sahih Muslim 1002</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>Hind bint Utbah said to the Prophet ﷺ: "Abu Sufyan is a stingy man and does not give me enough for me and my children." The Prophet ﷺ said: <em>"Take what is sufficient for you and your children, according to what is customary."</em></p>
      <cite>Sahih al-Bukhari 5364, Sahih Muslim 1714</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"Allah has cursed the one who consumes riba, the one who pays it, the one who writes it, and the two who witness it."</em> He said: <em>"They are all equal."</em></p>
      <cite>Sahih Muslim 1598</cite>
    </blockquote>
  </section>

  <section class="explanation">
    <h2>Understanding - From the Scholars</h2>

    <h3>The Husband''s Financial Obligation</h3>
    <p>Shaykh Ibn Uthaymeen, Shaykh Ibn Baz, and the scholars explain that the husband is obligated to provide:</p>
    <ul>
      <li><strong>Nafaqah (Maintenance):</strong> Food, drink, and all necessities</li>
      <li><strong>Clothing:</strong> According to what is customary and appropriate</li>
      <li><strong>Housing:</strong> Suitable accommodation according to his means</li>
      <li><strong>Medical Care:</strong> Treatment when she is ill</li>
    </ul>
    <p>The level of provision should be according to his means and what is customary in their society, as indicated by Surah At-Talaq 65:7.</p>

    <h3>The Wife''s Financial Independence</h3>
    <p>The scholars are unanimous that:</p>
    <ul>
      <li>The wife''s wealth is entirely her own</li>
      <li>She has no obligation to spend on the household</li>
      <li>Her mahr is her property - she can use it as she wishes</li>
      <li>Her inheritance belongs to her</li>
      <li>If she works and earns, that income is hers</li>
      <li>She may voluntarily contribute to the household expenses, but it is considered charity</li>
    </ul>

    <h3>The Mahr (Bridal Gift)</h3>
    <p>Shaykh Al-Fawzan explains:</p>
    <ul>
      <li>The mahr is obligatory and the wife''s right</li>
      <li>It should be named in the marriage contract</li>
      <li>It can be paid immediately or deferred (or part of each)</li>
      <li>The Sunnah is to keep it moderate - the Prophet ﷺ said "the best mahr is that which is easy"</li>
      <li>Excessive mahr goes against the Sunnah and can cause hardship</li>
    </ul>

    <h3>Avoiding Riba (Interest)</h3>
    <p>The scholars of Ahlus-Sunnah are unanimous that riba is one of the major sins. This includes:</p>
    <ul>
      <li>Interest-based loans</li>
      <li>Credit card interest</li>
      <li>Conventional mortgages</li>
      <li>Interest-bearing savings accounts</li>
    </ul>
    <p>Couples should seek halal alternatives such as Islamic financing, interest-free loans, and sharia-compliant banking.</p>
  </section>

  <section class="application">
    <h2>Applying This</h2>
    <ul>
      <li><strong>Before Marriage:</strong> Discuss financial expectations, debts, and goals transparently</li>
      <li><strong>Mahr:</strong> Agree on a reasonable amount following the Sunnah of keeping it moderate</li>
      <li><strong>Husband:</strong> Fulfill your obligation of nafaqah willingly - spending on family earns reward</li>
      <li><strong>Wife:</strong> Know your rights while being cooperative and not demanding beyond reasonable needs</li>
      <li><strong>Joint Planning:</strong> Make major financial decisions together through consultation (shura)</li>
      <li><strong>Avoid Riba:</strong> Keep your income and transactions free from interest</li>
      <li><strong>Zakat:</strong> Calculate and pay zakat on your wealth annually</li>
      <li><strong>Charity:</strong> Give sadaqah regularly - it brings barakah to wealth</li>
      <li><strong>Budget:</strong> Create a household budget accounting for necessities, savings, and charity</li>
      <li><strong>Emergency Fund:</strong> Save for unexpected needs</li>
    </ul>
  </section>

  <section class="resources">
    <h2>Learn More</h2>
    <ul>
      <li><a href="https://abukhadeejah.com/a-word-on-wedding-dowries-mahr-sadaq-in-islam-and-spending-on-a-walimah/" target="_blank" rel="noopener noreferrer">Wedding Dowries (Mahr) in Islam</a> - Abu Khadeejah</li>
      <li><a href="https://islamqa.info/en/answers/10680/rights-of-husband-and-rights-of-wife-in-islam" target="_blank" rel="noopener noreferrer">Financial Rights of Spouses</a> - IslamQA</li>
      <li><a href="https://islamqa.info/en/answers/92/living-on-money-derived-from-riba" target="_blank" rel="noopener noreferrer">Prohibition of Riba</a> - IslamQA</li>
      <li><a href="https://www.troid.org/marriage-in-islam/" target="_blank" rel="noopener noreferrer">Marriage in Islam - Rights and Responsibilities</a> - TROID</li>
      <li><a href="https://islamqa.info/en/answers/12823/she-is-asking-about-zakah" target="_blank" rel="noopener noreferrer">Zakat Rulings</a> - IslamQA</li>
    </ul>
  </section>

  <section class="reflection">
    <h2>Reflect Together</h2>
    <ol>
      <li>What is our combined financial picture (income, debts, savings)?</li>
      <li>Have we agreed upon the mahr amount and payment terms?</li>
      <li>How will we manage our finances together (joint accounts, separate, both)?</li>
      <li>Is our income free from riba and haram sources?</li>
      <li>What are our short-term and long-term financial goals?</li>
      <li>How much will we give in zakat and sadaqah regularly?</li>
    </ol>
  </section>

</div>',
  4
);

-- =============================================
-- MODULE 5: Family & In-Laws
-- =============================================
INSERT INTO public.modules (id, title, description, content, order_index) VALUES (
  gen_random_uuid(),
  'Family & In-Laws',
  'Navigate relationships with extended family while maintaining healthy boundaries according to Quran and Sunnah',
  '<div class="module-content">

  <section class="intro">
    <p>Navigating relationships with extended family is one of the biggest adjustments in marriage. Islam provides clear guidance on maintaining family ties while establishing healthy boundaries. Understanding the rights of parents, in-laws, and spouses helps prevent conflicts and build harmonious relationships based on the Quran and Sunnah.</p>
  </section>

  <section class="quran">
    <h2>From the Quran</h2>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا</p>
      <p>"And your Lord has decreed that you worship none but Him, and that you be dutiful to your parents. If one or both of them reach old age with you, say not to them a word of disrespect (uff), nor shout at them, but address them in terms of honor."</p>
      <cite>Surah Al-Isra 17:23</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ</p>
      <p>"And fear Allah through whom you ask one another, and (fear) the wombs (family relations)."</p>
      <cite>Surah An-Nisa 4:1</cite>
    </blockquote>

    <blockquote class="ayah">
      <p class="arabic" dir="rtl">أَسْكِنُوهُنَّ مِنْ حَيْثُ سَكَنتُم مِّن وُجْدِكُمْ</p>
      <p>"Lodge them (the wives) where you dwell, according to your means."</p>
      <cite>Surah At-Talaq 65:6</cite>
    </blockquote>
  </section>

  <section class="hadith">
    <h2>From the Sunnah</h2>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"Whoever would like his provision to be increased and his life to be extended, let him maintain family ties."</em></p>
      <cite>Sahih al-Bukhari 5986, Sahih Muslim 2557</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"The one who severs family ties will not enter Paradise."</em></p>
      <cite>Sahih al-Bukhari 5984, Sahih Muslim 2556</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>A man asked the Prophet ﷺ: "Who has the most right to my good companionship?" He said: <em>"Your mother."</em> The man asked: "Then who?" He said: <em>"Your mother."</em> The man asked: "Then who?" He said: <em>"Your mother."</em> The man asked: "Then who?" He said: <em>"Your father."</em></p>
      <cite>Sahih al-Bukhari 5971, Sahih Muslim 2548</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"Beware of entering upon women."</em> A man from the Ansar said: "O Messenger of Allah, what about the in-law (brother-in-law, etc.)?" He said: <em>"The in-law is death."</em></p>
      <cite>Sahih al-Bukhari 5232, Sahih Muslim 2172</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"The best of you are those who are best to their families, and I am the best of you to my family."</em></p>
      <cite>Tirmidhi 3895 - Graded Sahih by Al-Albani</cite>
    </blockquote>

    <blockquote class="hadith-text">
      <p>The Prophet ﷺ said: <em>"There is no obedience to the creation in disobedience to the Creator."</em></p>
      <cite>Musnad Ahmad 1098 - Graded Sahih by Al-Albani</cite>
    </blockquote>
  </section>

  <section class="explanation">
    <h2>Understanding - From the Scholars</h2>

    <h3>Rights of Parents</h3>
    <p>The scholars explain that honoring parents is one of the greatest obligations after worshipping Allah. This continues after marriage and includes:</p>
    <ul>
      <li>Speaking to them respectfully</li>
      <li>Caring for them in old age</li>
      <li>Providing for them if they are in need</li>
      <li>Making dua for them</li>
      <li>Visiting them regularly</li>
    </ul>
    <p>However, obedience to parents does not extend to sinful matters or to oppressing one''s spouse.</p>

    <h3>The Wife''s Right to Separate Accommodation</h3>
    <p>Shaykh Ibn Uthaymeen, Shaykh Ibn Baz, and the scholars of the Permanent Committee have ruled that:</p>
    <ul>
      <li>The wife has the right to her own accommodation</li>
      <li>She cannot be forced to live with her in-laws</li>
      <li>This is based on the verse "Lodge them where you dwell" (65:6)</li>
      <li>Even a separate room with her own facilities fulfills the minimum requirement</li>
      <li>If she agrees to live with in-laws, it should be by her genuine choice and she should be treated well</li>
    </ul>

    <h3>The Wife is NOT Obligated to Serve In-Laws</h3>
    <p>The scholars clarify that:</p>
    <ul>
      <li>The wife is not obligated to obey her in-laws</li>
      <li>Her obedience is to her husband in matters that are not sinful</li>
      <li>She is not required to cook, clean, or serve her in-laws</li>
      <li>If she does so, it is from her kindness and good character, not obligation</li>
      <li>The husband should not force her to serve his parents</li>
    </ul>

    <h3>Understanding "The In-Law is Death"</h3>
    <p>Shaykh Al-Fawzan and other scholars explain this hadith means that the danger from male in-laws (like brother-in-law) entering upon a woman is severe because:</p>
    <ul>
      <li>People are less cautious around relatives</li>
      <li>They may enter without hesitation</li>
      <li>This can lead to fitnah (temptation)</li>
      <li>The wife must observe hijab with male in-laws except her father-in-law</li>
      <li>She should not be alone with them (khalwah)</li>
    </ul>

    <h3>Balancing Parents and Spouse</h3>
    <p>Both have rights that must be fulfilled. The scholars advise:</p>
    <ul>
      <li>Neither should be neglected for the other</li>
      <li>The husband should protect his wife from unfair treatment by his family</li>
      <li>The wife should respect her husband''s love for his parents</li>
      <li>Each spouse should handle issues with their own family</li>
      <li>When in conflict, prioritize what is obligatory over what is voluntary</li>
    </ul>
  </section>

  <section class="application">
    <h2>Applying This</h2>
    <ul>
      <li><strong>Maintain family ties:</strong> This is obligatory and cutting ties is a major sin</li>
      <li><strong>Discuss living arrangements:</strong> Agree on where you will live and the wife''s comfort</li>
      <li><strong>Set boundaries respectfully:</strong> Both spouses should agree on boundaries and communicate them with wisdom</li>
      <li><strong>Husband''s role:</strong> Protect your wife from unfair treatment, defend her in her absence, and handle issues with your family yourself</li>
      <li><strong>Wife''s role:</strong> Respect your husband''s love for his family, be kind to in-laws, and don''t force him to choose sides</li>
      <li><strong>Observe proper hijab:</strong> The wife must cover in front of male in-laws (except father-in-law)</li>
      <li><strong>Avoid khalwah:</strong> Do not be alone with in-laws of the opposite gender</li>
      <li><strong>Handle your own family:</strong> Each spouse addresses issues with their own parents/siblings</li>
      <li><strong>Unite as a couple:</strong> Present a united front on decisions</li>
      <li><strong>Distinguish culture from Islam:</strong> Not all cultural expectations are Islamic obligations</li>
    </ul>
  </section>

  <section class="resources">
    <h2>Learn More</h2>
    <ul>
      <li><a href="https://islamqa.info/en/answers/7653/wife-forced-to-live-with-in-laws" target="_blank" rel="noopener noreferrer">Wife''s Right to Separate Accommodation</a> - IslamQA</li>
      <li><a href="https://islamqa.info/en/answers/43123/she-is-asking-about-the-ruling-on-obeying-parents-after-marriage" target="_blank" rel="noopener noreferrer">Obeying Parents After Marriage</a> - IslamQA</li>
      <li><a href="https://islamqa.info/en/answers/13738/is-the-wife-obliged-to-serve-her-husbands-family" target="_blank" rel="noopener noreferrer">Is the Wife Obliged to Serve In-Laws?</a> - IslamQA</li>
      <li><a href="https://islamqa.info/en/answers/10463/the-in-law-is-death" target="_blank" rel="noopener noreferrer">Explanation of "The In-Law is Death"</a> - IslamQA</li>
      <li><a href="https://www.troid.org/category/marriage/the-islamic-marriage/" target="_blank" rel="noopener noreferrer">The Islamic Marriage</a> - TROID</li>
      <li><a href="https://abukhadeejah.com/category/marriage/" target="_blank" rel="noopener noreferrer">Marriage Articles</a> - Abu Khadeejah</li>
    </ul>
  </section>

  <section class="reflection">
    <h2>Reflect Together</h2>
    <ol>
      <li>What are our families'' expectations of us as a married couple?</li>
      <li>Where will we live? Does the wife feel comfortable with the arrangement?</li>
      <li>How often will we visit each family?</li>
      <li>What boundaries do we need to establish?</li>
      <li>How will we handle disagreements involving family?</li>
      <li>How will we split time between families during Eid and holidays?</li>
      <li>What cultural practices will we continue and what will we change based on Islamic guidance?</li>
    </ol>
  </section>

</div>',
  5
);

-- Verify all 5 modules were inserted
SELECT order_index, title, LENGTH(content) as content_length 
FROM public.modules 
ORDER BY order_index;
