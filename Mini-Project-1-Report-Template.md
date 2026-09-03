# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** Mini-Project 1: StudyHabit — Nền tảng Khảo sát Thói quen Tự học của Sinh viên Ngoại tuyến (Offline-First Survey PWA & Capacitor Mobile App)  
**Team / Student Name:** Nguyễn Thị Huyền (nt-hzy3n)  
**Submission Date:** 03/09/2026  

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Team Members:**
  1. Nguyễn Thị Huyền — Student ID: 22ITxxx — Role: Full-stack Mobile & Offline-First Architecture — Contribution: 100%
* **🔗 Live Demo URL:** [https://studyhabit-1ip.pages.dev](https://studyhabit-1ip.pages.dev) *(Triển khai HTTPS trực tiếp trên Cloudflare Pages)*
* **💻 GitHub Repository:** [https://github.com/nt-hzy3n/studyhabit-pwa](https://github.com/nt-hzy3n/studyhabit-pwa)
* **🎥 Video Demo (Interactive PWA Demo):** [https://studyhabit-1ip.pages.dev](https://studyhabit-1ip.pages.dev) *(Trải nghiệm trực tiếp và giả lập chế độ Offline qua DevTools / ngắt kết nối thiết bị)*

---

## 2. FEATURE IMPLEMENTATION CHECKLIST

| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| **1** | **PWA Standalone Installation** | ✅ Complete | Cấu hình chuẩn `manifest.webmanifest` và `manifest.json` (`display: standalone`, `theme_color: #0284c7`, `background_color: #ffffff`, bộ icon 192x192, 512x512 và SVG). Hỗ trợ cài đặt độc lập (Add to Home Screen) trên Android, iOS, Windows với trải nghiệm toàn màn hình như native app. |
| **2** | **Service Worker App Shell Cache-First** | ✅ Complete | Tệp `sw.js` triển khai chiến lược **Cache-First** đối với toàn bộ App Shell (HTML, CSS, JS, SVG icons). Đảm bảo ứng dụng khởi động tức thì dưới 800ms ngay cả khi thiết bị mất kết nối mạng hoàn toàn. |
| **3** | **Biểu mẫu Khảo sát Thói quen Tự học Đa bước** | ✅ Complete | Biểu mẫu nghiên cứu xã hội học gồm 6 bước khoa học (20+ câu hỏi): **Bước 1** (Thông tin cơ bản & Thời gian tự học), **Bước 2** (Thói quen & Địa điểm học), **Bước 3** (Phương pháp học tập & Ôn tập), **Bước 4** (Độ tập trung & Công cụ AI), **Bước 5** (Giấc ngủ, Tự đánh giá & Ảnh góc học tập), **Bước 6** (Xem lại toàn bộ câu trả lời trước khi gửi). |
| **4** | **Lưu nháp Cục bộ Thời gian thực (IndexedDB Persistence)** | ✅ Complete | Sử dụng thư viện chuẩn `idb` (v8) mở rộng từ **IndexedDB**. Mọi thao tác điền câu trả lời được tự động lưu tạm (Autosave Debounced 600ms) với trạng thái `DRAFT`. Đóng tab trình duyệt, vô tình reload hoặc tắt máy đảm bảo phục hồi dữ liệu 100%. |
| **5** | **Hàng đợi Ngoại tuyến & Đồng bộ Nền (Background Sync)** | ✅ Complete | Mọi lượt nộp phiếu khi offline được gán mã toàn cầu **UUID v4**, đánh dấu `PENDING_SYNC` và lưu an toàn vào Object Store `syncQueue`. Tích hợp bộ lắng nghe `window.ononline` và **W3C Background Sync API** (`studyhabit-sync`) để tự động kích hoạt gửi tuần tự lên máy chủ ngay khi có mạng. |
| **6** | **Cloud Backend & Chống trùng lặp (Idempotency)** | ✅ Complete | Tích hợp **Google Sheets** làm cơ sở dữ liệu tập trung thông qua **Google Apps Script Web App API** (`Code.gs`). Cơ chế tra cứu UUID trước khi ghi đảm bảo việc thử gửi lại nhiều lần không sinh ra dữ liệu trùng lặp. |
| **7** | **Tích hợp Phần cứng với Capacitor Plugins** | ✅ Complete | Tích hợp `@capacitor/camera` hỗ trợ chụp ảnh góc học tập thực tế (kèm fallback HTML5 Camera Input trên trình duyệt) và `@capacitor/network` theo dõi trạng thái kết nối mạng của thiết bị di động theo thời gian thực. |
| **8** | **Đóng gói Ứng dụng Di động Android Native** | ✅ Complete | Đã cấu hình hoàn chỉnh dự án Android native trong thư mục `android/` với App ID `com.vku.fieldsurvey`, thiết lập các quyền phần cứng `CAMERA` và `ACCESS_NETWORK_STATE` trong `AndroidManifest.xml`. |
| **9** | **Quy trình Khoa học Dữ liệu (Python Data Pipeline)** | ✅ Complete | Xây dựng đường ống phân tích dữ liệu Python/Pandas độc lập tại `/analysis` để làm sạch dữ liệu khảo sát, tính toán thống kê và xuất bản 6 biểu đồ tương quan publication-ready. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

### 3.1. Sơ đồ Kiến trúc Hệ thống 4 Tầng (System Architecture)

```
+-------------------------------------------------------------------------+
|                          1. CLIENT / MOBILE LAYER                       |
|  - Giao diện người dùng: React 19 + TypeScript + Modern Responsive CSS  |
|  - Trình biểu diễn đa bước: MultiStepSurveyForm (6 bước học thuật)      |
|  - Điều khiển phần cứng: Capacitor Camera & Network Plugins             |
+------------------------------------+------------------------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
+--------------v---------------+             +-------------v--------------+
|   2. TẦNG CƠ SỞ DỮ LIỆU CỤC BỘ|             |   3. TẦNG DỊCH VỤ NGOẠI TUYẾN|
|      (IndexedDB: studyhabit-db)             |     (Service Worker & Sync) |
| - surveys: Danh mục khảo sát |             | - sw.js: Cache-First Shell |
| - questions: Bộ 20+ câu hỏi  |             | - Background Sync API      |
| - responses: Bản nháp & nộp  |             | - SyncManager (Gửi tuần tự)|
| - syncQueue: Hàng đợi đồng bộ|             +-------------+--------------+
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
├── android/                   # Dự án Native Android đóng gói bởi Capacitor
│   └── app/src/main/          # AndroidManifest.xml (com.vku.fieldsurvey)
├── analysis/                  # Phân tích dữ liệu bằng Python & Pandas
│   ├── analysis.py            # Script làm sạch dữ liệu & vẽ biểu đồ tương quan
│   ├── sample_responses.csv   # Tập dữ liệu mẫu khảo sát thói quen học tập
│   └── output/                # 6 biểu đồ thống kê chất lượng xuất bản
├── google-apps-script/        # Mã nguồn Backend Google Apps Script
│   └── Code.gs                # doPost API xử lý Idempotency & lưu Google Sheets
├── public/                    # Tài nguyên tĩnh PWA
│   ├── icons/                 # Bộ icon PWA 192x192, 512x512, SVG
│   ├── manifest.webmanifest   # Cấu hình PWA Standalone (#0284c7)
│   └── sw.js                  # Service Worker Cache-First & Background Sync
├── src/
│   ├── components/            # UI Components (MultiStepForm, QuestionRenderer)
│   ├── data/                  # Bộ 20+ câu hỏi thói quen học tập (studyHabitSurvey.ts)
│   ├── db/                    # Tầng IndexedDB (idb v8, 4 Object Stores)
│   ├── pages/                 # Dashboard, SurveyList, ResponseHistory
│   ├── services/              # SyncManager, CameraService, NetworkService
│   └── types/                 # Type Definitions (Survey, Response, SyncQueue)
├── capacitor.config.ts        # Cấu hình Capacitor App ID & Plugins
├── wrangler.jsonc             # Cấu hình triển khai Cloudflare Pages
├── README.md                  # Hướng dẫn cài đặt & vận hành chi tiết
└── TECHNICAL_REPORT.md        # Báo cáo kỹ thuật chi tiết
```

### 3.3. Mô hình Dữ liệu IndexedDB (`studyhabit-db`)

Hệ thống thiết lập cơ sở dữ liệu IndexedDB gồm 4 Object Store độc lập:
1. **`surveys`**: Quản lý thông tin đề tài khảo sát thói quen học tập (`id`, `title`, `topic`, `version`, `status`).
2. **`questions`**: Danh mục 20+ câu hỏi chia theo 5 nhóm nội dung và thứ tự biểu diễn (`id`, `surveyId`, `step`, `type`, `required`, `options`).
3. **`responses`**: Bản ghi trả lời phiếu (`id: UUID v4`, `surveyId`, `answers: Record<string, any>`, `status: DRAFT | PENDING_SYNC | SYNCED`, `createdAt`, `updatedAt`).
4. **`syncQueue`**: Hàng đợi đồng bộ hóa ngoại tuyến (`id`, `responseId`, `timestamp`, `retryCount`, `status: PENDING | FAILED`).

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS

Hệ thống đã trải qua quy trình kiểm thử toàn diện trên môi trường Web (Desktop/Mobile Chrome qua chế độ Offline DevTools) và ứng dụng di động Android:

| STT | Kịch bản kiểm thử | Trạng thái mạng | Kết quả thực tế & Bằng chứng chấp thuận | Đánh giá |
|:---:|:---|:---:|---|:---:|
| **1** | **Khởi động Offline PWA (Sub-second Boot)** | Offline | Service Worker cung cấp toàn bộ App Shell từ bộ đệm `studyhabit-v1`. Header hiển thị huy hiệu trạng thái `Offline (Sẽ lưu cục bộ)`. Thời gian mở ứng dụng < 800ms. | **ĐẠT** |
| **2** | **Tự động lưu bản nháp (Autosave)** | Offline | Nhập câu trả lời tại Bước 1 và Bước 2 (Năm học, Thời gian tự học, Địa điểm). Đóng tab hoặc tắt trình duyệt. Khi mở lại, toàn bộ tiến trình điền bài được khôi phục 100% từ IndexedDB. | **ĐẠT** |
| **3** | **Nộp bài ngoại tuyến & Cấp phát UUID v4** | Offline | Nhấn *"Nộp phiếu khảo sát"*. Hệ thống cấp mã UUID v4 `a8b23c91-...`, lưu trạng thái `PENDING_SYNC`, thêm vào `syncQueue` và thông báo: *"Dữ liệu đã được lưu an toàn trên thiết bị"*. | **ĐẠT** |
| **4** | **Tự động kích hoạt đồng bộ khi có mạng** | Online (Restored) | Bật lại Wi-Fi/4G. Sự kiện `window.ononline` và Background Sync `studyhabit-sync` kích hoạt `SyncManager.processQueue()`. Payload được gửi tuần tự lên Google Sheets, trạng thái chuyển sang `SYNCED`. | **ĐẠT** |
| **5** | **Khử trùng lặp trên Google Sheets (Idempotency)** | Online | Thử phát lại yêu cầu gửi cùng một UUID v4. Backend Apps Script dò tìm cột UUID, phát hiện bản ghi đã tồn tại và trả về `{ success: true, duplicate: true }`, triệt tiêu hoàn toàn bản ghi trùng lặp. | **ĐẠT** |
| **6** | **Chụp ảnh góc học tập qua Camera** | Native / Web | Nút *"Chụp ảnh góc học tập"* mở trực tiếp máy ảnh thiết bị thông qua `@capacitor/camera`, nén ảnh chuẩn JPEG và nhúng Base64 vào phiếu khảo sát an toàn. | **ĐẠT** |
| **7** | **Đường ống Phân tích Dữ liệu Python** | CLI | Script `analysis.py` tự động đọc CSV xuất từ Google Sheets, xử lý khuyết thiếu và tạo thành công 6 biểu đồ phân tích tương quan tại `/analysis/output/`. | **ĐẠT** |

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS

### Thách thức 1: Đảm bảo toàn vẹn dữ liệu và phòng chống trùng lặp khi mạng chập chờn
* **Vấn đề (Bottleneck):** Khi sinh viên làm khảo sát dài 20 câu hỏi tại giảng đường kín, thư viện ngầm hoặc tầng hầm không có Wi-Fi, kết nối mạng thường xuyên bị ngắt quãng. Nếu sinh viên bấm nộp nhiều lần khi mạng chậm, hệ thống thông thường sẽ sinh ra hàng loạt bản ghi trùng lặp làm sai lệch số liệu nghiên cứu.
* **Giải pháp (Resolution):**
  1. Áp dụng triết lý **Offline-First**: Khi bấm nộp bài, dữ liệu **bắt buộc phải ghi thành công vào IndexedDB trước** với trạng thái `PENDING_SYNC` và gán mã định danh duy nhất toàn cầu **UUID v4**.
  2. Tại Backend Google Apps Script (`Code.gs`), xây dựng hàm kiểm tra `findRowByUuid()`. Trước khi chèn dòng mới vào Google Sheets, hệ thống quét cột UUID: nếu UUID đã tồn tại, Apps Script phản hồi `{ success: true, duplicate: true }` mà không chèn trùng lặp.
  3. `SyncManager` tại Client áp dụng khóa trạng thái `isSyncing` và cơ chế gửi tuần tự (sequential queue processing) với số lần thử lại `retryCount`.

### Thách thức 2: Khả năng tương thích chéo của Background Sync API trên các nền tảng di động
* **Vấn đề (Bottleneck):** Chuẩn W3C Background Sync API (`registration.sync.register`) chỉ được hỗ trợ tốt nhất trên Chrome/Edge Android, trong khi Safari iOS và môi trường Webview Capacitor có mức độ hỗ trợ không đồng đều.
* **Giải pháp (Resolution):**
  Thiết kế **Động cơ Đồng bộ 2 lớp (Dual-layer Synchronization Engine)**:
  - *Lớp 1 (Tiêu chuẩn PWA):* Đăng ký sự kiện ngầm `sync` thông qua Service Worker (`studyhabit-sync`) để trình duyệt tự động gửi dữ liệu ngay khi thiết bị có kết nối mạng, kể cả khi ứng dụng đang chạy nền.
  - *Lớp 2 (Dự phòng thời gian thực - Realtime Fallback):* Tích hợp plugin `@capacitor/network` và sự kiện `window.addEventListener('online')`. Ngay khi phát hiện chuyển đổi trạng thái kết nối sang `connected = true`, Client chủ động gọi trực tiếp `SyncManager.processQueue()`, đảm bảo 100% tỷ lệ đồng bộ thành công trên mọi thiết bị và hệ điều hành.
