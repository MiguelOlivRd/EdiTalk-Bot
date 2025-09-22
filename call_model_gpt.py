from openai import OpenAI
import os
from load_dotenv import load_dotenv
load_dotenv()

def call_model(full_prompt: str) -> str:
    client = OpenAI()

    response = client.responses.create(
        model="gpt-5-nano",
        input=full_prompt
    )

    return response.output_text