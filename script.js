document.addEventListener('DOMContentLoaded', () => {

    function initCanvasAINetwork() {
        const canvas = document.getElementById('ai-network');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;

        let swarmX = null, swarmY = null;
        let isSwarming = false;
        let hoverTimer = null;

        const avatarContainer = document.getElementById('avatarContainer');
        if (avatarContainer) {
            const avatarImage = avatarContainer.querySelector('.avatar-img');
            const useAvatarFallback = () => {
                if (avatarImage) avatarImage.style.display = 'none';
                avatarContainer.classList.add('avatar-image-missing');
            };

            if (avatarImage) {
                avatarImage.addEventListener('error', useAvatarFallback, { once: true });
                if (avatarImage.complete && avatarImage.naturalWidth === 0) useAvatarFallback();
            }

            function updateSwarmCenter() {
                const circle = avatarContainer.querySelector('.avatar-circle') || avatarContainer;
                const rect = circle.getBoundingClientRect();
                swarmX = rect.left + rect.width / 2;
                swarmY = rect.top + rect.height / 2;
            }
            
            window.addEventListener('scroll', updateSwarmCenter, { passive: true });
            window.addEventListener('resize', updateSwarmCenter);
            
            avatarContainer.addEventListener('mouseenter', () => {
                updateSwarmCenter();
                hoverTimer = setTimeout(() => {
                    isSwarming = true;
                }, 600);
            });
            
            avatarContainer.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimer);
                isSwarming = false;
            });
        }

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        let mouse = { x: null, y: null, radius: 120 };
        window.addEventListener('mousemove', (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 1.2;
                this.vy = (Math.random() - 0.5) * 1.2;
                this.radius = Math.random() * 1.6 + 0.6;
                this.baseX = this.x;
                this.baseY = this.y;
                const isLight = document.body.classList.contains('theme-light');
                this.color = Math.random() > 0.8 ? (isLight ? '#38bdf8' : '#dff3ff') : (isLight ? '#0284c7' : '#00c8ff');
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                const isLight = document.body.classList.contains('theme-light');
                if (this.color === '#dff3ff' || this.color === '#38bdf8') {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = isLight ? '#0284c7' : '#00c8ff';
                }
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            update() {
                if (isSwarming && swarmX !== null && swarmY !== null) {
                    let dx = swarmX - this.x;
                    let dy = swarmY - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let targetRadius = 180;

                    if (distance > targetRadius) {
                        this.vx += (dx / distance) * 0.45;
                        this.vy += (dy / distance) * 0.45;
                    } else if (distance < targetRadius - 35) {
                        this.vx -= (dx / distance) * 0.45;
                        this.vy -= (dy / distance) * 0.45;
                    }
                    
                    this.vx += (dy / distance) * 0.4;
                    this.vy -= (dx / distance) * 0.4;
                    
                    let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    if (speed > 7) {
                        this.vx = (this.vx / speed) * 7;
                        this.vy = (this.vy / speed) * 7;
                    }
                } else {
                    if (mouse.x !== null && mouse.y !== null) {
                        let dx = mouse.x - this.x;
                        let dy = mouse.y - this.y;
                        let distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < mouse.radius) {
                            let force = (mouse.radius - distance) / mouse.radius;
                            this.x -= (dx / distance) * force * 2;
                            this.y -= (dy / distance) * force * 2;
                        }
                    }
                    this.vx *= 0.98;
                    this.vy *= 0.98;
                    this.x += (this.baseX - this.x) * 0.01;
                    this.y += (this.baseY - this.y) * 0.01;
                    this.baseX += (Math.random() - 0.5) * 0.5;
                    this.baseY += (Math.random() - 0.5) * 0.5;
                }

                this.x += this.vx;
                this.y += this.vy;

                if (this.baseX < 0 || this.baseX > width) this.vx *= -1;
                if (this.baseY < 0 || this.baseY > height) this.vy *= -1;
            }
        }

        let particles = [];
        function initParticles() {
            particles = [];
            let numParticles = (width * height) / 10000;
            for (let i = 0; i < numParticles; i++) particles.push(new Particle());
        }

        function connectParticles() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = dx * dx + dy * dy;

                    if (distance < 20000) {
                        let opacity = 1 - (distance / 20000);
                        const isLight = document.body.classList.contains('theme-light');
                        ctx.strokeStyle = isLight ? `rgba(2, 132, 199, ${opacity * 0.22})` : `rgba(0, 200, 255, ${opacity * 0.25})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => p.update());
            connectParticles();
        }

        window.addEventListener('resize', () => { resize(); initParticles(); });
        window.updateCanvasTheme = () => {
            const isLight = document.body.classList.contains('theme-light');
            particles.forEach(p => {
                p.color = Math.random() > 0.8 ? (isLight ? '#38bdf8' : '#dff3ff') : (isLight ? '#0284c7' : '#00c8ff');
            });
        };
        window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

        resize();
        initParticles();
        animate();
    }

    initCanvasAINetwork();

    function initTechBoxesGlow() {
        const techBoxes = document.querySelectorAll('.tech-box');
        techBoxes.forEach(box => {
            if (!box.querySelector('.glow-bg')) {
                const glow = document.createElement('div');
                glow.className = 'glow-bg';
                box.insertBefore(glow, box.firstChild);
            }

            box.addEventListener('mousemove', e => {
                const rect = box.getBoundingClientRect();
                box.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                box.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            });
        });
    }
    initTechBoxesGlow();

    const projects = [
        {
            type: "DỰ ÁN NHÓM",
            typeEn: "GROUP PROJECT",
            title: "Gaze-Controlled Computer",
            description: "Phát hiện đồng tử bằng YOLOv8 và hồi quy đa thức để điều khiển con trỏ mượt mà bằng ánh nhìn.",
            descriptionEn: "Pupil detection using YOLOv8 and polynomial regression for smooth cursor control via eye gaze.",
            tags: ["YOLOv8", "OpenCV", "Python","Linear","Polynomial"],
            url: "https://github.com/PhucLam798/Gaze-Controlled-Computer"
        },
        {
            type: "NGHIÊN CỨU",
            typeEn: "RESEARCH",
            title: "FoG Parkinson Detection",
            description: "Thiết bị đeo IoT dùng MLP dự đoán sự kiện FoG và kích hoạt cảnh báo âm thanh trong dưới 1,2 giây.",
            descriptionEn: "IoT wearable device using MLP to predict FoG events and trigger acoustic alerts in under 1.2 seconds.",
            tags: ["AIoT", "MLP", "Embedded"],
            url: "https://github.com/PhucLam798/FoG-Parkinson-Detection"
        },
        {
            type: "CÁ NHÂN",
            typeEn: "PERSONAL PROJECT",
            title: "Autonomous Sidewalk Robot",
            description: "Robot tự lái dùng thị giác máy tính để lập bản đồ vỉa hè và điều khiển PID cho lộ trình ổn định.",
            descriptionEn: "Self-driving robot using computer vision for sidewalk mapping and PID control for a stable trajectory.",
            tags: ["YOLOv8-Seg", "PID", "CV","BEV"],
            url: "https://github.com/PhucLam798/Autonomous-Sidewalk-Robot"
        },
        {
            type: "CÁ NHÂN",
            typeEn: "PERSONAL PROJECT",
            title: "Headmouse Hardware",
            description: "Chuột hỗ trợ nền tảng Arduino, theo dõi chuyển động đầu và nhận thao tác nhấp qua chớp mắt.",
            descriptionEn: "Arduino-based assistive mouse that tracks head motion and recognizes click actions via eye blinks.",
            tags: ["Arduino", "MPU6050", "ATmega32u4"],
            url: "https://github.com/PhucLam798/Headmouse-Hardware"
        },
        {
            type: "CÁ NHÂN",
            typeEn: "PERSONAL PROJECT",
            title: "Headmouse Software",
            description: "Ứng dụng webcam ánh xạ chuyển động mũi thành chuyển động con trỏ bằng MediaPipe.",
            descriptionEn: "Webcam application mapping nose movements to cursor motion using MediaPipe.",
            tags: ["MediaPipe", "Python", "CV"],
            url: "https://github.com/PhucLam798/Headmouse-Sorfware"
        },
        {
            type: "DỰ ÁN NHÓM",
            typeEn: "GROUP PROJECT",
            title: "Fine-Tuned LLM Chat",
            description: "Tinh chỉnh mô hình ngôn ngữ lớn để chuyển các ký tự rời rạc thành câu văn hoàn chỉnh.",
            descriptionEn: "Fine-tuning large language models to convert discrete characters into complete sentences.",
            tags: ["LoRA", "LLM"],
            url: "https://github.com/PhucLam798/Fine-Tuned-LLM-Chat"
        }
    ];

    const awards = [
        { medal: "04", tone: "", title: "Giải Tư · Nghiên cứu Khoa học Kỹ thuật Việt Nam (VISEF)", titleEn: "Fourth Prize · Vietnam Science and Engineering Fair (VISEF)", note: "Cuộc thi STEM", noteEn: "STEM Competition" },
        { medal: "03", tone: "bronze", title: "Giải Ba · Chung kết Tin học Trẻ Toàn quốc", titleEn: "Third Prize · National Youth Informatics Finals", note: "Lập trình & CNTT", noteEn: "Programming & IT" },
        { medal: "BR", tone: "bronze", title: "Huy chương Đồng · Olympic HSGS, ĐHQG Hà Nội", titleEn: "Bronze Medal · HSGS Olympiad, VNU Hanoi", note: "Olympic Vật lý", noteEn: "Physics Olympiad" },
        { medal: "01", tone: "", title: "Giải Nhất · Vòng Khu vực miền Trung Tin học Trẻ", titleEn: "First Prize · Central Vietnam Regional Youth Informatics Contest", note: "Lập trình & CNTT", noteEn: "Programming & IT" },
        { medal: "50", tone: "silver", title: "Top 50 Toàn quốc · Samsung Solve for Tomorrow", titleEn: "Top 50 Nationwide · Samsung Solve for Tomorrow Vietnam", note: "Cuộc thi STEM", noteEn: "STEM Competition" }
    ];

    const githubOnlySvg = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.21.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.46-1.15-1.11-1.46-1.11-1.46-.91-.61.07-.6.07-.6 1 .07 1.54 1.04 1.54 1.04.9 1.54 2.35 1.1 2.92.84.09-.65.35-1.1.64-1.35-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.5 9.5 0 0 1 12 6.5c.85 0 1.7.11 2.5.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.69-4.57 4.94.36.31.68.91.68 1.84v2.72c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>`;

    function renderProjectsAndAwards(lang = 'vi') {
        const projectGrid = document.getElementById('projectGrid');
        const awardsList = document.getElementById('awardsList');

        if (projectGrid) {
            projectGrid.innerHTML = projects.map((project, index) => {
                const number = String(index + 1).padStart(2, "0");
                const typeText = lang === 'en' ? project.typeEn : project.type;
                const descText = lang === 'en' ? project.descriptionEn : project.description;
                const tagsHtml = project.tags.map(t => `<span class="key-pill">${t}</span>`).join('');

                const gitLabel = lang === 'en' ? 'View source on GitHub' : 'Xem mã nguồn trên GitHub';

                return `
                <article class="project-card glass tech-box cyber-border p-6 flex flex-col h-full reveal">
                    <div class="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-3 mb-4">
                        <span class="project-index font-code text-cyan-400 font-bold text-xs">#${number}</span>
                        <span class="project-type text-[10px] font-code font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">${typeText}</span>
                    </div>
                    <h3 class="text-xl font-bold text-white font-display leading-snug mb-2">${project.title}</h3>
                    <p class="text-sm text-gray-300 leading-relaxed mb-4 flex-1">${descText}</p>
                    <div class="flex flex-wrap gap-1.5 mb-5">${tagsHtml}</div>
                    <div class="pt-4 border-t border-cyan-500/20 mt-auto">
                        <a class="git-center-btn" href="${project.url}" target="_blank" rel="noopener noreferrer" aria-label="${gitLabel} (${project.title})" title="${gitLabel}">
                            ${githubOnlySvg}
                        </a>
                    </div>
                </article>`;
            }).join('');
        }

        if (awardsList) {
            awardsList.innerHTML = awards.map(award => {
                const titleText = lang === 'en' ? award.titleEn : award.title;
                const noteText = lang === 'en' ? award.noteEn : award.note;

                return `
                <article class="award-item glass tech-box cyber-border p-5 flex items-center gap-5 reveal">
                    <span class="award-medal ${award.tone}">${award.medal}</span>
                    <div class="flex-1">
                        <h4 class="text-base font-bold text-white font-display mb-1">${titleText}</h4>
                        <p class="text-xs font-code text-cyan-400 uppercase tracking-wider">> ${noteText}_</p>
                    </div>
                </article>`;
            }).join('');
        }

        initTechBoxesGlow();
        initScrollAnimations();
    }

    let observer;
    function initScrollAnimations() {
        if (observer) observer.disconnect();
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        const animElements = [
            '.header-animate', '.hero-title', '.hero-sub', '.hero-meta', '.hero-buttons',
            '.avatar-animate', '.section-title-animate', '.stagger-container', '.contact-animate',
            '.footer-animate', '.reveal'
        ];
        
        animElements.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => observer.observe(el));
        });
    }

    const revealVisibleElements = () => {
        const animElements = document.querySelectorAll('.header-animate, .hero-title, .hero-sub, .hero-meta, .hero-buttons, .avatar-animate, .section-title-animate, .stagger-container, .contact-animate, .footer-animate, .reveal');
        animElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('visible');
                el.classList.add('is-visible');
            }
        });
    };

    setTimeout(revealVisibleElements, 200);
    window.addEventListener('load', () => setTimeout(revealVisibleElements, 100));
    window.addEventListener('hashchange', () => requestAnimationFrame(revealVisibleElements));

    const toggleBtn = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    let menuOpen = false;

    if (toggleBtn && mobileNav) {
        toggleBtn.addEventListener('click', e => {
            e.stopPropagation();
            menuOpen = !menuOpen;
            mobileNav.style.maxHeight = menuOpen ? mobileNav.scrollHeight + 'px' : '0px';
        });

        document.querySelectorAll('#mobileNav a').forEach(link => {
            link.addEventListener('click', () => {
                menuOpen = false;
                mobileNav.style.maxHeight = '0px';
            });
        });
    }

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.scrollY + 140;
        sections.forEach(sec => {
            if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
                current = sec.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            const isMatch = link.getAttribute('href') === '#' + current;
            const isLight = document.body.classList.contains('theme-light');
            if (isMatch) {
                link.style.color = isLight ? '#0284c7' : '#00c8ff';
                link.style.textShadow = isLight ? 'none' : '0 0 10px rgba(0,200,255,0.7)';
                link.style.fontWeight = isLight ? '800' : '600';
            } else {
                link.style.color = isLight ? '#0f172a' : '#cbd5e1';
                link.style.textShadow = 'none';
                link.style.fontWeight = isLight ? '700' : '600';
            }
        });
    }, { passive: true });


    /* ============================================================
       BỘ TỪ ĐIỂN SONG NGỮ (VIỆT - ANH)
       - Chỉnh sửa nội dung Tiếng Anh (en) và Tiếng Việt (vi) trực tiếp tại đây.
       - Khi sửa nội dung bất kỳ ở đây, trang web sẽ tự động áp dụng ngay cho cả 2 bên (VI và EN)!
       ============================================================ */
    const translations = {
        'brand.name': { en: 'Ta Phuc Lam', vi: 'Tạ Phúc Lâm' },
        'nav.home': { en: 'Home', vi: 'Trang chủ' },
        'nav.about': { en: 'Systems Thinking', vi: 'Tư duy hệ thống' },
        'nav.activities': { en: 'Milestones', vi: 'Dấu ấn' },
        'nav.projects': { en: 'Projects', vi: 'Ý tưởng' },
        'nav.awards': { en: 'Achievements', vi: 'Thành tích' },
        'nav.contact': { en: 'Contact', vi: 'Liên hệ' },

        'hero.eyebrow': { en: 'PORTFOLIO 2026', vi: 'PORTFOLIO 2026' },
        'hero.name': { en: 'TA PHUC LAM', vi: 'TẠ PHÚC LÂM' },
        'hero.title': { en: 'Pursuing Systems Thinking', vi: 'Theo đuổi tư duy hệ thống' },
        'hero.desc': { 
            en: 'I pursue a mindset focused on the intersection of embedded hardware (Embedded), Edge AI, Robotics, and AIoT to create impactful technological solutions.', 
            vi: 'Tôi theo đuổi lối tư duy tập trung vào giao thoa giữa phần cứng nhúng (Embedded), AI trên biên (Edge AI), Robotics và AIoT để tạo ra những giải pháp công nghệ hữu ích.' 
        },
        'hero.btnProjects': { en: 'Explore Projects', vi: 'Khám phá dự án' },
        'hero.btnContact': { en: 'Contact for Collaboration', vi: 'Liên hệ hợp tác' },

        'about.eyebrow': { en: '01 · STORY & SYSTEMS THINKING', vi: '01 · CÂU CHUYỆN & TƯ DUY HỆ THỐNG' },
        'about.title': { en: 'Systems Thinking', vi: 'Tư duy hệ thống' },
        'about.bio.title': { en: 'Systems Thinking', vi: 'Tư duy hệ thống' },
        'about.bio': { 
            en: 'I am interested in turning real-world problems into complete engineering systems: from sensors, circuits, and embedded hardware to artificial intelligence models and real-time control algorithms.', 
            vi: 'Tôi quan tâm đến việc biến bài toán đời thực thành một hệ thống kỹ thuật hoàn chỉnh: từ cảm biến, mạch điện, phần cứng nhúng đến mô hình trí tuệ nhân tạo và thuật toán điều khiển thời gian thực.' 
        },
        'about.edu.label': { en: 'EDUCATION JOURNEY', vi: 'HÀNH TRÌNH HỌC TẬP' },
        'about.edu.title': { en: 'Education & Foundations', vi: 'Đào tạo & Nền tảng' },
        'about.edu1.time': { en: '2026 — Present', vi: '2026 — Hiện tại' },
        'about.edu1.title': { en: 'University of Science, VNU-HCM', vi: 'Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM' },
        'about.edu1.desc': { 
            en: 'Electronics & Telecommunications Engineering<br><strong class="text-cyan-300">Major: Computer & Embedded Systems</strong>', 
            vi: 'Kỹ thuật Điện tử — Viễn thông<br><strong class="text-cyan-300">Chuyên ngành: Máy tính và Hệ thống nhúng</strong>' 
        },
        'about.edu2.time': { en: '2023 — 2026', vi: '2023 — 2026' },
        'about.edu2.title': { en: 'Le Quy Don High School for the Gifted, Quang Tri', vi: 'Trường THPT Chuyên Lê Quý Đôn, Quảng Trị' },
        'about.edu2.desc': { 
            en: 'Physics Specialized Class<br>President of STEM Club', 
            vi: 'Lớp Chuyên Vật lý<br>Chủ nhiệm CLB STEM' 
        },

        'skills.kicker': { en: 'TECHNICAL SKILLS', vi: 'KỸ NĂNG CHUYÊN MÔN' },
        'skills.title': { en: 'Technical Capabilities', vi: 'Năng lực kỹ thuật' },
        'skills.g1.title': { en: 'Programming', vi: 'Lập trình' },
        'skills.g1.sub': { en: 'Languages & Tools', vi: 'Ngôn ngữ & Công cụ' },
        'skills.g1.desc': { 
            en: 'Foundations in data structures, algorithms, and high-performance software development for embedded systems.', 
            vi: 'Nền tảng lập trình cấu trúc dữ liệu, giải thuật và phát triển phần mềm hiệu năng cao cho hệ thống nhúng.' 
        },
        'skills.g2.title': { en: 'AI & Machine Learning', vi: 'AI & Machine Learning' },
        'skills.g2.sub': { en: 'Models & Algorithms', vi: 'Mô hình & Thuật toán' },
        'skills.g2.desc': { 
            en: 'Training, fine-tuning, and deploying Machine Learning, Deep Learning, LLM, NLP, and Computer Vision.', 
            vi: 'Huấn luyện, tinh chỉnh và triển khai Machine Learning, Deep Learning, LLM, NLP và Computer Vision.' 
        },
        'skills.g3.title': { en: 'Systems & Hardware', vi: 'Hệ thống & Phần cứng' },
        'skills.g3.sub': { en: 'Circuits & Control', vi: 'Vi mạch & Điều khiển' },
        'skills.g3.desc': { 
            en: 'Electronic circuit design, microcontroller integration, sensor interfacing, and feedback dynamic control algorithms.', 
            vi: 'Thiết kế mạch điện tử, tích hợp vi điều khiển, giao tiếp cảm biến và thuật toán điều khiển động học phản hồi.' 
        },

        'act.eyebrow': { en: '02 · MILESTONES', vi: '02 · DẤU ẤN' },
        'act.title': { en: 'Milestones Over Time', vi: 'Cột mốc theo thời gian' },
        'act.subtitle': { 
            en: 'Learning experiences and scientific research orientation.', 
            vi: 'Trải nghiệm học tập và định hướng nghiên cứu khoa học.' 
        },

        'act.infinite.time': { en: '2026 — Present', vi: '2026 — Hiện tại' },
        'act.infinite.status': { en: 'Currently Working', vi: 'Đang làm việc' },
        'act.infinite.tag': { en: 'STUDIO · SOFTWARE & OPERATIONS', vi: 'STUDIO · PHẦN MỀM & VẬN HÀNH' },
        'act.infinite.title': { en: 'INFINITE Studio', vi: 'INFINITE Studio' },
        'act.infinite.role': { 
            en: '<span class="check-icon">✓</span> <strong>Software Engineer Intern</strong> &middot; Web Systems &amp; Workflow Automation', 
            vi: '<span class="check-icon">✓</span> <strong>Software Engineer Intern</strong> &middot; Web Systems &amp; Workflow Automation' 
        },
        'act.infinite.desc': { 
            en: 'Responsible for designing and developing end-to-end internal operational software systems for the studio. Creating web platforms and business workflow automation tools (receiving goods, data processing, order routing) to optimize commercial operations.', 
            vi: 'Đảm nhận vai trò thiết kế và phát triển hệ thống phần mềm vận hành nội bộ end-to-end cho studio. Tạo ra nền tảng Web và công cụ tự động hóa quy trình nghiệp vụ (nhận hàng, xử lý dữ liệu, luân chuyển đơn) giúp tối ưu hóa hoạt động thương mại.' 
        },
        'act.infinite.spotlightBadge': { en: 'SOFTWARE & OPERATIONS', vi: 'PHẦN MỀM & VẬN HÀNH' },
        'act.infinite.btnView': { en: 'View more', vi: 'Xem thêm' },
        'act.infinite.spotlightTitle': { en: 'Building a Commercial Operations System', vi: 'Xây dựng Hệ thống Vận hành Thương mại' },
        'act.infinite.spotlightDesc': { 
            en: 'Personally building and deploying all software solutions, automating business workflow chains to help the studio\'s business and product distribution system operate automatically and efficiently.', 
            vi: 'Tự tay xây dựng và triển khai toàn bộ các giải pháp phần mềm, tự động hóa chuỗi quy trình nghiệp vụ, giúp hệ thống kinh doanh và phân phối sản phẩm của studio hoạt động tự động và hiệu quả.' 
        },

        'act.seas.status': { en: 'Completed', vi: 'Đã hoàn thành' },
        'act.seas.tag': { en: 'SEAS · AI & APPLICATIONS SUMMER CAMP', vi: 'SEAS · TRẠI HÈ AI & ỨNG DỤNG' },
        'act.seas.title': { en: 'Summer in Engineering and Applied Sciences (SEAS)', vi: 'Summer in Engineering and Applied Sciences (SEAS)' },
        'act.seas.role': { 
            en: '<span class="check-icon">✓</span> <strong>Member</strong> (selected <strong>40 out of 400 applicants</strong> nationwide)', 
            vi: '<span class="check-icon">✓</span> <strong>Thành viên</strong> (được chọn <strong>40 trên 400 ứng viên</strong> trên toàn quốc)' 
        },
        'act.seas.spotlightBadge': { en: 'KEY PROJECT', vi: 'DỰ ÁN TRỌNG ĐIỂM' },
        'act.seas.btnView': { en: 'View project', vi: 'Xem dự án' },
        'act.seas.spotlightTitle': { en: 'RICE LEAF DISEASE CLASSIFICATION FOR FARMERS', vi: 'PHÂN LOẠI BỆNH LÁ TRÊN CÂY LÚA DÀNH CHO NÔNG DÂN' },
        'act.seas.spotlightDesc': { 
            en: 'Collaborated on a team project to build and train image classification models to detect rice pests and diseases, supporting farmers in Central Vietnam.', 
            vi: 'Hợp tác trong dự án nhóm để xây dựng và huấn luyện mô hình phân loại hình ảnh nhằm phát hiện sâu bệnh hại lúa, hỗ trợ nông dân khu vực miền Trung Việt Nam.' 
        },
        'act.seas.b1': { 
            en: 'Completed an intensive, full-time two-week program in <strong>Artificial Intelligence and Applications</strong> (developed based on the undergraduate Computer Science curriculum of MIT).', 
            vi: 'Hoàn thành chương trình học chuyên sâu, toàn thời gian trong hai tuần về <strong>Trí tuệ nhân tạo và Ứng dụng</strong> (được xây dựng dựa trên chương trình đại học ngành Khoa học Máy tính của đại học MIT).' 
        },
        'act.seas.b2': { 
            en: 'Worked directly with graduates and doctoral students from <strong>Harvard, MIT, MBZUAI, CERN, NUS, Stony Brook, Ericsson Research, VinAI</strong> and many other leading universities and organizations.', 
            vi: 'Làm việc trực tiếp với các cử nhân và nghiên cứu sinh tiến sĩ đến từ <strong>Harvard, MIT, MBZUAI, CERN, NUS, Stony Brook, Ericsson Research, VinAI</strong> và nhiều đại học, tổ chức hàng đầu khác.' 
        },

        'act.schol.time': { en: '07/07/2026', vi: '07/07/2026' },
        'act.schol.tag': { en: 'SCHOLARSHIP', vi: 'HỌC BỔNG' },
        'act.schol.title': { en: 'Technology Elite Scholarship', vi: 'Học bổng Tinh hoa Công nghệ' },
        'act.schol.badge': { en: 'Scholarship', vi: 'Học bổng' },
        'act.schol.role': { 
            en: '<span class="check-icon">✓</span> FPT University &middot; Sponsored 100% Tuition &amp; Living Expenses', 
            vi: '<span class="check-icon">✓</span> Đại học FPT &middot; Tài trợ 100% học phí &amp; sinh hoạt phí' 
        },
        'act.schol.content': { 
            en: 'Sponsors 100% full-course tuition, along with living expenses and research opportunities with experts for individuals with technological competence and outstanding achievements.', 
            vi: 'Tài trợ 100% học phí toàn khóa, kèm sinh hoạt phí và cơ hội nghiên cứu cùng chuyên gia dành cho cá nhân có năng lực công nghệ và thành tích xuất sắc.' 
        },
        'act.schol.note': {
            en: '<strong class="text-cyan-300 font-semibold font-code uppercase tracking-wider text-[11px] block mb-0.5">Direction Note:</strong>However, I chose to study at the <strong>University of Science, VNU-HCM</strong> — an institution with rich academic heritage and traditions of leading-edge science and technology education, best aligned with my in-depth research orientation.',
            vi: '<strong class="text-cyan-300 font-semibold font-code uppercase tracking-wider text-[11px] block mb-0.5">Ghi chú định hướng:</strong> Tuy nhiên tôi lựa chọn theo học tại <strong>Đại học Khoa học Tự nhiên (ĐHQG-HCM)</strong> — môi trường giàu bề dày học thuật và truyền thống đào tạo khoa học kỹ thuật mũi nhọn, phù hợp nhất với định hướng nghiên cứu chuyên sâu của bản thân'
        },

        'act.pub.time': { en: 'In Progress', vi: 'Đang thực hiện' },
        'act.pub.badge': { en: 'Finalizing', vi: 'Đang hoàn thành' },
        'act.pub.tag': { en: 'PUBLICATIONS · CONFERENCES / JOURNALS', vi: 'CÔNG BỐ · HỘI NGHỊ / TẠP CHÍ' },
        'act.pub.title': { en: 'Conferences, Journals', vi: 'Hội nghị, tạp chí' },
        'act.pub.status': { en: 'Currently in the completion stage...', vi: 'Đang trong giai đoạn hoàn thành...' },
        'act.pub.progressBadge': { en: 'Manuscript being finalized', vi: 'Bản thảo đang hoàn thành' },
        'act.pub.slotTitle': { en: '[Conferences, Journals — In progress...]', vi: '[Hội nghị, tạp chí...]' },
        'act.pub.desc': { 
            en: 'Research is currently in the experimental stage and manuscript finalization...', 
            vi: 'Nghiên cứu đang trong giai đoạn thực nghiệm và hoàn thiện bản thảo...' 
        },
        'act.pub.confLabel': { en: 'Conference:', vi: 'Hội nghị:' },
        'act.pub.jourLabel': { en: 'Journal:', vi: 'Tạp chí:' },
        'act.pub.conf': { en: 'To be updated...', vi: 'Đang để trống...' },
        'act.pub.jour': { en: 'To be updated...', vi: 'Đang để trống...' },

        'projects.eyebrow': { en: '03 · PROJECTS', vi: '03 · Ý TƯỞNG' },
        'projects.title': { en: 'Featured Projects', vi: 'Một số dự án nổi bật' },

        'awards.eyebrow': { en: '04 · ACHIEVEMENTS', vi: '04 · THÀNH TÍCH' },
        'awards.title': { en: 'Memorable Milestones', vi: 'Những cột mốc đáng nhớ' },

        'contact.eyebrow': { en: '05 · CONNECT', vi: '05 · KẾT NỐI' },
        'contact.title': { en: "Let's build<br><em class=\"text-cyan-400 not-italic\">useful things together.</em>", vi: 'Cùng xây những<br><em class="text-cyan-400 not-italic">điều có ích.</em>' },
        'contact.desc': { 
            en: 'If you have ideas about hardware, AI, or robotics, I am always open to discuss.', 
            vi: 'Nếu bạn có ý tưởng về hardware, AI hoặc robotics, tôi luôn sẵn lòng trao đổi.' 
        },
        'contact.facebookName': { en: 'Phuc Lam', vi: 'Phúc Lâm' },

        'footer.tagline': { en: 'Systems Thinking', vi: 'Tư duy hệ thống' },
        'footer.desc': { en: 'Designed with precision & a spirit of exploration.', vi: 'Thiết kế với sự chỉn chu & tinh thần khám phá.' }
    };

    /* ============================================================
       QUẢN LÝ ĐA NGÔN NGỮ (VIỆT - ANH)
       ============================================================ */
    const btnEn = document.getElementById('langEn');
    const btnVi = document.getElementById('langVi');

    // Dọn dẹp cache cũ trong localStorage (nếu từng lưu 'en' trước đó) để đảm bảo luôn mặc định là Tiếng Việt khi mở trang
    try {
        localStorage.removeItem('preferred-lang');
    } catch (e) {}

    // Mặc định luôn là Tiếng Việt ('vi') khi mở trang mới
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

        // Cập nhật thuộc tính lang của trang web
        document.documentElement.lang = lang;

        // Cập nhật giao diện nút chuyển ngôn ngữ
        if (lang === 'vi') {
            if (btnVi) btnVi.className = "px-3 py-1 rounded-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,200,255,0.3)]";
            if (btnEn) btnEn.className = "px-3 py-1 rounded-sm text-gray-400 hover:text-white transition";
        } else {
            if (btnEn) btnEn.className = "px-3 py-1 rounded-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,200,255,0.3)]";
            if (btnVi) btnVi.className = "px-3 py-1 rounded-sm text-gray-400 hover:text-white transition";
        }

        // Cập nhật tất cả các phần tử có data-i18n (tự động nhận cả text và thẻ HTML)
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

        // Cập nhật tất cả các phần tử có data-i18n-html
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (translations[key] && translations[key][lang] !== undefined) {
                el.innerHTML = translations[key][lang];
            }
        });

        // Cập nhật danh sách dự án (Projects) và giải thưởng (Awards)
        renderProjectsAndAwards(lang);
    }

    if (btnEn) btnEn.addEventListener('click', () => switchLang('en'));
    if (btnVi) btnVi.addEventListener('click', () => switchLang('vi'));

    // Khởi tạo hiển thị ngay với Tiếng Việt mặc định
    switchLang(currentLang);

    /* ============================================================
       THEME TOGGLE (SÁNG / TỐI)
       ============================================================ */
    const themeToggleBtn = document.getElementById('themeToggle');
    const mobileThemeToggleBtn = document.getElementById('mobileThemeToggle');
    const themeMoon = document.getElementById('themeMoon');
    const themeSun = document.getElementById('themeSun');
    const mobileThemeText = document.getElementById('mobileThemeText');

    let currentTheme = localStorage.getItem('preferred-theme') || 'dark';

    function applyTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('preferred-theme', theme);

        if (theme === 'light') {
            document.body.classList.add('theme-light');
            document.body.classList.remove('theme-dark');
            if (themeMoon) themeMoon.classList.add('hidden');
            if (themeSun) themeSun.classList.remove('hidden');
            if (mobileThemeText) mobileThemeText.textContent = 'Theme: Light ☀️';
        } else {
            document.body.classList.add('theme-dark');
            document.body.classList.remove('theme-light');
            if (themeMoon) themeMoon.classList.remove('hidden');
            if (themeSun) themeSun.classList.add('hidden');
            if (mobileThemeText) mobileThemeText.textContent = 'Theme: Dark 🌙';
        }

        if (typeof window.updateCanvasTheme === 'function') {
            window.updateCanvasTheme();
        }
        window.dispatchEvent(new Event('scroll'));
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    if (mobileThemeToggleBtn) {
        mobileThemeToggleBtn.addEventListener('click', () => {
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    applyTheme(currentTheme);

    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    /* ============================================================
       IMAGE PREVIEW LIGHTBOX (XEM PHÓNG TO ẢNH KHI NHẤP CHUỘT)
       ============================================================ */
    const imageModal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalCaption = document.getElementById('modalCaption');
    const closeModalBtn = document.getElementById('closeImageModal');

    function openImageModal(src, caption) {
        if (!imageModal || !modalImg) return;
        modalImg.src = src;
        modalImg.alt = caption || 'Xem ảnh phóng to';
        if (modalCaption) modalCaption.textContent = caption || '';
        imageModal.classList.remove('opacity-0', 'pointer-events-none');
        imageModal.classList.add('opacity-100', 'pointer-events-auto');
        document.body.style.overflow = 'hidden';
    }

    function closeImageModal() {
        if (!imageModal) return;
        imageModal.classList.add('opacity-0', 'pointer-events-none');
        imageModal.classList.remove('opacity-100', 'pointer-events-auto');
        document.body.style.overflow = '';
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeImageModal();
        });
    }

    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal || e.target.closest('#closeImageModal')) {
                closeImageModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal && !imageModal.classList.contains('pointer-events-none')) {
            closeImageModal();
        }
    });

    document.querySelectorAll('.previewable-img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            openImageModal(img.currentSrc || img.src, img.getAttribute('title') || img.alt);
        });
    });
});
