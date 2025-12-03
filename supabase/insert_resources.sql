-- Insert all 15 resources into the resources table
-- Uses ON CONFLICT DO NOTHING to avoid deleting/duplicating existing resources

INSERT INTO public.resources (title, description, url, category, content_type, is_featured, order_index) VALUES
-- Finance (5)
('Al Awwal Capital', 'Overview article describing how Islamic finance works in Saudi, its regulatory and economic role under Vision 2030, and why the sector is central for sustainable growth', 'https://alawwalcapital.com.sa/', 'Finance', 'link', true, 1),
('A Case Study of Al Rajhi Bank in the Kingdom of Saudi Arabia', 'Empirical research on how Al Rajhi Bank operated during the global financial crisis, examining profitability, risk, liquidity — shows how Islamic banking performed in stress times', 'https://www.u-picardie.fr/eastwest/stat_doc.php?doc=165', 'Finance', 'article', true, 2),
('أثر الائتمان المصرفي بصيغ التمويل الإسلامية على الناتج المحلي الإجمالي السعودي', 'An econometric study (2014–2022) analyzing how different Islamic financing instruments (Murabaha, Tawarruq, Ijarah, etc.) affected Saudi economic output (GDP)', 'https://journals.iu.edu.sa/ILS/Main/Article/14693', 'Finance', 'article', false, 3),
('Islamic banking in Saudi Arabia (Wikipedia)', 'Provides summary of Islamic banking in KSA: list of major Islamic banks, regulatory background, and general context', 'https://en.wikipedia.org/wiki/Islamic_banking_in_Saudi_Arabia', 'Finance', 'link', false, 4),
('The Banker — Top Islamic financial institutions 2025: Highlights', 'Recent international article analyzing performance and growth of top Islamic banks including those in Saudi — useful for understanding trends & global context', 'https://www.thebanker.com/content/6b074418-b48e-40a4-b88d-ef10dc0764e1', 'Finance', 'article', false, 5),

-- Duas (3)
('Fortress of the Muslim (Hisnul Muslim)', 'Collection of authentic duas for all occasions including marriage', 'https://abdurrahman.org/hisn-al-muslim/', 'Duas', 'link', true, 1),
('Marriage Duas from Quran & Sunnah', 'Specific supplications for marriage and family', 'https://mishkahacademy.com/duas-for-happy-marriage/', 'Duas', 'link', true, 2),
('Dua for Righteous Spouse', 'Collection of prophetic duas for seeking a good spouse', 'https://preciousgemsfromthequranandsunnah.wordpress.com/2022/11/08/dua-for-those-seeking-marriage-sustenance-and-for-fulfillment-of-needs/', 'Duas', 'link', false, 3),

-- Scholarly (4)
('Abu Khadeejah - Marriage Articles', 'Comprehensive Salafi marriage guidance based on Quran and authentic Sunnah', 'https://abukhadeejah.com/category/marriage/', 'Scholarly', 'link', true, 1),
('TROID - Islamic Marriage', 'Rights of spouses from authentic Salafi perspective', 'https://www.troid.org/category/marriage/the-islamic-marriage/', 'Scholarly', 'link', true, 2),
('IslamQA - Marriage Fatawa', 'Detailed scholarly rulings on marriage issues with hadith grading', 'https://islamqa.info/en/categories/topics/marriage', 'Scholarly', 'link', false, 3),
('Salafi Centre Manchester', 'Marriage guidance and Islamic education from Salafi perspective', 'https://salaficentre.com/', 'Scholarly', 'link', false, 4),

-- Books (1)
('Bulugh Al-Maram: Book of Marriage', 'Classical hadith collection with Shaykh Al-Fawzan explanation', 'https://abukhadeejah.com/the-book-of-marriage-ibn-hajrs-buloogh-al-maraam-explanation-of-al-fawzaan/', 'Books', 'link', true, 1),

-- Courses (1)
('Before We Marry - Islamic Online University', 'Free online marriage preparation program', 'https://www.islamiconlineuniversity.com', 'Courses', 'link', false, 3),

-- Counseling (1)
('Bakkah.net - Marriage Advice', 'Community advice for Muslims seeking marriage', 'https://www.bakkah.net/en/pooling-ideas-advise-your-brothers-sisters-trying-to-get-married-interactive.htm', 'Counseling', 'link', false, 5)
ON CONFLICT DO NOTHING;

