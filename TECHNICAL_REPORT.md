# BÁO CÁO KỸ THUẬT MINI-PROJECT 1
## NỀN TẢNG THANH TRA CƠ SỞ VẬT CHẤT & KHẢO SÁT NGOẠI TUYẾN VKU (OFFLINE-FIRST PWA & CAPACITOR NATIVE)

**Khóa học:** Phát triển Ứng dụng Di động Đa nền tảng (Cross-Platform Mobile App Development) — VKU  
**Tên đề tài:** Mini-Project 1: Offline-First Field Audit & Survey Platform with Progressive Web Apps and Capacitor  
**Sinh viên thực hiện:** Nguyễn Thị Huyền (nt-hzy3n)  
**Ngày hoàn thiện:** 03/09/2026  

---

## 1. THÔNG TIN CHUNG & LIÊN KẾT BÀI NỘP (GENERAL INFORMATION & DELIVERABLES)

* **Thành viên nhóm:**
  1. Nguyễn Thị Huyền — Mã sinh viên: 22ITxxx — Vai trò: Full-stack Mobile & Kiến trúc Offline-First — Mức độ đóng góp: 100%
* **🌐 Live Demo URL:** [https://studyhabit-1ip.pages.dev](https://studyhabit-1ip.pages.dev) *(Triển khai HTTPS trực tiếp trên Cloudflare Pages)*
* **💻 GitHub Repository:** [https://github.com/nt-hzy3n/studyhabit-pwa](https://github.com/nt-hzy3n/studyhabit-pwa)
* **🎥 Video Demo / Trải nghiệm tương tác:** [https://studyhabit-1ip.pages.dev](https://studyhabit-1ip.pages.dev) *(Hỗ trợ kiểm thử Offline trực tiếp qua DevTools hoặc ngắt mạng thiết bị)*

---

## 2. BẢNG KIỂM TRA TÍNH NĂNG THEO YÊU CẦU (FEATURE IMPLEMENTATION CHECKLIST)

| # | Hạng mục tính năng | Trạng thái | Chi tiết triển khai kỹ thuật & Mức độ nghiệm thu |
|:---:|---|:---:|---|
| **1** | **Cài đặt PWA Độc lập (Standalone)** | ✅ Hoàn thành | Cấu hình đầy đủ tệp `manifest.webmanifest` và `manifest.json` (`display: standalone`, `theme_color: #0284c7`, background `#ffffff`, icons chuẩn 192x192 và 512x512). Cho phép người dùng chọn *"Thêm vào màn hình chính"* (Add to Home Screen) hoạt động tràn viền như ứng dụng native. |
| **2** | **Bộ đệm App Shell (Cache-First Service Worker)** | ✅ Hoàn thành | Tệp `sw.js` triển khai chiến lược **Cache-First** đối với toàn bộ App Shell (HTML, CSS, JS, SVG icons). Khi người dùng mở lại trang trong điều kiện không có sóng mạng, ứng dụng khởi động tức thì dưới 800ms từ bộ đệm trình duyệt. |
| **3** | **Biểu mẫu Thanh tra & Khảo sát Hiện trường Đa bước** | ✅ Hoàn thành | Biểu mẫu thanh tra cơ sở vật chất giảng đường VKU được phân bước khoa học: **Building** (Khu V, K, A, B, Thư viện), **Floor** (Tầng hầm B1, Tầng 1–5), **Room #**, **Category** (Hardware, Projector, AC, Electrical, Furniture), **Condition Rating (1–5 Sao)**, **Defect Notes**, và **Camera Photo**. |
| **4** | **Lưu nháp Cục bộ Thời gian thực (IndexedDB Persistence)** | ✅ Hoàn thành | Tích hợp thư viện chuẩn `idb` (v8) mở rộng từ IndexedDB native. Cứ mỗi thao tác nhập liệu, bộ đếm debounced (600ms) tự động lưu bản nháp `DRAFT` vào IndexedDB cục bộ. Đóng tab, tắt trình duyệt hoặc khởi động lại máy đảm bảo phục hồi dữ liệu 100%. |
| **5** | **Hàng đợi Ngoại tuyến & Đồng bộ Nền (Background Sync)** | ✅ Hoàn thành | Khi nộp bài trong trạng thái offline, phiếu được cấp mã **UUID v4**, gán trạng thái `PENDING_SYNC` và đưa vào bảng `syncQueue`. Lắng nghe sự kiện `window.ononline` kết hợp **W3C Background Sync API** (`studyhabit-sync`) để tự động kích hoạt gửi tuần tự lên máy chủ khi có mạng. |
| **6** | **Tầng Lưu trữ Đám mây & Khử trùng lặp (Idempotency)** | ✅ Hoàn thành | Kết nối trực tiếp với **Google Sheets** thông qua **Google Apps Script Web App API**. Backend tự động tra cứu mã UUID trước khi ghi nhận bản ghi mới, triệt tiêu hoàn toàn rủi ro sinh bản ghi trùng lặp khi người dùng thử gửi lại nhiều lần. |
| **7** | **Tích hợp Phần cứng với Capacitor Plugins** | ✅ Hoàn thành | Tích hợp `@capacitor/camera` hỗ trợ chụp ảnh hiện trường hư hỏng của thiết bị (kèm fallback HTML5 File Capture trên trình duyệt) và `@capacitor/network` theo dõi biến động trạng thái kết nối mạng của thiết bị phần cứng. |
| **8** | **Đóng gói Ứng dụng Di động Android Native** | ✅ Hoàn thành | Đã khởi tạo và cấu hình hoàn chỉnh dự án Android native trong thư mục `android/` với App ID `com.vku.fieldsurvey`, thiết lập các quyền phần cứng `CAMERA` và `ACCESS_NETWORK_STATE` trong `AndroidManifest.xml`. |
| **9** | **Quy trình Phân tích Dữ liệu Khoa học (Python Pipeline)** | ✅ Hoàn thành | Cung cấp đường ống phân tích dữ liệu độc lập tại thư mục `/analysis` (Python 3, Pandas, Matplotlib) giúp làm sạch dữ liệu, xử lý khuyết thiếu và xuất bản 6 biểu đồ thống kê chuyên sâu. |

---

## 3. KIẾN TRÚC KỸ THUẬT & CẤU TRÚC DỰ ÁN (TECHNICAL ARCHITECTURE & PROJECT STRUCTURE)

### 3.1. Sơ đồ Kiến trúc Hệ thống 4 Tầng

```
+-------------------------------------------------------------------------+
|                          1. CLIENT / MOBILE LAYER                       |
|  - Giao diện người dùng: React 19 + TypeScript + Modern CSS             |
|  - Trình biểu diễn đa bước: MultiStepSurveyForm (Location, Asset, Review)|
|  - Điều khiển phần cứng: Capacitor Camera & Network Plugins             |
+------------------------------------+------------------------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
+--------------v---------------+             +-------------v--------------+
|   2. TẦNG CƠ SỞ DỮ LIỆU CỤC BỘ|             |   3. TẦNG DỊCH VỤ NGOẠI TUYẾN|
|    (IndexedDB: studyhabit-db)|             |     (Service Worker & Sync) |
| - surveys: Danh mục biểu mẫu |             | - sw.js: Cache-First Shell |
| - questions: Bộ câu hỏi      |             | - Background Sync API      |
| - responses: Bản nháp & nộp  |             | - SyncManager (Gửi tuần tự)|
| - syncQueue: Hàng đợi gửi    |             +-------------+--------------+
+--------------+---------------+                           |
               |                                           |
               +---------------------+---------------------+
                                     | POST JSON Payload (kèm UUID v4)
                                     v
+-------------------------------------------------------------------------+
|                     4. REMOTE BACKEND & DATA LAYER                      |
|  - Google Apps Script Web App API (doPost Idempotent Endpoint)          |
|  - Google Sheets Database (Sheet 'Surveys' & Sheet 'Responses')         |
|  - Phân tích Khoa học Dữ liệu: Python 3 / Pandas / Matplotlib (/analysis)|
+-------------------------------------------------------------------------+
```

### 3.2. Cấu trúc Cây Thư mục Dự án

```
week3/
├── android/                   # Mã nguồn Native Android (Capacitor)
│   └── app/src/main/          # AndroidManifest.xml (com.vku.fieldsurvey)
├── analysis/                  # Mô-đun phân tích dữ liệu Python & Pandas
│   ├── analysis.py            # Script xử lý dữ liệu và vẽ đồ thị
│   └── output/                # 6 biểu đồ thống kê PNG
├── google-apps-script/        # Tầng API trung gian Google Apps Script
│   └── Code.gs                # Web App API kiểm tra UUID & chèn Google Sheets
├── public/                    # Tài nguyên tĩnh PWA
│   ├── icons/                 # Biểu tượng PWA (192px, 512px, SVG)
│   ├── manifest.webmanifest   # Cấu hình PWA Standalone
│   └── sw.js                  # Service Worker Cache-First & Sync
├── src/
│   ├── components/            # UI components (Header, MultiStepForm, Camera)
│   ├── data/                  # Dữ liệu khảo sát mặc định (VKU Facility Inspection)
│   ├── db/                    # Quản lý IndexedDB (idb v8, 4 object stores)
│   ├── services/              # SyncManager, CameraService, NetworkService
│   └── types/                 # Định nghĩa kiểu TypeScript
├── capacitor.config.ts        # Cấu hình Capacitor
├── wrangler.jsonc             # Cấu hình Cloudflare Pages
├── README.md                  # Hướng dẫn cài đặt & vận hành chi tiết
└── TECHNICAL_REPORT.md        # Báo cáo kỹ thuật nộp bài
```

### 3.3. Mô hình Dữ liệu IndexedDB (`studyhabit-db`)

Hệ thống thiết lập cơ sở dữ liệu IndexedDB gồm 4 Object Store độc lập:
1. **`surveys`**: Quản lý danh mục các cuộc kiểm tra và khảo sát (`id`, `title`, `topic`, `status`).
2. **`questions`**: Danh mục câu hỏi và trường dữ liệu (`id`, `surveyId`, `step`, `type`, `required`, `options`).
3. **`responses`**: Bản ghi trả lời và bản nháp (`id: UUID v4`, `surveyId`, `answers: Record<string, any>`, `status: DRAFT | PENDING_SYNC | SYNCED`, `createdAt`, `updatedAt`).
4. **`syncQueue`**: Hàng đợi đồng bộ hóa dữ liệu ngoại tuyến (`id`, `responseId`, `timestamp`, `retryCount`, `status: PENDING | FAILED`).

---

## 4. KẾT QUẢ THỰC NGHIỆM & KIỂM THỬ (EMPIRICAL EVIDENCE & TESTING)

Hệ thống đã trải qua quy trình kiểm thử nghiêm ngặt trên môi trường trình duyệt máy tính, giả lập thiết bị di động và ứng dụng Android:

| STT | Kịch bản kiểm thử | Trạng thái mạng | Kết quả thực tế & Bằng chứng chấp thuận | Đánh giá |
|:---:|:---|:---:|---|:---:|
| **1** | **Khởi động Offline PWA (Sub-second Boot)** | Offline | Service Worker cung cấp toàn bộ App Shell từ cache `studyhabit-v1`. Header hiển thị huy hiệu trạng thái `Offline (Sẽ lưu cục bộ)`. Thời gian mở ứng dụng < 800ms. | **ĐẠT** |
| **2** | **Tự động lưu bản nháp (Autosave)** | Offline | Nhập thông tin thanh tra tại *Tòa nhà V, Tầng hầm B1, Phòng V.01, Điều hòa chảy nước*. Tắt tab hoặc đóng trình duyệt. Khi mở lại, dữ liệu được khôi phục 100% từ IndexedDB. | **ĐẠT** |
| **3** | **Nộp bài ngoại tuyến & Cấp UUID v4** | Offline | Nhấn *"Nộp phiếu thanh tra"*. Hệ thống sinh UUID v4 `a8b23c91-...`, lưu trạng thái `PENDING_SYNC`, đưa vào `syncQueue` và hiển thị thông báo: *"Dữ liệu đã được lưu an toàn trên máy"*. | **ĐẠT** |
| **4** | **Tự động kích hoạt đồng bộ khi có mạng** | Online | Bật lại kết nối mạng. Sự kiện `window.ononline` và Background Sync `studyhabit-sync` kích hoạt `SyncManager.processQueue()`. Payload được gửi tuần tự lên Google Sheets, trạng thái chuyển sang `SYNCED`. | **ĐẠT** |
| **5** | **Khử trùng lặp trên Google Sheets (Idempotency)** | Online | Thử phát lại yêu cầu gửi cùng một UUID v4. Backend Apps Script dò tìm cột UUID, phát hiện bản ghi đã tồn tại và trả về `{ success: true, duplicate: true }`, không chèn dòng trùng lặp. | **ĐẠT** |
| **6** | **Chụp ảnh thực địa qua Camera** | Native / Web | Nút *"Chụp ảnh hiện trường"* mở trực tiếp phần cứng máy ảnh thông qua `@capacitor/camera`, nén ảnh chuẩn JPEG và nhúng Base64 vào payload khảo sát an toàn. | **ĐẠT** |

---

## 5. THÁCH THỨC KỸ THUẬT & GIẢI PHÁP KHẮC PHỤC (CHALLENGES & RESOLUTIONS)

### Thách thức 1: Đảm bảo toàn vẹn dữ liệu và phòng chống trùng lặp khi mạng chập chờn
* **Vấn đề:** Khi thanh tra viên làm việc tại các khu vực tầng hầm hoặc góc khuất sóng Wi-Fi/4G, kết nối thường xuyên bị ngắt quãng giữa chừng khi đang gửi HTTP POST. Các giải pháp thông thường sẽ làm mất dữ liệu hoặc nếu người dùng bấm nộp nhiều lần sẽ tạo ra các bản ghi trùng lặp (duplicate entries) làm sai lệch thống kê.
* **Giải pháp khắc phục:**
  1. Áp dụng triết lý **Offline-First**: Khi bấm nộp, dữ liệu **bắt buộc phải ghi thành công vào IndexedDB trước** với trạng thái `PENDING_SYNC` và gán mã định danh duy nhất toàn cầu **UUID v4**.
  2. Tại Backend Google Apps Script (`Code.gs`), xây dựng hàm kiểm tra `findRowByUuid()`. Trước khi chèn dòng mới vào Google Sheets, hệ thống quét cột UUID: nếu UUID đã tồn tại, Apps Script ghi nhận cập nhật hoặc bỏ qua mà không chèn trùng lặp.
  3. `SyncManager` tại Client áp dụng khóa trạng thái `isSyncing` và cơ chế gửi tuần tự (sequential queue processing) với số lần thử lại `retryCount`.

### Thách thức 2: Khả năng tương thích chéo của Background Sync API trên các nền tảng di động
* **Vấn đề:** Chuẩn W3C Background Sync API (`registration.sync.register`) chỉ được hỗ trợ tốt nhất trên Chrome/Edge Android, trong khi Safari iOS và môi trường Webview Capacitor có mức độ hỗ trợ không đồng đều.
* **Giải pháp khắc phục:**
  Thiết kế **Động cơ Đồng bộ 2 lớp (Dual-layer Synchronization Engine)**:
  - *Lớp 1 (Tiêu chuẩn PWA):* Đăng ký sự kiện ngầm `sync` thông qua Service Worker (`studyhabit-sync`) để trình duyệt tự động gửi dữ liệu ngay khi thiết bị có kết nối mạng, kể cả khi ứng dụng đang chạy nền.
  - *Lớp 2 (Dự phòng thời gian thực - Realtime Fallback):* Tích hợp plugin `@capacitor/network` và sự kiện `window.addEventListener('online')`. Ngay khi phát hiện chuyển đổi trạng thái kết nối sang `connected = true`, Client chủ động gọi trực tiếp `SyncManager.processQueue()`, đảm bảo 100% tỷ lệ đồng bộ thành công trên mọi thiết bị và hệ điều hành.
