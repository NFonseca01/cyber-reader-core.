/**
 * CYBER-READER CORE - Orchestrator v1.0.8
 * Ubicación: /cyber-reader/background.js
 */

console.log("🚀 [Kernel] background.js inicializado correctamente.");

// 1. CONFIGURACIÓN DEL COMPORTAMIENTO DEL PANEL LATERAL
// Esto le dice a Chrome que al hacer clic en el icono, debe abrir el Side Panel.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("❌ [Kernel] Error configurando SidePanel:", error));

// 2. DISPARADOR DE RESPALDO (Fail-safe)
// Si el comportamiento por defecto falla, este listener fuerza la apertura.
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId }).catch((err) => {
    console.error("❌ [Kernel] Error al forzar apertura de panel:", err);
  });
});

/**
 * Función: ensureOffscreen
 * Garantiza que el host invisible para el motor Wasm esté activo.
 */
async function ensureOffscreen() {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (contexts.length > 0) {
    console.log("🛰️ [Kernel] Contexto Offscreen ya activo.");
    return;
  }

  console.log("🛠️ [Kernel] Creando nuevo documento Offscreen...");
  await chrome.offscreen.createDocument({
    url: 'ext/offscreen.html',
    reasons: ['WORKERS'],
    justification: 'Ejecución de motor C++ en entorno aislado'
  });
}

/**
 * ESCUCHA DE MENSAJES (Bridge)
 * Canaliza las señales desde el Popup hacia el Kernel Wasm.
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Verificamos si el mensaje va dirigido al motor
  if (msg.target === 'offscreen') {
    ensureOffscreen()
      .then(() => {
        // Pequeño retardo de sincronización para asegurar que el DOM del offscreen esté listo
        setTimeout(() => {
          chrome.runtime.sendMessage(msg);
          console.log(`📡 [Kernel] Señal ${msg.type} enviada al motor.`);
        }, 200);
      })
      .catch((err) => console.error("❌ [Kernel] Error en el ruteo:", err));
    
    return true; // Mantiene el canal de comunicación abierto para respuestas asíncronas
  }
});