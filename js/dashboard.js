/**
 * CareerSetu AI — Main Dashboard Controller
 */

import { checkAuthGuard, renderUserProfileWidget } from './auth.js';
import { getUserData, getCurrentUser } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuthGuard()) return;
  renderUserProfileWidget();

  const user = getCurrentUser();
  const welcomeNameEl = document.getElementById('welcome-user-name');
  
  if (welcomeNameEl && user) {
    const rawName = user.displayName || user.email?.split('@')[0] || 'Student';
    welcomeNameEl.textContent = rawName.split(' ')[0];
  }

  loadDashboardSummary();

  async function loadDashboardSummary() {
    try {
      const profile = (await getUserData('profiles')) || {};
      const recommendations = (await getUserData('careerRecommendations')) || {};
      const skillGaps = (await getUserData('skillGaps')) || {};
      const roadmap = (await getUserData('roadmaps')) || {};
      const resume = (await getUserData('resumes')) || {};
      const interview = (await getUserData('interviews')) || {};

      if (profile.fullName && welcomeNameEl) {
        welcomeNameEl.textContent = profile.fullName.split(' ')[0];
      }

      // 1. Target Career Card
      const targetRole = profile.targetCareer || (recommendations.data?.topCareers?.[0]?.title) || 'AI / ML Engineer';
      const roleEl = document.getElementById('dash-target-role');
      if (roleEl) roleEl.textContent = targetRole;

      // 2. Metrics
      const fitScore = recommendations.data?.readinessScore || 81;
      const fitEl = document.getElementById('dash-career-fit-val');
      if (fitEl) fitEl.textContent = `${fitScore}%`;

      const skillsEl = document.getElementById('dash-skills-val');
      if (skillsEl) {
        const topGaps = skillGaps.data?.missingCriticalSkills || [];
        const score = topGaps.length ? Math.max(50, 95 - (topGaps.length * 8)) : 74;
        skillsEl.textContent = `${score}%`;
      }

      const resumeScore = resume.data?.atsScore || 72;
      const resumeEl = document.getElementById('dash-resume-val');
      if (resumeEl) resumeEl.textContent = `${resumeScore}%`;

      const interviewScore = interview.averageScore ? Math.round(interview.averageScore * 10) : 63;
      const interviewEl = document.getElementById('dash-interview-val');
      if (interviewEl) interviewEl.textContent = `${interviewScore}%`;

      // 3. Top Gap Skill
      const gapEl = document.getElementById('dash-top-gap');
      if (gapEl) {
        const firstGap = skillGaps.data?.missingCriticalSkills?.[0]?.skill || 'Machine Learning & Cloud Architecture';
        gapEl.textContent = firstGap;
      }

      // 4. Update Journey Step Highlights
      updateJourneySteps(profile, recommendations, roadmap, resume, interview);
    } catch (err) {
      console.warn('Dashboard summary error:', err);
    }
  }

  function updateJourneySteps(profile, recs, roadmap, resume, interview) {
    const step1 = document.getElementById('step-profile');
    const step2 = document.getElementById('step-career');
    const step3 = document.getElementById('step-skills');
    const step4 = document.getElementById('step-learning');
    const step5 = document.getElementById('step-opportunities');
    const step6 = document.getElementById('step-prep');
    const step7 = document.getElementById('step-readiness');

    if (profile.fullName && step1) step1.classList.add('completed');
    if (recs.data && step2) step2.classList.add('completed');
    if (step3) step3.classList.add('completed');
    if (step4) step4.classList.add('completed');
    if (step5) step5.classList.add('active');
    if (resume.data && step6) step6.classList.add('completed');
    if (step7) step7.classList.add('active');
  }
});
