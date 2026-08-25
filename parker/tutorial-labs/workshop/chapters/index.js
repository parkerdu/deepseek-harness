import { createChapter03Plugins } from './chapter-03-plugins/chapter.js'

export function createChapters(runtime) {
  return [createChapter03Plugins(runtime)]
}
