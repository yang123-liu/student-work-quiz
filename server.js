// 学生工作自评问卷 · 在线服务（含提交保存 + 管理导出）
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');
// 管理密码（部署后可改，或通过环境变量 ADMIN_TOKEN 注入）
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin2026';

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 读取/写入记录
function loadRecords() {
  try { return JSON.parse(fs.readFileSync(RECORDS_FILE, 'utf-8')); }
  catch (e) { return []; }
}
function saveRecords(records) {
  fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

// 学生端：首页（静态问卷）
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 提交问卷结果
app.post('/api/submit', (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const school = String(body.school || '').trim();
    const major = String(body.major || '').trim();
    const hol = body.hol || {};        // {A:'S', B:'E', C:'A'}
    const mbti = body.mbti || {};      // {E/I:'E',...}
    const goal = String(body.goal || '').trim();
    const ans = Array.isArray(body.ans) ? body.ans.map(String) : []; // 10 个答案
    const scores = body.scores || {};  // 六方向综合分
    const top = body.top || {};        // {t1:'C', t2:'S', t1Name:'内容创意',...}
    const total = body.total;          // 已答多少题

    if (!name) { return res.status(400).json({ ok: false, msg: '请填写姓名' }); }

    const record = {
      id: crypto.randomBytes(4).toString('hex'),
      time: new Date().toISOString(),
      name, school, major,
      hol: { A: hol.A || '', B: hol.B || '', C: hol.C || '' },
      mbti: { E: mbti['E/I'] || '', S: mbti['S/N'] || '', T: mbti['T/F'] || '', J: mbti['J/P'] || '' },
      goal, ans, scores, top, total
    };
    const records = loadRecords();
    records.push(record);
    saveRecords(records);
    res.json({ ok: true, id: record.id });
  } catch (e) {
    res.status(500).json({ ok: false, msg: '保存失败：' + e.message });
  }
});

// 管理接口鉴权
function checkAdmin(req, res) {
  const t = req.headers['x-admin-token'] || req.query.token;
  if (t !== ADMIN_TOKEN) { res.status(401).json({ ok: false, msg: '无权限' }); return false; }
  return true;
}

// 管理页
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 获取所有记录
app.get('/api/records', (req, res) => {
  if (!checkAdmin(req, res)) return;
  res.json({ ok: true, records: loadRecords() });
});

// 导出 CSV
app.get('/api/export', (req, res) => {
  if (!checkAdmin(req, res)) return;
  const records = loadRecords();
  const header = ['提交时间','姓名','学校','专业','霍兰德','MBTI','未来方向',
    '统筹管理','内容创意','对外沟通','专业学术','活动执行','服务支持',
    '第一方向','第二方向','建议岗位','自评答案'];
  const esc = s => '"' + String(s ?? '').replace(/"/g, '""') + '"';
  const rows = records.map(r => {
    const hol = [r.hol?.A, r.hol?.B, r.hol?.C].filter(Boolean).join('·');
    const mbti = (r.mbti?.E||'') + (r.mbti?.S||'') + (r.mbti?.T||'') + (r.mbti?.J||'');
    const s = r.scores || {};
    const p = r.top || {};
    return [r.time, r.name, r.school, r.major, hol, mbti, r.goal,
      s.M ?? '', s.C ?? '', s.S ?? '', s.A ?? '', s.E ?? '', s.V ?? '',
      p.t1Name || '', p.t2Name || '', p.job || '', (r.ans||[]).join('')];
  });
  const csv = '\uFEFF' + [header, ...rows].map(row => row.map(esc).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  // 中文文件名需用 RFC 5987 编码，避免 Node http 头报非法字符
  res.setHeader('Content-Disposition', "attachment; filename=\"export.csv\"; filename*=UTF-8''" + encodeURIComponent('学生工作自评结果.csv'));
  res.send(csv);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`问卷服务已启动: http://localhost:${PORT}`);
  console.log(`管理页: http://localhost:${PORT}/admin  （密码: ${ADMIN_TOKEN}）`);
});
