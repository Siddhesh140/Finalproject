
import os
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai

# Load env vars
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
print(f"API Key found: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("❌ No GOOGLE_API_KEY found in .env")
    exit(1)

genai.configure(api_key=api_key)

async def test_gemini():
    print("\n1. Testing Text Generation...")
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Say 'Hello from Gemini!' if you can hear me.")
        print(f"✅ Response: {response.text}")
    except Exception as e:
        print(f"❌ Text Generation Failed: {e}")

    print("\n2. Testing Embeddings...")
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content="This is a test sentence for embeddings."
        )
        print(f"✅ Embedding generated! Length: {len(result['embedding'])}")
    except Exception as e:
        print(f"❌ Embedding Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_gemini())
