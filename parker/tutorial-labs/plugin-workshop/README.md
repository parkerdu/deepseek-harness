# DeepSeek Harness plugin workshop

这里保存交互教程中从零构建的完整源码。每个实验都能作为 Web overlay 加载，不修改官方 Harness 源码。

- `01-fireworks-plugin`：与官方基础教程同构的本地插件，通过 `--patch` 临时向 Web 页面插入一个 `🎆`。
- `02-greeter-tool`：Service Provider、工具 Consumer 与事件 Observer 三插件组合。

实验一不编译、不打包、不安装，也不修改默认 Profile。直接用本地 overlay 启动：

```sh
pnpm dsh web --patch ./parker/tutorial-labs/plugin-workshop/01-fireworks-plugin/cordis.yml --port 3082
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
