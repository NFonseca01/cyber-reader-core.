/**
 * CYBER-READER - Wasm Kernel Host (Offscreen)
 * Versión 1.3.0 - Bridging Ready
 */
import createModule from '../build/engine.js';

let wasmInstance = null;
let isWasmReady = false;

const initKernel = async () => {
    try {
        console.log("🧬 [KERNEL] Inicializando memoria lineal...");
        
        wasmInstance = await createModule({
            locateFile: (path) => {
                if (path.endsWith('.wasm')) {
                    return chrome.runtime.getURL('build/engine.wasm');
                }
                return path;
            }
        });

        isWasmReady = true;
        console.log("✅ [KERNEL] C++ operativo y listo para cómputo.");
        chrome.runtime.sendMessage({ type: 'ENGINE_READY' });

    } catch (e) {
        console.error("❌ [KERNEL] Fallo de instanciación:", e);
    }
};

// Autodisparo
initKernel();

// Escucha de mensajes
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'BOOT_ENGINE') {
        if (isWasmReady) {
            chrome.runtime.sendMessage({ type: 'ENGINE_READY' });
            sendResponse({ status: 'ready' });
        } else {
            initKernel();
            sendResponse({ status: 'booting' });
        }
    }

    // NUEVO: Ejecución de cálculo en el Kernel C++
    if (msg.type === 'EXECUTE_CALC') {
        if (isWasmReady && wasmInstance) {
            try {
                // Invocación nativa: (nombre, retorno, tipos_args, args)
                const result = wasmInstance.ccall(
                    'process_secure_value', 
                    'number', 
                    ['number'], 
                    [msg.payload]
                );
                sendResponse({ success: true, output: result });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
        } else {
            sendResponse({ success: false, error: 'Kernel Offline' });
        }
    }
    return true; 
});