"""Cerebro del agente - AgentKit"""

import os
import yaml
import logging
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("agentkit")

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def cargar_system_prompt() -> str:
    """Lee el system prompt desde config/prompts.yaml."""
    try:
        with open("config/prompts.yaml", "r", encoding="utf-8") as f:
            config = yaml.safe_load(f) or {}
            return config.get("system_prompt", "Eres un asistente útil.")
    except FileNotFoundError:
        logger.error("config/prompts.yaml no encontrado")
        return "Eres un asistente útil."


async def generar_respuesta(mensaje: str, historial: list[dict]) -> str:
    """Genera una respuesta usando Claude API."""
    if not mensaje or len(mensaje.strip()) < 2:
        return "Disculpa, no he entendido bien tu mensaje. ¿Podrías reformularlo?"

    system_prompt = cargar_system_prompt()
    mensajes = historial + [{"role": "user", "content": mensaje}]

    try:
        response = await client.messages.create(
            model="claude-opus-4-1-20250805",
            max_tokens=1024,
            system=system_prompt,
            messages=mensajes
        )
        respuesta = response.content[0].text
        return respuesta
    except Exception as e:
        logger.error(f"Error Claude API: {e}")
        return "Estoy teniendo problemas técnicos temporales. Por favor, intenta de nuevo en unos minutos."
