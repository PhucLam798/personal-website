# general.md — Tổng quan chi tiết trang Portfolio "Tạ Phúc Lâm"

Tài liệu mô tả toàn bộ nội dung, cấu trúc hiển thị và các hiệu ứng (animation / tương tác) của website, dựa trên việc đọc trực tiếp mã nguồn (`index.html`, `styles.css`, `script.js`).

---

## 1. Tổng quan dự án

| Mục | Chi tiết |
|---|---|
| Loại site | Portfolio cá nhân một trang (single page, cuộn dọc) |
| Chủ sở hữu | Tạ Phúc Lâm — sinh viên ĐH Khoa học Tự nhiên, ĐHQG-HCM (Điện tử – Viễn thông, chuyên ngành Máy tính & Hệ thống nhúng) |
| Chủ đề nội dung | Embedded, Edge AI, Robotics, AIoT, "tư duy hệ thống" |
| Ngôn ngữ giao diện | Song ngữ Việt (mặc định) / Anh, chuyển ngay không tải lại trang |
| Theme | Sáng (mặc định) / Tối, chuyển bằng nút |
| Công nghệ | HTML thuần + CSS tự viết + Tailwind CSS qua CDN (Play CDN) + JavaScript thuần (không framework, không bundler) |
| Font | Plus Jakarta Sans (body), Space Grotesk (heading/display), JetBrains Mono (nhãn/code) — Google Fonts |
| Build / server | Không có. Mở `index.html` trực tiếp hoặc qua Live Server |

### Cấu trúc thư mục

```
web - Copy/
├── index.html      (642 dòng)  Toàn bộ markup tĩnh của trang
├── styles.css      (1112 dòng) CSS tuỳ chỉnh: biến màu, animation, light theme, responsive
├── script.js       (846 dòng)  Toàn bộ logic: canvas, hiệu ứng, i18n, theme, lightbox
├── images/
│   ├── bee.jpg     Ảnh chân dung (avatar ở hero)
│   ├── if.jpg      Ảnh "Infinite Builds" (mục INFINITE Studio)
│   └── seas.jpg    Logo SEAS (mục trại hè SEAS)
└── .vscode/launch.json   Cấu hình debug VS Code
```

### Vai trò từng file

- **index.html**: khung trang, tất cả section, các thuộc tính `data-i18n` / `data-i18n-html` để gắn bản dịch, các class animation (`reveal`, `stagger-container`, …). Hai section **Dự án** và **Thành tích** để trống (`#projectGrid`, `#awardsList`) và được JS đổ dữ liệu vào.
- **styles.css**: biến màu `:root`, hiệu ứng nền, thẻ kính (glass), toàn bộ `@keyframes`, bộ quy tắc ghi đè cho `body.theme-light`, media query mobile, `prefers-reduced-motion`.
- **script.js**: một khối `DOMContentLoaded` duy nhất chứa mọi module khởi tạo (xem mục 6).

---

## 2. Cấu trúc trang (từ trên xuống)

Thứ tự DOM trong `<body class="theme-light">`:

1. `<canvas id="ai-network">` — nền mạng hạt (fixed, toàn màn hình)
2. `.orb.orb-1`, `.orb.orb-2` — hai quầng sáng mờ ở góc
3. `<header>` — thanh điều hướng cố định
4. `<main>` gồm các section:
   - `#home` Hero
   - `#about` Tư duy hệ thống + Học vấn + Năng lực kỹ thuật
   - `#activities` Dấu ấn (timeline)
   - `#publications` Nghiên cứu & Công bố
   - `#projects` Dự án (render bằng JS)
   - `#awards` Thành tích (render bằng JS)
   - `#contact` Kết nối
   - `<footer>`
   - `#imageModal` Lightbox xem ảnh phóng to
5. `<script src="script.js">`

Layout chung: mỗi section bọc trong `max-w-6xl mx-auto px-6` (rộng tối đa ~1152px), padding dọc `py-16 md:py-24`. `main` có `pt-24` để tránh bị header che.

---

## 3. Nội dung chi tiết từng phần

