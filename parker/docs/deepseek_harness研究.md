# deepseek harness研究

> 研究日期：2026-08-16（Asia/Shanghai）
> 本章只收录 DeepSeek 官方、DeepSeek Harness 官方渠道，以及由官方仓库直接引用的 Cordis 一手资料。社区文章、转载和个人解读不作为本章事实依据。

## 第一章 官方资料

### 1.1 资料范围与证据分级

本研究把“官方资料”分成三档，避免把不同强度的来源混为一谈：

| 等级 | 判定标准 | 本章材料 |
| --- | --- | --- |
| A：DeepSeek 官方 | 发布于 `deepseek.com`、`deepseek-ai` GitHub 组织或 DeepSeek 官方账号 | 产品介绍页、DeepSeek Harness 源码仓库、官方文档、DeepSeek 官方 X 发布帖 |
| A-：项目一手资料 | 由 DeepSeek 官方页面或仓库直接链接，作者或维护方与项目有直接关系，但不托管在 `deepseek-ai` 组织下 | Cordis 论文、Cordis 源码仓库、Harness 官方 X/公众号/Discord |
| B：团队成员公开材料 | 作者身份可核验，但不代表 DeepSeek 组织正式口径 | 招聘帖、个人演讲或个人文章；只作线索，不承担核心技术结论 |

检索结论：截至 2026-08-16，已找到一篇 DeepSeek 官网产品介绍、一条 DeepSeek 官方发布帖、完整官方仓库与文档站、一篇 DeepSeek-AI 联署的 Cordis 论文，以及官网内嵌的产品演示。未检索到 DeepSeek 官方在 YouTube 或 Bilibili 单独发布的 DeepSeek Harness 介绍视频；第三方视频不列入本章。

### 1.2 官方资料索引

