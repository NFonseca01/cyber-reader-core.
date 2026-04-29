import '../build/engine.js'; CyberEngineModule().then(M => { console.log('✅ Motor C++ operativo'); window.engine = new M.CyberEngine(); });
/**
 * CYBER-READER CORE - Wasm Kernel Host
 */
import '../build/engine.js';

let wasmLoaded = false;

// Verificamos el nombre del módulo generado por Emscripten
// Si en tu build.js dice 'var Module = ...', usa Module.
const startWasm = typeof CyberEngineModule !== 'undefined' ? CyberEngineModule : Module;

if (startWasm) {
  startWasm({
    locateFile: (path) => {
      if (path.endsWith('.wasm')) {
        return chrome.runtime.getURL('build/engine.wasm');
      }
      return path;
    }
  }).then((instance) => {
    wasmLoaded = true;
    console.log("🧬 Kernel Wasm instanciado y listo.");
    // Opcional: guardar la instancia para uso futuro
    // window.cyberKernel = new instance.CyberEngine();
  }).catch(err => {
    console.error("❌ Error cargando Wasm:", err);
  });
} else {
  console.error("❌ No se encontró el objeto de inicialización de Emscripten.");
}

// Escuchar el handshake desde el Popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.target === 'offscreen' && msg.type === 'BOOT_ENGINE') {
    const sendAck = () => {
      if (wasmLoaded) {
        chrome.runtime.sendMessage({ type: 'ENGINE_READY' });
      } else {
        // Si el .wasm de 1.5MB sigue cargando, reintentamos en breve
        setTimeout(sendAck, 200);
      }
    };
    sendAck();
  }
});