// IrisSMS Side Panel Script with i18n and theme support

// Default API address
const DEFAULT_API_BASE = 'https://iris-sms.vercel.app';
let API_BASE = DEFAULT_API_BASE;

// State
let session = null;
let services = [];
let countriesWithPrices = [];
let selectedService = null;
let selectedCountry = null;
let currentLang = 'en';
let currentTheme = 'light';
let historyPage = 1;
let historyTotalPages = 1;
let historyStatus = '';

// Translations
const translations = {
  en: {
    // Login/Register
    globalSmsService: 'Global SMS Verification Service',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    register: 'Register',
    createAccount: 'Create your account',
    confirmPassword: 'Confirm Password',
    noAccount: "Don't have an account?",
    registerNow: 'Register now',
    hasAccount: 'Already have an account?',
    loginNow: 'Login now',
    serverSettings: 'Server Settings',
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: 'Enter password',
    passwordMinChars: 'At least 6 characters',
    reenterPassword: 'Re-enter password',

    // Main page
    balance: 'Balance',
    getNumber: 'Get Number',
    activeOrders: 'Active Orders',
    orderHistory: 'Orders',
    recharge: 'Recharge',

    // Get Number
    selectService: '1. Select Service',
    selectServiceOption: 'Select service...',
    selectCountry: '2. Select Country',
    sortedByPrice: '(sorted by price)',
    searchCountry: 'Search country...',
    loadingPrices: 'Loading prices...',
    backToService: '← Back to select service',
    service: 'Service',
    country: 'Country',
    price: 'Price',
    getNumberBtn: 'Get Number',
    backToCountry: '← Back to select country',
    numbers: 'numbers',
    searchService: 'Search service...',
    noResults: 'No results found',

    // Orders
    noActiveOrders: 'No active orders',
    noOrders: 'No orders',
    allOrders: 'All Orders',
    completedOrders: 'Completed',
    cancelledOrders: 'Cancelled',
    expiredOrders: 'Expired',
    completed: 'Completed',
    cancelled: 'Cancelled',
    expired: 'Expired',
    refresh: 'Refresh',
    waiting: 'Waiting',
    received: 'Received',
    verificationCode: 'Verification Code',
    checkCode: 'Check Code',
    cancel: 'Cancel',
    note: 'Note',
    notePlaceholder: 'Save password...',
    noteSaved: 'Note saved',

    // Recharge
    howToGetCard: 'How to get card code?',
    contactSupport: 'Please contact support to purchase card code',
    minAmount: 'Minimum amount',
    contactSupportBtn: 'Contact Support',
    cardCodeRecharge: 'Card Code Recharge',
    rechargeNow: 'Recharge Now',
    rechargeSuccess: 'Recharge Successful',

    // Settings
    settings: 'Settings',
    configureServer: 'Configure server connection',
    serverAddress: 'Server Address',
    enterServerHint: 'Enter IrisSMS server address',
    saveSettings: 'Save Settings',
    resetDefault: 'Reset to Default',
    back: 'Back',

    // Messages
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed',
    registerSuccess: 'Registration successful, please login',
    registerFailed: 'Registration failed',
    loggedOut: 'Logged out',
    settingsSaved: 'Settings saved',
    settingsReset: 'Settings reset to default',
    connectionFailed: 'Connection failed',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    codeReceived: 'Code received',
    noCodeYet: 'No code received yet',
    cancelled: 'Cancelled',
    cancelFailed: 'Cancel failed',
    checkFailed: 'Check failed',
    rechargeFailed: 'Recharge failed',
    pleaseEnterCardCode: 'Please enter card code',
    pleaseEnterEmailPassword: 'Please enter email and password',
    passwordsNotMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    pleaseEnterApiAddress: 'Please enter a valid API address',
    cannotConnectServer: 'Cannot connect to server',
    loadServicesFailed: 'Failed to load services',
    pleaseSelectFirst: 'Please select service and country first',
    getNumberFailed: 'Failed to get number',
    success: 'Success',
    noCountriesAvailable: 'No countries available',
    loadFailed: 'Failed to load, please check network connection'
  },
  zh: {
    // Login/Register
    globalSmsService: '全球短信验证服务',
    email: '邮箱',
    password: '密码',
    login: '登录',
    register: '注册',
    createAccount: '创建账号',
    confirmPassword: '确认密码',
    noAccount: '没有账号？',
    registerNow: '立即注册',
    hasAccount: '已有账号？',
    loginNow: '立即登录',
    serverSettings: '服务器设置',
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: '请输入密码',
    passwordMinChars: '至少6个字符',
    reenterPassword: '再次输入密码',

    // Main page
    balance: '余额',
    getNumber: '获取号码',
    activeOrders: '进行中',
    orderHistory: '订单',
    recharge: '充值',

    // Get Number
    selectService: '1. 选择服务',
    selectServiceOption: '选择服务...',
    selectCountry: '2. 选择国家',
    sortedByPrice: '(按价格排序)',
    searchCountry: '搜索国家...',
    loadingPrices: '加载价格中...',
    backToService: '← 返回选择服务',
    service: '服务',
    country: '国家',
    price: '价格',
    getNumberBtn: '获取号码',
    backToCountry: '← 返回选择国家',
    numbers: '个号码',
    searchService: '搜索服务...',
    noResults: '未找到结果',

    // Orders
    noActiveOrders: '暂无进行中的订单',
    noOrders: '暂无订单',
    allOrders: '全部订单',
    completedOrders: '已完成',
    cancelledOrders: '已取消',
    expiredOrders: '已过期',
    completed: '已完成',
    cancelled: '已取消',
    expired: '已过期',
    refresh: '刷新',
    waiting: '等待中',
    received: '已收到',
    verificationCode: '验证码',
    checkCode: '检查验证码',
    cancel: '取消',
    note: '备注',
    notePlaceholder: '保存密码...',
    noteSaved: '备注已保存',

    // Recharge
    howToGetCard: '如何获取卡密？',
    contactSupport: '请联系客服购买卡密',
    minAmount: '最低金额',
    contactSupportBtn: '联系客服',
    cardCodeRecharge: '卡密充值',
    rechargeNow: '立即充值',
    rechargeSuccess: '充值成功',

    // Settings
    settings: '设置',
    configureServer: '配置服务器连接',
    serverAddress: '服务器地址',
    enterServerHint: '请输入IrisSMS服务器地址',
    saveSettings: '保存设置',
    resetDefault: '重置为默认',
    back: '返回',

    // Messages
    loginSuccess: '登录成功',
    loginFailed: '登录失败',
    registerSuccess: '注册成功，请登录',
    registerFailed: '注册失败',
    loggedOut: '已退出登录',
    settingsSaved: '设置已保存',
    settingsReset: '设置已重置为默认',
    connectionFailed: '连接失败',
    copied: '已复制',
    copyFailed: '复制失败',
    codeReceived: '收到验证码',
    noCodeYet: '暂未收到验证码',
    cancelled: '已取消',
    cancelFailed: '取消失败',
    checkFailed: '检查失败',
    rechargeFailed: '充值失败',
    pleaseEnterCardCode: '请输入卡密',
    pleaseEnterEmailPassword: '请输入邮箱和密码',
    passwordsNotMatch: '两次密码不一致',
    passwordTooShort: '密码至少6个字符',
    pleaseEnterApiAddress: '请输入有效的服务器地址',
    cannotConnectServer: '无法连接到服务器',
    loadServicesFailed: '加载服务失败',
    pleaseSelectFirst: '请先选择服务和国家',
    getNumberFailed: '获取号码失败',
    success: '成功',
    noCountriesAvailable: '暂无可用国家',
    loadFailed: '加载失败，请检查网络连接'
  }
};

