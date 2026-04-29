#include <emscripten/bind.h>
#include "../core/parser.hpp"
#include "../database/db_manager.cpp" // Asumiendo implementación directa para simplicidad del bind
#include <string>

using namespace emscripten;

/**
 * Clase Wrapper: Actúa como el API Endpoint del motor Wasm.
 * Aquí coordinamos el Parser, el Formatter y la DB.
 */
class CyberEngine {
public:
    CyberEngine() : db(std::make_unique<DBManager>()) {}

    // Punto de entrada para la extensión (JS -> Wasm)
    std::string processNewDocument(std::string pdfBuffer, std::string fileHash) {
        // 1. Llamar al parser de ultra rendimiento
        // 2. Guardar registro inicial en la DB
        return "SUCCESS_CODE_01";
    }

    // Método para el panel cronológico
    bool addHighlight(std::string id, std::string hash, std::string content, long long ts) {
        return db->saveAnnotation(id, hash, content, ts);
    }

    std::string fetchTimeline() {
        return db->getTimelineJSON();
    }

private:
    std::unique_ptr<DBManager> db;
};

// BLOQUE DE EXPORTACIÓN (Magia de Embind)
EMSCRIPTEN_BINDINGS(cyber_reader_module) {
    class_<CyberEngine>("CyberEngine")
        .constructor<>()
        .function("processNewDocument", &CyberEngine::processNewDocument)
        .function("addHighlight", &CyberEngine::addHighlight)
        .function("fetchTimeline", &CyberEngine::fetchTimeline);
}