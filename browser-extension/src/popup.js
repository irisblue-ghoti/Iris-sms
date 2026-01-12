// popup.js - Wallet style popup script with i18n and theme support

const DEFAULT_API_BASE = 'https://iris-sms.vercel.app';
let API_BASE = DEFAULT_API_BASE;
let session = null;
let currentLang = 'en';
let currentTheme = 'light';

// Translations
const translations = {
  en: {
    balance: 'Available Balance',
    recharge: 'Recharge',
    history: 'History',
    quickActions: 'Quick Actions',
    receiveCode: 'Receive Code',
    receiveCodeDesc: 'Get global phone numbers',
    webConsole: 'Web Console',
    webConsoleDesc: 'Full feature experience',
    notLoggedIn: 'Not logged in',
    clickToLogin: 'Click to login',
    loggedIn: 'Logged in',
    helpCenter: 'Help Center',
    settings: 'Settings',
    connected: 'Connected',
    offline: 'Offline',
    error: 'Error'
  },
  zh: {
    balance: '可用余额',
    recharge: '充值',
    history: '历史',
    quickActions: '快捷操作',
    receiveCode: '接收验证码',
    receiveCodeDesc: '获取全球手机号',
    webConsole: '网页控制台',
    webConsoleDesc: '完整功能体验',
    notLoggedIn: '未登录',
    clickToLogin: '点击登录',
    loggedIn: '已登录',
    helpCenter: '帮助中心',
    settings: '设置',
    connected: '已连接',
    offline: '离线',
    error: '错误'
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await checkSession();
  setupEventListeners();
  checkServerStatus();
  applyTheme();
  applyLanguage();
});

// Load settings including language and theme
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['apiBase', 'language', 'theme']);
    if (result.apiBase) {
      API_BASE = result.apiBase;
    }
    if (result.language) {
      currentLang = result.language;
    }
    if (result.theme) {
      currentTheme = result.theme;
    }
  } catch (error) {
    console.error('Load settings error:', error);
  }
}

// Apply theme
function applyTheme() {
  const moonIcon = document.getElementById('moonIcon');
  const sunIcon = document.getElementById('sunIcon');

  if (currentTheme === 'dark') {
    document.body.classList.add('dark');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  } else {
    document.body.classList.remove('dark');
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
  }
}

// Toggle theme
async function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  await chrome.storage.local.set({ theme: currentTheme });
  applyTheme();
}

// Apply language
function applyLanguage() {
  const t = translations[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // Update status text
  const statusText = document.getElementById('statusText');
  const statusBadge = document.getElementById('statusBadge');
  if (statusBadge.classList.contains('offline')) {
    statusText.textContent = t.offline;
  } else {
    statusText.textContent = t.connected;
  }
}

// Toggle language
async function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'zh' : 'en';
  await chrome.storage.local.set({ language: currentLang });
  applyLanguage();
  updateUserDisplay(); // Re-apply user display with new language
}

// Check session status
async function checkSession() {
  try {
    // First, try to sync session from the website
    const webSession = await syncSessionFromWebsite();
    if (webSession) {
      session = webSession;
      await chrome.storage.local.set({ session });
      updateUserDisplay();
      await refreshBalance();
      return;
    }

    // Fall back to stored session
    const result = await chrome.storage.local.get(['session']);
    if (result.session) {
      session = result.session;
      updateUserDisplay();
      await refreshBalance();
    } else {
      updateUserDisplay();
    }
  } catch (error) {
    console.error('Check session error:', error);
    updateUserDisplay();
  }
}

