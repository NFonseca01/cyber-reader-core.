#include <emscripten/emscripten.h>
#include <iostream>

extern "C" {
    EMSCRIPTEN_KEEPALIVE
    int check_kernel_status() {
        return 1;
    }
}

int main() {
    std::cout << "🛡️ Kernel C++ Inicializado" << std::endl;
    return 0;
}
