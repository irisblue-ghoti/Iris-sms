// 内容脚本 - 在每个页面注入悬浮按钮

(function() {
  // 检查是否在平台页面，自动同步登录状态
  async function syncSessionFromPlatform() {
    try {
      // 获取当前API地址
      const result = await chrome.storage.local.get(['apiBase']);
      const apiBase = result.apiBase || 'http://localhost:3000';

      // 检查当前页面是否是平台页面
      if (!window.location.origin.includes(new URL(apiBase).host) &&
          !window.location.href.startsWith(apiBase)) {
        return;
      }

      // 尝试获取平台的登录状态
      const response = await fetch(`${apiBase}/api/auth/extension-session`, {
        credentials: 'include' // 携带cookie
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token && data.email) {
          // 同步到插件存储
          const session = {
            token: data.token,
            email: data.email,
            balance: data.balance
          };
          await chrome.storage.local.set({ session });
          console.log('IrisSMS: 已同步登录状态');
        }
      }
    } catch (error) {
      // 静默失败，不影响页面
      console.log('IrisSMS: 同步登录状态失败', error.message);
    }
  }

  // 页面加载完成后尝试同步
  syncSessionFromPlatform();

  // 检查是否已经注入
  if (document.getElementById('sms-helper-fab')) return;

  // 创建悬浮按钮
  const fab = document.createElement('div');
  fab.id = 'sms-helper-fab';
  fab.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      <line x1="9" y1="10" x2="15" y2="10"></line>
    </svg>
  `;
  fab.title = 'IrisSMS';

  document.body.appendChild(fab);

  // 点击打开侧边栏
  fab.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPanel' });
  });

  // 拖拽功能
  let isDragging = false;
  let startY = 0;
  let startTop = 0;

  fab.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startTop = fab.offsetTop;
    fab.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const newTop = startTop + (e.clientY - startY);
    const maxTop = window.innerHeight - fab.offsetHeight - 20;
    fab.style.top = Math.max(20, Math.min(maxTop, newTop)) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      fab.style.transition = 'all 0.3s ease';
      // 保存位置
      chrome.storage.local.set({ fabTop: fab.style.top });
    }
  });

  // 恢复保存的位置
  chrome.storage.local.get(['fabTop'], (result) => {
    if (result.fabTop) {
      fab.style.top = result.fabTop;
    }
  });
})();
