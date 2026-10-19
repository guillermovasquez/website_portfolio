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
