import { mkdir, readFile, rename, appendFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { EventRecord, Persistence, RunSnapshot } from './types.ts'

export class JsonlPersistence implements Persistence {
  private readonly root: string
  private readonly runs = new Map<string, number>()

  constructor(root: string) {
    this.root = root
  }

  private dir(runId: string): string { return join(this.root, runId) }
  private events(runId: string): string { return join(this.dir(runId), 'events.jsonl') }
  private snapshot(runId: string): string { return join(this.dir(runId), 'state.json') }

  async append(event: Omit<EventRecord, 'seq' | 'at'>): Promise<void> {
    const runId = String(event.data?.runId ?? 'unknown')
    const seq = (this.runs.get(runId) ?? 0) + 1
    this.runs.set(runId, seq)
    const record: EventRecord = { ...event, seq, at: new Date().toISOString() }
    await mkdir(this.dir(runId), { recursive: true })
    await appendFile(this.events(runId), `${JSON.stringify(record)}\n`, 'utf8')
  }

  async save(snapshot: RunSnapshot): Promise<void> {
    await mkdir(dirname(this.snapshot(snapshot.runId)), { recursive: true })
    const target = this.snapshot(snapshot.runId)
    const temp = `${target}.tmp-${process.pid}`
    await writeFile(temp, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
    await rename(temp, target)
  }

  async load(runId: string): Promise<RunSnapshot | undefined> {
    try {
      return JSON.parse(await readFile(this.snapshot(runId), 'utf8')) as RunSnapshot
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
      throw error
    }
  }
}
