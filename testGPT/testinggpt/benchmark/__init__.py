"""Simple benchmark manager for testinggpt.

Start/stop benchmark containers and expose ports for manual testing.
"""

from testinggpt.benchmark.registry import BenchmarkInfo, BenchmarkRegistry

__all__ = [
    "BenchmarkInfo",
    "BenchmarkRegistry",
]
