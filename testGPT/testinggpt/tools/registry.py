"""Tool registry for managing available tools."""

from typing import Any

from testinggpt.tools.base import BaseTool
from testinggpt.tools.terminal import TerminalTool
from testinggpt.tools.filesystem import FileReadTool, FileWriteTool, ListDirTool
from testinggpt.tools.tool_check import DependencyCheckTool
from testinggpt.tools.finding import FindingTool
from testinggpt.tools.xmlrpc_tool import XMLRPCTool
from testinggpt.tools.crawler import DomainCrawlerTool
from testinggpt.tools.codegen import PythonGeneratorTool
from testinggpt.tools.jwt import JWTAnalyzerTool
from testinggpt.tools.secret_harvester import SecretHarvesterTool
from testinggpt.tools.subdomain import SubdomainDominatorTool
from testinggpt.tools.payload_engine import PayloadEngineTool
from testinggpt.tools.network_pivot import NetworkPivotTool
from testinggpt.tools.fuzzer import FuzzerTool
from testinggpt.tools.exploit_search import GlobalExploitSearchTool
from testinggpt.tools.source_downloader import SourceCodeDownloaderTool
from testinggpt.tools.saml import SAMLAnalyzerTool
from testinggpt.tools.master_attacker import MasterAttackerTool
from testinggpt.tools.apk_suite import APKAnalyzerTool


class ToolRegistry:
    """Registry for managing and accessing tools."""

    def __init__(self) -> None:
        """Initialize the tool registry."""
        self._tools: dict[str, BaseTool] = {}
        self._register_default_tools()

    def _register_default_tools(self) -> None:
        """Register default built-in tools."""
        self.register(TerminalTool())
        self.register(FileReadTool())
        self.register(FileWriteTool())
        self.register(ListDirTool())
        self.register(DependencyCheckTool())
        self.register(FindingTool())
        # Alias for models that use 'found' instead of 'finding_found'
        f_tool = FindingTool()
        self._tools["found"] = f_tool
        from testinggpt.tools.exploit import SearchSploitTool
        self.register(SearchSploitTool())
        from testinggpt.tools.web_search import WebSearchTool
        self.register(WebSearchTool())
        from testinggpt.tools.hardcore_scan import HardcoreScanTool
        self.register(HardcoreScanTool())
        self.register(XMLRPCTool())
        self.register(DomainCrawlerTool())
        self.register(PythonGeneratorTool())
        self.register(JWTAnalyzerTool())
        self.register(SecretHarvesterTool())
        self.register(SubdomainDominatorTool())
        self.register(PayloadEngineTool())
        self.register(NetworkPivotTool())
        self.register(FuzzerTool())
        self.register(GlobalExploitSearchTool())
        self.register(SourceCodeDownloaderTool())
        self.register(SAMLAnalyzerTool())
        self.register(MasterAttackerTool())
        self.register(APKAnalyzerTool())

    def register(self, tool: BaseTool) -> None:
        """Register a new tool."""
        self._tools[tool.name] = tool

    def get(self, name: str) -> BaseTool | None:
        """Get a tool by name."""
        return self._tools.get(name)

    def list_tools(self) -> list[str]:
        """List all registered tool names."""
        return list(self._tools.keys())

    def get_tool_info(self, name: str) -> dict[str, Any] | None:
        """Get information about a tool."""
        tool = self.get(name)
        return tool.to_dict() if tool else None


# Global tool registry
_global_registry: ToolRegistry | None = None


def get_registry() -> ToolRegistry:
    """Get the global tool registry."""
    global _global_registry
    if _global_registry is None:
        _global_registry = ToolRegistry()
    return _global_registry
