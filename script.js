const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

// Reveal elements as they enter the viewport. Fall back to visible content if unsupported.
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}

// Filter the selected-work grid.
const filters = document.querySelectorAll('.filter');
const projects = document.querySelectorAll('.project-card');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => item.classList.toggle('active', item === button));
  const selected = button.dataset.filter;
  projects.forEach(card => {
    card.hidden = selected !== 'all' && card.dataset.category !== selected;
  });
}));

// Expandable case studies.
document.querySelectorAll('.details-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const details = button.nextElementSibling;
    const isOpen = details.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
    const label = button.firstChild;
    if (label && label.nodeType === Node.TEXT_NODE) label.textContent = isOpen ? 'Close details ' : 'Read the case study ';
    const icon = button.querySelector('span');
    if (icon) icon.textContent = isOpen ? '−' : '＋';
  });
});

// Capability tabs: content is intentionally grounded in the supplied résumé.
const skills = {
  lead: {
    index: 'CAPABILITY / 01',
    title: 'IT Leadership & Delivery',
    copy: 'Aligning teams, stakeholders, and technology delivery around clear operational priorities and business outcomes.',
    tags: ['Agile / Scrum', 'Project management', 'IT service management', 'Stakeholder communication', 'Jira', 'Azure DevOps']
  },
  analysis: {
    index: 'CAPABILITY / 02',
    title: 'Business Analysis',
    copy: 'Turning business needs into clear requirements, process models, user stories, acceptance criteria, and workable solutions.',
    tags: ['Requirements analysis', 'AS-IS / TO-BE', 'User stories', 'Acceptance criteria', 'Change management', 'Process mapping']
  },
  automation: {
    index: 'CAPABILITY / 03',
    title: 'Automation & AI',
    copy: 'Finding manual friction and shaping automation opportunities across workflows, business applications, and emerging AI use cases.',
    tags: ['Power Automate', 'Power Apps', 'UiPath', 'RPA', 'Process mining', 'AI response evaluation']
  },
  data: {
    index: 'CAPABILITY / 04',
    title: 'Data & Governance',
    copy: 'Improving reporting reliability, operational visibility, process documentation, and data integrity in enterprise environments.',
    tags: ['Power BI', 'SQL validation', 'SharePoint', 'Dataverse', 'SOPs', 'IMDS / BOM data']
  }
};
const tabs = document.querySelectorAll('.expertise-tab');
tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(item => {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
  });
  const skill = skills[tab.dataset.skill];
  document.querySelector('#skill-index').textContent = skill.index;
  document.querySelector('#skill-title').textContent = skill.title;
  document.querySelector('#skill-copy').textContent = skill.copy;
  const tagBox = document.querySelector('#skill-tags');
  tagBox.replaceChildren(...skill.tags.map(tag => {
    const span = document.createElement('span');
    span.textContent = tag;
    return span;
  }));
}));

// Reading progress and current section feedback.
const progressBar = document.querySelector('.reading-progress span');
const sectionLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const observedSections = sectionLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function updateReadingProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}
window.addEventListener('scroll', updateReadingProgress, { passive: true });
updateReadingProgress();

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('current-section', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
  observedSections.forEach(section => sectionObserver.observe(section));
}


// Static-site contact form: validate required details and prepare an email draft locally.
const visitorForm = document.querySelector('#visitor-contact-form');
visitorForm?.addEventListener('submit', event => {
  event.preventDefault();
  if (!visitorForm.reportValidity()) return;
  const formData = new FormData(visitorForm);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const message = String(formData.get('message') || '').trim();
  const subject = encodeURIComponent(`Portfolio contact from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nAdditional information / special requests:\n${message || '(Not provided)'}`);
  window.location.href = `mailto:guillermo.vasquez@outlook.com?subject=${subject}&body=${body}`;
});

// V6 accessibility: arrow-key navigation for the existing capability tablist.
// This augments keyboard behavior without changing the HTML structure.
document.querySelectorAll('.expertise-tab').forEach((tab, index, allTabs) => {
  tab.addEventListener('keydown', event => {
    let nextIndex = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % allTabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + allTabs.length) % allTabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = allTabs.length - 1;
    else return;
    event.preventDefault();
    allTabs[nextIndex].focus();
    allTabs[nextIndex].click();
  });
});

