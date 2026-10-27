/**
 * ============================================================================
 * TẠ PHÚC LÂM — CINEMATIC INTERACTIVE PORTFOLIO (2026)
 * MODULE 04: CHAPTER RENDERING & SOFT CARD REVEALS
 * - Project cards and the two-row achievements grid are rendered from TPL.DATA
 * - A project card opens its repository README, with a small summary card and GitHub link beside it
 * - [data-reveal] elements rise in one by one when they enter the viewport
 * - Zero scroll-hijacking: native scrolling, transform/opacity/filter only
 * ============================================================================
 */
window.TPL = window.TPL || {};

window.TPL.Chapters = (function () {
    let revealObserver = null;
    const REVEAL_GAP = 220;
    let revealNextAt = 0;
    const GITHUB_MARK = 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z';

    function scrollToTarget(target) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.pageYOffset - 64;
        window.scrollTo({ top, behavior: 'smooth' });
    }

    function renderDynamicContent(lang = 'vi') {
        renderProjectCards(lang);
        renderAchievements(lang);
        observeReveals();
    }

    function renderProjectCards(lang) {
        const grid = document.getElementById('projectGrid');
        const projects = window.TPL.DATA ? window.TPL.DATA.projects : [];
        if (!grid || !projects.length) return;

        const readLabel = lang === 'en' ? 'Read README' : 'Xem README';
        const gitLabel = lang === 'en' ? 'Open on GitHub' : 'Mở trên GitHub';
        grid.innerHTML = projects.map((project, idx) => {
            const typeText = lang === 'en' ? project.typeEn : project.type;
            const descText = lang === 'en' ? project.descriptionEn : project.description;
            const tagsHtml = project.tags.map(t => `<span>${t}</span>`).join('');

            return `
            <article class="project-card" data-reveal data-project-idx="${idx}" role="button" tabindex="0"
                     aria-haspopup="dialog" aria-label="${readLabel}: ${project.title}" data-cursor-label="GITHUB">
                <div class="project-card__top">
                    <span class="project-card__num">${project.index}</span>
                    <span class="project-card__type">${typeText}</span>
                </div>
                <h3 class="project-card__title">${project.title}</h3>
                <p class="project-card__desc">${descText}</p>
                <div class="project-card__foot">
                    <div class="project-card__tags">${tagsHtml}</div>
                    <a class="project-card__link"
                       href="${project.url}"
                       target="_blank"
                       rel="noopener noreferrer"
                       data-cursor-label="GITHUB ↗"
                       aria-label="${gitLabel}: ${project.title}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="${GITHUB_MARK}"/></svg>
                        <span>GitHub</span>
                    </a>
                </div>
            </article>`;
        }).join('');
    }

    // Five awards: three on the first row, two wider ones on the second
    function renderAchievements(lang) {
        const list = document.getElementById('awardsList');
        if (!list || !window.TPL.DATA) return;

        list.innerHTML = window.TPL.DATA.awards.map(award => {
            const titleText = lang === 'en' ? award.titleEn : award.title;
            const noteText = lang === 'en' ? award.noteEn : award.note;

            return `
            <article class="award-card" data-reveal>
                <span class="award-card__medal">${award.medal}</span>
                <h3 class="award-card__title">${titleText}</h3>
                <span class="award-card__note">${noteText}</span>
            </article>`;
        }).join('');
    }

    /* ------------------------------------------------------------------------
       README VIEWER: a project card opens its repository README (no code browsing inside it),
       with a small card beside it that links out to the repository on GitHub
       ------------------------------------------------------------------------ */
    const readmeCache = {};
    let readmeModal = null;
    let readmeBody = null;
    let readmeTitle = null;
    let readmeSide = null;
    let readmeReturnFocus = null;
    let readmeRequest = 0;

    function repoFromUrl(url) {
        const m = /github\.com\/([^/]+\/[^/#?]+)/.exec(url || '');
        return m ? m[1].replace(/\.git$/, '') : '';
    }

    // GitHub already sanitizes rendered READMEs; this pass is a second guard plus link/image rewriting
    function cleanReadme(html, repo) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const rawBase = `https://raw.githubusercontent.com/${repo}/HEAD/`;
        const isAbsolute = v => /^(https?:)?\/\//i.test(v) || /^data:image\//i.test(v);

        doc.querySelectorAll('script, style, iframe, object, embed, form, input, button, link, meta, a.anchor').forEach(el => el.remove());
        doc.querySelectorAll('*').forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                const name = attr.name.toLowerCase();
                if (name.startsWith('on') || /^\s*javascript:/i.test(attr.value)) el.removeAttribute(attr.name);
            });
        });
        doc.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || '';
            if (src && !isAbsolute(src)) img.setAttribute('src', rawBase + src.replace(/^\.?\//, ''));
            img.setAttribute('loading', 'lazy');
            img.removeAttribute('width');
            img.removeAttribute('height');
        });
        // Links into the repository (code files, folders, anchors) are unwrapped; external links open in a new tab
        doc.querySelectorAll('a').forEach(a => {
            const href = a.getAttribute('href') || '';
            const pointsIntoRepo = !isAbsolute(href) || new RegExp(`github\\.com/${repo}(/|$)`, 'i').test(href);
            if (pointsIntoRepo) {
                a.replaceWith(...Array.from(a.childNodes));
            } else {
                a.setAttribute('target', '_blank');
                a.setAttribute('rel', 'noopener noreferrer');
            }
        });
        return doc.body.innerHTML;
    }

    function setReadmeState(message) {
        readmeBody.innerHTML = `<p class="readme-modal__state">${message}</p>`;
    }

    function openReadme(idx) {
        const project = window.TPL.DATA.projects[idx];
        if (!project || !readmeModal) return;
        const lang = document.documentElement.lang === 'en' ? 'en' : 'vi';
        const repo = repoFromUrl(project.url);
        const request = ++readmeRequest;

        readmeReturnFocus = document.activeElement;
        readmeTitle.textContent = project.title;
        fillSideCard(project, lang);
        readmeModal.classList.add('is-open');
        readmeModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        readmeModal.querySelector('.readme-modal__close').focus();
        readmeBody.scrollTop = 0;

        if (readmeCache[repo]) {
            readmeBody.innerHTML = readmeCache[repo];
            return;
        }
        setReadmeState(lang === 'en' ? 'Loading README…' : 'Đang tải README…');
        fetch(`https://api.github.com/repos/${repo}/readme`, { headers: { Accept: 'application/vnd.github.html+json' } })
            .then(res => (res.ok ? res.text() : Promise.reject(res.status)))
            .then(html => {
                readmeCache[repo] = cleanReadme(html, repo);
                if (request === readmeRequest) readmeBody.innerHTML = readmeCache[repo];
            })
            .catch(() => {
                if (request !== readmeRequest) return;
                setReadmeState(lang === 'en'
                    ? 'Could not load the README right now. Please try again later.'
                    : 'Chưa tải được README lúc này. Bạn thử lại sau nhé.');
            });
    }

    function fillSideCard(project, lang) {
        if (!readmeSide) return;
        readmeSide.querySelector('.readme-side__num').textContent = project.index;
        readmeSide.querySelector('.readme-side__type').textContent = lang === 'en' ? project.typeEn : project.type;
        readmeSide.querySelector('.readme-side__title').textContent = project.title;
        readmeSide.querySelector('.readme-side__desc').textContent = lang === 'en' ? project.descriptionEn : project.description;
        readmeSide.querySelector('.readme-side__tags').innerHTML = project.tags.map(t => `<span>${t}</span>`).join('');
        const git = readmeSide.querySelector('.readme-side__git');
        git.setAttribute('href', project.url);
        git.setAttribute('aria-label', `${lang === 'en' ? 'Open on GitHub' : 'Mở trên GitHub'}: ${project.title}`);
    }

    function closeReadme() {
        if (!readmeModal || !readmeModal.classList.contains('is-open')) return;
        readmeModal.classList.remove('is-open');
        readmeModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (readmeReturnFocus && readmeReturnFocus.focus) readmeReturnFocus.focus();
    }

    function bindReadmeViewer() {
        readmeModal = document.getElementById('readmeModal');
        if (!readmeModal) return;
        readmeBody = readmeModal.querySelector('.readme-modal__body');
        readmeTitle = document.getElementById('readmeTitle');
        readmeSide = readmeModal.querySelector('.readme-side');

        const grid = document.getElementById('projectGrid');
        if (grid) {
            grid.addEventListener('click', e => {
                if (e.target.closest('.project-card__link')) return;
                const card = e.target.closest('[data-project-idx]');
                if (card) openReadme(parseInt(card.getAttribute('data-project-idx'), 10));
            });
            grid.addEventListener('keydown', e => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                if (e.target.closest('.project-card__link')) return;
                const card = e.target.closest('[data-project-idx]');
                if (!card) return;
                e.preventDefault();
                openReadme(parseInt(card.getAttribute('data-project-idx'), 10));
            });
        }
        readmeModal.addEventListener('click', e => {
            const onBackdrop = e.target === readmeModal || e.target.classList.contains('readme-modal__layout');
            if (onBackdrop || e.target.closest('.readme-modal__close')) closeReadme();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeReadme();
        });
    }

    /**
     * Soft reveal: each [data-reveal] rises in when it enters the viewport.
     * Cards that arrive together are staggered in reading order, so they appear one by one.
     */
    function observeReveals() {
        const items = Array.from(document.querySelectorAll('[data-reveal]:not(.is-revealed)'));
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(el => el.classList.add('is-revealed'));
            return;
        }

        if (!revealObserver) {
            revealObserver = new IntersectionObserver(entries => {
                entries
                    .filter(entry => entry.isIntersecting)
                    .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left))
                    .forEach(entry => {
                        revealObserver.unobserve(entry.target);
                        // One shared queue, so cards that enter in separate batches still appear one at a time
                        const now = performance.now();
                        revealNextAt = Math.max(now, revealNextAt + REVEAL_GAP);
                        setTimeout(() => entry.target.classList.add('is-revealed'), revealNextAt - now);
                    });
            }, { rootMargin: '0px 0px -12% 0px', threshold: 0.18 });
        }
        items.forEach(el => revealObserver.observe(el));
    }

    /**
     * Pause CSS animations on off-screen sections so the GPU stays idle
     */
    function initViewportAnimationGate() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.chapter-section').forEach(s => s.classList.add('is-in-viewport'));
            return;
        }

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.classList.toggle('is-in-viewport', entry.isIntersecting);
            });
        }, { rootMargin: '150px 0px 150px 0px', threshold: 0.01 });

        document.querySelectorAll('.chapter-section').forEach(sec => {
            sectionObserver.observe(sec);
        });
    }

    function init(initialLang = 'vi') {
        initViewportAnimationGate();
        renderDynamicContent(initialLang);
        bindReadmeViewer();
    }

    return {
        init,
        renderDynamicContent,
        scrollToTarget
    };
})();
