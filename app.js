// NAVICA Unified Application Controller
// Orchestrates Router, State, Verification, Dashboard, Authority, & Emergency Directory

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initRouter();
  initEmergencyHotlines();
  initHelplinesDirectory();
  initCasesDirectory();
  initVerificationFlow();
  initRightsAndSupport();
  initHowItWorks();
  initAuthorityConsole();
  renderDemoCards();
  renderHomeCategorizedHelplines();
  initModalDismissHandlers();
});

/* ==========================================================================
   1. THEME CONTROLLER
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem("navica_theme") || localStorage.getItem("maitri_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  const toggleBtn = document.getElementById("themeToggleBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("navica_theme", next);
      updateThemeIcon(next);
      showToast(`Switched to ${next} mode`, "info");
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("themeIcon");
  if (!icon) return;
  icon.innerHTML = theme === "dark" 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

/* ==========================================================================
   2. CLIENT-SIDE ROUTER
   ========================================================================== */
function initRouter() {
  window.addEventListener("hashchange", handleRouting);
  
  // Mobile navigation drawer toggle
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const mobileNav = document.getElementById("mobileNavMenu");
  if (mobileBtn && mobileNav) {
    mobileBtn.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
    });
  }

  // Check URL parameters for case auto-login or verification from QR scan
  const scanned = checkUrlForCaseScan();

  // Initial route
  if (!scanned) {
    if (!window.location.hash) {
      window.location.hash = "#home";
    } else {
      handleRouting();
    }
  }
}

function navigateTo(hash) {
  // Dismiss any open modals when navigating so page is never blocked
  document.querySelectorAll(".modal-backdrop.open").forEach(m => {
    m.classList.remove("open");
  });
  document.body.style.overflow = "";

  if (window.location.hash === hash) {
    handleRouting();
  } else {
    window.location.hash = hash;
    handleRouting();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  const mobileNav = document.getElementById("mobileNavMenu");
  if (mobileNav) mobileNav.classList.remove("open");
}
window.navigateTo = navigateTo;

function checkUrlForCaseScan() {
  try {
    let caseId = null;

    // Check search params: ?case=VC-2026-00125 or ?caseId=...
    if (window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      caseId = urlParams.get("case") || urlParams.get("caseId");
    }

    // Check hash query params: #dashboard?case=VC-2026-00125 or #verify?case=...
    if (!caseId && window.location.hash.includes("?")) {
      const hashParts = window.location.hash.split("?");
      if (hashParts[1]) {
        const hashParams = new URLSearchParams(hashParts[1]);
        caseId = hashParams.get("case") || hashParams.get("caseId");
      }
    }

    if (caseId) {
      const c = window.navicaStore.getCaseById(caseId);
      if (c) {
        const currentSession = window.navicaStore.getSession();
        if (!currentSession || currentSession.caseId !== c.id) {
          window.navicaStore.setSession({
            role: "victim",
            caseId: c.id,
            name: c.victimName,
            mobile: c.mobile,
            token: "qr_scanned_" + Date.now()
          });
          showToast(`📷 QR Code Authenticated: Logged into case for ${c.victimName} (${c.id})`, "success");
        }
        window.location.hash = "#dashboard";
        loadDashboardView();
        return true;
      }
    }
  } catch (e) {
    console.error("Error checking URL for case scan:", e);
  }
  return false;
}
window.checkUrlForCaseScan = checkUrlForCaseScan;

function handleRouting() {
  checkUrlForCaseScan();
  let hash = window.location.hash.split("?")[0] || "#home";
  if (hash === "#osc") {
    hash = "#support";
  }
  const views = document.querySelectorAll(".page-view");
  views.forEach(v => v.classList.remove("active"));

  const targetView = document.getElementById(`view-${hash.replace("#", "")}`);
  if (targetView) {
    targetView.classList.add("active");
  } else {
    document.getElementById("view-home")?.classList.add("active");
  }

  // Update Nav Link Active States
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");
    const href = link.getAttribute("href");
    if (href === hash || (window.location.hash.includes("osc") && href === "#support")) {
      link.classList.add("active");
    }
  });

  // Handle specialized view lifecycle
  if (hash === "#dashboard") {
    loadDashboardView();
  } else if (hash === "#cases") {
    renderCasesDirectoryView();
  } else if (hash === "#authority") {
    loadAuthorityView();
  } else if (hash === "#helplines") {
    renderHelplinesList();
  } else if (hash === "#support") {
    if (typeof renderOSCDirectory === "function") {
      renderOSCDirectory();
    }
    if (window.location.hash.includes("osc")) {
      setTimeout(() => {
        const oscSection = document.getElementById("oscDirectorySection");
        if (oscSection) oscSection.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }
}
window.handleRouting = handleRouting;

/* ==========================================================================
   3. TOAST NOTIFICATIONS SYSTEM
   ========================================================================== */
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type === "emergency" ? "toast-emergency" : type === "success" ? "toast-success" : ""}`;
  
  let icon = "ℹ️";
  if (type === "emergency") icon = "🆘";
  if (type === "success") icon = "✅";

  toast.innerHTML = `
    <span>${icon}</span>
    <div style="flex: 1;">${message}</div>
    <button style="background:none;border:none;color:#fff;cursor:pointer;opacity:0.75;" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}
window.showToast = showToast;

/* ==========================================================================
   4. EMERGENCY HELPLINES & CRISIS HOTLINES HUB
   ========================================================================== */
let activeCategoryFilter = "ALL";
let currentSearchTerm = "";

function initEmergencyHotlines() {
  // Top quick dial modal / triggers
  const quickEmergencyBtns = document.querySelectorAll(".trigger-emergency-modal");
  quickEmergencyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navigateTo("#helplines");
    });
  });

  const searchInput = document.getElementById("helplineSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchTerm = e.target.value.toLowerCase().trim();
      renderHelplinesList();
    });
  }
}

function initHelplinesDirectory() {
  const filterContainer = document.getElementById("categoryFilterNav");
  if (!filterContainer) return;

  const categories = [
    { key: "ALL", label: "All Helplines", icon: "📋" },
    { key: "EMERGENCY", label: "🆘 Emergency", icon: "🆘" },
    { key: "LEGAL_RIGHTS", label: "⚖️ Legal & Rights", icon: "⚖️" },
    { key: "MENTAL_HEALTH", label: "🧠 Mental Health", icon: "🧠" },
    { key: "WOMEN_CHILDREN", label: "👩 Women & Children", icon: "👩" },
    { key: "INCLUSIVE_SUPPORT", label: "♿ Inclusive Support", icon: "♿" },
    { key: "SENIOR_CITIZENS", label: "👴 Senior Citizens", icon: "👴" },
    { key: "CYBER", label: "💻 Cyber Crime", icon: "💻" }
  ];

  filterContainer.innerHTML = categories.map(cat => `
    <button class="cat-filter-btn ${cat.key === activeCategoryFilter ? "active" : ""}" data-cat="${cat.key}">
      <span>${cat.icon}</span> ${cat.label}
    </button>
  `).join("");

  filterContainer.querySelectorAll(".cat-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      filterContainer.querySelectorAll(".cat-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategoryFilter = btn.dataset.cat;
      renderHelplinesList();
    });
  });

  renderHelplinesList();
}

function renderHelplinesList() {
  const container = document.getElementById("helplineGroupsContainer");
  if (!container) return;

  const helplinesData = window.NAVICA_DATA.EMERGENCY_HELPLINES;

  let filteredGroups = helplinesData.filter(group => {
    if (activeCategoryFilter !== "ALL" && group.category !== activeCategoryFilter) {
      return false;
    }
    return true;
  });

  let html = "";
  let totalMatches = 0;

  filteredGroups.forEach(group => {
    const matchedItems = group.items.filter(item => {
      if (!currentSearchTerm) return true;
      return (
        item.number.toLowerCase().includes(currentSearchTerm) ||
        item.title.toLowerCase().includes(currentSearchTerm) ||
        item.desc.toLowerCase().includes(currentSearchTerm) ||
        item.badge.toLowerCase().includes(currentSearchTerm)
      );
    });

    if (matchedItems.length === 0) return;
    totalMatches += matchedItems.length;

    html += `
      <div class="helpline-category-group">
        <div class="category-group-header">
          <span class="category-group-icon">${group.categoryIcon}</span>
          <h2 class="category-group-title">${group.categoryName}</h2>
          <span class="badge badge-neutral" style="margin-left:auto;">${matchedItems.length} Helpline(s)</span>
        </div>
        <div class="helplines-grid">
          ${matchedItems.map(item => `
            <div class="helpline-card ${group.category === 'EMERGENCY' ? 'priority-card' : ''}">
              <div class="helpline-card-header">
                <div class="helpline-number-wrap">
                  <span class="helpline-number">${item.number}</span>
                </div>
                <span class="badge ${group.category === 'EMERGENCY' ? 'badge-emergency' : 'badge-info'}">${item.badge}</span>
              </div>
              <h3 class="helpline-title">${item.title}</h3>
              ${item.type === 'video_phone' ? `
                <div class="video-support-badge">
                  <span>📹</span> Certified Indian Sign Language Video Support
                </div>
              ` : ''}
              <p class="helpline-desc">${item.desc}</p>
              <div class="helpline-actions">
                <a href="tel:${item.number.replace(/\D/g, '')}" class="btn btn-emergency btn-dial" onclick="trackCall('${item.number}', '${item.title}')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Direct Call
                </a>
                <button class="btn btn-copy" onclick="copyNumber('${item.number}')" title="Copy Number">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copy
                </button>
                <button class="btn btn-secondary btn-sm" onclick="openTestCallModal('${item.number}', '${item.title}')" title="Test Simulated Dispatch">
                  Test
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  });

  if (totalMatches === 0) {
    html = `
      <div class="card" style="text-align: center; padding: 3rem 1rem;">
        <p style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</p>
        <h3 style="margin-bottom: 0.5rem;">No Helplines Match "${currentSearchTerm}"</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Try searching for "112", "women", "ambulance", "disability", or "cyber".</p>
      </div>
    `;
  }

  container.innerHTML = html;
}

window.copyNumber = function(number) {
  navigator.clipboard.writeText(number).then(() => {
    showToast(`Copied ${number} to clipboard`, "success");
  }).catch(() => {
    showToast(`Helpline number: ${number}`, "info");
  });
};

window.trackCall = function(number, title) {
  showToast(`Initiating call to ${title} (${number})...`, "emergency");
};