// Get translation
function t(key) {
  return translations[currentLang][key] || key;
}

// DOM elements
const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const mainPage = document.getElementById('main-page');
const toastEl = document.getElementById('toast');
const loadingEl = document.getElementById('loading');

// Step containers
const stepService = document.getElementById('step-service');
const stepCountry = document.getElementById('step-country');
const stepConfirm = document.getElementById('step-confirm');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  applyTheme();
  applyLanguage();
  await checkSession();
  setupEventListeners();
  await handleOpenTab();
});

// Handle opening specific tab from popup
async function handleOpenTab() {
  try {
    const result = await chrome.storage.local.get(['openTab']);
    if (result.openTab) {
      // Clear the stored tab
      await chrome.storage.local.remove(['openTab']);

      // Handle special cases
      if (result.openTab === 'login') {
        if (!session) {
          showLoginPage();
        }
        return;
      }

      // Switch to the specified tab if logged in
      if (session) {
        const tabElement = document.querySelector(`[data-tab="${result.openTab}"]`);
        if (tabElement) {
          tabElement.click();
        }
      }
    }
  } catch (error) {
    console.error('Handle open tab error:', error);
  }
}

// Load settings
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
  const moonIcon = document.getElementById('moon-icon');
  const sunIcon = document.getElementById('sun-icon');

  if (currentTheme === 'dark') {
    document.body.classList.add('dark');
    if (moonIcon) moonIcon.classList.add('hidden');
    if (sunIcon) sunIcon.classList.remove('hidden');
  } else {
    document.body.classList.remove('dark');
    if (moonIcon) moonIcon.classList.remove('hidden');
    if (sunIcon) sunIcon.classList.add('hidden');
  }
}

