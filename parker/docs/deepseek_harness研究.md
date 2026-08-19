# 从实践理解 DeepSeek Harness：一切皆插件、每一次运行都有迹可循、多种运行模式

> 研究与实验日期：2026-08-18（Asia/Shanghai）
>
> 源码基线：本仓库提交 `5a3f3dd5fd`。DeepSeek Harness 仍处于 Developer Preview，接口与社区生态都可能快速变化。

## 课程目标

学完本课程，你应该获得两种能力。

第一，能用自己的话解释并亲手体验 DeepSeek Harness 官方强调的三大特性：**一切皆插件（Everything is a plugin）**、**每一次运行都有迹可循（Every run is traceable）**、**多种运行模式（Multiple runtime modes）**。

第二，不再把 Cordis、Preset、Plugin、Effect、Fiber、Service、Event、Profile、Bundle、Patch 当作散乱术语，而是能把它们放回同一条执行链：Profile 选择组合，Bundle 和 Patch 改写组合，Plugin 挂载能力，Fiber 表示一次插件实例，Service 和 Event 连接插件，Effect 保证卸载时撤销贡献，Preset 再从这棵插件树中选择一套 Agent 能力。

---

## 第一章 官方如何介绍 DeepSeek Harness

### 1.1 官方原始资料

本章只用 DeepSeek 官方渠道、官方仓库，以及官方仓库直接引用的 Cordis 一手材料定义产品；社区资料只放到第四章。

