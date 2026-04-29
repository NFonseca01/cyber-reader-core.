/**
 * CYBER-READER CORE - Orchestrator (Background Service Worker)
 * Este archivo gestiona el ciclo de vida de la extensión y el ruteo de mensajes.
 */

// 1. Configuración inicial al instalar/actualizar
chrome.runtime.onInstalled.addListener(() => {
    console.log("🛡️ Cyber-Reader: Service Worker Activo.");
    
    // Configurar comportamiento del Side Panel (se abre al hacer clic en el icono)
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error("Error configurando SidePanel:", error));
});

/**
 * Función Crítica: Garantiza que el documento Offscreen esté vivo.
 * El Offscreen es el único lugar donde vive el motor C++/Wasm.
 */
async function ensureOffscreenExists() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    if (existingContexts.length > 0) {
        console.log("📡 Contexto Offscreen ya existe.");
        return;
    }

    console.log("🚀 Creando nuevo documento Offscreen...");
    await chrome.offscreen.createDocument({
        url: 'ext/offscreen.html',
        reasons: ['WORKERS'], // Necesario para cargar módulos Wasm
        justification: 'Instanciación de motor C++ para procesamiento de alto rendimiento offline'
    });
}

/**
 * Bus de Mensajería: El puente entre la UI (Popup) y el Motor (Offscreen).
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Si el mensaje tiene como destino el motor (target: 'offscreen')
    if (message.target === 'offscreen') {
        
        // Ejecutamos la lógica de enrutamiento de forma asíncrona
        handleOffscreenRouting(message);
        
        // Retornamos true para indicar que la respuesta será asíncrona
        return true; 
    }
    
    // Aquí puedes añadir otros listeners (ej. guardar datos en storage)
});

/**
 * Asegura el envío del mensaje al motor incluso si el Offscreen estaba dormido.
 */
async function handleOffscreenRouting(message) {
    try {
        await ensureOffscreenExists();
        
        // Pequeño delay para asegurar que el DOM del offscreen cargó el JS
        // Solo necesario en la primera llamada de arranque
        if (message.type === 'BOOT_ENGINE') {
            setTimeout(() => {
                chrome.runtime.sendMessage(message);
            }, 200);
        } else {
            chrome.runtime.sendMessage(message);
        }
    } catch (error) {
        console.error("❌ Error en el ruteador de mensajes:", error);
    }
}