/**
 * Vercel Serverless Function: /api/career-analysis
 * Analyzes student profile and assessment to recommend career paths.
 */

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { profile, academic, assessment, currentSkills, careerGoals } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if live Gemini API is available
    if (apiKey) {
      try {
        const prompt = `
You are an expert AI Career Guidance Counselor for CareerSetu.
Analyze the following student profile and return a structured JSON response with recommended career paths.

Student Details:
- Education: ${academic?.degree || 'Undergraduate'} in ${academic?.branch || 'Computer Science / Engineering'}, Graduation Year: ${academic?.gradYear || '2026'}, CGPA: ${academic?.cgpa || '8.0'}
- Current Skills: ${(currentSkills || ['HTML', 'CSS', 'JavaScript']).join(', ')}
- Projects: ${profile?.projects || 'Basic web development and academic mini-projects'}
- Career Goals: Target Role: ${careerGoals?.targetCareer || 'Full-Stack Developer'}, Preferred Industry: ${careerGoals?.industry || 'Technology'}
- Career Assessment Answers: ${JSON.stringify(assessment || {})}

Return ONLY a valid JSON object (no markdown quotes, no backticks, no comments) with this exact schema:
{
  "summary": "Short 2-sentence encouraging summary of the student's profile potential",
  "readinessScore": 75,
  "topCareerPaths": [
    {
      "id": "frontend-dev",
      "careerName": "Frontend Web Developer",
      "matchPercentage": 88,
      "description": "Specializes in building responsive, high-performance web applications using modern web standards.",
      "whyItMaySuitYou": "Your current proficiency in HTML, CSS, and JavaScript creates a rapid trajectory into frontend engineering.",
      "requiredSkills": ["HTML5", "CSS3", "Modern JavaScript", "Git & GitHub", "REST APIs", "Responsive UI"],
      "userMatchingSkills": ["HTML5", "CSS3", "Modern JavaScript"],
      "skillsToDevelop": ["Git & GitHub", "REST APIs", "Performance Optimization"],
      "nextSteps": [
        "Build a multi-page responsive web portfolio",
        "Master asynchronous JavaScript and Fetch APIs",
        "Learn Git branching workflows and publish projects to GitHub"
      ],
      "growthOutlook": "Very High (22% projected annual expansion)"
    },
    {
      "id": "fullstack-dev",
      "careerName": "Full-Stack Web Engineer",
      "matchPercentage": 82,
      "description": "Designs both client-side user interfaces and scalable serverless or cloud backend services.",
      "whyItMaySuitYou": "Your engineering foundation and ambition to build end-to-end applications align well with full-stack roles.",
      "requiredSkills": ["Frontend Foundations", "Serverless Backend Functions", "Databases (SQL/NoSQL)", "Authentication & Security", "Cloud Deployment"],
      "userMatchingSkills": ["Frontend Foundations"],
      "skillsToDevelop": ["Serverless Architecture", "Database Modeling", "API Security"],
      "nextSteps": [
        "Deploy serverless functions on Vercel",
        "Integrate Cloud Firestore for live database operations",
        "Implement secure role-based authentication"
      ],
      "growthOutlook": "High (25% industry demand)"
    },
    {
      "id": "cloud-solutions-specialist",
      "careerName": "Cloud & AI Solutions Engineer",
      "matchPercentage": 74,
      "description": "Integrates cutting-edge generative AI models into modern cloud infrastructure and applications.",
      "whyItMaySuitYou": "Growing market demand for software developers who can bridge traditional development with AI API engineering.",
      "requiredSkills": ["API Integration", "Cloud Platforms", "Prompt Engineering", "Python / Node.js", "System Architecture"],
      "userMatchingSkills": ["Core Programming Logic"],
      "skillsToDevelop": ["Gemini / LLM API Engineering", "Vercel / Cloud Function Optimization", "Data Privacy Rules"],
      "nextSteps": [
        "Experiment with Gemini generative AI prompts and JSON mode",
        "Master cloud security rules and environment secret management"
      ],
      "growthOutlook": "Exceptional (38% surge in AI-enabled development)"
    }
  ],
  "overallAdvice": "Focus on turning your academic concepts into deployable, functional projects hosted on GitHub and Vercel."
}
        `;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 2048,
              responseMimeType: "application/json"
            }
          })
        });

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText.replace(/^```json\s*/, '').replace(/\s*```$/, ''));
            return res.status(200).json({ source: 'gemini-api', data: parsed });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, using resilient fallback:', geminiError.message);
      }
    }

    // High-quality hackathon fallback tailored to user input
    const targetCareer = careerGoals?.targetCareer || 'Frontend Web Developer';
    const parsedSkills = currentSkills && currentSkills.length > 0 ? currentSkills : ['HTML5', 'CSS3', 'JavaScript'];

    return res.status(200).json({
      source: apiKey ? 'gemini-fallback' : 'demo-mode',
      data: {
        summary: `Based on your ${academic?.branch || 'technology'} background and interest in ${targetCareer}, you demonstrate solid problem-solving aptitude with clear avenues for skill acceleration.`,
        readinessScore: 78,
        topCareerPaths: [
          {
            id: 'frontend-dev',
            careerName: targetCareer.toLowerCase().includes('data') ? 'Data Analyst / Associate' : 'Frontend Web Developer',
            matchPercentage: 86,
            description: 'Designs and builds responsive, user-friendly digital products adhering to modern web performance standards.',
            whyItMaySuitYou: `Your proficiency with ${parsedSkills.slice(0, 3).join(', ')} provides an immediate head start in building high-impact user experiences.`,
            requiredSkills: ['HTML5', 'CSS3', 'Modern JavaScript', 'Git & GitHub', 'REST APIs', 'Responsive Design'],
            userMatchingSkills: parsedSkills.filter(s => ['HTML', 'HTML5', 'CSS', 'CSS3', 'JavaScript', 'JS'].includes(s)),
            skillsToDevelop: ['Git & GitHub', 'REST APIs', 'Cloud Serverless Integration'],
            nextSteps: [
              'Build a comprehensive portfolio with 3 deployed applications',
              'Master asynchronous data fetching and API security',
              'Contribute to open-source student repositories on GitHub'
            ],
            growthOutlook: 'Very High (22% projected annual growth in 2026)'
          },
          {
            id: 'fullstack-dev',
            careerName: 'Full-Stack Software Engineer',
            matchPercentage: 80,
            description: 'Bridges frontend design with scalable serverless backend logic, database persistence, and API orchestration.',
            whyItMaySuitYou: 'Employers highly value developers who can independently take a product from database design to published web interface.',
            requiredSkills: ['Frontend Core', 'Serverless Functions', 'Firebase / NoSQL', 'Security Rules', 'API Design'],
            userMatchingSkills: ['Frontend Core'],
            skillsToDevelop: ['Serverless Functions', 'Database Schema Modeling', 'Authentication Flows'],
            nextSteps: [
              'Deploy serverless backend APIs on Vercel',
              'Configure Firebase Firestore database security rules',
              'Build end-to-end CRUD operations with user authentication'
            ],
            growthOutlook: 'High (26% industry demand across tech hubs)'
          },
          {
            id: 'ai-solutions-developer',
            careerName: 'AI & Cloud Solutions Developer',
            matchPercentage: 75,
            description: 'Integrates Large Language Models (LLMs) and cloud services into real-world student and enterprise workflows.',
            whyItMaySuitYou: 'Adding generative AI API mastery to your existing software foundations unlocks cutting-edge fresher roles.',
            requiredSkills: ['Gemini API', 'Prompt Engineering', 'Serverless Deployment', 'API Security', 'System Integration'],
            userMatchingSkills: ['Core Programming Logic'],
            skillsToDevelop: ['Prompt Engineering', 'Secure Environment Variables', 'Structured AI Outputs'],
            nextSteps: [
              'Implement Gemini structured JSON endpoints',
              'Follow secure token handling guidelines',
              'Showcase AI-powered solutions in your hackathon portfolio'
            ],
            growthOutlook: 'Exceptional (Over 35% surge in AI-augmented software engineering)'
          }
        ],
        overallAdvice: 'Ground your theoretical coursework with live GitHub codebases and verified portfolio deployments.'
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error processing career analysis', message: error.message });
  }
};
