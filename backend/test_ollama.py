import asyncio
import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.environ["OLLAMA_URL"].rstrip("/")
OLLAMA_URL = f"{OLLAMA_BASE_URL}/api/generate"
TAGS_URL = f"{OLLAMA_BASE_URL}/api/tags"
MODEL_NAME = "llama3.2:3b"

async def test_ollama():
    print("=" * 60)
    print("Testing Ollama Connection")
    print("=" * 60)
    
    # Test 1: Check available models
    print("\n1. Checking available models...")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(TAGS_URL)
            response.raise_for_status()
            tags = response.json()
            models = [model['name'] for model in tags.get('models', [])]
            print(f"   ✓ Available models: {models}")
            
            if not models:
                print("   ⚠ No models installed!")
            elif MODEL_NAME not in models:
                print(f"   ⚠ Model '{MODEL_NAME}' not installed!")
                print(f"   → Install it with: ollama pull {MODEL_NAME}")
    except Exception as e:
        print(f"   ✗ Error checking models: {e}")
        return
    
    # Test 2: Try a simple prompt
    print(f"\n2. Testing generation with model '{MODEL_NAME}'...")
    try:
        payload = {
            "model": MODEL_NAME,
            "prompt": "What is 2 + 2? Answer with just the number.",
            "stream": False,
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            result = response.json()
            
            generated_text = result.get("response", "")
            print(f"   ✓ Response received: {generated_text.strip()}")
            
    except Exception as e:
        print(f"   ✗ Error generating: {e}")
        return
    
    print("\n" + "=" * 60)
    print("✓ All tests passed! Ollama is working correctly.")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_ollama())
