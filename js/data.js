/**
 * ============================================================================
 * TẠ PHÚC LÂM — CINEMATIC INTERACTIVE PORTFOLIO (2026)
 * MODULE 01: DATA & BILINGUAL CONTENT ENGINE (VI / EN)
 * Concept: "THE JOURNEY OF A SYSTEM THINKER"
 * Source of truth: general.md
 * ============================================================================
 */
window.TPL = window.TPL || {};

window.TPL.DATA = {
    meta: {
        ownerVi: "Tạ Phúc Lâm",
        ownerEn: "Ta Phuc Lam",
        year: 2026,
        email: "taphuclamab@gmail.com",
        github: "https://github.com/PhucLam798",
        githubHandle: "@PhucLam798",
        facebook: "https://www.facebook.com/phuc.lam.993406",
        seasUrl: "https://seas-cvn.com/home"
    },

    chapters: [
        { id: "home", code: "CH.00", labelVi: "Giới thiệu", labelEn: "Introduction" },
        { id: "publications", code: "CH.01", labelVi: "Nghiên cứu", labelEn: "Research" },
        { id: "projects", code: "CH.02", labelVi: "Dự án", labelEn: "Projects" },
        { id: "activities", code: "CH.03", labelVi: "Cột mốc", labelEn: "Milestones" },
        { id: "awards", code: "CH.04", labelVi: "Thành tích", labelEn: "Achievements" },
        { id: "contact", code: "CH.05", labelVi: "Kết nối", labelEn: "Next Connection" }
    ],

    systemPipeline: [
        {
            step: "01",
            titleVi: "Cảm biến & Thu nhận",
            titleEn: "Sensors & Acquisition",
            descVi: "Thu thập tín hiệu vật lý từ thế giới thực: quán tính (IMU), thị giác (Camera), sinh học.",
            descEn: "Capturing physical signals from the real world: inertial (IMU), vision (Camera), and biosignals."
        },
        {
            step: "02",
            titleVi: "Mạch điện & Vi điều khiển",
            titleEn: "Circuits & Microcontrollers",
            descVi: "Thiết kế PCB, xử lý tín hiệu số và tích hợp vi điều khiển chuẩn xác ở mức phần cứng.",
            descEn: "PCB design, digital signal conditioning, and bare-metal microcontroller integration."
        },
        {
            step: "03",
            titleVi: "Hệ thống Nhúng",
            titleEn: "Embedded Systems",
            descVi: "Tối ưu hóa tài nguyên tính toán hạn chế, độ trễ cực thấp và vận hành bền bỉ trên biên.",
            descEn: "Optimizing constrained compute resources for ultra-low latency and reliable edge execution."
        },
        {
            step: "04",
            titleVi: "Mô hình Trí tuệ Nhân tạo",
            titleEn: "AI & Deep Learning Models",
            descVi: "Triển khai Computer Vision, MLP, và tinh chỉnh LLM để trích xuất ngữ nghĩa và ra quyết định.",
            descEn: "Deploying Computer Vision, MLP, and fine-tuned LLMs for semantic perception and decision-making."
        },
        {
            step: "05",
            titleVi: "Điều khiển Thời gian thực",
            titleEn: "Real-Time Control Loop",
            descVi: "Thuật toán phản hồi động học PID khép kín, biến quyết định số thành hành động vật lý ổn định.",
            descEn: "Closed-loop PID feedback algorithms translating digital inference into stable physical actuation."
        }
    ],

    projects: [
        {
            id: "proj-01",
            index: "01",
            type: "DỰ ÁN NHÓM",
            typeEn: "GROUP PROJECT",
            domain: "COMPUTER VISION · HUMAN-MACHINE INTERFACE",
            metric: "YOLOv8 + PolyReg",
            title: "Gaze-Controlled Computer",
            description: "Phát hiện đồng tử bằng YOLOv8 và hồi quy đa thức để điều khiển con trỏ mượt mà bằng ánh nhìn.",
            descriptionEn: "Pupil detection using YOLOv8 and polynomial regression for smooth cursor control via eye gaze.",
            architectureVi: "Camera thu nhận vùng mắt → YOLOv8 định vị tâm đồng tử → Ánh xạ tọa độ phi tuyến bằng hồi quy đa thức → Điều khiển con trỏ hệ điều hành thời gian thực.",
            architectureEn: "Eye region capture → YOLOv8 pupil center localization → Non-linear coordinate mapping via polynomial regression → Real-time OS cursor actuation.",
            tags: ["YOLOv8", "OpenCV", "Python", "Linear", "Polynomial"],
            url: "https://github.com/PhucLam798/Gaze-Controlled-Computer",
            vizType: "gaze"
        },
        {
            id: "proj-02",
            index: "02",
            type: "NGHIÊN CỨU",
            typeEn: "RESEARCH",
            domain: "WEARABLE AIoT · BIOMEDICAL EDGE AI",
            metric: "< 1.2s Latency",
            title: "FoG Parkinson Detection",
            description: "Thiết bị đeo IoT dùng MLP dự đoán sự kiện FoG và kích hoạt cảnh báo âm thanh trong dưới 1,2 giây.",
            descriptionEn: "IoT wearable device using MLP to predict FoG events and trigger acoustic alerts in under 1.2 seconds.",
            architectureVi: "Cảm biến chuyển động đeo trên cơ thể → Trích xuất đặc trưng dáng đi theo cửa sổ trượt → Mạng MLP suy luận trên thiết bị nhúng → Phát cảnh báo âm thanh phá băng vận động dưới 1,2 giây.",
            architectureEn: "Wearable motion sensors → Sliding-window gait feature extraction → On-device MLP inference → Acoustic cueing trigger in under 1.2 seconds.",
            tags: ["AIoT", "MLP", "Embedded"],
            url: "https://github.com/PhucLam798/FoG-Parkinson-Detection",
            vizType: "fog"
        },
        {
            id: "proj-03",
            index: "03",
            type: "CÁ NHÂN",
            typeEn: "PERSONAL PROJECT",
            domain: "AUTONOMOUS ROBOTICS · SPATIAL PERCEPTION",
            metric: "BEV + PID Loop",
            title: "Autonomous Sidewalk Robot",
            description: "Robot tự lái dùng thị giác máy tính để lập bản đồ vỉa hè và điều khiển PID cho lộ trình ổn định.",
            descriptionEn: "Self-driving robot using computer vision for sidewalk mapping and PID control for a stable trajectory.",
            architectureVi: "Phân đoạn mặt đường bằng YOLOv8-Seg → Biến đổi phối cảnh Bird's-Eye-View (BEV) → Xác định sai số quỹ đạo trung tâm → Bộ điều khiển PID dẫn hướng động cơ ổn định.",
            architectureEn: "Sidewalk segmentation via YOLOv8-Seg → Bird's-Eye-View (BEV) perspective transform → Centerline trajectory error estimation → Closed-loop PID motor steering.",
            tags: ["YOLOv8-Seg", "PID", "CV", "BEV"],
            url: "https://github.com/PhucLam798/Autonomous-Sidewalk-Robot",
            vizType: "robot"
        },
        {
            id: "proj-04",
            index: "04",
            type: "CÁ NHÂN",
            typeEn: "PERSONAL PROJECT",
            domain: "ASSISTIVE HARDWARE · EMBEDDED HID",
            metric: "6-Axis IMU HID",
            title: "Headmouse Hardware",
            description: "Chuột hỗ trợ nền tảng Arduino, theo dõi chuyển động đầu và nhận thao tác nhấp qua chớp mắt.",
            descriptionEn: "Arduino-based assistive mouse that tracks head motion and recognizes click actions via eye blinks.",
            architectureVi: "Cảm biến quán tính MPU6050 đo góc nghiêng đầu → Vi điều khiển ATmega32u4 xử lý lọc nhiễu & nhận diện xung chớp mắt → Giao thức USB HID giả lập chuột phần cứng trực tiếp.",
            architectureEn: "MPU6050 inertial head-tilt sensing → ATmega32u4 signal filtering & eye-blink impulse recognition → Native USB HID hardware mouse emulation.",
            tags: ["Arduino", "MPU6050", "ATmega32u4"],
            url: "https://github.com/PhucLam798/Headmouse-Hardware",
            vizType: "headhw"
        },
        {
            id: "proj-05",
            index: "05",
            type: "CÁ NHÂN",
            typeEn: "PERSONAL PROJECT",
            domain: "COMPUTER VISION · TOUCHLESS INTERACTION",
            metric: "468 Face Landmarks",
            title: "Headmouse Software",
            description: "Ứng dụng webcam ánh xạ chuyển động mũi thành chuyển động con trỏ bằng MediaPipe.",
            descriptionEn: "Webcam application mapping nose movements to cursor motion using MediaPipe.",
            architectureVi: "Luồng video từ webcam tiêu chuẩn → MediaPipe Face Mesh trích xuất lưới điểm mốc khuôn mặt 3D → Nội suy vector chuyển động đầu mũi → Điều khiển con trỏ mượt không cần phần cứng rời.",
            architectureEn: "Standard webcam video stream → MediaPipe 3D facial landmark mesh extraction → Nose-tip motion vector interpolation → Hardware-free smooth cursor control.",
            tags: ["MediaPipe", "Python", "CV"],
            url: "https://github.com/PhucLam798/Headmouse-Sorfware",
            vizType: "headsw"
        },
        {
            id: "proj-06",
            index: "06",
            type: "DỰ ÁN NHÓM",
            typeEn: "GROUP PROJECT",
            domain: "NATURAL LANGUAGE PROCESSING · GENERATIVE AI",
            metric: "LoRA Adaptation",
            title: "Fine-Tuned LLM Chat",
            description: "Tinh chỉnh mô hình ngôn ngữ lớn để chuyển các ký tự rời rạc thành câu văn hoàn chỉnh.",
            descriptionEn: "Fine-tuning large language models to convert discrete characters into complete sentences.",
            architectureVi: "Chuỗi ký tự rời rạc / viết tắt đầu vào → Mô hình ngôn ngữ lớn được tinh chỉnh bằng kỹ thuật LoRA (Low-Rank Adaptation) → Tái tạo câu văn tự nhiên, đầy đủ ngữ pháp và ngữ cảnh.",
            architectureEn: "Discrete character / shorthand token stream → Large Language Model fine-tuned via LoRA (Low-Rank Adaptation) → Contextually accurate, grammatically complete sentence reconstruction.",
            tags: ["LoRA", "LLM"],
            url: "https://github.com/PhucLam798/Fine-Tuned-LLM-Chat",
            vizType: "llm"
        }
    ],

    awards: [
        {
            index: "01",
            medal: "04",
            tone: "gold",
            title: "Giải Tư · Nghiên cứu Khoa học Kỹ thuật Việt Nam (VISEF)",
            titleEn: "Fourth Prize · Vietnam Science and Engineering Fair (VISEF)",
            note: "Cuộc thi STEM",
            noteEn: "STEM Competition"
        },
        {
            index: "02",
            medal: "03",
            tone: "bronze",
            title: "Giải Ba · Chung kết Tin học Trẻ Toàn quốc",
            titleEn: "Third Prize · National Youth Informatics Finals",
            note: "Lập trình & CNTT",
            noteEn: "Programming & IT"
        },
        {
            index: "03",
            medal: "BR",
            tone: "bronze",
            title: "Huy chương Đồng · Olympic HSGS, ĐHQG Hà Nội",
            titleEn: "Bronze Medal · HSGS Olympiad, VNU Hanoi",
            note: "Olympic Vật lý",
            noteEn: "Physics Olympiad"
        },
        {
            index: "04",
            medal: "01",
            tone: "gold",
            title: "Giải Nhất · Vòng Khu vực miền Trung Tin học Trẻ",
            titleEn: "First Prize · Central Vietnam Regional Youth Informatics Contest",
            note: "Lập trình & CNTT",
            noteEn: "Programming & IT"
        },
        {
            index: "05",
            medal: "50",
            tone: "silver",
            title: "Top 50 Toàn quốc · Samsung Solve for Tomorrow",
            titleEn: "Top 50 Nationwide · Samsung Solve for Tomorrow Vietnam",
            note: "Cuộc thi STEM",
            noteEn: "STEM Competition"
        }
    ],

    translations: {
        'brand.name': { en: 'Ta Phuc Lam', vi: 'Tạ Phúc Lâm' },
        'nav.home': { en: '00. Introduction', vi: '00. Giới thiệu' },
        'nav.pubs': { en: '01. Research', vi: '01. Nghiên cứu' },
        'nav.projects': { en: '02. Projects', vi: '02. Dự án' },
        'nav.activities': { en: '03. Milestones', vi: '03. Cột mốc' },
        'nav.awards': { en: '04. Achievements', vi: '04. Thành tích' },
        'nav.contact': { en: '05. Connect', vi: '05. Liên hệ' },

        'loader.status': { en: 'TA PHUC LAM · PORTFOLIO 2026', vi: 'TẠ PHÚC LÂM · PORTFOLIO 2026' },
        'loader.sub': {
            en: 'EMBEDDED SYSTEMS · EDGE AI · ROBOTICS · AIoT',
            vi: 'HỆ THỐNG NHÚNG · EDGE AI · ROBOTICS · AIoT'
        },

        'hud.scrollPrompt': { en: 'SCROLL TO TRACE THE SIGNAL', vi: 'CUỘN ĐỂ DẪN DẮT HÀNH TRÌNH' },
        'hud.chapterLabel': { en: 'ACTIVE CHAPTER', vi: 'CHƯƠNG HIỆN TẠI' },

        // PROLOGUE — 3D ROAD INTRO
        'intro.title': {
            en: 'Every great system<br>begins with a <em>small signal.</em>',
            vi: 'Mọi hệ thống lớn<br>đều bắt đầu từ một <em>tín hiệu nhỏ.</em>'
        },
        'intro.scroll': { en: 'SCROLL TO BEGIN', vi: 'CUỘN ĐỂ BẮT ĐẦU' },
        'intro.skip': { en: 'SKIP ↓', vi: 'BỎ QUA ↓' },
        'intro.about.kicker': { en: 'Introduction', vi: 'Giới thiệu' },
        'intro.s1.kicker': { en: 'LINEAR REGRESSION', vi: 'HỒI QUY TUYẾN TÍNH' },
        'intro.s1.title': {
            en: 'Among the noisy points,<br>there is always a <em>trend.</em>',
            vi: 'Giữa những điểm nhiễu,<br>luôn có một <em>xu hướng.</em>'
        },
        'intro.s1.desc': {
            en: 'Every point is an attempt: a project, a bug, a lesson. Fit them with least squares and the path becomes clear, and it keeps heading up.',
            vi: 'Mỗi điểm là một lần thử: một dự án, một lỗi, một bài học. Khớp chúng lại bằng bình phương tối thiểu, đường đi hiện ra rõ ràng và tiếp tục hướng lên.'
        },
        'intro.s2.title': {
            en: 'With every step,<br>the road <em>opens up ahead.</em>',
            vi: 'Mỗi bước đi,<br>con đường lại <em>mở ra phía trước.</em>'
        },
        'intro.s5.title': {
            en: 'And that is where<br>the journey <em>begins.</em>',
            vi: 'Và đó là nơi<br>hành trình <em>bắt đầu.</em>'
        },
        'intro.s6.kicker': { en: '01 · RESEARCH', vi: '01 · NGHIÊN CỨU' },
        'intro.s6.title': {
            en: 'When space <em>bends,</em><br>the questions begin.',
            vi: 'Khi không gian <em>bẻ cong,</em><br>câu hỏi bắt đầu.'
        },
        'intro.chart.title': { en: 'LINEAR REGRESSION · LEAST SQUARES', vi: 'HỒI QUY TUYẾN TÍNH · BÌNH PHƯƠNG TỐI THIỂU' },
        'intro.chart.x': { en: 'EFFORT · x', vi: 'NỖ LỰC · x' },
        'intro.chart.y': { en: 'y · GROWTH', vi: 'y · TIẾN BỘ' },
        'intro.chart.forecast': { en: 'FORECAST →', vi: 'DỰ BÁO →' },

        // CHAPTER 00 — HERO
        'hero.name': { en: 'TA PHUC LAM', vi: 'TẠ PHÚC LÂM' },
        'hero.title': { en: 'Pursuing Systems Thinking', vi: 'Theo đuổi tư duy hệ thống' },
        'hero.statement': {
            en: 'THE JOURNEY OF A <span class="editorial-serif">System</span> THINKER.',
            vi: 'HÀNH TRÌNH CỦA MỘT <span class="editorial-serif">Tư duy</span> HỆ THỐNG.'
        },
        'hero.desc': {
            en: 'I pursue a mindset focused on the intersection of embedded hardware (Embedded), Edge AI, Robotics, and AIoT to create impactful technological solutions.',
            vi: 'Tôi theo đuổi lối tư duy tập trung vào giao thoa giữa phần cứng nhúng (Embedded), AI trên biên (Edge AI), Robotics và AIoT để tạo ra những giải pháp công nghệ hữu ích.'
        },
        'hero.btnProjects': { en: 'Explore Projects', vi: 'Khám phá dự án' },
        'hero.btnContact': { en: 'Contact for Collaboration', vi: 'Liên hệ hợp tác' },
        'hero.portraitHint': {
            en: 'Click to inspect portrait',
            vi: 'Bấm để phóng to ảnh chân dung'
        },

        // CHAPTER 01 — ABOUT / THE WAY I THINK
        'about.eyebrow': { en: '01 · STORY & SYSTEMS THINKING', vi: '01 · CÂU CHUYỆN & TƯ DUY HỆ THỐNG' },
        'about.title': { en: 'Systems Thinking', vi: 'Tư duy hệ thống' },
        'about.lead': {
            en: 'Not isolated lines of code. Not standalone circuits. Every real-world problem demands a <span class="editorial-serif">continuous architecture</span>.',
            vi: 'Không chỉ là những dòng code rời rạc. Không chỉ là mạch điện độc lập. Mọi bài toán thực tế đều cần một <span class="editorial-serif">kiến trúc liền mạch</span>.'
        },
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
            en: 'Electronics & Telecommunications Engineering<br><strong class="accent-highlight">Major: Computer & Embedded Systems</strong>',
            vi: 'Kỹ thuật Điện tử — Viễn thông<br><strong class="accent-highlight">Chuyên ngành: Máy tính và Hệ thống nhúng</strong>'
        },
        'about.edu2.time': { en: '2023 — 2026', vi: '2023 — 2026' },
        'about.edu2.title': { en: 'Le Quy Don High School for the Gifted, Quang Tri', vi: 'Trường THPT Chuyên Lê Quý Đôn, Quảng Trị' },
        'about.edu2.desc': {
            en: 'Physics Specialized Class<br>President of STEM Club',
            vi: 'Lớp Chuyên Vật lý<br>Chủ nhiệm CLB STEM'
        },

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
            en: 'Training, fine-tuning, and deploying Machine Learning, Deep Learning, LLM, and Computer Vision.',
            vi: 'Huấn luyện, tinh chỉnh và triển khai Machine Learning, Deep Learning, LLM và Computer Vision.'
        },
        'skills.g3.title': { en: 'Systems & Hardware', vi: 'Hệ thống & Phần cứng' },
        'skills.g3.sub': { en: 'Circuits & Control', vi: 'Vi mạch & Điều khiển' },
        'skills.g3.desc': {
            en: 'Electronic circuit design, microcontroller integration, sensor interfacing, and feedback dynamic control algorithms.',
            vi: 'Thiết kế mạch điện tử, tích hợp vi điều khiển, giao tiếp cảm biến và thuật toán điều khiển động học phản hồi.'
        },

        // CHAPTER 02 — EXPERIENCE / MILESTONES
        'act.eyebrow': { en: '03 · Milestones', vi: '03 · Cột mốc' },
        'act.title': { en: 'Milestones Over Time', vi: 'Cột mốc theo thời gian' },
        'act.subtitle': {
            en: 'Learning experiences, engineering operations, and scientific research orientation.',
            vi: 'Trải nghiệm học tập, vận hành hệ thống thực tế và định hướng nghiên cứu khoa học.'
        },
        'act.scrollHint': {
            en: 'SCROLL TO TRAVERSE MILESTONE STATIONS (01 → 03)',
            vi: 'CUỘN ĐỂ DI CHUYỂN QUA CÁC TRẠM CỘT MỐC (01 → 03)'
        },

        'act.infinite.time': { en: '2026 — Present', vi: '2026 — Hiện tại' },
        'act.infinite.status': { en: 'Currently Working', vi: 'Đang làm việc' },
        'act.infinite.tag': { en: 'STUDIO · SOFTWARE & OPERATIONS', vi: 'STUDIO · PHẦN MỀM & VẬN HÀNH' },
        'act.infinite.title': { en: 'INFINITE Studio', vi: 'INFINITE Studio' },
        'act.infinite.role': {
            en: '<strong>Software Engineer Intern</strong> &middot; Web Systems &amp; Workflow Automation',
            vi: '<strong>Software Engineer Intern</strong> &middot; Web Systems &amp; Workflow Automation'
        },
        'act.infinite.desc': {
            en: 'Responsible for designing and developing end-to-end internal operational software systems for the studio. Creating web platforms and business workflow automation tools (receiving goods, data processing, order routing) to optimize commercial operations.',
            vi: 'Đảm nhận vai trò thiết kế và phát triển hệ thống phần mềm vận hành nội bộ end-to-end cho studio. Tạo ra nền tảng Web và công cụ tự động hóa quy trình nghiệp vụ (nhận hàng, xử lý dữ liệu, luân chuyển đơn) giúp tối ưu hóa hoạt động thương mại.'
        },
        'act.infinite.spotlightBadge': { en: 'SOFTWARE & OPERATIONS', vi: 'PHẦN MỀM & VẬN HÀNH' },
        'act.infinite.spotlightTitle': { en: 'Building a Commercial Operations System', vi: 'Xây dựng Hệ thống Vận hành Thương mại' },
        'act.infinite.spotlightDesc': {
            en: 'Personally building and deploying all software solutions, automating business workflow chains to help the studio\'s business and product distribution system operate automatically and efficiently.',
            vi: 'Tự tay xây dựng và triển khai toàn bộ các giải pháp phần mềm, tự động hóa chuỗi quy trình nghiệp vụ, giúp hệ thống kinh doanh và phân phối sản phẩm của studio hoạt động tự động và hiệu quả.'
        },

        'act.seas.status': { en: 'Completed', vi: 'Đã hoàn thành' },
        'act.seas.tag': { en: 'SEAS · AI & APPLICATIONS SUMMER CAMP', vi: 'SEAS · TRẠI HÈ AI & ỨNG DỤNG' },
        'act.seas.title': { en: 'Summer in Engineering and Applied Sciences (SEAS)', vi: 'Summer in Engineering and Applied Sciences (SEAS)' },
        'act.seas.role': {
            en: '<strong>Member</strong> (selected <strong>40 out of 400 applicants</strong> nationwide)',
            vi: '<strong>Thành viên</strong> (được chọn <strong>40 trên 400 ứng viên</strong> trên toàn quốc)'
        },
        'act.seas.spotlightTitle': { en: 'Rice leaf disease classification for farmers', vi: 'Phân loại bệnh lá trên cây lúa dành cho nông dân' },
        'act.seas.lead': { en: 'Project team lead', vi: 'Trưởng nhóm dự án' },
        'act.seas.noteKicker': { en: 'Program notes:', vi: 'Ghi chú chương trình:' },
        'act.seas.b1': {
            en: 'Completed an intensive, full-time two-week program in <strong>Artificial Intelligence and Applications</strong> (developed based on the undergraduate Computer Science curriculum of MIT).',
            vi: 'Hoàn thành chương trình học chuyên sâu, toàn thời gian trong hai tuần về <strong>Trí tuệ nhân tạo và Ứng dụng</strong> (được xây dựng dựa trên chương trình đại học ngành Khoa học Máy tính của đại học MIT).'
        },
        'act.seas.b2': {
            en: 'Worked directly with graduates and doctoral students from <strong>Harvard, MIT, MBZUAI, CERN, NUS, Stony Brook, Ericsson Research, VinAI</strong> and many other leading universities and organizations.',
            vi: 'Làm việc trực tiếp với các cử nhân và nghiên cứu sinh tiến sĩ đến từ <strong>Harvard, MIT, MBZUAI, CERN, NUS, Stony Brook, Ericsson Research, VinAI</strong> và nhiều đại học, tổ chức hàng đầu khác.'
        },

        'act.schol.time': { en: '07/07/2026', vi: '07/07/2026' },
        'act.schol.tag': { en: 'SCHOLARSHIP & ACADEMIC DIRECTION', vi: 'HỌC BỔNG & ĐỊNH HƯỚNG HỌC THUẬT' },
        'act.schol.title': { en: 'Technology Elite Scholarship', vi: 'Học bổng Tinh hoa Công nghệ' },
        'act.schol.badge': { en: 'Scholarship', vi: 'Học bổng' },
        'act.schol.role': {
            en: 'FPT University &middot; Sponsored 100% Tuition &amp; Living Expenses',
            vi: 'Đại học FPT &middot; Tài trợ 100% học phí &amp; sinh hoạt phí'
        },
        'act.schol.content': {
            en: 'Sponsors 100% full-course tuition, along with living expenses and research opportunities with experts for individuals with technological competence and outstanding achievements.',
            vi: 'Tài trợ 100% học phí toàn khóa, kèm sinh hoạt phí và cơ hội nghiên cứu cùng chuyên gia dành cho cá nhân có năng lực công nghệ và thành tích xuất sắc.'
        },
        'act.schol.note': {
            en: '<strong class="note-kicker">Direction Note:</strong> However, I chose to study at the <strong>University of Science, VNU-HCM</strong> — an institution with rich academic heritage and traditions of leading-edge science and technology education, best aligned with my in-depth research orientation.',
            vi: '<strong class="note-kicker">Ghi chú định hướng:</strong> Tuy nhiên tôi lựa chọn theo học tại <strong>Đại học Khoa học Tự nhiên (ĐHQG-HCM)</strong> — nơi giàu bề dày học thuật và truyền thống đào tạo khoa học kỹ thuật mũi nhọn, phù hợp nhất với định hướng nghiên cứu chuyên sâu của bản thân.'
        },

        // CHAPTER 03 — RESEARCH / EXPLORING THE UNKNOWN
        'pub.eyebrow': { en: '01 · Research & publications', vi: '01 · Nghiên cứu & công bố' },
        'pub.title': { en: 'Scientific Publications & Research Progress', vi: 'Công Bố Khoa Học & Tiến Độ Nghiên Cứu' },
        'pub.subtitle': {
            en: 'Investigating internal representations of Large Language Models and how multilingual prompts traverse latent space.',
            vi: 'Khảo sát không gian biểu diễn tiềm ẩn của Mô hình Ngôn ngữ Lớn và hành trình chuyển dịch ngữ nghĩa của Prompt tiếng Việt.'
        },
        'pub.question.vi': {
            en: 'When a Vietnamese prompt enters an LLM, across which hidden layers does it think — and where does it translate back?',
            vi: 'Khi một Prompt tiếng Việt đi vào LLM, mô hình suy luận ở tầng tiềm ẩn nào — và dịch ngược ở đâu, khi nào?'
        },
        'pub.p1.role': { en: 'Role: First Author', vi: 'Vai trò: Tác giả chính (First Author)' },
        'pub.p1.status': { en: 'Status: Under Review', vi: 'Trạng thái: Đang bình duyệt' },
        'pub.p1.venue': { en: '...', vi: '...' },
        'pub.authorsLabel': { en: 'Authors:', vi: 'Tác giả:' },
        'pub.and': { en: 'and', vi: 'và' },
        'pub.wip.status': { en: 'Status: In Progress · Finalizing', vi: 'Trạng thái: Đang thực hiện · Đang hoàn thành' },
        'pub.wip.title': { en: 'Journals, conferences ...', vi: 'Tạp chí, hội nghị ...' },
        'pub.wip.progress': { en: 'Manuscripts being finalized.', vi: 'Bản thảo đang hoàn thiện.' },
        'pub.wip.desc': {
            en: 'Research is in the experimental stage, with manuscripts being finalized for submission to upcoming journals and conferences...',
            vi: 'Nghiên cứu đang trong giai đoạn thực nghiệm và hoàn thiện bản thảo để gửi tới các tạp chí, hội nghị tiếp theo...'
        },
        'pub.wip.jour': { en: 'Journal: In preparation...', vi: 'Tạp chí: Đang chuẩn bị...' },
        'pub.wip.conf': { en: 'Conference: In preparation...', vi: 'Hội nghị: Đang chuẩn bị...' },

        // CHAPTER 04 — PROJECTS / IDEAS INTO REALITY
        'projects.eyebrow': { en: '02 · Projects', vi: '02 · Dự án' },
        'projects.title': { en: 'Featured Projects', vi: 'Một số dự án nổi bật' },
        'projects.subtitle': {
            en: 'Six engineering systems spanning Computer Vision, Wearable AIoT, Autonomous Robotics, Assistive Hardware, and Fine-Tuned LLMs.',
            vi: 'Sáu hệ thống kỹ thuật trải dài từ Thị giác máy tính, Thiết bị đeo AIoT, Robot tự hành, Phần cứng hỗ trợ đến Mô hình ngôn ngữ lớn.'
        },
        'projects.viewModeStage': { en: 'Spatial Theatre', vi: 'Không gian Trực quan' },
        'projects.viewModeLedger': { en: 'Full Index (06)', vi: 'Toàn bộ Danh mục (06)' },
        'projects.archLabel': { en: 'SYSTEM PIPELINE', vi: 'KIẾN TRÚC HỆ THỐNG' },
        'projects.techLabel': { en: 'TECHNOLOGY STACK', vi: 'CÔNG NGHỆ SỬ DỤNG' },
        'projects.gitBtn': { en: 'Explore Source on GitHub', vi: 'Xem mã nguồn trên GitHub' },

        // CHAPTER 05 — ACHIEVEMENTS / THE PROOF OF PROGRESS
        'awards.eyebrow': { en: '04 · Achievements', vi: '04 · Thành tích' },
        'awards.title': { en: 'Memorable Milestones', vi: 'Những cột mốc đáng nhớ' },
        'awards.subtitle': {
            en: 'Five competitive benchmarks across national STEM research, algorithmic programming, and physics olympiads.',
            vi: 'Năm dấu mốc khẳng định nỗ lực bền bỉ qua các kỳ thi nghiên cứu KHKT quốc gia, lập trình thuật toán và Olympic Vật lý.'
        },

        // CHAPTER 06 — CONTACT / THE NEXT CONNECTION
        'contact.eyebrow': { en: '05 · Connect', vi: '05 · Kết nối' },
        'contact.statement': {
            en: 'LET\'S BUILD <span class="editorial-serif">Something</span> MEANINGFUL.',
            vi: 'LET\'S BUILD <span class="editorial-serif">Something</span> MEANINGFUL.'
        },
        'contact.title': {
            en: 'Let\'s build <em class="accent-highlight not-italic">useful things together.</em>',
            vi: 'Cùng xây những <em class="accent-highlight not-italic">điều có ích.</em>'
        },
        'contact.desc': {
            en: 'If you have ideas about hardware, AI, or robotics, I am always open to discuss.',
            vi: 'Nếu bạn có ý tưởng về hardware, AI hoặc robotics, tôi luôn sẵn lòng trao đổi.'
        },
        'contact.facebookName': { en: 'Phuc Lam', vi: 'Phúc Lâm' },
        'contact.copyEmail': { en: 'Copy Email', vi: 'Sao chép Email' },
        'contact.copied': { en: 'Copied to clipboard!', vi: 'Đã sao chép!' },

        // FOOTER
        'footer.tagline': { en: 'Systems Thinking', vi: 'Tư duy hệ thống' },
        'footer.desc': {
            en: 'Designed with precision & a spirit of exploration.',
            vi: 'Thiết kế với sự chỉn chu & tinh thần khám phá.'
        },
        'footer.backTop': { en: 'RETURN TO ORIGIN ↑', vi: 'VỀ ĐIỂM KHỞI ĐẦU ↑' }
    }
};

