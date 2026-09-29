/**
 * CareerSetu — Government Employment & Public Sector Opportunities
 */

import { checkAuthGuard, renderUserProfileWidget } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuthGuard()) return;
  renderUserProfileWidget();

  const govOpportunities = [
    {
      id: 'gov-1',
      category: 'central',
      title: 'Scientist / Engineer ‘SC’ (Computer Science)',
      organization: 'ISRO (Indian Space Research Organisation)',
      eligibility: 'B.E / B.Tech in CSE / IT with minimum 65% marks or 6.84 CGPA',
      qualification: 'B.Tech / B.E / M.Tech in CS/IT',
      area: 'Technical & Space Informatics',
      appPeriod: 'Annual ICRB Examination Cycle',
      portalUrl: 'https://www.isro.gov.in/Careers.html',
      isOfficial: true
    },
    {
      id: 'gov-2',
      category: 'central',
      title: 'Scientific Officer / Technical Officer',
      organization: 'NIC (National Informatics Centre) / MeitY',
      eligibility: 'Bachelor Degree in Engineering or MCA / M.Sc with Computer Science',
      qualification: 'B.E / B.Tech / MCA / M.Sc',
      area: 'Government Cloud Infrastructure & e-Governance',
      appPeriod: 'NIELIT Central Recruitment Drive',
      portalUrl: 'https://www.nic.in/recruitment/',
      isOfficial: true
    },
    {
      id: 'gov-3',
      category: 'psu',
      title: 'Project Engineer / Software Development Trainee',
      organization: 'C-DAC (Centre for Development of Advanced Computing)',
      eligibility: '1st Class B.E. / B.Tech / MCA with knowledge of Web & Database APIs',
      qualification: 'B.Tech / MCA',
      area: 'High Performance Computing & National Software Projects',
      appPeriod: 'Rolling / Project-based intake',
      portalUrl: 'https://www.cdac.in/careers',
      isOfficial: true
    },
    {
      id: 'gov-4',
      category: 'psu',
      title: 'Graduate Engineer Trainee (GET) - Computer Science',
      organization: 'BEL (Bharat Electronics Limited)',
      eligibility: 'B.E / B.Tech with First Class for General/OBC, Pass class for SC/ST/PwD',
      qualification: 'B.Tech Computer Science / Information Science',
      area: 'Defence Software Systems & Embedded Communications',
      appPeriod: 'Annual Gate / Direct Interview Selection',
      portalUrl: 'https://bel-india.in/CareersGrid.aspx',
      isOfficial: true
    },
    {
      id: 'gov-5',
      category: 'central',
      title: 'Combined Graduate Level (CGL) - Statistical & Assistant Audit',
      organization: 'Staff Selection Commission (SSC)',
      eligibility: 'Bachelor’s Degree in any discipline from a recognized University',
      qualification: 'Graduation in Any Stream',
      area: 'Administrative & Public Administration',
      appPeriod: 'SSC CGL Annual Examination',
      portalUrl: 'https://ssc.gov.in',
      isOfficial: true
    },
    {
      id: 'gov-6',
      category: 'state',
      title: 'Assistant System Analyst / IT Cadre Officer',
      organization: 'State Public Service Commission & e-Governance Missions',
      eligibility: 'Graduate Degree with Computer Science / Diploma in Computer Application',
      qualification: 'Degree with CS / IT coursework',
      area: 'State Digital Mission & Citizen Service Delivery',
      appPeriod: 'State PSC Combined Examinations',
      portalUrl: 'https://www.ncs.gov.in',
      isOfficial: true
    }
  ];

  const grid = document.getElementById('gov-grid');
  const catFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('gov-search');

  function render(list) {
    if (!grid) return;
    if (list.length === 0) {
      grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <p class="text-muted">No government vacancies match your filter. Try adjusting terms.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(item => `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="flex-between mb-1">
            <span class="badge ${item.category === 'central' ? 'badge-amber' : item.category === 'psu' ? 'badge-indigo' : 'badge-emerald'}">
              🏛️ ${item.category.toUpperCase()} SECTOR
            </span>
            <span class="badge badge-cyan">Official Portal Verified</span>
          </div>

          <h3 style="font-size: 1.15rem; margin-bottom: 0.25rem;">${item.title}</h3>
          <p class="text-cyan" style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem;">${item.organization}</p>

          <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-md); margin-bottom: 0.85rem; font-size: 0.825rem;">
            <p style="margin-bottom: 0.25rem;"><strong>Eligibility:</strong> ${item.eligibility}</p>
            <p style="margin-bottom: 0.25rem;"><strong>Required Degree:</strong> ${item.qualification}</p>
            <p><strong>Selection / Cycle:</strong> ${item.appPeriod}</p>
          </div>

          <p class="text-muted" style="font-size: 0.825rem; margin-bottom: 1.25rem;">
            <strong>Career Area:</strong> ${item.area}
          </p>
        </div>

        <div style="padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; gap: 0.5rem;">
          <a href="${item.portalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" style="flex: 1;">
            Official Portal Notification ↗
          </a>
          <button class="btn btn-sm btn-secondary bookmark-gov-btn" data-title="${item.title}" title="Save to Progress">
            Save
          </button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.bookmark-gov-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.currentTarget.textContent = '✓ Saved';
        e.currentTarget.classList.remove('btn-secondary');
        e.currentTarget.classList.add('btn-outline');
      });
    });
  }

  function filterList() {
    const q = (searchInput?.value || '').toLowerCase();
    const cat = catFilter?.value || 'all';

    const filtered = govOpportunities.filter(item => {
      const matchQ = item.title.toLowerCase().includes(q) ||
        item.organization.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q);
      const matchCat = cat === 'all' || item.category === cat;
      return matchQ && matchCat;
    });

    render(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterList);
  if (catFilter) catFilter.addEventListener('change', filterList);

  render(govOpportunities);
});
