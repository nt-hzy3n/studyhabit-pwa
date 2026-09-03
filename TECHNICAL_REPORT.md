# BÁO CÁO KỸ THUẬT MINI-PROJECT
# XÂY DỰNG NỀN TẢNG KHẢO SÁT NGOẠI TUYẾN STUDYHABIT VỚI PROGRESSIVE WEB APPS VÀ CAPACITOR

**Đề tài:** Khảo sát thói quen học tập của sinh viên (StudyHabit Offline-First Survey Platform)  
**Công nghệ chính:** React, TypeScript, PWA, Service Worker, IndexedDB, Background Sync, Google Apps Script, Google Sheets, Capacitor, Python Data Analysis.  
**Ngày hoàn thiện:** Tháng 09/2026  

---

## 1. GIỚI THIỆU & ĐẶT VẤN ĐỀ (INTRODUCTION & PROBLEM STATEMENT)

Trong nghiên cứu khoa học xã hội và đánh giá giáo dục tại môi trường đại học, việc khảo sát trực tiếp thói quen sinh hoạt và học tập của sinh viên (thời lượng tự học, phương pháp tiếp thu, xao nhãng mạng xã hội, giấc ngủ và công cụ AI) thường diễn ra tại các giảng đường, thư viện ngầm, ký túc xá hoặc khu vực ngoại thành.

Các giải pháp khảo sát trực tuyến truyền thống (Google Forms, Microsoft Forms, Typeform) có nhược điểm chí mạng là **phụ thuộc 100% vào đường truyền Internet liên tục**:
- Khi mạng chập chờn, biểu mẫu không thể mở hoặc bị treo khi nộp bài.
- Người dùng vô tình đóng tab hoặc tải lại trang sẽ làm mất toàn bộ tiến trình trả lời của 20 câu hỏi phức tạp.
- Khi bấm nút gửi nhiều lần do mạng chậm, hệ thống thường xuyên sinh ra các bản ghi trùng lặp (duplicate records) làm sai lệch dữ liệu nghiên cứu.

Dự án **StudyHabit** được xây dựng nhằm giải quyết triệt để các vấn đề trên bằng kiến trúc **Offline-First**, biến trình duyệt Web thông thường thành một ứng dụng điều tra xã hội học độc lập, tin cậy tuyệt đối và không phụ thuộc vào hạ tầng mạng tại thời điểm thu thập dữ liệu.

---

## 2. MỤC TIÊU CỦA ĐỀ TÀI (OBJECTIVES)

1. **Ứng dụng công nghệ Progressive Web App (PWA):** Cung cấp khả năng cài đặt độc lập (Standalone), hỗ trợ Service Worker bộ đệm App Shell (Cache-First) giúp khởi động ứng dụng mà không cần Internet.
2. **Kiến trúc Offline-First kiên cố:** Cam kết **100% không mất dữ liệu**. Mọi thao tác điền bài đều được tự động lưu tạm (Autosave Draft) vào IndexedDB cục bộ của thiết bị.
3. **Cơ chế nộp bài và hàng đợi đồng bộ (SyncQueue):** Khi nộp bài, hệ thống luôn lưu vào IndexedDB trước với trạng thái `PENDING_SYNC` kèm mã định danh toàn cầu UUID v4, sau đó tự động kích hoạt gửi tuần tự lên đám mây khi có kết nối mạng.
4. **Tích hợp Google Sheets qua Google Apps Script:** Sử dụng Google Sheets làm cơ sở dữ liệu tập trung, thiết lập tầng API trung gian bảo mật bằng Google Apps Script với cơ chế chống trùng lặp (Idempotency).
5. **Tích hợp phần cứng di động với Capacitor:** Đóng gói ứng dụng chạy trên hệ điều hành Android, tích hợp plugin `@capacitor/camera` và `@capacitor/network`.
6. **Quy trình phân tích khoa học dữ liệu (Data Science Pipeline):** Xây dựng mô-đun Python/Pandas độc lập để làm sạch dữ liệu, phân tích thống kê mô tả và trực quan hóa mối tương quan nghiên cứu.

---

## 3. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Hệ thống StudyHabit được thiết kế theo mô hình 4 tầng phân tách rõ ràng:

```
+-------------------------------------------------------------------------+
|                          1. TẦNG KHÁCH (CLIENT)                         |
|  - Giao diện người dùng: React 19 + TypeScript + Modern CSS             |
|  - Trình biểu diễn câu hỏi động: QuestionRenderer (10 dạng câu hỏi)     |
|  - Điều hướng đa bước: MultiStepSurveyForm (6 bước học thuật)           |
|  - Điều khiển phần cứng: Capacitor Camera & Network Plugins             |
+------------------------------------+------------------------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
+--------------v---------------+             +-------------v--------------+
|   2. TẦNG CƠ SỞ DỮ LIỆU CỤC BỘ|             |   3. TẦNG DỊCH VỤ NGOẠI TUYẾN|
|      (IndexedDB: studyhabit-db)             |     (Service Worker & Sync) |
| - surveys (Các mẫu khảo sát) |             | - sw.js: Cache-First App   |
| - questions (Bộ 20 câu hỏi)  |             |   Shell (HTML/CSS/JS)      |
| - responses (Phiếu & bản nháp|             | - Background Sync API      |
| - syncQueue (Hàng đợi gửi)   |             |   ('studyhabit-sync')      |
+--------------+---------------+             | - SyncManager (Tuần tự)    |
               |                             +-------------+--------------+
               +---------------------+---------------------+
                                     | (POST JSON Payload kèm UUID)
                                     v
+------------------------------------+------------------------------------+
|                4. TẦNG MÁY CHỦ ĐÁM MÂY (REMOTE BACKEND)                 |
|  - Google Apps Script Web App API (Code.gs)                             |
|  - Google Sheets Database:                                              |
|      + Sheet 1: Surveys (id, surveyId, surveyVersion, createdAt, ...)   |
|      + Sheet 2: Responses (id [UUID], surveyId, submittedAt, answers...) |
|  - Phân tích hậu kỳ: Python / Pandas / Matplotlib (/analysis)           |
+-------------------------------------------------------------------------+
```

---

## 4. CHI TIẾT CÁC CƠ CHẾ KỸ THUẬT CỐT LÕI

### 4.1. Cơ chế Lưu trữ Cục bộ IndexedDB (`studyhabit-db`)
Sử dụng thư viện chuẩn `idb` (v8) mở rộng từ IndexedDB native API của trình duyệt:
- **Tách biệt 4 Object Stores:** `surveys`, `questions`, `responses`, `syncQueue`.
- **Cấu trúc bản ghi phản hồi (SurveyResponse):**
  ```typescript
  interface SurveyResponse {
    id: string;              // UUID v4 duy nhất toàn cầu
    surveyId: string;        // 'study-habit-survey-2026'
    surveyVersion: number;   // Phiên bản khảo sát
    answers: Record<string, any>; // Dữ liệu trả lời
    status: 'DRAFT' | 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED';
    createdAt: string;
    updatedAt: string;
    syncedAt?: string;
    retryCount: number;
    lastError?: string;
  }
  ```
- **Tự động lưu bản nháp (Autosave):** Cứ mỗi thao tác nhập câu trả lời, một bộ đếm `setTimeout` (600ms debounce) được kích hoạt để cập nhật bản ghi có `status = 'DRAFT'` vào IndexedDB. Khi người dùng đóng trình duyệt hoặc tắt máy, lần mở tiếp theo hệ thống sẽ tự động khôi phục dữ liệu nguyên vẹn.

### 4.2. Cơ chế Service Worker & Bộ đệm Ứng dụng (App Shell)
Tệp `sw.js` triển khai vòng đời Service Worker đầy đủ:
- **Sự kiện INSTALL:** Mở bộ đệm `studyhabit-v1`, nạp sẵn toàn bộ tệp tĩnh tối thiểu (App Shell: `/`, `/index.html`, `/manifest.webmanifest`, `/icons/...`) và gọi `skipWaiting()`.
- **Sự kiện ACTIVATE:** Duyệt danh sách các caches hiện có trong trình duyệt, loại bỏ các phiên bản bộ đệm cũ và gọi `clients.claim()`.
- **Sự kiện FETCH (Chiến lược Cache-First):**
  - Đối với các yêu cầu hướng tới Google Apps Script (`script.google.com`): Cho phép đi thẳng ra mạng (Network-Only).
  - Đối với tài nguyên giao diện (HTML/CSS/JS): Ưu tiên lấy từ bộ đệm `caches.match()`. Nếu chưa có mới tải từ mạng và cập nhật bổ sung vào cache.
  - Khi offline hoàn toàn và người dùng truy cập route điều hướng: Trả về tệp `index.html` đã được cache sẵn, giúp ứng dụng SPA khởi động ngay tức thì.

