// ==============================
// AuroraOne+ Ultimate Edition
// ==============================

// Helper
const el = id => document.getElementById(id);

// ------------------------------
// Theme toggle logic
// ------------------------------
function setTheme(isLight) {
  if (isLight) {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  localStorage.setItem('aurora_theme', isLight ? 'light' : 'dark');
  document.getElementById('theme-toggle').textContent = isLight ? '☀️' : '🌙';
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  const isLight = document.documentElement.classList.toggle('light');
  setTheme(isLight);
});

// ------------------------------
// Accent color customization
// ------------------------------
const colorPicker = el('color-picker');

function setAccentColor(color) {
  // Update CSS variables dynamically
  document.documentElement.style.setProperty('--accent1', color);
  document.documentElement.style.setProperty('--accent2', color);
  localStorage.setItem('aurora_accent', color);
}

colorPicker.addEventListener('input', (e) => {
  setAccentColor(e.target.value);
});

// Apply saved accent on load
const savedAccent = localStorage.getItem('aurora_accent');
if (savedAccent) {
  colorPicker.value = savedAccent;
  setAccentColor(savedAccent);
}

// ------------------------------
// Create a single project card
// ------------------------------
function createProjectCard(p) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.dataset.tags = p.tags.join(',');
  card.innerHTML = `
    <h3>${p.title}</h3>
    <p>${p.desc}</p>
    <div class="project-tags">
      ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
    </div>
  `;
  return card;
}

// ------------------------------
// Build tag filter buttons
// ------------------------------
function buildFilters(tags, data) {
  const filtersDiv = el('filters');
  filtersDiv.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'btn ghost';
  allBtn.textContent = 'All';
  allBtn.onclick = () => renderProjects(data.projects);
  filtersDiv.appendChild(allBtn);

  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'btn ghost';
    btn.textContent = tag;
    btn.onclick = () => {
      const filtered = data.projects.filter(p => p.tags.includes(tag));
      renderProjects(filtered);
    };
    filtersDiv.appendChild(btn);
  });
}

// ------------------------------
// Render projects dynamically
// ------------------------------
function renderProjects(projects) {
  const container = el('project-list');
  container.innerHTML = '';

  projects.forEach(p => {
    const card = createProjectCard(p);
    card.style.opacity = 0;
    container.appendChild(card);
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease';
      card.style.opacity = 1;
    }, 50);
  });
}

// ------------------------------
// Fetch data.json and populate everything
// ------------------------------
fetch('data.json')
  .then(r => r.json())
  .then(data => {
    // Fill hero + about + contact
    el('name').textContent = data.name;
    el('headline').textContent = data.title;
    el('about-text').textContent = data.about;
    el('contact-email').innerHTML = `Email: <a href="mailto:${data.email}">${data.email}</a>`;
    el('footer-name').textContent = data.name;
    el('year').textContent = new Date().getFullYear();
    if (data.avatar) el('avatar').src = data.avatar;

    // Skills
    const sList = el('skill-list');
    data.skills.forEach(skill => {
      const li = document.createElement('li');
      li.textContent = skill;
      sList.appendChild(li);
    });

    // Projects
    renderProjects(data.projects);

    // Filters
    const uniqueTags = [...new Set(data.projects.flatMap(p => p.tags))];
    buildFilters(uniqueTags, data);

    // Timeline
    const tList = el('timeline-list');
    data.timeline.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.when}</strong> — ${item.event}`;
      tList.appendChild(li);
    });

    // Apply saved theme
    const saved = localStorage.getItem('aurora_theme');
    setTheme(saved === 'light');

    // ------------------------------
    // Scroll reveal animation for panels
    // ------------------------------
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.panel').forEach(sec => {
      sec.style.opacity = 0;
      sec.style.transform = 'translateY(40px)';
      sec.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(sec);
    });
  })
  .catch(err => {
    console.error("Failed to load data.json", err);
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div style="padding:1rem;background:#ffefef;color:#900;">Failed to load data.json</div>'
    );
  });
