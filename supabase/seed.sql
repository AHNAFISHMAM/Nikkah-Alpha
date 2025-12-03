-- =====================================================
-- SEED DATA FOR NIKAHPREP APPLICATION
-- Run this in Supabase SQL Editor after migrations
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CHECKLIST CATEGORIES & ITEMS (31 items, 5 categories)
-- =====================================================

-- Insert Categories
INSERT INTO checklist_categories (id, name, description, icon, sort_order) VALUES
  ('cat_spiritual', 'Spiritual Preparation', 'Strengthen your faith and Islamic foundation', '🤲', 1),
  ('cat_financial', 'Financial Planning', 'Ensure financial clarity and agreements', '💰', 2),
  ('cat_family', 'Family & Relationships', 'Build healthy family dynamics', '👨‍👩‍👧', 3),
  ('cat_personal', 'Personal Development', 'Grow individually for a stronger partnership', '🌱', 4),
  ('cat_future', 'Future Planning', 'Discuss and align on future goals', '🎯', 5)
ON CONFLICT (id) DO NOTHING;

-- Spiritual Preparation (6 items)
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('cat_spiritual', 'Complete Islamic Marriage Course', 'Take a pre-marriage course from qualified scholars to understand Islamic marriage principles', true, 1),
  ('cat_spiritual', 'Study Rights & Responsibilities', 'Learn about the rights and responsibilities of spouses in Islam from authentic sources', true, 2),
  ('cat_spiritual', 'Discuss Religious Practice Level', 'Openly discuss your levels of prayer, fasting, hijab, and other religious observances', true, 3),
  ('cat_spiritual', 'Learn Marriage Duas', 'Memorize important duas for marriage, including the wedding night dua', false, 4),
  ('cat_spiritual', 'Seek Family Blessings', 'Get parental approval and blessings from both families', true, 5),
  ('cat_spiritual', 'Perform Istikhara Prayer', 'Pray Salat al-Istikhara seeking Allah''s guidance before proceeding', true, 6)
ON CONFLICT DO NOTHING;

-- Financial Planning (7 items)
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('cat_financial', 'Agree on Mahr Amount', 'Discuss and finalize the mahr (dowry) amount with transparency and fairness', true, 1),
  ('cat_financial', 'Disclose Financial Situation', 'Share complete information about income, debts, savings, and financial obligations', true, 2),
  ('cat_financial', 'Create Wedding Budget', 'Plan a realistic budget for the wedding ceremony that honors Islamic simplicity', true, 3),
  ('cat_financial', 'Discuss Financial Goals', 'Align on saving, investing, spending habits, and long-term financial objectives', true, 4),
  ('cat_financial', 'Plan Living Arrangements', 'Decide on housing situation, location, and whether to rent or buy', true, 5),
  ('cat_financial', 'Set Up Banking Arrangements', 'Decide on joint accounts, separate accounts, or a combination approach', false, 6),
  ('cat_financial', 'Clarify Financial Responsibilities', 'Discuss who will pay for what and how household expenses will be managed', true, 7)
ON CONFLICT DO NOTHING;

-- Family & Relationships (6 items)
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('cat_family', 'Meet Both Families', 'Ensure both families have met, connected, and built a relationship', true, 1),
  ('cat_family', 'Discuss In-Law Boundaries', 'Establish healthy boundaries with extended family while maintaining Islamic respect', true, 2),
  ('cat_family', 'Plan Family Visit Frequency', 'Agree on how often you''ll visit both families and expectations around holidays', false, 3),
  ('cat_family', 'Discuss Children Timeline', 'Talk openly about when or if you want to have children', true, 4),
  ('cat_family', 'Align on Parenting Values', 'Discuss parenting styles, discipline approaches, and children''s education plans', true, 5),
  ('cat_family', 'Address Cultural Differences', 'Navigate any cultural or family tradition differences with wisdom and compromise', false, 6)
ON CONFLICT DO NOTHING;

-- Personal Development (6 items)
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('cat_personal', 'Complete Health Check-Up', 'Get a comprehensive pre-marital health screening and share results honestly', true, 1),
  ('cat_personal', 'Discuss Communication Styles', 'Learn each other''s communication preferences and how you express emotions', true, 2),
  ('cat_personal', 'Identify Conflict Resolution Strategy', 'Agree on Islamic principles for handling disagreements and seeking mediation', true, 3),
  ('cat_personal', 'Share Personal Goals', 'Discuss individual aspirations, dreams, and how you''ll support each other', true, 4),
  ('cat_personal', 'Discuss Lifestyle Preferences', 'Talk about daily routines, hobbies, social life, and personal habits', false, 5),
  ('cat_personal', 'Learn Love Languages', 'Understand how you each prefer to give and receive love and affection', false, 6)
ON CONFLICT DO NOTHING;

-- Future Planning (6 items)
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('cat_future', 'Discuss Career Ambitions', 'Share professional goals and the support you''ll need from each other', true, 1),
  ('cat_future', 'Plan Living Location', 'Decide where you want to live long-term and factors that might require relocation', true, 2),
  ('cat_future', 'Align on Work-Life Balance', 'Discuss expectations about working outside the home for both spouses', true, 3),
  ('cat_future', 'Set 5-Year Goals', 'Create a shared vision for the next 5 years of your marriage', false, 4),
  ('cat_future', 'Discuss Further Education', 'Talk about plans for pursuing additional education or certifications', false, 5),
  ('cat_future', 'Plan for Emergencies', 'Discuss life insurance, wills, emergency funds, and estate planning', false, 6)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. PRE-MARRIAGE MODULES & LESSONS (5 modules, 20 lessons)
-- =====================================================