### 3.1 Header (cố định, `z-50`)
- **Logo**: ô vuông bo góc chữ "PL" (gradient cyan) + tên "Tạ Phúc Lâm" (đổi thành "Ta Phuc Lam" khi sang EN). Link về `#home`.
- **Menu desktop** (`md:` trở lên): Trang chủ · Tư duy hệ thống · Dấu ấn · Công bố · Ý tưởng · Thành tích · Liên hệ — trỏ tới `#home, #about, #activities, #publications, #projects, #awards, #contact`.
- **Nút ngôn ngữ** `EN | VI` (nút đang chọn có nền cyan + viền + glow).
- **Nút theme** (icon mặt trăng / mặt trời, chỉ hiện một icon tại một thời điểm).
- **Nút hamburger** (chỉ mobile) mở `#mobileNav`: danh sách link dọc + nút "Theme: Light ☀️ / Dark 🌙".
- Nền kính mờ (`backdrop-blur-xl`), viền dưới cyan, đổ bóng cyan.

### 3.2 Hero — `#home`
Lưới 2 cột (`md:grid-cols-2`), min-height 85vh.

**Cột trái (chữ):**
- Eyebrow: gạch ngang + "PORTFOLIO 2026"
- `h1`: **TẠ PHÚC LÂM** (chữ gradient trắng→cyan, class `shimmer-text`)
- Phụ đề: "Theo đuổi tư duy hệ thống"
- Đoạn mô tả có viền trái cyan: giao thoa giữa Embedded, Edge AI, Robotics, AIoT
- 2 nút: **Khám phá dự án** (primary, `#projects`, có mũi tên) và **Liên hệ hợp tác** (outline, `#contact`)
- Hàng pill từ khoá: `AIoT`, `Edge AI`, `Robotics`, `Embedded` (mỗi pill có chấm sáng)
- Một đường kẻ trang trí dọc (`.tech-deco-line`) ở mép trái

**Cột phải (avatar tương tác, `#avatarContainer`, 380×380px):**
- Ảnh tròn `images/bee.jpg` (280px), viền cyan + glow. Nếu ảnh lỗi → hiện fallback chữ "PL".
- Hai vòng quỹ đạo: `orbit-1` (nét đứt, 350px) và `orbit-2` (nét chấm, 430px, xoay ngược).
- `orbit-system` (350px) xoay quanh avatar, mang **4 icon tròn** ở 4 hướng: AI & Neural Network (trên), Embedded Hardware (phải), Robotics (dưới), Edge AI & Sensors (trái). Tooltip qua `title`.
- `glow-ring`: quầng sáng radial phía sau.
- Dòng chữ `[ System Swarm Initiated ]` ẩn, chỉ hiện khi hover.
- `title` của avatar: "Rê chuột để kích hoạt bão dữ liệu Swarm".

### 3.3 Section 01 — Tư duy hệ thống (`#about`)
Gồm 3 khối:

1. **Tiêu đề section**: eyebrow "01 · CÂU CHUYỆN & TƯ DUY HỆ THỐNG" + `h2` "Tư duy hệ thống".
2. **Lưới 2 thẻ kính**:
   - *Tư duy hệ thống*: icon chip vi mạch, đoạn văn về biến bài toán đời thực thành hệ thống kỹ thuật hoàn chỉnh (cảm biến → mạch → nhúng → AI → điều khiển thời gian thực); 4 pill: AI on Edge, Embedded Systems, Robotics & AIoT, Real-time Control.
   - *Hành trình học tập* (timeline dọc có chấm sáng):
     - 2026 — Hiện tại: ĐH Khoa học Tự nhiên, ĐHQG-HCM — Kỹ thuật Điện tử – Viễn thông, chuyên ngành Máy tính và Hệ thống nhúng.
     - 2023 — 2026: THPT Chuyên Lê Quý Đôn, Quảng Trị — Lớp Chuyên Vật lý, Chủ nhiệm CLB STEM.
3. **Năng lực kỹ thuật** — 3 thẻ (lưới `md:grid-cols-3`), mỗi thẻ có **một khung hoạt ảnh SVG** ở trên, icon + tiêu đề, mô tả và tag:

| Thẻ | Nhãn khung viz | Màu viz | Nội dung | Tag |
|---|---|---|---|---|
| Lập trình | `ALGO_GRAPH // C++ & PYTHON` | xanh dương (mặc định) | Cấu trúc dữ liệu, giải thuật, phần mềm hiệu năng cao cho nhúng | Python, C / C++, IDE, Git/GitHub |
| AI & Machine Learning | `NEURAL_TENSOR // CV · LLM · DL` | xanh lá (`viz-green`) | Huấn luyện, tinh chỉnh, triển khai ML/DL/LLM/CV | ML, DL, LLM, CV, Optimize |
| Hệ thống & Phần cứng | `MCU_PCB // PID & EMBEDDED` | cam (`viz-orange`) | Thiết kế mạch, vi điều khiển, cảm biến, điều khiển phản hồi | Embedded Systems, PCB, PID Control |

### 3.4 Section 02 — Dấu ấn (`#activities`)
Ba thẻ "timeline-row-card" xếp dọc, mỗi thẻ có cột thời gian (trái) + nội dung (phải):

1. **INFINITE Studio** — 2026 → Hiện tại, trạng thái "Đang làm việc" (pill xanh ngọc).
   Vai trò *Software Engineer Intern · Web Systems & Workflow Automation*. Thiết kế/phát triển hệ thống vận hành nội bộ end-to-end, tự động hoá quy trình (nhận hàng, xử lý dữ liệu, luân chuyển đơn). Có khung "studio-spotlight": ảnh `if.jpg` (bấm phóng to) + tiêu đề "Xây dựng Hệ thống Vận hành Thương mại" + chấm nhấp nháy `animate-pulse` "Workflow Systems".
2. **SEAS (Summer in Engineering and Applied Sciences)** — 07/2026 → 08/2026, "Đã hoàn thành".
   Thành viên (được chọn 40/400 ứng viên toàn quốc). Logo `seas.jpg` (bấm phóng to). Dự án trọng điểm: *Phân loại bệnh lá trên cây lúa dành cho nông dân* (nút "Xem dự án" → `seas-cvn.com/home`). Hai gạch đầu dòng: chương trình AI 2 tuần dựa trên giáo trình CS bậc đại học của MIT; làm việc cùng cử nhân/NCS từ Harvard, MIT, MBZUAI, CERN, NUS, Stony Brook, Ericsson Research, VinAI…
3. **Học bổng Tinh hoa Công nghệ (ĐH FPT)** — 07/07/2026, pill "Học bổng" (xanh dương).
   Tài trợ 100% học phí + sinh hoạt phí + cơ hội nghiên cứu. Ghi chú định hướng: đã chọn học tại ĐH Khoa học Tự nhiên ĐHQG-HCM.

### 3.5 Nghiên cứu & Công bố (`#publications`)
Lưới 12 cột: thẻ nổi bật (7 cột) + thẻ tiến độ (5 cột).
- **Thẻ bài báo**: badge `CORE Rank B`, `Vai trò: Tác giả chính (First Author)`, `Trạng thái: Đang bình duyệt` (có chấm nhịp đập). Tiêu đề: *The Latent Language of Vietnamese Prompts: Where and When Do LLMs Translate Back?* — hội nghị **ICAART 2027** (International Conference on Agents and Artificial Intelligence). Tác giả: Lam Phuc Ta¹˒⁴ (in đậm), Hoai Trong Le²˒⁴ và Luan Thanh Nguyen³. Có 2 góc khung trang trí (L-bracket) **mở rộng khi hover**.
- **Thẻ "Hội nghị, tạp chí"**: trạng thái đang thực hiện, ghi chú "Bản thảo đang hoàn thành", 2 ô "slot" (Hội nghị / Tạp chí: đang chuẩn bị) với chấm xanh dương & tím nhấp nháy lệch pha.

### 3.6 Section 03 — Dự án (`#projects`)
Tiêu đề "Một số dự án nổi bật" + link `GitHub @PhucLam798` (khoảng cách mũi tên tăng khi hover). Lưới 1/2/3 cột; **thẻ được JS tạo ra** từ mảng `projects` (6 dự án), mỗi thẻ có số thứ tự `#01…`, nhãn loại, tiêu đề, mô tả, tag, nút GitHub:

| # | Loại | Tên | Công nghệ |
|---|---|---|---|
| 01 | Dự án nhóm | Gaze-Controlled Computer (YOLOv8 + hồi quy đa thức, điều khiển con trỏ bằng ánh nhìn) | YOLOv8, OpenCV, Python, Linear, Polynomial |
| 02 | Nghiên cứu | FoG Parkinson Detection (thiết bị đeo IoT, MLP dự đoán FoG, cảnh báo < 1,2 s) | AIoT, MLP, Embedded |
| 03 | Cá nhân | Autonomous Sidewalk Robot (CV lập bản đồ vỉa hè + PID) | YOLOv8-Seg, PID, CV, BEV |
| 04 | Cá nhân | Headmouse Hardware (Arduino, MPU6050, nhấp bằng chớp mắt) | Arduino, MPU6050, ATmega32u4 |
| 05 | Cá nhân | Headmouse Software (webcam, mũi → con trỏ, MediaPipe) | MediaPipe, Python, CV |
| 06 | Dự án nhóm | Fine-Tuned LLM Chat (tinh chỉnh LLM, ký tự rời rạc → câu hoàn chỉnh) | LoRA, LLM |

Mô tả và nhãn loại có cả bản VI và EN trong dữ liệu.

### 3.7 Section 04 — Thành tích (`#awards`)
Lưới 2 cột; thẻ do JS tạo từ mảng `awards` (5 mục). Mỗi thẻ có "huy hiệu" vuông (vàng mặc định, `silver`, `bronze`) + tiêu đề + ghi chú dạng terminal `> … _`:

| Huy hiệu | Thành tích | Ghi chú |
|---|---|---|
| 04 | Giải Tư · Nghiên cứu Khoa học Kỹ thuật Việt Nam (VISEF) | Cuộc thi STEM |
| 03 (bronze) | Giải Ba · Chung kết Tin học Trẻ Toàn quốc | Lập trình & CNTT |
| BR (bronze) | Huy chương Đồng · Olympic HSGS, ĐHQG Hà Nội | Olympic Vật lý |
| 01 | Giải Nhất · Vòng Khu vực miền Trung Tin học Trẻ | Lập trình & CNTT |
| 50 (silver) | Top 50 Toàn quốc · Samsung Solve for Tomorrow | Cuộc thi STEM |

### 3.8 Section 05 — Kết nối (`#contact`)
Một panel kính lớn 2 cột. Trái: tiêu đề "Cùng xây những *điều có ích.*" + lời mời trao đổi về hardware, AI, robotics. Phải: 3 link dạng thẻ có icon — **Email** `taphuclamab@gmail.com` (mailto), **GitHub** `@PhucLam798`, **Facebook** "Phúc Lâm".

### 3.9 Footer
`© <năm hiện tại tự cập nhật bằng JS> TẠ PHÚC LÂM · Tư duy hệ thống` và bên phải "Thiết kế với sự chỉn chu & tinh thần khám phá. ⚡ PRECISION".

### 3.10 Lightbox ảnh (`#imageModal`)
Lớp phủ đen mờ toàn màn hình, ảnh phóng to + chú thích + nút đóng (X). Mở khi bấm vào bất kỳ ảnh có class `previewable-img` (avatar, ảnh Infinite, logo SEAS).

---

## 4. Hệ thống thiết kế (Design system)

### Màu & biến CSS (`:root`)
- Nền tối `--bg-main #050b14`, thẻ `--bg-card rgba(11,18,36,.8)`.
- Màu nhấn: cyan `#00c8ff` (chính), cyan đậm `#0284c7`, xanh dương `#3b82f6`, tím `#a855f7`, san hô `#fb7185`, teal `#2dd4bf`.
- Viền `rgba(0,200,255,.18)` → hover `.65`; bóng thẻ `--shadow-card` / `--shadow-hover`.
- Light theme ghi đè biến này trong `body.theme-light` (nền `#f8fafc`, chữ `#0f172a`, accent `#0284c7`) và còn rất nhiều quy tắc `!important` riêng cho từng component.

### Thành phần dùng lại
`.glass` (nền kính + blur 20px) · `.tech-box` (thẻ có viền, hover nâng + glow) · `.cyber-border` · `.eyebrow` · `.section-title` (gradient chữ) · `.btn-primary` / `.btn-outline` · `.skill-pill` / `.tag-badge` / `.key-pill` / `.hero-key-pill` · `.time-badge` / `.time-status-pill` (3 biến thể: verified / edit-ready / in-dev) · `.award-medal` (gold/silver/bronze) · `.contact-link` · `.git-center-btn`.

### Responsive
- Tailwind breakpoints (`sm/md/lg`) quyết định số cột lưới, ẩn/hiện menu.
- `@media (max-width: 768px)` thu nhỏ avatar (310/230px), quỹ đạo, icon orbit (38px).