// V7: Selected Work motion. Parallax grid on project graphics, count-up for case metrics, subtle pointer tilt.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const projectCards = document.querySelectorAll('.project-card');

if (!reduceMotion) {
  let ticking = false;
  const updateParallax = () => {
    projectCards.forEach(card => {
      const art = card.querySelector('.project-art');
      if (!art || card.hidden) return;
      const r = card.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const offset = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      art.style.setProperty('--py', (offset * -22).toFixed(1));
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); } }, { passive: true });
  updateParallax();

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    projectCards.forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 2.2).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }
}

// Count the featured case-study metrics up once when the card first becomes visible.
const metricEls = document.querySelectorAll('.case-metric strong');
const countUp = el => {
  const node = el.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const match = node.textContent.match(/^(\d+)(?:[–-](\d+))?\s*$/);
  if (!match) return;
  const a = +match[1], b = match[2] ? +match[2] : null;
  const final = node.textContent;
  const start = performance.now(), dur = 1100;
  const step = now => {
    const t = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - t, 3);
    node.textContent = (b === null ? Math.round(a * e) : `${Math.max(1, Math.round(a * e))}–${Math.round(b * e)}`) + ' ';
    if (t < 1) requestAnimationFrame(step); else node.textContent = final;
  };
  requestAnimationFrame(step);
};
if (!reduceMotion && 'IntersectionObserver' in window) {
  const metricObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { countUp(entry.target); metricObserver.unobserve(entry.target); }
  }), { threshold: 0.6 });
  metricEls.forEach(el => metricObserver.observe(el));
}


