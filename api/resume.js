/**
 * Vercel Serverless Function: /api/resume
 * AI-powered resume enhancement and ATS compatibility feedback.
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { targetRole, resumeText, summary, skills, projects, experience } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `
You are a senior technical hiring manager and ATS resume optimization expert for CareerSetu.
Evaluate the following student resume for the position: "${targetRole || 'Software Developer'}".

Resume Information:
- Target Role: ${targetRole || 'Software Developer'}
- Summary: ${summary || 'Passionate student seeking software engineering opportunity.'}
- Skills: ${skills || 'HTML, CSS, JavaScript, Git'}
- Projects: ${projects || 'Created portfolio website and college event management portal.'}
- Experience: ${experience || 'Student project leader, college tech fest volunteer.'}
- Raw content if any: ${resumeText || 'N/A'}

Provide constructive, realistic feedback. Do not fabricate fake qualifications or experiences.
Return ONLY valid JSON matching this schema:
{
  "atsScore": 76,
  "matchLevel": "Good Potential",
  "summaryCritique": {
    "original": "${summary || 'Passionate student seeking software engineering opportunity.'}",
    "improved": "Results-oriented software developer with solid competencies in modern web architecture, JavaScript, and cloud deployments. Proven track record of building responsive, production-ready applications with clean code standards.",
    "tips": "Focus on tangible technical capabilities and problem-solving impact rather than generic enthusiasm."
  },
  "keywordAnalysis": {
    "foundKeywords": ["JavaScript", "HTML", "CSS", "Git", "Web Development"],
    "missingKeywords": ["REST APIs", "CI/CD", "Asynchronous Programming", "Firestore / Database", "Unit Testing"],
    "recommendation": "Incorporate keywords naturally into your project descriptions and technical skills matrix."
  },
  "projectImprovements": [
    {
      "originalBullet": "Built a website for college events using HTML and JS.",
      "improvedBullet": "Architected an interactive, responsive college event portal utilizing Vanilla JavaScript and modern CSS, improving event registration turnaround by 40%."
    },
    {
      "originalBullet": "Worked on backend and database connection.",
      "improvedBullet": "Implemented secure serverless API endpoints and integrated Cloud Firestore, enabling real-time persistence with strict security rules."
    }
  ],
  "missingSections": [
    "Quantified project outcomes (e.g. users served, load time reduction)",
    "Direct links to live deployments and public GitHub source repositories"
  ],
  "overallVerdict": "Your technical foundation is evident. Elevating action verbs and showcasing verifiable live project URLs will dramatically increase your interview invitation rate."
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
        console.warn('Gemini resume API error, falling back:', err.message);
      }
    }

    // High fidelity fallback
    const role = targetRole || 'Frontend / Software Engineer';
    return res.status(200).json({
      source: apiKey ? 'gemini-fallback' : 'demo-mode',
      data: {
        atsScore: 78,
        matchLevel: "Strong Candidate for Fresher Roles",
        summaryCritique: {
          original: summary || "Computer science student eager to learn and contribute to software development.",
          improved: `Proactive ${role} with strong foundations in HTML5, CSS3, modern JavaScript, and cloud integrations. Adept at transforming wireframes into performant, accessible digital products deployed on Vercel.`,
          tips: "Replace passive statements with demonstrable skills, technologies mastered, and measurable project impact."
        },
        keywordAnalysis: {
          foundKeywords: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Git"],
          missingKeywords: ["REST APIs", "Serverless Functions", "Cloud Firestore", "Security Rules", "Cross-Browser Compatibility"],
          recommendation: `Add the missing keywords specifically into your project bullet points for "${role}".`
        },
        projectImprovements: [
          {
            originalBullet: projects ? "Created web project for university coursework." : "Built web pages using JavaScript and CSS.",
            improvedBullet: "Engineered responsive, lightweight web application featuring modular Vanilla JS and CSS Grid, achieving sub-second load times and 100% Lighthouse audit score."
          },
          {
            originalBullet: "Handled data saving and user login.",
            improvedBullet: "Configured secure user authentication and Firestore NoSQL persistence with granular security rules, safeguarding user data across sessions."
          }
        ],
        missingSections: [
          "Verifiable GitHub repository and live Vercel deployment links",
          "Specific technical certifications (e.g. Google Cloud, FreeCodeCamp)",
          "Hackathon participations and collaborative engineering experiences"
        ],
        overallVerdict: "Your profile has high potential. By incorporating metrics, STAR-format bullet points, and live deployment links, your resume will pass initial ATS filters with ease."
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to analyze resume', details: error.message });
  }
};
