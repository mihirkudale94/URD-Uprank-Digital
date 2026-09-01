-- Replace the seeded knowledge base rows.
--
-- The original seed described services Up Rank Digital does not offer (custom software, web/mobile
-- app development, CRM/LMS integrations) and used category names that do not match the website.
-- The chat function injects these rows into the model prompt under the heading "verified business
-- context", so any inaccuracy here is repeated to visitors as fact.
--
-- Content below is limited to the five service lines and eight areas of expertise published on the site.

delete from public.knowledge_base;

insert into public.knowledge_base (category, title, content) values
('Company', 'About Up Rank Digital', 'Up Rank Digital (URD) is a digital growth partner based in Pune, Maharashtra, India, with 10+ years of experience. Founder and Managing Director: Sachin Raje. Positioning: website development and digital performance marketing using AI. Up Rank Digital helps brands and businesses grow their digital presence with data-driven marketing, engaging content, and AI-powered strategies that deliver real results. Contact: sachin@uprankdigital.com, +91 93711 16165 or +91 73910 96690.'),
('Services', 'Website Development', 'Website Development is one of five Up Rank Digital service lines. Websites are built to perform and are designed around conversion optimization rather than decoration.'),
('Services', 'Digital Marketing', 'Digital Marketing is one of five Up Rank Digital service lines. It grows a brand digital presence through social media strategy and engaging content.'),
('Services', 'Performance Marketing', 'Performance Marketing is one of five Up Rank Digital service lines. It covers campaign planning and execution backed by analytics and growth strategy.'),
('Services', 'AI Powered Solutions', 'AI Powered Solutions is one of five Up Rank Digital service lines. AI-powered strategies are applied to marketing so decisions move faster.'),
('Services', 'Content Design & Management', 'Content Design & Management is one of five Up Rank Digital service lines. Engaging content is designed and managed end to end.'),
('Expertise', 'Areas of Expertise', 'Up Rank Digital works across eight areas of expertise: Website Development, Digital Performance Marketing, AI Powered Marketing Solutions, Conversion Optimization, Analytics & Growth Strategy, Content Design & Management, Social Media Strategy, and Campaign Planning & Execution.'),
('How We Work', 'Why Work With Up Rank Digital', 'Up Rank Digital works on four principles: result driven strategies, data backed decisions, transparent communication, and measurable results.'),
('Pricing', 'Pricing And Scope', 'Up Rank Digital does not publish fixed prices or packages. Pricing depends on scope, timeline, complexity, and channels. The team advises after understanding the business goal, current website or social presence, and budget range. No price, range, or delivery timeline should be quoted without the team.');