---

## 5. Danh mục Animation & hiệu ứng

### 5.1 Hiệu ứng nền (luôn chạy)

| Hiệu ứng | Cách làm | Chi tiết |
|---|---|---|
| **Body fade-in** | CSS `@keyframes bodyFadeIn` | `opacity 0→1` trong 0.8s khi tải trang |
| **Mạng hạt AI (canvas)** | JS `requestAnimationFrame` | Hạt chuyển động + nối đường khi gần nhau; xem 5.2 |
| **Orb trôi** | `@keyframes orbFloat` | 2 quầng blur 140px, di chuyển ±(40,−30)px, chu kỳ 8s và 10s (`alternate` / `alternate-reverse`), vô hạn |
| **Cuộn mượt** | `html { scroll-behavior: smooth }` | Link neo `#…` cuộn mềm |

### 5.2 Canvas mạng hạt (`initCanvasAINetwork`)
- Số hạt = `(rộng × cao) / 10000` (phụ thuộc kích thước cửa sổ); tạo lại khi `resize`.
- Mỗi hạt: vị trí ngẫu nhiên, vận tốc ngẫu nhiên, bán kính 0.6–2.2px. ~20% hạt "sáng" có `shadowBlur` 10.
- Hạt về lại vị trí gốc (`baseX/baseY`, lực kéo 0.01) trong khi điểm gốc **trôi ngẫu nhiên** → chuyển động hữu cơ.
- **Đẩy khỏi chuột**: hạt trong bán kính 120px của con trỏ bị đẩy ra theo lực tỉ lệ khoảng cách.
- **Nối đường**: hai hạt cách nhau < √20000 ≈ 141px được nối, độ trong suốt giảm dần theo khoảng cách (độ phức tạp O(n²)).
- **Chế độ "Swarm" (bão dữ liệu)**: hover avatar **600ms** → `isSwarming = true`. Hạt bị hút về quỹ đạo bán kính ~180px quanh tâm avatar (kéo vào nếu xa, đẩy ra nếu < 145px), cộng lực tiếp tuyến để **xoay vòng**, giới hạn tốc độ 7. Rời chuột → huỷ ngay. Tâm được cập nhật khi cuộn/resize.
- Đổi theme: `window.updateCanvasTheme()` gán lại màu hạt (sáng: `#0284c7/#38bdf8`, tối: `#00c8ff/#dff3ff`), màu đường nối đổi theo.
- CSS canvas: `mix-blend-mode: screen` ở theme tối, `multiply` + `opacity .45` ở theme sáng.

### 5.3 Hero & Avatar

| Hiệu ứng | Trigger | Chi tiết |
|---|---|---|
| Vào cảnh hero | Cuộn/tải (IntersectionObserver) | `hero-title/sub/meta/buttons` trượt lên 24px + fade 0.75s; `avatar-animate` phóng từ scale 0.94→1 |
| Quỹ đạo xoay | Liên tục | `orbit-system` xoay 22s tuyến tính; `orbit-2` xoay ngược 38s (`spin-slow`) |
| Icon giữ thẳng đứng | Liên tục | `counter-spin` quay −360° cùng chu kỳ 22s để icon không bị nghiêng khi quỹ đạo xoay |
| Dừng xoay | Hover avatar | `animation-play-state: paused` cho cả `orbit-system` và icon |
| Avatar nâng + sáng | Hover | `translateY(-8px)`, glow 60px, viền sáng hơn (cubic-bezier(.16,1,.3,1), 0.35s) |
| Glow ring phóng to | Hover | `scale(1.15)`, opacity .85 |
| Icon orbit | Hover icon | `scale(1.18)`, viền & chữ trắng, glow mạnh (theme sáng: nền xanh, chữ trắng) |
| Chữ `[ System Swarm Initiated ]` | Hover avatar | `opacity 0→1` trong 0.7s |
| Ảnh avatar | — | `transition duration-700` (Tailwind) |
| Nút | Hover | primary: nền trắng + glow + nâng 2px; outline: nền cyan nhạt + glow |
| Pill từ khoá | Hover | nâng 2px, glow, chữ trắng |