// Toggle theme
async function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  await chrome.storage.local.set({ theme: currentTheme });
  applyTheme();
}

// Apply language to all elements with data-i18n attribute
function applyLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  // Apply placeholders
  document.querySelectorAll('[data-placeholder]').forEach(el => {
    const key = el.getAttribute('data-placeholder');
    if (translations[currentLang][key]) {
      el.placeholder = translations[currentLang][key];
    }
  });

  // Update service select placeholder if nothing is selected
  const serviceValueEl = document.getElementById('service-select-value');
  if (serviceValueEl && serviceValueEl.classList.contains('placeholder')) {
    serviceValueEl.textContent = t('selectServiceOption');
  }
}

// Toggle language
async function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'zh' : 'en';
  await chrome.storage.local.set({ language: currentLang });
  applyLanguage();
}

// Check session
async function checkSession() {
  showLoading();
  try {
    // First, try to sync session from the website (if user is logged in on the website)
    const webSession = await syncSessionFromWebsite();
    if (webSession) {
      session = webSession;
      await chrome.storage.local.set({ session });
      await refreshUserInfo();
      showMainPage();
      hideLoading();
      return;
    }

    // Fall back to stored session
    const result = await chrome.storage.local.get(['session']);
    if (result.session) {
      session = result.session;
      await refreshUserInfo();
      showMainPage();
    } else {
      showLoginPage();
    }
  } catch (error) {
    showLoginPage();
  }
  hideLoading();
}

