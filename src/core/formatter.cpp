#include "parser.hpp"
#include <sstream>
#include <vector>

/**
 * Convierte los bloques de memoria en un documento XHTML fluido.
 */
class CyberFormatter {
public:
    std::string generateXHTML(const std::vector<TextBlock>& blocks) {
        std::stringstream html;
        
        // Header estándar de EPUB/XHTML
        html << "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
        html << "<!DOCTYPE html>\n";
        html << "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n";
        html << "<head><title>Cyber-Reader Export</title></head>\n";
        html << "<body>\n";

        for (const auto& block : blocks) {
            html << wrapInTags(block);
        }

        html << "</body>\n</html>";
        return html.str();
    }

private:
    std::string wrapInTags(const TextBlock& block) {
        std::string openTag, closeTag;
        
        switch (block.type) {
            case BlockType::HEADING:
                openTag = "<h1>"; closeTag = "</h1>\n";
                break;
            case BlockType::LIST_ITEM:
                openTag = "<li>"; closeTag = "</li>\n";
                break;
            case BlockType::PARAGRAPH:
            default:
                openTag = "<p>"; closeTag = "</p>\n";
                break;
        }

        // Si el parser detectó negrita en el PDF, aplicamos el estilo
        std::string content = block.isBold ? "<b>" + block.content + "</b>" : block.content;
        
        return openTag + content + closeTag;
    }
};