window.openTestCallModal = function(number, title) {
  const modal = document.getElementById("testCallModal");
  const modalBody = document.getElementById("testCallModalBody");
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div style="text-align:center; padding: 1.5rem 0;">
      <div style="width: 70px; height: 70px; background: var(--emergency-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; font-size: 2rem;">
        📞
      </div>
      <h3 style="font-size: 1.5rem; color: var(--emergency-red); margin-bottom: 0.25rem;">Connecting to ${number}</h3>
      <p style="font-weight: 700; color: var(--text-primary); margin-bottom: 1rem;">${title}</p>
      <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-md); padding: 1rem; text-align: left; font-size: 0.85rem; line-height: 1.6; border: 1px solid var(--border-color);">
        <p><strong>Simulated Dispatch Response:</strong></p>
        <p style="margin-top: 0.35rem; color: var(--text-muted);">
          "Namaste. You have reached the official support desk for ${title}. Your GPS location coordinates have been automatically routed to the nearest district nodal coordinator. Stay calm, an officer is connected."
        </p>
      </div>
      <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 0.75rem;">
        <a href="tel:${number.replace(/\D/g, '')}" class="btn btn-emergency">
          Place Real Phone Call (${number})
        </a>
        <button class="btn btn-outline" onclick="closeModal('testCallModal')">End Test</button>
      </div>
    </div>
  `;
  openModal("testCallModal");
};

/* ==========================================================================
   4B. HOME PAGE CATEGORIZED HELPLINES DIRECTORY
   ========================================================================== */
window.navigateToCategory = function(hash, categoryKey) {
  navigateTo(hash);
  activeCategoryFilter = categoryKey;
  const filterContainer = document.getElementById("categoryFilterNav");
  if (filterContainer) {
    filterContainer.querySelectorAll(".cat-filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.cat === categoryKey);
    });
  }
  renderHelplinesList();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function renderHomeCategorizedHelplines() {
  const container = document.getElementById("homeCategorizedHelplinesContainer");
  if (!container) return;

  const helplinesData = window.NAVICA_DATA.EMERGENCY_HELPLINES;

  container.innerHTML = helplinesData.map(group => `
    <div class="helpline-category-group" style="margin-bottom: 2.25rem;">
      <div class="category-group-header">
        <span class="category-group-icon">${group.categoryIcon}</span>
        <h3 class="category-group-title" style="font-size: 1.25rem;">${group.categoryIcon} ${group.categoryName}</h3>
        <span class="badge ${group.category === 'EMERGENCY' ? 'badge-emergency' : 'badge-neutral'}" style="margin-left:auto;">
          ${group.items.length} Support Desk(s)
        </span>
      </div>
      <div class="helplines-grid">
        ${group.items.map(item => `
          <div class="helpline-card ${group.category === 'EMERGENCY' ? 'priority-card' : ''}">
            <div class="helpline-card-header">
              <div class="helpline-number-wrap">
                <span class="helpline-number">${item.number}</span>
              </div>
              <span class="badge ${group.category === 'EMERGENCY' ? 'badge-emergency' : 'badge-info'}">${item.badge}</span>
            </div>
            <h4 class="helpline-title" style="font-size: 1rem; margin-bottom: 0.25rem;">${item.title}</h4>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 500;">
              ${item.tag}
            </div>
            ${item.type === 'video_phone' ? `
              <div class="video-support-badge" style="background: var(--info-bg); color: var(--info-cyan); border: 1px solid var(--info-border); padding: 0.35rem 0.65rem; border-radius: var(--radius-sm); font-size: 0.75rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
                <span>📹</span> Sign Language Video Calling & Text
              </div>
            ` : ''}
            <p class="helpline-desc">${item.desc}</p>
            <div class="helpline-actions">
              <a href="tel:${item.number.replace(/\D/g, '')}" class="btn btn-emergency btn-dial" onclick="trackCall('${item.number}', '${item.title}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call
              </a>
              ${item.whatsapp ? `
                <a href="${item.whatsapp}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background: #25D366; color: #fff; font-weight: 600;" title="Open WhatsApp Chat / Video">
                  WhatsApp
                </a>
              ` : ''}
              <button class="btn btn-copy" onclick="copyNumber('${item.number}')" title="Copy Number">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                Copy
              </button>
              <button class="btn btn-secondary btn-sm" onclick="openTestCallModal('${item.number}', '${item.title}')" title="Test Simulated Call">
                Test
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");
}

/* ==========================================================================
   5. DEMO CARDS RENDERING (Home Page)
   ========================================================================== */
function renderDemoCards() {
  const container = document.getElementById("homeDemoCardsContainer");
  if (!container) return;

  const cases = window.navicaStore.getAllCases();
  container.innerHTML = cases.map(c => `
    <div class="victim-id-card-demo">
      <div class="card-hologram-seal">NAVICA VERIFIED</div>
      <div class="id-card-header">
        <span class="id-card-badge">Digital Victim Case Card</span>
        <div class="id-card-num">${escapeHTML(c.id)}</div>
      </div>
      <div class="id-card-body">
        <div class="card-qr-box" onclick="event.stopPropagation(); openQRVerificationModal('${c.id}')" title="Click to enlarge & scan QR code">
          ${generateSVGQRCode(c.id, 86)}
          <div class="qr-zoom-hint">🔍 Enlarge & Scan</div>
        </div>
        <div class="id-card-details" onclick="selectAndVerifyCase('${c.id}')" style="cursor:pointer;" title="Click to open case dashboard">
          <div class="id-victim-name">${escapeHTML(c.victimName)}</div>
          <div class="id-victim-type">${escapeHTML(c.type)}</div>
          <div class="id-victim-status">${escapeHTML(c.stageLabel)} Stage</div>
          <div style="margin-top:0.35rem; font-size:0.75rem; color:var(--accent-blue); font-family:var(--font-mono); font-weight:600;">
            Pass: ${escapeHTML(c.password || 'victim123')}
          </div>
        </div>
      </div>
      <div class="id-card-footer">
        <span>${escapeHTML(c.court)}</span>
        <span class="click-to-open-hint" onclick="selectAndVerifyCase('${c.id}')">
          Scan / Click to open →
        </span>
      </div>
    </div>
  `).join("");
}

window.quickLoginToCase = function(caseId) {
  const c = window.navicaStore.getCaseById(caseId);
  if (!c) return;
  window.navicaStore.setSession({
    role: "victim",
    caseId: c.id,
    name: c.victimName,
    mobile: c.mobile,
    token: "quick_access_" + Date.now()
  });
  showToast(`Access granted! Opened case for ${c.victimName} (${c.id})`, "success");
  closeModal('allCasesModal');
  navigateTo("#dashboard");
  renderDashboard(c);
};

window.selectAndVerifyCase = function(caseId) {
  // Directly open the case to make access instant and seamless
  quickLoginToCase(caseId);
};

window.handleDashCaseSwitch = function(caseId) {
  quickLoginToCase(caseId);
};

window.openAllCasesModal = function() {
  const modal = document.getElementById("allCasesModal");
  const list = document.getElementById("allCasesModalList");
  if (!modal || !list) return;

  const currentSession = window.navicaStore.getSession();
  const activeCaseId = currentSession ? currentSession.caseId : "VC-2026-00125";
  const cases = window.navicaStore.getAllCases();

  list.innerHTML = cases.map(c => {
    const isCurrent = c.id === activeCaseId;
    return `
      <div class="all-cases-card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; padding:1rem 1.15rem; border-radius:var(--radius-lg); border:1.5px solid ${isCurrent ? 'var(--accent-blue)' : 'var(--border-color)'}; background:${isCurrent ? 'rgba(37,99,235,0.06)' : 'var(--bg-surface)'}; margin-bottom:0.85rem; box-shadow:var(--shadow-sm); transition:all 0.2s ease;">
        <div style="flex:1; min-width:240px;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
            <strong style="font-size:1.05rem; color:var(--text-primary); font-family:var(--font-mono);">${escapeHTML(c.id)}</strong>
            <span class="badge ${c.currentStage === 'Investigation' ? 'badge-info' : c.currentStage === 'Court Proceedings' ? 'badge-warning' : 'badge-success'}">${escapeHTML(c.stageLabel || c.currentStage)}</span>
            ${isCurrent ? '<span class="badge badge-success" style="font-size:0.68rem; font-weight:700;">Active Session</span>' : ''}
          </div>
          <div style="font-weight:700; color:var(--text-primary); font-size:1rem; margin-bottom:0.25rem;">${escapeHTML(c.victimName)}</div>
          <div style="font-size:0.8rem; color:var(--text-muted); line-height:1.4;">
            <span>🏢 ${escapeHTML(c.station)}</span> · <span>👮 ${escapeHTML(c.assignedOfficer)}</span> · <span>⚖️ ${escapeHTML(c.court)}</span>
          </div>
          <div style="display:flex; align-items:center; gap:0.6rem; margin-top:0.4rem; font-size:0.75rem; flex-wrap:wrap;">
            <span style="color:var(--text-muted);">Offence: <strong>${escapeHTML(c.type)}</strong></span>
            <span style="color:var(--accent-blue);">Password: <code style="font-weight:700;">${escapeHTML(c.password || 'victim123')}</code></span>
          </div>
        </div>
        <div style="display:flex; gap:0.5rem; flex-direction:column; min-width:140px;">
          <button type="button" class="btn btn-sm ${isCurrent ? 'btn-outline' : 'btn-primary'}" onclick="quickLoginToCase('${c.id}')" style="font-weight:700;">
            ${isCurrent ? '✓ Active (Open)' : '⚡ Switch to Case →'}
          </button>
        </div>
      </div>
    `;
  }).join("");

  openModal("allCasesModal");
};

/* ==========================================================================
   5B. FULL PAGE CASES DIRECTORY CONTROLLER (#cases)
   ========================================================================== */
let casesDirectoryFilter = "ALL";
let casesDirectorySearch = "";

function initCasesDirectory() {
  const searchInput = document.getElementById("caseSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      casesDirectorySearch = e.target.value.trim();
      renderCasesDirectoryView();
    });
  }
}

window.setCaseDirectoryFilter = function(filter) {
  casesDirectoryFilter = filter;
  ["caseFilterAll", "caseFilterInvest", "caseFilterCourt", "caseFilterComp"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove("active");
  });

  if (filter === "ALL") document.getElementById("caseFilterAll")?.classList.add("active");
  else if (filter === "INVESTIGATION") document.getElementById("caseFilterInvest")?.classList.add("active");
  else if (filter === "COURT") document.getElementById("caseFilterCourt")?.classList.add("active");
  else if (filter === "COMPENSATION") document.getElementById("caseFilterComp")?.classList.add("active");

  renderCasesDirectoryView();
};

window.resetCaseDirectorySearch = function() {
  casesDirectorySearch = "";
  casesDirectoryFilter = "ALL";
  const input = document.getElementById("caseSearchInput");
  if (input) input.value = "";
  setCaseDirectoryFilter("ALL");
};

window.renderCasesDirectoryView = function() {
  const container = document.getElementById("casesDirectoryList");
  if (!container) return;

  const currentSession = window.navicaStore.getSession();
  const activeCaseId = currentSession ? currentSession.caseId : "VC-2026-00125";
  let cases = window.navicaStore.getAllCases();

  // Update Statistics Strip
  const allCasesCount = cases.length;
  const investCasesCount = cases.filter(c => c.currentStage === "Investigation").length;
  const courtCasesCount = cases.filter(c => c.currentStage !== "Investigation").length;

  const statTotal = document.getElementById("casesStatTotal");
  const statInvest = document.getElementById("casesStatInvest");
  const statCourt = document.getElementById("casesStatCourt");
  if (statTotal) statTotal.textContent = allCasesCount;
  if (statInvest) statInvest.textContent = investCasesCount;
  if (statCourt) statCourt.textContent = courtCasesCount;

  // Filter
  if (casesDirectoryFilter === "INVESTIGATION") {
    cases = cases.filter(c => c.currentStage === "Investigation");
  } else if (casesDirectoryFilter === "COURT") {
    cases = cases.filter(c => c.currentStage === "Court Proceedings" || c.currentStage === "Trial" || c.currentStage === "Charge Sheet");
  } else if (casesDirectoryFilter === "COMPENSATION") {
    cases = cases.filter(c => c.compensation && c.compensation.sanctionedAmount > 0);
  }

  // Search
  if (casesDirectorySearch) {
    const q = casesDirectorySearch.toLowerCase();
    cases = cases.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.victimName.toLowerCase().includes(q) ||
      (c.station && c.station.toLowerCase().includes(q)) ||
      (c.assignedOfficer && c.assignedOfficer.toLowerCase().includes(q)) ||
      (c.type && c.type.toLowerCase().includes(q)) ||
      (c.court && c.court.toLowerCase().includes(q))
    );
  }

  if (cases.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding:3rem 1.5rem; grid-column: 1 / -1;">
        <p style="font-size:2.5rem; margin-bottom:0.75rem;">🔍</p>
        <h3 style="margin-bottom:0.5rem;">No Matching Cases Found</h3>
        <p style="color:var(--text-muted); font-size:0.9rem; max-width:480px; margin:0 auto;">
          No case records match "${escapeHTML(casesDirectorySearch)}". Try searching by name (e.g. "Ananya", "Rahul", "Priya") or Case ID ("VC-2026-00125").
        </p>
        <button type="button" class="btn btn-outline btn-sm" style="margin-top:1.25rem;" onclick="resetCaseDirectorySearch()">
          Clear Filters & Show All
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = cases.map(c => {
    const isCurrent = c.id === activeCaseId;
    const stageBadgeClass = c.currentStage === 'Investigation' ? 'badge-info' : c.currentStage === 'Court Proceedings' ? 'badge-warning' : 'badge-success';

    return `
      <div class="case-dir-card ${isCurrent ? 'case-dir-card-active' : ''}">
        <div>
          <div class="case-dir-header">
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <span class="case-dir-id">${escapeHTML(c.id)}</span>
              <span class="badge ${stageBadgeClass}">${escapeHTML(c.stageLabel || c.currentStage)}</span>
              ${isCurrent ? '<span class="badge badge-success" style="font-size:0.7rem; font-weight:700;">Active Session</span>' : ''}
            </div>
            <span class="badge badge-sm badge-outline" style="font-size:0.7rem;">${escapeHTML(c.type || 'Offence')}</span>
          </div>

          <div class="case-dir-victim-row">
            <div>
              <h3 class="case-dir-name">${escapeHTML(c.victimName)}</h3>
              <div class="case-dir-filed">Filed: <strong>${escapeHTML(c.registrationDate || 'Recent')}</strong> · Code: <code style="font-weight:700;">${escapeHTML(c.caseCode || c.id)}</code></div>
            </div>
            <div class="case-dir-pass-pill" title="Private access password for this case">
              <span style="font-size:0.68rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Key:</span>
              <strong style="color:var(--accent-blue); font-family:var(--font-mono); font-size:0.85rem;">${escapeHTML(c.password || 'victim123')}</strong>
            </div>
          </div>

          <p class="case-dir-status-desc">
            ${escapeHTML(c.stageDescription || 'Case is currently actively processed by police and judicial authorities.')}
          </p>

          <div class="case-dir-meta-grid">
            <div class="case-dir-meta-cell">
              <span class="case-dir-meta-label">🏢 Police Station</span>
              <strong>${escapeHTML(c.station)}</strong>
            </div>
            <div class="case-dir-meta-cell">
              <span class="case-dir-meta-label">👮 Assigned Officer</span>
              <strong>${escapeHTML(c.assignedOfficer)}</strong>
            </div>
            <div class="case-dir-meta-cell">
              <span class="case-dir-meta-label">⚖️ Court Jurisdiction</span>
              <strong>${escapeHTML(c.court)}</strong>
            </div>
            <div class="case-dir-meta-cell">
              <span class="case-dir-meta-label">💰 DLSA Compensation</span>
              <strong>${c.compensation ? ('₹' + c.compensation.sanctionedAmount.toLocaleString('en-IN') + ' · ' + c.compensation.status) : 'Pending Review'}</strong>
            </div>
          </div>
        </div>

        <div class="case-dir-footer">
          <button type="button" class="btn ${isCurrent ? 'btn-success' : 'btn-primary'} btn-sm" onclick="quickLoginToCase('${c.id}')" style="font-weight:700;">
            ${isCurrent ? '✓ Open Active Case Dashboard' : '⚡ Switch & Open Case Status →'}
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="selectAndVerifyCase('${c.id}')">
            🔐 Login with Password
          </button>
        </div>
      </div>
    `;
  }).join("");
};

/* ==========================================================================
   6. CASE VERIFICATION & PASSWORD AUTHENTICATION FLOW (#verify)
   ========================================================================== */
let selectedCaseForAuth = null;

function initVerificationFlow() {
  const chipsContainer = document.getElementById("verifyCaseChips");
  if (chipsContainer) {
    const cases = window.navicaStore.getAllCases();
    chipsContainer.innerHTML = cases.map(c => `
      <div class="case-chip-card" style="display:flex; flex-direction:column; gap:0.4rem; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem; text-align:left;">
        <div class="chip-case-id">${c.id}</div>
        <div class="chip-case-meta" style="font-weight:700; color:var(--text-primary); font-size:0.9rem;">${c.victimName} · ${c.caseCode}</div>
        <div class="chip-case-meta" style="display:flex; justify-content:space-between; align-items:center; margin-top:0.2rem;">
          <span style="color:var(--accent-blue);font-weight:600; font-size:0.75rem;">${c.stageLabel}</span>
          <span class="victim-pass-chip">Key: ${c.password || 'victim123'}</span>
        </div>
        <div style="display:flex; gap:0.4rem; margin-top:0.35rem; border-top:1px dashed var(--border-color); padding-top:0.45rem;">
          <button type="button" class="btn btn-sm btn-primary" style="flex:1; font-size:0.75rem; padding:0.3rem 0.5rem; font-weight:700;" onclick="quickLoginToCase('${c.id}')">
            ⚡ 1-Click Access
          </button>
          <button type="button" class="btn btn-sm btn-outline case-chip-btn" data-case-id="${c.id}" style="font-size:0.75rem; padding:0.3rem 0.5rem;" onclick="onCaseChipClicked('${c.id}')">
            Select
          </button>
        </div>
      </div>
    `).join("");
  }

  // Case ID / Mobile input listener
  const caseInput = document.getElementById("verifyCaseInput");
  if (caseInput) {
    caseInput.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      const found = window.navicaStore.getCaseById(val) || window.navicaStore.getCaseByMobile(val);
      if (found) {
        selectedCaseForAuth = found;
        updateActiveDemoPasswordHint(found);
      }
    });
  }

  // Toggle Password Visibility
  const toggleBtn = document.getElementById("toggleVerifyPasswordBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      togglePasswordVisibility("verifyPasswordInput", toggleBtn);
    });
  }

  // Auto-Fill Password Button
  const autoFillBtn = document.getElementById("autoFillPasswordBtn");
  if (autoFillBtn) {
    autoFillBtn.addEventListener("click", () => {
      const targetCase = selectedCaseForAuth || window.navicaStore.getAllCases()[0];
      const pwd = targetCase.password || "victim123";
      const pwdInput = document.getElementById("verifyPasswordInput");
      if (pwdInput) {
        pwdInput.value = pwd;
        showToast(`Auto-filled password for ${targetCase.victimName}: "${pwd}"`, "info");
      }
    });
  }

  // Pre-select first case as default
  const defaultCase = window.navicaStore.getAllCases()[0];
  if (defaultCase && !selectedCaseForAuth) {
    onCaseChipClicked(defaultCase.id);
  }
}

function updateActiveDemoPasswordHint(c) {
  const hintEl = document.getElementById("activeDemoPasswordHint");
  if (hintEl && c) {
    hintEl.textContent = c.password || "victim123";
  }
}

function preselectCaseInVerify(caseId) {
  onCaseChipClicked(caseId);
}

window.onCaseChipClicked = function(caseId) {
  const c = window.navicaStore.getCaseById(caseId);
  if (!c) return;
  selectedCaseForAuth = c;

  // Highlight chip
  document.querySelectorAll(".case-chip-btn").forEach(b => {
    b.classList.toggle("selected", b.dataset.caseId === caseId);
  });

  const caseInput = document.getElementById("verifyCaseInput");
  if (caseInput) caseInput.value = c.id;

  const pwdInput = document.getElementById("verifyPasswordInput");
  if (pwdInput) {
    pwdInput.value = c.password || "victim123";
  }

  updateActiveDemoPasswordHint(c);
};

window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    if (btn) btn.textContent = "🙈";
  } else {
    input.type = "password";
    if (btn) btn.textContent = "👁️";
  }
};

window.handlePasswordLogin = function(e) {
  if (e) e.preventDefault();
  const caseVal = document.getElementById("verifyCaseInput")?.value.trim();
  const password = document.getElementById("verifyPasswordInput")?.value.trim();

  if (!caseVal) {
    showToast("Please select or enter your Case ID or registered mobile.", "warning");
    return;
  }
  if (!password) {
    showToast("Please enter your confidential case password.", "warning");
    return;
  }

  const result = window.navicaStore.verifyPassword(caseVal, password);
  if (result.success && result.case) {
    const c = result.case;
    window.navicaStore.setSession({
      role: "victim",
      caseId: c.id,
      name: c.victimName,
      mobile: c.mobile,
      token: "pwd_token_" + Date.now()
    });

    showToast(`Access granted. Welcome back, ${c.victimName}!`, "success");
    navigateTo("#dashboard");
  } else if (result.reason === "notFound") {
    showToast("Case reference not found. Please choose a demo profile above or click 'Reset Password'.", "emergency");
  } else {
    const expected = result.case ? result.case.password : "ananya123 / victim123";
    showToast(`Incorrect password for this case. Demo password is: "${expected}"`, "emergency");
  }
};

// Reset / First-Time Set Password Modal with OTP Verification
let resetTargetCase = null;
let simulatedResetOtp = "123456";
let resetOtpTimerInterval = null;
let resetOtpExpiresAt = null;

window.openResetPasswordModal = function() {
  resetTargetCase = null;
  if (resetOtpTimerInterval) clearInterval(resetOtpTimerInterval);

  // Switch to Step 1 view
  const step1 = document.getElementById("resetStep1View");
  const step2 = document.getElementById("resetStep2View");
  const step3 = document.getElementById("resetStep3View");
  if (step1) step1.style.display = "block";
  if (step2) step2.style.display = "none";
  if (step3) step3.style.display = "none";

  // Reset stage pills
  updateResetStagePills(1);

  const input = document.getElementById("resetCaseOrMobileInput");
  if (input) {
    input.value = selectedCaseForAuth ? selectedCaseForAuth.id : "";
  }
  const otpInput = document.getElementById("resetOtpInput");
  if (otpInput) otpInput.value = "";
  const newPwdInput = document.getElementById("resetNewPasswordInput");
  if (newPwdInput) newPwdInput.value = "";
  const confPwdInput = document.getElementById("resetConfirmPasswordInput");
  if (confPwdInput) confPwdInput.value = "";

  openModal("resetPasswordModal");
};

function updateResetStagePills(step) {
  const p1 = document.getElementById("resetStagePill1");
  const p2 = document.getElementById("resetStagePill2");
  const p3 = document.getElementById("resetStagePill3");

  if (p1) {
    p1.className = step === 1 ? "reset-pill active" : (step > 1 ? "reset-pill completed" : "reset-pill");
    p1.style.color = step === 1 ? "var(--accent-blue)" : (step > 1 ? "var(--success-green)" : "var(--text-muted)");
    p1.style.fontWeight = step === 1 ? "700" : "400";
  }
  if (p2) {
    p2.className = step === 2 ? "reset-pill active" : (step > 2 ? "reset-pill completed" : "reset-pill");
    p2.style.color = step === 2 ? "var(--accent-blue)" : (step > 2 ? "var(--success-green)" : "var(--text-muted)");
    p2.style.fontWeight = step === 2 ? "700" : "400";
  }
  if (p3) {
    p3.className = step === 3 ? "reset-pill active" : "reset-pill";
    p3.style.color = step === 3 ? "var(--accent-blue)" : "var(--text-muted)";
    p3.style.fontWeight = step === 3 ? "700" : "400";
  }
}

window.handleResetRequestOtp = function(e) {
  e.preventDefault();
  const query = document.getElementById("resetCaseOrMobileInput")?.value.trim();

  if (!query) {
    showToast("Please enter your Case ID or registered mobile.", "warning");
    return;
  }

  const c = window.navicaStore.getCaseById(query) || window.navicaStore.getCaseByMobile(query);
  if (!c) {
    showToast("Case reference not found. Use NAV-001, NAV-002, or NAV-003.", "emergency");
    return;
  }

  resetTargetCase = c;
  simulatedResetOtp = String(Math.floor(100000 + Math.random() * 900000));
  resetOtpExpiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes

  // Show Step 2 & SMS Simulator box
  document.getElementById("resetStep1View").style.display = "none";
  const step2 = document.getElementById("resetStep2View");
  step2.style.display = "block";
  updateResetStagePills(2);

  const smsBox = document.getElementById("resetSmsSimulatorBox");
  if (smsBox) {
    smsBox.innerHTML = `
      <div><strong>🔔 Demo SMS Simulation (Reset Code Sent):</strong></div>
      <div style="margin-top: 0.35rem;">
        Your password reset code for <strong>${c.victimName} (${c.id})</strong> is:
        <span class="otp-code-highlight">${simulatedResetOtp}</span>
        <button type="button" class="btn btn-sm btn-secondary" onclick="autoFillResetOtp()" style="margin-left: 0.5rem;">Auto-Fill OTP</button>
      </div>
      <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">
        Simulated delivery to registered number ${c.mobile}.
      </p>
    `;
  }

  startResetOtpTimer();
  showToast(`Reset OTP for ${c.victimName}: ${simulatedResetOtp}`, "success");

  const otpInput = document.getElementById("resetOtpInput");
  if (otpInput) {
    otpInput.value = "";
    otpInput.focus();
  }
};

window.autoFillResetOtp = function() {
  const otpInput = document.getElementById("resetOtpInput");
  if (otpInput) {
    otpInput.value = simulatedResetOtp;
    showToast("OTP Auto-filled! Click 'Verify OTP & Continue'.", "info");
  }
};

function startResetOtpTimer() {
  if (resetOtpTimerInterval) clearInterval(resetOtpTimerInterval);

  const timerEl = document.getElementById("resetOtpTimerText");
  resetOtpTimerInterval = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((resetOtpExpiresAt - Date.now()) / 1000));
    if (timerEl) {
      if (remaining > 0) {
        const m = String(Math.floor(remaining / 60)).padStart(2, "0");
        const s = String(remaining % 60).padStart(2, "0");
        timerEl.textContent = `Expires in ${m}:${s}`;
      } else {
        timerEl.textContent = "OTP expired. Please request a new code.";
        clearInterval(resetOtpTimerInterval);
      }
    }
  }, 1000);
}

window.backToResetStep1 = function() {
  if (resetOtpTimerInterval) clearInterval(resetOtpTimerInterval);
  document.getElementById("resetStep2View").style.display = "none";
  document.getElementById("resetStep1View").style.display = "block";
  updateResetStagePills(1);
};

window.handleResetVerifyOtp = function(e) {
  e.preventDefault();
  const entered = document.getElementById("resetOtpInput")?.value.trim();

  if (Date.now() > resetOtpExpiresAt) {
    showToast("This OTP has expired. Please go back and request a new one.", "emergency");
    return;
  }

  if (entered !== simulatedResetOtp && entered !== "123456") {
    showToast("Invalid OTP code. Please enter the 6 digits shown in the demo SMS banner.", "emergency");
    return;
  }

  if (resetOtpTimerInterval) clearInterval(resetOtpTimerInterval);

  // Unlocks Step 3: Create New Password
  document.getElementById("resetStep2View").style.display = "none";
  const step3 = document.getElementById("resetStep3View");
  step3.style.display = "block";
  updateResetStagePills(3);

  const nameEl = document.getElementById("resetTargetVictimName");
  if (nameEl && resetTargetCase) {
    nameEl.textContent = `${resetTargetCase.victimName} (${resetTargetCase.id})`;
  }

  const pwdInput = document.getElementById("resetNewPasswordInput");
  if (pwdInput) {
    pwdInput.value = "";
    pwdInput.focus();
  }
  const confInput = document.getElementById("resetConfirmPasswordInput");
  if (confInput) confInput.value = "";

  showToast("OTP verified! You can now create your new password.", "success");
};

window.handleResetSaveNewPassword = function(e) {
  e.preventDefault();
  const newPwd = document.getElementById("resetNewPasswordInput")?.value.trim();
  const confirmPwd = document.getElementById("resetConfirmPasswordInput")?.value.trim();

  if (!newPwd) {
    showToast("Please enter a new password.", "warning");
    return;
  }
  if (newPwd !== confirmPwd) {
    showToast("Passwords do not match. Please re-enter.", "emergency");
    return;
  }

  if (!resetTargetCase) {
    showToast("Session expired. Please restart the reset flow.", "emergency");
    return;
  }

  window.navicaStore.updatePassword(resetTargetCase.id, newPwd);
  closeModal("resetPasswordModal");

  // Log in to dashboard
  window.navicaStore.setSession({
    role: "victim",
    caseId: resetTargetCase.id,
    name: resetTargetCase.victimName,
    mobile: resetTargetCase.mobile,
    token: "pwd_token_" + Date.now()
  });

  showToast(`Password successfully updated! Welcome, ${resetTargetCase.victimName}!`, "success");
  navigateTo("#dashboard");
};

// Dashboard Change Password Handlers
window.openChangePasswordModal = function() {
  const newPwdInput = document.getElementById("newPasswordInput");
  const confirmPwdInput = document.getElementById("confirmPasswordInput");
  if (newPwdInput) newPwdInput.value = "";
  if (confirmPwdInput) confirmPwdInput.value = "";
  openModal("victimPasswordModal");
};

window.handleSaveNewPassword = function(e) {
  e.preventDefault();
  const newPwd = document.getElementById("newPasswordInput")?.value.trim();
  const confirmPwd = document.getElementById("confirmPasswordInput")?.value.trim();

  if (!newPwd) {
    showToast("Please enter a new password.", "warning");
    return;
  }
  if (newPwd !== confirmPwd) {
    showToast("Passwords do not match. Please re-enter.", "emergency");
    return;
  }

  const session = window.navicaStore.getSession();
  const caseId = session?.caseId || "VC-2026-00125";
  const updated = window.navicaStore.updatePassword(caseId, newPwd);

  if (updated) {
    closeModal("victimPasswordModal");
    showToast("New password saved! You will use this password for future logins.", "success");
    updateDashboardSecurityWidget(newPwd);
  } else {
    showToast("Could not update password. Please try again.", "emergency");
  }
};

function updateDashboardSecurityWidget(pwd) {
  const display = document.getElementById("dashPasswordDisplay");
  if (display) {
    display.textContent = pwd ? "•".repeat(Math.max(6, pwd.length)) + ` (${pwd})` : "••••••••";
  }
}

/* ==========================================================================
   7. VICTIM DASHBOARD (/dashboard)
   ========================================================================== */
function loadDashboardView() {
  const session = window.navicaStore.getSession();
  let currentCase = null;

  if (session && session.caseId) {
    currentCase = window.navicaStore.getCaseById(session.caseId);
  }

  // Fallback to first demo case if accessed directly
  if (!currentCase) {
    currentCase = window.navicaStore.getAllCases()[0];
    window.navicaStore.setSession({
      role: "victim",
      caseId: currentCase.id,
      name: currentCase.victimName,
      mobile: currentCase.mobile,
      token: "demo_token_default"
    });
  }

  renderDashboard(currentCase);
}

function renderDashboard(c) {
  // Case Header
  const titleEl = document.getElementById("dashCaseTitle");
  if (titleEl) titleEl.textContent = `${c.id} · ${c.victimName}`;

  // Update Case Switcher dropdown in header
  const caseSelect = document.getElementById("dashCaseSelect");
  if (caseSelect) {
    const allCases = window.navicaStore.getAllCases();
    caseSelect.innerHTML = allCases.map(cs => `
      <option value="${cs.id}" ${cs.id === c.id ? 'selected' : ''}>
        ${escapeHTML(cs.victimName)} (${escapeHTML(cs.id)})
      </option>
    `).join("");
  }

  const metaEl = document.getElementById("dashCaseMeta");
  if (metaEl) {
    metaEl.innerHTML = `
      <div class="case-meta-item">Status: <strong>${c.currentStatus}</strong> <span class="badge badge-sm badge-info" style="margin-left:0.35rem; font-size:0.7rem; vertical-align:middle;">Official Briefing Attached</span></div>
      <div class="case-meta-item">Police Station: <strong>${c.station}</strong></div>
      <div class="case-meta-item">Court: <strong>${c.court}</strong></div>
      <div class="case-meta-item">Officer: <strong>${c.assignedOfficer}</strong></div>
      <div class="case-meta-item">Filed: <strong>${c.registrationDate}</strong></div>
    `;
  }

  // Dedicated Case Status Card Header & Stage Description
  const statusTitleEl = document.getElementById("dashCaseStatusTitle");
  const statusDescEl = document.getElementById("dashCaseStatusDesc");
  const statusTagEl = document.getElementById("dashCaseStatusTag");
  const statusStationEl = document.getElementById("dashCaseStatusStation");

  const displayStatus = c.currentStatus || (c.currentStage === "Investigation" ? "Investigation Process" : `${c.currentStage} in Progress`);
  if (statusTitleEl) {
    statusTitleEl.textContent = displayStatus;
  }
  if (statusDescEl) {
    statusDescEl.textContent = c.stageDescription || 
      (c.currentStage === "Investigation" 
        ? "The case is currently in the active Investigation Process. Police and specialized forensic personnel are conducting field inquiries, examining the crime scene, and compiling witness statements before submitting the formal police report (charge sheet)."
        : (c.whatNext ? c.whatNext.meaning : "Authorities are actively processing this case milestone."));
  }
  if (statusTagEl) {
    statusTagEl.textContent = `Active Stage: ${c.currentStage === "Investigation" ? "Investigation Process" : c.currentStage}`;
  }
  if (statusStationEl) {
    statusStationEl.innerHTML = `<span>🏢 ${escapeHTML(c.station)}</span> · <span>👮 ${escapeHTML(c.assignedOfficer)}</span>`;
  }

  // 5-Stage Stepper
  renderStepper(c.currentStage);

  // Authority Stage & Investigation Briefing Card (Authority Update Space)
  renderAuthorityStageBrief(c);

  // "What Next?"
  const wnMeaning = document.getElementById("dashWnMeaning");
  const wnNext = document.getElementById("dashWnNext");
  const wnAction = document.getElementById("dashWnAction");
  if (wnMeaning) wnMeaning.textContent = c.whatNext.meaning;
  if (wnNext) wnNext.textContent = c.whatNext.next;
  if (wnAction) wnAction.textContent = c.whatNext.action;

  // Digital Verifiable QR Card Widget
  renderDigitalCardWidget(c);

  // Case Security & Password Widget
  updateDashboardSecurityWidget(c.password);

  // Compensation Tracker
  renderCompensationTracker(c.compensation);

  // Timeline
  renderDashboardTimeline(c.timeline);

  // Documents Repository
  renderDashboardDocuments(c.documents);

  // Important Dates
  renderImportantDates(c.dates);
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderAuthorityStageBrief(c) {
  const container = document.getElementById("dashAuthorityStageBox");
  if (!container) return;

  const update = c.authorityStageUpdate || {
    headline: `${c.currentStage === 'Investigation' ? 'Investigation Process' : c.currentStage} Active — Evidentiary Collection & Verification`,
    description: "The investigating agency is actively collecting witness statements, documentation, and scientific materials in accordance with criminal procedure regulations.",
    officer: c.assignedOfficer || "Investigating Officer",
    station: c.station || "Designated Police Station",
    lastUpdated: c.lastUpdate || "Recent",
    badge: "Verified Police Dispatch",
    authorityNotesSpace: [],
    upcomingActionNotice: "Awaiting next formal authority log."
  };

  const notesList = (update.authorityNotesSpace && update.authorityNotesSpace.length > 0)
    ? update.authorityNotesSpace.map(note => `
        <div class="asb-note-item">
          <div class="asb-note-head">
            <span class="asb-note-title">📌 ${escapeHTML(note.title)}</span>
            <span class="asb-note-date">${escapeHTML(note.date)}</span>
          </div>
          <p class="asb-note-body">${escapeHTML(note.note)}</p>
          <div class="asb-note-officer">Logged by: <strong>${escapeHTML(note.officer || update.officer || c.assignedOfficer)}</strong></div>
        </div>
      `).join("")
    : `
        <div class="asb-note-empty">
          <span>ℹ️ Official inquiries active. Authority notes will be logged here as investigation milestones complete.</span>
        </div>
      `;

  const upcomingNotice = update.upcomingActionNotice || 
    (c.currentStage === "Investigation" 
      ? "Next investigative review scheduled for 24 Sep 2026. Reserved space for formal forensic clearance report receipt and final charge sheet compilation."
      : "Next formal hearing / review update will be broadcast here.");

  container.innerHTML = `
    <div class="asb-header">
      <div class="asb-title-group">
        <div class="asb-badge-row">
          <span class="asb-official-badge">
            <span class="asb-pulse-dot"></span>
            🏛️ ${escapeHTML(update.badge || "Verified Authority Dispatch")}
          </span>
          <span class="asb-stage-pill">Current Stage: <strong>${escapeHTML(c.currentStage === 'Investigation' ? 'Investigation Process' : c.currentStage)}</strong></span>
          <span class="asb-sync-tag">⚡ Live Synchronized with Police Desk</span>
        </div>
        <h3 class="asb-headline">${escapeHTML(update.headline)}</h3>
      </div>
      <div class="asb-timestamp-box">
        <span class="asb-clock-icon">🕒</span>
        <div>
          <div class="asb-ts-label">Authority Log Time</div>
          <div class="asb-ts-val">${escapeHTML(update.lastUpdated || "Live Synced")}</div>
        </div>
      </div>
    </div>

    <!-- Official Stage Description -->
    <div class="asb-body">
      <div class="asb-icon-col">
        <div class="asb-avatar-icon">📋</div>
      </div>
      <div class="asb-desc-col">
        <div class="asb-desc-label">Official Authority Stage Description & Inquiries Conducted</div>
        <p class="asb-desc-text">${escapeHTML(update.description)}</p>
      </div>
    </div>

    <!-- Dedicated Authority Update & Notes Space -->
    <div class="asb-authority-space">
      <div class="asb-space-header">
        <div class="asb-space-title">
          <span style="font-size:1.1rem;">👮</span>
          <strong>Official Authority Stage Dispatches & Evidentiary Notes</strong>
        </div>
        <span class="asb-space-badge">${(update.authorityNotesSpace && update.authorityNotesSpace.length) || 0} Official Notes Logged</span>
      </div>

      <div class="asb-notes-list">
        ${notesList}
      </div>

      <!-- Upcoming Notice & Reserved Space -->
      <div class="asb-reserved-space">
        <div class="asb-reserved-head">
          <span class="asb-reserved-pulse"></span>
          <strong>Upcoming Official Milestone Notice:</strong>
        </div>
        <p class="asb-reserved-text">${escapeHTML(upcomingNotice)}</p>
        <div class="asb-reserved-hint">
          <span>🔒 Official Authority Entry Channel</span>
          <span>• Reserved space for State Forensic Science Lab (SFSL) clearance & judicial summons</span>
        </div>
      </div>
    </div>

    <div class="asb-footer">
      <div class="asb-meta-tags">
        <div class="asb-meta-tag">
          <span>👮 Officer / Desk: <strong>${escapeHTML(update.officer || c.assignedOfficer)}</strong></span>
        </div>
        <div class="asb-meta-tag">
          <span>🏢 Jurisdiction: <strong>${escapeHTML(update.station || c.station)}</strong></span>
        </div>
        <div class="asb-meta-tag">
          <span>⚖️ Court Linkage: <strong>${escapeHTML(c.court)}</strong></span>
        </div>
      </div>
      <div class="asb-action-space">
        <button type="button" class="btn btn-sm btn-primary asb-edit-btn" onclick="openAuthorityCaseEditor('${c.id}')" title="Modify official stage notes or add authority update">
          ✏️ Add / Update Authority Notes
        </button>
        <button type="button" class="btn btn-sm btn-outline" onclick="navigateTo('#authority')" title="Switch to Criminal Justice Authority Console">
          Authority Desk →
        </button>
      </div>
    </div>
  `;
}

function renderStepper(currentStage) {
  const stages = ["FIR", "Investigation", "Charge Sheet", "Court Proceedings", "Judgment"];
  const stageLabels = {
    "FIR": "FIR Filed",
    "Investigation": "Investigation Process",
    "Charge Sheet": "Charge Sheet",
    "Court Proceedings": "Court Proceedings",
    "Judgment": "Judgment / Relief"
  };
  const stageSublabels = {
    "FIR": "Initial Registration",
    "Investigation": "Active Probe & Evidence",
    "Charge Sheet": "Police Final Report",
    "Court Proceedings": "Judicial Trial",
    "Judgment": "Final Order & Relief"
  };
  const stageIndex = stages.indexOf(currentStage);

  const container = document.getElementById("dashStepperContainer");
  if (!container) return;

  const progressPercent = stageIndex >= 0 ? (stageIndex / (stages.length - 1)) * 100 : 0;

  container.innerHTML = `
    <div class="stepper-track">
      <div class="stepper-progress-bar" style="width: ${progressPercent}%;"></div>
      ${stages.map((stage, idx) => {
        let stateClass = "";
        if (idx < stageIndex) stateClass = "completed";
        else if (idx === stageIndex) stateClass = "active";

        return `
          <div class="stepper-step ${stateClass}">
            <div class="step-node">${idx < stageIndex ? "✓" : idx + 1}</div>
            <div class="step-label">${stageLabels[stage] || stage}</div>
            <div class="step-sublabel">${stageSublabels[stage] || ""}</div>
            ${idx === stageIndex ? `<span class="step-active-pill">In Progress</span>` : ''}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderDigitalCardWidget(c) {
  const container = document.getElementById("dashDigitalCardContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="card" style="background: linear-gradient(135deg, #0b192c, #1e3e62); color: #ffffff; border-radius: var(--radius-xl); position:relative; overflow:hidden;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
        <div>
          <span style="font-size:0.65rem; text-transform:uppercase; letter-spacing:0.15em; color:rgba(255,255,255,0.7);">Verifiable Identity</span>
          <h3 style="color:#ffffff; font-size:1.15rem; font-family:var(--font-mono);">${c.id}</h3>
        </div>
        <span class="badge badge-success" style="background:rgba(5,150,105,0.25); color:#6ee7b7; border-color:#059669;">QR Authenticated</span>
      </div>
      
      <div style="display:flex; gap:1.25rem; align-items:center;">
        <div style="background:#ffffff; padding:0.35rem; border-radius:12px; width:92px; height:92px; display:flex; align-items:center; justify-content:center; flex-shrink:0; cursor:pointer;" onclick="openQRVerificationModal('${c.id}')" title="Click to enlarge & test QR scan">
          ${generateSVGQRCode(c.id, 86)}
        </div>
        <div style="font-size:0.85rem; line-height:1.5;">
          <p style="font-weight:700; font-size:1rem; color:#ffffff;">${c.victimName}</p>
          <p style="color:rgba(255,255,255,0.75);">${c.type}</p>
          <p style="color:rgba(255,255,255,0.6); font-size:0.75rem; margin-top:0.25rem;">Present at courts, DLSA & shelters for secure verification.</p>
        </div>
      </div>

      <div style="margin-top:1.25rem; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.15); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
        <button class="btn btn-sm btn-outline" style="color:#ffffff; border-color:rgba(255,255,255,0.3);" onclick="printVictimCard()">
          🖨️ Print Wallet Card
        </button>
        <button class="btn btn-sm btn-accent" onclick="openQRVerificationModal('${c.id}')">
          Verify Token
        </button>
      </div>
    </div>
  `;
}

window.printVictimCard = function() {
  window.print();
};

window.openQRVerificationModal = function(caseId) {
  const modal = document.getElementById("qrCardModal");
  const modalBody = document.getElementById("qrCardModalBody");
  if (!modal || !modalBody) return;

  const c = window.navicaStore.getCaseById(caseId);
  if (!c) return;

  const verifyUrl = getCaseVerificationURL(c.id);
  const currentHost = localStorage.getItem("navica_network_host") || 
                      (window.location.protocol.startsWith("http") ? window.location.host : "localhost:8080");

  modalBody.innerHTML = `
    <div style="text-align:center;">
      <div style="background:#fff; display:inline-flex; flex-direction:column; align-items:center; padding:1.25rem; border-radius:20px; border:2px solid var(--border-color); box-shadow:var(--shadow-md);">
        <div id="modalQrCodeContainer" style="width:190px; height:190px; margin:0 auto; display:flex; align-items:center; justify-content:center;">
          ${generateSVGQRCode(c.id, 190)}
        </div>
        <div style="margin-top:0.75rem; text-align:center;">
          <span class="badge badge-success" style="font-size:0.72rem; font-weight:700; padding:0.25rem 0.6rem;">Standard ISO/IEC 18004 QR Code</span>
          <p style="font-family:var(--font-mono); font-weight:800; font-size:1.1rem; margin-top:0.35rem; color:#0f172a;">${escapeHTML(c.id)}</p>
          <p style="font-size:0.82rem; color:#475569; font-weight:600; margin:0;">${escapeHTML(c.victimName)} · ${escapeHTML(c.type)}</p>
        </div>
      </div>

      <!-- Quick Action Buttons Strip -->
      <div style="display:flex; justify-content:center; gap:0.5rem; margin-top:1rem; flex-wrap:wrap;">
        <button type="button" class="btn btn-sm btn-primary" onclick="quickLoginToCase('${c.id}'); closeModal('qrCardModal');" style="font-weight:700;">
          ⚡ Open Case Now
        </button>
        <button type="button" class="btn btn-sm btn-outline" onclick="copyVerificationLink('${c.id}')" id="copyVerifyLinkBtn">
          📋 Copy Link
        </button>
        <button type="button" class="btn btn-sm btn-secondary" onclick="closeModal('qrCardModal'); openQRScannerModal();">
          📷 Scan With Camera
        </button>
      </div>

      <!-- Target URL Box -->
      <div style="margin-top:1rem; text-align:left; background:var(--bg-surface-subtle); padding:0.85rem 1rem; border-radius:var(--radius-md); font-size:0.8rem; border:1px solid var(--border-color);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
          <strong style="color:var(--text-primary);">📱 Scannable Verification URL:</strong>
          <span style="font-size:0.7rem; color:var(--accent-blue); font-weight:600;">Point phone camera at QR</span>
        </div>
        <div style="background:var(--bg-surface); padding:0.4rem 0.6rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-family:var(--font-mono); font-size:0.72rem; word-break:break-all; color:var(--text-secondary);">
          <span id="displayVerifyUrl">${escapeHTML(verifyUrl)}</span>
        </div>

        <!-- Wi-Fi IP configuration for multi-device testing -->
        <details style="margin-top:0.75rem; font-size:0.78rem;">
          <summary style="cursor:pointer; color:var(--accent-blue); font-weight:600;">
            ⚙️ Scanning from your phone on the same Wi-Fi? (Click to set LAN IP)
          </summary>
          <div style="margin-top:0.5rem; padding:0.5rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-color);">
            <p style="margin:0 0 0.4rem 0; color:var(--text-muted); font-size:0.75rem;">
              When scanning from a phone on the same Wi-Fi network, enter your PC's Wi-Fi IP address (e.g. <code>192.168.1.15:8080</code>) so your phone can reach this server:
            </p>
            <div style="display:flex; gap:0.4rem;">
              <input type="text" id="customHostInput" class="form-input" style="padding:0.25rem 0.5rem; font-size:0.75rem; font-family:var(--font-mono);" placeholder="e.g. 192.168.1.15:8080" value="${escapeHTML(currentHost)}"/>
              <button type="button" class="btn btn-sm btn-outline" style="padding:0.25rem 0.6rem; font-size:0.72rem;" onclick="applyCustomHost('${c.id}')">Apply</button>
              <button type="button" class="btn btn-sm btn-ghost" style="padding:0.25rem 0.5rem; font-size:0.72rem;" onclick="resetCustomHost('${c.id}')">Reset</button>
            </div>
          </div>
        </details>
      </div>

      <div style="margin-top:0.75rem; text-align:left; background:var(--bg-surface-subtle); padding:0.75rem 1rem; border-radius:var(--radius-md); font-size:0.78rem; border:1px solid var(--border-color); color:var(--text-muted);">
        🔐 <strong>Zero-Trust Privacy Guarantee:</strong> The physical QR card only encodes an authenticated verification link. Sensitive medical notes, statements, or home addresses are NEVER stored in plaintext on the card.
      </div>
    </div>
  `;

  openModal("qrCardModal");
};

window.copyVerificationLink = function(caseId) {
  const url = getCaseVerificationURL(caseId);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast("Verification URL copied to clipboard!", "success");
      const btn = document.getElementById("copyVerifyLinkBtn");
      if (btn) btn.textContent = "✓ Copied!";
    }).catch(() => {
      showToast(`Verification Link: ${url}`, "info");
    });
  } else {
    showToast(`Verification Link: ${url}`, "info");
  }
};

window.applyCustomHost = function(caseId) {
  const input = document.getElementById("customHostInput");
  if (!input) return;
  let val = input.value.trim();
  if (val) {
    if (!val.startsWith("http://") && !val.startsWith("https://")) {
      val = "http://" + val;
    }
    localStorage.setItem("navica_network_host", val);
    showToast(`QR Host updated to ${val}`, "success");
    openQRVerificationModal(caseId);
  }
};

window.resetCustomHost = function(caseId) {
  localStorage.removeItem("navica_network_host");
  showToast("QR Host reset to current browser origin", "info");
  openQRVerificationModal(caseId);
};

function renderCompensationTracker(comp) {
  const container = document.getElementById("dashCompensationContainer");
  if (!container) return;

  const compSteps = ["Application Submitted", "Verification", "Decision / Processing", "Disbursement"];
  const stepIdx = compSteps.indexOf(comp.currentStep);

  container.innerHTML = `
    <div class="compensation-tracker-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
        <h3 style="font-size:1.1rem;">Victim Compensation Scheme (DLSA)</h3>
        <span class="badge badge-info">${comp.status}</span>
      </div>

      <div class="compensation-metric-row">
        <div>
          <div class="comp-metric-label">Sanctioned Amount</div>
          <div class="comp-metric-value">₹${comp.sanctionedAmount.toLocaleString("en-IN")}</div>
        </div>
        <div>
          <div class="comp-metric-label">Disbursed to Bank</div>
          <div class="comp-metric-value" style="color:var(--success-emerald);">₹${comp.disbursedAmount.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <div style="margin: 1.25rem 0;">
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-bottom:0.35rem;">
          <span>Application: <strong>${comp.applicationId}</strong></span>
          <span>Step ${stepIdx + 1} of 4</span>
        </div>
        <div style="height:8px; background:var(--border-color); border-radius:4px; overflow:hidden;">
          <div style="height:100%; width:${((stepIdx + 1) / 4) * 100}%; background:var(--accent-blue); border-radius:4px;"></div>
        </div>
      </div>

      <p style="font-size:0.85rem; color:var(--text-secondary);">
        <strong>Next Step:</strong> ${comp.nextStep}
      </p>
    </div>
  `;
}

function renderDashboardTimeline(timeline) {
  const container = document.getElementById("dashTimelineList");
  if (!container) return;

  container.innerHTML = timeline.map(entry => `
    <div class="timeline-entry ${entry.state || 'completed'}">
      <div class="timeline-dot"></div>
      <div class="timeline-date">${entry.date} · ${entry.stage}</div>
      <div class="timeline-title">${entry.title}</div>
      <div class="timeline-detail">${entry.detail}</div>
    </div>
  `).join("");
}

function renderDashboardDocuments(docs) {
  const container = document.getElementById("dashDocumentsList");
  if (!container) return;

  container.innerHTML = docs.map(doc => `
    <div class="doc-row-item">
      <div class="doc-info">
        <span class="doc-icon">📄</span>
        <div>
          <div class="doc-title">${doc.title}</div>
          <div class="doc-meta">${doc.kind} · Issued ${doc.issued}</div>
        </div>
      </div>
      <button class="btn btn-sm btn-outline" onclick="openDocumentModal('${doc.id}')">
        View Document
      </button>
    </div>
  `).join("");
}

function renderImportantDates(dates) {
  const container = document.getElementById("dashDatesList");
  if (!container) return;

  container.innerHTML = dates.map(d => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:0.65rem 0; border-bottom:1px solid var(--border-color);">
      <div>
        <div style="font-weight:600; font-size:0.85rem;">${d.label}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${d.note}</div>
      </div>
      <div style="font-family:var(--font-mono); font-weight:700; font-size:0.9rem; color:${d.isUpcoming ? 'var(--accent-blue)' : 'var(--text-primary)'};">
        ${d.value}
      </div>
    </div>
  `).join("");
}

window.openDocumentModal = function(docId) {
  const session = window.navicaStore.getSession();
  const currentCase = window.navicaStore.getCaseById(session?.caseId || "VC-2026-00125");
  if (!currentCase) return;

  const doc = currentCase.documents.find(d => d.id === docId);
  if (!doc) return;

  const modal = document.getElementById("documentModal");
  const modalTitle = document.getElementById("documentModalTitle");
  const modalBody = document.getElementById("documentModalBody");
  if (!modal || !modalTitle || !modalBody) return;

  modalTitle.textContent = doc.title;
  modalBody.innerHTML = `
    <div class="official-doc-paper">
      <div class="doc-official-seal">
        STATE POLICE<br>AUTHENTICATED<br>ACADEMIC DEMO
      </div>
      <div style="text-align:center; margin-bottom:1.5rem; border-bottom:1px dashed #374151; padding-bottom:1rem;">
        <h3 style="font-family:var(--font-display); font-size:1.1rem; color:#0f172a; text-transform:uppercase;">
          CRIMINAL JUSTICE RECORDS VAULT (ICJS / NAVICA)
        </h3>
        <p style="font-size:0.75rem; color:#6b7280;">Certified Electronic Extract for Victim Reference</p>
      </div>
      <div style="white-space:pre-wrap; font-size:0.8rem; line-height:1.7;">
${doc.body.join("\n")}
      </div>
    </div>
  `;

  openModal("documentModal");
};

/* ==========================================================================
   8. STATUTORY RIGHTS & SUPPORT SERVICES (/rights & /support)
   ========================================================================== */
function initRightsAndSupport() {
  // Rights Grid
  const rightsContainer = document.getElementById("rightsCardsContainer");
  if (rightsContainer) {
    rightsContainer.innerHTML = window.NAVICA_DATA.VICTIM_RIGHTS.map(r => `
      <div class="card" style="display:flex; flex-direction:column;">
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem;">
          <span style="font-size:1.75rem;">${r.icon}</span>
          <div>
            <h3 style="font-size:1.15rem;">${r.title}</h3>
            <span style="font-size:0.75rem; color:var(--text-muted);">${r.sub}</span>
          </div>
        </div>
        <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1rem;">
          ${r.desc}
        </p>
        <div style="background:var(--bg-surface-subtle); padding:0.85rem; border-radius:var(--radius-md); font-size:0.8rem; border:1px solid var(--border-color); margin-top:auto;">
          <strong>Key Statutory Protections:</strong>
          <ul style="margin-top:0.35rem; padding-left:1.25rem; color:var(--text-muted);">
            ${r.keyPoints.map(pt => `<li>${pt}</li>`).join("")}
          </ul>
        </div>
      </div>
    `).join("");
  }

  // Support Services Grid
  const supportContainer = document.getElementById("supportServicesContainer");
  if (supportContainer) {
    supportContainer.innerHTML = window.NAVICA_DATA.SUPPORT_SERVICES.map(s => `
      <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="font-size:2.25rem; margin-bottom:0.75rem;">${s.icon}</div>
          <h3 style="font-size:1.2rem; margin-bottom:0.4rem;">${s.title}</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; margin-bottom:1rem;">
            ${s.summary}
          </p>
        </div>
        <div>
          <div style="font-size:0.8rem; background:var(--bg-surface-subtle); padding:0.65rem 0.85rem; border-radius:var(--radius-md); margin-bottom:1rem; border:1px solid var(--border-color); line-height:1.4;">
            <strong>Contact:</strong> ${s.contact}
          </div>
          <button class="btn btn-outline btn-sm" style="width:100%;" onclick="openSupportDetailModal('${s.title}')">
            ${s.action || 'View Details & Hotline'}
          </button>
        </div>
      </div>
    `).join("");
  }

  // One Stop Centres (OSC) Directory Initialization
  renderOSCDirectory();

  const oscSearch = document.getElementById("oscSearchInput");
  if (oscSearch) {
    oscSearch.addEventListener("input", (e) => {
      renderOSCDirectory(e.target.value.trim());
    });
  }
}

/* ==========================================================================
   8B. ONE STOP CENTRES (OSC) DIRECTORY CONTROLLER
   ========================================================================== */
let oscCurrentViewMode = "cards";

window.setOSCViewMode = function(mode) {
  oscCurrentViewMode = mode;
  const cardsContainer = document.getElementById("oscCardsContainer");
  const tableCard = document.getElementById("oscTableCard");
  const cardsBtn = document.getElementById("oscViewCardsBtn");
  const tableBtn = document.getElementById("oscViewTableBtn");

  if (mode === "table") {
    if (cardsContainer) cardsContainer.style.display = "none";
    if (tableCard) tableCard.style.display = "block";
    if (cardsBtn) cardsBtn.classList.remove("active");
    if (tableBtn) tableBtn.classList.add("active");
  } else {
    if (cardsContainer) cardsContainer.style.display = "grid";
    if (tableCard) tableCard.style.display = "block"; // Keep table visible as reference
    if (cardsBtn) cardsBtn.classList.add("active");
    if (tableBtn) tableBtn.classList.remove("active");
  }
};

window.renderOSCDirectory = function(searchTerm = "") {
  const cardsContainer = document.getElementById("oscCardsContainer");
  const tableTbody = document.getElementById("oscTableTbody");
  if (!cardsContainer && !tableTbody) return;

  const centres = (window.NAVICA_DATA.ONE_STOP_CENTRES || []).filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.district.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term) ||
      c.centreAdminName.toLowerCase().includes(term) ||
      c.centreAdminMobile.includes(term) ||
      c.counsellorName.toLowerCase().includes(term) ||
      c.counsellorMobile.includes(term) ||
      c.landline.includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  // Render Cards
  if (cardsContainer) {
    if (centres.length === 0) {
      cardsContainer.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align:center; padding:2.5rem 1rem;">
          <p style="font-size:2rem; margin-bottom:0.5rem;">🔍</p>
          <h3>No One Stop Centre Found</h3>
          <p style="color:var(--text-muted); font-size:0.85rem;">No district match for "${escapeHTML(searchTerm)}". Try searching for "Bangalore Urban", "Amitha", or "Majestic".</p>
        </div>
      `;
    } else {
      cardsContainer.innerHTML = centres.map(c => `
        <div class="osc-card">
          <div>
            <div class="osc-card-head">
              <div>
                <span class="osc-district-badge">
                  <span>🏛️</span> District #${c.slNo} · Sakhi Initiative
                </span>
                <h3 class="osc-district-title">${escapeHTML(c.district)}</h3>
              </div>
              <span class="osc-status-pill">
                <span class="pulse-dot"></span> 24/7 Crisis Support
              </span>
            </div>

            <!-- Address Block -->
            <div class="osc-address-box">
              <div class="osc-address-label">
                <span>📍 Official Centre Address</span>
                <button type="button" class="btn btn-sm btn-outline" style="font-size:0.68rem; padding:0.15rem 0.45rem;" onclick="copyNumber('${escapeHTML(c.address)}')" title="Copy Address">
                  Copy Address
                </button>
              </div>
              <strong>${escapeHTML(c.address)}</strong>
            </div>

            <!-- Contacts Grid -->
            <div class="osc-contact-grid">
              <!-- Centre Administrator -->
              <div class="osc-contact-card">
                <div>
                  <div class="osc-contact-role">👮 Centre Administrator</div>
                  <div class="osc-contact-name">${escapeHTML(c.centreAdminName)}</div>
                </div>
                <div class="osc-contact-num">
                  <a href="tel:${c.centreAdminMobile}" class="table-person-phone" onclick="trackCall('${c.centreAdminMobile}', 'OSC Administrator ${c.centreAdminName}')">
                    📞 ${c.centreAdminMobile}
                  </a>
                  <button type="button" class="btn btn-sm btn-copy" style="padding:0.2rem 0.5rem; font-size:0.7rem;" onclick="copyNumber('${c.centreAdminMobile}')" title="Copy Number">
                    Copy
                  </button>
                </div>
              </div>

              <!-- Counsellor -->
              <div class="osc-contact-card">
                <div>
                  <div class="osc-contact-role">🧠 Centre Counsellor</div>
                  <div class="osc-contact-name">${escapeHTML(c.counsellorName)}</div>
                </div>
                <div class="osc-contact-num">
                  <a href="tel:${c.counsellorMobile}" class="table-person-phone" onclick="trackCall('${c.counsellorMobile}', 'OSC Counsellor ${c.counsellorName}')">
                    📞 ${c.counsellorMobile}
                  </a>
                  <button type="button" class="btn btn-sm btn-copy" style="padding:0.2rem 0.5rem; font-size:0.7rem;" onclick="copyNumber('${c.counsellorMobile}')" title="Copy Number">
                    Copy
                  </button>
                </div>
              </div>

              <!-- Landline Desk -->
              <div class="osc-contact-card">
                <div>
                  <div class="osc-contact-role">☎️ Official Landline Number</div>
                  <div class="osc-contact-name">Direct Office Desk</div>
                </div>
                <div class="osc-contact-num">
                  <a href="tel:${c.landline.replace(/\D/g, '')}" class="table-landline-link" onclick="trackCall('${c.landline}', 'OSC Landline Desk')">
                    ☎️ ${c.landline}
                  </a>
                  <button type="button" class="btn btn-sm btn-copy" style="padding:0.2rem 0.5rem; font-size:0.7rem;" onclick="copyNumber('${c.landline}')" title="Copy Number">
                    Copy
                  </button>
                </div>
              </div>

              <!-- Email Desk -->
              <div class="osc-contact-card">
                <div>
                  <div class="osc-contact-role">✉️ Official E-mail ID</div>
                  <div class="osc-contact-name">Government Registry</div>
                </div>
                <div class="osc-contact-num" style="font-size:0.8rem; word-break:break-all;">
                  <a href="mailto:${c.email}" class="table-email-link">
                    ${c.email}
                  </a>
                  <button type="button" class="btn btn-sm btn-copy" style="padding:0.2rem 0.5rem; font-size:0.7rem;" onclick="copyNumber('${c.email}')" title="Copy Email">
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <!-- Integrated Services Tags -->
            <div class="osc-services-list">
              ${c.services.map(s => `<span class="osc-service-tag">✓ ${s}</span>`).join("")}
            </div>
          </div>

          <!-- Actions Row -->
          <div class="osc-actions-row">
            <a href="tel:${c.landline.replace(/\D/g, '')}" class="btn btn-emergency btn-sm" onclick="trackCall('${c.landline}', 'One Stop Centre Bangalore Urban')">
              ☎️ Call Landline (${c.landline})
            </a>
            <a href="tel:${c.centreAdminMobile}" class="btn btn-primary btn-sm" onclick="trackCall('${c.centreAdminMobile}', 'Administrator ${c.centreAdminName}')">
              📞 Call Admin
            </a>
            <a href="tel:${c.counsellorMobile}" class="btn btn-outline btn-sm" onclick="trackCall('${c.counsellorMobile}', 'Counsellor ${c.counsellorName}')">
              🧠 Call Counsellor
            </a>
            <a href="mailto:${c.email}" class="btn btn-outline btn-sm">
              ✉️ Send Email
            </a>
            <button type="button" class="btn btn-secondary btn-sm" onclick="copyOSCDetails(${c.slNo})">
              📋 Copy All Details
            </button>
          </div>
        </div>
      `).join("");
    }
  }

  // Render Table Rows
  if (tableTbody) {
    if (centres.length === 0) {
      tableTbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">
            No One Stop Centre records matching "${escapeHTML(searchTerm)}".
          </td>
        </tr>
      `;
    } else {
      tableTbody.innerHTML = centres.map(c => `
        <tr>
          <td style="text-align:center; font-weight:700; font-family:var(--font-mono); color:var(--accent-blue);">
            ${c.slNo}
          </td>
          <td>
            <div style="font-weight:700; font-size:0.95rem; color:var(--text-primary);">${escapeHTML(c.district)}</div>
            <span class="badge badge-sm badge-success" style="font-size:0.68rem; margin-top:0.25rem;">24/7 Active</span>
          </td>
          <td style="max-width:240px; font-size:0.835rem; line-height:1.45;">
            ${escapeHTML(c.address)}
          </td>
          <td>
            <div class="table-person-block">
              <span class="table-person-name">${escapeHTML(c.centreAdminName)}</span>
              <a href="tel:${c.centreAdminMobile}" class="table-person-phone" onclick="trackCall('${c.centreAdminMobile}', 'Admin ${c.centreAdminName}')">
                📞 ${c.centreAdminMobile}
              </a>
            </div>
          </td>
          <td>
            <div class="table-person-block">
              <span class="table-person-name">${escapeHTML(c.counsellorName)}</span>
              <a href="tel:${c.counsellorMobile}" class="table-person-phone" onclick="trackCall('${c.counsellorMobile}', 'Counsellor ${c.counsellorName}')">
                📞 ${c.counsellorMobile}
              </a>
            </div>
          </td>
          <td>
            <a href="tel:${c.landline.replace(/\D/g, '')}" class="table-landline-link" onclick="trackCall('${c.landline}', 'OSC Landline Desk')">
              ☎️ ${c.landline}
            </a>
          </td>
          <td>
            <a href="mailto:${c.email}" class="table-email-link">
              ✉️ ${c.email}
            </a>
          </td>
          <td style="text-align:right;">
            <div style="display:flex; justify-content:flex-end; gap:0.35rem; flex-wrap:wrap;">
              <a href="tel:${c.landline.replace(/\D/g, '')}" class="btn btn-sm btn-emergency" style="font-size:0.75rem; padding:0.25rem 0.55rem;" title="Call Landline">
                Call
              </a>
              <button type="button" class="btn btn-sm btn-outline" style="font-size:0.75rem; padding:0.25rem 0.55rem;" onclick="copyOSCDetails(${c.slNo})" title="Copy Full Entry">
                Copy
              </button>
            </div>
          </td>
        </tr>
      `).join("");
    }
  }
};

window.copyOSCDetails = function(slNo) {
  const c = (window.NAVICA_DATA.ONE_STOP_CENTRES || []).find(item => item.slNo === slNo);
  if (!c) return;

  const text = `One Stop Centre (OSC) Contact Details:
District: ${c.district}
Address: ${c.address}
Centre Administrator: ${c.centreAdminName} (Mobile: ${c.centreAdminMobile})
Counsellor: ${c.counsellorName} (Mobile: ${c.counsellorMobile})
Landline Number: ${c.landline}
E-mail ID: ${c.email}
Services: Emergency Medical Aid, Legal Counseling, Psycho-Social Care, Temporary Shelter (24/7).`;

  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied One Stop Centre (${c.district}) full details to clipboard!`, "success");
  }).catch(() => {
    showToast(`OSC ${c.district}: Landline ${c.landline} | Admin ${c.centreAdminMobile}`, "info");
  });
};

