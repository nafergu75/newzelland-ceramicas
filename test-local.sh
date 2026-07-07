#!/bin/bash

echo "========================================="
echo "FASE 3: Testing Local Setup"
echo "========================================="
echo ""

# Test 1: Verificar estructura
echo "✓ Test 1: Verificando estructura de carpetas..."
if [ -d "backend/api" ] && [ -d "frontend/dist" ] && [ -f "vercel.json" ]; then
    echo "  ✓ Estructura correcta"
else
    echo "  ✗ Estructura incorrecta"
    exit 1
fi

# Test 2: Verificar backend API index.js
echo ""
echo "✓ Test 2: Verificando backend/api/index.js..."
if grep -q "module.exports = app" backend/api/index.js; then
    echo "  ✓ Backend exports correctly for Vercel"
else
    echo "  ✗ Backend export error"
    exit 1
fi

# Test 3: Verificar frontend dist
echo ""
echo "✓ Test 3: Verificando frontend dist..."
if [ -f "frontend/dist/index.html" ] && [ -d "frontend/dist/assets" ]; then
    echo "  ✓ Frontend built successfully"
else
    echo "  ✗ Frontend build error"
    exit 1
fi

# Test 4: Verificar vercel.json
echo ""
echo "✓ Test 4: Verificando vercel.json..."
if grep -q "\"buildCommand\"" vercel.json && grep -q "\"routes\"" vercel.json; then
    echo "  ✓ vercel.json properly configured"
else
    echo "  ✗ vercel.json error"
    exit 1
fi

# Test 5: Verificar archivos de configuración
echo ""
echo "✓ Test 5: Verificando archivos de configuración..."
if [ -f "backend/.env.example" ] && [ -f "frontend/.env.example" ] && [ -f ".env.production" ]; then
    echo "  ✓ Env files properly configured"
else
    echo "  ✗ Env files error"
    exit 1
fi

# Test 6: Documentación
echo ""
echo "✓ Test 6: Verificando documentación..."
if [ -f "DEPLOYMENT-PLAN.md" ] && [ -f "DATABASE-SETUP.md" ] && [ -f "VERCEL-ENV-SETUP.md" ]; then
    echo "  ✓ Documentation complete"
else
    echo "  ✗ Documentation missing"
    exit 1
fi

echo ""
echo "========================================="
echo "✓ All local tests passed!"
echo "========================================="
echo ""
echo "Status: Ready for FASE 4 (Deploy to Vercel)"
echo ""
echo "Next steps:"
echo "1. Install Vercel CLI: npm i -g vercel"
echo "2. Login: vercel login"
echo "3. Deploy: vercel --prod"
echo "4. Configure environment variables in Vercel Dashboard"
echo ""
