# Building CalculiX for WebAssembly

This directory contains the build scripts and configuration for compiling CalculiX to WebAssembly.

## Prerequisites

```bash
# Install Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

## Build Process

### 1. Get CalculiX Source

```bash
cd packages/calculix-wasm
wget http://www.dhondt.de/ccx_2.21.src.tar.bz2
tar -xvf ccx_2.21.src.tar.bz2
```

### 2. Prepare Dependencies

CalculiX requires:
- **SPOOLES** (sparse solver, C) - Can compile with Emscripten
- **BLAS/LAPACK** (linear algebra, Fortran) - Use CBLAS or f2c conversion
- **ARPACK** (optional, eigenvalue solver)

#### Option A: Use f2c to Convert Fortran to C

```bash
# Install f2c
sudo apt-get install f2c

# Convert Fortran files
cd ccx_2.21/src
for f in *.f; do
  f2c -a "$f"
done
```

#### Option B: Use Pre-compiled BLAS/LAPACK for WASM

We'll use a minimal CBLAS implementation that's already C-based.

### 3. Build SPOOLES for WASM

```bash
# Get SPOOLES
wget http://www.netlib.org/linalg/spooles/spooles.2.2.tgz
tar -xvf spooles.2.2.tgz
cd SPOOLES.2.2

# Compile with Emscripten
emcc -O2 -c *.c -I.
emar rcs libspooles.a *.o
```

### 4. Compile CalculiX to WASM

```bash
#!/bin/bash
# build-ccx-wasm.sh

source ~/emsdk/emsdk_env.sh

# Set paths
CCX_SRC="./ccx_2.21/src"
SPOOLES_DIR="./SPOOLES.2.2"
BLAS_DIR="./cblas"

# Compile all C files (converted from Fortran + original C)
emcc -O2 \
  -I${SPOOLES_DIR} \
  -I${BLAS_DIR} \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MAXIMUM_MEMORY=2GB \
  -s EXPORTED_FUNCTIONS='["_main","_malloc","_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["FS","callMain","cwrap","ccall"]' \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="createCalculiXModule" \
  -s FORCE_FILESYSTEM=1 \
  -s ASSERTIONS=1 \
  -s ALLOW_TABLE_GROWTH=1 \
  -s ENVIRONMENT='web,worker' \
  -DUSE_MT=0 \
  --pre-js pre.js \
  -o calculix.js \
  ${CCX_SRC}/*.c \
  ${SPOOLES_DIR}/libspooles.a \
  ${BLAS_DIR}/libblas.a

echo "CalculiX WASM build complete!"
echo "Output: calculix.js, calculix.wasm"
```

### 5. Pre-JS Configuration

Create `pre.js` to set up the module:

```javascript
Module['preRun'] = function() {
  // Create working directory
  FS.mkdir('/work');
  FS.chdir('/work');
};

Module['print'] = function(text) {
  if (self.postMessage) {
    self.postMessage({ type: 'stdout', text: text });
  } else {
    console.log(text);
  }
};

Module['printErr'] = function(text) {
  if (self.postMessage) {
    self.postMessage({ type: 'stderr', text: text });
  } else {
    console.error(text);
  }
};
```

## Simplified Build (Using Pre-built WASM)

If compilation is too complex, we can use a pre-built CalculiX WASM binary:

```bash
# Download pre-built (if available)
wget https://github.com/example/calculix-wasm/releases/download/v2.21/calculix.wasm
wget https://github.com/example/calculix-wasm/releases/download/v2.21/calculix.js
```

## Testing the Build

```bash
node test-wasm.js
```

## Integration

The built `calculix.js` and `calculix.wasm` files should be placed in:
```
packages/frontend/public/wasm/
```

They will be loaded by the TypeScript wrapper at runtime.

## File Size Optimization

The WASM binary can be large (~5-10MB). Optimize:

```bash
# Use -O3 and link-time optimization
emcc -O3 -flto ...

# Enable WASM optimization
wasm-opt -O3 calculix.wasm -o calculix-opt.wasm

# Compress with Brotli for serving
brotli -9 calculix-opt.wasm
```

Serve with proper MIME types and compression in production.

## Troubleshooting

### Issue: Fortran code won't compile

**Solution**: Use f2c to convert all Fortran to C first.

### Issue: Missing BLAS/LAPACK functions

**Solution**: Include a minimal BLAS implementation or stub unused functions.

### Issue: Out of memory during compile

**Solution**: Compile in smaller chunks and link at the end.

### Issue: Runtime errors about missing symbols

**Solution**: Check EXPORTED_FUNCTIONS and ensure all required symbols are exported.

## Alternative: Simplified Solver

For MVP, consider implementing a simplified FEA solver in TypeScript:
- Linear static analysis only
- Small meshes (<1000 nodes)
- Direct solver (no iterative methods)

This avoids WASM complexity while proving the concept.

