/**
 * CareerSetu — Personalized Career Roadmap & Task Progress Tracker
 */

import { checkAuthGuard, renderUserProfileWidget } from './auth.js';
import { getUserData, saveUserData } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuthGuard()) return;
  renderUserProfileWidget();

  const container = document.getElementById('roadmap-container');
  const targetRoleEl = document.getElementById('roadmap-target-role');
  const progressPctEl = document.getElementById('roadmap-progress-pct');
  const progressBarEl = document.getElementById('roadmap-progress-bar');
  const regenerateBtn = document.getElementById('regenerate-roadmap-btn');

  let currentRoadmap = null;

  loadRoadmap();

  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', () => {
      loadRoadmap(true);
    });
  }

  async function loadRoadmap(forceRefresh = false) {
    if (!container) return;

    container.innerHTML = `
      <div class="card loading-container">
        <span class="loading-spinner"></span>
        <div class="ai-pulse-badge">
          <span class="pulse-dot"></span>
          Generating your personalized 6-month career roadmap...
        </div>
      </div>
    `;

    try {
      if (!forceRefresh) {
        const existing = await getUserData('roadmaps');
        if (existing && existing.data) {
          currentRoadmap = existing.data;
          renderRoadmap(currentRoadmap);
          return;
        }
      }

      const profile = (await getUserData('profiles')) || {};
      const targetRole = profile.targetCareer || 'Frontend Web Developer';
      const currentSkills = profile.technicalSkills ? profile.technicalSkills.split(',').map(s => s.trim()) : ['HTML', 'CSS', 'JavaScript'];

      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          currentSkills,
          learningStyle: profile.learningStyle || 'Hands-on Projects',
          weeklyHours: 15
        })
      });

      if (!res.ok) throw new Error('API returned status ' + res.status);

      const json = await res.json();
      currentRoadmap = json.data;

      // Save to Firestore
      await saveUserData('roadmaps', { data: currentRoadmap });

      renderRoadmap(currentRoadmap);
    } catch (err) {
      console.warn('Roadmap error, falling back locally:', err);
      renderFallbackRoadmap();
    }
  }

  function renderRoadmap(data) {
    if (targetRoleEl) targetRoleEl.textContent = data.targetRole || 'Target Career';

    const months = data.months || [];
    let html = '';

    months.forEach((m) => {
      html += `
        <div class="roadmap-month-card">
          <div class="roadmap-month-header">
            <div>
              <span class="badge badge-cyan" style="font-size: 0.75rem; margin-bottom: 0.35rem;">MONTH ${m.month}</span>
              <h3 style="font-size: 1.15rem;">${m.title}</h3>
              <p class="text-muted" style="font-size: 0.85rem; margin-top: 0.2rem;">${m.focus}</p>
            </div>
            <div style="text-align: right;">
              <span class="badge badge-emerald" style="font-size: 0.75rem;">Milestone</span>
              <p class="text-dim" style="font-size: 0.8rem; max-width: 260px; margin-top: 0.25rem;">${m.milestone}</p>
            </div>
          </div>

          <div class="roadmap-task-list">
            ${(m.tasks || []).map(task => {
              const status = task.status || 'not-started';
              const statusLabel = status === 'completed' ? '✓ Completed' : status === 'in-progress' ? '◐ In Progress' : '○ Not Started';
              const statusClass = status;

              return `
                <div class="roadmap-task-item" id="task-${task.id}">
                  <span style="font-size: 0.9rem; ${status === 'completed' ? 'text-decoration: line-through; opacity: 0.7;' : ''}">
                    ${task.title}
                  </span>
                  <button class="task-status-btn ${statusClass}" data-month="${m.month}" data-id="${task.id}" data-status="${status}">
                    ${statusLabel}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    updateProgressMetrics();

    // Attach task status toggle listeners
    document.querySelectorAll('.task-status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const monthNum = parseInt(e.currentTarget.getAttribute('data-month'), 10);
        const taskId = e.currentTarget.getAttribute('data-id');
        const currentStatus = e.currentTarget.getAttribute('data-status');

        // Cycle through: not-started -> in-progress -> completed -> not-started
        const nextStatus = currentStatus === 'not-started'
          ? 'in-progress'
          : currentStatus === 'in-progress'
            ? 'completed'
            : 'not-started';

        // Update in data structure
        const monthObj = currentRoadmap.months.find(m => m.month === monthNum);
        if (monthObj) {
          const taskObj = monthObj.tasks.find(t => t.id === taskId);
          if (taskObj) {
            taskObj.status = nextStatus;
          }
        }

        // Save to Firestore
        await saveUserData('roadmaps', { data: currentRoadmap });

        // Update UI
        renderRoadmap(currentRoadmap);
      });
    });
  }

  function updateProgressMetrics() {
    if (!currentRoadmap || !currentRoadmap.months) return;

    let totalTasks = 0;
    let completedTasks = 0;

    currentRoadmap.months.forEach(m => {
      (m.tasks || []).forEach(t => {
        totalTasks++;
        if (t.status === 'completed') completedTasks++;
      });
    });

    const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    if (progressPctEl) progressPctEl.textContent = `${pct}%`;
    if (progressBarEl) progressBarEl.style.width = `${pct}%`;
  }

  function renderFallbackRoadmap() {
    currentRoadmap = {
      targetRole: "Frontend / Full-Stack Developer",
      totalMonths: 6,
      months: [
        {
          month: 1,
          title: "Month 1: Core Web & Modern JavaScript ES6+",
          focus: "Deep dive into asynchronous JavaScript, DOM, and responsive pure CSS",
          milestone: "Publish 3 repositories on GitHub with clean documentation",
          tasks: [
            { id: "m1-t1", title: "Master JavaScript ES6+ features (Promises, async/await, Array methods)", status: "completed" },
            { id: "m1-t2", title: "Build responsive layouts without frameworks using CSS Grid & Flexbox", status: "in-progress" },
            { id: "m1-t3", title: "Set up daily Git commits and publish GitHub repositories", status: "not-started" }
          ]
        },
        {
          month: 2,
          title: "Month 2: Backend Architecture & Databases",
          focus: "Serverless functions, NoSQL database modeling, and authentication",
          milestone: "Deploy an authenticated web application with live Firestore persistence",
          tasks: [
            { id: "m2-t1", title: "Write serverless REST API endpoints for Vercel deployment", status: "not-started" },
            { id: "m2-t2", title: "Integrate Firebase Authentication and session protection", status: "not-started" },
            { id: "m2-t3", title: "Configure Firestore database security rules for private user data", status: "not-started" }
          ]
        },
        {
          month: 3,
          title: "Month 3: AI Integration & Capstone Production",
          focus: "Integrate Gemini API securely and optimize application performance",
          milestone: "Launch a live capstone web application on Vercel",
          tasks: [
            { id: "m3-t1", title: "Implement Gemini generative AI server-side prompts", status: "not-started" },
            { id: "m3-t2", title: "Add smooth UI loading states and graceful error boundaries", status: "not-started" },
            { id: "m3-t3", title: "Perform cross-browser and mobile responsiveness testing", status: "not-started" }
          ]
        }
      ]
    };
    renderRoadmap(currentRoadmap);
  }
});
