/**
 * CYBER-READER - Control Panel
 */
const statusLabel = document.getElementById('engine-status');
const bootBtn = document.getElementById('process-btn');

const setStatus = (text, color) => {
    statusLabel.textContent = text;
    statusLabel.style.color = color;
};

// Receptor de confirmación del Kernel
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'ENGINE_READY') {
        setStatus('OPERATIONAL', '#00ff41');
        bootBtn.textContent = 'EXECUTE SECURE CALC';
        bootBtn.style.borderColor = '#00ff41';
        console.log("🟢 [UI] Handshake completado.");
    }
});

// Acción del Botón
bootBtn.addEventListener('click', () => {
    const currentState = statusLabel.textContent;

    if (currentState === 'OFFLINE' || currentState === 'BRIDGE_ERROR') {
        // Fase 1: Despertar el motor
        setStatus('INITIALIZING...', '#f1c40f');
        chrome.runtime.sendMessage({ type: 'BOOT_ENGINE' });
    } 
    else if (currentState === 'OPERATIONAL') {
        // Fase 2: Ejecutar lógica en C++
        const testValue = Math.floor(Math.random() * 100);
        console.log(`📡 [UI] Enviando valor ${testValue} al Kernel...`);

        chrome.runtime.sendMessage({ 
            type: 'EXECUTE_CALC', 
            payload: testValue 
        }, (response) => {
            if (response.success) {
                alert(`🛡️ KERNEL RESPONSE\nEntrada: ${testValue}\nSalida C++: ${response.output}`);
            } else {
                console.error("❌ Error de cálculo:", response.error);
            }
        });
    }
});