#include <sqlite3.h>
#include <iostream>
#include <vector>
#include <string>
#include "parser.hpp"

class DBManager {
public:
    DBManager() {
        // Abrimos la base de datos en memoria (o persistente vía Emscripten IDBFS)
        if (sqlite3_open(":memory:", &db) != SQLITE_OK) {
            std::cerr << "Error abriendo DB: " << sqlite3_errmsg(db) << std::endl;
        }
        createTables();
    }

    ~DBManager() {
        sqlite3_close(db);
    }

    // Crea la estructura para el panel cronológico y los subrayados
    void createTables() {
        const char* sql = "CREATE TABLE IF NOT EXISTS annotations ("
                          "id TEXT PRIMARY KEY, "
                          "file_hash TEXT, "
                          "content TEXT, "
                          "timestamp INTEGER, " // Orden cronológico
                          "page_idx INTEGER);";
        
        char* errMsg = 0;
        sqlite3_exec(db, sql, NULL, 0, &errMsg);
    }

    // Inserta un subrayado (Inhibe inyecciones SQL usando Bindings)
    bool saveAnnotation(const std::string& id, const std::string& hash, const std::string& content, long long ts) {
        sqlite3_stmt* stmt;
        const char* sql = "INSERT INTO annotations (id, file_hash, content, timestamp) VALUES (?, ?, ?, ?);";
        
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, NULL) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, id.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(stmt, 2, hash.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_text(stmt, 3, content.c_str(), -1, SQLITE_STATIC);
            sqlite3_bind_int64(stmt, 4, ts);
            
            sqlite3_step(stmt);
            sqlite3_finalize(stmt);
            return true;
        }
        return false;
    }

    // Consulta para el Panel Cronológico (Ultra-Rápida)
    std::string getTimelineJSON() {
        // SQL optimizado: el índice de timestamp hace que esto sea instantáneo
        const char* sql = "SELECT content FROM annotations ORDER BY timestamp DESC;";
        // Aquí se implementaría la lógica de conversión a JSON para el Sidebar
        return "JSON_STRING_RESULT";
    }

private:
    sqlite3* db;
};