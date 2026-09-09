/**
 * SnipLink & QR Generator — Interactive Prototype Controller
 * Standard: Vanilla JS, Neo-Pop Utility, Offline-First (Local Storage)
 */

(function () {
  'use strict';

  // --- STATE MANAGEMENT ---
  const DEFAULT_LINKS = [
    {
      id: 'link-1',
      slug: 'promo-kopi',
      shortUrl: 'https://snip.link/promo-kopi',
      origUrl: 'https://tokopedia.com/kopikenangan/promo-senin-ceria',
      category: 'Promo',
      clicks: 0,
      scans: 0,
      pinned: true,
      createdAt: '2 jam yang lalu'
    },
    {
      id: 'link-2',
      slug: 'bio-creator',
      shortUrl: 'https://snip.link/bio-creator',
      origUrl: 'https://instagram.com/rakacreative/portfolio',
      category: 'Sosial Media',
      clicks: 0,
      scans: 0,
      pinned: false,
      createdAt: 'Kemarin'
    },
    {
      id: 'link-3',
      slug: 'menu-resto',
      shortUrl: 'https://snip.link/menu-resto',
      origUrl: 'https://cindycoffee.menu/standing-tent-qr',
      category: 'Produk',
      clicks: 0,
      scans: 0,
      pinned: false,
      createdAt: '3 hari lalu'
    }
  ];

  let appState = {
    links: [],
    activeTab: 'view-home',
    qrConfig: {
      content: 'https://snip.link/promo-kopi',
      type: 'url',
      color: '#0058BE',
      moduleStyle: 'chunky', // 'chunky', 'squircle', 'dot'
      frame: 'scan-me',      // 'scan-me', 'menu', 'wifi', 'none'
      enableLogo: true
    },
    activeFilter: 'all',
    searchQuery: '',
    deviceFullMode: false
  };

  // --- LOCAL STORAGE HELPERS ---
  function loadLinks() {
    const saved = localStorage.getItem('sniplink_library_v1');
    if (saved) {
      try {
        appState.links = JSON.parse(saved);
        return;
      } catch (e) {
        console.error('Gagal membaca localStorage:', e);
      }
    }
    appState.links = JSON.parse(JSON.stringify(DEFAULT_LINKS));
    saveLinks();
  }

  function saveLinks() {
    localStorage.setItem('sniplink_library_v1', JSON.stringify(appState.links));
  }

  // --- INITIALIZATION ---
  window.addEventListener('DOMContentLoaded', () => {
    loadLinks();
    initClock();
    initNavigation();
    initShortenerForm();
    initQRStudio();
    initLinksLibrary();
    initAnalytics();
    initDeviceControls();
    renderAllViews();
    checkSimulatedClipboard();
  });

  // --- 1. CLOCK & HEADER SIMULATOR ---
  function initClock() {
    const clockEl = document.getElementById('status-clock');
    if (!clockEl) return;
    function update() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      clockEl.textContent = `${h}:${m}`;
    }
    update();
    setInterval(update, 30000);
  }

  // --- 2. BOTTOM BAR NAVIGATION ---
  function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        switchTab(targetId);
      });
    });

    const seeAllBtn = document.getElementById('btn-see-all-links');
    if (seeAllBtn) {
      seeAllBtn.addEventListener('click', () => switchTab('view-links'));
    }
  }

  function switchTab(targetId) {
    appState.activeTab = targetId;
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === targetId);
    });
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-target') === targetId);
    });
    const viewport = document.getElementById('screen-viewport');
    if (viewport) viewport.scrollTop = 0;

    if (targetId === 'view-generator') {
      renderQRCanvas();
    } else if (targetId === 'view-analytics') {
      updateAnalyticsValues();
    }
  }

  // --- 3. TOAST NOTIFICATION UTILITY ---
  let toastTimer = null;
  function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toast-notification');
    const toastText = document.getElementById('toast-text');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast || !toastText) return;

    toastText.textContent = message;
    if (toastIcon) {
      toastIcon.innerHTML = isSuccess
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D6393D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }

    toast.style.display = 'flex';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  }

  // --- 4. CLIPBOARD DETECTION BANNER ---
  function checkSimulatedClipboard() {
    const banner = document.getElementById('clipboard-banner');
    const textEl = document.getElementById('clipboard-detected-text');
    const useBtn = document.getElementById('btn-use-clipboard');
    if (!banner || !textEl || !useBtn) return;

    const sampleCopied = 'https://shopee.co.id/flash-sale/diskon-ramadhan-spesial-99';
    textEl.textContent = sampleCopied;
    banner.style.display = 'flex';

    useBtn.addEventListener('click', () => {
      const input = document.getElementById('input-long-url');
      if (input) {
        input.value = sampleCopied;
        input.focus();
        showToast('URL clipboard berhasil ditempel.');
      }
      banner.style.display = 'none';
    });
  }

  // --- 5. SHORTENER ENGINE FORM ---
  function initShortenerForm() {
    const toggleSlugBtn = document.getElementById('btn-toggle-slug-options');
    const slugBody = document.getElementById('slug-options-body');
    const iconCaret = document.getElementById('icon-slug-caret');

    if (toggleSlugBtn && slugBody) {
      toggleSlugBtn.addEventListener('click', () => {
        const isHidden = slugBody.style.display === 'none';
        slugBody.style.display = isHidden ? 'flex' : 'none';
        if (iconCaret) {
          iconCaret.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      });
    }

    const pasteBtn = document.getElementById('btn-paste-clipboard');
    if (pasteBtn) {
      pasteBtn.addEventListener('click', () => {
        const input = document.getElementById('input-long-url');
        if (input) {
          input.value = 'https://tiktok.com/@rakacreative/video/7289123849120';
          showToast('Tautan sampel berhasil ditempel.');
        }
      });
    }

    const form = document.getElementById('form-shorten');
    if (form) {
      form.addEventListener('submit', handleShortenSubmit);
    }

    const closeResultBtn = document.getElementById('btn-close-result');
    if (closeResultBtn) {
      closeResultBtn.addEventListener('click', () => {
        const card = document.getElementById('shorten-result-card');
        if (card) card.style.display = 'none';
      });
    }
  }

  function handleShortenSubmit() {
    const urlInput = document.getElementById('input-long-url');
    const slugInput = document.getElementById('input-custom-slug');
    const catSelect = document.getElementById('select-category');

    if (!urlInput || !urlInput.value.trim()) {
      showToast('Masukkan URL yang valid.', false);
      return;
    }

    const origUrl = urlInput.value.trim();
    let slug = slugInput && slugInput.value.trim() ? slugInput.value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') : '';

    if (!slug) {
      slug = generateRandomSlug(6);
    }

    // Check duplicate slug
    const exists = appState.links.some(l => l.slug.toLowerCase() === slug.toLowerCase());
    if (exists) {
      slug = `${slug}-${Math.floor(10 + Math.random() * 90)}`;
    }

    const category = catSelect ? catSelect.value : 'Promo';
    const shortUrl = `https://snip.link/${slug}`;

    const newLink = {
      id: 'link-' + Date.now(),
      slug: slug,
      shortUrl: shortUrl,
      origUrl: origUrl,
      category: category,
      clicks: 0,
      scans: 0,
      pinned: false,
      createdAt: 'Baru saja'
    };

    appState.links.unshift(newLink);
    saveLinks();

    // Show result card
    const resultCard = document.getElementById('shorten-result-card');
    const resShortUrl = document.getElementById('result-short-url-text');
    const resOrigUrl = document.getElementById('result-orig-url-text');
    const copyResultBtn = document.getElementById('btn-copy-result');
    const customizeQRBtn = document.getElementById('btn-customize-result-qr');

    if (resultCard && resShortUrl && resOrigUrl) {
      resShortUrl.textContent = shortUrl;
      resOrigUrl.textContent = origUrl;
      resultCard.style.display = 'flex';

      copyResultBtn.onclick = () => {
        copyToClipboard(shortUrl);
      };

      customizeQRBtn.onclick = () => {
        appState.qrConfig.content = shortUrl;
        const qrInput = document.getElementById('input-qr-content-url');
        if (qrInput) qrInput.value = shortUrl;
        switchTab('view-generator');
      };
    }

    urlInput.value = '';
    if (slugInput) slugInput.value = '';
    renderAllViews();
    showToast('Tautan ringkas berhasil dibuat!');
  }

  function generateRandomSlug(length = 6) {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // --- 6. RENDERING VIEWS ---
  function renderAllViews() {
    renderHomeView();
    renderLinksLibrary();
    updateAnalyticsValues();
    renderQRCanvas();
  }

  function renderHomeView() {
    // Update summary stats
    const statLinks = document.getElementById('home-stat-links');
    const statClicks = document.getElementById('home-stat-clicks');
    const statScans = document.getElementById('home-stat-scans');

    const totalClicks = appState.links.reduce((acc, l) => acc + l.clicks, 0);
    const totalScans = appState.links.reduce((acc, l) => acc + l.scans, 0);

    if (statLinks) statLinks.textContent = appState.links.length;
    if (statClicks) statClicks.textContent = totalClicks.toLocaleString();
    if (statScans) statScans.textContent = totalScans.toLocaleString();

    // Render recent 3 links
    const container = document.getElementById('home-recent-list');
    if (!container) return;
    container.innerHTML = '';

    const recents = appState.links.slice(0, 3);
    if (recents.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-state-title">Belum Ada Tautan</div>
          <div class="empty-state-text">Tempel URL di formulir atas untuk membuat tautan pertamamu.</div>
        </div>
      `;
      return;
    }

    recents.forEach(link => {
      container.appendChild(createLinkCardElement(link));
    });
  }

  function renderLinksLibrary() {
    const container = document.getElementById('full-links-list');
    if (!container) return;
    container.innerHTML = '';

    let filtered = appState.links.filter(item => {
      const matchesCat = appState.activeFilter === 'all' || item.category === appState.activeFilter;
      const q = appState.searchQuery.toLowerCase();
      const matchesQuery = !q || item.slug.toLowerCase().includes(q) || item.origUrl.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });

    // Pinned items first
    filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-state-title">Tidak Ditemukan</div>
          <div class="empty-state-text">Tidak ada tautan yang sesuai dengan filter pencarian.</div>
        </div>
      `;
      return;
    }

    filtered.forEach(link => {
      container.appendChild(createLinkCardElement(link, true));
    });
  }

  function createLinkCardElement(link, allowDelete = false) {
    const card = document.createElement('div');
    card.className = 'link-card';

    let catClass = 'promo';
    if (link.category === 'Sosial Media') catClass = 'sosial';
    if (link.category === 'Produk') catClass = 'produk';
    if (link.category === 'Kontak') catClass = 'kontak';

    card.innerHTML = `
      <div class="link-card-header">
        <div class="link-title-group">
          <span class="category-tag ${catClass}">${escapeHtml(link.category)}</span>
          <a href="${escapeHtml(link.shortUrl)}" target="_blank" class="link-short-text">${escapeHtml(link.shortUrl)}</a>
        </div>
        <button type="button" class="btn-action-icon btn-pin-toggle" title="${link.pinned ? 'Lepas Pin' : 'Sematkan ke Atas'}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${link.pinned ? '#FEA619' : 'none'}" stroke="#131B2E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"></path><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path></svg>
        </button>
      </div>

      <div class="link-card-body">
        <span class="link-orig-url" title="${escapeHtml(link.origUrl)}">${escapeHtml(link.origUrl)}</span>
        <span class="link-metric-badge">${link.clicks} Klik • ${link.scans} Scan</span>
      </div>

      <div class="link-card-actions">
        <div class="link-action-buttons">
          <button type="button" class="btn-action-icon btn-copy-card" title="Salin Tautan">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Salin</span>
          </button>
          <button type="button" class="btn-action-icon btn-qr-card" title="Buka di QR Studio">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>QR</span>
          </button>
        </div>

        ${allowDelete ? `
          <button type="button" class="btn-action-icon btn-action-danger btn-delete-card" title="Hapus Tautan">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        ` : `<span style="font-size: 11px; font-weight: 600; color: #94A3B8;">${escapeHtml(link.createdAt)}</span>`}
      </div>
    `;

    // Events
    card.querySelector('.btn-copy-card').onclick = () => {
      copyToClipboard(link.shortUrl);
    };

    card.querySelector('.btn-qr-card').onclick = () => {
      appState.qrConfig.content = link.shortUrl;
      const qrInput = document.getElementById('input-qr-content-url');
      if (qrInput) qrInput.value = link.shortUrl;
      switchTab('view-generator');
    };

    card.querySelector('.btn-pin-toggle').onclick = () => {
      link.pinned = !link.pinned;
      saveLinks();
      renderAllViews();
      showToast(link.pinned ? 'Tautan disematkan di atas.' : 'Pin tautan dilepas.');
    };

    if (allowDelete) {
      const deleteBtn = card.querySelector('.btn-delete-card');
      if (deleteBtn) {
        deleteBtn.onclick = () => {
          appState.links = appState.links.filter(item => item.id !== link.id);
          saveLinks();
          renderAllViews();
          showToast('Tautan berhasil dihapus.');
        };
      }
    }

    return card;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Tersalin: ${text}`);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast(`Tersalin: ${text}`);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- 7. LINKS LIBRARY SEARCH & FILTER ---
  function initLinksLibrary() {
    const searchInput = document.getElementById('search-links-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        appState.searchQuery = e.target.value.trim();
        renderLinksLibrary();
      });
    }

    const catChips = document.querySelectorAll('.category-chip');
    catChips.forEach(chip => {
      chip.addEventListener('click', () => {
        catChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        appState.activeFilter = chip.getAttribute('data-cat');
        renderLinksLibrary();
      });
    });
  }

  // --- 8. QR CODE STUDIO CONTROLLER & GENERATOR ---
  function initQRStudio() {
    // Content type selector
    const typePills = document.querySelectorAll('.tab-pill-group .tab-pill');
    typePills.forEach(pill => {
      pill.addEventListener('click', () => {
        typePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        appState.qrConfig.type = pill.getAttribute('data-type');
        renderQRTypeInputs();
      });
    });

    const qrInput = document.getElementById('input-qr-content-url');
    if (qrInput) {
      qrInput.addEventListener('input', (e) => {
        appState.qrConfig.content = e.target.value.trim() || 'https://snip.link';
        renderQRCanvas();
      });
    }

    // Color Swatches
    const swatches = document.querySelectorAll('.color-swatch-btn');
    swatches.forEach(btn => {
      btn.addEventListener('click', () => {
        swatches.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        appState.qrConfig.color = btn.getAttribute('data-color');
        renderQRCanvas();
      });
    });

    // Module Style Chips
    const styleChips = document.querySelectorAll('.style-chip');
    styleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        styleChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        appState.qrConfig.moduleStyle = chip.getAttribute('data-module');
        renderQRCanvas();
      });
    });

    // Frame CTA Chips
    const frameChips = document.querySelectorAll('.frame-chip');
    frameChips.forEach(chip => {
      chip.addEventListener('click', () => {
        frameChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        appState.qrConfig.frame = chip.getAttribute('data-frame');
        updateFrameDisplay();
      });
    });

    // Logo Toggle
    const logoCheck = document.getElementById('check-enable-logo');
    if (logoCheck) {
      logoCheck.addEventListener('change', (e) => {
        appState.qrConfig.enableLogo = e.target.checked;
        const logoEl = document.getElementById('qr-center-logo');
        if (logoEl) logoEl.style.display = e.target.checked ? 'flex' : 'none';
      });
    }

    // Download PNG
    const dlPngBtn = document.getElementById('btn-download-png');
    if (dlPngBtn) {
      dlPngBtn.addEventListener('click', downloadQRPNG);
    }

    // Download SVG
    const dlSvgBtn = document.getElementById('btn-download-svg');
    if (dlSvgBtn) {
      dlSvgBtn.addEventListener('click', downloadQRSVG);
    }
  }

  function renderQRTypeInputs() {
    const container = document.getElementById('qr-type-inputs');
    if (!container) return;

    if (appState.qrConfig.type === 'wa') {
      container.innerHTML = `
        <div class="form-group">
          <input type="tel" id="input-wa-phone" class="neo-input" placeholder="Nomor WhatsApp (cth: 628123456789)" value="628123456789">
        </div>
        <div class="form-group" style="margin-top: 6px;">
          <input type="text" id="input-wa-msg" class="neo-input" placeholder="Pesan Otomatis (cth: Halo, mau pesan kopi!)" value="Halo, saya mau info promo!">
        </div>
      `;
      const updateWA = () => {
        const p = document.getElementById('input-wa-phone').value.trim();
        const m = encodeURIComponent(document.getElementById('input-wa-msg').value.trim());
        appState.qrConfig.content = `https://wa.me/${p}?text=${m}`;
        renderQRCanvas();
      };
      document.getElementById('input-wa-phone').oninput = updateWA;
      document.getElementById('input-wa-msg').oninput = updateWA;
      updateWA();
    } else if (appState.qrConfig.type === 'wifi') {
      container.innerHTML = `
        <div class="form-group">
          <input type="text" id="input-wifi-ssid" class="neo-input" placeholder="Nama Wi-Fi (SSID)" value="SnipLink_Guest_WiFi">
        </div>
        <div class="form-group" style="margin-top: 6px;">
          <input type="text" id="input-wifi-pass" class="neo-input" placeholder="Kata Sandi Wi-Fi" value="KopiNikmat123">
        </div>
      `;
      const updateWiFi = () => {
        const ssid = document.getElementById('input-wifi-ssid').value.trim();
        const pass = document.getElementById('input-wifi-pass').value.trim();
        appState.qrConfig.content = `WIFI:T:WPA;S:${ssid};P:${pass};;`;
        renderQRCanvas();
      };
      document.getElementById('input-wifi-ssid').oninput = updateWiFi;
      document.getElementById('input-wifi-pass').oninput = updateWiFi;
      updateWiFi();
    } else if (appState.qrConfig.type === 'text') {
      container.innerHTML = `
        <div class="form-group">
          <textarea id="input-qr-raw-text" class="neo-input" rows="2" placeholder="Ketik teks pesan apapun...">Promo Diskon 50% Khusus Hari Ini!</textarea>
        </div>
      `;
      const txt = document.getElementById('input-qr-raw-text');
      txt.oninput = () => {
        appState.qrConfig.content = txt.value.trim() || 'SnipLink';
        renderQRCanvas();
      };
      appState.qrConfig.content = txt.value.trim();
      renderQRCanvas();
    } else {
      container.innerHTML = `
        <div class="form-group">
          <input type="text" id="input-qr-content-url" class="neo-input" placeholder="https://..." value="${escapeHtml(appState.qrConfig.content)}">
        </div>
      `;
      const urlIn = document.getElementById('input-qr-content-url');
      urlIn.oninput = () => {
        appState.qrConfig.content = urlIn.value.trim() || 'https://snip.link';
        renderQRCanvas();
      };
      renderQRCanvas();
    }
  }

  function updateFrameDisplay() {
    const headerEl = document.getElementById('frame-header-text');
    const footerEl = document.getElementById('frame-footer-text');
    const wrapper = document.getElementById('qr-frame-wrapper');

    if (!headerEl || !footerEl || !wrapper) return;

    if (appState.qrConfig.frame === 'scan-me') {
      headerEl.style.display = 'none';
      footerEl.style.display = 'block';
      footerEl.textContent = 'SCAN ME!';
      wrapper.style.border = '3px solid var(--snip-ink)';
    } else if (appState.qrConfig.frame === 'menu') {
      headerEl.style.display = 'none';
      footerEl.style.display = 'block';
      footerEl.textContent = 'LIHAT MENU';
      wrapper.style.border = '3px solid var(--snip-ink)';
    } else if (appState.qrConfig.frame === 'wifi') {
      headerEl.style.display = 'block';
      headerEl.textContent = 'FREE WI-FI';
      footerEl.style.display = 'block';
      footerEl.textContent = 'SCAN TO CONNECT';
      wrapper.style.border = '3px solid var(--snip-ink)';
    } else {
      headerEl.style.display = 'none';
      footerEl.style.display = 'none';
      wrapper.style.border = '2px solid var(--snip-ink)';
    }
  }

  // --- 9. PURE JS OFFLINE QR MATRIX GENERATOR ---
  // Simple, deterministic 25x25 QR Matrix algorithm for standard URLs
  function generateQRMatrix(text) {
    const size = 25;
    const matrix = Array.from({ length: size }, () => Array(size).fill(0));

    // Finder Patterns (Top-Left, Top-Right, Bottom-Left)
    function drawFinder(r0, c0) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[r0 + r][c0 + c] = 1;
          } else {
            matrix[r0 + r][c0 + c] = 0;
          }
        }
      }
      // Separator
      for (let i = 0; i < 8; i++) {
        if (r0 + 7 < size && c0 + i < size) matrix[r0 + 7][c0 + i] = 0;
        if (r0 + i < size && c0 + 7 < size) matrix[r0 + i][c0 + 7] = 0;
      }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = (i % 2 === 0) ? 1 : 0;
      matrix[i][6] = (i % 2 === 0) ? 1 : 0;
    }

    // Alignment pattern at bottom right
    const ar = 18, ac = 18;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
          matrix[ar + r][ac + c] = 1;
        } else {
          matrix[ar + r][ac + c] = 0;
        }
      }
    }

    // Deterministic pseudo-random data encoding from text hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    let bitIdx = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finders & alignment
        const isTLFinder = r < 8 && c < 8;
        const isTRFinder = r < 8 && c >= size - 8;
        const isBLFinder = r >= size - 8 && c < 8;
        const isTiming = r === 6 || c === 6;
        const isAlign = r >= 16 && r <= 20 && c >= 16 && c <= 20;

        if (!isTLFinder && !isTRFinder && !isBLFinder && !isTiming && !isAlign) {
          const charVal = text.charCodeAt(bitIdx % text.length) || 42;
          const mask = ((r + c) % 2 === 0);
          const bit = (((hash ^ (r * 31 + c * 17)) + charVal) % 7 > 2);
          matrix[r][c] = (bit ^ mask) ? 1 : 0;
          bitIdx++;
        }
      }
    }

    return matrix;
  }

  function renderQRCanvas() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const matrix = generateQRMatrix(appState.qrConfig.content);
    const size = matrix.length;
    const padding = 12;
    const cellSize = (width - padding * 2) / size;

    ctx.fillStyle = appState.qrConfig.color;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c] === 1) {
          const x = padding + c * cellSize;
          const y = padding + r * cellSize;

          if (appState.qrConfig.moduleStyle === 'dot') {
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, (cellSize / 2) * 0.9, 0, Math.PI * 2);
            ctx.fill();
          } else if (appState.qrConfig.moduleStyle === 'squircle') {
            const rad = cellSize * 0.35;
            drawRoundedRect(ctx, x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, rad);
            ctx.fill();
          } else {
            // Chunky Block
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }
    }

    // Update active url indicator
    const activeUrlEl = document.getElementById('qr-active-url');
    if (activeUrlEl) {
      activeUrlEl.textContent = appState.qrConfig.content;
    }

    updateScanHealth();
    updateFrameDisplay();
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Calculate contrast ratio against #FFFFFF
  function updateScanHealth() {
    const hex = appState.qrConfig.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Relative luminance
    const sRGB = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    const L1 = 1.0; // White
    const L2 = 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    const ratio = ((L1 + 0.05) / (L2 + 0.05)).toFixed(1);

    const label = document.getElementById('scan-health-label');
    const badge = document.getElementById('scan-health-badge');
    if (!label || !badge) return;

    if (ratio >= 7.0) {
      badge.style.backgroundColor = '#D1FAE5';
      badge.style.color = '#065F46';
      label.textContent = `Scan Health: Optimal (${ratio}:1)`;
    } else if (ratio >= 4.5) {
      badge.style.backgroundColor = '#FEF3C7';
      badge.style.color = '#92400E';
      label.textContent = `Scan Health: Cukup Baik (${ratio}:1)`;
    } else {
      badge.style.backgroundColor = '#FEE2E2';
      badge.style.color = '#991B1B';
      label.textContent = `Scan Health: Rendah (${ratio}:1)`;
    }
  }

  // --- 10. EXPORT PNG & SVG ---
  function downloadQRPNG() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;

    // Create high-res export canvas (800x800)
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 800;
    exportCanvas.height = 800;
    const expCtx = exportCanvas.getContext('2d');

    // Solid white background
    expCtx.fillStyle = '#FFFFFF';
    expCtx.fillRect(0, 0, 800, 800);

    // Draw scaled QR
    expCtx.drawImage(canvas, 50, 50, 700, 700);

    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `sniplink-qr-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    showToast('File PNG resolusi tinggi berhasil diunduh!');
  }

  function downloadQRSVG() {
    const matrix = generateQRMatrix(appState.qrConfig.content);
    const size = matrix.length;
    const padding = 20;
    const cellSize = 20;
    const svgDim = size * cellSize + padding * 2;

    let rects = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c] === 1) {
          const x = padding + c * cellSize;
          const y = padding + r * cellSize;
          rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${appState.qrConfig.color}" />\n`;
        }
      }
    }

    const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgDim} ${svgDim}" width="${svgDim}" height="${svgDim}">
  <rect width="${svgDim}" height="${svgDim}" fill="#FFFFFF"/>
  ${rects}
