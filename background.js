/**
 * CYBER-READER - Service Worker (Command Center)
 * Versión 2.0.0 - Notebook & PDF Detection Logic
 */

const OFFSCREEN_PATH = 'ext/offscreen.html';

/**
 * Orquestación del Documento Offscreen
 */
async function ensureOffscreen() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    if (existingContexts.length > 0) return;

    try {
        await chrome.offscreen.createDocument({
            url: OFFSCREEN_PATH,
            reasons: ['WORKERS'], 
            justification: 'Procesamiento de Kernel C++ para Notebook y conversión de archivos.'
        });
        console.log("🛡️ [SW] Nodo de cómputo Offscreen desplegado.");
    } catch (error) {
        console.error("❌ [SW] Error en despliegue Offscreen:", error);
    }
}

/**
 * Detector de PDF en la Pestaña Activa
 * Escanea si la URL corresponde a un documento analizable.
 */
async function checkCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const isPDF = tab.url.toLowerCase().endsWith('.pdf') || 
                  tab.url.includes('chrome-extension://') ||
                  tab.url.startsWith('blob:');

    // Guardamos el estado en el almacenamiento local para que el Popup lo lea
    await chrome.storage.local.set({ 
        'is_pdf_active': isPDF,
        'current_tab_id': tab.id,
        'current_url': tab.url 
    });

    if (isPDF) {
        console.log("📄 [SW] Documento PDF identificado. Sistema de conversión listo.");
    }
}

/**
 * Listeners de Eventos de Navegación
 */
chrome.tabs.onActivated.addListener(checkCurrentTab);
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') checkCurrentTab();
});

/**
 * Central de Mensajería (IPC Bridge)
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // Comando para inicializar motor
    if (msg.type === 'BOOT_ENGINE') {
        ensureOffscreen()
            .then(() => sendResponse({ status: 'bridge_ok' }))
            .catch(err => sendResponse({ status: 'error', msg: err.message }));
        return true;
    }

    // Comando para iniciar conversión a EPUB/Notebook
    if (msg.type === 'INIT_CONVERSION') {
        console.log("🔄 [SW] Iniciando secuencia de conversión para copia de estudio...");
        // Aquí el SW coordina con Offscreen para pasar el PDF al Kernel
        chrome.runtime.sendMessage({ type: 'PROCESS_PDF_TO_NOTEBOOK', url: msg.url });
        sendResponse({ status: 'processing' });
    }

    // Reporte de Salud del Kernel
    if (msg.type === 'ENGINE_READY') {
        console.log("✅ [SW] Kernel C++ reportado como OPERATIONAL.");
    }
});

// Inicialización al instalar
chrome.runtime.onInstalled.addListener(() => {
    console.log("🚀 CYBER-READER V2: Notebook Engine Instalado.");
    checkCurrentTab();
});