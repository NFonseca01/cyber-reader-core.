/**
 * CYBER-READER CORE - Orchestrator (Background Service Worker)
 * Maneja el ciclo de vida de la extensión y el ruteo de señales al motor Wasm.
 */

// 1. Configuración al instalar o actualizar
chrome.runtime.onInstalled.addListener(() => {
    console.log("🛡️ Cyber-Reader: Kernel Orchestrator activado.");
    
    // Configura que el panel lateral se abra al hacer clic en el icono de la extensión
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error("Error en SidePanel Behavior:", error));
});

/**
 * Función: ensureOffscreenContext
 * Garantiza que el documento invisible (offscreen) donde reside el Wasm esté cargado.
 */
async function ensureOffscreenContext() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    if (existingContexts.length > 0) {
        return; // El motor ya tiene un host activo
    }

    // Si no existe, creamos el host para el motor C++
    await chrome.offscreen.createDocument({
        url: 'ext/offscreen.html',
        reasons: ['WORKERS'],
        justification: 'Instanciación de motor C++ para procesamiento de PDF de alto rendimiento'
    });
}

/**
 * Message Broker: Escucha y redirige mensajes
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Solo procesamos mensajes dirigidos al motor (target: 'offscreen')
    if (message.target === 'offscreen') {
        
        handleRouting(message);
        
        // Retornamos true para mantener el canal abierto si fuera necesario
        return true; 
    }
});

/**
 * handleRouting: Asegura que el mensaje llegue al destino correcto
 */
async function handleRouting(message) {
    try {
        // Primero nos aseguramos de que el "laboratorio" (offscreen) esté abierto
        await ensureOffscreenContext();
        
        // Reenviamos el mensaje original al contexto del offscreen
        // Se usa un pequeño delay si es el arranque inicial para evitar race conditions
        if (message.type === 'BOOT_ENGINE') {
            setTimeout(() => {
                chrome.runtime.sendMessage(message);
            }, 150); 
        } else {
            chrome.runtime.sendMessage(message);
        }
    } catch (error) {
        console.error("❌ Error en el ruteador del Kernel:", error);
    }
}