### 5.4 Cuộn trang — Scroll reveal (IntersectionObserver)
- Observer (`threshold 0.08`, `rootMargin: 0 0 -40px 0`) gắn lớp `visible` **và** `is-visible` cho phần tử khi vào khung nhìn (không gỡ lại → chạy một lần).
- Danh sách selector được theo dõi: `.header-animate, .hero-title, .hero-sub, .hero-meta, .hero-buttons, .avatar-animate, .section-title-animate, .stagger-container, .contact-animate, .footer-animate, .reveal`.
- **Trạng thái ẩn ban đầu**: `opacity 0; translateY(24px)`; riêng `.header-animate` bắt đầu từ `translateY(-24px)` (trượt xuống), `.avatar-animate` bắt đầu `scale(.94)`.
- **Stagger**: con trực tiếp của `.stagger-container` ẩn (`opacity 0; translateY(24px)`) rồi hiện lần lượt khi container `.visible`, **trễ 0.08s, 0.16s … 0.48s cho 6 phần tử đầu** (từ phần tử thứ 7 không có delay riêng).
- **Dự phòng**: `revealVisibleElements()` chạy ở 200ms sau DOMContentLoaded, 100ms sau `load`, và sau mỗi `hashchange` — đảm bảo phần tử đang trong viewport luôn hiện dù observer chưa kịp kích hoạt (ví dụ khi bấm link neo).
- Sau khi render dự án/thành tích (đổi ngôn ngữ), `initScrollAnimations()` ngắt observer cũ và tạo lại để quan sát các thẻ `.reveal` mới.

### 5.5 Thẻ (card) hover
- `.tech-box`: nâng `translateY(-8px)`, nền sáng hơn, viền cyan 0.65, đổ bóng + glow; `will-change: transform, box-shadow`.
- `.timeline-row-card`, `.award-item`: nâng 6px + glow.
- **Glow theo chuột (`initTechBoxesGlow`)**: JS chèn `div.glow-bg` vào đầu mỗi `.tech-box`, đo vị trí chuột trong thẻ ghi vào biến CSS `--mouse-x/--mouse-y`; `radial-gradient(400px)` bám theo con trỏ (hiện khi hover, fade 0.25s). Nội dung con được đẩy lên `z-index: 2` để nằm trên lớp glow.
- `.seas-logo-wrap` phóng 1.05 khi hover; `.studio-img-wrap` sáng viền; ảnh Infinite `hover:scale-105` (0.5s).
- Link "GitHub @PhucLam798": khoảng cách giữa chữ và mũi tên tăng `hover:gap-3`.
- Nút GitHub của thẻ dự án: đổi nền cyan + glow, icon phóng 1.1, nâng 2px.
- Thẻ bài báo nổi bật: 2 góc khung (14px) **nở ra 26px** khi hover.

### 5.6 Hoạt ảnh năng lực kỹ thuật (3 khung SVG)
Nền khung: lưới ô vuông 22px + nền xanh đậm; nhãn mono ở góc trái trên; viền đổi màu theo `--viz` khi hover thẻ. JS (`initSkillVisuals`) dựng SVG cho khung 2 và 3; khung 1 viết tay trong HTML.

1. **ALGO_GRAPH (Lập trình)** — đồ thị 9 nút, 18 cạnh.
   - Cạnh: nét đứt chạy (`vizEdgeFlow`, 3s).
   - `.graph-trace`: một đoạn sáng dài 18% chạy dọc đường đi qua các nút (`vizTraceRun`, 3.2s) — gợi ý thuật toán duyệt/tìm đường.
   - Nút "ping" (`vizNodePing`): phóng 1.6× rồi về, **trễ khác nhau từng nút** (`--d`) để khớp thứ tự đường chạy.
2. **NEURAL_TENSOR (AI & ML)** — mạng nơ-ron 4 lớp (3-5-4-2 nút), tạo bằng JS.
   - Toạ độ lớp: x = 70/135/200/260; các nút căn giữa theo trục dọc.
   - Cạnh nền mờ (opacity thay đổi theo công thức) nối mọi cặp nút giữa các lớp liền kề.
   - **Xung** (`neural-pulses`): ~1/3 số cạnh có đoạn sáng chạy (`vizPulseRun`, 2.8s), trễ tăng dần theo lớp (`li*0.9s`) → xung lan truyền từ đầu vào đến đầu ra (forward pass).
   - Nút ping cùng chu kỳ 2.8s.
