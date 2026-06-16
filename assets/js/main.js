document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const grid = document.getElementById('projects-grid');
    const count = document.getElementById('project-count');
    const subtitle = document.getElementById('hero-subtitle');
    const nav = document.querySelector('.nav');

    initParticles();
    initNav();
    initReveal();

    if (subtitle) {
        typeText(subtitle, 'Делаю сайты, ботов и игры.', 60);
    }

    if (grid && count) {
        loadProjects();
    }

    async function loadProjects() {
        try {
            const response = await fetch('projects.json');
            if (!response.ok) throw new Error('Не удалось загрузить проекты');
            const projects = await response.json();

            // Имитация загрузки — минимум 2.2 секунды чтобы лоадер успел поиграть
            await new Promise(resolve => setTimeout(resolve, 2200));

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
        }, 800);
    }

    function typeText(element, text, speed) {
        let i = 0;
        element.innerHTML = '<span class="cursor"></span>';
        const cursor = element.querySelector('.cursor');

        function type() {
            if (i < text.length) {
                cursor.insertAdjacentText('beforebegin', text.charAt(i));
                i++;
                setTimeout(type, speed);
            } else {
                setTimeout(() => {
                    cursor.style.display = 'none';
                }, 2000);
            }
        }

        setTimeout(type, 1000);
    }

    function initNav() {
        if (!nav) return;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    function initReveal() {
        const reveals = document.querySelectorAll('.reveal');
        if (reveals.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(reveal => observer.observe(reveal));
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function initParticles() {
        const canvas = document.getElementById('particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        let isActive = true;
        let mouse = { x: null, y: null };

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticles() {
            const count = Math.min(window.innerWidth / 12, 70);
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 2 + 0.5,
                    alpha: Math.random() * 0.5 + 0.1,
                    color: Math.random() > 0.5 ? '139, 92, 246' : '6, 182, 212'
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

                // Отталкивание от мыши
                if (mouse.x && mouse.y) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        const force = (120 - dist) / 120;
                        p.x += dx * force * 0.02;
                        p.y += dy * force * 0.02;
                    }
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
                ctx.fill();

                // Соединяем близкие частицы
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${p.color}, ${0.12 * (1 - dist / 130)})`;
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

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

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
