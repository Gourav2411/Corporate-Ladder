const fs = require('fs');

const skillNames = [
  'Growth Hacking', 'Disruptive Innovation', 'Blockchain Integration', 'Agile Transformation', 
  'Six Sigma Black Belt', 'Bleeding Edge Insights', 'Thought Leadership', 'Holistic Approach', 
  'Paradigm Shift', 'Pivot Strategy', 'Blue Ocean Strategy', 'Core Competencies', 
  'Wheelhouse Optimization', 'Boil the Ocean', 'Low Hanging Fruit', 'Wheel Reinvention',
  'Deep Dive', 'Bandwidth Expansion', 'Circle Back', 'Ping Protocol', 
  'Take Offline', 'Actionable Insights', 'Big Data Mining', 'Cloud Native Workflow',
  'Value Add', 'Game Changer', 'Win-Win Scenario', 'Hyperlocal Targeting',
  'Omnichannel Execution', 'Touchplot Sync', 'North Star Alignment', 'Key Deliverables',
  'Silo Busting', 'Cross-functional Synergy', 'Scalable Solutions', 'Optics Management',
  'Bandwidth Reallocation', 'Stakeholder Alignment', 'ROI Maximization', 'KPI Crushing',
  'Data-Driven Decisions', 'Customer Centricity', 'Market Penetration', 'First Mover Advantage',
  'B2B Dynamics', 'B2C Outreach', 'Growth Mindset', 'Ideation Session',
  'Mindshare Capture', 'Strategic Alliance', 'Leverage Assets', 'Monetization Engine',
  'Future-Proofing', 'Mission Critical', 'Return on Investment', 'Skin in the Game',
  'Sweat Equity', 'Move the Needle', 'Outside the Box', 'Thought Shower',
  'Brain Dump', 'Drill Down', 'Scope Creep Management', 'Right-sizing',
  'Downsizing', 'Restructuring', 'Vertical Integration', 'Horizontal Scaling',
  '360-Degree Feedback', 'Open Door Policy', 'Culture Fit', 'Onboarding Optimization',
  'Offboarding Streamlining', 'Talent Acquisition', 'Headcount Management', 'Freemium Model',
  'A/B Testing', 'Growth Loop', 'Viral Coefficient', 'Churn Reduction',
  'LTV Maximization', 'CAC Optimization', 'Funnel Conversion', 'Bounce Rate Minimization',
  'Net Promoter Score', 'Customer Journey', 'User Flow', 'UI/UX Enhancement',
  'Design Thinking', 'Minimum Viable Product', 'Product Market Fit', 'Iteration Velocity',
  'Pivot to Video', 'Metaverse Integration', 'Web3 Strategy', 'AI-Driven Development',
  'Machine Learning Pipeline', 'Quantum Readiness', 'Neural Network Scaling', 'LLM Prompt Engineering',
  'API First Design', 'Microservices Architecture', 'Serverless Deployment', 'Edge Computing',
  'Zero Trust Security', 'Blockchain Ledgering', 'Smart Contract Auditing', 'Crypto Hedging'
];

let addedSkills = [];
let prevDeps = ['coffee_boost', 'marketing_buzz', 'combo_retain', 'action_synergize_aoe'];
let curCost = 5000;
for(let i = 0; i < 100; i++) {
  const name = (skillNames[i % skillNames.length] || `Corporate Synergist ${i}`) + (i >= skillNames.length ? ' II' : '');
  const id = 'skill_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + i;
  const dep = prevDeps[Math.floor(Math.random() * prevDeps.length)];
  const icons = ['📊', '🚀', '💡', '💰', '🧠', '🤝', '📈', '🏢', '📋', '👔', '📉', '💼', '📅', '🗑️', '⏱️'];
  const icon = icons[Math.floor(Math.random() * icons.length)];
  const cost = curCost + Math.floor(Math.random() * 50) * 100;
  
  // Exponentially increase cost softly
  curCost += Math.floor(curCost * 0.05);

  addedSkills.push(`   { id: '${id}', name: '${name.replace(/'/g, "\\'")}', desc: 'Increases global Synergy multiplier by 0.${(Math.random() * 9 + 1).toFixed(0)}%.', cost: ${cost}, icon: '${icon}', dependencies: ['${dep}'], type: 'passive' }`);
  prevDeps.push(id);
  // keep a sliding window to keep branches deep
  if(prevDeps.length > 8) prevDeps.shift();
}

