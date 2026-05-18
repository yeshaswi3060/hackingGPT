import asyncio
from testinggpt.tools.tool_check import DependencyCheckTool

async def test_tool():
    tool = DependencyCheckTool()
    # Check for some common tools and one that likely doesn't exist
    commands = ["python", "git", "nmap", "non_existent_tool_123"]
    result = await tool.execute(commands=commands)
    print(f"Tool Result: {result['result']}")
    for cmd, info in result['details'].items():
        print(f"  {cmd}: {'Installed' if info['installed'] else 'Not Found'} ({info['path']})")

if __name__ == "__main__":
    asyncio.run(test_tool())
