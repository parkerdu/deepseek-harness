import { resolve } from 'node:path'

function command(id, label, shellCommand) {
  return { id, type: 'command', label, shellCommand }
}

function write(id, label, relativePath) {
  return { id, type: 'write', label, relativePath }
}

function webCommand(port, extraArguments = '') {
  return `if lsof -nP -iTCP:${port} -sTCP:LISTEN >/dev/null 2>&1; then
  echo '端口 ${port} 已有服务运行：'
  lsof -nP -iTCP:${port} -sTCP:LISTEN
  ${pageCheckCommand(port)}
else
  exec pnpm dsh web ${extraArguments} --port ${port}
fi`
}

function pageCheckCommand(port) {
  return `html=$(curl -fsS --max-time 5 http://127.0.0.1:${port}/) && printf '%s\\n' "$html" | grep -o '<title>[^<]*</title>' | head -n 1 && echo 'HTTP 页面访问成功：http://127.0.0.1:${port}/'`
}

export function chapter03Actions(repositoryRoot) {
  const providerHelper = resolve(repositoryRoot, 'parker/tutorial-labs/workshop/chapters/chapter-03-plugins/provider-profile.mjs')
  const antArchive = resolve(repositoryRoot, 'parker/ds_plugin/dist/dsh-running-ant-0.1.0.tgz')
  return [
    write('chapter-03-plugins.hello.source', '开发 Hello 插件代码', 'parker/tutorial-labs/plugin-workshop/00-first-plugin/src/my-plugin.ts'),
    write('chapter-03-plugins.hello.patch', '写 Hello Patch 配置文件', 'parker/tutorial-labs/plugin-workshop/00-first-plugin/cordis.yml'),
    command('chapter-03-plugins.hello.web', '使用 Hello Patch 启动 Web', webCommand(3082, '--patch ./parker/tutorial-labs/plugin-workshop/00-first-plugin/cordis.yml')),
    command('chapter-03-plugins.hello.check', '验收 Hello Web 页面', `${pageCheckCommand(3082)}\nprintf '\\n请回到 Web 启动步骤的终端，确认出现 [hello-plugin] plugin loaded!\\n'`),

    write('chapter-03-plugins.greet.source', '开发 Greet Tool 插件代码', 'parker/tutorial-labs/plugin-workshop/01-simple-greet-tool/src/greet-tool.ts'),
    write('chapter-03-plugins.greet.patch', '写 Greet Patch 配置文件', 'parker/tutorial-labs/plugin-workshop/01-simple-greet-tool/cordis.yml'),
    command('chapter-03-plugins.greet.web', '使用 Greet Patch 启动 Web', webCommand(3083, '--patch ./parker/tutorial-labs/plugin-workshop/01-simple-greet-tool/cordis.yml')),
    command('chapter-03-plugins.greet.check', '验收 Greet Tool Web 页面', `${pageCheckCommand(3083)}\nprintf '\\n页面已就绪。请在 Chat 中发送当前步骤给出的提示词。\\n'`),

    command('chapter-03-plugins.provider.profile', '查看 Web Profile 与实时 Patch', "printf 'Web Profile：~/.dsh/profiles/web\\n实时 Patch：~/.dsh/profiles/web/cordis.patch.yml\\n\\n'\nls -la ~/.dsh/profiles/web\nprintf '\\n--- cordis.patch.yml 当前内容 ---\\n'\nif test -f ~/.dsh/profiles/web/cordis.patch.yml; then sed -n '1,240p' ~/.dsh/profiles/web/cordis.patch.yml; else echo '(文件尚不存在)'; fi"),
    command('chapter-03-plugins.provider.apply-v1', '写入 Provider 初始参数', `node ${shellQuote(providerHelper)} apply-v1`),
    command('chapter-03-plugins.provider.web', '启动 Web 观察 Provider 日志', webCommand(3084)),
    command('chapter-03-plugins.provider.update-v2', '修改 Provider 参数并触发热更新', `node ${shellQuote(providerHelper)} update-v2`),
    command('chapter-03-plugins.provider.cleanup', '移除模拟 Provider 并恢复 Profile', `node ${shellQuote(providerHelper)} cleanup`),

    command('chapter-03-plugins.ant.inspect', '查看蚂蚁插件的包入口与 Bundle Patch', "node -e \"const p=require('./parker/ds_plugin/plugins/dsh-running-ant/package.json'); console.log(JSON.stringify({name:p.name,version:p.version,main:p.main,exports:p.exports,dsh:p.dsh,files:p.files},null,2))\"\nprintf '\\n--- cordis.patch.yml ---\\n'\nsed -n '1,120p' parker/ds_plugin/plugins/dsh-running-ant/cordis.patch.yml"),
    command('chapter-03-plugins.ant.build', '构建并测试蚂蚁插件', 'cd parker/ds_plugin && pnpm --filter dsh-running-ant build && pnpm --filter dsh-running-ant test'),
    command('chapter-03-plugins.ant.pack', '打包生成 .tgz 文件', 'cd parker/ds_plugin && pnpm pack:running-ant'),
    command('chapter-03-plugins.ant.archive', '检查 npm 压缩包中的发布文件', `test -f ${shellQuote(antArchive)}\nls -lh ${shellQuote(antArchive)}\nprintf '\\n--- 包内文件 ---\\n'\ntar -tzf ${shellQuote(antArchive)} | sed -n '1,160p'`),
    command('chapter-03-plugins.ant.install', '把蚂蚁插件安装到 Web Profile', `pnpm dsh plugin --profile web add file:${antArchive}\nprintf '\\n--- 最终组合中的蚂蚁插件 ---\\n'\npnpm dsh --profile web --dump-config | sed -n '/# == dsh-running-ant/,+5p'`),
    command('chapter-03-plugins.ant.web', '启动 Web 验收蚂蚁 UI', webCommand(3085)),
    command('chapter-03-plugins.ant.publish-dry-run', '使用 dry-run 检查发布内容', 'cd parker/ds_plugin/plugins/dsh-running-ant && pnpm publish --dry-run --access public'),
    command('chapter-03-plugins.ant.remove', '从 Web Profile 卸载蚂蚁插件', "pnpm dsh plugin --profile web remove dsh-running-ant\nprintf '\\n已卸载。压缩包仍保留在 parker/ds_plugin/dist/，可继续交给别人安装。\\n'"),

    command('chapter-03-plugins.community-web-ui.inspect', '查看社区插件来源与功能', 'npm view @linxin666/dsh-web-ui-all@0.2.6 name version description license repository.url dist.integrity dsh --json'),
    command('chapter-03-plugins.community-web-ui.install', '固定版本安装社区 dsh-web-ui 聚合包', "if lsof -nP -iTCP:3086 -sTCP:LISTEN >/dev/null 2>&1; then echo '3086 仍有 Web 运行，请先停止社区插件实验的启动步骤。'; exit 1; fi\npnpm dsh plugin --profile web add --save-exact @linxin666/dsh-web-ui-all@0.2.6\nprintf '\\n--- 已安装版本 ---\\n'\nnode -e \"const p=require(process.env.HOME+'/.dsh/profiles/web/node_modules/@linxin666/dsh-web-ui-all/package.json'); console.log(p.name+'@'+p.version)\""),
    command('chapter-03-plugins.community-web-ui.compose', '检查社区 dsh-web-ui 最终组合', "pnpm dsh --profile web --dump-config | sed -n '/# == @linxin666\\/dsh-web-ui-all/,+90p'"),
    command('chapter-03-plugins.community-web-ui.web', '启动 Web 验收社区 UI', webCommand(3086)),
    command('chapter-03-plugins.community-web-ui.remove', '从 Web Profile 卸载社区 dsh-web-ui', "if lsof -nP -iTCP:3086 -sTCP:LISTEN >/dev/null 2>&1; then echo '3086 仍有 Web 运行。请先回到启动步骤点击“停止当前命令”，再执行卸载。'; exit 1; fi\npnpm dsh plugin --profile web remove @linxin666/dsh-web-ui-all\nprintf '\\n--- 卸载后保留的本地插件 ---\\n'\npnpm dsh --profile web --dump-config | sed -n '/# == dsh-running-ant/,+5p'"),
  ]
}

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`
}
