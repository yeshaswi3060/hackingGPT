import importlib.util
import sys
import tempfile
from pathlib import Path


tempfile.tempdir = r"C:\tmp"

MODULE_PATH = Path(
    r"C:\Users\yesha\.codex\plugins\cache\openai-primary-runtime\documents\26.426.12240\skills\documents\render_docx.py"
)

spec = importlib.util.spec_from_file_location("render_docx_module", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)

if __name__ == "__main__":
    module.main()
