# dsh-reviewed-development

Natural-language workflow for a DS product manager, Codex developer, and
Claude Code tester. The plugin stores workflow state outside the repository,
checks Git boundaries before every gate, and only creates a PR after explicit
user acceptance.

The Agent reports are intentionally plain text. The plugin uses state, process
exit codes, and Git diffs as its control-plane evidence; it does not require a
JSON protocol from Codex or Claude.

Build and install from this workspace:

```sh
pnpm build
pnpm pack:reviewed-development
dsh plugin --profile web add ./dist/dsh-reviewed-development-0.1.0.tgz
```

Restart the Web profile and click `开启评审开发模式` above the composer, or
ask DS in natural language to enable it. Set `DSH_REVIEWED_REPO` when the DSH
process working directory is not the repository being developed.