// Sync session from the website (for users who logged in via browser)
async function syncSessionFromWebsite() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/extension-session`, {
      method: 'GET',
      credentials: 'include', // Include cookies from the website
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

// Setup event listeners
function setupEventListeners() {
  // Theme toggle
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Language toggle
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', toggleLanguage);
  }

  // Page switching
  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterPage();
  });

  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    showLoginPage();
  });

  // Login
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  // Register
  document.getElementById('register-form').addEventListener('submit', handleRegister);

  // Logout
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');

      // Load order history when tab is clicked
      if (tab.dataset.tab === 'order-history') {
        loadOrderHistory();
      }
    });
  });

  // Service searchable select
  const serviceTrigger = document.getElementById('service-select-trigger');
  const serviceDropdown = document.getElementById('service-dropdown');
  const serviceSearch = document.getElementById('service-search');

  if (serviceTrigger) {
    serviceTrigger.addEventListener('click', () => {
      const isOpen = !serviceDropdown.classList.contains('hidden');
      if (isOpen) {
        closeServiceDropdown();
      } else {
        openServiceDropdown();
      }
    });
  }

  if (serviceSearch) {
    serviceSearch.addEventListener('input', filterServices);
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const serviceContainer = document.getElementById('service-select-container');
    if (serviceContainer && !serviceContainer.contains(e.target)) {
      closeServiceDropdown();
    }
  });

  // Country search
  document.getElementById('country-search').addEventListener('input', filterCountries);

  // Back buttons
  document.getElementById('back-to-service').addEventListener('click', () => {
    showStep('service');
    resetServiceSelect();
    selectedService = null;
  });

  document.getElementById('back-to-country').addEventListener('click', () => {
    showStep('country');
    selectedCountry = null;
  });

  // Get number
  document.getElementById('get-number-btn').addEventListener('click', handleGetNumber);

  // Refresh orders
  document.getElementById('refresh-orders-btn').addEventListener('click', loadActiveOrders);

  // Order history filter
  document.getElementById('history-status-filter').addEventListener('change', (e) => {
    historyStatus = e.target.value;
    historyPage = 1;
    loadOrderHistory();
  });

  // Order history pagination
  document.getElementById('prev-page-btn').addEventListener('click', () => {
    if (historyPage > 1) {
      historyPage--;
      loadOrderHistory();
    }
  });

  document.getElementById('next-page-btn').addEventListener('click', () => {
    if (historyPage < historyTotalPages) {
      historyPage++;
      loadOrderHistory();
    }
  });

  // Card recharge
  document.getElementById('recharge-card-btn').addEventListener('click', handleCardRecharge);
}

// Show step
function showStep(step) {
  stepService.classList.add('hidden');
  stepCountry.classList.add('hidden');
  stepConfirm.classList.add('hidden');

  switch (step) {
    case 'service':
      stepService.classList.remove('hidden');
      break;
    case 'country':
      stepCountry.classList.remove('hidden');
      break;
    case 'confirm':
      stepConfirm.classList.remove('hidden');
      break;
  }
}

// Page display control
function showLoginPage() {
  loginPage.classList.remove('hidden');
  registerPage.classList.add('hidden');
  mainPage.classList.add('hidden');
}

function showRegisterPage() {
  loginPage.classList.add('hidden');
  registerPage.classList.remove('hidden');
  mainPage.classList.add('hidden');
}

function showMainPage() {
  loginPage.classList.add('hidden');
  registerPage.classList.add('hidden');
  mainPage.classList.remove('hidden');
  loadServices();
  loadActiveOrders();
  resetServiceSelect();
  showStep('service');
}

// Login handler
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showToast(t('pleaseEnterEmailPassword'), 'error');
    return;
  }

  showLoading();
  try {
    const response = await fetch(`${API_BASE}/api/auth/extension-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || t('loginFailed'));
    }

    session = data;
    await chrome.storage.local.set({ session });
    showToast(t('loginSuccess'), 'success');
    showMainPage();
  } catch (error) {
    showToast(error.message || t('loginFailed'), 'error');
  }
  hideLoading();
}

// Register handler
async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm').value;

  if (!email || !password) {
    showToast(t('pleaseEnterEmailPassword'), 'error');
    return;
  }

  if (password !== confirm) {
    showToast(t('passwordsNotMatch'), 'error');
    return;
  }

  if (password.length < 6) {
    showToast(t('passwordTooShort'), 'error');
    return;
  }

  showLoading();
  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || t('registerFailed'));
    }

    showToast(t('registerSuccess'), 'success');
    showLoginPage();
    document.getElementById('login-email').value = email;
  } catch (error) {
    showToast(error.message || t('registerFailed'), 'error');
  }
  hideLoading();
}