3. **MCU_PCB (Hệ thống & Phần cứng)** — sóng xung vuông và **đáp ứng PID**.
   - Sóng vuông: chu kỳ 160px, lặp 4 lần (nét liền). Đáp ứng PID: đường nét đứt mờ hơn, có **vọt lố nhẹ rồi bám điểm đặt** (đường cong Bézier `C`/`S`).
   - Lưới dạng đứt; `wave-track` cuộn ngang −160px / 4s (vòng lặp liền mạch vì 4 chu kỳ) → cảm giác oscilloscope.
   - `wave-scan`: vạch quét mảnh chạy ngang 0→320px / 3s.

**Nghiêng 3D (tilt)**: `.skill-tilt` đặt `perspective: 1000px`. Khi rê chuột trong `.skill-card`, JS tính vị trí tương đối (−0.5…0.5) → `--rx/--ry` tối đa ±8°; thẻ `rotateX/rotateY + translateY(-8px)`, transition 0.12s cho cảm giác bám chuột; rời chuột trả về 0°. **Chỉ bật** khi thiết bị có `hover: hover` và `pointer: fine` (loại bỏ cảm ứng) **và** người dùng không bật `prefers-reduced-motion`.

### 5.7 Công bố
`pubDotPulse` (1.8s): chấm trạng thái phát vòng sáng lan (box-shadow 0→5px, trong suốt dần). Chấm tím trễ 0.9s để lệch pha với chấm xanh.

### 5.8 Điều hướng
- **Scroll-spy**: mỗi lần cuộn, xác định section chứa `scrollY + 140`; link menu tương ứng đổi màu cyan (theme tối thêm `text-shadow` glow), các link khác trở về màu thường. Màu tính trong JS theo theme.
- **Menu mobile**: bấm hamburger → `max-height` từ 0 lên `scrollHeight` (trượt mở, transition 300ms); bấm link thì tự đóng.
- Header trượt xuống khi tải (`header-animate`).

### 5.9 Chuyển theme & ngôn ngữ
- Theme: `transition: background-color .35s, color .35s` trên `body`; canvas đổi `mix-blend-mode`/opacity có transition 0.4s; sau khi đổi, phát sự kiện `scroll` để scroll-spy cập nhật lại màu link.
- Đổi ngôn ngữ cập nhật DOM tức thì (không animation riêng), nhưng danh sách dự án/thành tích được render lại nên các thẻ chạy lại reveal.

### 5.10 Lightbox
`opacity` mờ dần 300ms (`transition-opacity duration-300`), khoá cuộn nền (`body overflow: hidden`) khi mở; đóng bằng nút X, bấm nền, hoặc phím `Esc`.

### 5.11 Giảm chuyển động (`prefers-reduced-motion: reduce`)
Tắt animation của các khung `.skill-viz` và chấm `.pub-dot`, ẩn xung nơ-ron, tắt hiệu ứng nghiêng 3D (chỉ còn nâng 8px). **Các animation khác (orb, orbit avatar, canvas, reveal, fade-in) không bị tắt** bởi media query này.

---

## 6. Logic JavaScript (`script.js`)

Tất cả nằm trong `document.addEventListener('DOMContentLoaded', …)`.

| Khối | Chức năng |
|---|---|
| `initCanvasAINetwork()` | Canvas hạt, tương tác chuột, chế độ Swarm, fallback ảnh avatar lỗi (`avatar-image-missing`) |
| `initTechBoxesGlow()` | Chèn `.glow-bg`, theo dõi chuột cho mọi `.tech-box`; gọi lại sau khi render động (có kiểm tra tránh chèn trùng) |
| `initSkillVisuals()` | Dựng SVG neural & wave, gắn tilt 3D cho `.skill-card` |
| `projects[]`, `awards[]` | Dữ liệu 2 section động, mỗi mục có bản VI và EN |
| `renderProjectsAndAwards(lang)` | Tạo HTML thẻ bằng template string → gán vào `#projectGrid`, `#awardsList`; rồi gọi lại `initTechBoxesGlow()` + `initScrollAnimations()` |
| `initScrollAnimations()` | IntersectionObserver cho các class reveal |
| `revealVisibleElements()` | Cơ chế dự phòng hiển thị phần tử đang trong viewport |
| Menu mobile | Toggle `max-height` |
| Scroll-spy | Highlight link menu theo vị trí cuộn |
| `translations{}` | Từ điển VI/EN cho toàn bộ chuỗi tĩnh (khoá dạng `nav.home`, `hero.title`, `act.seas.b1`, …) |
| `switchLang(lang)` | Cập nhật `<html lang>`, trạng thái nút EN/VI, mọi `[data-i18n]` (textContent, hoặc innerHTML nếu chuỗi chứa `<`), `[data-i18n-html]`, rồi render lại dự án/thành tích |
| `applyTheme(theme)` | Thêm/bớt `theme-light`/`theme-dark` trên `body`, đổi icon, chữ nút mobile, gọi `updateCanvasTheme()` |
| Footer | Gán năm hiện tại vào `#year` |
| Lightbox | `openImageModal` / `closeImageModal`, sự kiện click ảnh `.previewable-img`, phím `Esc` |

