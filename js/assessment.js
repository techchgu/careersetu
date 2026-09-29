/**
 * CareerSetu — Career Assessment Handler
 */

import { checkAuthGuard, renderUserProfileWidget } from './auth.js';
import { saveUserData, getUserData } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuthGuard()) return;
  renderUserProfileWidget();

  const assessmentForm = document.getElementById('assessment-form');
  const alertContainer = document.getElementById('alert-container');
  const prefillBtn = document.getElementById('prefill-assessment-btn');

  // Load existing answers if available
  try {
    const existing = await getUserData('assessments');
    if (existing) {
      populateAssessment(existing);
    }
  } catch (err) {
    console.warn('Error loading assessment:', err);
  }

  // Prefill Sample Assessment for quick hackathon demos
  if (prefillBtn) {
    prefillBtn.addEventListener('click', () => {
      const sample = {
        q_interest: 'frontend',
        q_env: 'fast_paced_startups',
        q_problem_solving: 'visual_interactive',
        q_tools: ['html_css', 'javascript', 'git', 'apis'],
        q_work_style: 'creative_building',
        q_goal: 'high_growth_developer',
        q_hours: '15_to_20',
        q_gov_interest: 'yes_technical'
      };
      populateAssessment(sample);
      showAlert('Sample assessment answers selected! Click "Submit Assessment" to proceed.', 'info');
    });
  }

  if (assessmentForm) {
    assessmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = assessmentForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading-spinner"></span> Analyzing Responses...';

      // Collect answers
      const formData = new FormData(assessmentForm);
      const responses = {
        q_interest: formData.get('q_interest') || 'web_development',
        q_env: formData.get('q_env') || 'hybrid',
        q_problem_solving: formData.get('q_problem_solving') || 'analytical',
        q_tools: formData.getAll('q_tools'),
        q_work_style: formData.get('q_work_style') || 'collaborative',
        q_goal: formData.get('q_goal') || 'product_engineer',
        q_hours: formData.get('q_hours') || '15',
        q_gov_interest: formData.get('q_gov_interest') || 'open',
        completedAt: new Date().toISOString()
      };

      try {
        await saveUserData('assessments', responses);
        showAlert('Career assessment saved! Generating your AI recommendations...', 'success');
        setTimeout(() => {
          window.location.href = 'career.html';
        }, 1200);
      } catch (err) {
        showAlert('Failed to save assessment: ' + err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  function populateAssessment(data) {
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach(val => {
          const checkbox = document.querySelector(`input[name="${key}"][value="${val}"]`);
          if (checkbox) checkbox.checked = true;
        });
      } else {
        const radio = document.querySelector(`input[name="${key}"][value="${data[key]}"]`);
        if (radio) radio.checked = true;
      }
    }
  }

  function showAlert(message, type = 'info') {
    if (!alertContainer) return;
    alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
