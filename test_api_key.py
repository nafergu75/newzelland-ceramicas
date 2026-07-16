"""Verifica que la API key de Anthropic esta cargada y es valida.

Uso:  python test_api_key.py
"""

import sys
from pathlib import Path

from dotenv import load_dotenv
import os

ENV_FILE = Path(__file__).resolve().parent / ".env-whatsapp"


def main() -> int:
    if not ENV_FILE.exists():
        print(f"[ERROR] No existe el archivo {ENV_FILE}")
        return 1

    # override=True: pisa cualquier ANTHROPIC_API_KEY vieja heredada
    # de otros .env o variables de entorno del sistema
    load_dotenv(ENV_FILE, override=True)

    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip().strip('"')

    if not api_key:
        print("[ERROR] ANTHROPIC_API_KEY no esta definida en .env-whatsapp")
        return 1

    print(f"[OK] Clave cargada desde: {ENV_FILE}")
    print(f"[OK] Formato: {api_key[:15]}...{api_key[-4:]} (longitud {len(api_key)})")

    if not api_key.startswith("sk-ant-"):
        print("[ERROR] La clave no empieza con 'sk-ant-'. Revisa que copiaste solo la clave.")
        return 1

    print("\nProbando llamada minima a la API...")
    try:
        from anthropic import Anthropic
        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=20,
            messages=[{"role": "user", "content": "Di solo: OK"}],
        )
        texto = response.content[0].text.strip()
        # La consola de Windows (cp1252) no soporta emojis: los reemplazamos
        texto = texto.encode(sys.stdout.encoding or "cp1252", errors="replace").decode(
            sys.stdout.encoding or "cp1252"
        )
        print(f"[OK] La API respondio: {texto}")
        print("\n[EXITO] La clave API es VALIDA y funciona correctamente.")
        return 0
    except Exception as e:
        error = str(e)
        if "401" in error or "authentication" in error.lower():
            print("[ERROR] 401: la clave fue rechazada por la API (invalida o revocada).")
            print("        Genera una nueva en https://console.anthropic.com")
        else:
            print(f"[ERROR] Fallo la llamada: {error}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
