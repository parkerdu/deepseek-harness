# DeepSeek Harness plugin workshop

这里保存交互教程中从零构建的完整源码。每个实验都能作为 Web overlay 加载，不修改官方 Harness 源码。

- `01-log-plugin`：最小 Host 插件，启动时打印日志。
- `02-greeter-tool`：Service Provider、工具 Consumer 与事件 Observer 三插件组合。

从仓库根目录启动任一实验：

```sh
pnpm dsh web --patch ./parker/tutorial-labs/plugin-workshop/01-log-plugin/cordis.patch.yml
```

```sh
pnpm dsh web --patch ./parker/tutorial-labs/plugin-workshop/02-greeter-tool/cordis.patch.yml
```