window.openSupportDetailModal = function(title) {
  const service = window.NAVICA_DATA.SUPPORT_SERVICES.find(s => s.title === title);
  if (!service) return;

  const modal = document.getElementById("supportDetailModal");
  const modalTitle = document.getElementById("supportDetailTitle");
  const modalBody = document.getElementById("supportDetailBody");
  if (!modal || !modalTitle || !modalBody) return;

  modalTitle.textContent = `${service.icon} ${service.title}`;

  // If this is the One Stop Centre service, show rich interactive directory information
  if (title.includes("One Stop") || title.includes("Sakhi")) {
    const osc = (window.NAVICA_DATA.ONE_STOP_CENTRES && window.NAVICA_DATA.ONE_STOP_CENTRES[0]) || {
      district: "Bangalore Urban",
      address: "One Stop Center, BMTC building, 2nd floor, Majestic, Bengaluru urban-560024",
      centreAdminName: "Amitha Athresh HR",
      centreAdminMobile: "9164069641",
      counsellorName: "Harshitha BR",
      counsellorMobile: "9449403616",
      landline: "080-26538977",
      email: "oscbengaluruurban@karnataka.gov.in"
    };

    modalBody.innerHTML = `
      <div style="font-size:0.925rem; line-height:1.6; color:var(--text-secondary);">
        <p style="margin-bottom:1rem;">${service.details}</p>
        
        <!-- Highlighted Bangalore Urban OSC Card -->
        <div style="background:var(--bg-surface-subtle); border-radius:var(--radius-lg); border:1px solid var(--border-color); padding:1.25rem; margin-bottom:1.5rem; border-left:4px solid #db2777;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <span class="section-badge" style="background:rgba(219,39,119,0.1); color:#db2777; font-size:0.7rem; padding:0.15rem 0.5rem;">🌸 Official Karnataka Sakhi Centre</span>
              <h3 style="font-size:1.2rem; margin-top:0.25rem; color:var(--text-primary);">${osc.district} One Stop Centre</h3>
            </div>
            <span class="badge badge-success" style="font-size:0.72rem;">24/7 Active Desk</span>
          </div>

          <div style="background:var(--bg-surface); padding:0.75rem 0.9rem; border-radius:var(--radius-md); border:1px solid var(--border-color); font-size:0.85rem; margin-bottom:1rem;">
            <span style="color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:700; display:block; margin-bottom:0.2rem;">Location / Address:</span>
            <strong>${osc.address}</strong>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0.75rem; margin-bottom:1rem;">
            <div style="background:var(--bg-surface); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
              <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Centre Administrator:</div>
              <div style="font-weight:700; color:var(--text-primary); font-size:0.95rem;">${osc.centreAdminName}</div>
              <div style="margin-top:0.35rem;">
                <a href="tel:${osc.centreAdminMobile}" class="btn btn-sm btn-primary" style="font-size:0.75rem; padding:0.25rem 0.6rem;">
                  📞 Call ${osc.centreAdminMobile}
                </a>
              </div>
            </div>

            <div style="background:var(--bg-surface); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
              <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Counsellor:</div>
              <div style="font-weight:700; color:var(--text-primary); font-size:0.95rem;">${osc.counsellorName}</div>
              <div style="margin-top:0.35rem;">
                <a href="tel:${osc.counsellorMobile}" class="btn btn-sm btn-outline" style="font-size:0.75rem; padding:0.25rem 0.6rem;">
                  🧠 Call ${osc.counsellorMobile}
                </a>
              </div>
            </div>

            <div style="background:var(--bg-surface); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
              <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Landline Number:</div>
              <div style="font-weight:700; color:var(--text-primary); font-size:0.95rem;">${osc.landline}</div>
              <div style="margin-top:0.35rem;">
                <a href="tel:${osc.landline.replace(/\D/g, '')}" class="btn btn-sm btn-emergency" style="font-size:0.75rem; padding:0.25rem 0.6rem;">
                  ☎️ Call Landline
                </a>
              </div>
            </div>

            <div style="background:var(--bg-surface); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
              <div style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">E-mail ID:</div>
              <div style="font-weight:600; color:var(--accent-blue); font-size:0.8rem; word-break:break-all;">${osc.email}</div>
              <div style="margin-top:0.35rem;">
                <a href="mailto:${osc.email}" class="btn btn-sm btn-outline" style="font-size:0.75rem; padding:0.25rem 0.6rem;">
                  ✉️ Send Email
                </a>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-primary" onclick="copyOSCDetails(1)">
              📋 Copy All OSC Coordinates
            </button>
            <button class="btn btn-outline" onclick="navigateTo('#support'); closeModal('supportDetailModal'); setTimeout(() => { document.getElementById('oscDirectorySection')?.scrollIntoView({behavior: 'smooth'}); }, 200);">
              View Full Directory
            </button>
          </div>
          <button class="btn btn-outline" onclick="closeModal('supportDetailModal')">Close</button>
        </div>
      </div>
    `;
  } else {
    modalBody.innerHTML = `
      <div style="font-size:0.925rem; line-height:1.6; color:var(--text-secondary);">
        <p style="margin-bottom:1rem;">${service.details}</p>
        <div style="background:var(--bg-surface-subtle); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1.5rem;">
          <h4 style="font-size:0.9rem; margin-bottom:0.25rem;">Official Direct Desk:</h4>
          <p style="font-weight:700; color:var(--primary); font-size:1.1rem;">${service.contact}</p>
        </div>
        <div style="display:flex; gap:0.75rem;">
          <button class="btn btn-emergency" onclick="navigateTo('#helplines'); closeModal('supportDetailModal');">
            Open Emergency Helplines Directory
          </button>
          <button class="btn btn-outline" onclick="closeModal('supportDetailModal')">Close</button>
        </div>
      </div>
    `;
  }

  openModal("supportDetailModal");
};

