import { contextBridge, ipcRenderer } from 'electron'

export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can be accessed using `window.Main.myFunction`
   */

  saveFile: (data: Record<string, any>) => {
    ipcRenderer.send('save-file', data)
  },

  loadFile: () => {
    return JSON.parse(ipcRenderer.sendSync('load-file'))
  },

  saveRanking: (score: number) => {
    ipcRenderer.send('save-ranking', score)
  },

  loadRanking: () => {
    return ipcRenderer.sendSync('load-ranking')
  },

  quitApp: () => {
    ipcRenderer.send('app-quit')
  },

  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  }
}

contextBridge.exposeInMainWorld('Main', api)
