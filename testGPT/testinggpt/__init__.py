"""testinggpt - AI-Powered Penetration Testing Assistant."""

__version__ = "1.0.0"
__author__ = "Your Name"
__license__ = "MIT"

from testinggpt.core.agent import run_pentest
from testinggpt.core.config import testinggptConfig, load_config
from testinggpt.core.tracer import Tracer, get_global_tracer

__all__ = [
    "testinggptConfig",
    "Tracer",
    "get_global_tracer",
    "load_config",
    "run_pentest",
]
