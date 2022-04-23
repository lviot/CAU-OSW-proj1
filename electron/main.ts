import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import * as fs from 'fs'

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

// const assetsPath =
//   process.env.NODE_ENV === 'production'
//     ? process.resourcesPath
//     : app.getAppPath()

function createWindow () {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 1100,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function registerListeners () {
  /**
   * This comes from bridge integration, check bridge.ts
   */

  ipcMain.on('app-quit', () => {
    app.quit()
  })

  ipcMain.on('save-file', (_, data) => {
    const options = {
      title: 'Save your game',
      defaultPath: 'game.json',
      buttonLabel: 'Save',
      filters: [
        { name: 'json', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    }
    dialog.showSaveDialog(mainWindow!, options).then(result => {
      if (result.filePath)
        fs.writeFileSync(result.filePath, JSON.stringify(data))
    })
  })

  ipcMain.on('load-file', event => {
    const options = {
      title: 'Load your game',
      defaultPath: 'game.json',
      buttonLabel: 'Load',
      filters: [
        { name: 'json', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    }
    dialog.showOpenDialog(mainWindow!, options).then(result => {
      if (result.filePaths[0]) {
        const fd = fs.openSync(result.filePaths[0], 'r')
        const content = fs.readFileSync(fd, 'utf8');
        event.returnValue = content
      }
    })
  })

  ipcMain.on('save-score', (_, score) => {
    const appRoot = app.getAppPath()

    if (fs.existsSync(appRoot + '/ranking.json')) {
      const fd = fs.openSync(appRoot + '/ranking.json', 'r+')
      const content = fs.readFileSync(fd, 'utf8')
      let data
      try {
        data = JSON.parse(content)
      } catch (error) {
        data = []
      }
      data.push(score)
      fs.writeFileSync(appRoot + '/ranking.json', JSON.stringify(data))
    } else {
      const fd = fs.openSync(`${appRoot}/ranking.json`, 'w')
       fs.writeFileSync(fd, JSON.stringify([score]))
    }
  })

  ipcMain.on('load-ranking', (event) => {
    const appRoot = app.getAppPath()

    if (fs.existsSync(appRoot + '/ranking.json')) {
      const fd = fs.openSync(`${appRoot}/ranking.json`, 'r')
      event.returnValue = JSON.parse(fs.readFileSync(fd, 'utf8'))
    } else event.returnValue = []
  })
}

  app
    .on('ready', createWindow)
    .whenReady()
    .then(registerListeners)
    .catch(e => console.error(e))

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
