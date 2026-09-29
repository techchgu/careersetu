/**
 * CareerSetu — Skill Gap Analysis
 */

import { checkAuthGuard, renderUserProfileWidget } from './auth.js';
import { getUserData, saveUserData } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuthGuard()) return;
  renderUserProfileWidget();

  const skillsContainer = document.getElementById('skills-gap-container');
  const actionPlanContainer = document.getElementById('action-plan-container');
  const targetRoleTitle = document.getElementById('target-role-title');

  loadSkillGap();

  async function loadSkillGap() {
    if (!skillsContainer) return;

    skillsContainer.innerHTML = `
      <div class="card loading-container">
        <span class="loading-spinner"></span>
        <div class="ai-pulse-badge">
          <span class="pulse-dot"></span>
          AI is computing your technical skill gaps...
        </div>
      </div>
    `;

    try {
      const profile = (await getUserData('profiles')) || {};
      const targetRole = profile.targetCareer || 'Frontend Web Developer';
      if (targetRoleTitle) targetRoleTitle.textContent = targetRole;

      const currentSkills = profile.technicalSkills
        ? profile.technicalSkills.split(',').map(s => s.trim())
        : ['HTML5', 'CSS3', 'JavaScript'];

      const res = await fetch('/api/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, currentSkills, experienceLevel: profile.experienceLevel })
      });

      if (!res.ok) throw new Error('Skill gap API returned ' + res.status);

      const json = await res.json();
      const gapData = json.data;

      // Save to Firestore
      await saveUserData('skillGaps', { data: gapData });

      renderSkillGap(gapData);
    } catch (err) {
      console.warn('Skill gap error, falling back locally:', err);
      renderFallbackSkillGap();
    }
  }

  function renderSkillGap(data) {
    const skills = data.skills || [];
    let skillsHtml = '';

    skills.forEach(skill => {
      const currentScore = skill.currentScore || 50;
      const requiredScore = skill.requiredScore || 85;
      const statusClass = skill.status === 'Strong' ? 'badge-emerald' : skill.status === 'Developing' ? 'badge-amber' : 'badge-rose';
      const progressClass = skill.status === 'Strong' ? 'progress-fill-emerald' : skill.status === 'Developing' ? 'progress-fill-amber' : 'progress-fill-rose';

      skillsHtml += `
        <div class="card mb-1">
          <div class="flex-between mb-1">
            <div>
              <strong>${skill.name}</strong>
              <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.2rem;">${skill.advice || ''}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="badge ${statusClass}">${skill.status}</span>
              ${skill.priority === 'Critical' ? '<span class="badge badge-rose">Priority: Critical</span>' : ''}
            </div>
          </div>

          <div class="skill-bar-row">
            <div class="skill-bar-labels">
              <span class="text-dim" style="font-size: 0.8rem;">Current: ${currentScore}%</span>
              <span class="text-dim" style="font-size: 0.8rem;">Required Benchmark: ${requiredScore}%</span>
            </div>
            <div class="progress-track" style="height: 10px;">
              <div class="progress-fill ${progressClass}" style="width: ${currentScore}%;"></div>
            </div>
          </div>
        </div>
      `;
    });

    skillsContainer.innerHTML = skillsHtml;

    // Render Action Plan
    if (actionPlanContainer && data.learningActionPlan) {
      let planHtml = '';
      data.learningActionPlan.forEach(step => {
        planHtml += `
          <div class="card mb-1" style="border-left: 3px solid var(--brand-indigo);">
            <div class="flex-between">
              <strong class="text-cyan">${step.week}</strong>
            </div>
            <p class="mt-1" style="font-size: 0.95rem;">${step.focus}</p>
          </div>
        `;
      });
      actionPlanContainer.innerHTML = planHtml;
    }
  }

  function renderFallbackSkillGap() {
    renderSkillGap({
      targetRole: 'Frontend Web Developer',
      skills: [
        { name: 'HTML5 & Semantic Markup', currentScore: 100, requiredScore: 90, status: 'Strong', priority: 'Low', advice: 'Excellent foundation; follow accessibility best practices.' },
        { name: 'CSS3 & Responsive Layouts', currentScore: 90, requiredScore: 85, status: 'Strong', priority: 'Low', advice: 'Solid styling skills; practice advanced Flexbox & CSS Grid.' },
        { name: 'Vanilla JavaScript (ES6+)', currentScore: 70, requiredScore: 85, status: 'Developing', priority: 'High', advice: 'Focus on ES6+ features, fetch API, and asynchronous events.' },
        { name: 'Git & GitHub Version Control', currentScore: 40, requiredScore: 80, status: 'Developing', priority: 'Critical', advice: 'Essential for hackathons & industry. Practice pull requests and branching.' },
        { name: 'REST APIs & Serverless Functions', currentScore: 30, requiredScore: 75, status: 'Missing', priority: 'Critical', advice: 'Understand JSON data payloads and secure backend requests.' }
      ],
      learningActionPlan: [
        { week: 'Weeks 1-2', focus: 'Master Vanilla JS: Array operations, Async/Await, and Web APIs' },
        { week: 'Weeks 3-4', focus: 'Implement Git version control & push daily code snippets to GitHub' },
        { week: 'Weeks 5-6', focus: 'Build a full-stack project integrating Firebase Auth and Firestore' }
      ]
    });
  }
});
