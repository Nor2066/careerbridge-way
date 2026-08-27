// lib/followup-questions.ts
//
// The follow-up questionnaire, one set per career cluster.
//
// Lifted out of the client component so it can be tested. An audit found five
// of the fifteen scoring clusters had no questions at all -- SocialImpact,
// SkilledTrades, Legal, Sales and Hospitality -- which meant anyone whose top
// cluster was one of those paid for the follow-up bundle and was shown
// "Error: No questions found for Hospitality." in the part of the product they
// had just paid to unlock.
//
// Nothing in the type system connected MAX_SCORES to this object, so adding a
// cluster to the scoring model left no trace here. lib/followup-questions.test.ts
// now asserts the two stay in step, which is the only reason this file is
// separate from the component that renders it.
//
// Format: each question is one string. The first line is the question; every
// following line beginning "(a) ", "(b) " and so on is an option. The component
// parses that shape, so keep to it.

import type { Cluster } from '@/lib/scoring';

export const clusterQuestions: Record<string, string[]> = {
  // Ordered to match MAX_SCORES in lib/scoring.ts.
  //
  // An audit found five sets of questions filed under the wrong key:
  // SocialImpact was appended to Entrepreneurship, SkilledTrades to Creative,
  // and Legal, Sales and Hospitality all to Operations. That broke the
  // follow-up in both directions at once. Anyone whose top cluster was one of
  // the five hit "Error: No questions found for Hospitality." -- in the part
  // of the product they had just paid to unlock. Anyone with Operations in
  // their top three was asked 32 questions instead of 8, two thirds of them
  // about law, sales and hotels, and those answers were then sent to the model
  // as the basis of their roadmap.
  //
  // The questions themselves were fine. They were only in the wrong place.
  Analytical: [
    "When you look at a set of numbers or information, what would you prefer to do with it?\n(a) Find similarities or patterns (e.g., group people by age)\n(b) Guess what might happen next based on past trends (e.g., predict tomorrow's weather)\n(c) Create a chart or graph so others can understand it easily\n(d) Build a simple spreadsheet or tool to do the math for you\n(e) Summarize the main points so someone else can make a decision",
    "Which kind of problem do you enjoy solving most?\n(a) A puzzle where you find a hidden pattern\n(b) A \"what‑if\" question (e.g., what happens if sales double?)\n(c) Organizing messy information into a clear report\n(d) Figuring out why something went wrong using data",
    "Would you rather work with a single type of information (like only sports scores) or many different types (like sports, weather, and finance)?\n(a) One type -- I like going deep\n(b) Many types -- I like variety",
    "How important is it that your work directly helps someone make a decision (e.g., choose a product, hire someone)?\n(a) Very important -- I want to see my work used\n(b) Somewhat important\n(c) Not important -- I just like the analysis itself",
    "Which sounds more appealing to you?\n(a) Collecting new information through surveys or experiments\n(b) Using already existing information to find answers",
    "What would you rather learn to do?\n(a) Use a simple tool like a spreadsheet\n(b) Write a few lines of code to handle data\n(c) Create beautiful charts and dashboards\n(d) Spot mistakes and clean up messy data",
    "How do you feel about explaining your findings to a friend who doesn't know much about the topic?\n(a) I enjoy it -- it makes me feel helpful\n(b) I can do it, but it's not my favorite\n(c) I'd rather avoid it -- let them read the numbers",
    "Which feels more exciting?\n(a) Solving a known problem with data (e.g., why are sales dropping?)\n(b) Discovering something completely new that nobody expected",
  ],
  Engineering: [
    "Which of these projects would you most like to work on?\n(a) Design a new bridge or road\n(b) Create a new gadget or machine\n(c) Work on electrical wiring or circuits\n(d) Develop new medicines or medical devices\n(e) Build eco‑friendly energy systems",
    "Would you rather...\n(a) Create something brand new from scratch\n(b) Make an existing product better\n(c) Keep machines or systems running smoothly",
    "How much do you enjoy working with your hands (building, fixing, using tools) compared to using a computer?\n(a) I prefer hands‑on work\n(b) I prefer computer work\n(c) I like both equally",
    "Which scale of project sounds more interesting?\n(a) Huge projects like dams or airports\n(b) Small things like phones or kitchen appliances",
    "How do you feel about rules and safety checks (like wearing a helmet, following blueprints)?\n(a) They are important -- I don't mind following them\n(b) I understand they are necessary but find them annoying\n(c) I prefer flexible environments with fewer rules",
    "In a team project, do you prefer to...\n(a) Work closely with others to solve problems\n(b) Take your own part and work mostly alone",
    "When solving a problem, what matters most to you?\n(a) Coming up with a creative solution\n(b) Being very precise and accurate\n(c) Finding the fastest/easiest way",
    "How interested are you in new technologies like solar energy, electric cars, or robots?\n(a) Very interested -- I follow the news\n(b) A little interested\n(c) Not really interested",
  ],
  IT: [
    "Which of these sounds most like you?\n(a) I like building apps or websites\n(b) I like keeping computers safe from viruses and hackers\n(c) I like setting up networks or cloud storage\n(d) I like helping people fix their computer problems",
    "Would you rather...\n(a) Create new software\n(b) Protect or improve existing systems",
    "How would you feel about being called to fix a problem in the middle of the night (e.g., a server crash)?\n(a) That's exciting -- I like being the hero\n(b) I could handle it occasionally\n(c) I would hate that -- I need a regular schedule",
    "Which workplace sounds better?\n(a) A big company with clear career steps\n(b) A small startup where everyone does a bit of everything\n(c) Working for myself, finding my own clients",
    "How do you feel about learning new technology every year?\n(a) I love it -- staying up‑to‑date is fun\n(b) It's okay, but I prefer stability\n(c) I'd rather stick with what I already know",
    "Do you enjoy explaining tech to non‑tech people?\n(a) Yes, I like helping others understand\n(b) Not really -- I'd rather work alone",
    "If you could master one tech skill, which would it be?\n(a) Writing code (Python, JavaScript, etc.)\n(b) Building and managing cloud systems\n(c) Cybersecurity and ethical hacking\n(d) Creating websites and apps",
    "How interested are you in tracking down digital criminals or protecting people's privacy?\n(a) Very interested\n(b) Somewhat interested\n(c) Not interested",
  ],
  Healthcare: [
    "Which of these healthcare roles sounds most appealing?\n(a) Doctor or nurse -- directly treating patients\n(b) Lab technician -- running tests on samples\n(c) Public health -- keeping communities healthy\n(d) Therapist -- helping with mental or physical recovery",
    "Would you rather...\n(a) Work directly with sick or injured people\n(b) Work in a lab, away from patients",
    "How do you feel about seeing blood, needles, or wounds?\n(a) No problem -- I'm not squeamish\n(b) I can handle it if necessary\n(c) I prefer to avoid those situations",
    "Which work setting sounds best?\n(a) A busy hospital\n(b) A small private clinic\n(c) A research laboratory\n(d) A community health center (schools, public events)",
    "How important is having a predictable schedule (e.g., 9‑5, no weekends) compared to being on call for emergencies?\n(a) Predictable schedule is very important\n(b) I'm fine with being on call sometimes\n(c) I don't mind irregular hours",
    "Which group of people would you most like to help?\n(a) Children\n(b) Elderly people\n(c) People with mental health challenges\n(d) General population",
    "How do you feel about many years of training (like medical school)?\n(a) Worth it for the career\n(b) I'd prefer a shorter path (e.g., nursing, technician)",
    "Which is more important to you?\n(a) Curing existing illnesses\n(b) Preventing illnesses through education and healthy habits",
  ],
  Research: [
    "What subject would you most like to study in depth?\n(a) Living things (biology, animals)\n(b) Matter and energy (physics, chemistry)\n(c) Human behavior and society (psychology, sociology)\n(d) Numbers and information (economics, computer science)\n(e) The environment (ecology, climate)",
    "Would you rather...\n(a) Discover new facts that nobody knew before\n(b) Find practical solutions to real‑world problems",
    "How do you feel about writing detailed reports and applying for funding?\n(a) I can do it -- it's part of the job\n(b) I'd prefer to focus only on the research",
    "Which work environment appeals to you?\n(a) A university\n(b) A government lab\n(c) A private company's R&D department\n(d) A non‑profit think tank",
    "How important is it that other researchers know about your work (e.g., publications, conferences)?\n(a) Very important -- I want recognition\n(b) Somewhat important\n(c) Not important -- I just want to do the work",
    "Do you prefer working alone in the lab/field or as part of a research team?\n(a) Alone\n(b) Team",
    "How comfortable are you with not seeing results for months or years?\n(a) Very comfortable -- I'm patient\n(b) Somewhat comfortable\n(c) I prefer quicker results",
    "Which research method sounds more interesting?\n(a) Running experiments (changing things to see what happens)\n(b) Conducting surveys or interviews\n(c) Observing things in nature or the city\n(d) Building computer models or simulations",
  ],
  Business: [
    "Which part of a business would you like to work in?\n(a) Finance (money, budgets)\n(b) Marketing (advertising, branding)\n(c) Human resources (hiring, training)\n(d) Operations (keeping things running smoothly)\n(e) Strategy (planning for the future)",
    "Would you rather...\n(a) Work with numbers (budgets, forecasts)\n(b) Work with people (negotiations, managing teams)",
    "How do you feel about a fast‑paced, competitive environment?\n(a) I thrive on it\n(b) It's okay sometimes\n(c) I prefer a calm, cooperative atmosphere",
    "Which company size sounds better?\n(a) Small company (more responsibility, closer to decisions)\n(b) Large corporation (clear roles, more structure)",
    "How do you feel about getting an MBA or other business degree?\n(a) I'd be interested\n(b) I'd rather learn on the job",
    "What excites you more?\n(a) Helping a company grow and earn more\n(b) Making a company more efficient (saving time/money)\n(c) Managing and supporting employees",
    "How comfortable are you with making decisions when you don't have all the information?\n(a) Very comfortable -- I take calculated risks\n(b) Somewhat comfortable\n(c) I prefer to have all the facts first",
    "Would you prefer to work locally or internationally?\n(a) Local\n(b) International",
  ],
  Entrepreneurship: [
    "Have you ever started a small project or side hustle (e.g., selling things online, a lemonade stand, a blog)?\n(a) Yes, and I enjoyed it\n(b) Yes, but I didn't enjoy it\n(c) No, but I have an idea I'd like to try\n(d) No, and I have no ideas",
    "What would be your main reason to start your own business?\n(a) Financial freedom\n(b) Being your own boss\n(c) Solving a problem you care about\n(d) Expressing your creativity",
    "How comfortable are you with the possibility of losing money or failing?\n(a) Very comfortable -- I'm willing to risk\n(b) Somewhat comfortable\n(c) Not comfortable -- I prefer safety",
    "Would you rather start a business alone or with partners?\n(a) Alone\n(b) With partners",
    "Which industry would you want to start a business in?\n(a) Technology\n(b) Food/retail\n(c) Services (cleaning, tutoring, consulting)\n(d) Social enterprise (helping a cause)",
    "How do you feel about asking for money from investors or banks?\n(a) I'm okay with it -- it's part of the game\n(b) I'd rather start small with my own money",
    "Do you enjoy selling, marketing, and talking to people, or would you rather focus on the product itself?\n(a) I like selling and marketing\n(b) I prefer focusing on the product\n(c) I like both equally",
    "How do you handle working long hours without a guaranteed paycheck?\n(a) I'm fine with it -- the reward is worth the risk\n(b) I can do it for a while, but not forever\n(c) I need stability",
  ],
  SocialImpact: [
    "Which of these would you most want to spend your time on?\n(a) Working directly with people who need help\n(b) Campaigning to change a rule, law or policy\n(c) Raising the money that makes the work possible\n(d) Running the day-to-day so the organisation actually functions\n(e) Researching what genuinely helps and what only sounds good",
    "Would you rather help a small number of people a great deal, or a very large number a little?\n(a) A few people, deeply\n(b) Many people, a little\n(c) I honestly do not mind",
    "Some days in this work are emotionally heavy. How does that sit with you?\n(a) I can carry it, and I would want support in place\n(b) I would manage, but I would need a real break afterwards\n(c) I would rather contribute without being on the front line",
    "Charity and public sector work often pays less than business for similar hours. How does that affect you?\n(a) I accept it -- the work matters more\n(b) I could accept it for a few years, not forever\n(c) It is a genuine problem for me",
    "Which cause pulls at you most?\n(a) Housing and homelessness\n(b) Young people and education\n(c) Health, disability and care\n(d) Environment and climate\n(e) Refugees, migration and human rights\n(f) Animals and conservation",
    "In an organisation, would you rather be...\n(a) The person people come to for help\n(b) The person organising things behind the scenes\n(c) The person persuading funders and decision makers",
    "Progress in this field is often slow and hard to measure. How do you feel about that?\n(a) Fine -- I can work without quick wins\n(b) I would need some visible progress to stay motivated\n(c) I would find it very frustrating",
    "Which would you rather train in?\n(a) Social work or youth work\n(b) Public policy or politics\n(c) Fundraising, communications or campaigning\n(d) International development\n(e) Charity management and operations",
  ],
  Education: [
    "Which age group would you most enjoy teaching?\n(a) Young children (preschool/elementary)\n(b) Older children (middle school)\n(c) Teenagers (high school)\n(d) Adults (college or vocational)",
    "What subject would you most like to teach?\n(a) Math or science\n(b) Language or arts\n(c) History or social studies\n(d) Trades or life skills (cooking, woodworking)",
    "Would you rather...\n(a) Teach in a traditional classroom\n(b) Tutor one‑on‑one\n(c) Create educational materials (curriculum, videos)",
    "How do you feel about grading, lesson planning, and meeting with parents?\n(a) It's part of the job -- I'm okay with it\n(b) I'd prefer to focus only on teaching",
    "Would you consider being a school principal, counselor, or working in education policy?\n(a) Yes, I'd like that\n(b) Maybe later\n(c) No, I want to stay in the classroom",
    "How important are summer vacations and a fixed school schedule?\n(a) Very important\n(b) Somewhat important\n(c) Not important -- I'd work year‑round",
    "What motivates you more?\n(a) Helping struggling students catch up\n(b) Challenging advanced students to go further",
    "How do you feel about teaching online or using technology in the classroom?\n(a) I'm excited about it\n(b) I can learn\n(c) I prefer traditional methods",
  ],
  Creative: [
    "Which creative activity do you enjoy most?\n(a) Drawing, painting, or digital art\n(b) Writing stories, poems, or articles\n(c) Playing music or singing\n(d) Taking photos or making videos\n(e) Designing things (graphics, interiors, clothes)",
    "Would you rather...\n(a) Create for yourself (personal projects)\n(b) Create for clients or a company",
    "How important is it to earn money from your creativity?\n(a) Very important -- I want it to be my career\n(b) Somewhat important\n(c) Not important -- it's just a hobby",
    "Which work style appeals to you?\n(a) Freelance -- working for different clients\n(b) Working for a creative agency or studio\n(c) Working in‑house for a company (e.g., designer for a brand)",
    "How do you handle criticism of your creative work?\n(a) I use it to improve\n(b) I find it hard but accept it\n(c) I prefer only positive feedback",
    "What creative skill would you most like to learn or improve?\n(a) Digital illustration\n(b) Copywriting (writing ads)\n(c) Video editing\n(d) Photography\n(e) Music production",
    "How do you feel about the business side (pricing, contracts, self‑promotion)?\n(a) I'm interested in learning\n(b) I'd rather not deal with it",
    "Do you prefer working alone on creative projects or collaborating with others?\n(a) Alone\n(b) Collaborate",
  ],
  SkilledTrades: [
    "Which of these appeals to you most?\n(a) Electrical work and wiring\n(b) Plumbing, heating and gas\n(c) Carpentry and joinery\n(d) Vehicle mechanics\n(e) Welding and fabrication\n(f) Construction and site work",
    "Most trades train through an apprenticeship -- you earn while you learn instead of going to university. How does that sound?\n(a) Ideal -- I would rather be paid than take on debt\n(b) Good, though I would still like some classroom learning\n(c) I would rather study first and work afterwards",
    "How do you feel about physical work, sometimes outdoors in bad weather?\n(a) I like being active and outdoors\n(b) Fine, as long as it is not every single day\n(c) I would prefer to be indoors and mostly sitting",
    "Longer term, would you rather...\n(a) Work for an established company with steady wages\n(b) Run your own business and take on your own customers\n(c) Work through an agency on different sites",
    "Which working pattern suits you better?\n(a) Finishing a whole job in a day and seeing it done\n(b) Working on one big project for weeks or months",
    "Some trades involve call-outs at awkward hours -- a burst pipe at midnight, a breakdown on a Sunday. How do you feel about that?\n(a) Fine, especially if it pays better\n(b) Occasionally is acceptable\n(c) I want predictable hours",
    "How important is it that you can point at something and say you built or fixed it?\n(a) Very -- that is most of the appeal\n(b) Quite important\n(c) Not especially",
    "Trades need certificates and safety tickets, with assessments to pass. How do you feel about that?\n(a) No problem -- it is part of being taken seriously\n(b) I will do it, but exams make me anxious\n(c) I would rather avoid formal assessment",
  ],
  Operations: [
    "Which area of operations sounds most interesting?\n(a) Logistics (moving goods from place to place)\n(b) Supply chain (getting materials to factories)\n(c) Quality control (checking for defects)\n(d) Inventory management (tracking stock)\n(e) Project management (coordinating tasks)",
    "Would you rather...\n(a) Improve an existing process to make it faster/cheaper\n(b) Design a brand new process from scratch",
    "How do you feel about tracking numbers and metrics (e.g., delivery times, error rates)?\n(a) I like it -- data helps me see progress\n(b) I can do it, but it's not my favorite\n(c) I prefer hands‑on work over numbers",
    "Which industry would you prefer to work in?\n(a) Manufacturing (factories)\n(b) Retail (stores, e‑commerce)\n(c) Service (restaurants, cleaning, logistics)",
    "How important is working with people (coordinating teams) versus working with systems?\n(a) I prefer working with people\n(b) I prefer working with systems\n(c) Both are fine",
    "How do you react when something goes wrong (e.g., a shipment is delayed)?\n(a) I stay calm and find a solution\n(b) I get frustrated but handle it\n(c) I prefer to avoid surprises",
    "Are you interested in methods like 'lean' (reducing waste) or 'Six Sigma' (improving quality)?\n(a) Yes, I'd like to learn them\n(b) Not really",
    "How do you feel about traveling between different sites (e.g., warehouses, stores)?\n(a) I'd enjoy it\n(b) I can do it occasionally\n(c) I prefer one location",
  ],
  Legal: [
    "Which part of legal work sounds most appealing?\n(a) Arguing a case in front of a judge\n(b) Advising people or businesses so problems never reach court\n(c) Reading and drafting documents with great care\n(d) Investigating and piecing together evidence\n(e) Making sure an organisation follows the rules it has to follow",
    "Which area of law interests you most?\n(a) Criminal\n(b) Family\n(c) Business and commercial\n(d) Human rights and immigration\n(e) Property and housing\n(f) Employment",
    "Much of this work is long stretches of careful reading. How does that suit you?\n(a) I enjoy it and can concentrate for hours\n(b) I can do it in reasonable doses\n(c) I would find it draining",
    "Qualifying as a solicitor or barrister takes several years and costs money. There are also routes through paralegal and legal executive work. Which appeals?\n(a) The full qualification, however long it takes\n(b) A route where I earn while qualifying\n(c) Legal work that does not require full qualification",
    "Would you rather represent...\n(a) Individual people with problems that matter to them\n(b) Organisations and businesses\n(c) A cause or the public interest",
    "Part of legal work is representing someone whose views you do not share, because everyone is entitled to representation. How do you feel about that?\n(a) I accept it -- it is the point of the system\n(b) I could do it, but it would sit uneasily\n(c) I would rather only work on things I believe in",
    "Which are you stronger at?\n(a) Precise, careful writing\n(b) Speaking and persuading in the room\n(c) Both roughly equally",
    "How do you handle high-pressure deadlines where accuracy still has to be perfect?\n(a) I work well under pressure\n(b) I manage, but I would rather have more time\n(c) I would find that very stressful",
  ],
  Sales: [
    "Which of these sounds most appealing?\n(a) Helping someone work out what they actually need\n(b) Winning one large deal after months of work\n(c) Looking after a handful of clients over years\n(d) Lots of short conversations with many people\n(e) Explaining something technical to someone who does not know it",
    "In many sales roles part of your pay depends on results. How does that sit with you?\n(a) I like it -- I want my effort to show in my pay\n(b) Some of it, as long as the base salary is liveable\n(c) I would rather have a fixed, predictable salary",
    "How do you handle hearing no, repeatedly, without taking it personally?\n(a) Easily -- it is just part of the numbers\n(b) Reasonably well on most days\n(c) I would find that hard",
    "Would you rather sell...\n(a) Something you personally use and believe in\n(b) Something genuinely useful but not exciting to you\n(c) It does not matter, as long as it is honest",
    "Which way of dealing with people suits you best?\n(a) Face to face\n(b) On the phone or video calls\n(c) In writing -- email and messages",
    "How do you feel about a target you have to hit every month?\n(a) It motivates me\n(b) I can live with it\n(c) It would hang over me constantly",
    "Would you rather...\n(a) Find brand new customers who have never heard of you\n(b) Look after and grow existing customers\n(c) A mix of both",
    "How do you feel about travelling regularly to meet customers?\n(a) I would enjoy it\n(b) Occasionally is fine\n(c) I would rather stay in one place",
  ],
  Hospitality: [
    "Which part of hospitality appeals to you most?\n(a) Cooking and kitchen work\n(b) Front of house and looking after guests\n(c) Running or managing a venue\n(d) Events, weddings and functions\n(e) Hotels and accommodation\n(f) Travel and tourism",
    "Hospitality is busiest in the evenings, at weekends and over holidays. How does that fit your life?\n(a) Fine -- I would rather have quiet weekdays off\n(b) I could do it for a while\n(c) That is a real problem for me",
    "How do you feel about being on your feet and busy for a whole shift?\n(a) I prefer it to sitting down\n(b) Manageable\n(c) I would find it exhausting",
    "A guest is unhappy about something that was not your fault. What is your instinct?\n(a) Stay calm, apologise, and fix it\n(b) Explain what happened so they understand\n(c) Find a manager to handle it\n(d) I would find it upsetting",
    "Which would you rather do?\n(a) The same high standard every single day\n(b) A different event or group every week",
    "Kitchens and busy venues move fast and can be loud and direct. How do you feel about that?\n(a) I like the pace and the pressure\n(b) Fine, as long as people are decent with each other\n(c) I would prefer somewhere calmer",
    "Would you be interested in seasonal work, working abroad, or on cruise ships?\n(a) Very -- that is part of the appeal\n(b) Maybe for a season or two\n(c) I would rather stay near home",
    "How much does it matter to you that guests notice and thank you personally?\n(a) A lot -- it is what makes the shift worth it\n(b) It is nice but not essential\n(c) I would rather work behind the scenes",
  ],
};

/** Clusters that currently have a follow-up questionnaire. */
export function clustersWithQuestions(): string[] {
  return Object.keys(clusterQuestions);
}

/**
 * Questions for a cluster, or an empty array.
 *
 * Callers should treat empty as "skip this cluster" rather than an error --
 * the test keeps that from happening, but a report should never dead-end on it.
 */
export function questionsFor(cluster: Cluster | string): string[] {
  return clusterQuestions[cluster] ?? [];
}
