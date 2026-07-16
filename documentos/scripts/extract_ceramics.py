#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import os

# Leer el archivo de texto extraído
with open(r"C:\Users\NACHO PC\Desktop\temp_extract.txt", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

# Diccionario de colecciones y sus series
collections = {
    "Porcelânico": {
        "series": ["Ardesia C3", "Bali", "Bosco", "Brando", "Calacata", "Calacatta", "Calacatta Gold", 
                   "Caliza Brillo", "Carlotta Silver", "Carrara", "Crema Marfil", "Elvis", "Kaster", 
                   "Keyburn C3", "Land Kaster C3", "Magnum", "Pobla C3", "Polaris", "Provence C3", 
                   "Ritz", "Samario", "Sanit Dark", "Stahl C3", "Technikal C2", "Toledo", "Torcal", 
                   "Tosca", "Travertino", "Urbián"],
        "familia": "Porcelánico"
    },
    "Maderas": {
        "series": ["Alpina", "Atlas", "Bigas", "Curia C3", "Enate", "Forest", "Foresta", "Fusta", 
                   "Legend", "Mogan", "Pinada", "Tablero", "Tea", "Terry"],
        "familia": "Maderas"
    },
    "Revestimiento": {
        "series": ["Brick", "Calacata", "Carrara", "Concrete", "Eden", "Haina", "Irati", "Jaca", 
                   "Kamen", "Keops", "Kite", "Koral", "Kronos", "Legend", "Life", "Masip", "Metro", 
                   "Murano", "Napoli", "Shiman", "Tadan", "Verdi", "Wahkan"],
        "familia": "Revestimiento"
    },
    "Gres": {
        "series": ["Alhambra", "Atrio", "Carrara", "Cotto Provenzal", "Dahino", "Forest", "Foresta", 
                   "Fusta", "Garden", "Hidráulicos", "Inca", "Keops", "Memory C3", "Mijas", "Mulhacán", 
                   "One", "Pinada", "Pizarra", "Star", "Rock", "Ronda", "Silos C3", "Siracusa"],
        "familia": "Pavimento Gres"
    },
    "Blancos": {
        "series": ["Blancos"],
        "familia": "Blancos"
    },
    "Espesorado": {
        "series": ["Canyon", "Pietra", "Tokyo"],
        "familia": "Espesorado"
    }
}

# Mapeo de familias por tipos de productos del PDF
product_type_mapping = {
    "BIIa": "Pavimento Gres Pasta Roja",
    "BIII Roja": "Revestimiento Pasta Roja",
    "BIII Blanca": "Revestimiento Pasta Blanca",
    "BIa Porcelânico": "Porcelánico",
    "BIb Gres": "Pavimento Gres Pasta Estándar",
    "Lámina Cerámica": "Espesorado"
}

# Función para determinar si es Mate o Brillo
def get_acabado_tipo(acabado_str):
    acabado_str = acabado_str.lower()
    if "mate" in acabado_str or "natural" in acabado_str or "relieves" in acabado_str.replace("relieve", "relieves"):
        return "Mate"
    elif "pulido" in acabado_str or "pul" in acabado_str or "brillo" in acabado_str:
        return "Brillo"
    else:
        # Por defecto, SL es mate y RC pulido
        if "rc" in acabado_str:
            return "Brillo"
        else:
            return "Mate"

# Extraer datos de la tabla
rows = []

# Patrón para encontrar líneas de datos
# Buscamos líneas que contengan formato (NxN) seguido de números
pattern = r'(\d+[,\.]\d*x\d+[,\.]\d*|\d+x\d+|X\d+|x\d+)\s+'

# Procesar el texto línea por línea
lines = text.split('\n')

current_product_type = None
current_series = None
current_familia = None

for i, line in enumerate(lines):
    line = line.strip()
    
    # Detectar tipo de producto
    if "BIIa (Gres Pasta Roja" in line:
        current_product_type = "BIIa"
    elif "BIII (Azulejo Pasta Roja" in line:
        current_product_type = "BIII Roja"
    elif "BIII (Azulejo Pasta Blanca" in line:
        current_product_type = "BIII Blanca"
    elif "BIa (Porcelânico" in line:
        current_product_type = "BIa Porcelânico"
    elif "BIb (Gres Pasta Estándar" in line:
        current_product_type = "BIb Gres"
    elif "Lámina Cerámica" in line:
        current_product_type = "Lámina Cerámica"
    
    # Buscar formatos
    if re.match(r'^\d+[,\.]\d*x\d+|^\d+x\d+|^X\d+', line):
        # Es una línea de datos de formato
        parts = line.split()
        if len(parts) >= 7:
            try:
                formato = parts[0]
                acabado_extra = " ".join(parts[1:-6]) if len(parts) > 7 else ""
                piezas = int(parts[-6])
                m2_caja = float(parts[-5].replace(",", "."))
                kg_caja = float(parts[-4].replace(",", "."))
                cajas_palet = int(parts[-3])
                m2_palet = float(parts[-2].replace(",", "."))
                kg_palet = int(parts[-1])
                
                # Normalizar formato
                formato = formato.replace(",", ".").upper()
                
                # Determinar serie y familia basado en el tipo de producto
                if current_product_type:
                    familia_name = product_type_mapping.get(current_product_type, "Desconocido")
                    
                    # Crear entrada
                    acabado_completo = f"{acabado_extra}".strip() if acabado_extra else "Estándar"
                    acabado_tipo = get_acabado_tipo(acabado_completo)
                    
                    row = {
                        "SERIE": "Genérica",
                        "FAMILIA": familia_name,
                        "FORMATO": formato,
                        "ACABADO": f"{acabado_tipo} - {acabado_completo}",
                        "PIEZAS_POR_CAJA": piezas,
                        "m2_POR_CAJA": m2_caja,
                        "KG_POR_CAJA": kg_caja,
                        "CAJAS_POR_PALET": cajas_palet,
                        "m2_POR_PALET": m2_palet,
                        "KG_POR_PALET": kg_palet
                    }
                    rows.append(row)
            except (ValueError, IndexError):
                pass

print(f"Se extrajeron {len(rows)} filas de datos")
if rows:
    print("\nPrimer registro:")
    print(rows[0])
    print(f"\nÚltimo registro:")
    print(rows[-1])

# Guardar como CSV temporal
csv_path = r"C:\Users\NACHO PC\Desktop\ceramics_data.csv"
import csv
with open(csv_path, "w", newline="", encoding="utf-8") as csvfile:
    fieldnames = ["SERIE", "FAMILIA", "FORMATO", "ACABADO", "PIEZAS_POR_CAJA", "m2_POR_CAJA", "KG_POR_CAJA", "CAJAS_POR_PALET", "m2_POR_PALET", "KG_POR_PALET"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"\nArchivo CSV guardado en: {csv_path}")

