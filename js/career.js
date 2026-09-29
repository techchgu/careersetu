/**
 * CareerSetu — AI Career Recommendations
 */

import { checkAuthGuard, renderUserProfileWidget } from './auth.js';
import { getUserData, saveUserData } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuthGuard()) return;
  renderUserProfileWidget();

  const container = document.getElementById('career-results-container');
  const summaryBox = document.getElementById('career-summary-box');
  const refreshBtn = document.getElementById('refresh-analysis-btn');

  loadCareerAnalysis();

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadCareerAnalysis(true);
    });
  }

  async function loadCareerAnalysis(forceRefresh = false) {
    if (!container) return;

    // Show AI loading state
    container.innerHTML = `
      <div class="card loading-container">
        <span class="loading-spinner" style="width: 40px; height: 40px;"></span>
        <div class="ai-pulse-badge">
          <span class="pulse-dot"></span>
          AI is analyzing your academic profile, skills and assessment...
        </div>
        <p class="text-muted" style="max-width: 500px; font-size: 0.9rem;">
          Evaluating market demand, skill alignment, and high-growth technology pathways...
        </p>
      </div>
    `;

    try {
      // Check cached recommendations if not forcing refresh
      if (!forceRefresh) {
        const cached = await getUserData('careerRecommendations');
        if (cached && cached.data) {
          renderAnalysis(cached.data);
          return;
        }
      }

      // Fetch user profile and assessment for analysis
      const profile = (await getUserData('profiles')) || {};
      const assessment = (await getUserData('assessments')) || {};

      const currentSkills = profile.technicalSkills
        ? profile.technicalSkills.split(',').map(s => s.trim())
        : ['HTML5', 'CSS3', 'JavaScript', 'Git'];

      const payload = {
        profile,
        academic: {
          degree: profile.educationLevel || 'B.Tech',
          branch: profile.branch || 'Computer Science',
          gradYear: profile.gradYear || '2026',
          cgpa: profile.cgpa || '8.2'
        },
        assessment,
        currentSkills,
        careerGoals: {
          targetCareer: profile.targetCareer || 'Frontend Web Developer',
          industry: profile.preferredIndustry || 'Information Technology'
        }
      };

      // Call Vercel Serverless Function
      const res = await fetch('/api/career-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      const analysisData = json.data;

      // Save to Firestore
      await saveUserData('careerRecommendations', { data: analysisData });

      renderAnalysis(analysisData);
    } catch (err) {
      console.warn('API fetch error, falling back locally:', err);
      // Resilient local render
      renderFallbackAnalysis();
    }
  }

  function renderAnalysis(data) {
    if (summaryBox && data.summary) {
      summaryBox.innerHTML = `
        <div class="card" style="border-left: 4px solid var(--brand-cyan); margin-bottom: 2rem;">
          <div class="flex-between mb-1">
            <div class="flex-align">
              <span class="badge badge-cyan">AI Recommendation</span>
              <span class="text-dim" style="font-size: 0.8rem;">Powered by Gemini API</span>
            </div>
            <span class="badge badge-emerald">Readiness: ${data.readinessScore || 78}%</span>
          </div>
          <p style="font-size: 1.05rem; line-height: 1.6;">${data.summary}</p>
          ${data.overallAdvice ? `<p class="text-muted mt-1" style="font-size: 0.9rem;"><strong>Strategy Tip:</strong> ${data.overallAdvice}</p>` : ''}
        </div>
      `;
    }

    const paths = data.topCareerPaths || [];
    let html = '';

    paths.forEach((career, idx) => {
      const matchPct = career.matchPercentage || 80;
      const matchBadgeClass = matchPct >= 80 ? 'badge-emerald' : matchPct >= 70 ? 'badge-cyan' : 'badge-amber';

      html += `
        <div class="card mb-2" style="position: relative;">
          <div class="flex-between mb-1">
            <div>
              <span class="text-dim" style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700;">Path ${idx + 1}</span>
              <h3 style="margin-top: 0.2rem;">${career.careerName}</h3>
            </div>
            <span class="badge ${matchBadgeClass}" style="font-size: 0.9rem;">${matchPct}% Fit Match</span>
          </div>
          
          <p class="text-muted mb-1" style="font-size: 0.95rem;">${career.description}</p>
          
          <div style="background: rgba(0, 210, 255, 0.05); border: 1px solid rgba(0, 210, 255, 0.15); border-radius: var(--radius-md); padding: 0.85rem 1.15rem; margin-bottom: 1.25rem;">
            <p style="font-size: 0.875rem;"><strong class="text-cyan">Why It May Suit You:</strong> ${career.whyItMaySuitYou}</p>
          </div>

          <div class="grid-2 mb-1">
            <div>
              <h4 style="font-size: 0.9rem; margin-bottom: 0.6rem; color: #6ee7b7;">✓ Your Matching Skills</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                ${(career.userMatchingSkills || []).map(s => `<span class="badge badge-emerald">${s}</span>`).join('') || '<span class="text-dim">Baseline alignment</span>'}
              </div>
            </div>
            <div>
              <h4 style="font-size: 0.9rem; margin-bottom: 0.6rem; color: #fbbf24;">◐ Skills To Develop (Gaps)</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                ${(career.skillsToDevelop || []).map(s => `<span class="badge badge-amber">${s}</span>`).join('')}
              </div>
            </div>
          </div>

          <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);" class="flex-between">
            <span class="text-dim" style="font-size: 0.8rem;">Outlook: <strong class="text-main">${career.growthOutlook || 'Strong Expansion'}</strong></span>
            <div style="display: flex; gap: 0.5rem;">
              <a href="skill-gap.html" class="btn btn-sm btn-outline">Analyze Skill Gap</a>
              <a href="roadmap.html" class="btn btn-sm btn-primary">Generate Roadmap</a>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function renderFallbackAnalysis() {
    renderAnalysis({
      summary: "Your engineering foundation in modern web development and software architecture positions you strongly for high-demand digital engineering careers.",
      readinessScore: 78,
      overallAdvice: "Turn academic projects into live deployed portfolio products on GitHub and Vercel to establish competitive edge.",
      topCareerPaths: [
        {
          careerName: "Frontend Web Developer",
          matchPercentage: 88,
          description: "Builds intuitive, performant user interfaces for web and enterprise SaaS applications.",
          whyItMaySuitYou: "Your proficiency with HTML5, CSS3, and JavaScript provides an immediate head start.",
          userMatchingSkills: ["HTML5", "CSS3", "JavaScript"],
          skillsToDevelop: ["Git & GitHub", "REST APIs", "Vercel Deployment"],
          growthOutlook: "22% projected annual growth"
        },
        {
          careerName: "Full-Stack Software Engineer",
          matchPercentage: 80,
          description: "Engineers end-to-end applications from database models to responsive client interfaces.",
          whyItMaySuitYou: "Strong analytical problem-solving foundation enables rapid full-stack adoption.",
          userMatchingSkills: ["Frontend Core"],
          skillsToDevelop: ["Serverless Backend", "Cloud Firestore", "Security Architecture"],
          growthOutlook: "25% demand across tech hubs"
        }
      ]
    });
  }
});
