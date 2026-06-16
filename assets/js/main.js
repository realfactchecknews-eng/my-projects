document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const grid = document.getElementById('projects-grid');
    const count = document.getElementById('project-count');

    initParticles();

    if (grid && count) {
        loadProjects();
    }

    async function loadProjects() {
        try {
            const response = await fetch('projects.json');
            if (!response.ok) throw new Error('Не удалось загрузить проекты');
            const projects = await response.json();

            // Имитация красивой загрузки (минимум 1200 мс)
            await new Promise(resolve => setTimeout(resolve, 1200));

            renderProjects(projects);
            hideLoader();
        } catch (error) {
            console.error('Ошибка загрузки проектов:', error);
            if (grid) {
                grid.innerHTML = `
                    <div class="error-message">
                        <p>Не удалось загрузить проекты. Проверь файл <code>projects.json</code>.</p>
                    </div>
                `;
            }
            hideLoader();
        }
    }

    function renderProjects(projects) {
        count.textContent = projects.length;

        grid.innerHTML = projects.map((project, index) => `
            <article class="project-card" style="animation: fadeUp 0.6s ease-out ${0.1 * index}s both;">
                <div class="project-icon">${escapeHtml(project.icon)}</div>
                <h3 class="project-title">${escapeHtml(project.title)}</h3>
                <p class="project-description">${escapeHtml(project.description)}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="project-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
                <div class="project-card-actions">
                    <a class="project-link project-link-detail" href="project.html?id=${escapeHtml(project.id)}">
                        Подробнее
                    </a>
                    <a class="project-link project-link-external" href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(project.linkText || 'Перейти')}
                    </a>
                </div>
            </article>
        `).join('');
    }

    function hideLoader() {
        if (!loader) return;
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 600);
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function initParticles() {
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        let isActive = true;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticles() {
            const count = Math.min(window.innerWidth / 10, 80);
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    radius: Math.random() * 2 + 1,
                    alpha: Math.random() * 0.5 + 0.2
                });
            }
        }

        function draw() {
            if (!isActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(124, 92, 255, ${p.alpha})`;
                ctx.fill();

                // Соединяем близкие частицы
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(124, 92, 255, ${0.15 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationId = requestAnimationFrame(draw);
        }

        resize();
        createParticles();
        draw();

        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });

        // Пауза анимации при скрытой вкладке для экономии ресурсов
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isActive = false;
                cancelAnimationFrame(animationId);
            } else {
                isActive = true;
                draw();
            }
        });
    }
});
