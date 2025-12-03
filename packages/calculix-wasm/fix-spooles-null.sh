#!/bin/bash
# Quick fix for SPOOLES IVinit NULL errors
# This patches the specific files showing errors

cd SPOOLES.2.2

# Fix transform.c specifically (lines 294, 456, 617)
if [ -f "transform.c" ]; then
    echo "Patching transform.c..."
    sed -i 's/temp = IVinit(nfront, NULL)/temp = IVinit(nfront, 0)/g' transform.c
    echo "  ✓ Fixed transform.c"
fi

# Find and fix all similar issues in all C files
echo "Scanning all SPOOLES C files for NULL->int issues..."

# Replace IVinit calls with NULL to use 0 instead
find . -name "*.c" -type f -print0 | while IFS= read -r -d '' file; do
    if grep -q "IVinit([^,]*, NULL)" "$file"; then
        echo "  Patching $file..."
        sed -i 's/IVinit(\([^,]*\), NULL)/IVinit(\1, 0)/g' "$file"
    fi
done

# Also fix any other function calls with NULL as int parameter
find . -name "*.c" -type f -print0 | while IFS= read -r -d '' file; do
    # Fix cases where NULL is passed as an integer in various contexts
    if grep -q ", NULL\s*)" "$file" 2>/dev/null; then
        # Be careful - only replace where it's clearly an int parameter
        # This is a heuristic - adjust if needed
        sed -i 's/\(IV[a-zA-Z]*([^,]*, \)NULL\s*)/\10)/g' "$file"
        sed -i 's/\(DV[a-zA-Z]*([^,]*, \)NULL\s*)/\10)/g' "$file"
    fi
done

echo ""
echo "✅ SPOOLES patched!"
echo ""
echo "Now rebuild SPOOLES with:"
echo "  make clean"
echo "  make lib"

