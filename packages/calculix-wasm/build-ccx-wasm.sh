#!/bin/bash

# CalculiX WebAssembly Build Script
# Compiles CalculiX to WASM using Emscripten

set -e  # Exit on error

echo "═══════════════════════════════════════════════════════════"
echo "  CalculiX WebAssembly Build Script"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check for Emscripten
if ! command -v emcc &> /dev/null; then
    echo "❌ Error: Emscripten not found!"
    echo "Please install: https://emscripten.org/docs/getting_started/downloads.html"
    echo ""
    echo "Quick install:"
    echo "  git clone https://github.com/emscripten-core/emsdk.git ~/emsdk"
    echo "  cd ~/emsdk"
    echo "  ./emsdk install latest"
    echo "  ./emsdk activate latest"
    echo "  source ./emsdk_env.sh"
    exit 1
fi

echo "✅ Emscripten found: $(emcc --version | head -n 1)"
echo ""

# Paths
CCX_SRC="./ccx_2.21/src"
SPOOLES_DIR="./SPOOLES.2.2"
OUTPUT_DIR="./dist"

# Check for source
if [ ! -d "$CCX_SRC" ]; then
    echo "❌ Error: CalculiX source not found at $CCX_SRC"
    echo ""
    echo "Please download:"
    echo "  wget http://www.dhondt.de/ccx_2.21.src.tar.bz2"
    echo "  tar -xvf ccx_2.21.src.tar.bz2"
    exit 1
fi

if [ ! -d "$SPOOLES_DIR" ]; then
    echo "❌ Error: SPOOLES not found at $SPOOLES_DIR"
    echo ""
    echo "Please download:"
    echo "  wget http://www.netlib.org/linalg/spooles/spooles.2.2.tgz"
    echo "  tar -xvf spooles.2.2.tgz"
    echo "  cd SPOOLES.2.2"
    echo "  # Build with emcc..."
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "📦 Collecting source files..."
C_FILES=$(find ${CCX_SRC} -name "*.c" | tr '\n' ' ')
NUM_FILES=$(find ${CCX_SRC} -name "*.c" | wc -l)
echo "   Found $NUM_FILES C files"
echo ""

echo "🔧 Compiling CalculiX to WebAssembly..."
echo "   This may take several minutes..."
echo ""

# Compile with Emscripten
# Note: -s USE_PTHREADS=1 is commented out by default
# Uncomment to enable threading (requires COOP/COEP headers on server)
emcc \
  -O3 \
  -flto \
  -I${SPOOLES_DIR} \
  -s WASM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s INITIAL_MEMORY=134217728 \
  -s MAXIMUM_MEMORY=2147483648 \
  -s STACK_SIZE=5242880 \
  -s EXPORTED_FUNCTIONS='["_main"]' \
  -s EXPORTED_RUNTIME_METHODS='["FS","callMain","cwrap","ccall"]' \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="createCalculiXModule" \
  -s FORCE_FILESYSTEM=1 \
  -s ENVIRONMENT='web,worker' \
  -s ASSERTIONS=0 \
  -s ALLOW_TABLE_GROWTH=1 \
  -s ERROR_ON_UNDEFINED_SYMBOLS=0 \
  -s INCOMING_MODULE_JS_API='["preRun","postRun","print","printErr","onExit","locateFile"]' \
  -DUSE_MT=0 \
  -DARCH=\"Linux\" \
  --pre-js pre.js \
  -o ${OUTPUT_DIR}/calculix.js \
  ${C_FILES} \
  ${SPOOLES_DIR}/libspooles.a

# Uncomment below for pthread build (multi-threaded):
# emcc \
#   -O3 \
#   -flto \
#   -pthread \
#   -I${SPOOLES_DIR} \
#   -s WASM=1 \
#   -s USE_PTHREADS=1 \
#   -s PTHREAD_POOL_SIZE=4 \
#   -s ALLOW_MEMORY_GROWTH=1 \
#   -s INITIAL_MEMORY=134217728 \
#   -s MAXIMUM_MEMORY=2147483648 \
#   -s STACK_SIZE=5242880 \
#   -s EXPORTED_FUNCTIONS='["_main"]' \
#   -s EXPORTED_RUNTIME_METHODS='["FS","callMain","cwrap","ccall"]' \
#   -s MODULARIZE=1 \
#   -s EXPORT_NAME="createCalculiXModule" \
#   -s FORCE_FILESYSTEM=1 \
#   -s ENVIRONMENT='web,worker' \
#   -s ASSERTIONS=0 \
#   -s ALLOW_TABLE_GROWTH=1 \
#   -s ERROR_ON_UNDEFINED_SYMBOLS=0 \
#   -s INCOMING_MODULE_JS_API='["preRun","postRun","print","printErr","onExit","locateFile"]' \
#   -DUSE_MT=1 \
#   -DARCH=\"Linux\" \
#   --pre-js pre.js \
#   -o ${OUTPUT_DIR}/calculix-mt.js \
#   ${C_FILES} \
#   ${SPOOLES_DIR}/libspooles.a

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "Output files:"
    ls -lh ${OUTPUT_DIR}/calculix.{js,wasm}
    echo ""
    
    # Show sizes
    WASM_SIZE=$(du -h ${OUTPUT_DIR}/calculix.wasm | cut -f1)
    JS_SIZE=$(du -h ${OUTPUT_DIR}/calculix.js | cut -f1)
    echo "WASM size: $WASM_SIZE"
    echo "JS size:   $JS_SIZE"
    echo ""
    
    # Compress for production
    echo "🗜️  Compressing for production..."
    if command -v brotli &> /dev/null; then
        brotli -9 -k ${OUTPUT_DIR}/calculix.wasm
        BR_SIZE=$(du -h ${OUTPUT_DIR}/calculix.wasm.br | cut -f1)
        echo "   Brotli: $BR_SIZE (recommended)"
    fi
    
    if command -v gzip &> /dev/null; then
        gzip -9 -k ${OUTPUT_DIR}/calculix.wasm
        GZ_SIZE=$(du -h ${OUTPUT_DIR}/calculix.wasm.gz | cut -f1)
        echo "   Gzip:   $GZ_SIZE"
    fi
    
    echo ""
    echo "📋 Next steps:"
    echo "   1. Copy to frontend: cp ${OUTPUT_DIR}/calculix.{js,wasm} ../frontend/public/wasm/"
    echo "   2. Enable in code:   Set USE_WASM_SOLVER = true in feaStore.ts"
    echo "   3. Test:             npm run dev -w @feai/frontend"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  Build Complete! 🎉"
    echo "═══════════════════════════════════════════════════════════"
else
    echo ""
    echo "❌ Build failed!"
    echo "Check the error messages above."
    exit 1
fi

