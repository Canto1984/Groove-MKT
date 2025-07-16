// Application state and data
let appData = null;
let currentRoute = '';
let filteredProjects = [];
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

// Load application data
async function loadData() {
  try {
    const response = await fetch('https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/e944375d3aa166d7cd20a1eea520c1d5/955eec0e-3295-46b0-92f0-74aba2c5c978/33285498.json');
    appData = await response.json();
    filteredProjects = [...appData.projetos];
    return true;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '<div class="card"><div class="card__body"><h2>Erro ao carregar dados</h2><p>Não foi possível carregar os dados da aplicação.</p></div></div>';
    return false;
  }
}

// Router
function handleRoute() {
  const hash = window.location.hash || '#/';
  let route = hash.substring(1);
  
  // Handle empty route
  if (route === '' || route === '/') {
    route = '/';
  }
  
  console.log('Navigating to route:', route);
  
  // Update active navigation
  updateActiveNav(route);
  
  if (route === '/') {
    renderDashboard();
  } else if (route === '/projects') {
    renderProjects();
  } else if (route.startsWith('/project/')) {
    const projectId = route.split('/')[2];
    renderProjectDetail(projectId);
  } else if (route === '/calendar') {
    renderCalendar();
  } else if (route === '/about') {
    renderAbout();
  } else {
    render404();
  }
  
  currentRoute = route;
}

function updateActiveNav(route) {
  const navItems = {
    home: document.getElementById('nav-home'),
    projects: document.getElementById('nav-projects'),
    calendar: document.getElementById('nav-calendar'),
    about: document.getElementById('nav-about')
  };
  
  // Remove active class from all nav items
  Object.values(navItems).forEach(item => {
    if (item) {
      item.classList.remove('btn--primary');
      item.classList.add('btn--secondary');
    }
  });
  
  // Add active class to current nav item
  if (route === '/') {
    if (navItems.home) {
      navItems.home.classList.remove('btn--secondary');
      navItems.home.classList.add('btn--primary');
    }
  } else if (route === '/projects' || route.startsWith('/project/')) {
    if (navItems.projects) {
      navItems.projects.classList.remove('btn--secondary');
      navItems.projects.classList.add('btn--primary');
    }
  } else if (route === '/calendar') {
    if (navItems.calendar) {
      navItems.calendar.classList.remove('btn--secondary');
      navItems.calendar.classList.add('btn--primary');
    }
  } else if (route === '/about') {
    if (navItems.about) {
      navItems.about.classList.remove('btn--secondary');
      navItems.about.classList.add('btn--primary');
    }
  }
}

// Dashboard view
function renderDashboard() {
  const kpis = appData.metricas_performance.kpis_realize;
  const appContainer = document.getElementById('app');
  
  const html = `
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold">Planejamento Mkt Groove</h2>
    </div>
    
    <div class="dashboard-grid">
      <div class="kpi-card">
        <div class="kpi-value">${kpis.reconhecimento_marca.alcance_mensal.toLocaleString()}</div>
        <div>Alcance Mensal</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${kpis.reconhecimento_marca.impressoes_mensal.toLocaleString()}</div>
        <div>Impressões Mensais</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${kpis.engajamento.taxa_engajamento}</div>
        <div>Taxa de Engajamento</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${kpis.website.visitantes_unicos.toLocaleString()}</div>
        <div>Visitantes Únicos</div>
      </div>
    </div>
    
    <div class="card mt-8">
      <div class="card__body">
        <h3 class="text-xl font-bold mb-8">Análise Competitiva - Seguidores</h3>
        <div class="chart-container">
          <canvas id="competitiveChart"></canvas>
        </div>
      </div>
    </div>
    
    <div class="upcoming-projects">
      <h3 class="text-xl font-bold mb-8">Próximos Projetos</h3>
      <div id="upcoming-projects-list">
        ${renderUpcomingProjects()}
      </div>
    </div>
  `;
  
  appContainer.innerHTML = html;
  
  // Render chart after DOM is updated
  setTimeout(() => {
    renderCompetitiveChart();
  }, 100);
}