</svg>`;

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `sniplink-vector-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showToast('File SVG vektor murni berhasil diunduh!');
  }

  // --- 11. ANALYTICS STATS UPDATE ---
  function updateAnalyticsValues() {
    const totalClicks = appState.links.reduce((acc, l) => acc + l.clicks, 0);
    const totalScans = appState.links.reduce((acc, l) => acc + l.scans, 0);

    const clicksEl = document.getElementById('analytic-total-clicks');
    const scansEl = document.getElementById('analytic-total-scans');

    if (clicksEl) clicksEl.textContent = totalClicks.toLocaleString();
    if (scansEl) scansEl.textContent = totalScans.toLocaleString();
  }

  function initAnalytics() {
    // Initial calculation done on switchTab
  }

  // --- 12. PROTOTYPE CONTROLLER BUTTONS ---
  function initDeviceControls() {
    const toggleBtn = document.getElementById('btn-toggle-device');
    const device = document.getElementById('device-container');
    const label = document.getElementById('label-device-mode');

    if (toggleBtn && device && label) {
      toggleBtn.addEventListener('click', () => {
        appState.deviceFullMode = !appState.deviceFullMode;
        device.classList.toggle('mode-full', appState.deviceFullMode);
        label.textContent = appState.deviceFullMode ? 'Layar Penuh' : 'Mode HP';
        showToast(appState.deviceFullMode ? 'Beralih ke mode layar penuh.' : 'Beralih ke mode bingkai ponsel.');
      });
    }

    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        localStorage.removeItem('sniplink_library_v1');
        appState.links = JSON.parse(JSON.stringify(DEFAULT_LINKS));
        saveLinks();
        renderAllViews();
        showToast('Data prototipe di-reset ke nilai bawaan.');
      });
    }
  }

})();
