// ext/popup.js - Solo interfaz, nada de Kernel aquí.
document.getElementById('process-btn').addEventListener('click', () => {
    console.log("📡 Solicitando arranque al motor...");
    chrome.runtime.sendMessage({ type: 'BOOT_ENGINE' });
});

// Escuchamos cuando el Offscreen nos diga que está listo
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'ENGINE_READY') {
        const status = document.getElementById('engine-status');
        status.textContent = 'OPERATIONAL';
        status.style.color = '#00ff41'; // Verde neón
        console.log("🟢 Confirmación recibida: Motor en línea.");
    }
});