# Agent Note: 持久化 Workshop Provider 恢复状态

Status: implemented

[English](2026-08-25-workshop-provider-recovery-state.md) | 中文

## 问题

插件 Workshop 的 Provider HMR（热模块替换）实验会向用户的 Web Profile Patch 追加一个带标记的块，并且必须在 Workshop 重新启动时恢复实验前的准确内容。恢复快照丢失会导致标记块残留在 `cordis.patch.yml` 中，同时启动流程拒绝继续。把这个快照放在操作系统临时目录，会让恢复所需的输入受到无关的临时文件清理影响。

## 决策

[`provider-profile.mjs`](../../../../parker/tutorial-labs/workshop/chapters/chapter-03-plugins/provider-profile.mjs) 把实验前的 Patch 快照保存在 `~/.dsh/.workshop-state/provider-hmr.json`。正常清理会校验 Patch 哈希并恢复该快照。

如果快照丢失，清理只接受恰好一个完整标记块，而且块内容必须逐字节匹配 Workshop 生成的 `BEFORE` 或 `AFTER` 配置。清理只移除该块，保留其他所有 Patch 配置项。如果结果只剩注释，则补上必需的顶层空数组。标记缺失、重复或内容被编辑时仍会失败，并且不会改动 Patch。

## 考虑过的替代方案

**继续把快照放在操作系统临时目录。** 这种方式让 Workshop 状态留在 `~/.dsh` 之外，但临时文件的保留周期与 Web Profile 编辑的生命周期无关，无法提供确定性的清理。

**快照丢失时把 `AFTER` 参数改回 `BEFORE`。** 这种方式可以重建第一组实验参数，但 Provider 和 Consumer 仍处于加载状态，因此重新启动的 Workshop 不是干净的实验环境。

**删除配对标记之间的任意文本。** 只有标记不能证明其中的配置仍归 Workshop 所有。严格匹配两种生成结果既允许恢复，也不会接受手工编辑过的块。

## 后果

持久化快照存在时，Workshop 重启会保留实验前的准确 Web Profile Patch。即使该快照被删除，完整的生成块仍然可以恢复，包括实验已经进入 `AFTER` 阶段的情况。回退恢复无法重建空数组占位符的原始位置，因此会输出规范形式的注释和随后的 `[]`；其语义仍是相同的空 Patch。恢复测试覆盖快照恢复、状态丢失恢复、编辑后拒绝处理和启动清理。
