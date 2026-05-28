# Zoom -> Zalo Auto Scheduler (Chrome Extension)

Extension hẹn giờ tự động:
1. End cuộc họp Zoom.
2. Chuyển sang tab Zalo Web đang mở sẵn.
3. Bấm nút gửi tin nhắn (`.send-msg-btn`) trên Zalo.

## Tải nhanh bản ZIP

Tải source tại [tại đây](https://codeload.github.com/Huynd2097/Zoom_Zalo/zip/refs/heads/main).

Sau khi tải:
1. Giải nén file ZIP.
2. Bạn sẽ có thư mục dạng `Zoom_Zalo-main`.
3. Dùng chính thư mục này để nạp extension (`Load unpacked`).

## Cài đặt (Load unpacked)

1. Mở Chrome và vào `chrome://extensions`.
2. Bật `Developer mode`.
3. Chọn `Load unpacked`.
4. Trỏ đến thư mục đã giải nén (ví dụ: `Zoom_Zalo-main`).
5. Pin extension lên thanh công cụ (tuỳ chọn).

Cảnh báo chọn nhầm thư mục:
- Không chọn thư mục ngoài cùng chỉ chứa thư mục con.
- Không chọn file `.zip`.
- Hãy chọn đúng thư mục có file `manifest.json` nằm trực tiếp bên trong.
- Nếu Chrome báo lỗi `Manifest file is missing or unreadable`, gần như chắc chắn bạn đã chọn sai thư mục.

## Cách dùng

1. Mở sẵn tab Zoom meeting.
2. Mở sẵn tab Zalo Web (`https://chat.zalo.me`) và vào đúng cuộc chat cần gửi.
3. Nhập sẵn nội dung tin nhắn trong ô chat Zalo.
4. Mở extension popup, nhập thời gian hẹn, bấm **Bắt đầu hẹn giờ**.
5. Đến giờ, extension sẽ:
   - Chuyển sang tab Zoom và End meeting.
   - Chuyển sang tab Zalo và bấm Send.

## Tính năng

- Hẹn giờ theo phút/giây.
- Countdown trong popup extension.
- Countdown nổi trên trang (góc phải trên), có thể kéo thả và nhớ vị trí.
- Tự tìm tab Zoom/Zalo theo URL, không phụ thuộc tab đang mở lúc hết giờ.
- Dùng `chrome.alarms` để hẹn giờ ổn định hơn cho mốc dài.

## Lưu ý quan trọng

- Sau khi reload extension, nên reload lại tab Zoom và Zalo để content script inject mới nhất.
- Zalo hiện tại chỉ bấm Send, **không tự gõ nội dung**.
- Nếu chưa thấy countdown nổi, reload tab hiện tại.
- Chrome phải đang chạy tại thời điểm trigger.

## Hạn chế hiện tại

- Selector Zoom/Zalo có thể thay đổi khi UI của họ cập nhật.
- Nếu phiên đăng nhập Zoom/Zalo hết hạn, thao tác tự động sẽ fail.
- Nếu máy sleep đúng lúc hẹn, thời điểm chạy có thể bị trễ.

## Troubleshooting

### 1) Hẹn 10s chạy, 30s+ không chạy
Đã chuyển qua `chrome.alarms` để giảm lỗi này. Hãy chắc bạn đang dùng bản code mới nhất.

### 2) Chuyển qua Zalo nhưng không gửi
- Kiểm tra có đúng cuộc chat đang mở không.
- Kiểm tra nút gửi còn class `.send-msg-btn` không.
- Reload tab Zalo sau khi reload extension.

### 3) End Zoom không thành công
- Kiểm tra Zoom đang chạy trong iframe `#webclient` như bản hiện tại đang xử lý.
- Nếu Zoom đổi class/nút, cần cập nhật selector trong `zoom-content.js`.

## Cấu trúc chính

- `manifest.json`: cấu hình extension MV3.
- `background.js`: scheduler bằng `chrome.alarms`, điều phối flow Zoom -> Zalo.
- `zoom-content.js`: logic end meeting + countdown overlay.
- `zalo-content.js`: logic bấm send + countdown overlay.
- `popup.html` / `popup.js`: UI hẹn giờ, countdown, hủy lịch.

## Gợi ý publish

Nếu muốn phát hành public:
- Dọn lại tên/description/version trong `manifest.json`.
- Tạo icon extension đầy đủ kích thước.
- Test lại trên nhiều máy/tài khoản Zoom/Zalo.
- Đóng gói và publish qua Chrome Web Store.

## License

Bạn có thể thêm license tùy ý (MIT khuyến nghị cho dự án chia sẻ cộng đồng).