// Logout handler
async function handleLogout() {
  await chrome.storage.local.remove(['session']);
  session = null;
  showToast(t('loggedOut'));
  showLoginPage();
}

// Refresh user info
async function refreshUserInfo() {
  if (!session?.token) return;

  try {
    const response = await fetch(`${API_BASE}/api/user/stats`, {
      headers: { 'Authorization': `Bearer ${session.token}` }
    });

    if (response.ok) {
      const data = await response.json();
      session.balance = data.balance;
      await chrome.storage.local.set({ session });
      updateUserDisplay();
    }
  } catch (error) {
    console.error('Refresh user info error:', error);
  }
}

// Update user display
function updateUserDisplay() {
  if (!session) return;
  document.getElementById('user-email').textContent = session.email;
  document.getElementById('user-avatar').textContent = session.email[0].toUpperCase();
  document.getElementById('user-balance').textContent = session.balance || '0.00';
}

// Load services
async function loadServices() {
  try {
    console.log('Loading services from:', `${API_BASE}/api/sms/services`);
    const response = await fetch(`${API_BASE}/api/sms/services`);
    if (response.ok) {
      const data = await response.json();
      console.log('Services loaded:', data.services?.length || 0);
      services = data.services || [];
      populateServiceSelect();
    } else {
      console.error('Failed to load services:', response.status);
      showToast(t('loadServicesFailed'), 'error');
    }
  } catch (error) {
    console.error('Load services error:', error);
    showToast(t('cannotConnectServer'), 'error');
  }
}

// Populate service select
function populateServiceSelect() {
  renderServiceList(services);
}

// Open service dropdown
function openServiceDropdown() {
  const trigger = document.getElementById('service-select-trigger');
  const dropdown = document.getElementById('service-dropdown');
  const searchInput = document.getElementById('service-search');

  trigger.classList.add('active');
  dropdown.classList.remove('hidden');

  // Clear and focus search input
  if (searchInput) {
    searchInput.value = '';
    setTimeout(() => searchInput.focus(), 50);
  }

  // Re-render full list
  renderServiceList(services);
}

// Close service dropdown
function closeServiceDropdown() {
  const trigger = document.getElementById('service-select-trigger');
  const dropdown = document.getElementById('service-dropdown');

  trigger.classList.remove('active');
  dropdown.classList.add('hidden');
}

// Reset service select
function resetServiceSelect() {
  const valueEl = document.getElementById('service-select-value');
  valueEl.textContent = t('selectServiceOption');
  valueEl.classList.add('placeholder');
  closeServiceDropdown();
}

// Filter services
function filterServices() {
  const searchInput = document.getElementById('service-search');
  const keyword = searchInput.value.toLowerCase().trim();

  if (!keyword) {
    renderServiceList(services);
    return;
  }

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(keyword) ||
    s.code.toLowerCase().includes(keyword)
  );
  renderServiceList(filtered);
}

// Render service list
function renderServiceList(serviceList) {
  const listEl = document.getElementById('service-list');

  if (serviceList.length === 0) {
    listEl.innerHTML = `<div class="searchable-select-empty">${t('noResults')}</div>`;
    return;
  }

  listEl.innerHTML = serviceList.map(service => `
    <div class="searchable-select-item${selectedService?.code === service.code ? ' selected' : ''}" data-code="${service.code}" data-name="${service.name}">
      <span class="searchable-select-item-label">${service.name}</span>
    </div>
  `).join('');

  // Bind click events
  listEl.querySelectorAll('.searchable-select-item').forEach(item => {
    item.addEventListener('click', () => {
      handleServiceItemSelect(item.dataset.code, item.dataset.name);
    });
  });
}

