document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const hero = document.getElementById('project-hero');
    const featuresContainer = document.getElementById('project-features');
    const sectionsContainer = document.getElementById('project-sections');
    const ctaContainer = document.getElementById('project-cta');

    loadProject();

    async function loadProject() {
        try {
            const response = await fetch('projects.json');
            if (!response.ok) throw new Error('Не удалось загрузить проекты');
            const projects = await response.json();

            const params = new URLSearchParams(window.location.search);
            const projectId = params.get('id');
            const project = projects.find(p => p.id === projectId);

            // Имитация загрузки
            await new Promise(resolve => setTimeout(resolve, 800));

            if (!project) {
                renderNotFound();
            } else {
                renderProject(project);
            }

            hideLoader();
        } catch (error) {
            console.error('Ошибка:', error);
            renderError();
            hideLoader();
        }
    }

    function renderProject(project) {
        document.title = `${project.title} | Мои проекты`;

        // Hero
        hero.innerHTML = `
            <div class="project-hero-icon">${escapeHtml(project.icon)}</div>
            <h1 class="project-hero-title">${escapeHtml(project.title)}</h1>
            <div class="project-hero-tags">
                ${project.tags.map(tag => `<span class="project-tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
            <p class="project-hero-description">${escapeHtml(project.fullDescription || project.description)}</p>
        `;

        // Features
        if (project.features && project.features.length > 0) {
            featuresContainer.innerHTML = `
                <h2 class="project-features-title">Возможности</h2>
                <div class="features-grid">
                    ${project.features.map((feature, index) => `
                        <div class="feature-card" style="animation: fadeUp 0.5s ease-out ${0.05 * index}s both;">
                            <p>${escapeHtml(feature)}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            featuresContainer.style.display = 'none';
        }

        // Sections
        if (project.sections && project.sections.length > 0) {
            sectionsContainer.innerHTML = project.sections.map((section, index) => `
                <div class="section-card" style="animation: fadeUp 0.5s ease-out ${0.08 * index}s both;" data-index="${index}">
                    <div class="section-card-header">
                        <h3 class="section-card-title">${escapeHtml(section.title)}</h3>
                        <span class="section-card-toggle">⌄</span>
                    </div>
                    <div class="section-card-body">
                        <div class="section-card-content">
                            ${formatContent(section.content)}
                        </div>
                    </div>
                </div>
            `).join('');

            // Открываем первую секцию по умолчанию
            const firstCard = sectionsContainer.querySelector('.section-card');
            if (firstCard) firstCard.classList.add('active');

            // Accordion
            sectionsContainer.querySelectorAll('.section-card-header').forEach(header => {
                header.addEventListener('click', () => {
                    const card = header.parentElement;
                    const isActive = card.classList.contains('active');

                    // Закрываем все
                    sectionsContainer.querySelectorAll('.section-card').forEach(c => c.classList.remove('active'));

                    // Открываем текущую, если она была закрыта
                    if (!isActive) {
                        card.classList.add('active');
                    }
                });
            });
        } else {
            sectionsContainer.style.display = 'none';
        }

        // CTA
        const linkText = project.linkText || 'Перейти';
        ctaContainer.innerHTML = `
            <h2 class="project-cta-title">Хочешь посмотреть?</h2>
            <a class="project-cta-button" href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer">
                ${escapeHtml(linkText)}
            </a>
        `;
    }

    function renderNotFound() {
        hero.innerHTML = `
            <div class="not-found">
                <h2>Проект не найден</h2>
                <p>Такого проекта пока нет в портфолио.</p>
                <a href="index.html" class="project-cta-button">← Вернуться к проектам</a>
            </div>
        `;
        featuresContainer.style.display = 'none';
        sectionsContainer.style.display = 'none';
        ctaContainer.style.display = 'none';
    }

    function renderError() {
        hero.innerHTML = `
            <div class="not-found">
                <h2>Ошибка загрузки</h2>
                <p>Не удалось загрузить данные проекта. Попробуй позже.</p>
                <a href="index.html" class="project-cta-button">← Вернуться к проектам</a>
            </div>
        `;
    }

    function formatContent(text) {
        if (!text) return '';
        // Разбиваем на параграфы по двойным переносам
        const paragraphs = text.split('\n\n').map(p => p.trim()).filter(p => p);
        return paragraphs.map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function hideLoader() {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 600);
    }
});
