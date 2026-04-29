/**
 * CYBER-READER - UI Controller
 */
const statusLabel = document.getElementById('engine-status');
const bootBtn = document.getElementById('process-btn');

// Función para actualizar la UI
const setStatus = (text, color) => {
    statusLabel.textContent = text;
    statusLabel.style.color = color;
};

// Escuchar mensajes del Kernel
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'ENGINE_READY') {
        console.log("🟢 UI: Kernel detectado.");
        setStatus('OPERATIONAL', '#00ff41');
        bootBtn.style.borderColor = '#00ff41';
        bootBtn.textContent = 'SYSTEM ONLINE';
    }
});

// Evento de clic para despertar el motor
bootBtn.addEventListener('click', () => {
    console.log("📡 UI: Solicitando acceso al Kernel...");
    setStatus('INITIALIZING...', '#f1c40f');

    chrome.runtime.sendMessage({ type: 'BOOT_ENGINE' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("❌ UI: Error de puente:", chrome.runtime.lastError);
            setStatus('BRIDGE_ERROR', '#ff4b2b');
        } else {
            console.log("🛰️ UI: Respuesta del puente:", response.status);
        }
    });
});