# Claude Fable5 接手说明

交接日期：2026-07-06

## 项目概况

项目名：DynastyLife 古代人生 Web

这是一个静态网页古代人生模拟器。玩家从出生开始，按年份推进人生，经历亲友、读书、科举、营生、仕途、家产、行商押镖、民间娱乐、婚育与子女继承等系统。

线上地址：https://www.dynastylife.online

GitHub 仓库：https://github.com/Haojy888/dynastylife

Vercel 项目：haojy / dynastylife666

## 技术栈

- 纯静态网页：HTML + CSS + Vanilla JavaScript
- 无 package.json，无构建步骤
- 存档：localStorage
- 入口：`index.html`
- 主逻辑：`app.js`
- 数据和题库：`game-data.js`
- 样式：`styles.css`
- 资源：`assets/`

## 本地运行

进入项目目录：

```bash
cd outputs/dynasty-life-web
```

启动任意静态服务器即可，例如：

```bash
python -m http.server 5174
```

然后打开：

```text
http://127.0.0.1:5174/
```

也可以直接打开 `index.html`，但建议用静态服务器，浏览器行为更接近线上环境。

## 部署

当前部署在 Vercel。

生产部署命令：

```bash
npx vercel --prod --yes --scope haojy
```

注意：

- `.env.local` 和 `.vercel/` 是本地部署凭据，不要提交，也不要打包给外部。
- `.vercelignore` 已经排除 `.git`、`.env*`、`.vercel` 和根目录验证截图，避免 Vercel 上传包过大。
- 线上域名别名已经指向生产部署：`https://www.dynastylife.online`。

## 关键文件说明

`index.html`

页面入口，只加载背景 canvas、`game-data.js` 和 `app.js`。

`app.js`

项目的核心文件，包含状态结构、渲染、事件处理和所有小游戏逻辑。当前是单文件架构，后续可拆分，但拆分前要先保证功能不回退。

关键位置：

- `SAVE_KEY`：localStorage 存档 key，当前为 `dynasty-life-web-modern-v1`。
- `MAIN_EXAM_MIN_AGE`：童试开放年龄，当前 15 岁。
- `TOP_SHORTCUTS`：顶部快捷入口。
- `PLAYER_AVATARS`：玩家头像配置。
- `ACTIVITY_PLACES`：活动地点配置。
- `CAREER_STORY_OVERRIDES`：职业剧情文案。
- `CAREER_ACTION_OVERRIDES`：职业动作配置。
- `normalizeState()`：旧存档兼容的核心入口。新增 state 字段必须在这里补默认值。
- `startLife()`：新人生初始化。
- `nextYear()`：每年推进逻辑。
- `loadSave()` / `save()`：存档读写。
- `renderGame()`：游戏主界面。
- `overlayView()`：资料、新手引导、突发事件等弹窗入口。
- `app.addEventListener("click", ...)`：全局按钮事件委托，新增按钮通常在这里接逻辑。

`game-data.js`

来自 APK/数据反编译整理出的资源、事件、题库等数据。文件较大，不要随意格式化整文件，避免产生巨大 diff。

`styles.css`

全部 UI 样式，包括 Lightfall 背景、ProfileCard、小游戏、博坊、科举、瓦舍风月、新手引导等。

`assets/`

包含 APK 原资源和后来新增的头像资源。不要删除未知图片，很多资源通过 `DATA.sprites` 动态引用。

`dynastylife-contest-proposal.html`

TRAE 比赛报名用创意提案 HTML，和游戏运行无关，但交接包中保留。

## 已实现功能概览

- 新手引导：新建人生后自动出现，说明“我是谁、能做什么、第一步做什么”，右上角可重看。
- 人生推进：按年成长，触发随机事件、阶段事件、属性变化和日志记录。
- 亲友系统：父母、兄弟姐妹、朋友、配偶、子女有年龄、体魄、存活状态和互动。
- 多代继承：主角死亡后可选择子女继承遗产与家族进度。
- 科举系统：15 岁童试开放，一年只能考一次，含乡试、会试、殿试和任职。
- 官职系统：已扩展到更高官阶，不止县一级。
- 营生职业：包含普通职业和押镖/行商冒险，部分职业有专属剧情。
- 家产系统：可重复购买多套房屋，资产每年产生收益。
- 经济系统：显示为黄金、银子、铜钱，内部仍用整数铜钱计算。
- 促织系统：促织可选择出战，有寿命，随机死亡。
- 瓦舍风月：瓦舍和风月合并，含听曲看戏、花酒消遣、佳丽竞选。
- 博坊：含喊骰、赌大小、牌九等玩法。
- 雅戏小游戏：五子棋、投壶、象棋，象棋有中档 AI。
- UI 增强：Lightfall 背景、ProfileCard 资料卡、可更换玩家头像、古代美人头像。
- 部署：Vercel + 自定义域名已经可访问。

## 重要实现习惯

1. 新增存档字段时，必须同步更新 `normalizeState()`，否则旧玩家存档可能坏。
2. 钱财内部单位是“铜钱整数”，展示通过 `moneyText()` 转换为黄金/银子/铜钱。
3. 年龄门槛要统一走常量或已有判断，不要在多个地方写死。
4. 页面全部通过字符串模板渲染，按钮逻辑集中在底部 click 事件委托里。
5. 不要提交 `.env.local`、`.vercel/`、根目录验证截图。
6. 如果要拆分 `app.js`，先写回归测试或至少用浏览器验证主流程：新建人生、下一年、科举、营生、活动、资料卡、存档继续。

## 已知可继续优化的方向

- 将 `app.js` 拆成模块：state、render、events、career、exam、assets、minigames。
- 补更多职业专属剧情，尤其是底层职业、艺术职业和商旅职业。
- 增加亲友长期事件链，例如父母疾病、兄弟分家、子女教育和婚配。
- 扩展科举题库和官场事件，增加派系、人情、弹劾、升迁失败等。
- 改善移动端部分复杂小游戏的操作手感。
- 增加成就、图鉴、人生履历分享页。
- 给每个活动增加更明确的“收益 / 风险 / 年龄限制”提示。

## 建议给 Claude 的接手提示词

你正在接手一个名为 DynastyLife 古代人生 Web 的静态网页游戏。请先阅读 `CLAUDE_FABLE5_HANDOFF.md`、`README.md`、`index.html`，再重点阅读 `app.js` 的状态初始化、`normalizeState()`、`renderGame()` 和底部 click 事件委托。项目没有构建步骤，直接用静态服务器运行。修改时要保持旧 localStorage 存档兼容，不要提交 `.env.local`、`.vercel/` 或根目录验证截图。用户希望继续增强玩法、剧情、UI 和稳定性，优先保证现有功能不回退。

