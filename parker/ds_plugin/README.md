# DS Plugin Workspace

用于独立开发 DeepSeek Harness 社区插件。插件位于 `plugins/*`，不修改 `deepseek-harness` 官方源码；每个插件都应能独立构建、打包、安装和卸载。

## 目录

```text
ds_plugin/
├── shared/                  # 多个 UI 插件复用的构建工具
├── plugins/
│   └── dsh-running-ant/     # 第一个插件
└── dist/                    # 本地 tarball（构建后生成，不提交）
```

## 常用命令

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm pack:running-ant
```

本地 tarball 安装示例：

```sh
cd /Users/parker/Documents/git/agents/deepseek-harness/parker/ds_plugin
pnpm install
pnpm pack:running-ant

cd /Users/parker/Documents/git/agents/deepseek-harness
pnpm dsh plugin --profile web add \
  file:/Users/parker/Documents/git/agents/deepseek-harness/parker/ds_plugin/dist/dsh-running-ant-0.1.0.tgz

pnpm dsh web
```

命令不设置 `DSH_HOME`，因此插件安装到默认的 `~/.dsh/profiles/web`，并与 `~/.dsh/.credentials.yaml` 中已有的凭据一起由源码版 CLI 使用。

开发新插件时，新建 `plugins/<package-name>`。不要使用 `@deepseek-ai/*` 命名空间，除非该包确实由 DeepSeek 官方发布。