### 4.3. Động cơ Đồng bộ (SyncEngine) & Phòng chống Trùng lặp (Idempotency)
Khi người dùng bấm **"Nộp phiếu khảo sát"**:
1. Ứng dụng **không bao giờ gửi trực tiếp lên Google Sheets ngay lập tức**.
2. Toàn bộ câu trả lời được ghi vào IndexedDB với `status = 'PENDING_SYNC'`.
3. Bản ghi được đưa vào bảng `syncQueue`.
4. **Kiểm tra mạng:**
   - Nếu đang ngoại tuyến: Hiển thị thông báo *"Bạn đang offline. Câu trả lời đã được lưu và sẽ tự động đồng bộ khi có mạng"*.
   - Nếu đang có mạng: `SyncManager` kích hoạt xử lý tuần tự từng mục trong hàng đợi:
     - Chuyển trạng thái sang `SYNCING`.
     - Thực hiện `POST` payload lên Google Apps Script.
     - Nếu nhận được phản hồi `{ success: true }`: Cập nhật `status = 'SYNCED'`, lưu thời gian `syncedAt` và xóa khỏi `syncQueue`.
     - Nếu máy chủ lỗi hoặc mất mạng giữa chừng: Tăng `retryCount`, trả bản ghi về lại `PENDING_SYNC`. **Dữ liệu cục bộ luôn luôn được giữ nguyên**.
5. **Bảo đảm tính Idempotency:** Trong Google Apps Script (`Code.gs`), hàm `findRowByUuid()` duyệt cột A của Sheet `Responses`. Nếu UUID đã tồn tại từ lượt gửi trước, Apps Script trả về `{ success: true, duplicate: true, id: uuid }` mà không chèn thêm dòng mới, triệt tiêu hoàn toàn nguy cơ trùng lặp.

---

## 5. BỘ CÂU HỎI KHẢO SÁT THÓI QUEN HỌC TẬP (6 BƯỚC HỌC THUẬT)

Bộ câu hỏi gồm 20 câu hỏi trọng tâm được chia thành 5 nhóm nội dung và 1 bước kiểm tra tổng thể:
1. **Bước 1 — Thông tin cơ bản:** Năm đào tạo, Ngành/Chuyên ngành học tập, Thời gian tự học trung bình mỗi ngày.
2. **Bước 2 — Thói quen học tập:** Số ngày tự học trong tuần, Khung giờ vàng tập trung nhất, Địa điểm học tập chính, Hình thức học (cá nhân hay nhóm).
3. **Bước 3 — Phương pháp học tập:** Các phương pháp áp dụng (Đọc giáo trình, Xem video, Làm bài tập, Mindmap, Flashcards, Thảo luận nhóm, Dự án thực tế, Ứng dụng AI), Tần suất ôn bài sau buổi học, Thói quen lập kế hoạch học.
4. **Bước 4 — Mức độ tập trung & Công nghệ:** Đánh giá mức độ tập trung (1–5), Tần suất xao nhãng bởi mạng xã hội (1–5), Thiết bị chính phục vụ học tập, Mức độ ứng dụng công cụ AI (ChatGPT, Claude, Copilot...).
5. **Bước 5 — Giấc ngủ & Tự đánh giá:** Thời lượng ngủ trung bình mỗi đêm, Mức độ ảnh hưởng của thiếu ngủ tới kết quả học tập (1–5), Tự chấm điểm hiệu quả thói quen học tập hiện tại (1–5), Rào cản/Khó khăn lớn nhất, Mục tiêu cải thiện và Ảnh chụp góc học tập (Camera).
6. **Bước 6 — Xem lại & Hoàn tất gửi:** Cho phép sinh viên xem lại toàn bộ thông tin đã điền, bấm nút chỉnh sửa từng phần trước khi xác nhận nộp phiếu.

---

## 6. ĐƯỜNG ỐNG PHÂN TÍCH DỮ LIỆU PYTHON (DATA SCIENCE PIPELINE)

