# Agent Note: Persist Workshop Provider recovery state

Status: implemented

English | [中文](2026-08-25-workshop-provider-recovery-state.zh.md)

## Problem

The plugin Workshop's Provider HMR experiment appends a marked block to the user's Web Profile Patch and must restore the exact pre-experiment content when the Workshop restarts. A missing recovery snapshot used to leave the marked block in `cordis.patch.yml` while startup refused to continue. Keeping that snapshot in the operating system's temporary directory made a required restore input eligible for unrelated temporary-file cleanup.

## Decision

[`provider-profile.mjs`](../../../../parker/tutorial-labs/workshop/chapters/chapter-03-plugins/provider-profile.mjs) stores the pre-experiment Patch snapshot at `~/.dsh/.workshop-state/provider-hmr.json`. Normal cleanup verifies the Patch hash and restores that snapshot.

If the snapshot is missing, cleanup accepts exactly one complete marked block only when its contents byte-match the Workshop's generated `BEFORE` or `AFTER` configuration. It removes only that block and preserves every other Patch entry. A comments-only result receives the required top-level empty array. Missing, repeated, or edited markers still fail without changing the Patch.

## Alternatives considered

**Keep the snapshot in the operating system's temporary directory.** This keeps Workshop state outside `~/.dsh`, but temporary-file retention is unrelated to the lifetime of a Web Profile edit and cannot support deterministic cleanup.

**Change `AFTER` values back to `BEFORE` when the snapshot is missing.** This reconstructs the first experimental parameter set but leaves the Provider and Consumer loaded, so a restarted Workshop is not a clean experiment environment.

**Delete any text between matching marker strings.** The markers alone do not prove that the enclosed configuration still belongs to the Workshop. Exact matching of both generated variants permits recovery without accepting a manually edited block.

## Consequences

Workshop restarts preserve the exact Web Profile Patch while the persistent snapshot exists. An intact generated block remains recoverable if that snapshot is deleted, including after the experiment reaches its `AFTER` phase. The fallback cannot reproduce the original placement of an empty-array placeholder, so it emits the canonical comments followed by `[]`; this is semantically the same empty Patch. Recovery tests cover snapshot restoration, missing-state recovery, edited-block refusal, and startup cleanup.
