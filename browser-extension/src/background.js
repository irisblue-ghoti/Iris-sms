// background.js - 后台服务脚本

// 扩展安装或更新时
chrome.runtime.onInstalled.addListener(() => {
  console.log('IrisSMS已安装');

  // 设置侧边栏行为
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
    .catch(error => console.error('设置侧边栏行为失败:', error));
});

// 监听来自内容脚本或侧边栏的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request.action);

  switch (request.action) {
    case 'openPanel':
      // 打开侧边栏
      if (sender.tab) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId })
          .then(() => sendResponse({ success: true }))
          .catch(error => {
            console.error('打开侧边栏失败:', error);
            sendResponse({ success: false, error: error.message });
          });
      }
      return true; // 异步响应

    case 'getSession':
      // 获取存储的会话
      chrome.storage.local.get(['session'], (result) => {
        sendResponse({ session: result.session || null });
      });
      return true;

    case 'setSession':
      // 保存会话
      chrome.storage.local.set({ session: request.session }, () => {
        sendResponse({ success: true });
      });
      return true;

    case 'clearSession':
      // 清除会话
      chrome.storage.local.remove(['session'], () => {
        sendResponse({ success: true });
      });
      return true;

    case 'copyToClipboard':
      // 复制到剪贴板
      if (sender.tab) {
        chrome.scripting.executeScript({
          target: { tabId: sender.tab.id },
          func: (text) => {
            navigator.clipboard.writeText(text);
          },
          args: [request.text]
        }).then(() => {
          sendResponse({ success: true });
        }).catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      }
      return true;

    case 'openTab':
      // 打开新标签页
      chrome.tabs.create({ url: request.url })
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    default:
      sendResponse({ success: false, error: '未知操作' });
      return false;
  }
});

// 监听扩展图标点击（备用方案，如果没有设置 popup）
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (error) {
    console.error('打开侧边栏失败:', error);
    // 如果失败，打开网页版
    chrome.tabs.create({ url: 'http://localhost:3000' });
  }
});
