/**
 * CYBER-READER CORE - Service Worker (Background)
 * Responsabilidades: Gestión de ciclo de vida y enrutamiento de mensajes.
 */

// 1. Inicialización del comportamiento de la extensión
chrome.runtime.onInstalled.addListener(() => {
  console.log("🛡️ Cyber Reader Core: Sistema inicializado.");
  
  // Configura el Panel Lateral para que se abra al hacer clic en el icono
  if (chrome.sidePanel) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error("Fallo al configurar SidePanel:", error));
  }
});

// 2. Orquestación del Offscreen Document (Host del motor Wasm)
async function setupOffscreen() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: 'ext/offscreen.html',
    reasons: ['WORKERS'], // Necesario para la carga de módulos Wasm
    justification: 'Instanciación del motor C++ para procesamiento de alta velocidad'
  });
  console.log("🚀 Entorno Offscreen desplegado.");
}

// 3. Activación por clic (Respaldo del SidePanel y arranque del motor)
chrome.action.onClicked.addListener(async () => {
  await setupOffscreen();
});

// 4. Bus de Mensajería (Proxy entre UI y Motor C++)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Enrutamiento: Si el mensaje va dirigido al motor (offscreen)
  if (message.target === 'offscreen') {
    handleOffscreenRouting(message);
  }
  
  // Mantenemos el canal abierto para respuestas asíncronas
  return true; 
});

async function handleOffscreenRouting(message) {
  await setupOffscreen();
  chrome.runtime.sendMessage(message);
}