declare module '@deepseek-ai/cordis' {
  interface Context {
    systemPrompt: {
      section(options: { name: string; order: number; text: string }): unknown
    }
  }
}