| 资料 | 身份 | 本课程用它回答什么 | 入口 |
| --- | --- | --- | --- |
| DeepSeek Harness 产品页 | DeepSeek 官网 | 产品定位、三大特性、四种运行模式、官方演示 | [中文](https://www.deepseek.com/harness/) · [English](https://www.deepseek.com/harness/en/) |
| DeepSeek Harness 源码 | `deepseek-ai` 官方仓库，MIT | 实际实现、启动方法、配置和插件边界 | [GitHub](https://github.com/deepseek-ai/deepseek-harness) · [本地 README](../../README.zh.md) |
| DeepSeek Harness 文档 | 与官方仓库同步维护 | 用户指南、Develop 教程、架构和 API | [在线文档](https://deepseek-harness.github.io/deepseek-harness/) · [本地用户指南](../../docs/user/guide/index.zh.md) |
| *A Programming Paradigm for Spatiotemporal Composability* | 北京大学与 DeepSeek-AI 作者联署的 Cordis 论文 | 为什么插件可以动态加载、卸载、替换与重组 | [论文仓库](https://github.com/cordiverse/paper) · [PDF](https://github.com/cordiverse/paper/blob/948a07b369c62adb3b12e102458be5c18dfb69b9/paper.pdf) |
| Cordis | 官方 README 直接引用的底层框架 | Context、Fiber、Effect、Service、Event 的运行时实现 | [GitHub](https://github.com/cordiverse/cordis) · [本地教程](../../docs/cordis-tutorial/index.zh.md) |
| 官方发布与社区入口 | DeepSeek / DeepSeek Harness | 版本动态、讨论和插件发现约定 | [发布帖](https://x.com/deepseek_ai/status/2087887408440164663) · [Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions) · [Discord](https://discord.gg/Ycq5dCaS4) |

产品页内嵌了一段“实时定制页面元素、工具和 Agent Preset”的官方演示，但没有公开独立 MP4、YouTube 或 Bilibili 地址，所以本课程只链接[演示所在的官方页面](https://www.deepseek.com/harness/en/#products)，不伪造一个视频直链。

论文要解决的不是“怎么写一个 coding agent”，而是更底层的问题：一个长期运行的系统，怎样在**时间上**安全撤销组件造成的变化，又怎样在**空间上**根据依赖的出现、消失与替换重新组合组件。Cordis 把这两个问题分别落成可逆 Effect 与响应式依赖，DeepSeek Harness 再把它们用在模型、工具、会话、沙箱、存储、Agent Loop、调度和 UI 上。

### 1.2 Agent = Model + Harness

官方产品页把关系写成一句很短的公式：

> **Agent = Model + Harness**

模型负责推理与生成；Harness 负责把环境、工具、上下文、权限、持久化和执行循环组织起来。换句话说，同一个模型放进不同 Harness，能看到的上下文、可调用的工具、失败恢复方式和最终任务成功率都可能不同；评价 Agent 时不能把成绩全算到模型头上。

DeepSeek Harness 的特别之处，是没有把 Harness 再做成一个不可拆的“大内核”。官方 README 只给 Cordis 内核留下插件加载、卸载与依赖管理，Agent 能力则来自插件组合。配置大致经历下面这条链：

```text
Profile
  └─ 选择 Bundle
       └─ Bundle 提供 cordis.patch.yml
            └─ Patch 插入、删除或改写插件项
                 └─ Cordis Loader 挂载 Plugin
                      └─ 每个实例成为 Fiber
```

这里最容易混淆的几个词可以先这样记：

| 名词 | 先记住的含义 |
| --- | --- |
| Cordis | 管理插件树、依赖与生命周期的运行时，不是一个 Agent 模型 |
| Plugin | 向共享 Context 贡献一项能力的模块 |
| Fiber | 某个 Plugin 的一次运行时实例与生命周期句柄 |
| Effect | 插件加载时产生、卸载时必须被撤销的贡献或资源 |
| Service | 一个插件提供、其他插件通过名字注入并直接调用的能力 |
| Event | 发布方不需要知道监听者是谁的通知或协作协议 |
| Profile | 一次启动选择的依赖集合与 Bundle 集合，例如 `web` |
| Preset | 一个会话所选的 Agent 能力组合；它可以过滤工具、改 persona、换 loop 或增加子 Agent |

### 1.3 DeepSeek Harness 的三大核心特性

这一节保留官方产品页的原始标题，再结合官方图片与源码链接界定它到底承诺了什么。

**Everything is a plugin.** 官方列出的范围不只是模型工具，还包括 skills、session、sandbox、storage、agent loop、scheduling 和 UI。源码 README 也直接写明该架构由 Cordis 驱动。这里的“everything”是架构边界：这些能力都通过组合项进入运行时；它不表示任意第三方代码都天然安全，也不表示所有外部副作用都能无损回滚。

![DeepSeek Harness 官方插件架构图](https://deepseek.com/harness/images/harness/feat-plugin.png)

**Every run is traceable.** 官方把系统提示词、reasoning、工具调用与结果、上下文注入和子 Agent 调度放进 append-only Session Log，并由同一事实流支持 Trajectory、resume、fork、search 与 replay。模型上下文不是简单“把 `.log` 文件全文塞给模型”，而是从 Session 事件投影、过滤和编码得到；对应实操将在 2.2 完成。

![DeepSeek Harness 官方 Trajectory 视图](https://deepseek.com/harness/images/harness/trajectory-real-view.zh.png)

**Multiple runtime modes.** 官方提供的不是四个模型，而是四套 Harness 组合：

| 官方模式 | Harness 侧差异 | 适合感受什么 |
| --- | --- | --- |
| Standard | 文件、Shell、搜索、Skills、计划、目标、子 Agent 与工作流等完整能力 | 日常 coding agent |
| PTC / Code Mode | 保留完整能力，但让模型通过 TypeScript 程序组合多步工具 | 工具调用协议本身也可替换 |
| Minimal | 只保留持久 Bash 与 `str_replace_editor` | 在极简 Harness 中观察模型本体 |
| Creator | 在 Standard 上增加运行时检查、插件实验与 Preset 创作入口 | 创建自己的 Runtime |

因此，三大特性不是三条孤立广告语。插件化让不同能力可以组合；事件日志让组合运行之后仍可检查；Preset 与运行模式则把不同组合变成用户可选择的 Agent。

---

## 第二章 从实践体验三大特性

本课程以源码版本为准，继续使用你已经配置好 API Key 与插件的默认 `~/.dsh`，不要另设一个空的 `DSH_HOME`。从源码启动仍然会读取 `~/.dsh/profiles/web`：

```sh
cd /Users/parker/Documents/git/agents/deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

首次配置模型时进入 **设置 → 模型**；密钥写入 `$DSH_HOME/.credentials.yaml`，`settings.yaml` 只保留凭据引用，Web 页面不会回读明文。若出现 `EADDRINUSE: 3080`，说明已有 DSH 占用端口；先用 `lsof -nP -iTCP:3080 -sTCP:LISTEN` 找到旧进程，再决定复用还是停止它。

### 2.1 体验“一切皆插件”

下面不是命令输出回放器，而是一套可以逐步执行的 Code Workshop。左栏选择实验，中栏推进步骤，右栏显示当前步骤的代码、命令与结果；每个实验最后都有“启动 Web”和“打开页面验收”。直接打开静态 HTML 时仍可阅读和复制；若希望点击每一步后真实执行，并在当前结果框看到流式输出，先从仓库根目录启动本地执行器：

```sh
node parker/tutorial-labs/plugin-workshop/workshop-server.mjs
```

然后打开 `http://127.0.0.1:3090`。页面中的 28 个步骤均绑定了固定动作：代码步骤只写入指定教程文件，命令步骤在仓库根目录运行，浏览器步骤执行本地 HTTP 验收；执行器只监听 `127.0.0.1`，使用随机会话令牌，不开放任意 Shell 输入，也不允许写出当前仓库。

<iframe src="./labs/plugin-lab.html" title="DeepSeek Harness 插件代码 Workshop" style="width:100%;height:880px;border:1px solid #273043;border-radius:16px;background:#0b0d12" loading="lazy"></iframe>

如果当前 Markdown 阅读器或 GitHub 屏蔽 `iframe`，请直接打开[插件代码 Workshop](./labs/plugin-lab.html)。从零实验源码保存在 [`parker/tutorial-labs/plugin-workshop`](../tutorial-labs/plugin-workshop/README.md)，不是只存在于 HTML 字符串里。

Workshop 当前包含五个完整实验：

| 实验 | 从零写什么 | 怎样启动与验收 |
| --- | --- | --- |
| 三行烟花插件 | 本地 `apply()` 通过 `webServer.tapIndex()` 插入 `🎆` | 不编译、不安装；用 `--patch` 临时叠加到 Web，打开页面直接看到烟花 |
| 有依赖的工具插件 | Service Provider、Tool Consumer、Event Observer 与 Web Patch | 先做零费用 smoke，再在 3083 启动；页面手动调用 `parker_greet` |
| 蓝色蚂蚁 Web UI 插件 | 包清单、Host 入口、Client Slot、React 组件与 Patch | 构建、测试、打包、安装进 `web` Profile，重启后生成期间观察动画 |
| `dsh-find-plugin` | 不重写社区源码，而是完成来源审查、安装、重启与页面调用 | 在页面询问“帮我找一个 Git diff 插件” |
| `dsh-web-ui-all` | 审查聚合包实际带入的 Host/Client 能力 | 安装、`--dump-config`、重启，在页面核对任务看板、SSH 与文件面板 |

三行烟花插件采用与官方基础教程相同的启动方式：

```text
pnpm dsh web --patch ./parker/tutorial-labs/plugin-workshop/01-fireworks-plugin/cordis.yml --port 3082
dsh web: http://127.0.0.1:3082
```

工具实验也已经用 `ctx.tools.execute` 代替模型做过零费用验证：

```text
[parker-tool-logger] parker_greet -> 你好，Parker！这是 parkerGreeter 服务。
tool replied: [{"type":"text","text":"你好，Parker！这是 parkerGreeter 服务。"}]
```

这里同时出现三种协作方式：`parkerGreeter` 是 Service；工具注册是当前 Fiber 持有的 Effect；`tools/result` 是 Event。Web 页面中的最后一步再由你手动让模型调用工具，这样可以同时观察 Chat 工具行与终端 Observer 日志。

三行烟花实验故意不编译和安装，也不把插件写入默认 Profile。`cordis.yml` 只在带 `--patch` 的本次启动中插入绝对路径指向的本地 TypeScript 插件；插件通过 `webServer.tapIndex()` 修改返回的 `index.html`，因此打开页面即可看到右上角的 `🎆`。不带该 `--patch` 重启后，烟花消失。它用于解释最小插件和 overlay；正式的可复用浏览器组件仍应使用 `dsh.client` 与 Client Slot。

蓝色蚂蚁实验则完整展示“Web UI 也只是插件”：[`dsh-running-ant`](../ds_plugin/plugins/dsh-running-ant/README.md) 用 Client Slot 把 React 组件贡献到 `conversation.input.dock`，而不是修改官方页面源码；它已经通过 3 个测试文件、4 个测试，并以 tarball 安装到当前 `~/.dsh/profiles/web`。

**第五步：修改模型图片能力，体验配置热更新。** 官方[模型指南](../../docs/user/guide/providers.zh.md#图片输入)规定，手工录入的模型默认只有文本能力；只有端点真的支持图片时，才在 `$DSH_HOME/settings.yaml` 给该模型声明：

```yaml
llm-pi-ai:
  providers:
    my-gateway:
      apiKeyEnv: GATEWAY_API_KEY
      api: openai-completions
      baseURL: https://gateway.example/v1
      models:
        - id: vision-model
          input: [text, image]
```

保存后不用重启 DSH：`dsh-settings-file` 默认监听 `settings.yaml`，在 100ms 稳定窗口后热发布新分节；`dsh-llm-pi-ai` 校验整套候选配置，再原子替换模型路由，下一次请求看到新能力。我们运行了官方两个 loader composition 测试，结果为 2 个文件、3 个测试全部通过。

必须保留两个边界。第一，`input: [text, image]` 是你对端点能力的声明，不是 Harness 自动探测；声明错了会在真实请求中被 Provider 拒绝。第二，DeepSeek 自身 chat-completions 路由是纯文本，不能靠这行配置“变成视觉模型”；这个实验只适用于真正支持图片的自定义端点。

本节的结论不是“插件能加一个按钮”，而是：Tool、Service、Event、模型路由、配置监听与 Web UI 使用同一套 Plugin/Fiber/Effect 生命周期；差别只在它们向 Context 贡献了什么。

### 2.2 体验“每一次运行都有迹可循”

> 待下一阶段：直接选取当前已有会话，从 Session Log 到 Chat/Trajectory 投影逐条核对，不再额外制造对话。

### 2.3 体验“多种运行模式”

> 待下一阶段：比较 Standard、PTC、Minimal 与自定义 Preset，并完成“Codex + Claude Code 交叉 PR 评审”。

---

## 第三章 三大特性背后的 Cordis 设计

### 3.1 插件为什么能够加载、协作、替换和热更新

2.1 的五个实验其实是在观察同一套状态机。Cordis Loader 根据配置创建 Plugin 实例；每个实例都有一个 Fiber；Fiber 只有在 `inject` 的服务全部可用时才运行 `apply`；`apply` 通过 Context 注册服务、事件监听、工具或子插件；这些注册成为 Fiber 持有的 Effect；插件卸载、依赖消失或热更新时，Cordis 反向执行 disposer，再根据新依赖重新加载。

```text
配置项出现
   ↓
创建 Fiber ──缺服务──▶ PENDING
   │ 服务齐备
   ▼
LOADING ──apply 成功──▶ ACTIVE
   │ 依赖消失 / 配置删除 / HMR
   ▼
UNLOADING ──回卷 Effects──▶ DISPOSED
   └────────服务恢复时创建/激活新实例────────┘
```

**为什么插件可以“无序配置、有序启动”。** `inject = ['parkerGreeter']` 不是一次启动前的布尔检查，而是响应式依赖声明。Consumer 在 Provider 出现前保持 PENDING；Provider 出现后加载；Provider 运行中消失时，依赖它的 Consumer 也会先卸载；Provider 恢复后 Consumer 再加载。2.1 工具实验中的“故意缺少 Provider”与“零费用 Smoke”就是这条规则的直接对照。

**为什么插件可以互不引用却协作。** Service 适合直接调用：Provider 用稳定名字注册能力，Consumer 只注入名字和契约。Event 适合通知与拦截：发布者发出事件，不需要知道监听者数量和身份。工具实验中，`greet-tool`、`tool-logger` 与 `dsh-tools` 三方只通过 Service 与 Event 相遇，因此观察插件可以随时加减而不修改业务插件。

**为什么卸载不会留下重复监听器和幽灵工具。** Cordis API 建立的注册会自动归属当前 Fiber；显式 `ctx.effect()` 则把框架不知道的资源与 disposer 绑定起来。卸载时按逆序启动清理，子 Fiber 也会递归释放。2.1 中的 `ctx.tools.register()`、`ctx.on()` 与 Client Slot 注册都属于这类 Effect，因此移除工具、Observer 或蚂蚁插件时，对应工具、监听器和 UI 插槽会随 Fiber 一起撤销。

**为什么 Provider 可以替换。** Service Definition、Service Provider、Consumer 可以是三个独立角色。以 Shell 为例，定义层规定请求与结果，Provider 决定在本机、沙箱还是远程机执行，工具层只把它暴露给模型。配置替换 Provider 后，Cordis 先让依赖方退出，再挂载新 Provider 并恢复依赖方，避免 Consumer 持有已经失效的旧对象。

**为什么热更新不是在旧实例上“硬改代码”。** HMR 把更新拆成“卸载旧 Fiber → 回卷旧 Effects → 加载新模块 → 运行新 apply”。有稳定 `id` 的配置项让 Loader 只重配发生变化的子树。代码热替换使用 `@deepseek-ai/cordis-plugin-hmr`；模型实验走另一条同构路径：`settings-file` watcher 热发布配置，LLM 插件验证候选后原子替换注册。二者都依赖“旧贡献可以撤销，新贡献可以重新建立”。

**Profile、Bundle、Patch、Preset 分别在哪一层。** Profile 是进程启动时的依赖与 Bundle 集合；Bundle 通常通过 `cordis.patch.yml` 给基础插件树贡献差异；Patch 是组合操作，不是源码补丁；Preset 是会话级 Agent 配置，可在同一进程中选择不同 persona、工具过滤、loop 或子 Agent 组合。正因服务解析与 Effect 归属都落到具体 Fiber，同一进程里的两个 Preset 才能看到不同能力，而不必各自维护一份 Harness 源码。

把 2.1 与 3.1 一一对应，可以得到这张最小映射表：

| 2.1 的现象 | 3.1 的机制 |
| --- | --- |
| `parker_greet` 被执行，Observer 同时收到结果 | `tools` Service + `tools/result` Event |
| 缺 `parkerGreeter` 时 Consumer 是 PENDING | 响应式 `inject` / coeffect |
| 加回 Provider 后 Consumer 自动运行 | 依赖满足触发生命周期推进 |
| 工具、Observer 或 UI 插件卸载后注册随之消失 | Fiber 持有并回卷 Effect |
| 蚂蚁可安装、卸载，不改官方源码 | Profile → Bundle → Patch → Client Plugin |
| 保存模型模态后下一次请求生效 | Settings 热发布 + LLM 注册原子替换 |

这就是 Cordis 论文所说“时空可组合性”在 Harness 中最有体感的部分：时间上，旧组件的贡献可撤销；空间上，组件只在它依赖的能力存在时激活，并能随 Provider 变化重新组合。

### 3.2 日志为什么能够成为运行事实

> 待 2.2 实验完成后对应展开：append-only Session、事件投影、模型上下文、Trajectory、恢复与 fork。

### 3.3 不同模式为什么能在同一进程拥有不同能力

> 待 2.3 实验完成后对应展开：Preset、Context 隔离、工具过滤、Agent Loop 与 Subagent Provider。

---

## 第四章 社区与未来

### 4.1 社区插件的发现、安装与体验

官方目前没有类似 VS Code Marketplace 的审核式商店。官方 README 给出的发现约定，是给仓库添加 [`dsh-plugin`](https://github.com/topics/dsh-plugin) Topic；社区又建立了 [Awesome DSH Plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 与 `dsh-find-plugin`。GitHub Topic 只是标签，不是兼容性或安全认证，而且实际搜索已经混入大量与 DSH 无关或只顺手打标签的高 Star 仓库，所以不能把 Topic 的 Star 排行直接当“插件排行榜”。

本机已经实际安装并由最终 Cordis 配置确认的社区插件有两组：

| 包与版本 | 已验证的作用 | 安装命令 | 许可证 |
| --- | --- | --- | --- |
| [`dsh-find-plugin@0.3.6`](https://github.com/awesome-dsh-plugin/dsh-find-plugin) | 注册 `find_dsh_plugin` 工具，实时搜索 GitHub `dsh-plugin` Topic，并用 Awesome 清单的双语描述补充结果 | `pnpm dsh plugin --profile web add dsh-find-plugin` | MIT |
| [`@linxin666/dsh-web-ui-all@0.1.17`](https://github.com/zhu1090093659/dsh-web-ui) | 聚合任务看板、Git 图、宠物、远程 Web、实时统计、SSH、图片描述、皮肤等 Web 插件 | `pnpm dsh plugin --profile web add @linxin666/dsh-web-ui-all` | Apache-2.0 |

`dsh-web-ui-all` 是聚合包，不是单一按钮。当前本机 `--dump-config` 已看到 `ui-task-board`、`ui-git-graph`、`pet`、`live-stats`、`ssh`、`describe-image`、`ui-skin-center` 等组合项；它的优点是一条命令获得完整 Web 体验，代价是所有子插件一起激活，并且它固定依赖特定 `@deepseek-ai/*` SDK 版本，升级 DSH 时要重新检查兼容性。

安装、验证与卸载应当是一组动作，而不是只运行第一条命令：

```sh
cd /Users/parker/Documents/git/agents/deepseek-harness

# 安装
pnpm dsh plugin --profile web add dsh-find-plugin
pnpm dsh plugin --profile web add @linxin666/dsh-web-ui-all

# 查看最终组合，而不是只看 package.json
pnpm dsh --profile web --dump-config

# 完全重启 Web，前端插件才会重新装载
pnpm dsh web

# 不再需要时卸载
pnpm dsh plugin --profile web remove dsh-find-plugin
pnpm dsh plugin --profile web remove @linxin666/dsh-web-ui-all
```

日常发现可以直接对安装了 `dsh-find-plugin` 的 Agent 说：“找一个能查看 Git diff 的插件”或“找一个任务完成后通知我的插件”。但安装前至少审查五项：仓库是否真的含 `dsh.bundle.patch` 或 Client 声明；安装脚本会做什么；插件注入哪些 Service、监听哪些 Event、注册哪些工具；是否读写文件、网络或凭据；是否锁定版本或 commit。第三方插件与 Agent 处于同一进程时，获得的不是“主题皮肤权限”，而是它代码实际能访问的宿主权限。

本课程自己的 `dsh-running-ant` 提供了一个适合作为审查基线的小插件：功能单一、无网络、无持久化、插槽明确、4 个测试、可打包、可卸载。后续挑社区插件时，可以拿它对照“一个插件最少应说明哪些事情”。

### 4.2 DeepSeek Harness 对 Agent 发展的影响

DeepSeek Harness 最值得关注的不是“又多了一个 coding agent”，而是它把 Agent 产品从一个固定程序推向一个可组合运行时。模型、工具和 UI 只是第一层；当 Session、权限、Loop、调度和子 Agent Provider 也能成为插件时，团队可以复用同一宿主，为不同任务装配不同 Agent，而不是维护多个相互分叉的客户端。

第一种影响是 **Harness 成为可比较变量**。`Agent = Model + Harness` 意味着同模型评测必须记录工具集合、Preset、预算、上下文策略与并行方式。Minimal 与 Standard 的并存尤其有价值：前者更接近测模型，后者测完整系统；如果不写清模式，benchmark 分数就不可解释。

第二种影响是 **能力市场可能从工具市场升级为 Runtime 市场**。传统插件多增加一个命令或面板；DSH 插件还可以替换模型路由、持久化、沙箱、Agent Loop 与调度。这让“安装一种工作方式”成为可能，但也显著放大供应链风险：一个看似 UI 的 Bundle 可能同时带入 Host 工具、网络访问和后台任务。

第三种影响是 **动态重组让长期运行 Agent 更现实**。Fiber、Effect 与响应式依赖使插件能在不重启整个进程的情况下退出、替换和恢复；Session Log 又把运行事实从瞬时内存中分离出来。两者结合后，Agent 可以升级能力而不必丢掉历史。不过论文的形式化保证只覆盖满足前提的 Context 组合，不能自动回滚已经发送的网络请求、文件破坏或支付等外部事实。

第四种影响是 **Preset 把“Agent 身份”从品牌名变成配置**。标准模式、极简模式、Creator，以及后续的 Codex 协调模式，本质都是在同一宿主中选择不同 persona、工具、Loop 与 Provider。未来用户比较的可能不再只是“用哪个 Agent”，而是“在什么任务上采用哪套可审计组合”。

最后，社区能否真正繁荣取决于插件治理，而不只取决于数量。成熟生态至少需要可验证的 manifest、权限声明、兼容版本、锁定依赖、可重复测试、签名或来源证明，以及从 Profile 级别一键回滚。当前 `dsh-plugin` Topic 和 Awesome 清单解决了“被发现”，Cordis 生命周期解决了“能组合”，但“可信安装与长期兼容”仍是最重要的下一阶段。

---

当前完成范围：第一章、第四章、2.1 与 3.1。下一阶段将用同样的“真实实验 → 原理对应”方法完成 2.2/3.2 和 2.3/3.3。