let appTs = fs.readFileSync('src/app/app.ts', 'utf8');

// Replace SKILL_TREE
const skillTreeMatch = /export const SKILL_TREE: SkillNode\[\] = \[\n([\s\S]*?)\n\];/m;
const existingSkills = appTs.match(skillTreeMatch)[1];
const newSkillTree = `export const SKILL_TREE: SkillNode[] = [\n${existingSkills},\n${addedSkills.join(',\n')}\n];`;
appTs = appTs.replace(skillTreeMatch, newSkillTree);

// Generate 20+ more skins
const extraSkins = [
    "{id: 'ninja', name: 'Scrum Ninja', desc: 'Sprints in stealth.', unlockLevel: 10}",
    "{id: 'wizard', name: 'Data Wizard', desc: 'Predicts the past.', unlockLevel: 15}",
    "{id: 'pirate', name: 'Growth Pirate', desc: 'Aaaargh-O-I.', unlockLevel: 20}",
    "{id: 'astronaut', name: 'Moonshot Strategist', desc: 'Houston, we have synergy.', unlockLevel: 25}",
    "{id: 'casual', name: 'Jeans & Blazer', desc: 'Casual Friday veteran.', unlockLevel: 30}",
    "{id: 'goth', name: 'Corporate Goth', desc: 'It is not a phase, HR.', unlockLevel: 35}",
    "{id: 'robo', name: 'Automated Executive', desc: 'Replaced by AI.', unlockLevel: 40}",
    "{id: 'zombie', name: 'Burnout Survivor', desc: 'Powered by espresso and fear.', unlockLevel: 45}",
    "{id: 'ghost', name: 'Quiet Quitter', desc: 'Barely visible during meetings.', unlockLevel: 50}",
    "{id: 'clown', name: 'Office Clown', desc: 'Brings joy, misses KPIs.', unlockLevel: 55}",
    "{id: 'knight', name: 'White Knight', desc: 'Saves failing projects.', unlockLevel: 60}",
    "{id: 'vampire', name: 'Time Vampire', desc: 'Specializes in 2-hour meetings.', unlockLevel: 65}",
    "{id: 'angel', name: 'Angel Investor', desc: 'Sprinkles seed funding.', unlockLevel: 70}",
    "{id: 'demon', name: 'Micromanager', desc: 'Breathes down your neck.', unlockLevel: 75}",
    "{id: 'hacker', name: '10x Engineer', desc: 'Types very fast.', unlockLevel: 80}",
    "{id: 'dinosaur', name: 'Legacy System', desc: 'Refuses to upgrade.', unlockLevel: 85}",
    "{id: 'superhero', name: 'Agile Champion', desc: 'Rescues the sprint.', unlockLevel: 90}",
    "{id: 'king', name: 'The Founder', desc: 'Rules with an iron fist.', unlockLevel: 95}",
    "{id: 'god', name: 'Board Member', desc: 'Unreachable. Unknowable.', unlockLevel: 100}",
    "{id: 'alien', name: 'Outside Consultant', desc: 'Doesnt understand the culture.', unlockLevel: 150}"
];

const availableSkinsMatch = /availableSkins = \[\n([\s\S]*?)\n[ ]*\];/m;
const existingSkins = appTs.match(availableSkinsMatch)[1];
const newAvailableSkins = `availableSkins = [\n${existingSkins},\n      ${extraSkins.join(',\n      ')}\n  ];`;
appTs = appTs.replace(availableSkinsMatch, newAvailableSkins);

appTs = appTs.replace(/playerSkin = signal<.*>\('classic'\);/, "playerSkin = signal<string>('classic');");

fs.writeFileSync('src/app/app.ts', appTs);
console.log('Successfully injected skills and skins!');
