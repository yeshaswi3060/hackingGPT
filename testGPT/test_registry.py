from testinggpt.tools.registry import get_registry

try:
    registry = get_registry()
    tools = registry.list_tools()
    print(f"Success! Registered tools: {tools}")
    for name in tools:
        tool = registry.get(name)
        schema = tool.get_schema()
        print(f"Tool: {name} | Schema: {list(schema['properties'].keys()) if 'properties' in schema else 'None'}")
except Exception as e:
    print(f"Failed to initialize registry: {e}")
    import traceback
    traceback.print_exc()
