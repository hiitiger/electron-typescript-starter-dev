declare global {
  interface GA4 {
    gtag: (...args: unknown[]) => void
  }

  interface API {
    __api__: {
      sdk: {
        version: string
      }
      ipc: {
        send: (channel: string, data?: any) => void
        on: (channel: string, listener: (ctx: any, ...args: any[]) => void) => void
      }
    }
  }

  interface Window extends GA4, API {}
}

export {}
