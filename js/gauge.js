/**
 * Circular Gauge Component for CareerSetu AI
 * Generates exact circular gauge rings as shown in the presentation poster.
 */

export function createGaugeHTML(value, max = 100, label = 'Readiness', color = '#4f46e5', size = 130, subtext = '') {
  const strokeWidth = 9;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference - (pct * circumference);

  const displayVal = max === 100 ? `${value}%` : `${value}`;
  const displaySub = max !== 100 ? `/${max}` : '';

  return `
    <div class="gauge-container" style="width: ${size}px; height: ${size}px;">
      <svg class="gauge-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle class="gauge-circle-bg" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${strokeWidth}"></circle>
        <circle class="gauge-circle-progress" cx="${size/2}" cy="${size/2}" r="${radius}" stroke="${color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}"></circle>
      </svg>
      <div class="gauge-center-text">
        <span class="gauge-value">${displayVal}<span style="font-size: 0.9rem; font-weight: 600; color: #64748b;">${displaySub}</span></span>
        <span class="gauge-label">${label}</span>
        ${subtext ? `<span style="font-size: 0.7rem; color: #10b981; font-weight: 700; margin-top: 0.15rem;">${subtext}</span>` : ''}
      </div>
    </div>
  `;
}
