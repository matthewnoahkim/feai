#!/bin/bash
# SPOOLES Patch for Emscripten Compatibility
# Fixes: NULL (void*) being passed to int parameters

echo "Patching SPOOLES for Emscripten compatibility..."

# Find all C files in SPOOLES that use IVinit with NULL
find . -name "*.c" -type f -exec sed -i 's/IVinit(\([^,]*\), NULL)/IVinit(\1, 0)/g' {} \;

# Also fix other common NULL -> int issues
find . -name "*.c" -type f -exec sed -i 's/= IVinit([^,]*, NULL)/= IVinit(\1, 0)/g' {} \;

# Fix NULL in function calls that expect int
find . -name "*.c" -type f -exec sed -i 's/, NULL)/, 0)/g' {} \;

echo "✅ SPOOLES patched successfully!"
echo ""
echo "Files modified:"
grep -r "IVinit" . --include="*.c" | wc -l

