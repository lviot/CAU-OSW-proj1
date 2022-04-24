import { api } from '../../electron/bridge'

declare global {
  // eslint-disable-next-line
  interface Window {
    Main: typeof api
    resolveLocalFileSystemURL: (
      url: string,
      success: (data: any) => void,
      err: (err: any) => void,
    ) => void
  }
}