/* ==========================================================================
   9. HOW IT WORKS ARCHITECTURAL FLOW (/how-it-works)
   ========================================================================== */
function initHowItWorks() {
  const flowContainer = document.getElementById("howItWorksFlowContainer");
  if (flowContainer) {
    flowContainer.innerHTML = window.NAVICA_DATA.ARCHITECTURE_STEPS.map((step, idx) => `
      <div style="position:relative; margin-bottom: 1.5rem;">
        <div class="card" style="border-left: 4px solid var(--accent-blue);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span class="badge badge-info">Step ${step.step}</span>
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${step.sub}</span>
          </div>
          <h3 style="font-size:1.2rem; margin-bottom:0.4rem;">${step.title}</h3>
          <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.6;">${step.desc}</p>
        </div>
        ${idx < window.NAVICA_DATA.ARCHITECTURE_STEPS.length - 1 ? `
          <div style="text-align:center; padding:0.35rem 0; color:var(--accent-blue);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </div>
        ` : ''}
      </div>
    `).join("");
  }
}

/* ==========================================================================
   10. AUTHORITY CONSOLE & CASE EDITOR (/authority)
   ========================================================================== */
let authorityFilterQuery = "";
let authorityStatusFilter = "ALL";

function initAuthorityConsole() {
  const loginForm = document.getElementById("authorityLoginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleAuthorityLogin);
  }

  const fillCredsBtn = document.getElementById("fillDemoAuthorityBtn");
  if (fillCredsBtn) {
    fillCredsBtn.addEventListener("click", () => {
      document.getElementById("authorityEmail").value = window.NAVICA_DATA.DEMO_OFFICER_ID;
      document.getElementById("authorityPin").value = window.NAVICA_DATA.DEMO_OFFICER_PIN;
      showToast("Demo authority credentials filled!", "info");
    });
  }

  const searchInput = document.getElementById("authoritySearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      authorityFilterQuery = e.target.value.toLowerCase().trim();
      renderAuthorityCaseTable();
    });
  }

  const statusSelect = document.getElementById("authorityStatusSelect");
  if (statusSelect) {
    statusSelect.addEventListener("change", (e) => {
      authorityStatusFilter = e.target.value;
      renderAuthorityCaseTable();
    });
  }

  const authSignOutBtn = document.getElementById("authoritySignOutBtn");
  if (authSignOutBtn) {
    authSignOutBtn.addEventListener("click", () => {
      window.navicaStore.clearSession();
      loadAuthorityView();
      showToast("Signed out of Authority Console.", "info");
    });
  }
}