function renderUpcomingProjects() {
  const sortedProjects = [...appData.projetos]
    .sort((a, b) => new Date(a.data_evento) - new Date(b.data_evento))
    .slice(0, 5);
    
  return sortedProjects.map(project => {
    const daysUntil = Math.ceil((new Date(project.data_evento) - new Date()) / (1000 * 60 * 60 * 24));
    return `
      <div class="upcoming-project">
        <div>
          <strong>${project.nome}</strong>
          <div class="text-sm color-text-secondary">${formatDate(project.data_evento)} - ${project.local}</div>
        </div>
        <div class="text-sm">
          <span class="status ${daysUntil <= 7 ? 'status--warning' : 'status--info'}">${daysUntil} dias</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderCompetitiveChart() {
  const ctx = document.getElementById('competitiveChart');
  if (!ctx) return;
  
  const competitiveData = appData.analise_competitiva;
  const labels = Object.values(competitiveData).map(org => org.nome);
  const seguidores = Object.values(competitiveData).map(org => org.seguidores);
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Seguidores',
        data: seguidores,
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#9B59B6'],
        borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#9B59B6'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Projects view
function renderProjects() {
  const appContainer = document.getElementById('app');
  const html = `
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold">Projetos</h2>
    </div>
    
    <div class="filters-container">
      <div class="form-group">
        <input type="text" id="search-input" class="form-control" placeholder="Buscar projetos..." style="width: 250px;">
      </div>
      <div class="form-group">
        <select id="osc-filter" class="form-control" style="width: 200px;">
          <option value="">Todas as OSCs</option>
          <option value="instituto_realize">Instituto Realize</option>
          <option value="apj">APJ</option>
          <option value="criar">CRIAR</option>
        </select>
      </div>
      <div class="form-group">
        <select id="category-filter" class="form-control" style="width: 200px;">
          <option value="">Todas as Categorias</option>
          <option value="Cultura">Cultura</option>
          <option value="Esporte">Esporte</option>
          <option value="Social">Social</option>
          <option value="Política">Política</option>
          <option value="Arte">Arte</option>
        </select>
      </div>
    </div>
    
    <div class="project-grid" id="projects-grid">
      ${renderProjectCards()}
    </div>
  `;
  
  appContainer.innerHTML = html;
  
  // Add event listeners for filters
  document.getElementById('search-input').addEventListener('input', applyFilters);
  document.getElementById('osc-filter').addEventListener('change', applyFilters);
  document.getElementById('category-filter').addEventListener('change', applyFilters);
}

function renderProjectCards() {
  return filteredProjects.map(project => {
    const oscInfo = getOscInfo(project.osc);
    const daysUntil = Math.ceil((new Date(project.data_evento) - new Date()) / (1000 * 60 * 60 * 24));
    
    return `
      <div class="card project-card" style="cursor: pointer;" onclick="navigateToProject('${project.id}')">
        <div class="card__body">
          <div class="flex justify-between items-start mb-8">
            <h3 class="text-lg font-bold" style="flex: 1; margin-right: 8px;">${project.nome}</h3>
            <span class="osc-badge osc-${project.osc.replace('instituto_', '')}">${oscInfo.nome}</span>
          </div>
          <div class="mb-8">
            <div class="text-sm color-text-secondary mb-2">Data do Evento</div>
            <div class="font-medium">${formatDate(project.data_evento)}</div>
          </div>
          <div class="mb-8">
            <div class="text-sm color-text-secondary mb-2">Local</div>
            <div>${project.local}</div>
          </div>
          <div class="mb-8">
            <div class="text-sm color-text-secondary mb-2">Categoria</div>
            <div>${project.categoria}</div>
          </div>
          <div class="flex justify-between items-center">
            <span class="status ${getStatusClass(project.status)}">${project.status}</span>
            <span class="text-sm color-text-secondary">${daysUntil} dias</span>
          </div>
          <div class="mt-8">
            <button class="btn btn--primary btn--sm" onclick="event.stopPropagation(); navigateToProject('${project.id}')">Ver Detalhes</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function applyFilters() {
  const searchInput = document.getElementById('search-input');
  const oscFilter = document.getElementById('osc-filter');
  const categoryFilter = document.getElementById('category-filter');
  
  if (!searchInput || !oscFilter || !categoryFilter) return;
  
  const searchTerm = searchInput.value.toLowerCase();
  const oscFilterValue = oscFilter.value;
  const categoryFilterValue = categoryFilter.value;
  
  filteredProjects = appData.projetos.filter(project => {
    const matchesSearch = project.nome.toLowerCase().includes(searchTerm) || 
                         project.local.toLowerCase().includes(searchTerm);
    const matchesOsc = !oscFilterValue || project.osc === oscFilterValue;
    const matchesCategory = !categoryFilterValue || project.categoria === categoryFilterValue;
    
    return matchesSearch && matchesOsc && matchesCategory;
  });
  
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid) {
    projectsGrid.innerHTML = renderProjectCards();
  }
}

// Project detail view
function renderProjectDetail(projectId) {
  const project = appData.projetos.find(p => p.id === projectId);
  const appContainer = document.getElementById('app');
  
  if (!project) {
    render404();
    return;
  }
  
  const oscInfo = getOscInfo(project.osc);
  
  const html = `
    <div class="breadcrumb">
      <a href="#/projects" style="cursor: pointer;">← Voltar para Projetos</a>
    </div>
    
    <div class="flex justify-between items-start mb-8">
      <h2 class="text-3xl font-bold" style="flex: 1; margin-right: 16px;">${project.nome}</h2>
      <span class="osc-badge osc-${project.osc.replace('instituto_', '')}">${oscInfo.nome}</span>
    </div>
    
    <div class="card mb-8">
      <div class="card__body">
        <div class="flex flex-col gap-16">
          <div>
            <h4 class="font-bold mb-2">Data do Evento</h4>
            <p>${formatDate(project.data_evento)}</p>
          </div>
          <div>
            <h4 class="font-bold mb-2">Local</h4>
            <p>${project.local}</p>
          </div>
          <div>
            <h4 class="font-bold mb-2">Status</h4>
            <span class="status ${getStatusClass(project.status)}">${project.status}</span>
          </div>
          <div>
            <h4 class="font-bold mb-2">Categoria</h4>
            <p>${project.categoria}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card mb-8">
      <div class="card__header">
        <h3 class="text-xl font-bold">Cronograma do Projeto</h3>
      </div>
      <div class="card__body">
        <div class="timeline">
          ${renderProjectTimeline(project)}
        </div>
      </div>
    </div>
    
    <div class="card mb-8">
      <div class="card__header">
        <h3 class="text-xl font-bold">Responsáveis e Demandas</h3>
      </div>
      <div class="card__body">
        ${renderResponsibles(project)}
      </div>
    </div>
    
    <div class="card">
      <div class="card__header">
        <h3 class="text-xl font-bold">Conteúdo Sugerido</h3>
      </div>
      <div class="card__body">
        ${renderSuggestedContent(project)}
      </div>
    </div>
  `;
  
  appContainer.innerHTML = html;
}

function renderProjectTimeline(project) {
  const timeline = [
    { key: 'teaser', label: 'Teaser / Release', date: project.cronograma.teaser },
    { key: 'countdown', label: 'Countdown', date: project.cronograma.countdown },
    { key: 'evento', label: 'Evento', date: project.cronograma.evento },
    { key: 'agradecimentos', label: 'Agradecimentos', date: project.cronograma.agradecimentos },
    { key: 'impacto', label: 'Impacto', date: project.cronograma.impacto }
  ];
  
  return timeline.map(item => {
    const daysUntil = Math.ceil((new Date(item.date) - new Date()) / (1000 * 60 * 60 * 24));
    const isPast = daysUntil < 0;
    
    return `
      <div class="timeline-item">
        <div class="timeline-date ${isPast ? 'color-text-secondary' : ''}">${formatDate(item.date)}</div>
        <div class="timeline-content">
          <div class="font-medium">${item.label}</div>
          <div class="text-sm color-text-secondary">
            ${isPast ? `${Math.abs(daysUntil)} dias atrás` : `${daysUntil} dias restantes`}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderResponsibles(project) {
  return Object.entries(project.responsaveis).map(([area, people]) => `
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)" style="cursor: pointer;">
        <span class="font-medium">${area}</span>
        <span>▼</span>
      </div>
      <div class="accordion-content">
        <ul>
          ${people.map(person => `<li>${person}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function renderSuggestedContent(project) {
  const selo = appData.selos_editoriais[project.conteudo_sugerido.selo];
  
  return `
    <div class="mb-8">
      <h4 class="font-bold mb-2">Selo Editorial</h4>
      <div style="background-color: ${selo.cor}; color: white; padding: 8px 12px; border-radius: 6px; display: inline-block;">
        ${selo.nome}
      </div>
      <p class="mt-2 text-sm">${selo.proposito}</p>
    </div>
    
    <div class="mb-8">
      <h4 class="font-bold mb-2">Hashtags</h4>
      <div class="flex flex-wrap gap-4">
        ${project.conteudo_sugerido.hashtags.map(tag => `<span class="status status--info">${tag}</span>`).join('')}
      </div>
    </div>
    
    <div>
      <h4 class="font-bold mb-2">Call to Action</h4>
      <p class="font-medium" style="color: ${selo.cor};">${project.conteudo_sugerido.cta}</p>
    </div>
  `;
}

// Calendar view
function renderCalendar() {
  const appContainer = document.getElementById('app');
  const html = `
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold">Calendário Editorial</h2>
      <div class="flex gap-8 items-center">
        <button class="btn btn--outline" onclick="changeMonth(-1)">← Anterior</button>
        <span class="font-bold text-lg" id="current-month">${getMonthName(currentCalendarMonth)} ${currentCalendarYear}</span>
        <button class="btn btn--outline" onclick="changeMonth(1)">Próximo →</button>
      </div>
    </div>
    
    <div class="card mb-8">
      <div class="card__body">
        <h3 class="font-bold mb-8">Legenda</h3>
        <div class="flex flex-wrap gap-16">
          <div class="flex items-center gap-4">
            <div style="width: 16px; height: 16px; background-color: var(--purple-primary); border-radius: 4px;"></div>
            <span class="text-sm">Teaser</span>
          </div>
          <div class="flex items-center gap-4">
            <div style="width: 16px; height: 16px; background-color: var(--blue-primary); border-radius: 4px;"></div>
            <span class="text-sm">Countdown</span>
          </div>
          <div class="flex items-center gap-4">
            <div style="width: 16px; height: 16px; background-color: var(--yellow-primary); border-radius: 4px;"></div>
            <span class="text-sm">Evento</span>
          </div>
          <div class="flex items-center gap-4">
            <div style="width: 16px; height: 16px; background-color: var(--green-primary); border-radius: 4px;"></div>
            <span class="text-sm">Agradecimentos</span>
          </div>
          <div class="flex items-center gap-4">
            <div style="width: 16px; height: 16px; background-color: var(--medium-gray); border-radius: 4px;"></div>
            <span class="text-sm">Impacto</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card__body">
        <div id="calendar-container">
          ${renderCalendarGrid(currentCalendarMonth, currentCalendarYear)}
        </div>
      </div>
    </div>
  `;
  
  appContainer.innerHTML = html;
}

function renderCalendarGrid(month, year) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  let html = '<div class="calendar-grid">';
  
  // Header row
  dayNames.forEach(day => {
    html += `<div class="calendar-day" style="background-color: var(--color-secondary); font-weight: bold; text-align: center;">${day}</div>`;
  });
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day" style="background-color: var(--light-gray);"></div>';
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const events = getEventsForDate(currentDate);
    
    html += `
      <div class="calendar-day">
        <div class="calendar-day-header">${day}</div>
        ${events.map(event => `
          <div class="calendar-event ${event.type}" onclick="showEventModal('${event.projectId}', '${event.type}')" style="cursor: pointer;">
            ${event.name}
          </div>
        `).join('')}
      </div>
    `;
  }
  
  html += '</div>';
  return html;
}

function getEventsForDate(date) {
  const events = [];
  
  appData.projetos.forEach(project => {
    Object.entries(project.cronograma).forEach(([type, eventDate]) => {
      if (eventDate === date) {
        events.push({
          projectId: project.id,
          name: project.nome,
          type: type
        });
      }
    });
  });
  
  return events;
}

// About view
function renderAbout() {
  const appContainer = document.getElementById('app');
  const html = `
    <h2 class="text-3xl font-bold mb-8">Guia de Uso - Planejamento Mkt Groove</h2>
    
    <div class="card mb-8">
      <div class="card__header">
        <h3 class="text-xl font-bold">Navegação Principal</h3>
      </div>
      <div class="card__body">
        <ul style="list-style: disc; padding-left: 20px;">
          <li><strong>Dashboard:</strong> Visão geral das métricas de performance e análise competitiva</li>
          <li><strong>Projetos:</strong> Lista completa de todos os projetos com filtros por OSC, categoria e busca</li>
          <li><strong>Calendário:</strong> Visualização mensal dos eventos e cronogramas</li>
          <li><strong>Guia de Uso:</strong> Esta página com instruções de uso</li>
        </ul>
      </div>
    </div>
    
    <div class="card mb-8">
      <div class="card__header">
        <h3 class="text-xl font-bold">Funcionalidades dos Projetos</h3>
      </div>
      <div class="card__body">
        <ul style="list-style: disc; padding-left: 20px;">
          <li><strong>Filtros:</strong> Use os dropdowns para filtrar por OSC (Instituto Realize, APJ, CRIAR) e categoria</li>
          <li><strong>Busca:</strong> Digite no campo de busca para encontrar projetos por nome ou local</li>
          <li><strong>Detalhes:</strong> Clique em "Ver Detalhes" para acessar cronograma completo e responsáveis</li>
          <li><strong>Status:</strong> Cada projeto mostra o status atual e dias restantes</li>
        </ul>
      </div>
    </div>
    
    <div class="card mb-8">
      <div class="card__header">
        <h3 class="text-xl font-bold">Calendário Editorial</h3>
      </div>
      <div class="card__body">
        <ul style="list-style: disc; padding-left: 20px;">
          <li><strong>Navegação:</strong> Use os botões "Anterior" e "Próximo" para navegar entre os meses</li>
          <li><strong>Eventos:</strong> Cada tipo de evento tem uma cor específica (veja a legenda)</li>
          <li><strong>Detalhes:</strong> Clique nos eventos para ver detalhes rápidos</li>
          <li><strong>Planejamento:</strong> Visualize todo o ciclo de comunicação de cada projeto</li>
        </ul>
      </div>
    </div>
    
    <div class="card mb-8">
      <div class="card__header">
        <h3 class="text-xl font-bold">Atalhos de Teclado</h3>
      </div>
      <div class="card__body">
        <ul style="list-style: disc; padding-left: 20px;">
          <li><strong>F:</strong> Focar no campo de busca (na página de projetos)</li>
          <li><strong>Esc:</strong> Fechar modais e voltar</li>
        </ul>
      </div>
    </div>
    
    <div class="card">
      <div class="card__header">
        <h3 class="text-xl font-bold">Fluxo Recomendado</h3>
      </div>
      <div class="card__body">
        <ol style="list-style: decimal; padding-left: 20px;">
          <li>Comece no <strong>Dashboard</strong> para ter uma visão geral das métricas</li>
          <li>Vá para <strong>Projetos</strong> e use os filtros para encontrar projetos específicos</li>
          <li>Clique em projetos para ver <strong>cronogramas detalhados</strong> e responsáveis</li>
          <li>Use o <strong>Calendário</strong> para visualizar sobreposições e planejar publicações</li>
          <li>Consulte os <strong>selos editoriais</strong> e sugestões de conteúdo</li>
        </ol>
      </div>
    </div>
  `;
  
  appContainer.innerHTML = html;
}

// Utility functions
function getOscInfo(oscKey) {
  const oscMap = {
    'instituto_realize': appData.organizacoes.instituto_realize,
    'apj': appData.organizacoes.apj,
    'criar': appData.organizacoes.criar
  };
  return oscMap[oscKey] || { nome: oscKey };
}

function getStatusClass(status) {
  const statusMap = {
    'Em andamento': 'status--success',
    'Planejamento': 'status--warning',
    'Pré-produção': 'status--info',
    'Concluído': 'status--success'
  };
  return statusMap[status] || 'status--info';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function getMonthName(monthIndex) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex];
}

function render404() {
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="card">
      <div class="card__body text-center">
        <h2 class="text-2xl font-bold mb-8">Página não encontrada</h2>
        <p class="mb-8">A página que você está procurando não existe.</p>
        <button class="btn btn--primary" onclick="window.location.hash = '#/'">Voltar ao Dashboard</button>
      </div>
    </div>
  `;
}

// Global navigation functions
function navigateToProject(projectId) {
  window.location.hash = `#/project/${projectId}`;
}

// Global functions for calendar and modals
function changeMonth(direction) {
  currentCalendarMonth += direction;
  if (currentCalendarMonth < 0) {
    currentCalendarMonth = 11;
    currentCalendarYear--;
  } else if (currentCalendarMonth > 11) {
    currentCalendarMonth = 0;
    currentCalendarYear++;
  }
  
  const monthElement = document.getElementById('current-month');
  if (monthElement) {
    monthElement.textContent = `${getMonthName(currentCalendarMonth)} ${currentCalendarYear}`;
  }
  
  const calendarContainer = document.getElementById('calendar-container');
  if (calendarContainer) {
    calendarContainer.innerHTML = renderCalendarGrid(currentCalendarMonth, currentCalendarYear);
  }
}

function showEventModal(projectId, eventType) {
  const project = appData.projetos.find(p => p.id === projectId);
  if (!project) return;
  
  const eventTypeNames = {
    'teaser': 'Teaser / Release',
    'countdown': 'Countdown',
    'evento': 'Evento',
    'agradecimentos': 'Agradecimentos',
    'impacto': 'Impacto'
  };
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${eventTypeNames[eventType]}</h3>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div>
        <h4 class="font-bold mb-2">${project.nome}</h4>
        <p class="mb-2"><strong>Data:</strong> ${formatDate(project.cronograma[eventType])}</p>
        <p class="mb-2"><strong>Local:</strong> ${project.local}</p>
        <p class="mb-4"><strong>OSC:</strong> ${getOscInfo(project.osc).nome}</p>
        <button class="btn btn--primary btn--sm" onclick="navigateToProject('${project.id}'); closeModal();">Ver Detalhes Completos</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

function closeModal() {
  const modal = document.querySelector('.modal');
  if (modal) {
    modal.remove();
  }
}

function toggleAccordion(header) {
  const content = header.nextElementSibling;
  const arrow = header.querySelector('span:last-child');
  
  if (content.classList.contains('active')) {
    content.classList.remove('active');
    arrow.textContent = '▼';
  } else {
    content.classList.add('active');
    arrow.textContent = '▲';
  }
}

// Make functions globally available
window.navigateToProject = navigateToProject;
window.changeMonth = changeMonth;
window.showEventModal = showEventModal;
window.closeModal = closeModal;
window.toggleAccordion = toggleAccordion;

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'f' || e.key === 'F') {
    if (currentRoute === '/projects') {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }
  }
  
  if (e.key === 'Escape') {
    closeModal();
  }
});

// Initialize application
async function init() {
  console.log('Initializing application...');
  
  const dataLoaded = await loadData();
  if (!dataLoaded) {
    console.error('Failed to load data');
    return;
  }
  
  console.log('Data loaded successfully');
  
  // Set up router
  window.addEventListener('hashchange', handleRoute);
  
  // Handle initial route
  handleRoute();
  
  console.log('Application initialized');
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}