"""Configuration management for testinggpt using Pydantic."""

from pathlib import Path
from typing import Any, Literal

from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict


class testinggptConfig(BaseSettings):
    """Main configuration for testinggpt."""

    model_config = SettingsConfigDict(
        env_file=[".env", ".env.auth"],
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # LLM Configuration
    backend_type: Literal["litellm"] = Field(
        default="litellm", description="Backend type: litellm"
    )

    llm_model: str = Field(
        default="groq/llama-3.1-8b-instant", description="Model name (any litellm string)"
    )

    google_api_key: str | None = Field(default=None)
    groq_api_key: str | None = Field(default=None)
    groq_api_keys: str | None = Field(
        default=None, 
        description="Comma-separated list of Groq API keys for rotation"
    )
    llm_api_key: str | None = Field(
        default=None, 
        description="Optional manual API key override (from CLI)"
    )

    llama_3_1_70b: str | None = Field(
        default=None, 
        validation_alias=AliasChoices("llama_3.1_70B", "llama_3_1_70b", "LLAMA_3_1_70B")
    )
    llama_3_1_70b_model: str = Field(
        default="meta/llama-3.1-70b-instruct", 
        validation_alias=AliasChoices("lama_3.1_70B_model", "llama_3_1_70b_model", "LLAMA_3_1_70B_MODEL")
    )

    llm_api_base: str | None = Field(default=None, description="Optional custom API base URL")

    # Dual-Model: Strategy model (automatically set to 70B when using fast model)
    strategy_model: str | None = Field(
        default=None, 
        description="Strategy model for dual-model orchestration (auto-set if not specified)"
    )

    # Code Generator: Nemotron 120B for writing Python scripts on-the-fly
    nemotron_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "nemotron-3-super-120b-a12b", "nemotron_api_key", "NEMOTRON_API_KEY",
            "nemotron_3_super_120b_a12b", "NEMOTRON_3_SUPER_120B_A12B"
        )
    )
    nemotron_model: str = Field(
        default="nvidia/nemotron-3-super-120b-a12b",
        validation_alias=AliasChoices("model", "nemotron_model", "NEMOTRON_MODEL")
    )
    nemotron_base_url: str = Field(
        default="https://integrate.api.nvidia.com/v1",
        validation_alias=AliasChoices("base_url", "nemotron_base_url", "NEMOTRON_BASE_URL")
    )

    # Auth Configuration
    auth_mode: str = Field(default="manual", description="Authentication mode (manual, openrouter, anthropic)")
    openrouter_api_key: str | None = Field(default=None, description="OpenRouter API key")
    anthropic_api_key: str | None = Field(default=None, description="Anthropic API key")
    anthropic_base_url: str | None = Field(default=None, description="Anthropic/OpenRouter base URL")

    # Agent Configuration
    max_iterations: int = Field(default=300, description="Maximum iterations for the agent")

    working_directory: Path = Field(
        default_factory=lambda: Path.cwd() / "workspace",
        description="Working directory for agent operations",
    )

    # Target Configuration
    target: str = Field(
        ...,  # Required
        description="Target for penetration testing (URL, IP, domain, or path)",
    )

    custom_instruction: str | None = Field(
        default=None, description="Optional custom instructions for the agent"
    )

    # Interface Configuration
    interface_mode: Literal["tui", "cli"] = Field(
        default="tui", description="Interface mode: TUI (interactive) or CLI (headless)"
    )

    verbose: bool = Field(default=True, description="Enable verbose output")

    # Permission Mode
    permission_mode: Literal["ask", "bypassPermissions"] = Field(
        default="bypassPermissions", description="Permission mode for Claude Code SDK"
    )

    def __init__(self, **data: Any) -> None:
        """Initialize configuration."""
        super().__init__(**data)

        # Create working directory if it doesn't exist
        # Ignore permission errors if directory already exists
        try:
            self.working_directory.mkdir(parents=True, exist_ok=True)
        except (PermissionError, OSError):
            # Directory already exists or we don't have permission to create it
            # This is fine if the directory is already available
            if not self.working_directory.exists():
                raise

    def get_api_key(self) -> str | list[str] | None:
        """Select the correct API key based on the model and overrides."""
        if self.llm_api_key:
            return self.llm_api_key.strip(' \t\n\r"') if isinstance(self.llm_api_key, str) else self.llm_api_key
        
        model = self.llm_model.lower()
        
        def _strip(val):
            if isinstance(val, str):
                return val.strip(' \t\n\r"')
            return val

        # Groq specific handling (supports rotation)
        if model.startswith("groq/") or "groq" in model:
            if self.groq_api_keys:
                keys = [k.strip(' \t\n\r"') for k in self.groq_api_keys.split(",") if k.strip(' \t\n\r"')]
                print(f"DEBUG CONFIG: Returning {len(keys)} Groq keys. First key starts with: {keys[0][:10] if keys else 'NONE'}")
                return keys
            result = _strip(self.groq_api_key)
            print(f"DEBUG CONFIG: Returning single Groq key: {repr(result[:15]) if result else 'NONE'}...")
            return result

        # Gemini
        if model.startswith("gemini/") or "gemini" in model:
            return _strip(self.google_api_key)
        
        # NVIDIA NIM / Llama
        if "nvidia" in model or "meta/llama" in model:
            key = _strip(self.llama_3_1_70b)
            # Fallback: try reading directly from os.environ if pydantic didn't pick it up
            if not key:
                import os
                key = _strip(os.getenv("llama_3.1_70B") or os.getenv("LLAMA_3_1_70B"))
            print(f"DEBUG CONFIG: NVIDIA key: {repr(key[:15]) if key else 'NONE'}...")
            return key
        
        # Generic fallback
        return _strip(self.groq_api_key) or _strip(self.google_api_key)

    @property
    def system_prompt_path(self) -> Path:
        """Get path to system prompt file."""
        return Path(__file__).parent.parent / "prompts" / "pentesting.py"

    @classmethod
    def from_env(cls, **overrides: object) -> "testinggptConfig":
        """Create config from environment variables with optional overrides."""
        return cls(**overrides)


def load_config(**overrides: object) -> testinggptConfig:
    """
    Load configuration from environment with optional overrides.

    Args:
        **overrides: Keyword arguments to override config values

    Returns:
        testinggptConfig instance

    Example:
        >>> config = load_config(target="example.com", verbose=True)
    """
    # Create config with overrides
    # Note: API key is optional - Claude Code manages its own configuration
    return testinggptConfig.from_env(**overrides)