// Handle service item selection
function handleServiceItemSelect(code, name) {
  const valueEl = document.getElementById('service-select-value');
  valueEl.textContent = name;
  valueEl.classList.remove('placeholder');

  selectedService = {
    code: code,
    name: name
  };

  closeServiceDropdown();

  // Show country selection step
  showStep('country');
  document.getElementById('country-search').value = '';
  document.getElementById('country-list').innerHTML = `<div class="loading-hint">${t('loadingPrices')}</div>`;

  // Load country prices for this service
  loadCountriesWithPrices(code);
}

// Load country prices
async function loadCountriesWithPrices(serviceCode) {
  try {
    console.log('Loading prices for service:', serviceCode);
    const response = await fetch(`${API_BASE}/api/sms/prices-by-service?service=${serviceCode}`);
    const data = await response.json();
    console.log('API response:', data);

    if (response.ok && data.countries && data.countries.length > 0) {
      countriesWithPrices = data.countries;
      renderCountryList(countriesWithPrices);
    } else {
      const errorMsg = data.error || t('noCountriesAvailable');
      console.log('No countries available:', errorMsg);
      document.getElementById('country-list').innerHTML = `<div class="empty-hint">${errorMsg}</div>`;
    }
  } catch (error) {
    console.error('Load countries error:', error);
    document.getElementById('country-list').innerHTML = `<div class="empty-hint">${t('loadFailed')}</div>`;
  }
}

// Render country list
function renderCountryList(countries) {
  const listEl = document.getElementById('country-list');

  if (countries.length === 0) {
    listEl.innerHTML = `<div class="empty-hint">${t('noCountriesAvailable')}</div>`;
    return;
  }

  listEl.innerHTML = countries.map(country => `
    <div class="country-item" data-code="${country.countryCode}" data-name="${country.countryName}" data-price="${country.price}">
      <div class="country-info">
        <span class="country-name">${country.countryName}</span>
        <span class="country-count">${country.count} ${t('numbers')}</span>
      </div>
      <span class="country-price">¥${country.price.toFixed(2)}</span>
    </div>
  `).join('');

  // Bind click events
  listEl.querySelectorAll('.country-item').forEach(item => {
    item.addEventListener('click', () => {
      selectedCountry = {
        code: item.dataset.code,
        name: item.dataset.name,
        price: parseFloat(item.dataset.price)
      };
      showConfirmStep();
    });
  });
}

// Filter countries
function filterCountries() {
  const keyword = document.getElementById('country-search').value.toLowerCase().trim();
  if (!keyword) {
    renderCountryList(countriesWithPrices);
    return;
  }

  const filtered = countriesWithPrices.filter(c =>
    c.countryName.toLowerCase().includes(keyword)
  );
  renderCountryList(filtered);
}

// Show confirm step
function showConfirmStep() {
  document.getElementById('confirm-service').textContent = selectedService.name;
  document.getElementById('confirm-country').textContent = selectedCountry.name;
  document.getElementById('confirm-price').textContent = `¥${selectedCountry.price.toFixed(2)}`;
  showStep('confirm');
}

