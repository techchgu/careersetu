/**
 * CareerSetu — Jobs & Internships Opportunities
 */

import { checkAuthGuard, renderUserProfileWidget } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuthGuard()) return;
  renderUserProfileWidget();

  const opportunities = [
    {
      id: 'opp-1',
      type: 'internship',
      title: 'Frontend Engineering Intern',
      company: 'NexTech Cloud Labs',
      location: 'Bengaluru / Remote',
      workType: 'Hybrid',
      stipend: '₹25,000 / month',
      experience: 'Fresher / Final Year',
      skills: ['HTML5', 'CSS3', 'JavaScript', 'Git'],
      description: 'Join our product frontend engineering team to build fast, user-friendly dashboards using modern Vanilla JS and CSS architecture.',
      deadline: '2 Weeks Remaining',
      isDemo: true
    },
    {
      id: 'opp-2',
      type: 'job',
      title: 'Associate Web Developer',
      company: 'Apex Digital Solutions',
      location: 'Hyderabad, India',
      workType: 'In-office',
      stipend: '₹5.5 - 7.5 LPA',
      experience: '0-1 Years',
      skills: ['JavaScript ES6+', 'REST APIs', 'Responsive Design', 'Git'],
      description: 'Looking for enthusiastic graduate developers passionate about clean coding, serverless API integration, and cross-browser performance.',
      deadline: '10 Days Remaining',
      isDemo: true
    },
    {
      id: 'opp-3',
      type: 'internship',
      title: 'AI & Cloud Applications Intern',
      company: 'CognitiveScale Systems',
      location: 'Pune / Remote',
      workType: 'Remote',
      stipend: '₹30,000 / month',
      experience: 'Fresher',
      skills: ['Gemini API', 'Node.js Serverless', 'Python', 'Web APIs'],
      description: 'Prototype generative AI features, multimodal prompt pipelines, and client interfaces for next-generation student tools.',
      deadline: 'Rolling Basis',
      isDemo: true
    },
    {
      id: 'opp-4',
      type: 'job',
      title: 'Junior Full-Stack Software Engineer',
      company: 'Veloce Infotech',
      location: 'Noida / Delhi NCR',
      workType: 'Hybrid',
      stipend: '₹6.0 - 8.5 LPA',
      experience: '0-2 Years',
      skills: ['HTML5/CSS3', 'JavaScript', 'Firebase / NoSQL', 'Vercel Deployment'],
      description: 'Collaborate with agile development pods to deploy production web features and maintain robust database security rules.',
      deadline: '3 Weeks Remaining',
      isDemo: true
    },
    {
      id: 'opp-5',
      type: 'internship',
      title: 'UI/UX & Web Development Trainee',
      company: 'Zenith Studio Interactive',
      location: 'Mumbai, India',
      workType: 'Remote',
      stipend: '₹18,000 / month',
      experience: 'Student / Fresher',
      skills: ['CSS Grid & Flexbox', 'Vanilla JavaScript', 'Accessibility', 'Figma'],
      description: 'Help craft accessible and visually engaging digital products following modern web accessibility guidelines.',
      deadline: '5 Days Remaining',
      isDemo: true
    }
  ];

  const grid = document.getElementById('opportunities-grid');
  const searchInput = document.getElementById('search-input');
  const typeFilter = document.getElementById('type-filter');
  const locationFilter = document.getElementById('location-filter');
  const alertContainer = document.getElementById('alert-container');

  function render(list) {
    if (!grid) return;
    if (list.length === 0) {
      grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <p class="text-muted">No opportunities match your filter criteria. Try adjusting your search query.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(item => `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="flex-between mb-1">
            <span class="badge ${item.type === 'internship' ? 'badge-cyan' : 'badge-indigo'}">
              ${item.type === 'internship' ? '💼 Internship' : '🚀 Full-Time Job'}
            </span>
            <span class="badge badge-demo">Demo Opportunity</span>
          </div>

          <h3 style="font-size: 1.2rem; margin-bottom: 0.25rem;">${item.title}</h3>
          <p class="text-emerald" style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.2rem;">${item.company}</p>
          <p class="text-muted" style="font-size: 0.825rem; margin-bottom: 0.85rem;">📍 ${item.location} • ${item.workType}</p>

          <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-md); margin-bottom: 1rem; font-size: 0.85rem;">
            <p style="margin-bottom: 0.2rem;"><strong>Compensation:</strong> ${item.stipend}</p>
            <p><strong>Eligibility:</strong> ${item.experience}</p>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem;">
            ${item.skills.map(s => `<span class="badge badge-cyan" style="font-size: 0.7rem;">${s}</span>`).join('')}
          </div>

          <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.25rem; line-height: 1.5;">
            ${item.description}
          </p>
        </div>

        <div style="padding-top: 1rem; border-top: 1px solid var(--border-subtle);" class="flex-between">
          <span class="text-dim" style="font-size: 0.75rem;">⏳ ${item.deadline}</span>
          <button class="btn btn-sm btn-primary apply-opp-btn" data-id="${item.id}" data-title="${item.title}">
            Apply Now
          </button>
        </div>
      </div>
    `).join('');

    // Attach Apply Listeners
    document.querySelectorAll('.apply-opp-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.currentTarget.getAttribute('data-title');
        e.currentTarget.textContent = '✓ Applied';
        e.currentTarget.classList.remove('btn-primary');
        e.currentTarget.classList.add('btn-outline');
        e.currentTarget.disabled = true;

        recordApplication(title);
        showAlert(`Application submitted for "${title}"! Tracked in your Progress Dashboard.`, 'success');
      });
    });
  }

  function recordApplication(jobTitle) {
    const list = JSON.parse(localStorage.getItem('careersetu_applied_jobs') || '[]');
    if (!list.includes(jobTitle)) {
      list.push(jobTitle);
      localStorage.setItem('careersetu_applied_jobs', JSON.stringify(list));
    }
  }

  function filterData() {
    const q = (searchInput?.value || '').toLowerCase();
    const type = typeFilter?.value || 'all';
    const loc = locationFilter?.value || 'all';

    const filtered = opportunities.filter(item => {
      const matchQuery = item.title.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.skills.some(s => s.toLowerCase().includes(q));

      const matchType = type === 'all' || item.type === type;
      const matchLoc = loc === 'all' || item.location.toLowerCase().includes(loc.toLowerCase());

      return matchQuery && matchType && matchLoc;
    });

    render(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterData);
  if (typeFilter) typeFilter.addEventListener('change', filterData);
  if (locationFilter) locationFilter.addEventListener('change', filterData);

  function showAlert(msg, type = 'info') {
    if (!alertContainer) return;
    alertContainer.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  render(opportunities);
});
