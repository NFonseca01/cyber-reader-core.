document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('process-btn');
    const statusLabel = document.getElementById('engine-status');
    const log = document.getElementById('console-log');

    const addLog = (text) => {
        const div = document.createElement('div');
        div.textContent = `> ${text}`;
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
    };

    btn.addEventListener('click', () => {
        btn.disabled = true;
        addLog("Iniciando secuencia de arranque...");
        
        // Enviar señal al Service Worker
        chrome.runtime.sendMessage({
            target: 'offscreen',
            type: 'BOOT_ENGINE'
        });
    });

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'ENGINE_READY') {
            statusLabel.innerText = 'OPERATIONAL';
            statusLabel.classList.add('active');
            addLog("ACK recibido: Kernel C++ en línea.");
            btn.innerText = "READY";
        }
    });
});