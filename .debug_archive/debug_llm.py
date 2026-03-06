import asyncio
import os
from app import process_with_llm

async def main():
    print("Testing 'Hello'...")
    res1 = await process_with_llm("Hello")
    print(f"Result 1: {res1}\n")

    print("Testing 'Error transcribing audio'...")
    res2 = await process_with_llm("Error transcribing audio")
    print(f"Result 2: {res2}\n")

if __name__ == "__main__":
    asyncio.run(main())
