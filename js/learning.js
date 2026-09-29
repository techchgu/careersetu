/**
 * CareerSetu — Learning Hub (Courses & Certifications)
 */

import { checkAuthGuard, renderUserProfileWidget } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuthGuard()) return;
  renderUserProfileWidget();

  const coursesList = [
    {
      id: 'c1',
      type: 'course',
      title: 'JavaScript Algorithms and Data Structures',
      provider: 'freeCodeCamp',
      skill: 'Vanilla JavaScript ES6+',
      difficulty: 'Beginner to Intermediate',
      duration: '300 hours (Self-paced)',
      why: 'Covers core ES6 syntax, object-oriented concepts, and algorithmic thinking with zero framework overhead.',
      link: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
      isVerified: true
    },
    {
      id: 'c2',
      type: 'course',
      title: 'Modern CSS & Responsive Design Guide',
      provider: 'MDN Web Docs Learning Area',
      skill: 'CSS3, Grid, Flexbox, Media Queries',
      difficulty: 'Beginner',
      duration: '40 hours',
      why: 'Official authoritative web documentation on responsive layouts without relying on bloated CSS frameworks.',
      link: 'https://developer.mozilla.org/en-US/docs/Learn/CSS',
      isVerified: true
    },
    {
      id: 'c3',
      type: 'course',
      title: 'Serverless Functions on Vercel Masterclass',
      provider: 'Vercel Engineering Tutorials',
      skill: 'Serverless Node.js & APIs',
      difficulty: 'Intermediate',
      duration: '15 hours',
      why: 'Direct guide to deploying zero-server backend REST endpoints with environment variable security.',
      link: 'https://vercel.com/docs/functions',
      isVerified: true
    },
    {
      id: 'c4',
      type: 'course',
      title: 'Google Generative AI for Developers',
      provider: 'Google Cloud Skills Boost',
      skill: 'Gemini API & Prompt Engineering',
      difficulty: 'Intermediate',
      duration: '20 hours',
      why: 'Master multimodal prompts, structured JSON generation, and secure AI API orchestration.',
      link: 'https://www.cloudskillsboost.google/',
      isVerified: true
    },
    {
      id: 'c5',
      type: 'certification',
      title: 'Meta Certified Front-End Developer',
      provider: 'Meta / Coursera',
      skill: 'HTML5, CSS, JS, Git, UX Principles',
      difficulty: 'Intermediate',
      duration: '4-6 Months',
      why: 'Recognized by top employers worldwide for rigorous front-end engineering foundations.',
      link: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
      isVerified: true
    },
    {
      id: 'c6',
      type: 'certification',
      title: 'Google Cloud Certified Cloud Digital Leader',
      provider: 'Google Cloud',
      skill: 'Cloud Infrastructure, Security & AI',
      difficulty: 'Beginner to Intermediate',
      duration: '2-3 Months',
      why: 'Validates holistic cloud capabilities and modern distributed systems knowledge.',
      link: 'https://cloud.google.com/learn/certification/cloud-digital-leader',
      isVerified: true
    },
    {
      id: 'c7',
      type: 'certification',
      title: 'GitHub Foundations Certification',
      provider: 'GitHub',
      skill: 'Git, GitHub Actions, Collaboration',
      difficulty: 'Beginner',
      duration: '1 Month',
      why: 'Official industry credential proving competence in open-source and professional repository workflows.',
      link: 'https://resources.github.com/learn/certifications/',
      isVerified: true
    },
    {
      id: 'c8',
      type: 'course',
      title: 'NPTEL Cloud Computing & Distributed Systems',
      provider: 'IIT Kharagpur / SWAYAM',
      skill: 'Distributed Systems & Cloud Architecture',
      difficulty: 'Intermediate',
      duration: '8 Weeks',
      why: 'Government of India recognized academic credit and premier institutional certification.',
      link: 'https://nptel.ac.in/courses',
      isVerified: true
    }
  ];

  const grid = document.getElementById('learning-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function render(items) {
    if (!grid) return;
    grid.innerHTML = items.map(item => `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="flex-between mb-1">
            <span class="badge ${item.type === 'certification' ? 'badge-amber' : 'badge-cyan'}">
              ${item.type === 'certification' ? '★ Certification' : '📖 Course'}
            </span>
            <span class="badge ${item.isVerified ? 'badge-emerald' : 'badge-demo'}">
              ${item.isVerified ? '✓ Verified Source' : 'Demo Resource'}
            </span>
          </div>

          <h3 style="font-size: 1.15rem; margin-bottom: 0.4rem;">${item.title}</h3>
          <p class="text-cyan" style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem;">Provider: ${item.provider}</p>

          <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-md); margin-bottom: 1rem; font-size: 0.825rem;">
            <p style="margin-bottom: 0.25rem;"><strong>Focus Skill:</strong> ${item.skill}</p>
            <p style="margin-bottom: 0.25rem;"><strong>Difficulty:</strong> ${item.difficulty}</p>
            <p><strong>Duration:</strong> ${item.duration}</p>
          </div>

          <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.25rem;">
            ${item.why}
          </p>
        </div>

        <div style="padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; gap: 0.5rem;">
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" style="flex: 1;">
            View Course ↗
          </a>
          <button class="btn btn-sm btn-secondary enroll-track-btn" data-title="${item.title}" title="Track in Progress">
            + Track
          </button>
        </div>
      </div>
    `).join('');

    // Attach track event listeners
    document.querySelectorAll('.enroll-track-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.currentTarget.getAttribute('data-title');
        e.currentTarget.textContent = '✓ Tracked';
        e.currentTarget.classList.remove('btn-secondary');
        e.currentTarget.classList.add('btn-outline');
        saveTrackedCourse(title);
      });
    });
  }

  function saveTrackedCourse(courseTitle) {
    const list = JSON.parse(localStorage.getItem('careersetu_tracked_courses') || '[]');
    if (!list.includes(courseTitle)) {
      list.push(courseTitle);
      localStorage.setItem('careersetu_tracked_courses', JSON.stringify(list));
    }
  }

  render(coursesList);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      filterBtns.forEach(b => b.classList.add('btn-secondary'));
      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-secondary');

      const filter = btn.getAttribute('data-filter');
      if (filter === 'all') {
        render(coursesList);
      } else if (filter === 'courses') {
        render(coursesList.filter(c => c.type === 'course'));
      } else if (filter === 'certifications') {
        render(coursesList.filter(c => c.type === 'certification'));
      }
    });
  });
});
