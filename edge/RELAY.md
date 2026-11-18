# Đẩy luồng camera lên hệ thống (cho máy relay tại tiệm)

Camera CCTV chỉ phát RTSP trong mạng nội bộ của tiệm, nên cần một máy trong cùng mạng
(laptop, mini PC, Raspberry Pi…) đọc luồng của camera rồi đẩy lên máy chủ. Tiệm không phải
mở cổng nào: máy relay tự kết nối ra ngoài.

**Địa chỉ, user và mật khẩu được gửi riêng.** Không ghi chúng vào repo này, Confluence hay
Sheet. Dưới đây dùng chữ in hoa làm chỗ điền:

| Chỗ điền | Ý nghĩa |
|---|---|
| `IP` | Địa chỉ IP cố định của máy chủ |
| `USER`, `PASS` | Tài khoản đẩy luồng |
| `PASSPHRASE` | Khoá mã hoá SRT (chỉ dùng cách 2) |
| `cam-s01-a` | Tên luồng của camera này; phải bắt đầu bằng `cam-` |
| `CAMERA_RTSP` | Địa chỉ RTSP của camera trong tiệm (luồng chính) |

Ví dụ `CAMERA_RTSP` tuỳ hãng: Hikvision `rtsp://admin:matkhau@192.168.1.64:554/Streaming/Channels/101`;
Dahua/Imou `rtsp://admin:matkhau@192.168.1.108:554/cam/realmonitor?channel=1&subtype=0`.

## Cài đặt camera nên dùng cho demo

- Luồng chính 3840×2160. H.264 nếu camera có, H.265 cũng được.
- 10 khung/giây, **I-frame interval = 10** (một khung khoá mỗi giây: máy chủ chỉ giải mã khung khoá).
- Tắt H.265+ / H.264+ / "smart codec": chúng giãn khung khoá ra nhiều giây.
- Bitrate cố định 4–6 Mbps. Khoảng 1,8–2,7 GB mỗi giờ, nên tiệm cần WiFi; gói 4G 2 GB/ngày chỉ đủ khoảng 1 giờ.
- Tắt hồng ngoại hoặc để đèn bật: ảnh đen trắng mất màu bao bì.
- Nhìn thẳng vào kệ sữa, cách kệ khoảng 1,5–2,5 m.

## Cách 1: RTSPS (dễ nhất)

Cần `ffmpeg`. Lệnh tự chạy lại khi rớt mạng.

Linux hoặc macOS:

```bash
while true; do
  ffmpeg -hide_banner -loglevel warning -rtsp_transport tcp -i "CAMERA_RTSP" \
    -map 0:v:0 -c copy -f rtsp -rtsp_transport tcp "rtsps://USER:PASS@IP:8322/cam-s01-a"
  echo "relay dừng, chạy lại sau 3 giây"; sleep 3
done
```

Windows PowerShell:

```powershell
while ($true) {
  ffmpeg -hide_banner -loglevel warning -rtsp_transport tcp -i "CAMERA_RTSP" `
    -map 0:v:0 -c copy -f rtsp -rtsp_transport tcp "rtsps://USER:PASS@IP:8322/cam-s01-a"
  Start-Sleep -Seconds 3
}
```

`-c copy` chỉ chuyển gói, không mã hoá lại, nên máy relay gần như không tốn CPU.

## Cách 2: SRT (khi mạng chập chờn, ví dụ 4G)

SRT tự gửi lại gói bị mất và mã hoá bằng `PASSPHRASE`. Cần bản ffmpeg có `libsrt`.

```bash
ffmpeg -hide_banner -loglevel warning -rtsp_transport tcp -i "CAMERA_RTSP" -map 0:v:0 -c copy -f mpegts \
  "srt://IP:8890?streamid=publish:cam-s01-a:USER:PASS&passphrase=PASSPHRASE&pkt_size=1316&latency=2000000"
```

## Kiểm tra

1. ffmpeg chạy mà không in lỗi.
2. Trên dashboard, ô trạng thái đổi thành **"Đang nhận luồng (H264 3840×2160)"** trong vòng vài giây.
3. Khung hình mới nhất hiện ra, mặt người đã bị làm mờ.

## Lỗi thường gặp

| Hiện tượng | Nguyên nhân hay gặp |
|---|---|
| `401 Unauthorized` | Sai `USER` hoặc `PASS` |
| `404` hoặc bị từ chối đường dẫn | Tên luồng không bắt đầu bằng `cam-` |
| Kết nối được nhưng dashboard không ra khung | Camera bật smart codec, khung khoá quá thưa |
| ffmpeg báo `Protocol not found` với `rtsps` hoặc `srt` | Bản ffmpeg thiếu TLS hoặc `libsrt`; cài bản đầy đủ |
| Hình giật, trễ tăng dần | Mạng tải lên không đủ; giảm bitrate hoặc fps |
