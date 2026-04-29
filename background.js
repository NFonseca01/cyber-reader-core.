/**
 * CYBER-READER CORE - Background Service Worker (MV3)
 * Gestiona la persistencia, el panel lateral y el ciclo de vida del motor.
 */

// 1. Inicialización al instalar/actualizar
chrome.runtime.onInstalled.addListener(() => {
  console.log("Cyber-Reader Core: Sistema Operativo. Estado: Nominal.");
  
  // Configurar el panel lateral para que se abra al hacer clic en el icono
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Error en SidePanel Config:", error));
});

// 2. Gestión de Comunicación (Messaging Hub)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  // Caso A: Guardar marcador de última página (Persistence Layer)
  if (message.type === "SAVE_MARKER") {
    const { fileHash, lastPage } = message.payload;
    chrome.storage.local.set({ [`marker_${fileHash}`]: lastPage }, () => {
      sendResponse({ status: "success", timestamp: Date.now() });
    });
    return true; // Mantiene el canal abierto para respuesta asíncrona
  }

  // Caso B: Recuperar subrayados (Query a la DB Local)
  if (message.type === "GET_ANNOTATIONS") {
    chrome.storage.local.get(null, (items) => {
      // Filtrar solo los objetos que sean subrayados (prefijo 'note_')
      const timeline = Object.keys(items)
        .filter(key => key.startsWith('note_'))
        .map(key => items[key])
        .sort((a, b) => b.createdAt - a.createdAt); // Orden cronológico inverso
      
      sendResponse({ payload: timeline });
    });
    return true;
  }

  // Caso C: Despertar al motor de conversión (Offscreen Document)
  if (message.type === "START_CONVERSION") {
    handleConversion(message.payload);
  }
});

/**
 * Función para manejar tareas pesadas (C++/Wasm) fuera del Service Worker.
 * En MV3, el procesamiento de archivos se delega a un Offscreen Document 
 * para asegurar el ultra rendimiento sin bloquear el navegador.
 */
async function handleConversion(data) {
  // Crear el documento invisible si no existe
  if (!(await chrome.offscreen.hasDocument?.())) {
    await chrome.offscreen.createDocument({
      url: 'ext/offscreen.html',
      reasons: ['EXTERNAL_EVAL'], // Para cargar y ejecutar Wasm
      justification: 'Conversión de PDF a EPUB mediante motor C++ Wasm'
    });
  }
  
  // Enviar el buffer del PDF al motor
  chrome.runtime.sendMessage({
    target: 'offscreen',
    type: 'PROCESS_BINARY',
    payload: data
  });
}