import asyncio
from app import process_with_llm

async def main():
    try:
        response = await process_with_llm("Hello, can you hear me?")
        print(f"Final Response: {response}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
