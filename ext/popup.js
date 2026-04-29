/**
 * CYBER-READER - Wasm Kernel Host (Offscreen)
 * Versión 1.0.9 - Handshake Robusto
 */
import '../build/engine.js';

let isWasmReady = false;
let wasmInstance = null;

/**
 * Inicialización del Módulo Wasm
 * Emscripten genera una función global llamada 'Module' (o el nombre definido en el build).
 */
const initKernel = async () => {
    try {
        console.log("🧬 Iniciando carga de memoria lineal Wasm...");
        
        // El objeto Module es una promesa devuelta por el pegamento de Emscripten
        wasmInstance = await Module({
            locateFile: (path) => {
                // Redirigir la búsqueda del .wasm a la ruta de la extensión
                if (path.endsWith('.wasm')) {
                    return chrome.runtime.getURL('build/engine.wasm');
                }
                return path;
            }
        });

        isWasmReady = true;
        console.log("✅ Kernel C++ instanciado y operativo.");
    } catch (e) {
        console.error("❌ Error crítico en la carga del Kernel:", e);
    }
};

// Disparar la inicialización inmediatamente al cargar el documento
initKernel();

/**
 * RECEPTOR DE SEÑALES (Bridge)
 * Escucha las peticiones del Popup y responde con el estado del Kernel.
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // Solo respondemos si el mensaje es para nosotros
    if (msg.target === 'offscreen' || msg.type === 'BOOT_ENGINE') {
        
        if (isWasmReady) {
            // Si el kernel ya está listo, respondemos inmediatamente
            sendResponse({ status: 'ready' });
            chrome.runtime.sendMessage({ type: 'ENGINE_READY' });
        } else {
            // Si aún está cargando el binario de 1.5MB, notificamos el estado
            sendResponse({ status: 'loading' });

            // Iniciamos un monitoreo interno para avisar cuando termine
            const monitor = setInterval(() => {
                if (isWasmReady) {
                    chrome.runtime.sendMessage({ type: 'ENGINE_READY' });
                    clearInterval(monitor);
                }
            }, 150);
        }
    }
    
    // CRÍTICO: Retornar true para mantener el canal abierto y evitar 
    // el error "message channel closed before a response was received"
    return true; 
});