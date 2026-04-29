/**
 * CYBER-READER CORE - Orchestrator
 */

async function ensureOffscreen() {
  const contexts = await chrome.runtime.getContexts({ 
    contextTypes: ['OFFSCREEN_DOCUMENT'] 
  });
  
  if (contexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: 'ext/offscreen.html',
    reasons: ['WORKERS'],
    justification: 'Ejecución de motor C++ para procesamiento offline'
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.target === 'offscreen') {
    ensureOffscreen().then(() => {
      // Pequeño delay para asegurar que el DOM del offscreen cargó el JS
      setTimeout(() => { 
        chrome.runtime.sendMessage(msg); 
      }, 150);
    });
    return true; // Mantiene el canal abierto
  }
});