function handleAuthorityLogin(e) {
  e.preventDefault();
  const email = document.getElementById("authorityEmail")?.value.trim();
  const pin = document.getElementById("authorityPin")?.value.trim();

  // Accept demo officer or matching passcode
  if (pin === window.NAVICA_DATA.DEMO_OFFICER_PIN || pin === "123456" || email.includes("authority")) {
    window.navicaStore.setSession({
      role: "authority",
      name: "Officer V. Raman (DLSA Desk)",
      email: email,
      token: "auth_token_" + Date.now()
    });
    showToast("Signed in as Police & Legal Aid Authority Officer", "success");
    loadAuthorityView();
  } else {
    showToast("Invalid credentials. Use authority@navica.demo with passcode NAVICA2026", "emergency");
  }
}

function loadAuthorityView() {
  const session = window.navicaStore.getSession();
  const loginCard = document.getElementById("authorityLoginCard");
  const consoleCard = document.getElementById("authorityPortalContent");

  if (session && session.role === "authority") {
    if (loginCard) loginCard.style.display = "none";
    if (consoleCard) consoleCard.style.display = "block";
    renderAuthorityCaseTable();
  } else {
    if (loginCard) loginCard.style.display = "block";
    if (consoleCard) consoleCard.style.display = "none";
  }
}

