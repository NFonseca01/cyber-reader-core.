/**
 * CYBER-READER - Wasm Kernel Host (Offscreen)
 * Versión 1.2.0 - Optimized Bridge
 */
import createModule from '../build/engine.js';

let kernel = null;
let isWasmReady = false;

const initKernel = async () => {
    try {
        console.log("🧬 [KERNEL] Iniciando carga de memoria binaria...");
        
        kernel = await createModule({
            locateFile: (path) => {
                if (path.endsWith('.wasm')) {
                    return chrome.runtime.getURL('build/engine.wasm');
                }
                return path;
            }
        });

        isWasmReady = true;
        console.log("✅ [KERNEL] C++ instanciado y operativo.");
        
        // Avisar a la UI que el motor está caliente
        chrome.runtime.sendMessage({ type: 'ENGINE_READY' });

    } catch (e) {
        console.error("❌ [KERNEL] Error crítico de instanciación:", e);
    }
};

// Autodisparo al cargar el documento
initKernel();

/**
 * RECEPTOR DE SEÑALES
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("📩 [OFFSCREEN] Señal recibida:", msg.type);

    if (msg.type === 'BOOT_ENGINE') {
        if (isWasmReady) {
            chrome.runtime.sendMessage({ type: 'ENGINE_READY' });
            sendResponse({ status: 'already_running' });
        } else {
            initKernel();
            sendResponse({ status: 'initializing' });
        }
    }
    return true; 
});