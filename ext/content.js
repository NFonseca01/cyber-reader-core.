/**
 * CYBER-READER - Content Script (The Observer)
 */

console.log("🛡️ [CONTENT] Sistema de observación activado en el documento.");

// Escuchar selecciones de texto
document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText.length > 0) {
        console.log("📑 [CONTENT] Texto capturado para el Notebook.");
        
        // Enviamos la subraya al Background -> Offscreen -> Kernel C++
        chrome.runtime.sendMessage({
            type: 'NEW_HIGHLIGHT',
            payload: selectedText,
            timestamp: Date.now()
        });
    }
});