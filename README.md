# Tạ Phúc Lâm — Cinematic Interactive Personal Portfolio (2026)

**Concept:** *THE JOURNEY OF A SYSTEM THINKER*  
**Domains:** Embedded Systems · Edge AI · Robotics · AIoT · LLM Research

---

## 1. Kiến trúc Dự án (Project Structure)

```text
web - Copy/
├── index.html          # Giới thiệu (con đường 3D) → Nghiên cứu → Dự án → Cột mốc → Thành tích → Liên hệ
├── styles.css          # Theme tối/sáng, typography, các trang giới thiệu, thẻ và hiệu ứng hiện dần
├── js/
│   ├── data.js         # Dữ liệu song ngữ VI/EN: bản dịch, 6 dự án, 5 thành tích, chu trình 5 bước
│   ├── road-intro.js   # Phần giới thiệu ghim theo cuộn: hạt → hồi quy tuyến tính → con đường lưới 3D, các trang nội dung hiện từng ô
│   ├── skill-viz.js    # Hình động trên 3 thẻ kỹ năng: cây nhị phân + sắp xếp, mạng MLP, đáp ứng PID + xung PWM
│   ├── after-space.js  # Không gian 3D phía sau lỗ sâu: hành lang đảo ngược (sàn + trần), cổng lục giác và khối hình học xoay trước mỗi phần
│   ├── chapters.js     # Vẽ thẻ dự án, khung xem README, lưới thành tích 2 hàng, hiệu ứng hiện từng thẻ khi cuộn tới
│   ├── main.js         # Khởi tạo, preloader, đa ngôn ngữ, theme, con trỏ, HUD, lightbox
│   ├── motion-path.js  # (Không còn được nạp) đường chạy xuyên trang cũ
│   └── visuals.js      # (Không còn được nạp) hình động SVG cũ của dự án / bài báo / kỹ năng
├── script.js           # Bridge file mô tả kiến trúc module
└── images/             # bee.jpg (chân dung), if.jpg, seas.jpg
```

---

## 2. Các phần của trang

- **00 — GIỚI THIỆU (`#home`)**: phần ghim theo cuộn (~19 màn hình) trên nền con đường lưới 3D đang chạy. Lần lượt: câu mở đầu → biểu đồ hồi quy tuyến tính (bình phương tối thiểu, tính thật từ dữ liệu) → con đường hiện ra → trang *Tư duy hệ thống* (bên trái) + ảnh và tên (bên phải) → *Đào tạo & Nền tảng* (2 trường) → chu trình 5 bước (một đường tín hiệu với 5 nút) → 3 nhánh kỹ năng → không gian bẻ cong dần thành lỗ sâu, camera nghiêng xuống và lao qua cổ lỗ sâu để sang phần Nghiên cứu. Mỗi trang hiện tiêu đề trước rồi từng ô. Thời điểm từng trang: `data-ri-from` / `data-ri-to` trong `index.html`; thời điểm của biểu đồ và mặt đường: hằng `T` trong `js/road-intro.js`.
- **01 — NGHIÊN CỨU (`#publications`)**: bài “Do LLMs Think in English When Prompted in Vietnamese?” gửi tạp chí quốc tế Neural Networks, hạng Q1 (một hàng) và các bản thảo tạp chí/hội nghị đang hoàn thiện (một hàng).
- **02 — DỰ ÁN (`#projects`)**: 6 thẻ dự án dạng lưới. Bấm vào thẻ sẽ mở một khung nhỏ hiển thị README của repo (lấy qua GitHub API). Khung chỉ có README: các link trỏ vào file code trong repo bị gỡ, ảnh được nạp từ raw.githubusercontent.com.
- **03 — CỘT MỐC (`#activities`)**: INFINITE Studio, SEAS 2026, Học bổng Tinh hoa Công nghệ, mỗi mục một hàng trên dòng thời gian dọc.
- **04 — THÀNH TÍCH (`#awards`)**: 5 giải thưởng xếp thành 2 hàng (3 + 2).
- **05 — LIÊN HỆ (`#contact`)**: Email, GitHub, Facebook.

**Điện thoại:** phần giới thiệu có bố cục riêng cho màn hình hẹp (< 768px) và màn hình thấp (xoay ngang), số hạt và độ phân giải canvas được giảm trên thiết bị cảm ứng, hiệu ứng làm mờ được tắt, màu thanh địa chỉ đổi theo theme. Đã kiểm tra các cỡ 360×640, 375×667, 390×844, 412×915 và 844×390.

**Sau lỗ sâu:** camera chui ra lộn ngược rồi xoay thẳng lại, đi vào một hành lang có lưới sàn và lưới trần phản chiếu nhau. Trước mỗi phần có một đoạn trống (`.warp-gap`) để bay xuyên qua một cổng lục giác, bên trong là một khối 3D riêng: khối 20 mặt (Nghiên cứu), siêu lập phương 4 chiều (Dự án), chuỗi xoắn kép (Cột mốc), ngôi sao tứ diện (Thành tích), hình xuyến (Liên hệ). Khi nội dung chiếm màn hình, cổng và khối mờ đi.

Mọi phần tử có `data-reveal` sẽ dựng đứng dậy từ mặt sàn (xoay quanh cạnh dưới, mờ → rõ) khi cuộn tới, rồi nghiêng nhẹ theo con trỏ trên máy tính; các thẻ xuất hiện cùng lúc sẽ hiện lần lượt.

## 3. Hướng dẫn Chạy Website (How to Run)

Dự án được thiết kế để chạy trực tiếp trên mọi trình duyệt hiện đại mà không cần bước build phức tạp:

### Cách 1: Chạy qua Local HTTP Server (Khuyến nghị)
Sử dụng Python hoặc VS Code Live Server:
```bash
python3 -m http.server 8080
```
Sau đó mở trình duyệt tại địa chỉ: `http://localhost:8080`

### Cách 2: Mở trực tiếp file `index.html`
Nhấp đúp vào file `index.html` trong thư mục dự án (toàn bộ các module trong `js/` sử dụng namespace `window.TPL` tương thích hoàn toàn với cả giao thức `file://` và `http://`).