Thư mục `/analysis` cung cấp công cụ phân tích hậu kỳ độc lập, đọc tệp CSV xuất từ Google Sheets:
- **Làm sạch & chuẩn hóa dữ liệu:** Giải mã cột `answers` dạng JSON lồng ghép, kiểm tra kiểu dữ liệu và xử lý giá trị khuyết thiếu (median imputation cho các thang đo rating).
- **Thống kê mô tả:** Tính toán điểm trung bình độ tập trung (3.73/5.0), hiệu quả học tập (3.73/5.0), xao nhãng mạng xã hội (2.73/5.0), tác động của giấc ngủ (3.73/5.0).
- **Xuất bản biểu đồ khoa học:**
  - `study_time_distribution.png`: Biểu đồ cột phân phối thời lượng tự học.
  - `study_location_distribution.png`: Biểu đồ thanh ngang so sánh các địa điểm học.
  - `learning_methods.png`: Tần suất các phương pháp học tập được sử dụng.
  - `concentration_distribution.png`: Phân bố mức độ tập trung theo thang điểm sao.
  - `effectiveness_distribution.png`: Đánh giá hiệu quả thói quen học tập.
  - `study_time_vs_effectiveness.png`: Biểu đồ đường phân tích tương quan giữa số giờ tự học mỗi ngày và mức độ hiệu quả cảm nhận.

---

## 7. KẾT QUẢ THỰC NGHIỆM & KIỂM THỬ (TESTING RESULTS)

Hệ thống đã trải qua quy trình kiểm thử nghiêm ngặt theo 18 tiêu chí chấp thuận (Acceptance Criteria):

| Kịch bản kiểm thử | Trạng thái mạng | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
| :--- | :--- | :--- | :--- | :--- |
| **1. Khởi động ứng dụng lần đầu** | Online | Tải giao diện, nạp dữ liệu seed, đăng ký Service Worker | SW kích hoạt, IndexedDB tạo đủ 4 store | **Đạt** |
| **2. Tải lại trang khi Offline** | Offline | Giao diện vẫn hiển thị bình thường nhờ Cache-First | App Shell mở tức thì từ bộ đệm | **Đạt** |
| **3. Điền khảo sát & Đóng tab** | Bất kỳ | Câu trả lời được lưu tự động theo thời gian thực | Mở lại trang phục hồi bản nháp 100% | **Đạt** |
| **4. Nộp bài khi ngắt kết nối** | Offline | Lưu vào IndexedDB, cấp UUID, trạng thái PENDING_SYNC | Thông báo offline rõ ràng, lưu hàng đợi | **Đạt** |
| **5. Phục hồi kết nối Internet** | Online | SyncManager tự động gửi bài không cần F5 | Phiếu tự động chuyển sang `SYNCED` | **Đạt** |
| **6. Ghi nhận tại Google Sheets** | Online | Google Sheets nhận đúng dữ liệu, đúng cột | Dữ liệu xuất hiện trên Sheet Responses | **Đạt** |
| **7. Thử gửi lại (Retry / Re-send)** | Online | Không tạo dòng trùng lặp trên Google Sheets | Apps Script phản hồi `duplicate: true` | **Đạt** |
| **8. Đồng bộ Capacitor Android** | Native | Đồng bộ tài nguyên và plugin Camera, Network | `npx cap sync` thành công 100% | **Đạt** |
| **9. Chạy phân tích Python** | CLI | Tự động đọc CSV và xuất 6 biểu đồ PNG | `analysis.py` chạy thành công không lỗi | **Đạt** |

---

## 8. HẠN CHẾ & KẾT LUẬN (LIMITATIONS & CONCLUSION)

### Hạn chế:
1. Google Apps Script có giới hạn tài nguyên miễn phí (tối đa 20.000 requests/ngày và thời gian thực thi tối đa 6 phút/request), phù hợp cho quy mô khảo sát cấp khoa/trường (dưới 5.000 sinh viên).
2. Background Sync API là chuẩn W3C được Chrome và Edge hỗ trợ đầy đủ; trên trình duyệt Safari (iOS), hệ thống hoạt động ổn định nhờ cơ chế dự phòng thông qua sự kiện `window.ononline`.

### Kết luận:
Dự án **StudyHabit** đã chứng minh thành công tính khả thi và ưu việt vượt trội của kiến trúc **Offline-First** đối với các ứng dụng điều tra xã hội học và khảo sát thực địa. Bằng việc kết hợp hài hòa giữa **Progressive Web App**, **Service Worker**, **IndexedDB**, **Google Sheets API** và **Capacitor Android**, giải pháp loại bỏ hoàn toàn nỗi lo mất dữ liệu do sự cố đường truyền mạng, mang lại trải nghiệm mượt mà, chuyên nghiệp và đáng tin cậy cho cả người điền khảo sát lẫn nhóm nghiên cứu dữ liệu.