// Get number handler
async function handleGetNumber() {
  if (!selectedService || !selectedCountry) {
    showToast(t('pleaseSelectFirst'), 'error');
    return;
  }

  showLoading();
  try {
    const response = await fetch(`${API_BASE}/api/sms/get-number`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.token}`
      },
      body: JSON.stringify({
        country: selectedCountry.code,
        service: selectedService.code
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || t('getNumberFailed'));
    }

    showToast(`${t('success')}: ${data.phone}`, 'success');
    await refreshUserInfo();

    // Reset selection
    selectedService = null;
    selectedCountry = null;
    resetServiceSelect();
    showStep('service');

    // Switch to active orders tab
    document.querySelector('[data-tab="active-orders"]').click();
    loadActiveOrders();
  } catch (error) {
    showToast(error.message || t('getNumberFailed'), 'error');
  }
  hideLoading();
}

// Load active orders
async function loadActiveOrders() {
  const ordersList = document.getElementById('orders-list');

  try {
    const response = await fetch(`${API_BASE}/api/sms/orders/active`, {
      headers: { 'Authorization': `Bearer ${session?.token}` }
    });

    if (!response.ok) throw new Error('Failed to load');

    const data = await response.json();

    if (data.orders.length === 0) {
      ordersList.innerHTML = `<div class="empty-state"><p>${t('noActiveOrders')}</p></div>`;
      return;
    }

    ordersList.innerHTML = data.orders.map(order => `
      <div class="order-card" data-id="${order.id}">
        <div class="order-header">
          <div class="order-phone">
            <span>${order.phone}</span>
            <button class="copy-btn" data-copy="${order.phone}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
          <span class="order-status ${order.status === 'received' ? 'status-received' : 'status-waiting'}">
            ${order.status === 'received' ? t('received') : t('waiting')}
          </span>
        </div>
        <div class="order-service">${order.service}</div>
        ${order.message ? `
          <div class="order-message">
            <div class="order-message-content">${order.message}</div>
          </div>
        ` : ''}
        ${order.code ? `
          <div class="order-code">
            <div class="order-code-label">${t('verificationCode')}</div>
            <div class="order-code-value">
              <span>${order.code}</span>
              <button class="copy-btn" data-copy="${order.code}">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        ` : ''}
        <div class="order-note">
          <div class="order-note-label">${t('note')}</div>
          <div class="order-note-input">
            <input type="text" value="${order.note || ''}" placeholder="${t('notePlaceholder')}" data-note-order="${order.id}">
          </div>
        </div>
        <div class="order-actions">
          <button class="btn btn-outline btn-sm" data-check-code="${order.id}">${t('checkCode')}</button>
          ${order.status !== 'received' ? `
            <button class="btn btn-danger btn-sm" data-cancel-order="${order.id}">${t('cancel')}</button>
          ` : ''}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Load orders error:', error);
  }
}

// Copy text function
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(t('copied'), 'success');
  } catch (error) {
    showToast(t('copyFailed'), 'error');
  }
}

// Save note function
async function saveNote(orderId, note) {
  try {
    const response = await fetch(`${API_BASE}/api/sms/orders/note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.token}`
      },
      body: JSON.stringify({ orderId, note })
    });

    if (response.ok) {
      showToast(t('noteSaved'), 'success');
    }
  } catch (error) {
    console.error('Save note error:', error);
  }
}

// Check verification code function
async function checkCode(orderId) {
  showLoading();
  try {
    const response = await fetch(`${API_BASE}/api/sms/check-code?orderId=${orderId}`, {
      headers: { 'Authorization': `Bearer ${session?.token}` }
    });

    const data = await response.json();

    if (data.code) {
      showToast(`${t('codeReceived')}: ${data.code}`, 'success');
    } else {
      showToast(t('noCodeYet'), 'info');
    }

    loadActiveOrders();
  } catch (error) {
    showToast(t('checkFailed'), 'error');
  }
  hideLoading();
}

// Cancel order function
async function cancelOrder(orderId) {
  showLoading();
  try {
    const response = await fetch(`${API_BASE}/api/sms/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.token}`
      },
      body: JSON.stringify({ orderId })
    });

    if (response.ok) {
      showToast(t('cancelled'), 'success');
      await refreshUserInfo();
      loadActiveOrders();
    }
  } catch (error) {
    showToast(t('cancelFailed'), 'error');
  }
  hideLoading();
};

