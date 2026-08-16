# Parker 的 DeepSeek Harness 研究区

这个目录保存 Parker 基于 DeepSeek Harness 官方源码开展的研究和社区插件开发，不修改官方 Runtime 的核心实现。

## 目录

- [`docs/deepseek_harness研究.md`](docs/deepseek_harness研究.md)：官方资料、架构原理、核心特性和实操记录。
- [`ds_plugin/`](ds_plugin/)：独立的社区插件工作区，当前包含运行中蓝色蚂蚁插件 `dsh-running-ant`。

## 默认运行方式

在仓库根目录安装并构建官方源码后，使用默认的 `~/.dsh` 保存凭据、会话和 `web` profile：

```sh
pnpm install
pnpm run build
pnpm dsh web
```

插件的开发、测试、打包和安装命令见 [`ds_plugin/README.md`](ds_plugin/README.md)。
