/**
 * CYBER-READER CORE - UI Controller
 * Gestiona la interacción del Side Panel y la comunicación con el Kernel Wasm.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const btn = document.getElementById('process-btn');
    const statusLabel = document.getElementById('engine-status');
    const logContainer = document.getElementById('console-log');
    const memUsage = document.getElementById('mem-usage');

    /**
     * Escribe un nuevo mensaje en la terminal visual
     */
    const addLog = (text) => {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = `${new Date().toLocaleTimeString().split(' ')[0]} - ${text}`;
        logContainer.appendChild(entry);
        
        // Auto-scroll al final de la terminal
        logContainer.scrollTop = logContainer.scrollHeight;
    };

    /**
     * Listener para el botón principal (BOOT KERNEL)
     */
    btn.addEventListener('click', () => {
        // Deshabilitar botón para evitar múltiples instancias
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";

        addLog("Iniciando secuencia de arranque...");
        addLog("Mapeando memoria lineal para Wasm...");
        
        // Envía señal al Background -> Offscreen
        chrome.runtime.sendMessage({
            target: 'offscreen',
            type: 'BOOT_ENGINE',
            payload: { timestamp: Date.now() }
        });

        addLog("Señal enviada. Esperando ACK del Kernel...");
    });

    /**
     * Escucha respuestas del motor C++ (vía Offscreen/Background)
     */
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'ENGINE_READY') {
            // Actualizar Interfaz a modo OPERATIVO
            statusLabel.innerText = 'OPERATIONAL';
            statusLabel.classList.add('active');
            statusLabel.style.color = "#00ff41";
            statusLabel.style.textShadow = "0 0 10px #00ff41";

            memUsage.innerText = "1.54 MB (ACTIVE)";
            
            addLog("¡ACK recibido! Kernel sincronizado con éxito.");
            addLog("Listo para procesamiento de flujo binario.");
            
            // Re-habilitar botón con nuevo texto si es necesario
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
            btn.innerText = "RE-SCAN DOCUMENT";
        }

        if (message.type === 'ENGINE_ERROR') {
            addLog(`ERROR CRÍTICO: ${message.error}`);
            statusLabel.innerText = 'FAILURE';
            statusLabel.style.color = "#ff3e3e";
        }
    });

    // Log inicial de sistema
    addLog("Terminal de control Cyber-Reader v1.0.2 cargada.");
});