// V9: purpose-built animated scenes for every Selected Work project (index.html is untouched).
(function buildScenes() {
  const NS = 'http://www.w3.org/2000/svg';
  const T = (x, y, s, c = '', extra = '') => `<text x="${x}" y="${y}" class="${c}" ${extra}>${s}</text>`;
  const D = (ms, n = 0) => `style="animation-delay:${(ms + n).toFixed(2)}s"`;
  const scenes = {};

  // 1. CPJ: the same request, two processes, racing across the four teams.
  scenes['art-flow'] = ['0 0 560 290', (() => {
    const xs = [170, 270, 370, 470], names = ['CHANGE MGMT', 'OFFICE OF CLOSE', 'RELEASE MGMT', 'NETWORK'];
    let h = names.map((n, i) => T(xs[i], 34, n, 'mid')).join('');
    h += T(24, 34, 'SAME REQUEST', 'b') + `<line x1="24" x2="536" y1="157" y2="157" stroke="#1d2f49" stroke-dasharray="3 5"/>` + T(280, 161, 'TWO PROCESSES', 'mid', 'style="fill:#56708f"');
    const y1 = 100, y2 = 215;
    h += T(24, y1 - 4, 'MANUAL', 'w b') + T(24, y1 + 10, '1–3 DAYS', 'w') + T(24, y2 - 4, 'AUTOMATED', 'm b') + T(24, y2 + 10, '9–15 MIN', 'm');
    h += `<path d="M170 ${y1}H470" stroke="#3a4a63" stroke-width="2" stroke-dasharray="4 6"/><path d="M170 ${y2}H470" stroke="#7bf4ce" stroke-width="2" opacity=".5"/>`;
    xs.forEach((x, i) => {
      h += `<circle cx="${x}" cy="${y1}" r="11" fill="#0a1322" stroke="#5b6b84"/><circle class="mw" cx="${x}" cy="${y1}" r="11" fill="none" stroke="#f2b45b" opacity="0" ${D(i * .6)}/>`;
      h += `<circle class="an" cx="${x}" cy="${y2}" r="11" fill="rgba(123,244,206,.22)" stroke="#7bf4ce" stroke-width="1.5" ${D([0, .7, 1.5, 2.3][i])}/><path class="ak" d="M${x - 4} ${y2} l3 3 l5-6" fill="none" stroke="#7bf4ce" stroke-width="2" stroke-linecap="round" ${D([0, .7, 1.5, 2.3][i])}/>`;
    });
    h += `<circle class="mp" cx="170" cy="${y1}" r="6" fill="#f2b45b"/><circle class="ap gl c" cx="170" cy="${y2}" r="6" fill="#43dcff" style="color:#43dcff"/>`;
    return h;
  })()];

  // 2. Planned downtime: scattered inputs drop into one repository that feeds a clash-free schedule.
  scenes['art-repo'] = ['0 0 400 225', (() => {
    let h = T(20, 14, 'SCATTERED INPUTS') + [40, 70, 100].map((x, i) => `<circle cx="${x}" cy="26" r="3" fill="#56708f"/><circle class="dp c" cx="${x}" cy="26" r="3.5" fill="#43dcff" ${D(i * .55)}/>`).join('');
    h += `<rect x="20" y="52" width="120" height="18" rx="5" fill="#0b1424" stroke="#43dcff" stroke-opacity=".6"/>` + T(80, 64, 'SINGLE REPOSITORY', 'mid b') + T(380, 64, 'PLANNED DOWNTIME · NEXT QUARTER', 'end');
    for (let i = 0; i <= 8; i++) h += `<line x1="${100 + 35 * i}" x2="${100 + 35 * i}" y1="82" y2="178" stroke="#16263d"/>`;
    h += `<rect x="240" y="80" width="70" height="98" rx="4" fill="rgba(168,139,255,.1)" stroke="#a88bff" stroke-dasharray="3 3"/>` + T(275, 191, 'CLOSE WINDOW', 'mid v');
    [['FINANCE CLOSE', 98, [[135, 75, '#43dcff']]], ['CORE APPS', 128, [[170, 55, '#7bf4ce'], [320, 50, '#7bf4ce']]], ['PLANNED CHG', 158, [[110, 40, '#43dcff'], [330, 45, '#a88bff']]]].forEach(([n, y, bars], r) => {
      h += T(20, y + 10, n) + bars.map(([x, w, c], i) => `<rect class="gb" x="${x}" y="${y}" width="${w}" height="14" rx="4" fill="${c}" ${D(r * .25 + i * .2)}/>`).join('');
    });
    h += `<line class="sc" x1="100" x2="100" y1="80" y2="178" stroke="#edf5ff" stroke-opacity=".7"/>` + T(200, 212, '✓ NO CLASH WITH THE FINANCE CLOSE', 'mid m');
    return h;
  })()];

  // 3. Month-end close: three tools converge into one close cockpit.
  scenes['art-mec'] = ['0 0 400 225', (() => {
    const tools = [['TEAMS', '#a88bff', 42], ['POWER APPS', '#43dcff', 94], ['POWER BI', '#7bf4ce', 146]];
    let h = tools.map(([n, c, y], i) => `<rect x="20" y="${y}" width="100" height="36" rx="8" fill="#0b1424" stroke="${c}" stroke-opacity=".7"/>` + T(70, y + 22, n, 'mid b') + `<path class="fl" d="M120 ${y + 18}C150 ${y + 18} 145 112 170 112" fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="4 8" ${D(i * .25)}/>`).join('');
    h += `<rect x="170" y="26" width="210" height="173" rx="10" fill="#0b1424" stroke="#26405e"/>` + T(184, 46, 'MONTH-END CLOSE', 'b') + T(366, 46, 'MEC', 'c end');
    h += `<rect x="184" y="56" width="182" height="4" rx="2" fill="#16263d"/><rect class="pf" x="184" y="56" width="182" height="4" rx="2" fill="#43dcff" style="transform-origin:left"/>`;
    ['CONSOLIDATE', 'STANDARDIZE', 'AUTOMATE', 'LESS MANUAL WORK'].forEach((l, i) => {
      const y = 88 + i * 28;
      h += `<rect x="184" y="${y - 10}" width="14" height="14" rx="3" fill="none" stroke="#3a4a63"/><path class="tk" d="M187 ${y - 3}l3 3 6-7" fill="none" stroke="#7bf4ce" stroke-width="2" stroke-linecap="round" stroke-dasharray="20" ${D(.8 + i * 1.5)}/>` + T(208, y + 1, l) + `<rect x="330" y="${y - 4}" width="36" height="4" rx="2" fill="#1b2c46"/>`;
    });
    return h;
  })()];

  // 4. Reconciliation: a scan matches source rows to dashboard bars until the totals agree.
  scenes['art-data'] = ['0 0 400 225', (() => {
    const v = [412, 287, 356, 129, 100], L = 'ABCDE';
    let h = `<rect x="20" y="30" width="130" height="162" rx="8" fill="#0b1424" stroke="#26405e"/><rect x="250" y="30" width="130" height="162" rx="8" fill="#0b1424" stroke="#26405e"/>` + T(32, 46, 'SQL · SOURCE', 'c') + T(262, 46, 'POWER BI · DASHBOARD', 'm');
    v.forEach((n, i) => {
      const y = 60 + i * 26, w = Math.round(n * .22);
      h += T(32, y + 12, L[i]) + T(138, y + 12, n, 'b end') + `<line x1="150" x2="250" y1="${y + 9}" y2="${y + 9}" class="${i === 2 ? 'cb' : 'cn'}" stroke="#26405e" stroke-width="1.5" stroke-dasharray="3 3" ${D(.3 + i * 1.1)}/>`;
      h += `<rect x="262" y="${y + 2}" width="${i === 2 ? Math.round(329 * .22) : w}" height="14" rx="3" fill="${i === 2 ? '#f2b45b' : '#7bf4ce'}" opacity=".85"/>`;
      if (i === 2) h += `<rect x="262" y="${y + 2}" width="${w}" height="14" rx="3" fill="#7bf4ce" class="good" opacity=".9"/><text x="368" y="${y + 12}" class="w end bad" opacity="0">329 ≠</text><text x="368" y="${y + 12}" class="m end good">356 =</text>`;
    });
    h += `<rect class="bm" x="20" y="60" width="360" height="2" fill="#43dcff" style="filter:drop-shadow(0 0 6px #43dcff)"/>`;
    h += `<g class="pill"><rect x="115" y="198" width="170" height="20" rx="10" fill="rgba(123,244,206,.12)" stroke="#7bf4ce"/>${T(200, 211, 'Σ TOTALS MATCH · 1,284 = 1,284', 'mid m')}</g>`;
    return h;
  })()];

  // 5. Regional collaboration: Ciudad Juárez, Michigan and Virginia linked into one delivery team.
  scenes['art-team'] = ['0 0 400 225', (() => {
    const hub = { j: [77, 169], m: [279, 70], v: [328, 115] };
    const arcs = [['j', 'm', 'M77 169Q150 60 279 70'], ['j', 'v', 'M77 169Q210 175 328 115'], ['m', 'v', 'M279 70Q322 78 328 115']];
    let h = '<defs><pattern id="gvDots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#1d3250"/></pattern></defs><rect x="20" y="20" width="360" height="185" rx="10" fill="url(#gvDots)"/>';
    h += `<rect x="28" y="28" width="120" height="20" rx="10" fill="rgba(67,220,255,.1)" stroke="#43dcff" stroke-opacity=".6"/>` + T(88, 41, 'HYBRID TEAM · 8', 'mid c');
    h += arcs.map(([, , d], i) => `<path d="${d}" fill="none" stroke="#43dcff" stroke-opacity=".7" stroke-width="1.5" stroke-dasharray="4 8" class="ar" ${D(i * .3)}/>`).join('');
    h += arcs.map(([, , d], i) => `<circle r="3" fill="#7bf4ce" class="pk"><animateMotion dur="${3 + i * .6}s" begin="indefinite" repeatCount="indefinite" path="${d}"/></circle>`).join('');
    [['j', 'CD. JUÁREZ · MX', 192, 'mid'], ['m', 'MICHIGAN · US', 56, 'mid'], ['v', 'VIRGINIA · US', 138, 'mid']].forEach(([k, n, ty], i) => {
      const [x, y] = hub[k];
      h += `<circle class="rp" cx="${x}" cy="${y}" r="8" fill="none" stroke="#a88bff" ${D(i * .8)}/><circle cx="${x}" cy="${y}" r="7" fill="#0a1322" stroke="#a88bff" stroke-width="2"/><circle cx="${x}" cy="${y}" r="2.5" fill="#edf5ff"/>` + T(k === 'j' ? x : k === 'v' ? x - 4 : x, k === 'j' ? ty : k === 'm' ? y - 14 : y + 24, n, 'mid b');
    });
    return h;
  })()];

  // 6. Process optimization: a continuous-improvement loop beside an AS-IS to TO-BE process morph.
  scenes['art-process'] = ['0 0 400 225', (() => {
    const cx = 105, cy = 112, r = 46, C = 2 * Math.PI * r, seg = C / 4 - 8;
    const pt = d => [cx + r * Math.cos(d * Math.PI / 180), cy + r * Math.sin(d * Math.PI / 180)].map(n => n.toFixed(1));
    let h = [0, 1, 2, 3].map(i => { const [x1, y1] = pt(-90 + i * 90 + 6), [x2, y2] = pt(-90 + (i + 1) * 90 - 6); return `<path class="arc" d="M${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}" fill="none" stroke="#2f6f8f" stroke-width="7" stroke-linecap="round" style="animation-delay:${i * 2}s"/>`; }).join('');
    h += T(cx, cy - 2, 'CONTINUOUS', 'mid') + T(cx, cy + 9, 'IMPROVEMENT', 'mid c') + T(cx, 38, 'DISCOVER', 'mid b') + T(cx + 56, cy + 3, 'MODEL', 'b') + T(cx, 192, 'IMPROVE', 'mid b') + T(cx - 56, cy + 3, 'MEASURE', 'b end');
    const A = [[255, 112], [285, 72], [315, 152], [345, 82], [380, 112]], B = [[255, 112], [285, 112], [315, 112], [345, 112], [380, 112]];
    const P = pts => 'M' + pts.map(p => p.join(' ')).join('L');
    h += `<path d="${P(A)}" fill="none" stroke="#f2b45b" stroke-width="2" stroke-linejoin="round">` + `<animate attributeName="d" dur="7s" begin="indefinite" repeatCount="indefinite" keyTimes="0;.35;.5;.85;1" values="${P(A)};${P(A)};${P(B)};${P(B)};${P(A)}"/><animate attributeName="stroke" dur="7s" begin="indefinite" repeatCount="indefinite" keyTimes="0;.35;.5;.85;1" values="#f2b45b;#f2b45b;#7bf4ce;#7bf4ce;#f2b45b"/></path>`;
    h += A.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#0a1322" stroke="#edf5ff"><animate attributeName="cy" dur="7s" begin="indefinite" repeatCount="indefinite" keyTimes="0;.35;.5;.85;1" values="${p[1]};${p[1]};112;112;${p[1]}"/></circle>`).join('');
    h += `<text x="318" y="40" class="mid w b">AS-IS<animate attributeName="opacity" dur="7s" begin="indefinite" repeatCount="indefinite" keyTimes="0;.35;.5;.85;1" values="1;1;0;0;1"/></text><text x="318" y="40" class="mid m b" opacity="0">TO-BE<animate attributeName="opacity" dur="7s" begin="indefinite" repeatCount="indefinite" keyTimes="0;.35;.5;.85;1" values="0;0;1;1;0"/></text>`;
    h += [10, 18, 26, 36].map((n, i) => `<rect class="kb" x="${275 + i * 22}" y="${196 - n}" width="14" height="${n}" rx="3" fill="#43dcff" opacity=".85" style="transform-origin:bottom;animation-delay:${i * .25}s"/>`).join('') + T(318, 214, 'KPIs MONITORED', 'mid');
    return h;
  })()];

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.project-card').forEach(card => {
    const art = card.querySelector('.project-art');
    const key = art && Object.keys(scenes).find(k => art.classList.contains(k));
    if (!key) return;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'scene');
    svg.setAttribute('viewBox', scenes[key][0]);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = scenes[key][1];
    art.classList.add('v9');
    art.appendChild(svg);
    const smil = [...svg.querySelectorAll('animate,animateMotion')];
    if (reduce) { smil.forEach(n => n.remove()); return; }
    if (smil.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) smil.forEach(n => n.beginElement && n.beginElement()); else smil.forEach(n => n.endElement && n.endElement());
      }), { threshold: 0.3 });
      io.observe(card);
    }
  });
})();
