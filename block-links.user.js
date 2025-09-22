// ==UserScript==
// @name         BLOCK Multi-Mode
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Bloquea URLs, paths y hash específicos
// @author       criptogenico
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @updateURL    https://cdn.jsdelivr.net/gh/criptogenico/TAMPERMONKEY@main/block-links.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/criptogenico/TAMPERMONKEY@main/block-links.user.js
// ==/UserScript==

(function() {
'use strict';

// ========== LISTA DE BLOQUEOS ==========
const URLS_COMPLETAS = `
https://app.lecturio.com/account
https://www.osmosis.org/account/profile
https://www.osmosis.org/account/billing
https://www.osmosis.org/account/settings?index=settings
https://www.boardsbeyond.com/profile
https://www.boardsbeyond.com/my-subscription
https://www.boardsbeyond.com/payment-history
https://www.uptodate.com/account/consolidate-accounts
https://next.amboss.com/us/account/career
https://next.amboss.com/us/account/settings
https://next.amboss.com/us/access-overview
https://next.amboss.com/us/payment-info
https://next.amboss.com/us/invoices
https://next.amboss.com/us/add-access-code
https://next.amboss.com/us/campuslicense/add
https://www.osmosis.org/account/settings
https://www.canva.com/settings/your-account
https://grok.com/?_s=account
https://grok.com/?_s=data
https://grok.com/?_s=billing
https://sider.ai/es/my
https://www.visualdx.com/visualdx/app/change-password
https://www.visualdx.com/visualdx/app/profile
`.trim();

const SOLO_PATHS = `
/
`.trim();

const SOLO_HASH = `
#!/settings
#!/login
#!/account
#!/remote-access
#!/change-password
`.trim();

// Configuración
const MODO = 'redirect';
const DESTINO = 'about:blank';

// Parsear listas
const urls = URLS_COMPLETAS.split('\n').map(s=>s.trim()).filter(Boolean);
const paths = SOLO_PATHS.split('\n').map(s=>s.trim()).filter(Boolean);
const hashes = SOLO_HASH.split('\n').map(s=>s.trim()).filter(Boolean);

function isBlocked() {
  const currentURL = location.href;
  const currentPath = location.pathname;
  const currentHash = location.hash;
  
  // 1. Verificar URLs completas
  for(const url of urls) {
    if(currentURL.startsWith(url)) return true;
  }
  
  // 2. Verificar paths
  for(const path of paths) {
    if(currentPath === path || currentPath.startsWith(path + '/')) return true;
  }
  
  // 3. Verificar hash
  for(const hash of hashes) {
    if(currentHash === hash) return true;
  }
  
  // 4. Caso especial ClinicalKey remote-access
  if(currentURL.includes('clinicalkey.es') && currentHash === '#!/remote-access') {
    return true;
  }
  
  return false;
}

function block() {
  if(MODO === 'redirect') {
    location.replace(DESTINO);
  } else {
    document.documentElement.innerHTML = '';
  }
}

// Verificación inicial
if(isBlocked()) { block(); return; }

// Interceptar cambios de hash
window.addEventListener('hashchange', () => {
  if(isBlocked()) block();
});

// Interceptar History API
const push = history.pushState;
history.pushState = function() {
  push.apply(history, arguments);
  if(isBlocked()) block();
};

const replace = history.replaceState;
history.replaceState = function() {
  replace.apply(history, arguments);
  if(isBlocked()) block();
};

// Verificación periódica
setInterval(() => {
  if(isBlocked()) block();
}, 200);

})();
