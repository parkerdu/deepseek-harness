# DS Plugin Workspace

用于独立开发 DeepSeek Harness 社区插件。插件位于 `plugins/*`，不修改 `deepseek-harness` 官方源码；每个插件都应能独立构建、打包、安装和卸载。

## 目录

```text
ds_plugin/
├── shared/                  # 多个 UI 插件复用的构建工具
├── plugins/
│   ├── dsh-running-ant/     # 运行中的蓝色蚂蚁
│   └── dsh-reviewed-development/ # DS/Codex/Claude 评审开发流程
└── dist/                    # 本地 tarball（构建后生成，不提交）
```

## 常用命令

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm pack:running-ant
pnpm pack:reviewed-development
```

本地 tarball 安装示例：

```sh
cd /Users/parker/Documents/git/agents/deepseek-harness/parker/ds_plugin
pnpm install
pnpm pack:reviewed-development

cd /Users/parker/Documents/git/agents/deepseek-harness
pnpm dsh plugin --profile web add \
  file:/Users/parker/Documents/git/agents/deepseek-harness/parker/ds_plugin/dist/dsh-reviewed-development-0.1.0.tgz

pnpm dsh web
```

安装评审开发插件后，重启 Web profile，在会话输入框附近点击
`开启评审开发模式`，或直接用自然语言告诉 DS：
`请开启评审开发模式，完成以下需求：……`。

该流程由 DS 负责需求理解和产品验收，Codex 负责产品代码开发，Claude
Code 负责测试用例开发与测试。Agent 之间只使用自然语言；插件内部保存
状态、Git diff 和审计日志以阻止跳过评审、测试或用户验收。

如果 DSH 进程工作目录不是待开发仓库，设置：

```sh
export DSH_REVIEWED_REPO=/absolute/path/to/repository
```

命令不设置 `DSH_HOME`，因此插件安装到默认的 `~/.dsh/profiles/web`，并与 `~/.dsh/.credentials.yaml` 中已有的凭据一起由源码版 CLI 使用。

开发新插件时，新建 `plugins/<package-name>`。不要使用 `@deepseek-ai/*` 命名空间，除非该包确实由 DeepSeek 官方发布。
