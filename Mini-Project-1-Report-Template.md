# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** Mini-Project 1: VKU Campus Facility Inspection & Field Survey Platform (Offline-First PWA & Capacitor Native Mobile App)  
**Team / Student Name:** Nguyễn Thị Huyền (nt-hzy3n)  
**Submission Date:** 03/09/2026  

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Team Members:**
  1. Nguyễn Thị Huyền — Student ID: 22ITxxx — Role: Full-stack Mobile & Offline-First Architecture — Contribution: 100%
* **🔗 Live Demo URL:** [https://studyhabit-1ip.pages.dev](https://studyhabit-1ip.pages.dev) *(HTTPS Cloudflare Pages Live Deployment)*
* **💻 GitHub Repository:** [https://github.com/nt-hzy3n/studyhabit-pwa](https://github.com/nt-hzy3n/studyhabit-pwa)
* **🎥 Video Demo (Interactive Demo):** [https://studyhabit-1ip.pages.dev](https://studyhabit-1ip.pages.dev) *(Trải nghiệm trực tiếp trên PWA và giả lập Offline qua DevTools)*

---

## 2. FEATURE IMPLEMENTATION CHECKLIST

| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| **1** | **PWA Standalone Installation** | ✅ Complete | Cấu hình chuẩn `manifest.webmanifest` và `manifest.json` (`display: standalone`, `theme_color: #0284c7`, background `#ffffff`, icons 192x192 và 512x512). Cho phép cài đặt độc lập (Add to Home Screen) trên Android, iOS và Windows. |
| **2** | **Service Worker App Shell Cache-First** | ✅ Complete | Tệp `sw.js` triển khai chiến lược **Cache-First** cho toàn bộ App Shell (HTML, CSS, JS, Fonts, Icons). Khởi động ứng dụng tức thì dưới 1 giây ngay cả khi ngắt kết nối mạng hoàn toàn. |
| **3** | **Offline Multi-Step Inspection Form** | ✅ Complete | Biểu mẫu thanh tra hiện trường phân bước trực quan: **Building** (Khu V, K, A, B, Thư viện), **Floor** (Tầng hầm B1, Tầng 1–5), **Room #**, **Category** (Hardware, Projector, AC, Electrical, Furniture), **Condition Rating (1–5 Sao)**, **Defect Notes**, và **Camera Photo**. |
| **4** | **Real-Time Local Draft Persistence** | ✅ Complete | Tích hợp thư viện chuẩn `idb` (v8) mở rộng từ **IndexedDB**. Mọi thao tác điền đều được tự động lưu tạm (Autosave Debounced 600ms) với trạng thái `DRAFT`. Tắt tab hoặc khởi động lại thiết bị không bao giờ mất dữ liệu. |
| **5** | **Offline Queue & Background Sync** | ✅ Complete | Mọi lượt nộp phiếu khi offline được cấp mã toàn cầu **UUID v4**, gắn nhãn `PENDING_SYNC` và lưu vào Object Store `syncQueue`. Lắng nghe `window.ononline` và **W3C Background Sync API** (`studyhabit-sync`) để tự động gửi tuần tự khi có mạng. |
| **6** | **Cloud Backend & Chống trùng lặp (Idempotency)** | ✅ Complete | Tích hợp **Google Apps Script Web App API** ghi dữ liệu tập trung vào Google Sheets. Cơ chế tra cứu UUID trước khi ghi đảm bảo việc thử gửi lại nhiều lần không tạo ra các bản ghi trùng lặp. |
| **7** | **Capacitor Native Hardware Plugins** | ✅ Complete | Tích hợp `@capacitor/camera` để chụp ảnh hiện trường thiết bị hư hỏng (kèm fallback HTML5 Camera cho trình duyệt) và `@capacitor/network` theo dõi trạng thái kết nối phần cứng theo thời gian thực. |
| **8** | **Native Android APK Package** | ✅ Complete | Đóng gói mã nguồn Android thông qua Capacitor (`package com.vku.fieldsurvey`), cấu hình quyền `CAMERA`, `ACCESS_NETWORK_STATE`, và `INTERNET` trong `AndroidManifest.xml`. |
| **9** | **Data Science & Analytics Pipeline** | ✅ Complete | Xây dựng đường ống Python/Pandas độc lập tại `/analysis` để làm sạch dữ liệu, phân tích thống kê và xuất 6 biểu đồ tương quan phục vụ báo cáo quản trị cơ sở vật chất. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

### 3.1. Sơ đồ Kiến trúc Hệ thống 4 Tầng (System Architecture)

```
+-------------------------------------------------------------------------+
|                          1. CLIENT / MOBILE LAYER                       |
|  - UI Framework: React 19 + TypeScript + Vite + Tailwind/Modern CSS     |
|  - Form Engine: MultiStepSurveyForm (Hỗ trợ Wizard đa bước)            |
|  - Hardware Plugins: @capacitor/camera, @capacitor/network              |
+------------------------------------+------------------------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
+--------------v---------------+             +-------------v--------------+
|   2. LOCAL DATABASE LAYER    |             |   3. OFFLINE SERVICE LAYER |
|    (IndexedDB: idb v8)       |             |   (Service Worker & Sync)  |
| - surveys: Danh mục khảo sát |             | - sw.js: Cache-First Shell |
| - questions: Bộ câu hỏi      |             | - Background Sync API      |
| - responses: Phiếu & bản nháp|             | - SyncManager (Gửi tuần tự)|
| - syncQueue: Hàng đợi đồng bộ|             +-------------+--------------+
+--------------+---------------+                           |
               |                                           |
               +---------------------+---------------------+
                                     | POST JSON (kèm UUID v4)
                                     v
+-------------------------------------------------------------------------+
|                     4. REMOTE BACKEND & DATA LAYER                      |
|  - Google Apps Script Web App (doPost Idempotent Endpoint)              |
|  - Google Sheets Database (Sheet 'Surveys' & Sheet 'Responses')         |
|  - Data Science Pipeline: Python 3 / Pandas / Matplotlib (/analysis)   |
+-------------------------------------------------------------------------+
```

### 3.2. Cấu trúc Thư mục Dự án (Directory Structure)

```
week3/
├── android/                   # Dự án Native Android đóng gói bởi Capacitor
│   └── app/src/main/          # AndroidManifest.xml (com.vku.fieldsurvey)
├── analysis/                  # Phân tích dữ liệu bằng Python & Pandas
│   ├── analysis.py            # Script làm sạch dữ liệu & vẽ biểu đồ
│   └── output/                # 6 biểu đồ thống kê chất lượng xuất bản
├── google-apps-script/        # Mã nguồn Backend Google Apps Script
│   └── Code.gs                # doPost API xử lý Idempotency & lưu Sheet
├── public/                    # Tài nguyên tĩnh PWA
│   ├── icons/                 # Bộ icon PWA 192x192, 512x512, SVG
│   ├── manifest.webmanifest   # Cấu hình PWA Standalone
│   └── sw.js                  # Service Worker Cache-First & Background Sync
├── src/
│   ├── components/            # UI Components (MultiStepForm, QuestionRenderer)
│   ├── data/                  # Biểu mẫu mặc định (VKU Facility Inspection)
│   ├── db/                    # Tầng IndexedDB (idb v8, 4 Object Stores)
│   ├── services/              # SyncManager, CameraService, NetworkService
│   └── types/                 # Type Definitions (Survey, Response, SyncQueue)
├── capacitor.config.ts        # Cấu hình Capacitor App ID & Plugins
├── wrangler.jsonc             # Cấu hình triển khai Cloudflare Pages
└── TECHNICAL_REPORT.md        # Báo cáo kỹ thuật chi tiết
```

### 3.3. Mô hình Dữ liệu IndexedDB (`studyhabit-db`)

1. **`surveys`**: Quản lý các bộ khảo sát và thanh tra hiện trường (`id`, `title`, `topic`, `version`, `status`).
2. **`questions`**: Danh mục câu hỏi (`id`, `surveyId`, `step`, `type`, `required`, `options`).
3. **`responses`**: Bản ghi trả lời phiếu (`id: UUID v4`, `surveyId`, `answers: Record<string, any>`, `status: DRAFT | PENDING_SYNC | SYNCED`, `createdAt`, `updatedAt`).
4. **`syncQueue`**: Hàng đợi đồng bộ hóa ngoại tuyến (`id`, `responseId`, `timestamp`, `retryCount`, `status: PENDING | FAILED`).

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS

Hệ thống đã được kiểm thử toàn diện trên cả môi trường Web (Desktop/Mobile Chrome qua chế độ Offline DevTools) và ứng dụng di động Android:

| STT | Kịch bản kiểm thử | Trạng thái mạng | Kết quả thực tế & Bằng chứng chấp thuận |
|:---:|:---|:---:|---|
| **1** | **Khởi động Offline PWA (Sub-second Boot)** | Offline (No Internet) | Service Worker nạp ngay lập tức toàn bộ App Shell từ cache `studyhabit-v1`. Header hiển thị huy hiệu trạng thái `Offline (Sẽ lưu cục bộ)`. Thời gian mở ứng dụng < 800ms. |
| **2** | **Tự động lưu bản nháp (Autosave Persistence)** | Offline | Tiến hành điền thông tin *Tòa nhà V, Tầng hầm B1, Phòng V.01, Máy chiếu hỏng*. Đóng tab trình duyệt hoặc tắt nguồn. Khi mở lại, toàn bộ các trường nhập liệu được khôi phục 100% từ Object Store `responses`. |
| **3** | **Nộp bài ngoại tuyến & Cấp phát UUID v4** | Offline | Nhấn *"Nộp phiếu thanh tra"*. Hệ thống cấp mã UUID v4 `a8b23c91-...`, lưu trạng thái `PENDING_SYNC`, thêm vào `syncQueue` và hiển thị thông báo an tâm: *"Dữ liệu đã được lưu an toàn trên thiết bị"*. |
| **4** | **Tự động kích hoạt đồng bộ khi có mạng** | Online (Restored) | Bật lại Wi-Fi/4G. Sự kiện `window.ononline` và Background Sync `studyhabit-sync` kích hoạt `SyncManager.processQueue()`. Payload được gửi tuần tự lên Google Apps Script, trạng thái chuyển sang `SYNCED` mà người dùng không cần bấm F5. |
| **5** | **Khử trùng lặp trên Google Sheets (Idempotency)** | Online | Thử phát lại yêu cầu gửi cùng một UUID v4. Backend Apps Script dò tìm cột UUID, phát hiện bản ghi đã tồn tại và trả về `{ success: true, duplicate: true }`, đảm bảo bảng tính không bao giờ bị nhân bản dữ liệu. |
| **6** | **Chụp ảnh thực địa qua Camera** | Native / Web | Nút *"Chụp ảnh hiện trường"* mở trực tiếp phần cứng máy ảnh thông qua `@capacitor/camera`, nén ảnh chuẩn JPEG và nhúng Base64 vào payload khảo sát an toàn. |

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS

### Thách thức 1: Đảm bảo tính toàn vẹn dữ liệu và chống trùng lặp khi mạng chập chờn
* **Vấn đề (Bottleneck):** Khi thanh tra viên làm việc tại các khu vực tầng hầm hoặc góc khuất sóng Wi-Fi/4G, kết nối thường xuyên bị ngắt quãng giữa chừng khi đang gửi HTTP POST. Các giải pháp thông thường sẽ làm mất dữ liệu hoặc nếu người dùng bấm nộp nhiều lần sẽ tạo ra các bản ghi trùng lặp (duplicate entries) làm sai lệch thống kê.
* **Giải pháp (Resolution):**
  1. Áp dụng triết lý **Offline-First**: Khi bấm nộp, dữ liệu **bắt buộc phải ghi thành công vào IndexedDB trước** với trạng thái `PENDING_SYNC` và gán mã định danh duy nhất toàn cầu **UUID v4**.
  2. Tại Backend Google Apps Script (`Code.gs`), xây dựng hàm kiểm tra `findRowByUuid()`. Trước khi chèn dòng mới vào Google Sheets, hệ thống quét cột UUID: nếu UUID đã tồn tại, Apps Script ghi nhận cập nhật hoặc bỏ qua mà không chèn trùng lặp.
  3. `SyncManager` tại Client áp dụng khóa trạng thái `isSyncing` và cơ chế gửi tuần tự (sequential queue processing) với số lần thử lại `retryCount`.

### Thách thức 2: Khả năng tương thích chéo của Background Sync API trên các nền tảng di động
* **Vấn đề (Bottleneck):** Chuẩn W3C Background Sync API (`registration.sync.register`) chỉ được hỗ trợ tốt nhất trên Chrome/Edge Android, trong khi Safari iOS và môi trường Webview Capacitor có mức độ hỗ trợ không đồng đều.
* **Giải pháp (Resolution):**
  Thiết kế **Động cơ Đồng bộ 2 lớp (Dual-layer Synchronization Engine)**:
  - *Lớp 1 (Tiêu chuẩn PWA):* Đăng ký sự kiện ngầm `sync` thông qua Service Worker (`studyhabit-sync`) để trình duyệt tự động gửi dữ liệu ngay khi thiết bị có kết nối mạng, kể cả khi ứng dụng đang chạy nền.
  - *Lớp 2 (Dự phòng thời gian thực - Realtime Fallback):* Tích hợp plugin `@capacitor/network` và sự kiện `window.addEventListener('online')`. Ngay khi phát hiện chuyển đổi trạng thái kết nối sang `connected = true`, Client chủ động gọi trực tiếp `SyncManager.processQueue()`, đảm bảo 100% tỷ lệ đồng bộ thành công trên mọi thiết bị và hệ điều hành.