// Card recharge handler
async function handleCardRecharge() {
  const cardCodeInput = document.getElementById('card-code-input');
  const code = cardCodeInput.value.trim();

  if (!code) {
    showToast(t('pleaseEnterCardCode'), 'error');
    return;
  }

  showLoading();
  try {
    const response = await fetch(`${API_BASE}/api/recharge/card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.token}`
      },
      body: JSON.stringify({ code })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || t('rechargeFailed'));
    }

    // Show success message
    const successEl = document.getElementById('recharge-success');
    const successAmount = document.getElementById('success-amount');
    successAmount.textContent = `+¥${parseFloat(data.amount).toFixed(2)}`;
    successEl.classList.remove('hidden');

    // Clear input
    cardCodeInput.value = '';

    // Refresh user info
    await refreshUserInfo();

    showToast(data.message || t('rechargeSuccess'), 'success');

    // Hide success message after 3 seconds
    setTimeout(() => {
      successEl.classList.add('hidden');
    }, 3000);
  } catch (error) {
    showToast(error.message || t('rechargeFailed'), 'error');
  }
  hideLoading();
}

// Toast notification
function showToast(message, type = 'info') {
  toastEl.textContent = message;
  toastEl.className = `toast ${type}`;
  toastEl.classList.remove('hidden');

  setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 3000);
}

// Loading control
function showLoading() {
  loadingEl.classList.remove('hidden');
}

function hideLoading() {
  loadingEl.classList.add('hidden');
}

// Load order history
async function loadOrderHistory() {
  const historyList = document.getElementById('history-list');

  try {
    let url = `${API_BASE}/api/sms/orders?page=${historyPage}`;
    if (historyStatus) {
      url += `&status=${historyStatus}`;
    }

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${session?.token}` }
    });

    if (!response.ok) throw new Error('Failed to load');

    const data = await response.json();

    // Update pagination
    historyTotalPages = data.pagination.totalPages || 1;
    document.getElementById('page-info').textContent = `${historyPage}/${historyTotalPages}`;
    document.getElementById('prev-page-btn').disabled = historyPage <= 1;
    document.getElementById('next-page-btn').disabled = historyPage >= historyTotalPages;

    if (data.orders.length === 0) {
      historyList.innerHTML = `<div class="empty-state"><p>${t('noOrders')}</p></div>`;
      return;
    }

    historyList.innerHTML = data.orders.map(order => {
      const statusText = getStatusText(order.status);
      const statusClass = getStatusClass(order.status);
      const latestMessage = order.messages && order.messages.length > 0 ? order.messages[0] : null;

      return `
        <div class="order-card history-card" data-id="${order.id}">
          <div class="order-header">
            <div class="order-phone">
              <span>${order.phoneNumber || '-'}</span>
              ${order.phoneNumber ? `
                <button class="copy-btn" data-copy="${order.phoneNumber}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              ` : ''}
            </div>
            <span class="order-status ${statusClass}">
              ${statusText}
            </span>
          </div>
          <div class="order-service">${order.serviceName}</div>
          <div class="order-meta">
            <span class="order-country">${order.countryName}</span>
            <span class="order-price">¥${parseFloat(order.cost).toFixed(2)}</span>
          </div>
          ${latestMessage?.code ? `
            <div class="order-code">
              <div class="order-code-label">${t('verificationCode')}</div>
              <div class="order-code-value">
                <span>${latestMessage.code}</span>
                <button class="copy-btn" data-copy="${latestMessage.code}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </div>
          ` : ''}
          <div class="order-time">${formatTime(order.createdAt)}</div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Load order history error:', error);
    historyList.innerHTML = `<div class="empty-state"><p>${t('loadFailed')}</p></div>`;
  }
}

// Get status text
function getStatusText(status) {
  switch (status) {
    case 'completed': return t('completed');
    case 'cancelled': return t('cancelled');
    case 'expired': return t('expired');
    case 'active': return t('waiting');
    default: return status;
  }
}

// Get status CSS class
function getStatusClass(status) {
  switch (status) {
    case 'completed': return 'status-received';
    case 'cancelled': return 'status-cancelled';
    case 'expired': return 'status-expired';
    case 'active': return 'status-waiting';
    default: return '';
  }
}

// Format time
function formatTime(isoString) {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}
