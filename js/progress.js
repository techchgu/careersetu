/**
 * CareerSetu — Progress Dashboard & Career Readiness Analytics
 */

import { checkAuthGuard, renderUserProfileWidget } from './auth.js';
import { getUserData } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuthGuard()) return;
  renderUserProfileWidget();

  await loadProgressAnalytics();

  async function loadProgressAnalytics() {
    // 1. Fetch user data across collections
    const profile = (await getUserData('profiles')) || {};
    const assessment = (await getUserData('assessments')) || {};
    const recommendations = (await getUserData('careerRecommendations')) || {};
    const roadmapData = (await getUserData('roadmaps')) || {};
    const resumeData = (await getUserData('resumes')) || {};
    const interviewData = (await getUserData('interviews')) || {};

    const trackedCourses = JSON.parse(localStorage.getItem('careersetu_tracked_courses') || '["JavaScript Algorithms and Data Structures", "Modern CSS & Responsive Design Guide"]');
    const appliedJobs = JSON.parse(localStorage.getItem('careersetu_applied_jobs') || '["Frontend Engineering Intern"]');

    // 2. Compute Roadmap Progress
    let totalTasks = 0;
    let completedTasks = 0;
    if (roadmapData.data && roadmapData.data.months) {
      roadmapData.data.months.forEach(m => {
        (m.tasks || []).forEach(t => {
          totalTasks++;
          if (t.status === 'completed') completedTasks++;
        });
      });
    }
    const roadmapPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 35;

    // 3. Scores
    const profileScore = profile.fullName && profile.educationLevel && profile.technicalSkills ? 100 : 60;
    const assessmentScore = assessment.completedAt ? 100 : 50;
    const resumeScore = resumeData.data?.atsScore || 75;
    const interviewScore = interviewData.averageScore ? Math.round(interviewData.averageScore * 10) : 70;

    // Weighted Overall Readiness Formula
    // Profile: 15%, Assessment: 15%, Skill/Roadmap: 25%, Resume: 20%, Interview: 25%
    const readinessScore = Math.round(
      (profileScore * 0.15) +
      (assessmentScore * 0.15) +
      (roadmapPct * 0.25) +
      (resumeScore * 0.20) +
      (interviewScore * 0.25)
    );

    // Update UI Elements
    setVal('overall-readiness-val', `${readinessScore}%`);
    setVal('overall-readiness-status', readinessScore >= 80 ? '🌟 Highly Job-Ready' : readinessScore >= 65 ? '⚡ Rapidly Accelerating' : '🌱 Building Foundations');
    setBar('overall-readiness-bar', readinessScore);

    setVal('stat-profile-val', `${profileScore}%`);
    setBar('stat-profile-bar', profileScore);

    setVal('stat-roadmap-val', `${roadmapPct}%`);
    setBar('stat-roadmap-bar', roadmapPct);

    setVal('stat-resume-val', `${resumeScore}/100`);
    setBar('stat-resume-bar', resumeScore);

    setVal('stat-interview-val', interviewData.averageScore ? `${interviewData.averageScore}/10` : '7.5/10');
    setBar('stat-interview-bar', interviewScore);

    setVal('courses-tracked-count', trackedCourses.length);
    setVal('jobs-applied-count', appliedJobs.length);

    // Render Tracked Courses list
    const coursesListEl = document.getElementById('tracked-courses-list');
    if (coursesListEl) {
      coursesListEl.innerHTML = trackedCourses.map(title => `
        <div class="card mb-1" style="background: var(--bg-surface); padding: 0.85rem 1rem;">
          <div class="flex-between">
            <span style="font-size: 0.9rem; font-weight: 500;">📖 ${title}</span>
            <span class="badge badge-emerald">In Progress</span>
          </div>
        </div>
      `).join('') || '<p class="text-muted">No courses tracked yet.</p>';
    }

    // Render Applied Jobs list
    const appliedJobsEl = document.getElementById('applied-jobs-list');
    if (appliedJobsEl) {
      appliedJobsEl.innerHTML = appliedJobs.map(title => `
        <div class="card mb-1" style="background: var(--bg-surface); padding: 0.85rem 1rem;">
          <div class="flex-between">
            <span style="font-size: 0.9rem; font-weight: 500;">💼 ${title}</span>
            <span class="badge badge-cyan">Application Active</span>
          </div>
        </div>
      `).join('') || '<p class="text-muted">No applications submitted yet.</p>';
    }
  }

  function setVal(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setBar(id, pct) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }
});