**Lưu trữ trạng thái**: ngôn ngữ và theme lưu trong `sessionStorage` (khoá `preferred-lang`, `preferred-theme`) — chỉ giữ trong phiên tab. Mã còn chủ động xoá khoá cũ trong `localStorage`, nên **mỗi lần mở trang mới luôn là Tiếng Việt + theme Sáng**. Mọi thao tác storage bọc `try/catch`.

**Chỉnh sửa nội dung**: chuỗi tĩnh sửa ở `translations` (JS) — và nhớ HTML cũng chứa bản VI làm mặc định; dự án/thành tích sửa trực tiếp trong mảng `projects` / `awards`.

---

## 7. Phụ thuộc bên ngoài

- `cdn.tailwindcss.com` (Tailwind Play CDN — chạy JIT trong trình duyệt, đủ cho dev nhưng không khuyến nghị cho production vì tăng thời gian tải và phụ thuộc mạng).
- Google Fonts (preconnect sẵn).
- Liên kết ngoài: GitHub `PhucLam798/*`, `seas-cvn.com`, Facebook, email.
- Không có thư viện JS nào khác.

---

## 8. Ghi chú kỹ thuật quan sát được

Những điểm dưới đây rút ra từ việc đọc mã, **chưa kiểm chứng trên trình duyệt**:

1. **Hover nâng thẻ có thể bị vô hiệu cho một số thẻ.** `.stagger-container.visible > *` (và `.reveal.visible`) đặt `transform: translateY(0)` và nằm sau `.tech-box:hover` trong `styles.css` với độ ưu tiên ngang nhau, nên với các thẻ là con trực tiếp của container stagger hoặc có `.reveal` (thẻ about, timeline, publications, dự án, thành tích) thì `translateY(-8px)` khi hover có thể không hiện (glow/viền/bóng vẫn đổi). Thẻ kỹ năng không bị vì có `.tech-box.skill-card:hover` ưu tiên cao hơn và nằm trong wrapper `.skill-tilt`.
2. Cùng nguyên nhân: rule `transition` của `.stagger-container > *` (0.55s) ghi đè `transition` của `.tech-box`, và `transition-delay` 0.08–0.48s của stagger còn giữ lại, nên hover của 6 phần tử đầu có thể bị trễ.
3. **`prefers-reduced-motion`** chỉ tắt một phần hiệu ứng (xem 5.11); canvas, orb, quỹ đạo avatar vẫn chạy.
4. **Canvas** tính khoảng cách mọi cặp hạt mỗi frame (O(n²)) và đọc `classList` trong vòng lặp; trên màn hình lớn có thể tốn CPU. Không tạm dừng khi tab ẩn ngoài cơ chế mặc định của `requestAnimationFrame`.
5. **`viz-blue`** không có style riêng; khung kỹ năng đầu dùng màu mặc định `--viz: #38bdf8`.
6. Link dự án *Headmouse Software* trỏ tới repo `Headmouse-Sorfware` (đúng như URL trong dữ liệu — có vẻ đánh vần là "Sorfware" nên kiểm tra lại tên repo).
7. Nút "Xem dự án" của SEAS có `title` ghi "…trên GitHub" nhưng link đi tới `seas-cvn.com`.
8. Phần Hero có `.hero-keys` là 4 pill tĩnh (không i18n), cũng như tag/skill pill — các chuỗi này giữ nguyên ở cả hai ngôn ngữ.
