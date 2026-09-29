/**
 * CareerSetu — Student Profile & Academic Information Handler
 */

import { checkAuthGuard, renderUserProfileWidget } from './auth.js';
import { saveUserData, getUserData, getCurrentUser } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuthGuard()) return;
  renderUserProfileWidget();

  const user = getCurrentUser();
  const profileForm = document.getElementById('profile-form');
  const alertContainer = document.getElementById('alert-container');
  const prefillBtn = document.getElementById('prefill-demo-btn');

  // Load existing profile if available
  try {
    const existing = await getUserData('profiles');
    if (existing) {
      populateForm(existing);
    } else if (user) {
      // Pre-fill name from active user account if fresh signup
      const nameInput = document.getElementById('fullName');
      if (nameInput && user.displayName) {
        nameInput.value = user.displayName;
      }
    }
  } catch (err) {
    console.warn('Error loading profile:', err);
  }

  // Prefill Demo Profile
  if (prefillBtn) {
    prefillBtn.addEventListener('click', () => {
      const demoData = {
        fullName: user?.displayName || 'Himanshu Sahani',
        phone: '+91 98765 43210',
        location: 'Bhopal, India',
        educationLevel: 'Undergraduate (B.Tech / B.E / BCA)',
        college: 'RGPV Bhopal',
        course: 'B.Tech',
        branch: 'Computer Science & Engineering',
        gradYear: '2027',
        cgpa: '8.5',
        technicalSkills: 'Python, SQL, React, HTML5, CSS3, JavaScript',
        softSkills: 'Analytical Thinking, Problem Solving, Team Leadership',
        projectName: 'Kisan Saathi Agricultural Portal',
        projectDesc: 'Engineered Kisan Saathi crop disease detection and farmer market advisory platform utilizing Python, modern JavaScript, and Cloud Firestore.',
        projectTech: 'Python, JavaScript, Firebase Firestore, REST APIs',
        careerInterests: 'AI / Machine Learning, Cloud Systems, Product Engineering',
        preferredWorkAreas: 'AI/ML Engineering, Intelligent Systems',
        targetCareer: 'AI / ML Engineer',
        preferredIndustry: 'Artificial Intelligence / Software',
        preferredJobType: 'Internship / Full-time',
        preferredLocation: 'Bhopal / Remote / Bengaluru',
        experienceLevel: 'Fresher / Final Year Student',
        learningStyle: 'Hands-on Projects & Guided Practice'
      };
      populateForm(demoData);
      showAlert('Demo profile fields populated! Click "Save & Continue →" to proceed.', 'info');
    });
  }

  // Save Profile Handler
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = profileForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading-spinner"></span> Saving Profile...';

      const formData = {
        fullName: document.getElementById('fullName')?.value?.trim() || (user?.displayName || ''),
        phone: document.getElementById('phone')?.value?.trim() || '',
        location: document.getElementById('location')?.value?.trim() || '',
        educationLevel: document.getElementById('educationLevel')?.value || '',
        college: document.getElementById('college')?.value?.trim() || '',
        course: document.getElementById('course')?.value?.trim() || '',
        branch: document.getElementById('branch')?.value?.trim() || '',
        gradYear: document.getElementById('gradYear')?.value?.trim() || '',
        cgpa: document.getElementById('cgpa')?.value?.trim() || '',
        technicalSkills: document.getElementById('technicalSkills')?.value?.trim() || '',
        softSkills: document.getElementById('softSkills')?.value?.trim() || '',
        projectName: document.getElementById('projectName')?.value?.trim() || '',
        projectDesc: document.getElementById('projectDesc')?.value?.trim() || '',
        projectTech: document.getElementById('projectTech')?.value?.trim() || '',
        careerInterests: document.getElementById('careerInterests')?.value?.trim() || '',
        preferredWorkAreas: document.getElementById('preferredWorkAreas')?.value?.trim() || '',
        targetCareer: document.getElementById('targetCareer')?.value?.trim() || '',
        preferredIndustry: document.getElementById('preferredIndustry')?.value?.trim() || '',
        preferredJobType: document.getElementById('preferredJobType')?.value || '',
        preferredLocation: document.getElementById('preferredLocation')?.value?.trim() || '',
        experienceLevel: document.getElementById('experienceLevel')?.value || '',
        learningStyle: document.getElementById('learningStyle')?.value || ''
      };

      try {
        await saveUserData('profiles', formData);
        showAlert('Profile updated and saved to Cloud Firestore! Redirecting to Assessment...', 'success');
        setTimeout(() => {
          window.location.href = 'assessment.html';
        }, 800);
      } catch (err) {
        showAlert('Failed to save profile: ' + err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  function populateForm(data) {
    for (const key in data) {
      const field = document.getElementById(key);
      if (field) {
        field.value = data[key];
      }
    }
  }

  function showAlert(message, type = 'info') {
    if (!alertContainer) return;
    const alertClass = type === 'success' ? 'alert-emerald' : (type === 'error' ? 'alert-rose' : 'alert-primary');
    alertContainer.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
