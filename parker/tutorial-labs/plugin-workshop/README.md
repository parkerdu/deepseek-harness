# DeepSeek Harness plugin workshop

这里保存交互教程中从零构建的完整源码。每个实验都能作为 Web overlay 加载，不修改官方 Harness 源码。

- `dsh-fireworks`：最小可见 UI 插件，Client `apply()` 直接向输入框 Dock 注册一个 `🎆`。
- `02-greeter-tool`：Service Provider、工具 Consumer 与事件 Observer 三插件组合。

实验一使用仓库准备阶段已经构建并安装的 `dsh-fireworks`，实验流程本身不编译、不打包、不安装，只验证组合和页面结果。启动它：

```sh
pnpm dsh web --port 3082
```

```sh
pnpm dsh web --patch ./parker/tutorial-labs/plugin-workshop/02-greeter-tool/cordis.patch.yml
```

## 在 Workshop 页面逐步执行

静态 HTML 不能直接获得本机 Shell 权限。要启用页面中的“执行此步骤”和流式终端，从仓库根目录启动只监听回环地址的本地执行器：

```sh
node parker/tutorial-labs/plugin-workshop/workshop-server.mjs
```

然后打开 `http://127.0.0.1:3090`。每个步骤只会触发服务端预先绑定的固定动作：代码步骤写入指定教程文件，命令步骤在仓库根目录运行，页面步骤执行本地 HTTP 验收。执行器使用随机会话令牌校验请求，不开放任意 Shell 输入，也不允许写出当前仓库。
