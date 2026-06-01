'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

// --------------------------------------------------------------
// 1. All 15 clusters, each with 8 questions (120 total)
// --------------------------------------------------------------
const clusterQuestions: Record<string, string[]> = {
  Analytical: [
    "When you look at a set of numbers or information, what would you prefer to do with it?\n(a) Find similarities or patterns (e.g., group people by age)\n(b) Guess what might happen next based on past trends (e.g., predict tomorrow's weather)\n(c) Create a chart or graph so others can understand it easily\n(d) Build a simple spreadsheet or tool to do the math for you\n(e) Summarize the main points so someone else can make a decision",
    "Which kind of problem do you enjoy solving most?\n(a) A puzzle where you find a hidden pattern\n(b) A \"what‑if\" question (e.g., what happens if sales double?)\n(c) Organizing messy information into a clear report\n(d) Figuring out why something went wrong using data",
    "Would you rather work with a single type of information (like only sports scores) or many different types (like sports, weather, and finance)?\n(a) One type -- I like going deep\n(b) Many types -- I like variety",
    "How important is it that your work directly helps someone make a decision (e.g., choose a product, hire someone)?\n(a) Very important -- I want to see my work used\n(b) Somewhat important\n(c) Not important -- I just like the analysis itself",
    "Which sounds more appealing to you?\n(a) Collecting new information through surveys or experiments\n(b) Using already existing information to find answers",
    "What would you rather learn to do?\n(a) Use a simple tool like a spreadsheet\n(b) Write a few lines of code to handle data\n(c) Create beautiful charts and dashboards\n(d) Spot mistakes and clean up messy data",
    "How do you feel about explaining your findings to a friend who doesn't know much about the topic?\n(a) I enjoy it -- it makes me feel helpful\n(b) I can do it, but it's not my favorite\n(c) I'd rather avoid it -- let them read the numbers",
    "Which feels more exciting?\n(a) Solving a known problem with data (e.g., why are sales dropping?)\n(b) Discovering something completely new that nobody expected"
  ],
  Engineering: [
    "Which of these projects would you most like to work on?\n(a) Design a new bridge or road\n(b) Create a new gadget or machine\n(c) Work on electrical wiring or circuits\n(d) Develop new medicines or medical devices\n(e) Build eco‑friendly energy systems",
    "Would you rather...\n(a) Create something brand new from scratch\n(b) Make an existing product better\n(c) Keep machines or systems running smoothly",
    "How much do you enjoy working with your hands (building, fixing, using tools) compared to using a computer?\n(a) I prefer hands‑on work\n(b) I prefer computer work\n(c) I like both equally",
    "Which scale of project sounds more interesting?\n(a) Huge projects like dams or airports\n(b) Small things like phones or kitchen appliances",
    "How do you feel about rules and safety checks (like wearing a helmet, following blueprints)?\n(a) They are important -- I don't mind following them\n(b) I understand they are necessary but find them annoying\n(c) I prefer flexible environments with fewer rules",
    "In a team project, do you prefer to...\n(a) Work closely with others to solve problems\n(b) Take your own part and work mostly alone",
    "When solving a problem, what matters most to you?\n(a) Coming up with a creative solution\n(b) Being very precise and accurate\n(c) Finding the fastest/easiest way",
    "How interested are you in new technologies like solar energy, electric cars, or robots?\n(a) Very interested -- I follow the news\n(b) A little interested\n(c) Not really interested"
  ],
  IT: [
    "Which of these sounds most like you?\n(a) I like building apps or websites\n(b) I like keeping computers safe from viruses and hackers\n(c) I like setting up networks or cloud storage\n(d) I like helping people fix their computer problems",
    "Would you rather...\n(a) Create new software\n(b) Protect or improve existing systems",
    "How would you feel about being called to fix a problem in the middle of the night (e.g., a server crash)?\n(a) That's exciting -- I like being the hero\n(b) I could handle it occasionally\n(c) I would hate that -- I need a regular schedule",
    "Which workplace sounds better?\n(a) A big company with clear career steps\n(b) A small startup where everyone does a bit of everything\n(c) Working for myself, finding my own clients",
    "How do you feel about learning new technology every year?\n(a) I love it -- staying up‑to‑date is fun\n(b) It's okay, but I prefer stability\n(c) I'd rather stick with what I already know",
    "Do you enjoy explaining tech to non‑tech people?\n(a) Yes, I like helping others understand\n(b) Not really -- I'd rather work alone",
    "If you could master one tech skill, which would it be?\n(a) Writing code (Python, JavaScript, etc.)\n(b) Building and managing cloud systems\n(c) Cybersecurity and ethical hacking\n(d) Creating websites and apps",
    "How interested are you in tracking down digital criminals or protecting people's privacy?\n(a) Very interested\n(b) Somewhat interested\n(c) Not interested"
  ],
  Healthcare: [
    "Which of these healthcare roles sounds most appealing?\n(a) Doctor or nurse -- directly treating patients\n(b) Lab technician -- running tests on samples\n(c) Public health -- keeping communities healthy\n(d) Therapist -- helping with mental or physical recovery",
    "Would you rather...\n(a) Work directly with sick or injured people\n(b) Work in a lab, away from patients",
    "How do you feel about seeing blood, needles, or wounds?\n(a) No problem -- I'm not squeamish\n(b) I can handle it if necessary\n(c) I prefer to avoid those situations",
    "Which work setting sounds best?\n(a) A busy hospital\n(b) A small private clinic\n(c) A research laboratory\n(d) A community health center (schools, public events)",
    "How important is having a predictable schedule (e.g., 9‑5, no weekends) compared to being on call for emergencies?\n(a) Predictable schedule is very important\n(b) I'm fine with being on call sometimes\n(c) I don't mind irregular hours",
    "Which group of people would you most like to help?\n(a) Children\n(b) Elderly people\n(c) People with mental health challenges\n(d) General population",
    "How do you feel about many years of training (like medical school)?\n(a) Worth it for the career\n(b) I'd prefer a shorter path (e.g., nursing, technician)",
    "Which is more important to you?\n(a) Curing existing illnesses\n(b) Preventing illnesses through education and healthy habits"
  ],
  Research: [
    "What subject would you most like to study in depth?\n(a) Living things (biology, animals)\n(b) Matter and energy (physics, chemistry)\n(c) Human behavior and society (psychology, sociology)\n(d) Numbers and information (economics, computer science)\n(e) The environment (ecology, climate)",
    "Would you rather...\n(a) Discover new facts that nobody knew before\n(b) Find practical solutions to real‑world problems",
    "How do you feel about writing detailed reports and applying for funding?\n(a) I can do it -- it's part of the job\n(b) I'd prefer to focus only on the research",
    "Which work environment appeals to you?\n(a) A university\n(b) A government lab\n(c) A private company's R&D department\n(d) A non‑profit think tank",
    "How important is it that other researchers know about your work (e.g., publications, conferences)?\n(a) Very important -- I want recognition\n(b) Somewhat important\n(c) Not important -- I just want to do the work",
    "Do you prefer working alone in the lab/field or as part of a research team?\n(a) Alone\n(b) Team",
    "How comfortable are you with not seeing results for months or years?\n(a) Very comfortable -- I'm patient\n(b) Somewhat comfortable\n(c) I prefer quicker results",
    "Which research method sounds more interesting?\n(a) Running experiments (changing things to see what happens)\n(b) Conducting surveys or interviews\n(c) Observing things in nature or the city\n(d) Building computer models or simulations"
  ],
  Business: [
    "Which part of a business would you like to work in?\n(a) Finance (money, budgets)\n(b) Marketing (advertising, branding)\n(c) Human resources (hiring, training)\n(d) Operations (keeping things running smoothly)\n(e) Strategy (planning for the future)",
    "Would you rather...\n(a) Work with numbers (budgets, forecasts)\n(b) Work with people (negotiations, managing teams)",
    "How do you feel about a fast‑paced, competitive environment?\n(a) I thrive on it\n(b) It's okay sometimes\n(c) I prefer a calm, cooperative atmosphere",
    "Which company size sounds better?\n(a) Small company (more responsibility, closer to decisions)\n(b) Large corporation (clear roles, more structure)",
    "How do you feel about getting an MBA or other business degree?\n(a) I'd be interested\n(b) I'd rather learn on the job",
    "What excites you more?\n(a) Helping a company grow and earn more\n(b) Making a company more efficient (saving time/money)\n(c) Managing and supporting employees",
    "How comfortable are you with making decisions when you don't have all the information?\n(a) Very comfortable -- I take calculated risks\n(b) Somewhat comfortable\n(c) I prefer to have all the facts first",
    "Would you prefer to work locally or internationally?\n(a) Local\n(b) International"
  ],
  Entrepreneurship: [
    "Have you ever started a small project or side hustle (e.g., selling things online, a lemonade stand, a blog)?\n(a) Yes, and I enjoyed it\n(b) Yes, but I didn't enjoy it\n(c) No, but I have an idea I'd like to try\n(d) No, and I have no ideas",
    "What would be your main reason to start your own business?\n(a) Financial freedom\n(b) Being your own boss\n(c) Solving a problem you care about\n(d) Expressing your creativity",
    "How comfortable are you with the possibility of losing money or failing?\n(a) Very comfortable -- I'm willing to risk\n(b) Somewhat comfortable\n(c) Not comfortable -- I prefer safety",
    "Would you rather start a business alone or with partners?\n(a) Alone\n(b) With partners",
    "Which industry would you want to start a business in?\n(a) Technology\n(b) Food/retail\n(c) Services (cleaning, tutoring, consulting)\n(d) Social enterprise (helping a cause)",
    "How do you feel about asking for money from investors or banks?\n(a) I'm okay with it -- it's part of the game\n(b) I'd rather start small with my own money",
    "Do you enjoy selling, marketing, and talking to people, or would you rather focus on the product itself?\n(a) I like selling and marketing\n(b) I prefer focusing on the product\n(c) I like both equally",
    "How do you handle working long hours without a guaranteed paycheck?\n(a) I'm fine with it -- the reward is worth the risk\n(b) I can do it for a while, but not forever\n(c) I need stability"
  ],
  "Social Impact": [
    "Which problem would you most want to help solve?\n(a) Poverty and inequality\n(b) Education access\n(c) Climate change and environment\n(d) Human rights and justice\n(e) Health and disease",
    "Would you rather...\n(a) Work directly with people in need (e.g., at a shelter)\n(b) Work on policies or advocacy (changing laws)",
    "Which type of organization would you prefer?\n(a) Non‑profit (charity)\n(b) Government agency\n(c) Social enterprise (business with a mission)",
    "How important is it to see measurable results (e.g., number of people helped) versus feeling emotionally connected to the cause?\n(a) Measurable results\n(b) Emotional connection\n(c) Both are important",
    "How do you feel about fundraising, writing grant proposals, or asking for donations?\n(a) I can do it\n(b) I'd rather avoid it",
    "Would you rather work in your local community or internationally?\n(a) Local\n(b) International",
    "How much would a lower salary (compared to business jobs) affect your choice?\n(a) Not at all -- the mission matters more\n(b) Somewhat, but I'd still consider it\n(c) It's a dealbreaker -- I need higher pay",
    "What skill would you most like to use to create change?\n(a) Organizing events or volunteers\n(b) Speaking up and writing (advocacy)\n(c) Analyzing data to find best solutions\n(d) Teaching or training others"
  ],
  Education: [
    "Which age group would you most enjoy teaching?\n(a) Young children (preschool/elementary)\n(b) Older children (middle school)\n(c) Teenagers (high school)\n(d) Adults (college or vocational)",
    "What subject would you most like to teach?\n(a) Math or science\n(b) Language or arts\n(c) History or social studies\n(d) Trades or life skills (cooking, woodworking)",
    "Would you rather...\n(a) Teach in a traditional classroom\n(b) Tutor one‑on‑one\n(c) Create educational materials (curriculum, videos)",
    "How do you feel about grading, lesson planning, and meeting with parents?\n(a) It's part of the job -- I'm okay with it\n(b) I'd prefer to focus only on teaching",
    "Would you consider being a school principal, counselor, or working in education policy?\n(a) Yes, I'd like that\n(b) Maybe later\n(c) No, I want to stay in the classroom",
    "How important are summer vacations and a fixed school schedule?\n(a) Very important\n(b) Somewhat important\n(c) Not important -- I'd work year‑round",
    "What motivates you more?\n(a) Helping struggling students catch up\n(b) Challenging advanced students to go further",
    "How do you feel about teaching online or using technology in the classroom?\n(a) I'm excited about it\n(b) I can learn\n(c) I prefer traditional methods"
  ],
  Creative: [
    "Which creative activity do you enjoy most?\n(a) Drawing, painting, or digital art\n(b) Writing stories, poems, or articles\n(c) Playing music or singing\n(d) Taking photos or making videos\n(e) Designing things (graphics, interiors, clothes)",
    "Would you rather...\n(a) Create for yourself (personal projects)\n(b) Create for clients or a company",
    "How important is it to earn money from your creativity?\n(a) Very important -- I want it to be my career\n(b) Somewhat important\n(c) Not important -- it's just a hobby",
    "Which work style appeals to you?\n(a) Freelance -- working for different clients\n(b) Working for a creative agency or studio\n(c) Working in‑house for a company (e.g., designer for a brand)",
    "How do you handle criticism of your creative work?\n(a) I use it to improve\n(b) I find it hard but accept it\n(c) I prefer only positive feedback",
    "What creative skill would you most like to learn or improve?\n(a) Digital illustration\n(b) Copywriting (writing ads)\n(c) Video editing\n(d) Photography\n(e) Music production",
    "How do you feel about the business side (pricing, contracts, self‑promotion)?\n(a) I'm interested in learning\n(b) I'd rather not deal with it",
    "Do you prefer working alone on creative projects or collaborating with others?\n(a) Alone\n(b) Collaborate"
  ],
  "Skilled Trades": [
    "Which trade sounds most interesting to you?\n(a) Electrical (wiring, lights)\n(b) Plumbing (pipes, water)\n(c) Carpentry (woodworking, building)\n(d) Welding (joining metal)\n(e) HVAC (heating, cooling, ventilation)\n(f) Automotive (cars, engines)",
    "Do you prefer working indoors, outdoors, or both?\n(a) Indoors\n(b) Outdoors\n(c) Both is fine",
    "How important is working with your hands compared to using computers?\n(a) I love hands‑on work\n(b) I prefer computers\n(c) Both are fine",
    "Would you rather be self‑employed (your own business) or work for a large company/union?\n(a) Self‑employed\n(b) Work for a company",
    "How do you feel about physical work (lifting, standing, bending) and safety risks?\n(a) I'm fine with it\n(b) I can handle it, but not too extreme\n(c) I prefer a desk job",
    "How do you feel about getting certifications or completing an apprenticeship?\n(a) I'm willing to do that\n(b) I'd prefer to learn on the job without formal training",
    "What aspect of trade work excites you more?\n(a) Troubleshooting and fixing problems\n(b) Building something tangible from scratch\n(c) Knowing I'll always have job security",
    "Would you consider teaching your trade to others later in your career?\n(a) Yes\n(b) Maybe\n(c) No"
  ],
  Operations: [
    "Which area of operations sounds most interesting?\n(a) Logistics (moving goods from place to place)\n(b) Supply chain (getting materials to factories)\n(c) Quality control (checking for defects)\n(d) Inventory management (tracking stock)\n(e) Project management (coordinating tasks)",
    "Would you rather...\n(a) Improve an existing process to make it faster/cheaper\n(b) Design a brand new process from scratch",
    "How do you feel about tracking numbers and metrics (e.g., delivery times, error rates)?\n(a) I like it -- data helps me see progress\n(b) I can do it, but it's not my favorite\n(c) I prefer hands‑on work over numbers",
    "Which industry would you prefer to work in?\n(a) Manufacturing (factories)\n(b) Retail (stores, e‑commerce)\n(c) Service (restaurants, cleaning, logistics)",
    "How important is working with people (coordinating teams) versus working with systems?\n(a) I prefer working with people\n(b) I prefer working with systems\n(c) Both are fine",
    "How do you react when something goes wrong (e.g., a shipment is delayed)?\n(a) I stay calm and find a solution\n(b) I get frustrated but handle it\n(c) I prefer to avoid surprises",
    "Are you interested in methods like 'lean' (reducing waste) or 'Six Sigma' (improving quality)?\n(a) Yes, I'd like to learn them\n(b) Not really",
    "How do you feel about traveling between different sites (e.g., warehouses, stores)?\n(a) I'd enjoy it\n(b) I can do it occasionally\n(c) I prefer one location"
  ],
  "Legal & Justice": [
    "Which legal area sounds most interesting?\n(a) Criminal law (crime and punishment)\n(b) Business law (contracts, companies)\n(c) Family law (divorce, child custody)\n(d) Human rights (fair treatment, equality)\n(e) Environmental law",
    "Would you rather...\n(a) Argue cases in court\n(b) Research laws and write documents\n(c) Help people reach agreements without going to court (mediation)\n(d) Make sure organizations follow the rules (compliance)",
    "How do you feel about long hours, high stress, and confrontation?\n(a) I can handle it\n(b) I prefer a calmer environment",
    "Which employer sounds better?\n(a) Private law firm\n(b) Government (prosecutor, public defender)\n(c) Non‑profit (legal aid, advocacy)\n(d) Corporation (in‑house legal team)",
    "What is more important to you?\n(a) High earning potential\n(b) Making a social impact",
    "How do you feel about reading long, complicated documents?\n(a) I enjoy it\n(b) I can do it, but it's tiring\n(c) I'd rather avoid it",
    "Would you consider becoming a paralegal, legal tech specialist, or police officer instead of a lawyer?\n(a) Yes\n(b) Maybe\n(c) No, I want to be a lawyer",
    "If you had to choose between following the law strictly or doing what you feel is morally right, which would you choose?\n(a) Follow the law\n(b) Do what feels morally right\n(c) It depends"
  ],
  "Sales & Marketing": [
    "Which sounds more fun?\n(a) Convincing someone to buy something (direct selling)\n(b) Creating ads or social media campaigns (marketing)",
    "Would you rather sell to other businesses (B2B) or directly to consumers (B2C)?\n(a) Businesses\n(b) Consumers",
    "How important is a high income from commissions versus a stable base salary?\n(a) I prefer high commissions (more risk, more reward)\n(b) I prefer a stable salary",
    "Which workplace sounds better?\n(a) A well‑known big brand\n(b) A small startup where you build from scratch",
    "How do you feel about cold calling, rejection, and meeting sales quotas?\n(a) I'm okay with it -- it's part of the job\n(b) I'd prefer to avoid cold calling\n(c) I can't handle rejection well",
    "What would you rather do?\n(a) Be creative (design ads, write catchy copy)\n(b) Be analytical (study market data, calculate ROI)",
    "How much travel are you willing to do for client meetings or events?\n(a) None\n(b) Occasional (a few times a year)\n(c) Frequent (weekly)",
    "Which skill would you most like to develop?\n(a) Negotiation\n(b) Public speaking\n(c) Social media strategy\n(d) Data analysis"
  ],
  "Hospitality & Tourism": [
    "Which area sounds most appealing?\n(a) Hotels (front desk, management)\n(b) Restaurants (server, manager, chef)\n(c) Event planning (weddings, conferences)\n(d) Travel agencies (planning trips)\n(e) Cruise ships or airlines",
    "Would you rather...\n(a) Interact with guests directly\n(b) Work behind the scenes (logistics, management)",
    "How do you feel about working evenings, weekends, and holidays?\n(a) It's fine -- that's when people travel\n(b) I can do it, but I'd prefer a regular schedule\n(c) I need weekends and holidays off",
    "Which type of establishment sounds best?\n(a) Luxury resort\n(b) Budget hostel\n(c) Fast‑food chain\n(d) Fine‑dining restaurant",
    "How important is traveling as part of your job?\n(a) I want to travel a lot\n(b) Occasional travel is fine\n(c) I prefer not to travel",
    "How do you handle demanding or angry customers?\n(a) I stay calm and try to help\n(b) I find it stressful\n(c) I avoid it if possible",
    "Would you rather manage others or be in a hands‑on service role (chef, concierge, tour guide)?\n(a) Manage others\n(b) Hands‑on role",
    "What appeals to you most?\n(a) Creating memorable experiences for guests\n(b) Organizing operations behind the scenes\n(c) Promoting destinations (marketing)"
  ],
};

