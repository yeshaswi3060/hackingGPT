"""Enhanced Claude Code agent with tracer integration for testinggpt."""

import logging
import re
from pathlib import Path
from typing import Any, ClassVar

# Set up debug logging to file
# Try to write to workspace first, fallback to /tmp if permission denied
DEBUG_LOG_WORKSPACE = Path("workspace/testinggpt-debug.log")
DEBUG_LOG_FALLBACK = Path("/tmp/testinggpt-debug.log")

handlers: list[logging.Handler] = [logging.StreamHandler()]  # Always log to stderr
try:
    # Try to create log file in workspace
    handlers.append(logging.FileHandler(DEBUG_LOG_WORKSPACE, mode="w"))
    DEBUG_LOG = DEBUG_LOG_WORKSPACE
except (PermissionError, OSError):
    # Fallback to /tmp if workspace is not writable
    handlers.append(logging.FileHandler(DEBUG_LOG_FALLBACK, mode="w"))
    DEBUG_LOG = DEBUG_LOG_FALLBACK
    print(
        f"Warning: Could not write to {DEBUG_LOG_WORKSPACE}, using {DEBUG_LOG_FALLBACK} instead",
        flush=True,
    )

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=handlers,
)
logger = logging.getLogger(__name__)


async def run_pentest(
    target: str,
    custom_instruction: str | None = None,
    model: str | None = None,
    backend: str | None = None,
    api_key: str | None = None,
    working_dir: str | None = None,
    debug: bool = False,
    resume_session: str | None = None,
) -> dict[str, Any]:
    """
    Convenience function to run a CTF challenge or penetration test.

    Uses the new AgentController for lifecycle management and session persistence.

    Args:
        target: Target challenge/machine to solve
        custom_instruction: Optional custom challenge context or instructions
        model: Optional model override
        working_dir: Optional working directory override
        debug: Enable debug mode with verbose console output
        resume_session: Optional session ID to resume

    Returns:
        Dictionary with challenge results including walkthrough and flags found
    """
    from testinggpt.core.config import load_config
    from testinggpt.core.controller import AgentController

    # Enable verbose console logging in debug mode
    if debug:
        logger.info("=" * 80)
        logger.info("DEBUG MODE ENABLED - CTF CHALLENGE SOLVER")
        logger.info(f"Debug log file: {DEBUG_LOG}")
        logger.info(f"Target: {target}")
        if custom_instruction:
            logger.info(f"Challenge context: {custom_instruction}")
        if model:
            logger.info(f"Model: {model}")
        if resume_session:
            logger.info(f"Resuming session: {resume_session}")
        logger.info("=" * 80)

    # Build config
    config_kwargs: dict[str, Any] = {"target": target}
    if custom_instruction:
        config_kwargs["custom_instruction"] = custom_instruction
    if model:
        config_kwargs["llm_model"] = model
    if backend:
        config_kwargs["backend_type"] = backend
    if api_key:
        config_kwargs["llm_api_key"] = api_key
    if working_dir:
        config_kwargs["working_directory"] = Path(working_dir)

    config = load_config(**config_kwargs)

    # Build task
    task = f"Solve this CTF challenge and capture the flag(s): {target}"
    if custom_instruction:
        task += f"\n\nChallenge context: {custom_instruction}"

    # Use AgentController for lifecycle management
    controller = AgentController(config)
    result = await controller.run(task, resume_session_id=resume_session)

    # Map result to legacy format for backward compatibility
    if result.get("success"):
        # Convert flags_found from list of strings to list of dicts if needed
        flags = result.get("flags_found", [])
        if flags and isinstance(flags[0], str):
            flags = [{"flag": f, "context": ""} for f in flags]

        result = {
            "success": True,
            "output": result.get("output", ""),
            "cost_usd": result.get("cost_usd", 0),
            "flags_found": flags,
            "walkthrough": [],  # Walkthrough tracking moved to session
            "session_id": result.get("session_id", ""),
        }

    if debug:
        logger.info("=" * 80)
        logger.info(f"CHALLENGE COMPLETE - Success: {result.get('success')}")
        if result.get("success"):
            logger.info(f"Flags found: {len(result.get('flags_found', []))}")
            logger.info(f"Cost: ${result.get('cost_usd', 0):.4f}")
            logger.info(f"Session: {result.get('session_id', 'N/A')}")
            for flag_data in result.get("flags_found", []):
                flag = (
                    flag_data.get("flag", flag_data) if isinstance(flag_data, dict) else flag_data
                )
                logger.info(f"  🚩 {flag}")
        else:
            logger.error(f"Error: {result.get('error', 'Unknown')}")
        logger.info("=" * 80)

    return result
