# Script para crear la base de datos PostgreSQL en Windows

# Conectar a PostgreSQL con credenciales por defecto
$env:PGPASSWORD = "postgres"

# Crear la base de datos
psql -U postgres -h localhost -c "CREATE DATABASE ecommerce_db;" 2>&1

# Mostrar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Base de datos creada exitosamente"
} else {
    Write-Host "✗ Error al crear base de datos (puede ya existir)"
}