// --------------------------------------------------------------
// Helper to parse options from question text
function parseOptions(questionText: string): { letter: string; text: string }[] {
  const lines = questionText.split('\n');
  const options: { letter: string; text: string }[] = [];
  for (const line of lines) {
    const match = line.match(/^\(([a-z])\)\s+(.*)$/);
    if (match) {
      options.push({ letter: match[1], text: match[2] });
    }
  }
  return options;
}

function getQuestionStem(questionText: string): string {
  const firstOptionIndex = questionText.search(/\n\([a-z]\)/);
  if (firstOptionIndex === -1) return questionText;
  return questionText.substring(0, firstOptionIndex).trim();
}

const clusterNameMap: Record<string, string> = {
  Analytical: "Analytical",
  Engineering: "Engineering",
  IT: "IT",
  Healthcare: "Healthcare",
  Research: "Research",
  Business: "Business",
  Entrepreneurship: "Entrepreneurship",
  SocialImpact: "Social Impact",
  Education: "Education",
  Creative: "Creative",
  SkilledTrades: "Skilled Trades",
  Operations: "Operations",
  Legal: "Legal & Justice",
  Sales: "Sales & Marketing",
  Hospitality: "Hospitality & Tourism",
};

export default function FollowUpPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [clusters, setClusters] = useState<string[]>([]);
  const [clusterIndex, setClusterIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [followupReport, setFollowupReport] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('topClusters');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const mapped = parsed.map((c: string) => clusterNameMap[c] || c);
        setClusters(mapped);
      } catch (e) {}
    } else {
      router.push('/');
    }
  }, [router]);

  if (!clusters.length) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const currentCluster = clusters[clusterIndex];
  const questions = clusterQuestions[currentCluster];
  if (!questions) {
    return <div className="p-6 text-center">Error: No questions found for {currentCluster}. Please go back.</div>;
  }
  const totalClusters = clusters.length;
  const totalQuestionsInCluster = questions.length;
  const currentQ = questions[questionIndex];
  const options = parseOptions(currentQ);
  const currentAnswer = answers[currentCluster]?.[questionIndex] || '';

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentCluster]: {
        ...(prev[currentCluster] || {}),
        [questionIndex]: answer,
      },
    }));
  };

  const goToPrevious = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    } else if (clusterIndex > 0) {
      const prevCluster = clusters[clusterIndex - 1];
      const prevQuestions = clusterQuestions[prevCluster];
      if (prevQuestions) {
        setClusterIndex(clusterIndex - 1);
        setQuestionIndex(prevQuestions.length - 1);
      }
    }
  };

  const goToNext = () => {
    if (questionIndex + 1 < totalQuestionsInCluster) {
      setQuestionIndex(questionIndex + 1);
    } else if (clusterIndex + 1 < totalClusters) {
      setClusterIndex(clusterIndex + 1);
      setQuestionIndex(0);
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    if (!user) {
      alert('Please log in to save your answers.');
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/save-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, answers }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        alert('Failed to save answers: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateFollowupReport = async () => {
    setLoadingReport(true);
    try {
      const storedMain = localStorage.getItem('mainAnswers');
      const mainAnswers = storedMain ? JSON.parse(storedMain) : null;
      if (!mainAnswers) throw new Error('Main answers not found');
      const res = await fetch('/api/generate-followup-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          mainAnswers,
          topClusters: clusters.map(c => ({ cluster: c, percentage: 100 })),
          followupAnswers: answers,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFollowupReport(data.report);
        setReportGenerated(true);
      } else {
        alert('Failed to generate report: ' + (data.error || 'unknown error'));
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setLoadingReport(false);
    }
  };

  // Calculate progress
  let answeredCount = 0;
  for (const cluster of clusters) {
    const clusterAnswers = answers[cluster];
    if (clusterAnswers) {
      answeredCount += Object.keys(clusterAnswers).length;
    }
  }
  const totalQuestionsAll = clusters.reduce((sum, c) => sum + (clusterQuestions[c]?.length || 0), 0);
  const progressPercent = totalQuestionsAll ? (answeredCount / totalQuestionsAll) * 100 : 0;

  if (submitted) {
    return (
      <div className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
           style={{ backgroundImage: "url('/images/bg-assess.jpg')" }}>
        <div className="absolute inset-0 bg-black/30 z-0" />
        <div className="relative z-10 max-w-2xl w-full mx-auto">
          <div className="glass-card text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Thank you!</h1>
            <p className="text-gray-200 mb-4">Your detailed answers have been saved.</p>
            {!reportGenerated ? (
              <div>
                <button onClick={generateFollowupReport} disabled={loadingReport} className="btn-primary mt-2">
                  {loadingReport ? 'Generating your personalized roadmap...' : '🚀 Get Your Career Roadmap'}
                </button>
                {loadingReport && (
                  <p className="text-sm text-gray-300 mt-2">
                    We are processing your information and preparing your result. This may take a few seconds.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4 p-4 bg-white/20 rounded-lg">
                <h2 className="text-xl font-bold text-white mb-2">Your Personalized Career Roadmap</h2>
                <p className="text-gray-200 whitespace-pre-wrap">{followupReport}</p>
                <button onClick={() => router.push('/')} className="btn-primary mt-4">
                  Go to Home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
         style={{ backgroundImage: "url('/images/bg-assess.jpg')" }}>
      <div className="absolute inset-0 bg-black/30 z-0" />
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <div className="glass-card">
          <div className="mb-4 text-sm text-gray-300">
            Cluster {clusterIndex + 1} of {clusters.length}: {currentCluster}
          </div>
          <div className="mb-4 text-sm text-gray-300">
            Question {questionIndex + 1} of {totalQuestionsInCluster}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2 mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                 style={{ width: `${progressPercent}%` }} />
          </div>
          <h2 className="text-xl font-semibold text-white mb-6">{getQuestionStem(currentQ)}</h2>
          <div className="space-y-3">
            {options.map(opt => {
              const isChecked = currentAnswer === opt.letter;
              return (
                <label
                  key={opt.letter}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                    isChecked
                      ? 'border-indigo-400 bg-indigo-900/40 shadow-md shadow-indigo-500/30'
                      : 'border-gray-300 bg-black/20 hover:border-indigo-400 hover:bg-indigo-800/30 hover:shadow-md hover:shadow-indigo-500/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="question"
                    value={opt.letter}
                    className="hidden"
                    checked={isChecked}
                    onChange={() => handleAnswer(opt.letter)}
                  />
                  <span className="text-white font-medium">{opt.text}</span>
                </label>
              );
            })}
            {options.length === 0 && (
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Type your answer"
                value={currentAnswer}
                onChange={(e) => handleAnswer(e.target.value)}
              />
            )}
          </div>
          <div className="mt-8 flex justify-between">
            <button
              onClick={goToPrevious}
              disabled={clusterIndex === 0 && questionIndex === 0}
              className="btn-secondary"
            >
              ← Previous
            </button>
            <button onClick={goToNext} disabled={loading} className="btn-primary">
              {clusterIndex === clusters.length - 1 && questionIndex === totalQuestionsInCluster - 1
                ? 'Submit'
                : 'Next →'}
            </button>
          </div>
          {loading && <div className="mt-4 text-center text-gray-300">Saving...</div>}
        </div>
      </div>
    </div>
  );
}