#ifndef CYBER_PARSER_HPP
#define CYBER_PARSER_HPP

#include <string>
#include <vector>
#include <memory>

/**
 * Representa un nodo semántico extraído del PDF.
 * Diseñado para ser ligero y fácil de serializar a HTML/EPUB.
 */
enum class BlockType {
    PARAGRAPH,
    HEADING,
    LIST_ITEM,
    IMAGE,
    UNKNOWN
};

struct TextBlock {
    BlockType type;
    std::string content;
    int pageNumber;
    float fontSize;
    bool isBold;
    
    // Constructor optimizado
    TextBlock(BlockType t, std::string c, int p, float s, bool b)
        : type(t), content(std::move(c)), pageNumber(p), fontSize(s), isBold(b) {}
};

/**
 * Clase encargada de la lógica de "Reflow".
 * Transforma las coordenadas fijas del PDF en un flujo lógico.
 */
class CyberParser {
public:
    CyberParser() = default;
    
    // Analiza una línea de texto y determina su rol semántico
    BlockType classifyBlock(float fontSize, bool isBold, const std::string& text);

    // Limpia caracteres no válidos y normaliza el encoding (UTF-8)
    std::string sanitizeContent(const std::string& rawText);

    // Agrupa bloques individuales en estructuras de capítulos para el EPUB
    std::vector<std::string> packIntoChapters(const std::vector<TextBlock>& blocks);

private:
    const float HEADING_THRESHOLD = 14.0f; // Tamaño de fuente para detectar títulos
};

#endif // CYBER_PARSER_HPP