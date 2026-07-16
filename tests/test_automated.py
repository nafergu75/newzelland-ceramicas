"""Test automatizado - Verifica que el agente responde correctamente"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.brain import generar_respuesta
from agent.memory import inicializar_db, guardar_mensaje, obtener_historial

async def test_agent():
    """Prueba el agente con casos comunes."""
    await inicializar_db()

    test_cases = [
        "Hola, ¿qué tal?",
        "¿Cuáles son vuestros productos?",
        "¿Cuál es el horario de atención?",
        "Quiero agendar una cita",
        "¿Cómo son vuestras políticas de envío?",
    ]

    print("\n" + "=" * 60)
    print("  Test Automatizado - Asesor Newzeland")
    print("=" * 60 + "\n")

    for i, pregunta in enumerate(test_cases, 1):
        historial = await obtener_historial("test-auto")
        respuesta = await generar_respuesta(pregunta, historial)

        print(f"Test {i}:")
        print(f"  [PREGUNTA] {pregunta}")
        print(f"  [RESPUESTA] {respuesta}\n")

        await guardar_mensaje("test-auto", "user", pregunta)
        await guardar_mensaje("test-auto", "assistant", respuesta)

    print("[OK] Test completado exitosamente\n")

if __name__ == "__main__":
    asyncio.run(test_agent())