-- Module 1: Islamic Marriage Foundations
INSERT INTO modules (id, title, description, icon, estimated_duration, sort_order, is_published) VALUES
  ('mod_foundations', 'Islamic Marriage Foundations', 'Learn the rights, responsibilities, and beauty of marriage in Islam', '📖', 30, 1, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (module_id, title, content, sort_order) VALUES
  ('mod_foundations', 'The Purpose of Marriage in Islam',
   'Marriage in Islam is not merely a social contract, but a sacred bond and an act of worship (ibadah). The Prophet Muhammad ﷺ said: "When a man marries, he has fulfilled half of his religion" (Bayhaqi).

Marriage serves multiple purposes in Islam:
- Spiritual Growth: It completes half of our faith and provides a partner in worship
- Emotional Fulfillment: It offers companionship, love, and mercy (mawaddah wa rahmah)
- Physical Needs: It provides halal intimacy and protects from prohibited relationships
- Social Stability: It forms the foundation of family and society
- Continuation: It enables righteous offspring who will continue the Muslim ummah

Allah says in the Quran: "And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts" (Quran 30:21).', 1),

  ('mod_foundations', 'Rights of the Wife',
   'Islam grants wives comprehensive rights that must be honored:

Financial Rights:
- Mahr (dowry): A mandatory gift from the husband, which becomes her exclusive property
- Maintenance (nafaqah): The husband must provide housing, food, clothing, and healthcare
- Financial independence: Her earnings remain her own unless she chooses to contribute

Personal Rights:
- Kind treatment: The Prophet ﷺ said "The best of you are those who are best to their wives" (Tirmidhi)
- Respect and dignity: She must be honored and never humiliated
- Physical intimacy: Her needs must be met with gentleness and consideration
- Education: The right to learn and grow intellectually and spiritually
- Family connections: The right to maintain relationships with her family

The husband is the guardian (qawwam) of his wife, which means protector and maintainer, not oppressor.', 2),

  ('mod_foundations', 'Rights of the Husband',
   'Islam also establishes clear rights for the husband:

Respect and Obedience:
- The wife should respect her husband and his leadership in matters that are halal
- Obedience in matters that don''t contradict Islamic teachings
- Loyalty and faithfulness in all circumstances

Household Management:
- Creating a peaceful home environment
- Managing household affairs with wisdom
- Raising children with Islamic values

Intimacy:
- Fulfilling his physical needs with love and affection
- Not denying intimacy without valid reason

However, these rights come with the condition that the husband fulfills his obligations first. The Prophet ﷺ emphasized mutual rights and said: "All of you are shepherds and all of you are responsible for your flock" (Bukhari).', 3),

  ('mod_foundations', 'The Wedding (Nikah) Process',
   'The Islamic marriage contract (Nikah) has essential requirements:

Essential Elements:
1. Ijab and Qabul: Clear proposal and acceptance in one sitting
2. Witnesses: At least two male witnesses or one male and two female witnesses
3. Mahr: Agreement on the dowry amount (immediate or deferred)
4. Wali: The bride''s guardian (father or male relative) must consent

Recommended Practices:
- Public announcement of the marriage
- Walimah (wedding feast) - the Prophet ﷺ said "Give a feast even if it is only a sheep" (Bukhari)
- Keeping the ceremony simple and avoiding extravagance
- Making dua for the couple

The contract is a legal and spiritual commitment. The Prophet ﷺ said: "The most blessed marriage is the one with the least expense" (Bayhaqi).

Remember: Culture should not override Islamic requirements. Distinguish between what is Islamic and what is cultural tradition.', 4),

  ('mod_foundations', 'Prophetic Guidance on Marriage',
   'The Prophet Muhammad ﷺ set the ultimate example in marriage:

With Khadijah (RA):
- She was his first wife and supported him for 25 years
- He remained faithful to her memory even after her death
- He said "She believed in me when people disbelieved" (Bukhari)

With Aisha (RA):
- He showed playfulness and humor: they would race together
- He helped with household chores: "He would sew his garment, repair his shoes, and do what men do in their houses" (Ahmad)
- He showed affection publicly, calling her by endearing names

General Teachings:
- "I am the best of you to my family" (Tirmidhi)
- He never hit any of his wives
- He consulted with his wives on important matters
- He was patient during disagreements
- He emphasized that men have no right to strike women

Follow the Sunnah in marriage: be gentle, be helpful, communicate with kindness, and prioritize your spouse''s happiness.', 5);

-- Module 2: Communication & Conflict Resolution
INSERT INTO modules (id, title, description, icon, estimated_duration, sort_order, is_published) VALUES
  ('mod_communication', 'Communication & Conflict Resolution', 'Master healthy communication patterns for a harmonious marriage', '💬', 25, 2, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (module_id, title, content, sort_order) VALUES
  ('mod_communication', 'Active Listening Skills',
   'True listening is the foundation of marital communication:

The Art of Listening:
- Give full attention: Put away your phone and make eye contact
- Don''t interrupt: Let your spouse finish before responding
- Reflect back: "What I''m hearing is..." to confirm understanding
- Validate feelings: Acknowledge emotions even if you disagree
- Ask clarifying questions: Seek to understand, not to respond

Islamic Perspective:
Allah says: "And speak to people good words" (Quran 2:83). This includes your spouse—especially your spouse.

Common Listening Mistakes:
- Planning your response while they''re still talking
- Bringing up past issues
- Dismissing their feelings ("You''re overreacting")
- Trying to "fix" when they just need to be heard
- Multitasking while they''re talking

Practice the Prophetic example: The Prophet ﷺ would face the person speaking to him completely, giving them his full attention.

Exercise: This week, practice reflective listening. When your partner shares something, respond with "So what you''re saying is..." before sharing your perspective.', 1),

  ('mod_communication', 'Speaking with Kindness',
   'How you speak matters as much as what you say:

Principles of Kind Speech:
- Choose gentle words, especially during disagreements
- Avoid criticism, contempt, and sarcasm
- Use "I feel" statements instead of "You always..."
- Express appreciation regularly: Thank your spouse for small things
- Give sincere compliments often

The Prophet ﷺ said: "A good word is charity" (Bukhari). In marriage, kind words are investments in your relationship.

Words to Avoid:
- "You never..." or "You always..."
- Name-calling or insults
- Comparisons to others
- Threats of divorce
- Bringing up old mistakes

Words to Use More:
- "I appreciate when you..."
- "Thank you for..."
- "I love how you..."
- "Can we talk about...?"
- "I need your help with..."

Remember: Once words are spoken, you cannot take them back. The tongue has no bones but it can break hearts. Guard it carefully, especially with your beloved spouse.', 2),

  ('mod_communication', 'Handling Disagreements Islamically',
   'Conflict is normal—how you handle it makes the difference:

Islamic Principles for Conflict:
1. Intention (Niyyah): Argue to find solutions, not to win
2. Anger Management: The Prophet ﷺ said "The strong person is not the one who can wrestle, but the one who controls himself when angry" (Bukhari)
3. No Silent Treatment: Islam prohibits cutting off relations beyond 3 days
4. Seek to Understand: Maybe you''re both right from different perspectives

Rules for Fair Fighting:
- One issue at a time (don''t bring up the past)
- No name-calling or insults
- Take a break if emotions escalate
- Never go to bed angry: Resolve or agree to pause respectfully
- No involving family without mutual agreement
- Remember you''re on the same team

When to Seek Help:
- Repeated conflicts without resolution
- Escalating anger or tension
- Communication breakdown
- When one spouse requests it

The Prophet ﷺ mediated between spouses and recommended wise family members or scholars as mediators. There is no shame in seeking help—it shows maturity and commitment to your marriage.', 3),

  ('mod_communication', 'Non-Verbal Communication',
   'Actions speak louder than words:

Body Language in Marriage:
- Eye contact shows attentiveness and respect
- Facial expressions convey warmth or coldness
- Tone of voice can make kind words sound harsh
- Physical touch communicates love and connection
- Posture (open vs. closed) affects receptiveness

The Prophet ﷺ would:
- Smile at his wives
- Hold hands with Aisha (RA) in public
- Show affection through gentle touch
- Make eye contact during conversations

Positive Non-Verbal Habits:
- Greet your spouse warmly when you reunite
- Maintain gentle eye contact during conversations
- Smile often—it''s Sunnah and strengthens bonds
- Use appropriate touch: hand-holding, hugs, gentle shoulder touch
- Your posture: Face them fully, lean in slightly

Negative Non-Verbal Habits to Avoid:
- Eye-rolling or sighing
- Crossed arms or turning away
- Looking at your phone while they talk
- Harsh tone even with kind words
- Avoiding physical affection

Sometimes the best communication is a warm embrace, a genuine smile, or sitting together in comfortable silence. Your presence and attention are gifts to your spouse.', 4);

-- Module 3: Intimacy & Emotional Connection
INSERT INTO modules (id, title, description, icon, estimated_duration, sort_order, is_published) VALUES
  ('mod_intimacy', 'Intimacy & Emotional Connection', 'Build deep emotional and physical intimacy the Islamic way', '❤️', 25, 3, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (module_id, title, content, sort_order) VALUES
  ('mod_intimacy', 'Islamic Perspective on Intimacy',
   'Physical intimacy in marriage is a blessing and an act of worship:

The Halal Nature of Intimacy:
- Allah created sexual desire as a gift within marriage
- The Prophet ﷺ said intimacy is charity (sadaqah) (Muslim)
- It strengthens the bond between spouses
- It protects both partners from prohibited relationships

Islamic Guidelines:
- Intimacy is only permissible within marriage
- Both spouses have equal rights to intimacy
- Gentleness, foreplay, and consideration are emphasized
- Communication about needs and preferences is encouraged
- Personal hygiene and beautification for your spouse is Sunnah

The Prophet ﷺ said: "Let none of you fall upon his wife like an animal, but let there first be a messenger between them." They asked, "What is that messenger?" He said, "Kissing and words" (Daylami).

Rights and Responsibilities:
- Neither spouse should deny the other without valid reason
- Health issues or exhaustion are valid reasons to postpone
- Menstruation and post-natal bleeding are natural breaks
- Both partners should make effort to be attractive for each other

Remember: This is a private matter between spouses. Islam protects the sanctity and privacy of the marital relationship.', 1),

  ('mod_intimacy', 'Building Emotional Intimacy',
   'Emotional connection is the foundation of physical intimacy:

What is Emotional Intimacy?
- Sharing your inner world: fears, dreams, vulnerabilities
- Being fully known and fully accepted
- Creating safe space for honesty
- Supporting each other through difficulties
- Celebrating each other''s successes

How to Build Emotional Intimacy:
1. Quality Time: Regular deep conversations without distractions
2. Vulnerability: Share your struggles and insecurities
3. Empathy: Try to understand their perspective and feelings
4. Appreciation: Express gratitude for who they are, not just what they do
5. Shared Spiritual Goals: Pray together, read Quran together, attend Islamic events together

The Prophet ﷺ and Aisha (RA) would:
- Share meals and drink from the same cup
- Engage in meaningful conversations
- Support each other''s spiritual growth
- Show affection and tenderness

Barriers to Emotional Intimacy:
- Always being busy with no quality time
- Fear of vulnerability or judgment
- Unresolved conflicts creating distance
- Lack of appreciation and gratitude
- Not prioritizing your spouse

Create rituals of connection: Daily check-ins, weekly date nights, monthly deep conversations about your relationship and goals.', 2),

  ('mod_intimacy', 'Building Trust & Vulnerability',
   'Trust is the bedrock of a strong marriage:

What is Trust in Marriage?
- Reliability: Following through on promises
- Honesty: Truth-telling even when difficult
- Fidelity: Emotional and physical faithfulness
- Confidentiality: Protecting your spouse''s secrets
- Safety: Never using vulnerabilities against them

How to Build Trust:
1. Be Consistent: Your words and actions should align
2. Communicate Openly: Share your feelings and thoughts
3. Honor Commitments: Do what you say you''ll do
4. Protect Privacy: Never discuss intimate matters with others
5. Avoid Opposite Gender Friendships: Maintain Islamic boundaries

The Prophet ﷺ said: "The believers, in their love, mutual kindness, and close ties, are like one body; when any part complains, the whole body responds to it with wakefulness and fever" (Bukhari & Muslim).

Rebuilding Broken Trust:
- Acknowledge the hurt caused
- Take full responsibility without excuses
- Be patient—trust takes time to rebuild
- Demonstrate changed behavior consistently
- Seek counseling if needed

Be worthy of your spouse''s trust. Protect their reputation, keep their secrets, and never betray their confidence. Your spouse should feel safer with you than with anyone else in the world.', 3),

  ('mod_intimacy', 'Maintaining Romance & Affection',
   'Keep the spark alive throughout your marriage:

Romance is Sunnah:
- The Prophet ﷺ raced with Aisha (RA) and let her win
- He would drink from the same spot she drank from
- He showed affection and gave her endearing nicknames
- He made time for fun despite his responsibilities

Practical Ways to Maintain Romance:
1. Regular Date Nights: Even at home with special meals
2. Small Surprises: Love notes, favorite treats, unexpected gifts
3. Words of Affection: "I love you," "I''m grateful for you"
4. Physical Touch: Holding hands, hugs, sitting close
5. Compliments: Appreciate their appearance and character
6. Quality Time: Put phones away and be fully present
7. Serve Each Other: Acts of service show love

The 5 Love Languages:
1. Words of Affirmation: Verbal compliments and appreciation
2. Quality Time: Undivided attention
3. Gifts: Thoughtful presents
4. Acts of Service: Helping with tasks
5. Physical Touch: Hugs, hand-holding, cuddling

Learn your spouse''s primary love language and speak it regularly.

Don''t Let Life Kill Romance:
- Children, work, and stress can drain romance
- Schedule time for each other
- Keep courtship alive even after years of marriage
- Remember why you fell in love

The Prophet ﷺ said: "Everything that does not involve the remembrance of Allah is idle play, except for four things: a man playing with his wife..." (Nasai). Romance in marriage is blessed!', 4);

-- Module 4: Financial Harmony
INSERT INTO modules (id, title, description, icon, estimated_duration, sort_order, is_published) VALUES
  ('mod_financial', 'Financial Harmony in Marriage', 'Manage money together with wisdom and Islamic principles', '💵', 20, 4, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (module_id, title, content, sort_order) VALUES
  ('mod_financial', 'Islamic Financial Obligations',
   'Understand the financial framework of Islamic marriage:

Husband''s Financial Responsibilities:
1. Mahr: The mandatory wedding gift to the bride
2. Housing: Providing appropriate accommodation
3. Food: Ensuring adequate nutrition
4. Clothing: Suitable attire for all seasons
5. Household Expenses: Utilities, maintenance, necessities
6. Healthcare: Medical needs and treatments

The standard is according to his means—not poverty, not extravagance.

Wife''s Financial Rights:
- Her earnings are entirely her own
- She is NOT obligated to spend on the household
- She can contribute voluntarily and be rewarded
- Her mahr is her exclusive property
- She has the right to financial security

Allah says: "Let the man of means spend according to his means" (Quran 65:7).

Shared Financial Decisions:
While the husband has the obligation, both spouses should discuss:
- Major purchases
- Investment decisions
- Saving strategies
- Children''s education
- Charitable giving (both should give Zakat from their own wealth)

Financial transparency and mutual consultation lead to harmony and barakah (blessing) in wealth.', 1),

  ('mod_financial', 'Budgeting as a Couple',
   'Create a sustainable financial plan together:

Steps to Build a Couple''s Budget:
1. List All Income: Both spouses'' earnings (remember: wife''s income is optional contribution)
2. Track Expenses: Fixed (rent, utilities) and variable (food, entertainment)
3. Set Priorities: Needs vs. wants, guided by Islamic values
4. Create Categories: Housing, food, transportation, savings, charity
5. Review Regularly: Monthly budget meetings to adjust

Islamic Budgeting Principles:
- Live within your means: Avoid debt and interest (riba)
- Give charity first: "The upper hand (that gives) is better than the lower hand (that receives)" (Bukhari)
- Save for the future: Emergency fund, children''s education, Hajj
- Avoid extravagance: "Eat and drink, but waste not by excess" (Quran 7:31)
- Don''t hoard: Money should circulate and benefit others

Budget Categories to Consider:
- Housing (rent/mortgage): 25-30%
- Food: 10-15%
- Transportation: 10-15%
- Utilities: 5-10%
- Savings: 10-20%
- Charity: 2.5% (Zakat) + voluntary sadaqah
- Debt repayment: As much as possible
- Personal/fun money: 5-10% each spouse

Have monthly "money meetings" where you review spending, celebrate victories, and adjust plans. Transparency prevents resentment.', 2),

  ('mod_financial', 'Avoiding Financial Conflicts',
   'Money is a top source of marital conflict—prevent it:

Common Financial Conflicts:
- Different spending habits (saver vs. spender)
- Secret spending or hidden debt
- Unequal contribution debates
- In-law financial requests
- Disagreement on priorities

Prevention Strategies:
1. Total Transparency: No financial secrets
2. Shared Goals: Align on what you''re working toward
3. Personal Allowances: Each spouse has guilt-free spending money
4. Agreed Spending Limits: Large purchases require discussion
5. Regular Communication: Monthly budget meetings

Islamic Perspective on Conflict:
- The husband''s obligation to provide doesn''t diminish if the wife earns
- The wife''s contribution is voluntary charity, not obligation
- Both should practice generosity and selflessness
- Wealth is a trust (amanah) from Allah

Warning Signs:
- Hiding purchases or debt
- Arguing about every expense
- One spouse controlling all money
- Financial stress causing physical symptoms
- Avoiding money discussions

Solutions:
- Seek Islamic financial counseling
- Attend money management courses together
- Read Islamic finance books
- Make dua for barakah in your wealth
- Remember: Contentment (qana''ah) is true wealth

The Prophet ﷺ said: "Richness is not having many possessions, but richness is being content with oneself" (Bukhari).', 3),

  ('mod_financial', 'Halal Wealth Building',
   'Grow your wealth in ways pleasing to Allah:

Prohibited (Haram) Income Sources:
- Interest (riba): Loans, conventional mortgages, interest-bearing accounts
- Gambling and lottery
- Alcohol, pork, and other prohibited products
- Dishonest business practices
- Exploitative or unjust dealings

Halal Investment Options:
1. Islamic Banking: Sharia-compliant accounts and financing
2. Halal Stocks: Companies not involved in haram activities
3. Real Estate: Property investment following Islamic principles
4. Small Business: Halal entrepreneurship
5. Islamic Bonds (Sukuk): Alternative to conventional bonds
6. Gold and Silver: Tangible assets

Growing Wealth Islamically:
- Seek halal income only: "Allah is Pure and accepts only what is pure" (Muslim)
- Give Zakat (2.5% annually on savings)
- Give regular sadaqah (voluntary charity)
- Avoid debt when possible; if needed, pay it quickly
- Invest in your family''s Islamic education
- Save for Hajj—it''s an investment in your Akhirah

Barakah (Blessing) in Wealth:
- Wake up early: The Prophet ﷺ made dua for barakah in early morning
- Be honest in business: Trust brings blessing
- Give charity: It never decreases wealth (Hadith)
- Maintain family ties: Strengthens barakah
- Make dua: Ask Allah for halal provision

Remember: "And whoever fears Allah—He will make for him a way out. And will provide for him from where he does not expect" (Quran 65:2-3).

True wealth is not measured by bank accounts but by how much you have invested in the Hereafter.', 4);

-- Module 5: Navigating Family & In-Laws
INSERT INTO modules (id, title, description, icon, estimated_duration, sort_order, is_published) VALUES
  ('mod_family', 'Navigating Family & In-Laws', 'Build healthy relationships while maintaining boundaries', '👪', 20, 5, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (module_id, title, content, sort_order) VALUES
  ('mod_family', 'Honoring Parents After Marriage',
   'Balance your duties to parents and spouse:

Islamic Obligations to Parents:
- Allah commands: "And your Lord has decreed that you worship none but Him, and that you be dutiful to your parents" (Quran 17:23)
- Kindness to parents is mandatory even if they are non-Muslim
- Their rights are tremendous and their dua is powerful

Marriage Changes the Balance:
- Your spouse becomes your priority
- Your nuclear family (spouse and children) takes precedence
- Parents'' rights remain, but within appropriate boundaries
- You still owe them respect, kindness, and financial support if needed

The Prophet ﷺ said: "Each of you is a shepherd and each of you is responsible for his flock. A man is the shepherd of his family and he is responsible for his flock" (Bukhari).

Practical Balance:
- Visit parents regularly but not at the expense of your marriage
- Call and check on them frequently
- Involve spouse in family events
- Defend your spouse if parents criticize them
- Set boundaries respectfully without cutting ties
- Support parents financially if they''re in need

When Parents and Spouse Conflict:
- Listen to both sides
- Don''t force spouse to tolerate disrespect
- Address issues privately with parents
- Present a united front with your spouse
- Seek mediation from wise family members if needed

Remember: Your marriage is your primary family now. Protect it while honoring your parents.', 1),

  ('mod_family', 'Setting Healthy Boundaries',
   'Boundaries protect your marriage:

Why Boundaries Are Islamic:
- Protects your marital privacy
- Prevents resentment and conflict
- Maintains respect for all parties
- Allows your marriage to flourish

Types of Boundaries:
1. Physical: Your home is your private space
2. Financial: You''re not obligated to share all financial details with in-laws
3. Decision-Making: Major decisions are between you and your spouse
4. Privacy: Intimate matters stay between spouses
5. Time: You need couple time without family interference

How to Set Boundaries Respectfully:
- Use "we" language: "We''ve decided..."
- Be kind but firm
- Don''t over-explain or justify
- Offer alternatives when saying no
- Be consistent
- Your spouse should set boundaries with their own parents

Examples of Healthy Boundaries:
- "We appreciate the advice, but we''ve decided to handle it this way"
- "We need advance notice before visits"
- "We won''t be discussing our private matters"
- "We need this time alone as a couple"
- "We''ll visit on these days, but other days we have plans"

Common Boundary Violations:
- Unannounced visits
- Constant interference in decisions
- Criticism of spouse or parenting
- Financial demands
- Sharing your private information with others
- Expecting you to live with them or visit daily

Remember: Boundaries are not walls; they''re gates. You control when they open and close. This is not disrespect—it''s healthy relationship management.', 2),

  ('mod_family', 'Managing Family Expectations',
   'Navigate differing expectations with wisdom:

Common Family Expectations:
- Frequent visits or living together
- Financial support beyond your means
- Involvement in all decisions
- Grandchildren (timeline and quantity)
- Career choices
- Lifestyle choices

Addressing Expectations:
1. Clarify Early: Discuss expectations before marriage
2. Communicate Clearly: Be honest about what you can/cannot do
3. Be Proactive: Don''t wait for conflicts to arise
4. Offer Compromises: Find middle ground when possible
5. Stay United: You and spouse must be aligned

The Islamic Perspective:
- You''re not obligated to live with in-laws (though it can be virtuous if harmonious)
- You''re not required to visit daily or weekly
- You control your family planning decisions
- You manage your finances as you see fit (within Islamic guidelines)
- Your career is your choice (within halal boundaries)

Cultural vs. Islamic:
Many family expectations are cultural, not Islamic:
- Extended family living arrangements
- Large wedding celebrations
- Dowry from bride''s family (this is un-Islamic)
- Specific number of children
- Giving up career

When Expectations Conflict with Islam:
- Politely educate about Islamic teachings
- Stand firm on Islamic principles
- Offer alternatives that honor both Islam and family
- Seek advice from knowledgeable scholars

Remember: Allah''s commands come before cultural traditions. You can honor your culture while following Islam, but when they conflict, choose Islam.', 3),

  ('mod_family', 'Presenting a United Front',
   'You and your spouse are a team:

Why Unity Matters:
- Shows commitment to your marriage
- Prevents manipulation or triangulation
- Builds respect from extended family
- Protects your relationship

The United Front Principle:
- Private disagreements, public unity
- Never criticize spouse to your family
- Support spouse''s decisions even if you initially disagreed
- Discuss issues privately, then present one decision
- Don''t allow family to create division

The Prophet ﷺ said: "None of you truly believes until he loves for his brother what he loves for himself" (Bukhari). This applies especially to your spouse.

Practical Application:
1. Discuss family issues privately first
2. Agree on a response together
3. Let each spouse deal with their own family when possible
4. Back each other up in front of others
5. Don''t throw spouse under the bus to please family

Common Mistakes:
- "My mother wants us to..." (instead of "We''ve decided...")
- Complaining about spouse to your parents
- Allowing parents to criticize spouse in your presence
- Making unilateral decisions about family matters
- Not defending spouse when family is unfair

When You Disagree with Your Spouse:
- Discuss it privately and respectfully
- Try to understand their perspective
- Compromise where possible
- Once a decision is made, support it publicly
- Don''t revisit the disagreement in front of family

Remember: Your marriage is your team. Your extended family is your supporters, not your coaches. Keep your marriage relationship primary and protected. When families see your unity, they''ll respect your boundaries more.', 4);

-- =====================================================
-- 3. DISCUSSION PROMPTS (16 prompts, 7 categories)
-- =====================================================

INSERT INTO discussion_prompts (category, title, description, questions, tips, sort_order) VALUES
  ('values', 'Core Islamic Values',
   'Discuss your understanding and practice of Islam to ensure alignment on what matters most',
   '["How important is Islam in your daily life?", "What does practicing Islam look like for you (prayer, fasting, modesty, etc.)?", "How do you want to raise children Islamically?", "What role should the Quran and Sunnah play in our marriage and decision-making?", "How do you handle situations where Islamic values conflict with cultural or social norms?"]'::jsonb,
   'Be honest about your current practice level, not just your ideals. Growth is expected in marriage, but starting points should be compatible. If there are significant gaps, discuss how you''ll support each other''s growth.',
   1),

  ('values', 'Life Priorities & Goals',
   'Understand what matters most to each of you and ensure compatibility',
   '["What are your top 3 priorities in life right now?", "How do you balance deen (religion), family, career, and personal growth?", "What are your non-negotiables in life?", "Where do you see yourself in 5, 10, and 20 years?", "What legacy do you want to leave behind?"]'::jsonb,
   'Listen without judgment. Priorities may differ slightly but should be compatible. Someone who prioritizes career above all may not be compatible with someone who prioritizes family time.',
   2),

  ('family', 'In-Law Relationships & Boundaries',
   'Set expectations about family involvement and boundaries from the start',
   '["How close are you to your family? How often do you currently see them?", "What level of involvement do you expect from in-laws in our marriage?", "How will we handle disagreements or conflicts involving family?", "What boundaries should we set with extended family?", "Do you expect us to live with or near your parents?", "How will we handle family requests for money or time?"]'::jsonb,
   'In-law issues are a major source of marital conflict. Be proactive in discussing expectations. Remember: your spouse should come before your extended family, while still honoring parents.',
   3),

  ('family', 'Children & Parenting Philosophy',
   'Align on having children and your approach to raising them',
   '["Do you want children? How many?", "When should we start trying to have children?", "What if we struggle with infertility? Would you consider adoption or medical interventions?", "What parenting style resonates with you (strict, relaxed, balanced)?", "How will we educate our children (public school, Islamic school, private school, homeschool)?", "What are your views on discipline? How will we handle misbehavior?", "Who will stay home with children, or will both of us work?"]'::jsonb,
   'Don''t assume your partner shares your vision. Discuss both the joys and challenges. Consider the financial impact of children and career decisions. Agree on a balanced approach to raising righteous, well-adjusted Muslims.',
   4),

  ('lifestyle', 'Daily Life & Routines',
   'Understand each other''s lifestyle preferences and habits to avoid future friction',
   '["Are you a morning person or night owl?", "How important is cleanliness and organization to you? What does a clean home look like to you?", "Do you prefer socializing frequently or quiet time at home?", "What are your hobbies and interests? How much time do you spend on them?", "How do you like to spend your weekends?", "What are your deal-breakers in terms of lifestyle (smoking, pets, etc.)?"]'::jsonb,
   'Small lifestyle differences can become major issues. Discuss and find compromises early. Be honest about what you can and cannot tolerate long-term. Remember: you''ll likely need to adjust some habits.',
   5),

  ('lifestyle', 'Social Life & Friendships',
   'Discuss boundaries around friendships and social activities',
   '["How much time do you spend with friends? How important is it to maintain these friendships?", "What boundaries should exist with the opposite gender (at work, in social settings)?", "How often do you want to host guests at our home?", "What social activities are important to you (community events, Islamic gatherings, etc.)?", "How will we handle friendships that may not align with Islamic values?", "Should we have shared friends as a couple or maintain separate friendships?"]'::jsonb,
   'Balance individual friendships with couple time. Islam has clear guidelines on opposite-gender interactions—ensure you''re both on the same page. Hosting and socializing takes energy and money, so align expectations.',
   6),

  ('finances', 'Money Management & Financial Philosophy',
   'Align on financial habits, goals, and responsibilities',
   '["How do you currently manage money (budgeting, spontaneous spending, etc.)?", "Are you a saver or a spender?", "What are your short-term and long-term financial goals?", "How should we split expenses? Joint account, separate accounts, or both?", "What are your thoughts on debt? Is it ever acceptable?", "How much should we save vs. enjoy now?", "How important is financial security to you?"]'::jsonb,
   'Money is a top cause of marital conflict. Be completely transparent. Spenders and savers can make it work, but both need to compromise. Create a budget together and stick to it.',
   7),

  ('finances', 'Debts & Financial Transparency',
   'Full disclosure of your current financial situation',
   '["Do you have any debts (student loans, car loans, credit cards, personal debts)?", "How much debt? What are the terms and monthly payments?", "What is your current income and job stability?", "Do you have any savings or investments?", "Do you have any financial obligations to family members?", "Have you ever declared bankruptcy or had credit issues?"]'::jsonb,
   'Islamic marriage requires full financial disclosure before nikah. Hiding debt is dishonest and can invalidate trust. Share everything now to avoid devastating surprises later. Make a plan together to address any debts.',
   8),

  ('finances', 'Mahr & Wedding Budget',
   'Discuss mahr amount and wedding expectations clearly and early',
   '["What mahr amount are you expecting or offering?", "Should it be paid immediately or deferred?", "What kind of wedding do you envision (simple, moderate, elaborate)?", "What is a realistic budget for our wedding?", "Who pays for what (traditionally, islamically, or modern split)?", "How important is the wedding celebration vs. saving money for our future?"]'::jsonb,
   'The Prophet ﷺ encouraged modest celebrations. Don''t start your marriage in debt for one day. The most blessed nikah is the simplest. Mahr is the wife''s right—agree on a fair amount that reflects respect and the husband''s means.',
   9),

  ('communication', 'Communication Styles',
   'Learn how each of you communicates and processes emotions',
   '["How do you typically express anger or frustration?", "Do you need time alone to cool down, or do you prefer to talk things out immediately?", "How do you like to receive feedback or criticism?", "What makes you feel heard and understood?", "How do you handle stress? Do you withdraw or seek support?", "What topics are hard for you to discuss?"]'::jsonb,
   'Understanding communication styles prevents misunderstandings and hurt feelings. Some people process internally, others externally. Neither is wrong—just different. Learn your partner''s style and adapt.',
   10),

  ('communication', 'Conflict Resolution Strategy',
   'Establish how you will handle inevitable disagreements',
   '["How did your parents handle conflict? What did you learn from them (good or bad)?", "What conflict resolution strategies work for you?", "When should we involve a third party (family, imam, counselor)?", "How can we fight fair? What rules should we set?", "What are absolute deal-breakers (things you cannot tolerate)?", "How will we repair after conflicts?"]'::jsonb,
   'Agree on ground rules: No name-calling, no silent treatment beyond a few hours, no involving others prematurely, and never threaten divorce in anger. Always remember you''re on the same team fighting the problem, not each other.',
   11),

  ('faith', 'Spiritual Connection & Growth',
   'Build your marriage on a spiritual foundation',
   '["Will we pray together, including Tahajjud or other voluntary prayers?", "How can we strengthen each other''s faith and hold each other accountable?", "What Islamic goals do we have as a couple (memorizing Quran, attending classes, going to Hajj)?", "How will we handle it if one of us is struggling spiritually?", "Should we have regular Islamic study time together?"]'::jsonb,
   'Couples who worship together have stronger marriages. Make spiritual growth a joint endeavor. Pray for each other, remind each other of Allah, and be patient if one is struggling. The destination is Jannah together.',
   12),

  ('communication', 'Love Languages & Affection',
   'Understand how you each prefer to give and receive love',
   '["What makes you feel most loved (words of affirmation, quality time, gifts, acts of service, physical touch)?", "How do you naturally show affection?", "What are your expectations for physical intimacy in marriage?", "How important is romance and date nights to you?", "How do you want to celebrate special occasions (birthdays, anniversary)?"]'::jsonb,
   'The 5 Love Languages help you understand each other. You may feel loved through words, while your spouse feels loved through acts of service. Learn your spouse''s language and speak it often, even if it doesn''t come naturally to you.',
   13),

  ('goals', 'Career & Educational Aspirations',
   'Support each other''s professional and educational goals',
   '["What are your career goals and ambitions?", "Do you plan to pursue further education or professional certifications?", "How will we support each other''s career growth?", "What if a job requires relocation to another city or country?", "How do you feel about your spouse working (for wives: hijab and gender-segregated environments)?", "What if career demands conflict with family time?"]'::jsonb,
   'Marriage should enhance your growth, not limit it. Support each other''s ambitions within Islamic boundaries. Discuss potential sacrifices and compromises. Both spouses can have careers if they agree on balancing work and family.',
   14),

  ('goals', 'Living Situation & Location',
   'Decide where and how you want to live',
   '["Where do you want to live (city, suburb, rural area)? What country if you''re flexible on location?", "Do you prefer to rent or buy? What''s our timeline?", "Should we live close to family or independently?", "What is your ideal home like (size, type, amenities)?", "How important is proximity to a mosque and Islamic community?", "Are you willing to relocate for job opportunities or family needs?"]'::jsonb,
   'Location affects everything: family access, job opportunities, children''s education, and Islamic environment. Discuss dealbreakers (must live near parents, must have Islamic school access, etc.) and find a solution that works for both.',
   15),

  ('goals', '5-10 Year Vision',
   'Paint a picture of your future together',
   '["Where do you see us in 5 years? 10 years?", "What do you want to accomplish together in the next decade?", "What experiences do you want to have (travel, Hajj, learning experiences)?", "How do you envision our family life?", "What legacy do you want to leave as a couple?", "What are your biggest fears about the future?"]'::jsonb,
   'Dream together. A shared vision creates shared purpose and motivation. Discuss practical goals (buy a house, start a business) and spiritual goals (complete Hajj, memorize Quran). Align your dreams and work toward them as a team.',
   16)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. RESOURCES LIBRARY (24 resources, 6 categories)
-- =====================================================

INSERT INTO resources (category, title, description, content_type, url, author, is_featured) VALUES
  -- Islamic Guidance Category
  ('Islamic Guidance', 'Before You Tie The Knot',
   'Comprehensive Islamic guide on marriage preparation covering rights, responsibilities, and realistic expectations',
   'pdf', 'https://muslimmarriageguide.com/before-you-tie-the-knot/', 'Sheikh Mufti Menk', true),

  ('Islamic Guidance', 'Rights & Responsibilities in Marriage - Yaqeen Institute',
   'Detailed scholarly article on spousal rights according to Quran and Sunnah with contemporary applications',
   'article', 'https://yaqeeninstitute.org/read/paper/the-islamic-marriage-contract', 'Dr. Hatem al-Haj', true),

  ('Islamic Guidance', 'The Prophetic Marriage: How Prophet Muhammad ﷺ Treated His Wives',
   'Beautiful video series exploring the Prophet''s interactions with his wives and practical lessons for modern couples',
   'video', 'https://www.youtube.com/watch?v=example-prophetic-marriage', 'Mufti Menk', false),

  ('Islamic Guidance', 'Marriage in Islam: Comprehensive Course',
   'Full online course covering all aspects of Islamic marriage from qualified scholars',
   'link', 'https://seekersguidance.org/courses/marriage-in-islam/', 'SeekersGuidance', true),

  -- Communication & Relationships Category
  ('Communication', 'The 5 Love Languages',
   'Learn how you and your spouse give and receive love differently through five distinct languages',
   'link', 'https://www.5lovelanguages.com/', 'Dr. Gary Chapman', true),

  ('Communication', 'Active Listening in Marriage: A Practical Guide',
   'Evidence-based techniques for truly hearing and understanding your spouse',
   'article', 'https://www.gottman.com/blog/the-art-of-active-listening/', 'The Gottman Institute', false),

  ('Communication', 'Conflict Resolution for Muslim Couples',
   'Islamic perspective on handling disagreements with wisdom and patience',
   'article', 'https://muslimmatters.org/conflict-resolution-in-muslim-marriages/', 'Dr. Nafisa Sekandari', false),

  ('Communication', 'Emotionally Focused Therapy for Couples',
   'Video workshop on building emotional connection and healing relationship wounds',
   'video', 'https://www.youtube.com/watch?v=example-eft-couples', 'Dr. Sue Johnson', false),

  -- Financial Planning Category
  ('Financial Planning', 'Halal Money Management for Newlyweds',
   'Islamic principles for budgeting, saving, and building wealth without riba',
   'article', 'https://www.islamicfinanceguru.com/articles/halal-money-in-marriage', 'Ibrahim Khan', false),

  ('Financial Planning', 'Muslim Couple''s Budget Planner',
   'Free downloadable spreadsheet template for tracking Islamic household finances',
   'pdf', 'https://nikahprep.com/resources/budget-planner.xlsx', 'NikahPrep Team', true),

  ('Financial Planning', 'Avoiding Riba: Islamic Alternatives to Interest',
   'Practical guide to living interest-free in modern society with halal financing options',
   'link', 'https://www.islamicfinanceguru.com/how-to-guides/avoiding-riba', 'Islamic Finance Guru', false),

  ('Financial Planning', 'Zakat Calculator & Financial Purification',
   'Tool and guide for calculating Zakat and purifying your wealth islamically',
   'link', 'https://www.zakatfoundation.com/zakat-calculator/', 'Zakat Foundation', false),

  -- Counseling & Support Category
  ('Counseling & Support', 'Naseeha Muslim Youth Helpline',
   'Find qualified Islamic marriage counselors and mental health professionals in North America',
   'link', 'https://naseeha.org/', 'Naseeha Mental Health', true),

  ('Counseling & Support', 'Pre-Marriage Counseling Checklist: Questions to Discuss',
   'Comprehensive list of topics to cover with a counselor before your nikah',
   'pdf', 'https://counseling.isna.net/pre-marriage-checklist.pdf', 'ISNA Counseling', false),

  ('Counseling & Support', 'When to Seek Professional Help',
   'Signs that you might benefit from professional Islamic counseling guidance',
   'article', 'https://muslimcounseling.com/when-to-seek-help-in-marriage', 'Dr. Haleh Banani', false),

  ('Counseling & Support', 'Building a Strong Marriage: Islamic Counseling Podcast',
   'Weekly podcast featuring Islamic counselors discussing common marital challenges',
   'audio', 'https://www.podcastexample.com/strong-marriage', 'Multiple Scholars', false),

  -- Duas & Spiritual Resources Category
  ('Duas & Spiritual', 'Essential Marriage Duas & Supplications',
   'Collection of authentic duas for seeking a spouse, wedding night, marital harmony, and family blessings',
   'pdf', 'https://duaas.com/marriage-supplications.pdf', 'Various Scholars', true),

  ('Duas & Spiritual', 'How to Perform Salat al-Istikhara',
   'Step-by-step guide to the prayer for guidance when making major life decisions',
   'article', 'https://islamqa.info/en/answers/how-to-perform-istikhara', 'Sheikh Yasir Qadhi', false),

  ('Duas & Spiritual', 'Spiritual Bonding in Marriage: Worship Together',
   'Audio lecture on building spiritual connection with your spouse through joint worship',
   'audio', 'https://bayyinah.com/audio/spiritual-marriage', 'Nouman Ali Khan', false),

  ('Duas & Spiritual', 'Prophetic Duas for Married Life',
   'Video series teaching authentic supplications from Quran and Sunnah for marriage',
   'video', 'https://www.youtube.com/watch?v=example-marriage-duas', 'Sheikh Omar Suleiman', false),

  -- Recommended Books Category
  ('Recommended Books', 'In the Early Hours by Khurram Murad',
   'Beautiful book on spirituality, self-development, and building an Islamic home',
   'link', 'https://www.amazon.com/Early-Hours-Khurram-Murad/dp/example1', 'Khurram Murad', false),

  ('Recommended Books', 'Blissful Marriage: A Practical Islamic Guide',
   'Comprehensive advice for creating a happy, harmonious Islamic marriage',
   'link', 'https://www.amazon.com/Blissful-Marriage-Practical-Islamic-Guide/dp/example2', 'Dr. Ekram & Mohamed Rida Beshir', true),

  ('Recommended Books', 'The Seven Principles for Making Marriage Work',
   'Research-based relationship wisdom applicable to Muslim marriages (non-Islamic but beneficial)',
   'link', 'https://www.amazon.com/Seven-Principles-Making-Marriage-Work/dp/example3', 'Dr. John Gottman', false),

  -- Online Courses Category
  ('Online Courses', 'Bayyinah: Building a Marriage of the Prophetic Way',
   'Comprehensive 8-week online course for engaged and newlywed couples',
   'link', 'https://www.bayyinah.tv/courses/marriage-course', 'Bayyinah Institute', true)
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to confirm seed data was inserted correctly
-- =====================================================

-- Verify counts
DO $$
DECLARE
  cat_count INT;
  item_count INT;
  mod_count INT;
  lesson_count INT;
  prompt_count INT;
  resource_count INT;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM checklist_categories;
  SELECT COUNT(*) INTO item_count FROM checklist_items;
  SELECT COUNT(*) INTO mod_count FROM modules;
  SELECT COUNT(*) INTO lesson_count FROM lessons;
  SELECT COUNT(*) INTO prompt_count FROM discussion_prompts;
  SELECT COUNT(*) INTO resource_count FROM resources;

  RAISE NOTICE 'Checklist Categories: % (expected: 5)', cat_count;
  RAISE NOTICE 'Checklist Items: % (expected: 31)', item_count;
  RAISE NOTICE 'Modules: % (expected: 5)', mod_count;
  RAISE NOTICE 'Lessons: % (expected: 20)', lesson_count;
  RAISE NOTICE 'Discussion Prompts: % (expected: 16)', prompt_count;
  RAISE NOTICE 'Resources: % (expected: 24)', resource_count;

  IF cat_count = 5 AND item_count = 31 AND mod_count = 5 AND
     lesson_count = 20 AND prompt_count = 16 AND resource_count = 24 THEN
    RAISE NOTICE '✓ All seed data inserted successfully!';
  ELSE
    RAISE NOTICE '⚠ Some data may be missing. Please review.';
  END IF;
END $$;
