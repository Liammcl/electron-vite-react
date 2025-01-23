// 创建一个模拟的 IPC 处理器
const createIPC = () => {
  // 检查是否在Electron环境中
  const isElectron = window?.electron !== undefined;
  
  if (!isElectron) {
    // Web 模式下返回空实现
    console.log('Running in web mode - IPC disabled');
    return {
      on: (channel, callback) => {
        console.log(`IPC.on [${channel}] is not available in web mode`);
        return () => {};
      },
      send: (channel, ...args) => {
        console.log(`IPC.send [${channel}] is not available in web mode`, ...args);
      },
      invoke: async (channel, ...args) => {
        console.log(`IPC.invoke [${channel}] is not available in web mode`, ...args);
        return null;
      }
    };
  }
  
  // Electron 模式下返回真实的 ipcRenderer
  return window.electron.ipcRenderer;
};

export const ipcRenderer = createIPC();

// 只在Electron环境中添加事件监听
if (window?.electron) {
  window.electron.ipcRenderer.on('main-process-message', (_event, ...args) => {
    console.log('[Receive Main-process message]:', ...args);
  });
}