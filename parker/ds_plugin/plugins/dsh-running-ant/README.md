# dsh-running-ant

DeepSeek Harness Web 的纯展示插件：当前会话生成期间，一只蓝色蚂蚁在输入框上方往返爬行；生成停止后自动消失。

它不修改系统提示词，不注册模型工具，不发送网络请求，也不写入 Session Log 或其他持久化存储。

## 构建和测试

```sh
cd /Users/parker/Documents/git/agents/deepseek-harness/parker/ds_plugin
pnpm install
pnpm --filter dsh-running-ant build
pnpm --filter dsh-running-ant test
pnpm pack:running-ant
```

## 安装

```sh
cd /Users/parker/Documents/git/agents/deepseek-harness

pnpm dsh plugin --profile web add \
  file:/Users/parker/Documents/git/agents/deepseek-harness/parker/ds_plugin/dist/dsh-running-ant-0.1.0.tgz
```

检查最终 Cordis 组合：

```sh
pnpm dsh --profile web --dump-config
```

输出中应出现：

```yaml
# == dsh-running-ant
- id: ui-running-ant
  name: dsh-running-ant
```

## 卸载

```sh
pnpm dsh plugin --profile web remove dsh-running-ant
```
