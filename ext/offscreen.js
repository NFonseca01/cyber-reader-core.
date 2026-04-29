/**
 * CYBER-READER - Wasm Kernel Host (Offscreen)
 * Versión 1.1.5 - Estabilidad Wasm Garantizada
 */

// Importamos el pegamento generado por Emscripten
import '../build/engine.js';

let isWasmReady = false;
let wasmInstance = null;

/**
 * Inicialización asíncrona del Kernel C++
 */
async function bootKernel() {
    console.log("🧬 [KERNEL] Iniciando secuencia de arranque...");

    try {
        /**
         * En Manifest V3, el objeto 'Module' puede no ser global inmediatamente.
         * Lo buscamos en el scope actual.
         */
        const createModule = (typeof Module !== 'undefined') ? Module : null;

        if (!createModule) {
            throw new Error("Factory 'Module' no detectada. Verifica que engine.js esté en /build/");
        }

        // Instanciación con mapeo de archivos para la extensión
        wasmInstance = await createModule({
            locateFile: (path) => {
                if (path.endsWith('.wasm')) {
                    // Ruta absoluta dentro de la extensión
                    return chrome.runtime.getURL('build/engine.wasm');
                }
                return path;
            },
            print: (text) => console.log(`[C++ STDOUT]: ${text}`),
            printErr: (text) => console.error(`[C++ STDERR]: ${text}`)
        });

        isWasmReady = true;
        console.log("✅ [KERNEL] C++ operativo y memoria lineal asignada.");
        
        // Notificar al sistema que estamos listos
        chrome.runtime.sendMessage({ type: 'ENGINE_READY' });

    } catch (error) {
        console.error("❌ [KERNEL] Error crítico en el arranque:", error);
    }
}

// Ejecutar el arranque al cargar el documento
bootKernel();

/**
 * ESCUCHA DE SEÑALES (BRIDGE)
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'BOOT_ENGINE' || msg.target === 'offscreen') {
        if (isWasmReady) {
            sendResponse({ status: 'ready' });
            // Re-confirmamos por si el popup se abrió después
            chrome.runtime.sendMessage({ type: 'ENGINE_READY' });
        } else {
            sendResponse({ status: 'loading' });
        }
    }
    
    // Mantiene el canal abierto para respuestas asíncronas
    return true; 
});