# DeepSeek Harness plugin workshop

这里保存插件教程前三个实验的源码。前两个实验通过 `--patch` 在单次 Web 启动中临时加载；第三个实验把模拟 Provider 和 Consumer 加入 Web Profile 的实时 patch，在完整 Web 进程中验证配置热更新；第四个蚂蚁 UI 插件实验使用 `../../ds_plugin/` 中的可发布插件包，安装后由 Web Profile 加载，不再需要 `--patch`。

- `00-first-plugin`：官方基础教程中的最小插件，加载时在终端打印一行日志。
- `01-simple-greet-tool`：官方工具教程中的独立 `greet` 工具。
- `03-provider-config-hmr`：在完整 Web 中修改模拟 Provider 的 `apiKey` 与 `baseURL`，观察配置热更新和依赖重载。
- `../../ds_plugin/plugins/dsh-running-ant`：蚂蚁 UI 插件的可发布源码包；`pnpm pack:running-ant` 生成的 `.tgz` npm 安装包输出到 `../../ds_plugin/dist/`。

前两个实验不编译、不打包、不安装。分别使用自己的 patch 启动：

```sh
pnpm dsh web --patch ./parker/tutorial-labs/plugin-workshop/00-first-plugin/cordis.yml
```

```sh
pnpm dsh web --patch ./parker/tutorial-labs/plugin-workshop/01-simple-greet-tool/cordis.yml
```

## 在 Workshop 页面逐步执行

第三章的统一 Workshop 位于 `../workshop/`。顶部用于切换课程章节，左侧用于切换四个主实验和一个社区扩展实验；新增章节时，在 `../workshop/chapters/` 中增加自己的内容和固定动作，再注册到 `chapters/index.js`。

静态 HTML 不能直接获得本机 Shell 权限。要启用页面中的“真实执行此步骤”和流式终端，从仓库根目录启动只监听回环地址的本地执行器：

```sh
node parker/tutorial-labs/workshop/workshop-server.mjs
```

原命令 `node parker/tutorial-labs/plugin-workshop/workshop-server.mjs` 仍可使用，它会进入同一个 Workshop。打开 `http://127.0.0.1:3090` 后，每个步骤只会触发服务端预先绑定的固定动作：代码步骤写入指定教程文件，命令步骤在仓库根目录运行，页面步骤执行本地 HTTP 验收。切换实验或步骤不会中止其他步骤中正在运行的命令；返回原步骤可以继续查看流式日志。

执行器使用随机会话令牌校验请求，不开放任意 Shell 输入，也不允许代码写入仓库外。Provider 热更新实验会修改 `~/.dsh/profiles/web/cordis.patch.yml`：执行前保存原内容，更新和恢复前校验文件是否被其他操作修改，避免覆盖实验期间的外部编辑。
