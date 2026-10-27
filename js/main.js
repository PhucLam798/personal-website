/**
 * ============================================================================
 * TẠ PHÚC LÂM — CINEMATIC INTERACTIVE PORTFOLIO (2026)
 * MODULE 05: HIGH-PERFORMANCE ORCHESTRATOR, I18N, THEME, CURSOR & HUD
 * - Cached section offsets (zero getBoundingClientRect layout thrashing on scroll)
 * - State-diffed HUD & nav-link updates (zero redundant DOM writes)
 * - Demand-driven Custom Cursor RAF loop (auto-sleeps when mouse is stationary)
 * ============================================================================
 */
window.TPL = window.TPL || {};

document.addEventListener('DOMContentLoaded', () => {
    const DATA = window.TPL.DATA;
    const translations = DATA ? DATA.translations : {};

    /* ========================================================================
       1. PRELOADER: 000 → 100% climbs slowly, then the introduction fades in
       ======================================================================== */
    function initPreloader() {
        const preloader = document.getElementById('system-preloader');
        const counterEl = document.getElementById('preloader-counter');
        const barEl = document.getElementById('preloader-bar-fill');

        if (!preloader) {
            document.body.classList.add('is-loaded');
            return;
        }

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            preloader.classList.add('is-hidden');
            document.body.classList.add('is-loaded');
            return;
        }

        const duration = 2800;
        const startTime = performance.now();
        // Ease in-out so the count starts gently, speeds up, then settles on 100
        const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

        function step(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const progress = Math.round(ease(t) * 100);
            if (counterEl) counterEl.textContent = String(progress).padStart(3, '0');
            if (barEl) barEl.style.transform = `scaleX(${progress / 100})`;

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                // Hold on 100% briefly before handing over to the introduction
                setTimeout(() => {
                    preloader.classList.add('is-hidden');
                    document.body.classList.add('is-loaded');
                }, 350);
            }
        }
        requestAnimationFrame(step);
    }

    /* ========================================================================
       2. BILINGUAL I18N SYSTEM (VI DEFAULT / EN)
       ======================================================================== */
    const btnEn = document.getElementById('langEn');
    const btnVi = document.getElementById('langVi');

    try {
        localStorage.removeItem('preferred-lang');
    } catch (e) {}

    let currentLang = 'vi';
    try {
        const savedLang = sessionStorage.getItem('preferred-lang');
        if (savedLang === 'en' || savedLang === 'vi') {
            currentLang = savedLang;
        }
    } catch (e) {}

    function switchLang(lang) {
        currentLang = lang;
        try {
            sessionStorage.setItem('preferred-lang', lang);
        } catch (e) {}

        document.documentElement.lang = lang;

        if (btnVi && btnEn) {
            btnVi.classList.toggle('is-active', lang === 'vi');
            btnEn.classList.toggle('is-active', lang === 'en');
        }

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[key] && translations[key][lang] !== undefined) {
                const text = translations[key][lang];
                if (text.includes('<')) {
                    el.innerHTML = text;
                } else {
                    el.textContent = text;
                }
            }
        });

        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (translations[key] && translations[key][lang] !== undefined) {
                el.innerHTML = translations[key][lang];
            }
        });

        if (window.TPL.Chapters) {
            window.TPL.Chapters.renderDynamicContent(lang);
        }

        if (window.TPL.RoadIntro) {
            window.TPL.RoadIntro.refreshText();
        }
        if (window.TPL.AfterSpace) {
            window.TPL.AfterSpace.refresh();
        }

        bindMagneticElements();
        cacheSectionMetrics();
        lastActiveChapterId = '';
        updateActiveSectionOnScroll();

    }

    if (btnEn) btnEn.addEventListener('click', () => switchLang('en'));
    if (btnVi) btnVi.addEventListener('click', () => switchLang('vi'));

    /* ========================================================================
       3. THEME ENGINE (OBSIDIAN DARK / EDITORIAL IVORY LIGHT)
       ======================================================================== */
    const themeToggleBtn = document.getElementById('themeToggle');
    const mobileThemeBtn = document.getElementById('mobileThemeToggle');
    const mobileThemeText = document.getElementById('mobileThemeText');
    const themeSun = document.getElementById('themeSun');
    const themeMoon = document.getElementById('themeMoon');

    try {
        localStorage.removeItem('preferred-theme');
    } catch (e) {}

    let currentTheme = document.body.classList.contains('theme-light') ? 'light' : 'dark';
    try {
        const savedTheme = sessionStorage.getItem('preferred-theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            currentTheme = savedTheme;
        }
    } catch (e) {}

    function applyTheme(theme) {
        currentTheme = theme;
        try {
            sessionStorage.setItem('preferred-theme', theme);
        } catch (e) {}

        // Colour the phone's address bar to match the page
        const themeMeta = document.querySelector('meta[name="theme-color"]');
        if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f3efe6' : '#06080d');

        if (theme === 'light') {
            document.body.classList.add('theme-light');
            document.body.classList.remove('theme-dark');
            if (themeSun) themeSun.classList.remove('hidden');
            if (themeMoon) themeMoon.classList.add('hidden');
            if (mobileThemeText) mobileThemeText.textContent = 'Theme: Light ☀️';
        } else {
            document.body.classList.add('theme-dark');
            document.body.classList.remove('theme-light');
            if (themeMoon) themeMoon.classList.remove('hidden');
            if (themeSun) themeSun.classList.add('hidden');
            if (mobileThemeText) mobileThemeText.textContent = 'Theme: Dark 🌙';
        }
    }

    function toggleTheme() {
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    }

    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', toggleTheme);

    /* ========================================================================
       4. DEMAND-DRIVEN CUSTOM CURSOR & MAGNETIC ELEMENTS
       ======================================================================== */
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    const cursorLabel = document.getElementById('cursor-label');
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (canHover && !reduceMotion && cursorDot && cursorRing) {
        let mouseX = window.innerWidth * 0.5;
        let mouseY = window.innerHeight * 0.5;
        let ringX = mouseX;
        let ringY = mouseY;
        let cursorActive = false;
        let cursorInit = false;

        function tickCursor() {
            const dx = mouseX - ringX;
            const dy = mouseY - ringY;
            ringX += dx * 0.25;
            ringY += dy * 0.25;
            cursorRing.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;

            if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
                requestAnimationFrame(tickCursor);
            } else {
                cursorActive = false;
            }
        }

        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            if (!cursorInit) {
                cursorInit = true;
                ringX = mouseX;
                ringY = mouseY;
                document.body.classList.add('has-custom-cursor');
            }
            if (!cursorActive) {
                cursorActive = true;
                requestAnimationFrame(tickCursor);
            }
        }, { passive: true });

        document.addEventListener('mouseover', e => {
            const interactive = e.target.closest('a, button, .previewable-img, [data-cursor-label]');
            if (interactive) {
                cursorRing.classList.add('is-hover');
                const customText = interactive.getAttribute('data-cursor-label');
                if (customText && cursorLabel) {
                    cursorLabel.textContent = customText;
                    cursorRing.classList.add('has-label');
                } else {
                    cursorRing.classList.remove('has-label');
                }
            } else {
                cursorRing.classList.remove('is-hover', 'has-label');
            }
        }, { passive: true });
    }

    function bindMagneticElements() {
        if (!canHover || reduceMotion) return;
        document.querySelectorAll('.magnetic-el').forEach(el => {
            if (el.dataset.magneticBound === '1') return;
            el.dataset.magneticBound = '1';

            el.addEventListener('mousemove', e => {
                const rect = el.getBoundingClientRect();
                const dx = (e.clientX - (rect.left + rect.width * 0.5)) * 0.2;
                const dy = (e.clientY - (rect.top + rect.height * 0.5)) * 0.2;
                el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
            }, { passive: true });

            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            }, { passive: true });
        });
    }

    /* ========================================================================
       5. NAVIGATION, MOBILE MENU & ZERO-THRASHING SCROLL-SPY HUD
       ======================================================================== */
    const toggleBtn = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    let menuOpen = false;

    if (toggleBtn && mobileNav) {
        toggleBtn.addEventListener('click', e => {
            e.stopPropagation();
            menuOpen = !menuOpen;
            mobileNav.style.maxHeight = menuOpen ? `${mobileNav.scrollHeight + 24}px` : '0px';
            toggleBtn.setAttribute('aria-expanded', String(menuOpen));
        });

        document.querySelectorAll('#mobileNav a').forEach(link => {
            link.addEventListener('click', () => {
                menuOpen = false;
                mobileNav.style.maxHeight = '0px';
                toggleBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                if (window.TPL.Chapters) {
                    window.TPL.Chapters.scrollToTarget(target);
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    const hudChapterCode = document.getElementById('hud-chapter-code');
    const hudChapterName = document.getElementById('hud-chapter-name');

    let cachedSections = [];
    let cachedMaxScroll = 1;
    let lastActiveChapterId = '';
    let scrollTicking = false;

    function cacheSectionMetrics() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        cachedMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        cachedSections = sections.map(sec => {
            const rect = sec.getBoundingClientRect();
            const top = rect.top + scrollY;
            return {
                id: sec.getAttribute('id'),
                top,
                bottom: top + rect.height
            };
        });
    }

    function updateActiveSectionOnScroll() {
        scrollTicking = false;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const pct = Math.max(0, Math.min(1, scrollY / cachedMaxScroll));

        if (scrollProgressBar) {
            scrollProgressBar.style.transform = `scaleX(${pct.toFixed(3)})`;
        }

        let currentId = 'home';
        const probeY = scrollY + window.innerHeight * 0.35;
        for (let i = 0; i < cachedSections.length; i++) {
            if (probeY >= cachedSections[i].top) currentId = cachedSections[i].id;
        }

        // Only touch DOM attributes/classes when active chapter actually changes
        if (currentId !== lastActiveChapterId) {
            lastActiveChapterId = currentId;
            document.body.setAttribute('data-active-chapter', currentId);

            for (let i = 0; i < navLinks.length; i++) {
                const link = navLinks[i];
                link.classList.toggle('is-active', link.getAttribute('href') === `#${currentId}`);
            }

            if (DATA && DATA.chapters) {
                const ch = DATA.chapters.find(c => c.id === currentId) || DATA.chapters[0];
                if (ch) {
                    if (hudChapterCode) hudChapterCode.textContent = ch.code;
                    if (hudChapterName) hudChapterName.textContent = currentLang === 'en' ? ch.labelEn : ch.labelVi;
                }
            }
        }
    }

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(updateActiveSectionOnScroll);
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        cacheSectionMetrics();
    }, { passive: true });

    /* ========================================================================
       6. IMAGE LIGHTBOX MODAL & COPY EMAIL ACTION
       ======================================================================== */
    const imageModal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalCaption = document.getElementById('modalCaption');
    const closeImageModalBtn = document.getElementById('closeImageModal');

    function openImageModal(src, altText) {
        if (!imageModal || !modalImg) return;
        modalImg.src = src;
        modalImg.alt = altText || 'Preview Image';
        if (modalCaption) modalCaption.textContent = altText || '';
        imageModal.classList.remove('opacity-0', 'pointer-events-none');
        imageModal.classList.add('opacity-100', 'pointer-events-auto');
        imageModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeImageModal() {
        if (!imageModal) return;
        imageModal.classList.remove('opacity-100', 'pointer-events-auto');
        imageModal.classList.add('opacity-0', 'pointer-events-none');
        imageModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(() => {
            if (modalImg) modalImg.src = '';
        }, 300);
    }

    document.addEventListener('click', e => {
        const img = e.target.closest('.previewable-img');
        if (img) {
            const src = img.getAttribute('src');
            const alt = img.getAttribute('alt') || img.getAttribute('title') || '';
            if (src) openImageModal(src, alt);
        }
    });

    if (closeImageModalBtn) closeImageModalBtn.addEventListener('click', closeImageModal);
    if (imageModal) {
        imageModal.addEventListener('click', e => {
            if (e.target === imageModal) closeImageModal();
        });
    }
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && imageModal && imageModal.classList.contains('opacity-100')) {
            closeImageModal();
        }
    });

    const copyEmailBtn = document.getElementById('copyEmailBtn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', e => {
            e.preventDefault();
            const email = 'taphuclamab@gmail.com';
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).catch(() => {});
            }
            const labelSpan = copyEmailBtn.querySelector('[data-i18n="contact.copyEmail"]');
            if (labelSpan) {
                const copiedTxt = translations['contact.copied'] ? translations['contact.copied'][currentLang] : 'Copied!';
                const origTxt = translations['contact.copyEmail'] ? translations['contact.copyEmail'][currentLang] : 'Copy Email';
                labelSpan.textContent = copiedTxt;
                copyEmailBtn.classList.add('is-copied');
                setTimeout(() => {
                    labelSpan.textContent = origTxt;
                    copyEmailBtn.classList.remove('is-copied');
                }, 2000);
            }
        });
    }

    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    /* ========================================================================
       7. BOOTSTRAP ALL MODULES IN SEQUENCE
       ======================================================================== */
    applyTheme(currentTheme);
    if (window.TPL.Chapters) window.TPL.Chapters.init(currentLang);
    if (window.TPL.RoadIntro) window.TPL.RoadIntro.init();
    if (window.TPL.SkillViz) window.TPL.SkillViz.init();
    if (window.TPL.AfterSpace) window.TPL.AfterSpace.init();
    switchLang(currentLang);
    bindMagneticElements();
    cacheSectionMetrics();
    updateActiveSectionOnScroll();
    initPreloader();
});
