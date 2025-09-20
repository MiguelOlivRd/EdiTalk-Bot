
from langchain_openai import OpenAI
import httpx

from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Access them using os.getenv or os.environ
api_url = os.getenv("open_api_base")
key = os.getenv("llm_api_key")

def call_model(full_prompt: str) -> str:
    llm = OpenAI(
        api_key=key, 
        base_url=api_url,
        model="llama-3-3-70b-instruct",
        http_client=httpx.Client(verify=False),
        temperature=0,
        max_tokens=128
    )

    return llm.invoke(full_prompt)