function renderAuthorityCaseTable() {
  const tbody = document.getElementById("authorityCasesTbody");
  if (!tbody) return;

  const allCases = window.navicaStore.getAllCases();

  const filtered = allCases.filter(c => {
    if (authorityStatusFilter !== "ALL" && c.currentStage !== authorityStatusFilter) {
      return false;
    }
    if (authorityFilterQuery) {
      const match = (
        c.id.toLowerCase().includes(authorityFilterQuery) ||
        c.caseCode.toLowerCase().includes(authorityFilterQuery) ||
        c.victimName.toLowerCase().includes(authorityFilterQuery) ||
        c.assignedOfficer.toLowerCase().includes(authorityFilterQuery) ||
        c.type.toLowerCase().includes(authorityFilterQuery)
      );
      if (!match) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">
          No cases match your filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td>
        <strong style="font-family:var(--font-mono); color:var(--primary);">${c.id}</strong>
        <div style="font-size:0.75rem; color:var(--text-muted);">${c.caseCode}</div>
      </td>
      <td>
        <strong>${c.victimName}</strong>
        <div style="font-size:0.75rem; color:var(--text-muted);">${c.type}</div>
      </td>
      <td>
        <div>${c.station}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${c.assignedOfficer}</div>
      </td>
      <td>
        <span class="badge ${c.currentStage === 'Judgment' ? 'badge-success' : 'badge-info'}">
          ${c.stageLabel}
        </span>
      </td>
      <td>
        <div style="font-size:0.8rem; font-weight:600;">${c.compensation.status}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">Disbursed: ₹${c.compensation.disbursedAmount.toLocaleString("en-IN")}</div>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="openAuthorityCaseEditor('${c.id}')">
          Edit Case & Compensation
        </button>
      </td>
    </tr>
  `).join("");
}

window.openAuthorityCaseEditor = function(caseId) {
  const c = window.navicaStore.getCaseById(caseId);
  if (!c) return;

  const modal = document.getElementById("caseEditorModal");
  const modalTitle = document.getElementById("caseEditorModalTitle");
  const modalBody = document.getElementById("caseEditorModalBody");
  if (!modal || !modalTitle || !modalBody) return;

  modalTitle.textContent = `Official Case Editor — ${c.id} (${c.victimName})`;
  modalBody.innerHTML = `
    <form id="authorityCaseEditForm" onsubmit="saveCaseEditor(event, '${c.id}')">
      <!-- Stage & Status Details -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
        <div class="form-group">
          <label class="form-label">Current Stage</label>
          <select class="form-select" id="editCurrentStage">
            ${["FIR", "Investigation", "Charge Sheet", "Court Proceedings", "Judgment"].map(st => `
              <option value="${st}" ${c.currentStage === st ? 'selected' : ''}>${st}</option>
            `).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Current Status Heading</label>
          <input type="text" class="form-input" id="editCurrentStatus" value="${escapeHTML(c.currentStatus || (c.currentStage === 'Investigation' ? 'Investigation Process' : c.currentStage + ' in Progress'))}" placeholder="e.g. Investigation Process">
        </div>
      </div>

      <div class="form-group" style="margin-bottom:1rem;">
        <label class="form-label">Brief Description of Investigation/Stage (Displayed under Status heading)</label>
        <textarea class="form-textarea" id="editStageDesc" rows="2" placeholder="Briefly explain what authorities are currently doing in this stage for the victim...">${escapeHTML(c.stageDescription || '')}</textarea>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
        <div class="form-group">
          <label class="form-label">Assigned Officer</label>
          <input type="text" class="form-input" id="editOfficer" value="${escapeHTML(c.assignedOfficer)}">
        </div>
        <div class="form-group">
          <label class="form-label">Police Station / Desk</label>
          <input type="text" class="form-input" id="editStation" value="${escapeHTML(c.station)}">
        </div>
      </div>

      <!-- Official Authority Stage & Investigation Briefing -->
      <div style="background:var(--bg-surface-subtle); padding:1.15rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
          <h4 style="font-size:0.95rem; margin:0; display:flex; align-items:center; gap:6px;">
            <span>👮</span> Authority Stage & Investigation Briefing (Live on Dashboard)
          </h4>
          <span class="badge badge-info" style="font-size:0.7rem;">Live Synchronized</span>
        </div>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.75rem;">
          Provide the official authoritative description of current investigation activities, completed inquiries, forensic dispatches, or judicial status displayed under Case Status.
        </p>

        <div class="form-group" style="margin-bottom:0.75rem;">
          <label class="form-label" for="editAuthorityHeadline">Stage Briefing Headline</label>
          <input type="text" class="form-input" id="editAuthorityHeadline" value="${c.authorityStageUpdate ? escapeHTML(c.authorityStageUpdate.headline) : ''}" placeholder="e.g. Investigation Active — Scene Examination & Forensic Evidence Under Verification" required>
        </div>

        <div class="form-group" style="margin-bottom:0.75rem;">
          <label class="form-label" for="editAuthorityDesc">Detailed Authority Description & Inquiries Conducted</label>
          <textarea class="form-textarea" id="editAuthorityDesc" rows="3" placeholder="Detail the steps taken by the IO/Desk, evidence gathered, forensic dispatches, and next expected step..." required>${c.authorityStageUpdate ? escapeHTML(c.authorityStageUpdate.description) : ''}</textarea>
        </div>

        <div class="form-group" style="margin-bottom:0.75rem;">
          <label class="form-label" for="editAuthorityUpcoming">Upcoming Milestone / Action Notice (Reserved Space)</label>
          <input type="text" class="form-input" id="editAuthorityUpcoming" value="${c.authorityStageUpdate && c.authorityStageUpdate.upcomingActionNotice ? escapeHTML(c.authorityStageUpdate.upcomingActionNotice) : ''}" placeholder="e.g. Next investigative review scheduled for 24 Sep 2026. Reserved space for formal forensic clearance report receipt.">
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:0.75rem;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" for="editAuthorityBadge">Verification Badge Label</label>
            <input type="text" class="form-input" id="editAuthorityBadge" value="${c.authorityStageUpdate ? escapeHTML(c.authorityStageUpdate.badge) : 'Verified Police Dispatch'}">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" for="editAuthorityStation">Reporting Desk / Authority</label>
            <input type="text" class="form-input" id="editAuthorityStation" value="${c.authorityStageUpdate ? escapeHTML(c.authorityStageUpdate.station) : escapeHTML(c.station)}">
          </div>
        </div>

        <!-- Add New Authority Stage Note -->
        <div style="margin-top:0.9rem; padding-top:0.85rem; border-top:1px dashed var(--border-color);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <label class="form-label" style="font-weight:700; color:var(--accent-blue); margin:0;">
              ➕ Post New Authority Stage Note / Dispatch (Optional)
            </label>
            <span style="font-size:0.7rem; color:var(--text-muted);">Appends to live authority feed</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.5rem;">
            <input type="text" class="form-input" id="newAuthNoteTitle" placeholder="Note Title (e.g. Forensic Samples Dispatched to SFSL)">
            <input type="text" class="form-input" id="newAuthNoteOfficer" placeholder="Signing Officer (e.g. SI V. Raman)">
          </div>
          <textarea class="form-textarea" id="newAuthNoteBody" rows="2" placeholder="Official note content (e.g. Physical exhibits and CDR records transferred with chain-of-custody acknowledgment)..."></textarea>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">“What Next?” Guidance for the Victim</label>
        <textarea class="form-textarea" id="editWhatNextMeaning" rows="2" style="margin-bottom:0.5rem;" placeholder="Meaning">${escapeHTML(c.whatNext.meaning)}</textarea>
        <textarea class="form-textarea" id="editWhatNextAction" rows="2" placeholder="Recommended Action">${escapeHTML(c.whatNext.action)}</textarea>
      </div>

      <!-- Compensation Section -->
      <div style="background:var(--bg-surface-subtle); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1.5rem;">
        <h4 style="font-size:0.95rem; margin-bottom:0.75rem;">Compensation Scheme Order (DLSA)</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:0.75rem;">
          <div class="form-group">
            <label class="form-label">Compensation Step</label>
            <select class="form-select" id="editCompStep">
              ${["Application Submitted", "Verification", "Decision / Processing", "Disbursement"].map(cs => `
                <option value="${cs}" ${c.compensation.currentStep === cs ? 'selected' : ''}>${cs}</option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Disbursed Amount (₹)</label>
            <input type="number" class="form-input" id="editCompDisbursed" value="${c.compensation.disbursedAmount}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Compensation Status Note</label>
          <input type="text" class="form-input" id="editCompStatus" value="${escapeHTML(c.compensation.status)}">
        </div>
      </div>

      <!-- Append Milestone -->
      <div style="background:var(--bg-surface-subtle); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1.5rem;">
        <h4 style="font-size:0.95rem; margin-bottom:0.5rem;">Append New Timeline Milestone (Optional)</h4>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.75rem;">Leave empty if no new milestone is being added today.</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:0.5rem;">
          <input type="text" class="form-input" id="newMilestoneTitle" placeholder="e.g. Charge Sheet accepted by Magistrate">
          <input type="text" class="form-input" id="newMilestoneStage" placeholder="Stage e.g. Court Proceedings">
        </div>
        <textarea class="form-textarea" id="newMilestoneDetail" rows="2" placeholder="Factual milestone description..."></textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
        <button type="button" class="btn btn-outline" onclick="closeModal('caseEditorModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">Save & Broadcast Update</button>
      </div>
    </form>
  `;

  openModal("caseEditorModal");
};

window.saveCaseEditor = function(e, caseId) {
  e.preventDefault();
  const c = window.navicaStore.getCaseById(caseId);
  if (!c) return;

  const stage = document.getElementById("editCurrentStage")?.value || c.currentStage;
  const statusHeading = document.getElementById("editCurrentStatus")?.value.trim() || (stage === "Investigation" ? "Investigation Process" : `${stage} in Progress`);
  const stageDesc = document.getElementById("editStageDesc")?.value.trim() || c.stageDescription;
  const officer = document.getElementById("editOfficer")?.value || c.assignedOfficer;
  const station = document.getElementById("editStation")?.value || c.station;
  const meaning = document.getElementById("editWhatNextMeaning")?.value || c.whatNext.meaning;
  const action = document.getElementById("editWhatNextAction")?.value || c.whatNext.action;

  const authHeadline = document.getElementById("editAuthorityHeadline")?.value.trim() || `${statusHeading} — Evidentiary Collection Underway`;
  const authDesc = document.getElementById("editAuthorityDesc")?.value.trim() || "The investigating agency is actively collecting evidence and statements.";
  const authUpcoming = document.getElementById("editAuthorityUpcoming")?.value.trim() || (c.authorityStageUpdate ? c.authorityStageUpdate.upcomingActionNotice : "");
  const authBadge = document.getElementById("editAuthorityBadge")?.value.trim() || "Verified Police Dispatch";
  const authStation = document.getElementById("editAuthorityStation")?.value.trim() || station;
  const nowFormatted = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const compStep = document.getElementById("editCompStep")?.value || c.compensation.currentStep;
  const compDisbursed = Number(document.getElementById("editCompDisbursed")?.value) || 0;
  const compStatus = document.getElementById("editCompStatus")?.value || c.compensation.status;

  const milestoneTitle = document.getElementById("newMilestoneTitle")?.value.trim();
  const milestoneStage = document.getElementById("newMilestoneStage")?.value.trim();
  const milestoneDetail = document.getElementById("newMilestoneDetail")?.value.trim();

  const newNoteTitle = document.getElementById("newAuthNoteTitle")?.value.trim();
  const newNoteOfficer = document.getElementById("newAuthNoteOfficer")?.value.trim();
  const newNoteBody = document.getElementById("newAuthNoteBody")?.value.trim();

  // Apply updates
  c.currentStage = stage;
  c.currentStatus = statusHeading;
  c.stageLabel = statusHeading;
  c.stageDescription = stageDesc;
  c.assignedOfficer = officer;
  c.station = station;
  c.whatNext.meaning = meaning;
  c.whatNext.action = action;

  const existingNotes = (c.authorityStageUpdate && Array.isArray(c.authorityStageUpdate.authorityNotesSpace))
    ? [...c.authorityStageUpdate.authorityNotesSpace]
    : [];

  if (newNoteTitle && newNoteBody) {
    existingNotes.unshift({
      id: "an-" + Date.now(),
      date: `${nowFormatted}`,
      title: newNoteTitle,
      note: newNoteBody,
      officer: newNoteOfficer || officer
    });
  }

  c.authorityStageUpdate = {
    headline: authHeadline,
    description: authDesc,
    officer: officer,
    station: authStation,
    lastUpdated: `${nowFormatted} (Live Dispatch)`,
    badge: authBadge,
    authorityNotesSpace: existingNotes,
    upcomingActionNotice: authUpcoming
  };

  c.compensation.currentStep = compStep;
  c.compensation.disbursedAmount = compDisbursed;
  c.compensation.status = compStatus;

  if (milestoneTitle) {
    const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    c.timeline.push({
      id: "m-" + Date.now(),
      date: today,
      stage: milestoneStage || stage,
      title: milestoneTitle,
      detail: milestoneDetail || "Official entry recorded by Authority Console.",
      state: "active"
    });
  }

  window.navicaStore.updateCase(c);
  showToast(`Case ${c.id} updated! Authority stage briefing and notes reflected live on Case Status.`, "success");
  closeModal("caseEditorModal");
  renderAuthorityCaseTable();
  renderDemoCards();

  const currentSession = window.navicaStore.getSession();
  if (currentSession && currentSession.caseId === c.id) {
    renderDashboard(c);
  }
};

/* ==========================================================================
   11. MODAL HELPERS
   ========================================================================== */
function openModal(id) {
  const el = typeof id === "string" ? document.getElementById(id) : id;
  if (el) {
    el.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}
window.openModal = openModal;

window.closeModal = function(id) {
  const el = typeof id === "string" ? document.getElementById(id) : id;
  if (el) {
    el.classList.remove("open");
  }
  // Check if any other modal is still open before re-enabling scrolling
  const remaining = document.querySelectorAll(".modal-backdrop.open");
  if (remaining.length === 0) {
    document.body.style.overflow = "";
  }
};

function initModalDismissHandlers() {
  // Global backdrop click dismiss: clicking outside modal dialog automatically closes it
  document.addEventListener("click", (e) => {
    if (e.target && e.target.classList && e.target.classList.contains("modal-backdrop")) {
      window.closeModal(e.target);
    }
  });

  // Global Escape key dismiss: pressing Escape closes all active modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop.open").forEach(m => {
        window.closeModal(m);
      });
    }
  });
}

/* ==========================================================================
   12. SVG QR CODE GENERATOR (Standard ISO/IEC 18004 Compliant Matrix)
   ========================================================================== */
function getCaseVerificationURL(caseId) {
  const customHost = localStorage.getItem("navica_network_host");
  if (customHost) {
    const cleanHost = customHost.trim().replace(/\/+$/, "");
    return `${cleanHost}/index.html#dashboard?case=${encodeURIComponent(caseId)}&token=quick_access_${encodeURIComponent(caseId)}`;
  }

  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    const origin = window.location.origin;
    let pathname = window.location.pathname;
    if (!pathname.endsWith(".html") && !pathname.endsWith("/")) {
      pathname += "/";
    }
    return `${origin}${pathname}#dashboard?case=${encodeURIComponent(caseId)}&token=quick_access_${encodeURIComponent(caseId)}`;
  }

  // Fallback for file:/// protocol
  return `http://localhost:8080/index.html#dashboard?case=${encodeURIComponent(caseId)}&token=quick_access_${encodeURIComponent(caseId)}`;
}
window.getCaseVerificationURL = getCaseVerificationURL;

function generateSVGQRCode(data, size = 90) {
  size = parseInt(size, 10) || 90;

  // Resolve payload: if it's a case ID like "VC-2026-00125", encode the verifiable link
  let payload = data;
  if (typeof data === "string" && (data.startsWith("VC-") || data.startsWith("NAV-") || data.startsWith("MTR-"))) {
    payload = getCaseVerificationURL(data);
  }

  if (typeof QRCode !== "undefined") {
    try {
      const dummy = document.createElement("div");
      // Use CorrectLevel.M for optimal scanner compatibility
      const qr = new QRCode(dummy, {
        text: payload,
        width: size,
        height: size,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });

      if (qr && qr._oQRCode) {
        const count = qr._oQRCode.getModuleCount();
        const margin = 4; // ISO standard 4-module quiet zone
        const total = count + margin * 2;
        const cellSize = size / total;

        let pathData = "";
        for (let r = 0; r < count; r++) {
          for (let c = 0; c < count; c++) {
            if (qr._oQRCode.isDark(r, c)) {
              const x = (c + margin) * cellSize;
              const y = (r + margin) * cellSize;
              pathData += `M${x.toFixed(2)},${y.toFixed(2)}h${cellSize.toFixed(2)}v${cellSize.toFixed(2)}h-${cellSize.toFixed(2)}z `;
            }
          }
        }

        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" class="navica-scannable-qr" data-payload="${escapeHTML(payload)}">
            <rect width="${size}" height="${size}" fill="#ffffff" rx="6"/>
            <path d="${pathData}" fill="#0f172a"/>
          </svg>
        `;
      }
    } catch (e) {
      console.error("QRCode SVG generation error:", e);
    }
  }

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#ffffff" rx="6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="10" fill="#64748b">QR Unavailable</text>
    </svg>
  `;
}
window.generateSVGQRCode = generateSVGQRCode;

/* ==========================================================================
   13. QR CODE SCANNER CONTROLLER (Live Camera, Upload, & Decoders)
   ========================================================================== */
let qrMediaStream = null;
let qrScanAnimFrame = null;
let isScanningActive = false;

window.openQRScannerModal = function() {
  const modal = document.getElementById("qrScannerModal");
  if (!modal) return;
  openModal("qrScannerModal");
  switchQRScannerTab("camera");
};

window.closeQRScannerModal = function() {
  stopCameraStream();
  closeModal("qrScannerModal");
};

window.switchQRScannerTab = function(tabName) {
  // Update Tab buttons
  document.querySelectorAll(".qr-scanner-tab-btn").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`qrTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Btn`);
  if (activeBtn) activeBtn.classList.add("active");

  // Show Tab Content
  document.querySelectorAll(".qr-tab-content").forEach(el => el.style.display = "none");
  const activeContent = document.getElementById(`qrScannerTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
  if (activeContent) activeContent.style.display = "block";

  if (tabName === "camera") {
    startCameraStream();
  } else {
    stopCameraStream();
  }
};

let currentCameraFacing = "environment";

async function startCameraStream() {
  const video = document.getElementById("qrScannerVideo");
  const statusMsg = document.getElementById("qrCameraStatusMsg");
  if (!video) return;

  stopCameraStream();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (statusMsg) statusMsg.textContent = "Camera not supported in this browser. Please use 'Upload Image' or 'Demo Cases'.";
    return;
  }

  if (statusMsg) statusMsg.textContent = "Requesting camera access...";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentCameraFacing,
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });

    qrMediaStream = stream;
    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    await video.play();

    if (statusMsg) statusMsg.textContent = "Point camera at physical or digital case QR card";
    isScanningActive = true;
    requestAnimationFrame(scanVideoFrame);
  } catch (err) {
    console.warn("Camera access failed:", err);
    if (statusMsg) {
      statusMsg.textContent = "Camera unavailable or permission denied. Use 'Upload Image' or 'Demo Cases'.";
    }
  }
}

function stopCameraStream() {
  isScanningActive = false;
  if (qrScanAnimFrame) {
    cancelAnimationFrame(qrScanAnimFrame);
    qrScanAnimFrame = null;
  }
  if (qrMediaStream) {
    qrMediaStream.getTracks().forEach(track => track.stop());
    qrMediaStream = null;
  }
  const video = document.getElementById("qrScannerVideo");
  if (video) video.srcObject = null;
}

window.toggleCameraStream = function() {
  currentCameraFacing = currentCameraFacing === "environment" ? "user" : "environment";
  startCameraStream();
};

function scanVideoFrame() {
  if (!isScanningActive) return;

  const video = document.getElementById("qrScannerVideo");
  const canvas = document.getElementById("qrScannerCanvas");
  if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
    qrScanAnimFrame = requestAnimationFrame(scanVideoFrame);
    return;
  }

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (typeof jsQR !== "undefined") {
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      });

      if (code && code.data) {
        console.log("Found QR code via camera:", code.data);
        handleDecodedQR(code.data);
        return;
      }
    } catch (e) {
      console.error("jsQR scan error:", e);
    }
  }

  qrScanAnimFrame = requestAnimationFrame(scanVideoFrame);
}

window.handleQRFileSelected = function(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const preview = document.getElementById("qrUploadPreview");
  const img = document.getElementById("qrUploadImg");
  const status = document.getElementById("qrUploadStatus");
  if (preview) preview.style.display = "block";
  if (status) {
    status.style.color = "var(--text-muted)";
    status.textContent = "Scanning uploaded QR code image...";
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    if (img) img.src = event.target.result;

    const tempImg = new Image();
    tempImg.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = tempImg.width;
      canvas.height = tempImg.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(tempImg, 0, 0);

      if (typeof jsQR !== "undefined") {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          if (status) {
            status.style.color = "#10b981";
            status.textContent = `✓ Decoded: ${code.data}`;
          }
          setTimeout(() => {
            handleDecodedQR(code.data);
          }, 400);
        } else {
          if (status) {
            status.style.color = "#ef4444";
            status.textContent = "Could not detect a valid QR code in this image. Please ensure the QR code is clearly visible and well-lit.";
          }
        }
      } else {
        if (status) status.textContent = "QR decoding library not available.";
      }
    };
    tempImg.src = event.target.result;
  };
  reader.readAsDataURL(file);
};

window.simulateQRScan = function(caseId) {
  playScanBeep();
  handleDecodedQR(`http://localhost:8080/index.html#dashboard?case=${caseId}&token=demo_quick_access`);
};

function playScanBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

function handleDecodedQR(text) {
  if (!text) return;
  text = text.trim();

  let caseId = null;

  // 1. Try URL parameters
  try {
    if (text.includes("case=")) {
      const match = text.match(/[?&#]case=([^&#]+)/);
      if (match) caseId = decodeURIComponent(match[1]);
    } else if (text.includes("caseId=")) {
      const match = text.match(/[?&#]caseId=([^&#]+)/);
      if (match) caseId = decodeURIComponent(match[1]);
    }
  } catch (e) {}

  // 2. Try standard case ID formats
  if (!caseId) {
    const match = text.match(/(VC-\d{4}-\d{5}|NAV-\d{3}|MTR-\d{3})/i);
    if (match) caseId = match[1].toUpperCase();
  }

  // 3. Try registered phone number
  if (!caseId) {
    const phoneMatch = text.match(/(\+?91[\s-]?)?(\d{10})/);
    if (phoneMatch) caseId = phoneMatch[2];
  }

  if (!caseId) {
    showToast(`Decoded: "${text.substring(0, 35)}...", but no registered Case ID recognized.`, "error");
    return;
  }

  const c = window.navicaStore.getCaseById(caseId) || window.navicaStore.getCaseByMobile(caseId);
  if (!c) {
    showToast(`Case ID "${caseId}" decoded from QR code was not found.`, "error");
    return;
  }

  playScanBeep();
  closeQRScannerModal();

  window.navicaStore.setSession({
    role: "victim",
    caseId: c.id,
    name: c.victimName,
    mobile: c.mobile,
    token: "qr_card_scan_" + Date.now()
  });

  showToast(`✅ QR Card Authenticated! Welcome, ${c.victimName} (${c.id})`, "success");
  navigateTo("#dashboard");
  renderDashboard(c);
}
