/**
 * Vercel Serverless Function: /api/roadmap
 * Generates personalized 6-month career roadmaps.
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { targetRole, currentSkills, learningStyle, weeklyHours } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `
Generate a structured 6-Month Career Roadmap for a student pursuing: "${targetRole || 'Full-Stack Software Engineer'}".
Current skills: ${(currentSkills || ['HTML', 'CSS', 'JavaScript']).join(', ')}
Weekly commitment: ${weeklyHours || 15} hours/week.
Learning style: ${learningStyle || 'Hands-on project based'}.

Return ONLY valid JSON matching this schema:
{
  "targetRole": "${targetRole || 'Full-Stack Software Engineer'}",
  "totalMonths": 6,
  "months": [
    {
      "month": 1,
      "title": "Core Foundations & Engineering Discipline",
      "focus": "Strengthening fundamental programming, Git, and web standards",
      "milestone": "Publish 3 clean repositories on GitHub with README documentation",
      "tasks": [
        { "id": "m1-t1", "title": "Deep dive into ES6+ JavaScript (Closures, Promises, Fetch API)", "status": "completed" },
        { "id": "m1-t2", "title": "Practice semantic HTML5 accessibility and modern CSS layout engines", "status": "in-progress" },
        { "id": "m1-t3", "title": "Establish daily Git commit habit and learn feature branching", "status": "not-started" }
      ]
    },
    {
      "month": 2,
      "title": "Backend, APIs & Cloud Persistence",
      "focus": "Serverless APIs and NoSQL database modeling",
      "milestone": "Deploy a serverless backend interacting with Cloud Firestore",
      "tasks": [
        { "id": "m2-t1", "title": "Build and test REST endpoints using Vercel Serverless Functions", "status": "not-started" },
        { "id": "m2-t2", "title": "Integrate Firebase Authentication (Email/Password & session handling)", "status": "not-started" },
        { "id": "m2-t3", "title": "Write robust Firestore security rules to protect user records", "status": "not-started" }
      ]
    },
    {
      "month": 3,
      "title": "Real-World Projects & AI Integration",
      "focus": "Building production-grade hackathon/portfolio applications",
      "milestone": "Launch a full-stack web application with AI capabilities",
      "tasks": [
        { "id": "m3-t1", "title": "Integrate Google Gemini API securely through backend functions", "status": "not-started" },
        { "id": "m3-t2", "title": "Design a responsive, modern UI with pure CSS and zero heavy bloat", "status": "not-started" },
        { "id": "m3-t3", "title": "Perform cross-device testing and performance audit (Lighthouse 90+)", "status": "not-started" }
      ]
    },
    {
      "month": 4,
      "title": "Certifications, Open Source & Code Quality",
      "focus": "Industry credibility and code review practice",
      "milestone": "Complete 1 recognized cloud certification and contribute to an open repo",
      "tasks": [
        { "id": "m4-t1", "title": "Earn a foundational cloud or web development certification", "status": "not-started" },
        { "id": "m4-t2", "title": "Solve 50 intermediate data structure & algorithmic challenges", "status": "not-started" },
        { "id": "m4-t3", "title": "Refactor portfolio projects with modular, readable documentation", "status": "not-started" }
      ]
    },
    {
      "month": 5,
      "title": "Resume Polish & Mock Interview Drills",
      "focus": "Career readiness, ATS optimization, and technical communication",
      "milestone": "Clear 5 AI mock interviews with 80%+ readiness score",
      "tasks": [
        { "id": "m5-t1", "title": "Optimize resume using CareerSetu AI Resume Assistant with target keywords", "status": "not-started" },
        { "id": "m5-t2", "title": "Complete technical and behavioral mock interview sessions", "status": "not-started" },
        { "id": "m5-t3", "title": "Build a live personal developer showcase site hosted on Vercel", "status": "not-started" }
      ]
    },
    {
      "month": 6,
      "title": "Applications, Networking & Career Launch",
      "focus": "Active hiring pipeline and government / private job applications",
      "milestone": "Submit 25 tailored applications and interview for target positions",
      "tasks": [
        { "id": "m6-t1", "title": "Apply for curated fresher roles and internships on CareerSetu portal", "status": "not-started" },
        { "id": "m6-t2", "title": "Track Central & State technical recruitment announcements", "status": "not-started" },
        { "id": "m6-t3", "title": "Conduct professional outreach to mentors and engineering alumni", "status": "not-started" }
      ]
    }
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
        console.warn('Gemini roadmap API error, falling back:', err.message);
      }
    }

    // High fidelity fallback roadmap
    const role = targetRole || 'Frontend / Full-Stack Web Developer';
    return res.status(200).json({
      source: apiKey ? 'gemini-fallback' : 'demo-mode',
      data: {
        targetRole: role,
        totalMonths: 6,
        months: [
          {
            month: 1,
            title: "Month 1: Core Foundations & Coding Standards",
            focus: "Strengthen modern JavaScript, semantic web structure, and version control",
            milestone: "Build 3 modular mini-apps and commit them with Git best practices",
            tasks: [
              { id: "m1-t1", title: "Master Vanilla JavaScript ES6+ (Async/Await, Closures, DOM Events)", status: "completed" },
              { id: "m1-t2", title: "Implement responsive layouts using pure CSS Grid and Flexbox", status: "in-progress" },
              { id: "m1-t3", title: "Set up GitHub profile with documented portfolio repositories", status: "not-started" }
            ]
          },
          {
            month: 2,
            title: "Month 2: Backend Architecture & Databases",
            focus: "Serverless compute, Firestore database modeling, and secure APIs",
            milestone: "Deploy an authenticated full-stack application with real database reads/writes",
            tasks: [
              { id: "m2-t1", title: "Write Vercel Serverless Functions for RESTful data handling", status: "not-started" },
              { id: "m2-t2", title: "Integrate Firebase Authentication for secure user sessions", status: "not-started" },
              { id: "m2-t3", title: "Configure Firestore database security rules for private user records", status: "not-started" }
            ]
          },
          {
            month: 3,
            title: "Month 3: Capstone Product & AI Integration",
            focus: "Build and deploy an impactful, hackathon-ready capstone project",
            milestone: "Deploy capstone project live on Vercel with zero performance bottlenecks",
            tasks: [
              { id: "m3-t1", title: "Integrate Gemini AI API server-side without exposing credentials", status: "not-started" },
              { id: "m3-t2", title: "Implement clean UI loading animations and user-friendly error boundaries", status: "not-started" },
              { id: "m3-t3", title: "Conduct multi-device usability tests and cross-browser validation", status: "not-started" }
            ]
          },
          {
            month: 4,
            title: "Month 4: Certifications & Algorithm Problem Solving",
            focus: "Industry credentials, algorithmic practice, and code review",
            milestone: "Obtain a verified course certificate and complete 50 LeetCode / HackerRank problems",
            tasks: [
              { id: "m4-t1", title: "Complete high-impact cloud / full-stack developer certification", status: "not-started" },
              { id: "m4-t2", title: "Practice data structures (Arrays, Objects, Recursion, Search algorithms)", status: "not-started" },
              { id: "m4-t3", title: "Write a technical blog post or project breakdown on LinkedIn/Dev.to", status: "not-started" }
            ]
          },
          {
            month: 5,
            title: "Month 5: AI Resume & Mock Interview Mastery",
            focus: "Job-readiness, ATS keyword optimization, and technical communication",
            milestone: "Score 85%+ on technical mock interviews with personalized AI feedback",
            tasks: [
              { id: "m5-t1", title: "Analyze and tune resume using CareerSetu AI Resume Assistant", status: "not-started" },
              { id: "m5-t2", title: "Complete 3 technical and 2 behavioral mock interviews on CareerSetu", status: "not-started" },
              { id: "m5-t3", title: "Refine elevator pitch and prepare STAR-method project case studies", status: "not-started" }
            ]
          },
          {
            month: 6,
            title: "Month 6: Job Applications & Career Launch",
            focus: "Strategic job submissions, internship matching, and final interviews",
            milestone: "Receive first internship or full-time offer in target career field",
            tasks: [
              { id: "m6-t1", title: "Apply to 20+ verified jobs & internships on CareerSetu Opportunities", status: "not-started" },
              { id: "m6-t2", title: "Explore central & state government technical vacancy notifications", status: "not-started" },
              { id: "m6-t3", title: "Participate in national hackathons and showcase deployed projects", status: "not-started" }
            ]
          }
        ]
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate roadmap', details: error.message });
  }
};
