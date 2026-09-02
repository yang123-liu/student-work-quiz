# 学生工作自评与匹配 · 在线问卷小程序

学生扫码填写 → 当场算出六方向综合分 → 结果保存到老师后台 → 可导出 CSV。

问卷内容与 `/workspace/学生工作自评问卷.html` 完全一致（霍兰德三型 + MBTI + 未来方向 + 自评 10 题，另加姓名/学校/专业），前端即时反馈、后端存档。

---

## 一、目录结构

```
在线问卷小程序/
├── server.js            # 后端服务（Express）
├── package.json         # 依赖（仅 express）
├── gen_qr.py            # 二维码生成工具（可配 URL）
├── public/
│   ├── index.html       # 学生端问卷（扫码打开）
│   ├── admin.html       # 老师管理后台（看记录/搜索/导出）
│   └── qr.png           # 二维码图片
└── data/
    └── records.json     # 学生提交记录（自动生成）
```

---

## 二、本地启动（先在本机跑通）

```bash
cd 在线问卷小程序
npm install          # 首次运行装依赖
node server.js
```

- 学生问卷：`http://localhost:3000/`
- 管理后台：`http://localhost:3000/admin`　（密码 `admin2026`，**务必修改**）

把 `public/qr.png` 发到学生群里，扫码即填。

---

## 三、部署到免费云平台（推荐 Render）

Render 提供常驻 Node 服务，可持久化 JSON 文件，免费额度适合班级规模使用。

**步骤：**
1. 把整个 `在线问卷小程序` 文件夹推到一个 GitHub 私有仓库（或直接用 Render 的 Git 方式）。
2. 在 [render.com](https://render.com) 注册 → 点 **New + → Web Service**，关联该仓库。
3. Build Command 填：`npm install`
4. Start Command 填：`node server.js`
5. 在 **Environment** 里添加一个变量，把默认密码改掉：
   - `ADMIN_TOKEN` = `你自定的管理密码`
6. 点 **Create Web Service**，等 1–2 分钟部署完成，会得到一个形如
   `https://你的应用.onrender.com/` 的网址。
7. 生成正式二维码：
   ```bash
   python3 gen_qr.py https://你的应用.onrender.com/
   ```
   把新生成的 `public/qr.png` 发给学生扫码即可。
8. 管理后台：`https://你的应用.onrender.com/admin`，用你设的密码登录。

> 免费实例休眠说明：Render 免费实例闲置 15 分钟会休眠，学生第一次扫码打开会慢几秒（冷启动），之后正常。若介意，可升级付费版或换用常驻的云主机。

---

## 四、其他部署方式

| 平台 | 说明 | 适合 |
|------|------|------|
| Render（推荐） | 免费常驻、可持久化 JSON | 班级/社团规模，省心 |
| Railway | 免费额度、常驻 | 类似 Render |
| Vercel | Serverless，**JSON 文件不可持久化** | 不推荐（记录会丢） |
| 学校服务器 / 家庭 NAS | 内网或公网部署 | 数据留在校内最稳 |

如果数据量大或要长期稳定，建议换 SQLite/MySQL，可后续升级（找开发者改存储层）。

---

## 五、安全说明

- **务必改管理密码**：部署时设 `ADMIN_TOKEN` 环境变量，或改 `server.js` 第 12 行的默认值。
- 管理接口 `x-admin-token` 鉴权，`/api/records`、`/api/export`、`/admin` 均需密码。
- 学生提交接口无需鉴权（设计如此，学生要能提交）。
- 提交的记录含姓名/学校/专业等个人信息，请按学校要求妥善保管，不外传。

---

## 六、常见问题

**Q：学生扫码打不开？**
先确认线上地址能正常访问；免费平台休眠后首次打开慢是正常的。

**Q：记录存哪里？导出格式？**
存在 `data/records.json`，管理后台点「导出 CSV」可下载 Excel 能打开的文件（含六方向分数、Top1/Top2、建议岗位、自评答案）。

**Q：想改问卷题目？**
直接编辑 `public/index.html`，改完重新部署即可，历史记录不受影响。

**Q：平台能保存数据结果吗？**
能。每次学生点「提交保存我的结果」，记录就写入 `data/records.json`，管理后台实时可见、可搜索、可导出。