// Sync session from the website
async function syncSessionFromWebsite() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/extension-session`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();

      // Sync language from platform
      if (data.language && (data.language === 'en' || data.language === 'zh')) {
        if (currentLang !== data.language) {
          currentLang = data.language;
          await chrome.storage.local.set({ language: currentLang });
          applyLanguage();
        }
      }

      if (data.token && data.email) {
        console.log('Session synced from website');
        return {
          token: data.token,
          email: data.email,
          balance: data.balance || '0.00'
        };
      }
    } else {
      // Even if not logged in, try to sync language
      const data = await response.json();
      if (data.language && (data.language === 'en' || data.language === 'zh')) {
        if (currentLang !== data.language) {
          currentLang = data.language;
          await chrome.storage.local.set({ language: currentLang });
          applyLanguage();
        }
      }
    }
  } catch (error) {
    console.log('Could not sync session from website:', error.message);
  }
  return null;
}

// Refresh balance
async function refreshBalance() {
  if (!session?.token) return;

  try {
    const response = await fetch(`${API_BASE}/api/user/stats`, {
      headers: { 'Authorization': `Bearer ${session.token}` }
    });

    if (response.ok) {
      const data = await response.json();
      session.balance = data.balance;
      await chrome.storage.local.set({ session });
      document.getElementById('balanceAmount').textContent =
        parseFloat(session.balance || 0).toFixed(2);
    }
  } catch (error) {
    console.error('Refresh balance error:', error);
  }
}

// Update user display
function updateUserDisplay() {
  const userEmail = document.getElementById('userEmail');
  const userAvatar = document.getElementById('userAvatar');
  const userStatus = document.getElementById('userStatus');
  const balanceAmount = document.getElementById('balanceAmount');
  const t = translations[currentLang];

  if (session && session.email) {
    userEmail.textContent = session.email;
    userEmail.removeAttribute('data-i18n');
    userAvatar.textContent = session.email[0].toUpperCase();
    userStatus.textContent = t.loggedIn;
    userStatus.removeAttribute('data-i18n');
    userStatus.classList.remove('not-logged');
    balanceAmount.textContent = parseFloat(session.balance || 0).toFixed(2);
  } else {
    userEmail.textContent = t.notLoggedIn;
    userEmail.setAttribute('data-i18n', 'notLoggedIn');
    userAvatar.textContent = '?';
    userStatus.textContent = t.clickToLogin;
    userStatus.setAttribute('data-i18n', 'clickToLogin');
    userStatus.classList.add('not-logged');
    balanceAmount.textContent = '0.00';
  }
}

// Check server status
async function checkServerStatus() {
  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');
  const t = translations[currentLang];

  try {
    const response = await fetch(`${API_BASE}/api/sms/services`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      statusBadge.classList.remove('offline');
      statusText.textContent = t.connected;
    } else {
      statusBadge.classList.add('offline');
      statusText.textContent = t.error;
    }
  } catch (error) {
    statusBadge.classList.add('offline');
    statusText.textContent = t.offline;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

  // Language toggle
  document.getElementById('langToggleBtn').addEventListener('click', toggleLanguage);

  // Open side panel - receive verification code
  document.getElementById('openPanelBtn').addEventListener('click', async () => {
    await openSidePanel('get-number');
  });

  // Open web console
  document.getElementById('openWebBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: API_BASE });
    window.close();
  });

  // Recharge button - open side panel with recharge tab
  document.getElementById('rechargeBtn').addEventListener('click', async () => {
    await openSidePanel('recharge');
  });

  // History button - open side panel with order history tab
  document.getElementById('historyBtn').addEventListener('click', async () => {
    await openSidePanel('order-history');
  });

  // User card click
  document.getElementById('userCard').addEventListener('click', async () => {
    if (session) {
      await openSidePanel('active-orders');
    } else {
      await openSidePanel('login');
    }
  });

  // Help center
  document.getElementById('helpLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${API_BASE}/help` });
    window.close();
  });
}

// Open side panel with specific tab
async function openSidePanel(tab) {
  try {
    // Store the target tab in storage so sidepanel can read it
    await chrome.storage.local.set({ openTab: tab });

    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.sidePanel.open({ windowId: currentTab.windowId });
    window.close();
  } catch (error) {
    console.error('Open side panel error:', error);
    chrome.tabs.create({ url: chrome.runtime.getURL('src/sidepanel.html') });
  }
}
