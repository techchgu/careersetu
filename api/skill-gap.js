/**
 * Vercel Serverless Function: /api/skill-gap
 * Computes deep skill gap analysis between student's current competencies and target career.
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { targetRole, currentSkills, experienceLevel } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `
You are an expert technical recruiter and talent development specialist for CareerSetu.
Perform a structured skill gap analysis for a student targeting the role: "${targetRole || 'Frontend Web Developer'}".
Current Skills: ${(currentSkills || ['HTML', 'CSS', 'JavaScript']).join(', ')}
Experience Level: ${experienceLevel || 'Fresher / Student'}

Return ONLY a JSON response without code blocks or backticks with this format:
{
  "targetRole": "${targetRole || 'Frontend Web Developer'}",
  "overallMatch": 68,
  "skills": [
    { "name": "HTML5 & Semantic Markup", "currentScore": 95, "requiredScore": 90, "status": "Strong", "priority": "Low", "advice": "Solid foundation established." },
    { "name": "CSS3 & Modern Layouts", "currentScore": 85, "requiredScore": 85, "status": "Strong", "priority": "Low", "advice": "Good proficiency. Practice Flexbox & CSS Grid." },
    { "name": "Vanilla JavaScript (ES6+)", "currentScore": 65, "requiredScore": 85, "status": "Developing", "priority": "High", "advice": "Master Promises, async/await, and DOM manipulation." },
    { "name": "Git & GitHub Version Control", "currentScore": 40, "requiredScore": 80, "status": "Developing", "priority": "Critical", "advice": "Learn branching, pull requests, and commit standards." },
    { "name": "REST APIs & Asynchronous Data", "currentScore": 30, "requiredScore": 75, "status": "Missing", "priority": "Critical", "advice": "Practice fetching JSON APIs and error handling." },
    { "name": "Web Performance & Responsive UI", "currentScore": 45, "requiredScore": 80, "status": "Developing", "priority": "Medium", "advice": "Learn media queries and Core Web Vitals optimization." },
    { "name": "Basic Cloud / Vercel Deployment", "currentScore": 20, "requiredScore": 70, "status": "Missing", "priority": "High", "advice": "Learn to deploy static sites and serverless APIs." }
  ],
  "learningActionPlan": [
    { "week": "Weeks 1-2", "focus": "Deep Dive JavaScript ES6+ (Async/Await, Events, Array methods)" },
    { "week": "Weeks 3-4", "focus": "Git Workflows & Collaborative GitHub Repository Management" },
    { "week": "Weeks 5-6", "focus": "Connecting Frontend to REST APIs & Firebase Firestore" },
    { "week": "Weeks 7-8", "focus": "Production Deployment, Speed Optimization & Portfolio Creation" }
  ]
}
`;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
          })
        });

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            const parsed = JSON.parse(raw.replace(/^```json\s*/, '').replace(/\s*```$/, ''));
            return res.status(200).json({ source: 'gemini-api', data: parsed });
          }
        }
      } catch (err) {
        console.warn('Gemini skill-gap API error, falling back:', err.message);
      }
    }

    // High fidelity fallback
    const role = targetRole || 'Frontend Web Developer';
    return res.status(200).json({
      source: apiKey ? 'gemini-fallback' : 'demo-mode',
      data: {
        targetRole: role,
        overallMatch: 72,
        skills: [
          { name: 'HTML5 & Semantic Structure', currentScore: 100, requiredScore: 90, status: 'Strong', priority: 'Low', advice: 'Excellent foundation; follow accessibility best practices.' },
          { name: 'CSS3 & Responsive Layouts', currentScore: 90, requiredScore: 85, status: 'Strong', priority: 'Low', advice: 'Solid styling skills; practice advanced Flexbox & CSS Grid.' },
          { name: 'Vanilla JavaScript & DOM', currentScore: 70, requiredScore: 85, status: 'Developing', priority: 'High', advice: 'Focus on ES6+ features, fetch API, and asynchronous events.' },
          { name: 'Git & GitHub Collaboration', currentScore: 40, requiredScore: 80, status: 'Developing', priority: 'Critical', advice: 'Essential for hackathons & industry. Practice pull requests and branching.' },
          { name: 'REST APIs & Serverless Functions', currentScore: 30, requiredScore: 75, status: 'Missing', priority: 'Critical', advice: 'Understand JSON data payloads and secure backend requests.' },
          { name: 'Firebase & Cloud Storage', currentScore: 45, requiredScore: 70, status: 'Developing', priority: 'Medium', advice: 'Learn Firestore rules and secure authentication workflows.' },
          { name: 'Production Deployment & Vercel', currentScore: 35, requiredScore: 75, status: 'Missing', priority: 'High', advice: 'Learn automated CI/CD and custom domain management.' }
        ],
        learningActionPlan: [
          { week: 'Weeks 1-2', focus: 'Master Vanilla JS: Array operations, Async/Await, and Web APIs' },
          { week: 'Weeks 3-4', focus: 'Implement Git version control & push daily code snippets to GitHub' },
          { week: 'Weeks 5-6', focus: 'Build a full-stack project integrating Firebase Auth and Firestore' },
          { week: 'Weeks 7-8', focus: 'Deploy on Vercel, optimize performance, and prepare interview portfolio' }
        ]
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Skill gap computation failed', details: error.message });
  }
};
