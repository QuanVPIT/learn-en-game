# Bé Học Tiếng Anh 🦷

Game học tiếng Anh tiểu học (lớp 1–5) cho bé **Nic Sún Răng** và **Ny Đen Đen**.
Chủ đề lớp 2–5 bám theo tên các Unit sách **Tiếng Anh Global Success**; lớp 1 là phần ôn (màu, số, cơ thể, gia đình).

Chơi online: https://quanvpit.github.io/learn-en-game/

## Tính năng

- Màn chào chọn bé đang chơi; lời khen hài hước theo tên từng bé; số sao lưu riêng từng bé.
- Chọn **Lớp 1 → Lớp 5**, mỗi lớp nhiều chủ đề; mỗi chủ đề có từ vựng, hình và hội thoại hỏi – đáp mẫu.
- Các trò chơi (đủ 4 kỹ năng):

| Trò               | Kỹ năng    | Cách chơi                                      |
| ----------------- | ---------- | ---------------------------------------------- |
| 📚 Học từ         | Làm quen   | Thẻ từ: hình, nghe từ + nghĩa, hội thoại mẫu   |
| 🎧 Nghe chọn hình | Nghe       | Nghe từ, chọn hình đúng                        |
| 📖 Đọc chọn hình  | Đọc        | Đọc từ / câu, chọn hình đúng                   |
| ✏️ Ghép chữ       | Viết       | Ghép chữ cái thành từ                          |
| 🧩 Xếp câu        | Câu        | Nghe câu, xếp các từ thành câu                 |
| ✍️ Điền từ        | Đọc – Viết | Chọn từ điền vào chỗ trống (lớp 3–5)           |
| 💬 Hỏi – Đáp      | Nghe – Đọc | Nghe câu hỏi, chọn câu trả lời đúng (lớp 3–5)  |
| 🎤 Nói từ         | Nói        | Bé nói, máy nghe và chấm %, tô xanh/đỏ từng từ |
| 🗣️ Nói câu        | Nói        | Như trên nhưng nói cả câu                      |
| 🏆 Thử thách      | Tổng hợp   | Trộn các kiểu câu hỏi                          |

- **Giọng đọc AI** (Google Cloud Text-to-Speech) tạo sẵn thành file mp3; câu nào chưa có file thì dùng giọng của máy.
- **Phần Nói**: nghe trực tiếp, chấm dễ tính cho trẻ; máy không nhận diện được thì thu âm cho bé nghe lại và bố mẹ chấm.
  Cần mở bằng Safari/Chrome (không mở trong Zalo/Facebook); iPhone/iPad cần bật _Đọc chính tả_.

## Công nghệ

React 18 · TypeScript · Vite · Tailwind CSS v4 · Vitest · ESLint + Prettier · GitHub Actions (tự deploy GitHub Pages)

## Cấu trúc dự án

```
LearnENGame/
├── .github/workflows/deploy.yml  # Tự kiểm tra + deploy khi đẩy code lên main
├── public/audio/                 # File giọng đọc mp3 + manifest.json (tạo bằng npm run audio)
├── scripts/gen-audio.ts          # Script tạo giọng đọc AI
├── src/
│   ├── main.tsx                  # Điểm khởi động
│   ├── index.css                 # Tailwind + màu, font, hiệu ứng dùng chung
│   ├── app/                      # Khung app: điều hướng, bé đang chơi, số sao
│   ├── screens/                  # Các màn hình: Welcome, Topics, Activities, Learn, Session
│   ├── games/                    # Các trò chơi: Choose, Build (ghép chữ/xếp câu), Fill, Qna, Speak
│   ├── components/               # Nút, thẻ, hình, pháo hoa, hội thoại…
│   ├── data/                     # Nội dung bài học
│   │   ├── grade1.ts … grade5.ts # Từ vựng + câu mẫu từng lớp
│   │   ├── lessons.ts            # Hàm tạo câu hỏi (hội thoại, điền từ, lựa chọn…)
│   │   ├── phrases.ts            # Lời khen, câu dẫn dắt; danh sách câu cần giọng đọc
│   │   ├── players.ts            # Các bé
│   │   └── activities.ts         # Các trò chơi
│   └── lib/                      # Giọng đọc, hiệu ứng âm thanh, nhận diện giọng nói, lưu trữ…
└── *.test.ts                     # Kiểm thử (Vitest), nằm cạnh file được kiểm tra
```

## Chạy trên máy

```bash
npm install
npm run dev        # mở http://localhost:5173
```

| Lệnh             | Việc làm                                 |
| ---------------- | ---------------------------------------- |
| `npm run build`  | Kiểm tra kiểu + build ra thư mục `dist/` |
| `npm run test`   | Chạy kiểm thử                            |
| `npm run lint`   | Kiểm tra lỗi code (ESLint)               |
| `npm run format` | Định dạng code (Prettier)                |
| `npm run check`  | Typecheck + lint + test                  |
| `npm run audio`  | Tạo file giọng đọc AI cho các câu mới    |

## Giọng đọc AI

1. Tạo API key Google Cloud Text-to-Speech (bật _Cloud Text-to-Speech API_ trong Google Cloud Console).
2. Copy `.env.example` thành `.env.local`, điền `GOOGLE_TTS_API_KEY=...` (file này không được đưa lên GitHub).
3. Chạy `npm run audio`. Chỉ các câu mới được tạo; file của câu không còn dùng sẽ bị xoá.
4. Đổi giọng: sửa `TTS_VOICE_EN` / `TTS_VOICE_VI` trong `.env.local`, xoá thư mục `public/audio/` rồi chạy lại.

## Thêm / sửa bài học

Sửa file `src/data/gradeN.ts`. Mỗi chủ đề có:

- `words`: `[tiếng Anh, nghĩa, hình (emoji / số / mã màu), cụm dùng trong câu?]`
- `sentence(w)`: câu mẫu; `ask`: câu hỏi đi kèm (hoặc câu đáp nếu câu mẫu là câu hỏi).

Sau khi sửa: `npm run check` (kiểm thử sẽ báo nếu thiếu hình, trùng hình, câu sai định dạng…), rồi `npm run audio` để tạo giọng cho câu mới.

## Cập nhật bản online

Đẩy code lên nhánh `main` → GitHub Actions tự kiểm tra, build và cập nhật trang (khoảng 1–2 phút).