| 资料 | 发布方 / 作者 | 类型与时间 | 主要用途 | 链接 |
| --- | --- | --- | --- | --- |
| DeepSeek Harness developer preview: Everything is a plugin | DeepSeek | 官网产品发布与介绍页；2026-08-16 核验 | 最权威的产品定位、功能概览、运行模式和演示入口 | [中文](https://www.deepseek.com/harness/) · [English](https://www.deepseek.com/harness/en/) |
| DeepSeek Harness 源码仓库 | DeepSeek AI | 官方开源仓库；MIT；Developer Preview | 实现事实、版本、配置、文档和可复现实验的主要来源 | [GitHub](https://github.com/deepseek-ai/deepseek-harness) |
| DeepSeek Harness 官方文档站 | DeepSeek Harness | 随官方仓库维护 | 快速开始、用户指南、插件开发、架构和 API 文档 | [中文文档](https://deepseek-harness.github.io/deepseek-harness/) · [English](https://deepseek-harness.github.io/deepseek-harness/en/) |
| A Programming Paradigm for Spatiotemporal Composability | Yifan Shi、Wei Zhang、Tianyi Cui；北京大学 / DeepSeek-AI | 88 页预印本，Draft of 2026-08-13 | Cordis 的理论基础：可逆 effect、响应式 coeffect、动态组合演算 | [论文仓库](https://github.com/cordiverse/paper) · [固定版本 PDF](https://github.com/cordiverse/paper/blob/948a07b369c62adb3b12e102458be5c18dfb69b9/paper.pdf) |
| Cordis 源码仓库 | Cordiverse | DeepSeek Harness 官方直接引用的底层元框架 | 核对论文机制在运行时中的实现 | [GitHub](https://github.com/cordiverse/cordis) |
| DeepSeek Harness v0.1 Developer Preview 发布帖 | DeepSeek 官方 X 账号 `@deepseek_ai` | 2026-08-13 | 发布口径：开放源码、MIT、Cordis、“Everything is a plugin” | [X 帖子](https://x.com/deepseek_ai/status/2087887408440164663) |
| DeepSeek Harness 官方 X 账号 | DeepSeek Harness；由 DeepSeek 官网页脚直接链接 | 项目官方动态渠道 | 版本动态与项目公告 | [@Deepseekharness](https://x.com/Deepseekharness) |
| Harness 产品演示 | DeepSeek 官网 | 内嵌于产品介绍页，不是独立视频链接 | 演示实时定制页面元素、工具和 Agent Preset | [官网演示所在页面](https://www.deepseek.com/harness/en/#products) |
| GitHub Discussions | DeepSeek AI | 官方社区支持入口 | Bug、反馈和设计讨论 | [Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions) |
| DeepSeek Harness Discord | DeepSeek Harness | 官方 README 链接 | 英文社区交流 | [Discord](https://discord.gg/Ycq5dCaS4) |
| Harness 团队微信公众号 / 企微群 | DeepSeek Harness 团队 | 官方中文 README 和官网页脚提供二维码 | 中文公告、社区与后续文章线索 | [中文 README](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/README.zh.md#社区与支持) |

补充判断：官网中的“Watch how you can customize...”是一段页面内产品演示，官网前端把它标记为 `DeepSeek Harness product feature demo video`，但没有暴露可单独引用的 MP4、YouTube 或 Bilibili 地址。因此本研究把它列为“官网内嵌演示”，不虚构一个独立视频来源。

### 1.3 DeepSeek 官网对产品的定义

官网给出一个很清晰的关系式：

> Agent = Model + Harness

官网的解释是：模型是 Agent 的“灵魂”，Harness 负责让 Agent 理解环境、使用工具，并能在真实环境中持续工作。DeepSeek Harness 的中心设计不是提供一个不可更换的固定 Agent，而是把整个 Agent Runtime 拆成可组合插件。

官网把设计概括为三层：

1. **Cordis kernel**：负责插件挂载、卸载和依赖管理；Agent 能力本身位于插件中。
2. **Capabilities as plugins**：模型、工具、skills、会话、沙箱、存储、Agent loop、调度和 UI 都由插件提供，插件通过 Cordis 服务与事件协作。
3. **Compose with configuration**：开发者通过配置选择、替换或扩展能力，无需修改 DeepSeek Harness 源码。

官网还强调两项产品属性：

- **Everything is a plugin**：不只工具和模型是插件，连会话、存储、loop、调度和 UI 也在同一组合模型中。
- **Every run is traceable**：模型看到的系统提示词、reasoning、工具调用与结果、子 Agent 调度和上下文注入，都记录到 append-only session log；Trajectory 视图、恢复、fork、搜索与 replay 都建立在同一事件流之上。

官网列出四种运行模式：

| 模式 | 官方定位 |
| --- | --- |
| Standard | 完整 coding agent：文件编辑、shell、文件与 Web 搜索、skills、plan、goal、subagents 和 workflows |
| Code | Standard 的全部能力，同时通过 Code Mode SDK 暴露工具，让模型用一段 TypeScript 程序编排多步工具调用 |
| Minimal | 只保留持久 Bash 与 `str_replace_editor`，用于在极简环境中评测模型 |
| Creator / Cordis | 在 Standard 基础上增加运行时检查、内存插件实验和 Agent Preset 编写能力，用来创建自定义 Runtime |

这页官网介绍的价值在于它给出了产品意图；具体语义仍应以固定提交的源码和架构文档为准。

### 1.4 官方源码仓库：可复现基线

本地研究副本：`/Users/parker/Documents/git/agents/deepseek-harness`。该 checkout 的 `origin` 是 Parker 的 fork `parkerdu/deepseek-harness`，官方仓库保留为只读同步来源 `upstream`。

| 项目 | 固定值 |
| --- | --- |
| 官方仓库 | `deepseek-ai/deepseek-harness` |
| 研究 fork | `parkerdu/deepseek-harness` |
| 本地提交 | `47f943859bef60e4160492346772ded9b24f765a` |
| 提交时间 | 2026-08-13 19:38:46 +08:00 |
| 包版本 | `0.1.0-rc.5` |
| 许可证 | MIT |
| Node.js 要求 | `^22.19.0` 或 `>=24.0.0` |
| 状态 | Developer Preview；官方明确警告会有破坏兼容性的变更 |
| GitHub Releases | 截至 2026-08-16 为空；本地提交也没有 tag |

发布口径中的“v0.1”与本地源码的 `0.1.0-rc.5` 不应被写成同一个不可变发布物：前者是发布宣传名称，后者是当前固定源码包版本。因为没有 GitHub Release 或 tag，本研究以提交哈希而不是“v0.1”作为复现标识。

官方 README 给出的最快启动方式是：

```bash
npx @deepseek-ai/dsh web
```

从源码运行则是：

```bash
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

官方架构文档给出的核心结论是：运行中的 `dsh` 是一棵 Cordis 插件树；profile、bundle 和 patch 逐层组合出最终 Runtime。不存在一个需要打补丁的“特权 Agent 内核”，默认 agent loop 也只是插件贡献的一项实现。

#### 1.4.1 最值得优先阅读的官方文档

| 阅读顺序 | 文档 | 它回答的问题 |
| --- | --- | --- |
| 1 | [README.zh.md](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/README.zh.md) | 产品是什么、如何启动、处于什么发布阶段 |
| 2 | [architecture.zh.md](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/architecture.zh.md) | 插件树、profile/bundle、事件域、turn/step 流程、能力 seam |
| 3 | [cordis-primer.zh.md](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/cordis-primer.zh.md) | Cordis 的 Context、Service、Event、Fiber 和可逆 Effect |
| 4 | [agent-lifecycle.zh.md](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/agent-lifecycle.zh.md) | 一条输入如何经过 turn、step、模型请求、工具和结束条件 |
| 5 | [session 子系统](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/session.md) | append-only 事件日志、消息投影、fork/replay 与格式约束 |
| 6 | [subagent 子系统](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/subagent.zh.md) | one-shot 与 continuable 子 Agent、inbox、授权和生命周期 |
| 7 | [Codex 子 Agent Provider](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/subagent/subagent-codex/README.zh.md) | DSH 如何用 Codex app-server 执行一次委派 |
| 8 | [Web UI 指南](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/user/guide/index.zh.md) | 模型配置、工作区选择、任务运行和审批 |

### 1.5 论文精读：A Programming Paradigm for Spatiotemporal Composability

#### 1.5.1 论文身份与它和 Harness 的关系

- 作者：Yifan Shi、Wei Zhang、Tianyi Cui。
- 单位：北京大学、DeepSeek-AI；Yifan Shi 同时署名两家单位，Tianyi Cui 署名 DeepSeek-AI。
- 版本：88 页预印本，PDF 生成日期与仓库 Draft 均为 2026-08-13。
- 固定提交：`948a07b369c62adb3b12e102458be5c18dfb69b9`。
- 状态：作者明确标注为 active revision 的 preprint，内容可能发生较大变化。

这篇论文研究的直接对象是 **Cordis 的动态组合理论**，不是 DeepSeek Harness 的功能说明书，也不是 Harness benchmark。DeepSeek Harness 官方 README 和官网都直接引用它，因为 DSH 使用 Cordis 作为插件组合内核。

更准确的关系是：

```text
时空可组合性理论
        ↓ 形式化与运行时机制
      Cordis
        ↓ 作为插件元框架
DeepSeek Harness
        ↓ 组合模型、工具、会话、沙箱、Loop、UI 等 Agent 能力
    具体 Agent Runtime
```

论文的生产案例是 Koishi，而不是 DeepSeek Harness。论文结尾把“self-evolving agent harnesses”列为未来验证方向，因此不能反过来声称论文已经证明 DSH 能安全自我演化。

#### 1.5.2 论文要解决的问题

传统组合多在编译期完成，例如函数调用、模块导入和类继承。插件系统与未来可自修改的 Agent Harness 则要求组件在运行时加载、卸载、替换和重新配置。论文把动态组合拆成两个正交维度：

| 维度 | 论文定义 | 工程问题 |
| --- | --- | --- |
| Temporal composability（时间可组合性） | 组件卸载时，它对共享环境造成的修改能够被完整、安全地撤销 | 如何把资源分配、事件注册、状态修改和子组件创建全部回收，而不是重启整个进程 |
| Spatial composability（空间可组合性） | 组件能声明依赖，并在依赖出现、消失或更换时由 Runtime 响应式管理 | 如何保证组件只在依赖满足时激活，并在 Provider 变化时按依赖顺序卸载或重载 |

进程重启、容器重建和服务编排能在粗粒度上近似解决问题，但会丢失进程内缓存、连接和中间计算，也无法表达同一进程内插件之间的细粒度依赖。论文希望把组合粒度下沉到组件本身。

#### 1.5.3 五项主要贡献

1. **Revertible effects**：每次上下文变换都携带显式逆操作，Runtime 负责跟踪；组合操作按 LIFO 顺序组合逆操作，使组件卸载时能恢复上下文。
2. **Reactive coeffects**：组件声明它从环境中需要什么；上下文变化时，Runtime 把变化分类为 activating、deactivating 或 neutral，并触发相应生命周期变化。
3. **Unified context**：把 effect context 与 coeffect context 统一为一个一等 Context；effect 描述组件如何改变环境，coeffect 描述组件依赖环境中的什么。
4. **动态组合演算**：把组件、Fiber、注册表、加载/卸载、异步、迭代和失败纳入同一个操作语义，并证明系统级性质。
5. **Cordis 实现**：提供 effect 跟踪、coeffect 解析、声明式配置 reconciliation 与 HMR，并以 Koishi 生态作案例。

#### 1.5.4 Effect：为什么卸载能“撤销”

Cordis 约定修改 Context 的操作要通过 `ctx.effect(callback)`。`callback` 执行正向操作，并返回或逐步 yield 对应的 inverse。Runtime 把这些 inverse 组合成一个 disposer，卸载时按后进先出顺序执行。

简化后的直觉如下：

```text
加载组件
  ├─ 注册工具 A        → 记录“注销 A”
  ├─ 注册事件监听 B    → 记录“取消监听 B”
  └─ 创建子组件 C      → 记录“卸载 C”

卸载组件
  └─ 卸载 C → 取消 B → 注销 A
```

关键限制是：Runtime 只负责跟踪和调用 inverse，**不会自动证明 inverse 是正确的**。组件作者仍有义务提供能恢复正向操作的逆操作。

#### 1.5.5 Coeffect：依赖如何响应式变化

组件把依赖声明为 coeffect specification，把自己能提供的 key 声明为 provision。上下文中的 key 由 Provider Fiber 提供；当 Provider 出现、退出或换成另一个 Fiber 时，Runtime 重新计算依赖组件的 target view。

- 依赖从不满足变为满足：组件进入加载流程。
- 依赖从满足变为不满足：组件先停止对外提供，再等待依赖它的组件完成卸载，最后撤销自己的 effect。
- 依赖仍满足且 Provider 身份未变：变化为 neutral，不必重载。
- 同一个 key 换了 Provider：即使值相等，由于 Provider uid 不同，依赖组件仍会重载。

论文还区分：

- **Isolation** 改变某个 key 解析到哪个 realm / binding。
- **Interception** 不改变依赖是否满足，而是在调用 binding 时附加权限或策略元数据。

这为 DSH 的 per-agent 能力隔离、工具权限和可替换 Provider 提供了底层组合语言，但具体安全强度仍取决于上层 Provider 与沙箱实现。

#### 1.5.6 Component、Fiber 与生命周期

论文把组件形式化为三元组：

```text
Component = (required dependencies, provided keys, witnessed effects)
```

组件的一次运行时实例叫 **Fiber**。Fiber 保存父 Fiber、自己的依赖表、退役标记、已提交依赖视图、effect accumulator 和生命周期状态。Cordis 中 `ctx.use(component, config)` 创建 Fiber；父组件的 effect 回收时会级联卸载子 Fiber。

实际生命周期不是简单的 Active / Inactive 二态。论文把 withdrawal、逐步迭代、异步执行和失败加入演算；实现中主要表现为 `LOADING`、`ACTIVE`、`UNLOADING`、`INACTIVE` / `FAILED` 以及一个代表进行中异步转换的 inertia handle。

Provider 卸载的顺序尤其重要：

1. Provider 先标记为 `UNLOADING`，立即停止满足新的依赖解析。
2. 通知依赖它的 Fiber，使下游开始卸载。
3. 等待下游进入 `INACTIVE`。
4. 最后执行 Provider 自己的 disposer。

因此销毁顺序沿依赖图从消费者向 Provider 回退，而加载则只在依赖已经满足时开始。

#### 1.5.7 论文声称并证明了什么

在论文列出的假设成立时，演算给出以下系统级结果：

| 性质 | 直观含义 |
| --- | --- |
| Preservation | 每一步生命周期转换都保持注册表良构：父指针有效、Provider 不冲突、已加载 Fiber 的依赖视图完整 |
| Recovery exactness / Terminal recovery | 卸载一个 Fiber 会移除它自己的贡献，同时保留期间其他独立 Fiber 产生的变化 |
| Ordering | Fiber 只会在依赖由 Active Provider 提供时开始转换；Provider 退出前先让依赖方退出 |
| Resolution coherence | 一次加载 episode 使用一致的依赖视图，不横跨两套 Provider 解析结果 |
| Progress | 在依赖关系无环、步骤有限等条件下，生命周期转换最终会推进到静止状态 |
| Confluence | 对彼此独立的组件，不同合法调度顺序到达等价的静止状态；最终状态主要由最终组合决定，而不是中间装配顺序 |

这些保证有明确前提，不能省略：effect 之间需要满足独立 / 可交换条件，依赖图需要无环，组件需要按声明提供 key，相关步骤需要有限；Confluence 还排除了失败状态。论文保证的是最终 Context 状态等价，不保证执行过程中已经发出的外部输出完全相同。

#### 1.5.8 Cordis 的工程映射

| 论文概念 | Cordis 运行时接口 |
| --- | --- |
| 一等 Context | `ctx` |
| 可逆 effect | `ctx.effect(callback)` 与 disposer accumulator |
| coeffect 读写 | `ctx.get(key)`、`ctx.set(key, value)` |
| 依赖隔离 | `ctx.isolate(key, realm)` |
| 调用拦截 / 元数据 | `ctx.intercept(key, metadata)` |
| 组件实例化 | `ctx.use(component, config)` |
| 组件实例 | `fiber` |
| 所需依赖 | `fiber.inject` |
| 生命周期实现 | `fiber.apply`、`fiber.state`、`fiber.dispose`、`fiber.inertia` |
| 声明式组合 | Loader entry tree |
| 配置更新 | keyed reconciliation，尽量执行最小扰动更新 |
| 代码热替换 | 模块分类 → stale entry 检测 → 带回滚的 transactional reload |

HMR 的重要设计是：Fiber 已经界定了组件的 effect 与 coeffect，所以替换模块时先 dispose 旧 Fiber，再从新模块创建 Fiber；若新模块导入失败，则恢复模块缓存并从备份重建旧 Fiber，避免停在“只替换了一半”的状态。

#### 1.5.9 案例与证据强度

论文的案例是 Koishi：一个基于 Cordis 的开源聊天机器人框架，拥有超过 4000 个社区插件。案例说明 Cordis 能支持服务端插件系统和浏览器控制台两种不同 Runtime，并能在不重启整个进程的情况下禁用插件、热替换插件和响应式切换 Provider。

但作者明确给出三项限制：

- 只有一个生态和一种宿主语言，无法分离“理论范式”“TypeScript 实现”和“Koishi 领域”的影响。
- 这是观察性案例，不是与其他架构的受控实验。
- 它证明的是存在性与采用情况，不是性能或开发效率优势；运行时开销和生产力对照仍是未来工作。

另外，案例中的 Koishi 当前使用 Cordis v3，而论文描述的是改进后的 Cordis v4。两者共享核心组合模型，但不能假定所有 v4 语义都已经被 Koishi 四年历史完整验证。

#### 1.5.10 论文不能替产品证明的事情

1. **不能证明任意外部副作用都可回滚。** 文件写入、网络发送、支付等 emission 一旦越过系统边界，通常只能延迟提交或做补偿事务，不能依靠普通 disposer 抹去。
2. **不能证明插件 inverse 一定正确。** Runtime 跟踪 inverse，但正确性仍由组件作者承担。
3. **不能替代安全沙箱。** `inject` 与 interception 能约束通过 Context 代理访问的能力；恶意代码若能直接访问宿主对象，仍需要进程、Wasm、容器或其他外部沙箱。
4. **不能自动解决循环依赖。** Progress 证明以依赖无环为前提；互相依赖需要更粗粒度组件、延迟注入或专门 Broker。
5. **不能自动解决独立包的接口漂移。** Cordis 当前借助 peer dependency 做版本约束；结构兼容、行为契约与 key collision 仍是开放问题。
6. **不能证明 DeepSeek Harness 已经实现自我演化。** 论文只把 self-evolving agent harness 作为未来验证方向。
7. **不能提供 Agent 能力 benchmark。** 论文没有比较 SWE-bench、Terminal-Bench、成本、token、延迟或不同 Harness 的任务成功率。

### 1.6 论文与 DeepSeek Harness 源码的对应判断

把论文和固定源码放在一起，可以得到以下较稳妥的结论：

| 论文层 | DSH 工程层 | 判断 |
| --- | --- | --- |
| Context 统一 effect 与 coeffect | 所有插件通过 `ctx` 访问服务、事件和生命周期 | 直接对应 |
| 可逆 effect | 工具、服务、事件等注册返回 disposer，并由 Fiber 持有 | 直接对应，但第三方插件仍需正确实现清理 |
| 响应式 coeffect | 插件用 `inject` 声明依赖，Provider 变化触发生命周期调整 | 直接对应 |
| Component / Fiber | 每个 Cordis 插件实例拥有独立 Fiber 与子 Context | 直接对应 |
| 声明式 Loader 与 reconciliation | `cordis.yml`、profile、bundle、patch 组合 Runtime | 直接对应 |
| HMR / 自修改 | DSH 提供 Creator 模式和自修改插件实验 | 有工程入口；不等于已经证明长期自主自修改安全 |
| “一切皆插件” | 模型、工具、会话、沙箱、loop、subagent、UI 都是插件 | DSH 对论文范式的核心产品化 |
| append-only session log | 模型可见内容必须可由事件日志重建 | DSH 自己的 Agent Runtime 设计，不是论文 effect/coeffect 理论的必然结论 |

尤其要分清最后一项：**“会话日志是模型上下文的事实来源”来自 DeepSeek Harness 的架构约束，而不是时空可组合性论文直接推出的定理。** Cordis 解释插件如何安全组合，Session 子系统解释 Agent 历史如何持久化、投影和回放；二者在 DSH 中相遇，但属于不同层次。

### 1.7 当前官方资料的空白

截至研究日期，官方资料仍有以下空白，后续应持续追踪：

- 没有正式 tagged release 或 GitHub Release，当前只能用提交哈希复现。
- 没有官方发布的稳定兼容性承诺；项目明确处于 Developer Preview。
- 没有公开的 DSH 自身 benchmark 报告，无法从官方资料判断它相对 Codex、Claude Code 或 OpenCode 的任务成功率与成本。
- 没有公开的 Runtime 开销测量，例如 Cordis effect/coeffect、事件日志、插件隔离带来的 CPU、内存和延迟成本。
- 没有找到 DeepSeek 官方 YouTube / Bilibili 独立介绍视频；目前只有官网内嵌产品演示。
- 论文仍是 active-revision preprint，且自演化 Harness 是未来验证方向。

### 1.8 本章结论

DeepSeek Harness 的独特之处不只是“插件很多”，而是把 **Agent Runtime 本身**——包括模型路由、工具、上下文注入、会话、持久化、沙箱、子 Agent、调度、agent loop 和 UI——统一放进可组合、可卸载的插件系统。Cordis 论文为这种设计提供了两个核心概念：用可逆 effect 管理组件对环境的修改，用响应式 coeffect 管理组件对环境的依赖。

但官方资料当前更能证明“架构设计与形式化意图”，还不能证明“相对其他 Harness 的实际先进性”。后续研究必须继续回到固定源码、可复现实验和同模型 benchmark，分别测量任务成功率、成本、延迟、故障恢复、上下文效率与安全边界。

## 第二章 核心特性

本章按照 [DeepSeek Harness 官方产品页](https://www.deepseek.com/harness/) 的表述拆解核心特性，并把官网口号落实为可操作的源码结构、配置和案例。研究日期为 2026-08-16；项目仍处于 Developer Preview，社区项目的兼容性和安全性都可能快速变化。

### 2.1 官网核心特性全景

官网实际重点介绍三项设计特性，第四项子 Agent 能力则出现在 Standard mode 的能力描述和官方源码中：

| 特性 | 官网表述 | 工程含义 | 本章案例 |
| --- | --- | --- | --- |
| 一切皆插件 | Everything is a plugin | 模型、工具、Skill、会话、沙箱、存储、loop、调度和 UI 都由 Cordis 插件提供 | 把蓝色蚂蚁 UI 从核心源码迁成外置插件，再开发一个 `greet` 工具插件 |
| 每次运行都可追踪 | Every run is traceable | 模型所见内容和 Agent 行为写入同一条 append-only Session 事件流 | 在 Trajectory 查看调用，并定位磁盘日志 |
| 多种 Runtime 模式 | Multiple runtime modes | Standard、Code、Minimal、Creator 是四套可选择的 Agent preset | 分别说明选择方法和适用任务 |
| 可替换的子 Agent 后端 | Standard mode includes subagents | 同一 `ctx.subagents` seam 可接进程内 Agent、ACP、Codex、Claude Code 等不同后端 | 让 DSH 调用 Codex 和 Claude Code 做独立审查 |

需要先明确：DSH 的“插件”不是只指聊天工具。它既可以是一项很小的能力，也可以替换模型适配器、会话存储、沙箱、Agent loop，甚至整个 Web UI。因此它更接近 **Runtime 组件模型**，而不是传统浏览器扩展商店。

### 2.2 Everything is a plugin：到底什么都能换吗

#### 2.2.1 插件在 DSH 中的四个层次

| 层次 | 作用 | 典型文件/接口 | 是否直接给模型看见 |
| --- | --- | --- | --- |
| Cordis Plugin | 在 `apply(ctx)` 中注册服务、事件或 effect | `index.ts`、`apply(ctx)`、`inject` | 不一定 |
| DSH Tool Plugin | 向 `ctx.tools` 注册带 schema 的模型工具 | `defineTool(...)` | 是，形成 tool schema |
| DSH Bundle | 用一个 patch 把一组插件装入 profile | `package.json` 的 `dsh.bundle`、`cordis.patch.yml` | 取决于其中插件 |
| Agent Preset | 决定某类新会话使用哪些工具、Prompt、压缩和委派能力 | `agent.cordis.yml`、`preset.yml` | 是，决定该 Agent 的完整表面 |

Skill 和 MCP 也能被插件接入，但它们与 Cordis Plugin 不是同一个概念：Skill 主要是按需加载的模型指令；MCP 是外部工具协议；Cordis Plugin 则是在 DSH 进程内参加生命周期和依赖组合的 Runtime 组件。

“可替换”的实现基础是：

1. 插件只声明依赖的服务名，例如 `inject = ['tools']`，而不是绑定某个实现类。
2. 插件的注册行为由所属 Fiber 记录；卸载 Fiber 时按逆序执行 disposer。
3. Provider 消失时，依赖它的插件进入停止或等待状态；Provider 恢复后重新激活。
4. `cordis.yml` 和 bundle patch 决定最终组合，无需修改 DSH 核心源码。

它并不意味着所有插件可以任意混装：服务名可能冲突，插件可能要求特定 DSH 版本，前端插件可能依赖尚未稳定的 UI slot，恶意或错误的插件也可能直接影响宿主进程。

#### 2.2.2 实操第一课：把蓝色蚂蚁 UI 做成真正的外置插件

这次实操先回答一个最容易混淆的问题：**代码使用 Cordis Plugin API，不等于它已经是可独立安装的社区插件。**

最初的“运行中蓝色蚂蚁”虽然实现成了 Cordis Client Plugin，但采用了内置插件的集成方式：

```text
deepseek-harness/
├── packages/client/ui-running-ant/       # 放进官方 monorepo
├── packages/bundle/web-app/package.json  # Web App 直接依赖
└── packages/bundle/web-app/cordis.patch.yml
                                           # 每个 Web profile 强制加载
```

这种做法有三个问题：

1. 修改了官方源码，升级或切换 checkout 时容易产生冲突。
2. 插件构建失败会阻断整个 `dsh-web-app`；本次实际故障就是 package 入口声明为 `lib/index.js`，但只创建了 `src/`，启动时报 `ERR_MODULE_NOT_FOUND`。
3. 无法像普通插件一样针对某个 profile 安装、升级和卸载。

##### 第一步：建立独立的多插件工作区

迁移后，官方源码和个人插件是兄弟目录：

```text
/Users/parker/Documents/git/agents/
├── deepseek-harness/            # 官方源码，git status 保持干净
└── ds_plugin/                   # 个人插件 workspace
    ├── shared/                  # 后续 UI 插件复用的浏览器构建工具
    ├── plugins/
    │   └── dsh-running-ant/
    └── dist/
```

`ds_plugin/pnpm-workspace.yaml` 使用 `plugins/*` 作为成员，因此以后可以继续增加 `plugins/<新插件>`，共享构建和测试基础设施。

插件包命名为 `dsh-running-ant`，不再使用 `@deepseek-ai/*`：第三方包使用官方 npm scope 会误导来源，而且普通开发者也没有该 scope 的发布权限。

##### 第二步：一个包同时声明 Client Plugin 与 DSH Bundle

关键 manifest 结构是：

```json
{
  "name": "dsh-running-ant",
  "version": "0.1.0",
  "main": "lib/index.js",
  "exports": {
    ".": "./lib/index.js",
    "./client": "./lib/client.js"
  },
  "dsh": {
    "bundle": {
      "patch": "./cordis.patch.yml"
    },
    "client": {
      "inject": [
        "@deepseek-ai/dsh-client-runtime",
        "@deepseek-ai/dsh-client-ui-conversation"
      ],
      "platform": "web"
    }
  }
}
```

- `dsh.client` 告诉 Web ModuleLoader，这个包存在浏览器端插件产物。
- `dsh.bundle.patch` 让 `dsh plugin add` 把插件行合并进目标 profile。
- `lib/index.js` 是 Host 侧空入口；`lib/client.js` 是按 DSH ModuleLoader 协议打包的 React/CSS 浏览器闭包，两者缺一不可。

`cordis.patch.yml` 不再修改官方 Web bundle，而是随插件自身发布：

```yaml
- insert:
    - id: ui-running-ant
      name: dsh-running-ant
```

浏览器端通过 `ctx.slots.inject('conversation.input.dock', ...)` 等待输入框 slot 出现，再注册唯一 ID `running-ant`。它只读取当前会话的 `snapshot.running`：生成时显示蚂蚁，停止后返回 `null`；不增加 Prompt、模型工具、网络请求或持久化数据。

##### 第三步：先构建和打包，再安装

```sh
cd /Users/parker/Documents/git/agents/deepseek-harness/parker/ds_plugin

pnpm install
pnpm build
pnpm test
pnpm pack:running-ant
```

本次实际结果是：3 个测试文件、4 项测试通过，并生成：

```text
/Users/parker/Documents/git/agents/deepseek-harness/parker/ds_plugin/dist/dsh-running-ant-0.1.0.tgz
```

使用 tarball 而不是直接安装 TypeScript 目录，可以在安装前验证 `lib/index.js`、`lib/client.js`、类型文件和 patch 确实进入发布包，也避免在插件安装阶段运行未知的构建脚本。

##### 第四步：像社区插件一样装进 profile

本机当前没有全局 `dsh`，所以这里使用源码 checkout 提供的 `pnpm dsh` 作为启动器：

```sh
cd /Users/parker/Documents/git/agents/deepseek-harness

pnpm dsh plugin --profile web add \
  file:/Users/parker/Documents/git/agents/deepseek-harness/parker/ds_plugin/dist/dsh-running-ant-0.1.0.tgz
```

注意：命令从 `deepseek-harness` 目录执行，不代表插件安装进了该源码目录。真正变化的是：

```text
~/.dsh/
└── profiles/web/
    ├── package.json
    ├── pnpm-lock.yaml
    └── node_modules/dsh-running-ant/
```

验证最终组合：

```sh
pnpm dsh --profile web --dump-config
```

本次输出中出现：

```yaml
# == dsh-running-ant
- id: ui-running-ant
  name: dsh-running-ant
```

随后实际启动 Web 页面，浏览器中出现 `style[data-plugin="dsh-running-ant"]`，空闲状态没有 `[data-running-ant]`；组件测试则确认 `running=true` 时渲染蚂蚁。这说明 Host、bundle patch、浏览器产物和显示条件四层都已接通，而不只是“文件复制成功”。

卸载时同样不碰官方源码：

```sh
pnpm dsh plugin --profile web remove dsh-running-ant
```

迁移完成后，`deepseek-harness` 中原来的 package、Web bundle 依赖、patch、TypeScript reference 和 lockfile 条目全部移除，核心仓库 `git status` 恢复干净。

#### 2.2.3 实操第二课：开发一个真正能被模型调用的插件

下面的例子将 `greet` 注册为模型工具。它比只打印一行日志的 Hello World 更能体现 DSH 插件的实际用途。

新建目录：

```sh
mkdir -p greet-plugin
```

`greet-plugin/package.json`：

```json
{
  "name": "dsh-greet-plugin",
  "version": "0.1.0",
  "type": "module",
  "main": "index.js",
  "files": ["index.js", "cordis.patch.yml"],
  "dependencies": {
    "@deepseek-ai/dsh-tools": "0.1.0-rc.5"
  },
  "dsh": {
    "bundle": {
      "patch": "./cordis.patch.yml"
    }
  }
}
```

`greet-plugin/index.js`：

```js
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'greet-plugin'
export const inject = ['tools']

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'greet',
    description: 'Greet the named person.',
    parameters: {
      name: {
        type: 'string',
        required: true,
        description: 'Who to greet',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      return `Hello, ${args.name}!`
    },
  }))
}
```

`greet-plugin/cordis.patch.yml`：

```yaml
- insert:
    - id: greet-tool
      name: dsh-greet-plugin
```

将本地插件装进 Web profile：

```sh
npx @deepseek-ai/dsh plugin --profile web add ./greet-plugin
npx @deepseek-ai/dsh --profile web --dump-config
npx @deepseek-ai/dsh web
```

在新会话中输入：

```text
请调用 greet 工具向 Parker 打招呼，不要直接在文本中模拟结果。
```

如果插件成功挂载，Trajectory 中会出现 `greet` 的 tool call 和 tool result。卸载命令是：

```sh
npx @deepseek-ai/dsh plugin --profile web remove dsh-greet-plugin
```

此例的关键不是 `Hello`，而是 `ctx.tools.register(...)` 返回的注册 effect 归当前插件 Fiber 所有：插件被卸载时，`greet` 工具也随之从工具表中消失。

> 版本提示：本地源码锁定的是 `0.1.0-rc.5`，包依赖版本应以实际安装的 DSH 版本为准。Developer Preview 阶段不应把上面的 semver 写法当作长期兼容承诺。

#### 2.2.4 从本地插件到别人可以安装的 bundle

DSH 当前支持四种分发来源：

```sh
# npm：推荐，通常拿到预构建产物
dsh plugin --profile web add your-package

# GitHub：安装源码，最好锁定 commit
dsh plugin --profile web add github:owner/repo#<commit-sha>

# 本地 tarball
dsh plugin --profile web add ./your-package-0.1.0.tgz

# 本地目录
dsh plugin --profile web add ./your-package
```

一个包即使能被 pnpm 安装，也不一定能自动激活。只有在 `package.json` 中声明 `dsh.bundle.patch`，DSH 才会把它加入 profile 的 bundle 层；普通依赖只会被安装，不会改变 Runtime 组合。

GitHub 源码安装还有一个常见问题：TypeScript 仓库通常需要 `prepare` 构建，而 pnpm 10 之后默认不允许未知依赖在安装期执行构建脚本。允许构建等同于允许第三方代码在 Agent 沙箱之外、以当前用户身份执行。应先审查源码，并优先使用固定 commit：

```sh
dsh plugin --profile web add github:owner/repo#0123456789abcdef
```

安装后先检查组合，再启动：

```sh
dsh --profile web --dump-config
dsh web
```

#### 2.2.5 现在有没有官方插件市场

**没有官方审核型插件市场。** 截至研究日期，官方提供的是：

- `dsh plugin --profile ... add/remove`：包安装与 profile 组合机制；
- [GitHub `dsh-plugin` Topic](https://github.com/topics/dsh-plugin)：官方 README 和官网指向的社区发现入口；
- GitHub Discussions、企微群和公众号：交流与反馈渠道。

这三者不能等同于 App Store。Topic 由仓库作者自行添加，没有官方审核、签名、兼容性测试或恶意代码扫描。研究当日 Topic 页面显示数千个仓库，但可见结果中存在大量与 DSH 无直接关系、只是添加了该 Topic 的项目，因此总数不能作为“可用插件数量”。

社区已经补出了自己的市场层：

| 社区项目 | 作用 | 安装方式 | 证据边界 |
| --- | --- | --- | --- |
| [dsh-market](https://github.com/dsh-market/dsh-market) | Web 设置页中的搜索、安装、更新、卸载和主题切换 | `dsh plugin --profile web add dshmarket` | 第三方市场；其精选列表不是安全审计 |
| [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) | 双语精选目录，要求条目能通过 `dsh plugin add` 安装 | 浏览目录或给市场供数 | 社区维护；不属于 DeepSeek 官方 |
| [dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin) | 给 Agent 增加 `find_dsh_plugin` 工具，让 Agent 自己找插件 | `dsh plugin --profile web add dsh-find-plugin` | 搜索依赖 GitHub Topic，仍需人工审查结果 |

因此，“别人的插件能否拿来即用”的准确答案是：**格式兼容时通常可以一条命令安装，但不能默认可信，也不能默认与当前 RC 版本兼容。**

建议采用以下安装门槛：

1. 检查仓库是否确实包含 `dsh.bundle` 和对应 patch，而不是只贴了 `dsh-plugin` Topic。
2. 查看许可证、最近提交、Issue、构建脚本以及是否读取凭证或开放网络端口。
3. 优先 npm 预构建包或锁定 Git commit，不直接追随浮动 `main`。
4. 先装进单独的测试 profile，而不是生产使用的 `web` profile。
5. 用 `--dump-config` 确认它实际插入、替换了哪些插件行。

#### 2.2.6 社区里已经有什么好玩的插件

以下项目都能说明 DSH 的插件面不只限于“多加一个模型工具”。它们是第三方项目，不代表本研究已经完成安全审计：

| 项目 | 有趣之处 | 安装示例 |
| --- | --- | --- |
| [dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) | 任务看板、Git 图谱、文件/变更面板、移动端远程、SSH、图像理解、实时吞吐、皮肤和鲸鱼宠物 | 项目支持单装或聚合包装，执行前应按 README 核对当前包名 |
| [dsh-pets](https://github.com/hellosz/dsh-pets) | 把 Agent 的运行、等待审批、完成和失败状态映射为宠物动画 | `dsh plugin --profile web add @hellosz/dsh-pets` |
| [dsh-mermaid](https://github.com/AKS1st/dsh-mermaid) | 将回答中的 Mermaid 围栏渲染为可缩放 SVG | `dsh plugin --profile web add github:AKS1st/dsh-mermaid` |
| [dsh-find-plugin](https://github.com/awesome-dsh-plugin/dsh-find-plugin) | 让 Agent 根据自然语言需求检索其他 DSH 插件 | `dsh plugin --profile web add dsh-find-plugin` |
| [dsh-exa-mcp](https://github.com/MicroHEROX/dsh-exa-mcp) | 用内置 MCP Client 将 Exa 搜索接进 DSH | 按项目 README 安装并检查远程端点与数据边界 |
| [dsh-market](https://github.com/dsh-market/dsh-market) | 在 DSH 设置页里形成一套社区插件商店体验 | `dsh plugin --profile web add dshmarket` |

社区爆发速度很快，但仓库创建时间普遍非常新，Star 数、目录收录量和自报 benchmark 都还没有经过时间检验。研究时应把“已经有人做出来”与“稳定、可信、适合长期使用”分开。

#### 2.2.7 实操第三课：安装 `dsh-web-ui` 与 `dsh-find-plugin`

本节不是照抄 README，而是 2026-08-16 在本文研究副本上的实际安装记录。实验环境如下：

| 项目 | 实际值 |
| --- | --- |
| DSH 源码 | `/Users/parker/Documents/git/agents/deepseek-harness`，`0.1.0-rc.5` |
| DSH Home | 默认 `~/.dsh`，复用已经配置的 API Key、会话和设置 |
| 目标 profile | `web` |
| Node.js / pnpm | Node.js `25.8.2`；pnpm `11.7.0` |
| 安装结果 | `@linxin666/dsh-web-ui-all@0.1.17`；`dsh-find-plugin@0.3.6` |

##### 1. 为什么安装的包名不是仓库名

[`dsh-web-ui`](https://github.com/zhu1090093659/dsh-web-ui) 是一个包含多个 package 的仓库。若想一次体验任务看板、Git 图谱、SSH、远程访问、实时统计、皮肤中心等全部组件，当前 README 推荐安装聚合 bundle `@linxin666/dsh-web-ui-all`，而不是执行 `add dsh-web-ui`。

[`dsh-find-plugin`](https://github.com/awesome-dsh-plugin/dsh-find-plugin) 本身就是可安装的 npm bundle，安装后向 Agent 注册 `find_dsh_plugin` 工具。

##### 2. 实际安装命令

使用本地源码里的 CLI，并把插件装进默认 `~/.dsh` 的 `web` profile：

```sh
cd /Users/parker/Documents/git/agents/deepseek-harness

pnpm dsh plugin --profile web add \
  @linxin666/dsh-web-ui-all@0.1.17 \
  dsh-find-plugin@0.3.6
```

成功后，profile 的 `package.json` 中会出现：

```json
{
  "dependencies": {
    "@linxin666/dsh-web-ui-all": "0.1.17",
    "dsh-find-plugin": "0.3.6"
  }
}
```

这说明 `dsh plugin add` 的第一步仍是包管理器安装；DSH 随后读取包中的 `dsh.bundle.patch`，把 bundle 合并进该 profile 的 Cordis 插件树。

##### 3. 本次遇到的 pnpm 11 问题

第一次安装并未直接成功。pnpm 下载了 32 个包，但因为三个依赖包含未经批准的安装脚本而返回 `ERR_PNPM_IGNORED_BUILDS`：

- `cloudflared`：远程 Web 访问需要下载 Cloudflare Tunnel 程序；
- `ssh2`：SSH 能力会尝试编译可选的原生加密绑定；
- `cpu-features`：为 SSH 原生绑定探测 CPU 能力。

同时，`dsh-web-ui` 聚合 patch 会直接引用其子包；在 pnpm 的隔离式 `node_modules` 布局下可能无法从 profile 根目录解析，所以该项目当前建议使用 hoisted 布局。最终采用的 `profiles/web/pnpm-workspace.yaml` 关键配置为：

```yaml
packages:
  - .

nodeLinker: hoisted
autoInstallPeers: false

minimumReleaseAgeExclude:
  - '@linxin666/*'
  - 'dsh-find-plugin'

allowBuilds:
  cloudflared: true
  cpu-features: true
  ssh2: true
```

这里有两点需要分开理解：

1. `minimumReleaseAgeExclude` 防止 profile 继承全局的“新版本等待期”后，静默选中与聚合包不同步的旧子包；它不是安全审计白名单。
2. `allowBuilds` 只放行本次已经识别的三个包，没有开启 `dangerouslyAllowAllBuilds`。按照 [pnpm 官方说明](https://pnpm.io/settings/build)，未列入 `allowBuilds` 的依赖构建仍会被当作未审查脚本拦截。

放行后重新执行安装命令，`cpu-features` 和 `ssh2` 在 macOS arm64 上完成了原生编译，`cloudflared` 也完成下载，安装以退出码 `0` 结束。需要强调：允许构建意味着这些第三方脚本以当前用户身份运行，发生在 Agent 工具沙箱之外；换机器或升级版本时仍应重新检查依赖来源和脚本变化。

##### 4. 如何确认不是“包装上了、Runtime 没加载”

安装完成后不必先启动 Web 服务，先展开最终组合：

```sh
cd /Users/parker/Documents/git/agents/deepseek-harness

pnpm dsh --profile web --dump-config
```

本次输出中出现了两个独立的 bundle 来源：

```yaml
# == @linxin666/dsh-web-ui-all
- id: ui-web-ui-compat
  name: '@linxin666/dsh-web-ui-all'
- id: ui-task-board
  name: '@linxin666/dsh-client-ui-task-board'
- id: ui-git-graph
  name: '@linxin666/dsh-client-ui-git-graph'
- id: remote-web-ui
  name: '@linxin666/dsh-remote-web-ui'
- id: ssh
  name: '@linxin666/dsh-ssh'
- id: live-stats
  name: '@linxin666/dsh-live-stats'
- id: ui-skin-center
  name: '@linxin666/dsh-client-ui-skin-center'

# == dsh-find-plugin
- id: find-dsh-plugin
  name: dsh-find-plugin
```

实际完整组合还包括 AionUI 面板、鲸鱼宠物、图像描述工具等组件。`--dump-config` 退出码为 `0`，说明 DSH 能解析 package、展开 patch 并完成静态依赖组合；这比只检查 `node_modules` 是否存在更接近“插件真的装进 Runtime”。

##### 5. 启动与体验案例

如果旧的 `dsh web` 仍在运行，需要先停止旧进程，因为正在运行的 Cordis 树不会自动采用刚修改的 profile。然后重新启动：

```sh
cd /Users/parker/Documents/git/agents/deepseek-harness

pnpm dsh web
```

打开 `http://127.0.0.1:3080/` 后，可以做两组最小实验：

**实验 A：确认 `dsh-web-ui` 改变了 Runtime 的 UI 和宿主能力**

1. 打开新增的任务看板，创建或执行一个多步骤任务，观察任务状态是否随 Session 变化。
2. 在 Git 工作区打开 Git Graph，核对提交图和工作区变更是否来自当前会话选择的目录。
3. 打开实时统计，运行一个会产生多次模型调用或工具调用的任务，观察吞吐和运行状态。
4. SSH 与远程 Web UI 会扩大网络、凭证和宿主访问面；体验时应使用测试主机与临时凭证，不应先接生产机器。

**实验 B：让 Agent 自己寻找插件**

在对话中输入：

```text
帮我找一个能在 DeepSeek Harness Web UI 中渲染 Mermaid 的插件。
只搜索和比较候选，不要自动安装；给出仓库、安装命令、最近更新时间和风险提示。
```

预期 Trajectory 中出现 `find_dsh_plugin` tool call。这个工具解决的是“发现”，不是“信任”：它主要基于 GitHub Topic 搜索候选，Agent 找到结果后仍应由人检查仓库内容、版本兼容性、安装脚本和权限，再决定是否执行 `dsh plugin add`。

##### 6. 卸载和复现实验边界

两个 bundle 可以分别卸载：

```sh
pnpm dsh plugin --profile web remove @linxin666/dsh-web-ui-all
pnpm dsh plugin --profile web remove dsh-find-plugin
```

卸载后再次运行 `--dump-config`，相应的 bundle 标题和插件节点应当消失。卸载 Cordis 插件只能清理由插件生命周期管理的 Runtime effect；不会自动删除远程主机上的操作结果、已经写入的项目文件、下载缓存或第三方服务中的数据。

#### 2.2.8 插件到底在哪里生效：源码目录、工作区、全局 CLI 与 `DSH_HOME`

前面的命令都从 `/Users/parker/Documents/git/agents/deepseek-harness` 执行，容易让人误以为插件只对这个源码目录生效。实际需要分开四个概念：

| 概念 | 本机当前值 | 决定什么 |
| --- | --- | --- |
| CLI 启动器 | 源码仓库中的 `pnpm dsh` | 使用哪一版 DSH 程序启动 |
| DSH Home | 默认 `~/.dsh` | profile、插件依赖、会话、设置和凭证存在哪里 |
| Profile | `web` | 这一套 Runtime 组合加载哪些 bundle |
| Workspace / cwd | 在 Web UI 中选择的项目目录，或 headless 启动时的当前目录 | Agent 实际读取、修改和执行命令的项目 |

因此，**插件作用域绑定的是 `DSH_HOME + profile`，不是安装命令所在的源码目录，也不是某个被 Agent 操作的项目目录。**

本次三个插件实际安装在：

```text
~/.dsh/
└── profiles/web/node_modules/
    ├── @linxin666/dsh-web-ui-all/
    ├── dsh-find-plugin/
    └── dsh-running-ant/
```

`deepseek-harness` 目录只提供开发版启动器。当前源码版 CLI、`npx` 和全局 CLI 在没有覆盖 `DSH_HOME` 时都会读取默认 `~/.dsh`；只要版本兼容并选择 `web` profile，从其他项目启动也会看到这三个插件。显式设置其他 `DSH_HOME` 会切换到另一套凭据、会话和插件组合。

##### 当前 Mac 有没有全局 `dsh`

2026-08-16 实际检查结果：

```text
command -v dsh  -> dsh not found
```

全局 npm package 列表中有 `pnpm@11.7.0` 和 `@openai/codex`，但没有 `@deepseek-ai/dsh`；`/opt/homebrew/bin`、`/usr/local/bin` 和 `~/.local/bin` 中也没有 `dsh`。所以当前只能：

- 在源码仓库中执行 `pnpm dsh ...`；或
- 使用官方 README 推荐的临时启动方式 `npx @deepseek-ai/dsh ...`。

npm registry 当日的 `@deepseek-ai/dsh` 最新标签为 `0.1.0-rc.6`，package manifest 声明的二进制名就是 `dsh`。如果希望任何目录都能直接运行，可以安装全局 CLI：

```sh
npm install -g @deepseek-ai/dsh@0.1.0-rc.6

command -v dsh
dsh --help
```

全局安装 CLI **不会自动复制现有插件**。未设置 `DSH_HOME` 时，它与源码版 CLI 一样读取已经配置好的默认 Home：

```sh
dsh web
```

如果需要隔离实验，可以临时指定另一个 Home：

```sh
DSH_HOME=/path/to/isolated-dsh-home dsh web
```

下面这种两行写法不等价：

```sh
# 错误示例：只是创建了未导出的 shell 变量，dsh 子进程通常看不到
DSH_HOME=/path/to/isolated-dsh-home
dsh web
```

要分两行写，第一行必须带 `export`。本文的日常源码运行不需要设置这个变量；隔离实验才使用自定义 Home。

##### 什么叫“全局生效安装”

DSH 没有一个脱离 Home 的全机器插件目录。通常有两种“近似全局”的做法：

1. **安装进默认 Home（本文当前采用）**：不设置 `DSH_HOME`，执行 `pnpm dsh plugin --profile web add ...`，插件进入 `~/.dsh/profiles/web`。已有 API Key、会话和设置继续生效，源码启动命令保持为官方形式 `pnpm dsh web`。
2. **固定自定义 Home（隔离实验）**：源码 CLI、`npx` 或全局 CLI 显式使用另一个目录。它适合测试不可信插件或复现实验，但必须为那套 Home 单独配置凭据和 profile。

无论采用哪一种，插件对该 profile 中选择的所有 Workspace 生效。例如在 Web UI 中从 `deepseek-harness` 切换到另一个 Git 项目，任务看板、插件搜索和蓝色蚂蚁仍然存在；变化的是 Agent 的工作目录和权限边界，不是插件安装位置。

### 2.3 Every run is traceable：Session Log 如何成为事实来源

#### 2.3.1 “事实来源”不是把整个日志原样塞给模型

官网所说的可追踪范围包括系统提示词、reasoning、工具调用与结果、子 Agent 调度和上下文注入。DSH 将它们记为一条 append-only 事件流；Trajectory、恢复、fork、搜索和 replay 都基于这条流。

正确的数据关系是：

```text
append-only Session Event Log
  ├─> Trajectory：按来源展示完整运行轨迹
  ├─> Chat Projection：折叠为用户看到的聊天视图
  ├─> Resume / Fork：重建 Session 与 Agent 状态
  └─> Model Request Assembly：结合当前插件、Prompt 和路由生成下一次请求
```

因此日志是“可重建事实”的来源，但下一次模型请求仍是一个派生结果。当前工具表、模型路由、压缩策略和某些运行时状态来自恢复时的有效组合，不是简单读取 `.log` 文件后整段发送。

#### 2.3.2 磁盘上是不是 `.log` 文件

不是。官方 Web profile 默认使用 JSONL Session Persistence，根目录为：

```text
${DSH_HOME:-~/.dsh}/sessions/
```

目录结构是：

```text
sessions/
  --<normalized-cwd>--/
    <encoded-session-id>/
      session.jsonl.zstd
```

逻辑内容是 JSONL，但默认物理文件经过 Zstandard 压缩，所以文件名为 `session.jsonl.zstd`，不能直接用 `cat` 当作普通文本查看。只有将 `compression` 配为 `none` 时才会写 `session.jsonl`。

对于本研究使用的默认 Home：

```sh
find ~/.dsh/sessions -type f -name 'session.jsonl*'
```

最可靠的人工检查入口仍是 Web UI 的 **Trajectory** 页，因为它使用 Session 后端的正式解码和投影逻辑。磁盘文件更适合备份、故障诊断和可复现实验，不建议绕过后端直接修改。

#### 2.3.3 实操案例：追踪一次插件调用

1. 启动带有上一节 `greet` 插件的 Web profile。
2. 新建会话，要求 Agent 必须调用 `greet`。
3. 切换到 Trajectory，依次查看：用户消息、组装出的工具 schema、assistant tool call、`greet` result、最终回答。
4. 点击记录的来源信息，区分模型输出、工具插件输出和上下文插件注入。
5. 停止 DSH 后运行上面的 `find`，确认相应会话产生了 `session.jsonl.zstd`。
6. 恢复或 fork 该会话，检查新运行是否仍能由同一事件历史重建。

这个案例能验证“可追踪”，但不能证明任何插件都不会在日志之外产生副作用。例如插件直接写文件、调用外部 API 或读取环境变量，日志只能记录 DSH 观察到的事件，不能天然记录所有宿主行为。

### 2.4 Multiple runtime modes：四种模式不是四个模型

官网展示的 Standard、Code、Minimal、Creator 本质上是四套 **Agent preset**。它们改变工具和 Prompt 组合，而不是自动更换基础模型。

| 模式 | 组合特点 | 典型场景 | 主要代价 |
| --- | --- | --- | --- |
| Standard mode | 完整 coding agent：文件编辑、shell、搜索、Skill、规划、Goal、子 Agent、Workflow | 日常开发、复杂仓库任务 | schema 和系统 Prompt 更大，模型选择空间更多 |
| Code mode | 保留 Standard 能力，但通过 Code Mode SDK 让模型在一个 TypeScript 程序中组合多轮工具操作 | 批量检索、并行读取、结构化数据处理、减少模型与工具往返 | 需要模型擅长生成可靠 orchestration code；调试面更复杂 |
| Minimal mode | 只有持久 `bash` 和 `str_replace_editor`，完整系统提示词固定为一句简短 persona | Harness/模型 benchmark、观察模型原始工具能力、最小干扰实验 | 缺少搜索、Skill、规划、子 Agent等便利能力 |
| Creator mode | Standard 全能力，加 Runtime 检查、内存插件实验和 preset 创作指导 | 设计自定义模式、调试插件组合、制作团队 preset | 权限面大；实验性配置可能破坏组合 |

#### 2.4.1 实操案例：用同一个任务观察 Harness 差异

在 Web 新会话页面的模式选择器中，分别选择 Standard、Code 和 Minimal，对同一个固定仓库、固定模型和固定提示词各运行一次：

```text
阅读当前项目，找出测试入口；不要修改代码。输出：
1. 测试框架；
2. 执行命令；
3. 证据文件路径。
```

然后在 Trajectory 比较：

- 首次模型请求的系统 Prompt 大小；
- 工具 schema 数量；
- 模型调用轮数；
- 工具调用数量和类型；
- 总 token、缓存命中和 wall-clock；
- 最终答案是否有相同证据质量。

这比让三个模式执行不同任务更能回答“Runtime 组合是否影响模型表现”。Minimal 得分更高或耗时更短，并不自动表示它更先进；也可能只是任务不需要 Standard 的额外能力。

#### 2.4.2 实操案例：用 Creator mode 制作自己的模式

新建会话时选择 Creator mode，然后给它一个边界明确的任务：

```text
复制系统 standard preset，创建用户 preset `standard-with-codex`。
保持 Standard 的其他能力不变，只启用已有的 Codex 委派工具模板。
完成后验证 preset 可以挂载，并告诉我新文件所在目录；不要修改系统自带 preset。
```

用户 preset 默认位于：

```text
${DSH_HOME:-~/.dsh}/.agent-presets/<preset-id>/
```

Creator mode 自带的指导明确要求复制系统 preset，而不是直接修改随安装交付的 `standard`、`code`、`minimal`、`cordis`。升级可能覆盖系统 preset，而用户目录中的副本才是可维护扩展点。

### 2.5 调用 Codex 和 Claude Code：DSH 如何把其他 Harness 当作子 Agent

#### 2.5.1 先看调用链

DSH 内置的两个产品后端不是普通 LLM Provider，而是 `ctx.subagents` 下的两个 provider：

```text
DSH 父 Agent
  └─ tool call: subagent_codex / subagent_claude_code
       └─ @deepseek-ai/dsh-tool-subagent
            └─ ctx.subagents.start(provider, task, parent cwd)
                 ├─ codex provider -> codex app-server --stdio
                 └─ claude-code provider -> Claude Agent SDK -> claude CLI
                      └─ 独立进程 / 独立上下文 / 相同工作目录
                           └─ 只把最终文本返回父 Agent
```

主 Agent 和产品子 Agent 的通信是 **一次性任务—最终结果**：

- 父 Agent 提交自包含文本任务，并提供当前会话工作目录；
- Codex 或 Claude Code 在自己的全新上下文中执行；
- 它们读取各自原生安装的模型、系统指令、工具、权限和登录状态；
- 子 Agent 的 reasoning、中间消息、工具过程、stderr 和产品内部 ID 不复制进父会话；
- 父 Agent 只收到最终文本或错误；
- 两者共享工作目录，因此子 Agent 的文件修改会直接出现在同一工作区。

这与 DSH 自己的 continuable subagent 不同：当前 Codex/Claude Code provider 每次都新建进程和临时会话，不支持 follow-up、resume、池化、进度流或长期产品会话持久化。

#### 2.5.2 启用前置条件

先在启动 DSH 的同一环境中确认原生产品可用：

```sh
codex --version
claude --version
```

并分别用原生方式完成登录或配置。DSH 不负责安装 CLI、不替产品登录、不替你选择模型，也不创建独立 `CODEX_HOME` 或 Claude 配置目录。它从 `PATH` 找到命令，并继承宿主产品设置。

官方 host profile 已加载两个 dormant provider；Standard preset 中也带有两个禁用的工具模板。推荐做法是复制 Standard preset，然后只启用需要的工具。核心配置如下：

```yaml
- id: tool-subagent-codex
  name: '@deepseek-ai/dsh-tool-subagent'
  config:
    provider: codex
    toolName: subagent_codex
    enableRunInBackground: false
    maxDepth: provider-managed

- id: tool-subagent-claude-code
  name: '@deepseek-ai/dsh-tool-subagent'
  config:
    provider: claude-code
    toolName: subagent_claude_code
    enableRunInBackground: false
    maxDepth: provider-managed
```

如果从自定义 host 组合开始，而不是随附的 Web profile，还需要加载 provider 本身：

```yaml
- id: subagent-codex
  name: '@deepseek-ai/dsh-subagent-codex'

- id: subagent-claude-code
  name: '@deepseek-ai/dsh-subagent-claude-code'
```

不要在每个 Agent preset 中重复挂载 provider：provider 属于 host 级单例能力，preset 只负责决定当前 Agent 是否能看到委派工具。

#### 2.5.3 实操案例一：让 Codex 做独立代码审查

在启用了 `subagent_codex` 的新会话中输入：

```text
请调用 subagent_codex 审查当前工作区的未提交改动。
任务必须自包含：检查正确性、回归风险、测试遗漏和安全问题；
不要修改文件，只按严重级别返回发现，并给出文件与行号证据。
收到结果后，你再核对其中的关键结论并总结给我。
```

这个场景适合 Codex 的原因是：它有自己的 coding harness 和工具，可以作为独立评审者读取真实工作区；父 Agent 只需要消费最终结论，不需要继承 Codex 的完整轨迹。

#### 2.5.4 实操案例二：让 Claude Code 做设计反方

```text
请调用 subagent_claude_code，对当前实现方案做一次 adversarial design review。
重点检查：状态所有权、失败恢复、并发竞态、权限边界和不必要复杂度。
只分析，不修改文件。把必要背景和目标写进子任务，不要假设它能看到我们的聊天历史。
```

此处最重要的提示词原则是“任务自包含”。产品 provider 明确声明 `inheritsParentContext: false`，所以“按我们刚才说的继续”会丢失背景；应把目标、约束、期望输出和禁止事项重新写进委派任务。

#### 2.5.5 实操案例三：同题双审，父 Agent 做裁判

```text
针对当前 diff，分别调用 subagent_codex 和 subagent_claude_code 做只读审查。
两边使用同一份审查标准：正确性、数据丢失、并发、安全、测试遗漏。
拿到两个结果后，逐项核对源码；只保留有直接证据的结论，并说明两边分歧。
```

这是一种典型的“异构 Harness 交叉验证”：DSH 做协调者，Codex 和 Claude Code 提供独立意见。若 Agent loop 和并发上限允许，同一 assistant step 中的两个独立调用可以重叠执行；但默认模板将它们配置成前台一次性工具，不提供后台持续对话。

#### 2.5.6 什么时候适合，什么时候不适合

适合：

- 让另一个模型/Harness 对方案或 diff 给出第二意见；
- 把边界明确、一次可完成的代码调查交给专门 coding agent；
- 比较 Codex 和 Claude Code 对同一问题的发现差异；
- 隔离大段探索过程，避免中间轨迹占满父 Agent 上下文；
- 父 Agent 负责规划和验收，子 Agent 负责独立实现或审查。

不适合：

- 需要多轮追问和持续修订的子任务；
- 运行中需要人工批准命令、回答问题或 MCP elicitation 的任务；
- 必须把父会话全部历史无损继承过去的任务；
- 需要实时观察子 Agent 中间进度和工具轨迹；
- 期望失败时自动回滚文件或外部副作用的任务。

两个官方产品 provider 都是无人值守调用。Codex 遇到审批请求会优先取消或拒绝，Claude Code 禁用 `AskUserQuestion`；因此委派任务应明确采用只读操作，或者确保原生产品权限配置允许预期写入。即便 DSH 插件能卸载，也不会回滚已经由外部 CLI 写入的文件。

#### 2.5.7 社区有没有人在玩

有，而且已经出现两个方向：

1. **DSH 调用 Codex/Claude Code。** [dsh-web-ui 的梁神模式](https://github.com/zhu1090093659/dsh-web-ui)和 [dsh-anchored-standard](https://github.com/xiaobright/dsh-anchored-standard)都在自定义 preset 中启用了 `subagent_codex` 与 `subagent_claude_code`。这证明社区已经在组合官方 provider，但不等于这些项目给出了受控的成功率、成本或可靠性 benchmark。
2. **Claude Code 反过来调用 DSH。** [dsh-plugin-cc](https://github.com/cpj-dev/dsh-plugin-cc) 是第三方 Claude Code 插件，提供 `/dsh:review`、`/dsh:critique`、`/dsh:run`、后台 delegate 和会话导入，让 Claude Code 把 DSH 当作评审者或执行者。

GitHub 代码搜索能找到大量包含这两个工具名的仓库，但其中包括官方仓库副本、打包分发和文档镜像，不能把搜索结果数当成活跃用户数。更可靠的结论只是：社区已经快速形成“DSH 调 Codex/CC”与“CC 调 DSH”的双向实验，实际稳定性仍需本地复现。

### 2.6 核心特性的组合案例：搭一个“主 Agent + 双评审”模式

一个比较有代表性的自定义 Runtime 可以这样设计：

```text
DeepSeek V4 / Standard 或 Code 主 Agent
  ├─ 负责理解需求、拆任务、修改代码和运行测试
  ├─ subagent_codex：只读 code review
  ├─ subagent_claude_code：adversarial design review
  ├─ Trajectory：保存三方调度、结果与父 Agent 验证过程
  └─ 自定义 UI 插件：显示任务状态、成本或 Git diff
```

建议的工作流是：

1. 主 Agent 完成实现并运行基础测试。
2. 并行请求 Codex 与 Claude Code 只读审查。
3. 主 Agent 不直接相信任一返回值，而是重新读取被指向的源码和测试。
4. 对有证据的问题修复并重新测试。
5. 在 Trajectory 中核对每次委派的任务文本、结果和最终处理结论。

这个案例同时使用了插件化、子 Agent seam、运行模式和 append-only Session Log，也暴露了当前局限：外部 coding agent 的内部轨迹不进入 DSH；文件写入没有事务回滚；第三方 UI 插件运行在宿主信任边界内；不同产品的费用和权限由各自账户管理。

### 2.7 本章判断

DeepSeek Harness 当前最有辨识度的能力不是某个单独工具，而是 **可以把 Runtime 的不同层放进同一套可组合生命周期**：profile 安装 bundle，bundle 插入 Cordis plugin，plugin 注册服务、工具和事件，Agent preset 再决定每个会话真正看到什么。

但成熟度要分层判断：

- 插件开发、bundle 安装、profile 组合和官方内置插件已有完整文档与大量源码测试；
- 社区已经出现市场、UI 全家桶、宠物、图表、远程访问和双向 Harness 桥接；
- 官方还没有审核型插件市场、稳定 ABI、恶意插件隔离或长期兼容承诺；
- Codex/Claude Code provider 已能完成一次性委派，但还不是可持续对话、可实时观察、可人工审批的完整跨 Harness 协作协议；
- “可追踪”能重建 DSH 观察到的 Agent 事件，不等于捕获插件和外部 CLI 的全部宿主副作用。

所以现阶段最合理的体验方式是：用 Creator mode 复制 preset，在独立 profile 中安装少量、可审查的插件，先做只读或可恢复实验；再通过 Trajectory 和固定 Session Log 对实际行为做验证，而不是仅凭官网口号或社区 Star 数判断能力。
