#!/usr/bin/env bash
# testinggpt Container Entrypoint
# Sets up authentication based on testinggpt_AUTH_MODE environment variable

set -e

AUTH_MODE="${testinggpt_AUTH_MODE:-manual}"
CCR_CONFIG_DIR="/home/pentester/.claude-code-router"
CCR_CONFIG_FILE="${CCR_CONFIG_DIR}/config.json"
BASHRC_FILE="/home/pentester/.bashrc"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

# Router configurations for different modes
OPENROUTER_ROUTER='{"default":"openrouter,openai/gpt-5.1","background":"openrouter,openai/gpt-5.1","think":"openrouter,openai/gpt-5.1","longContext":"openrouter,openai/gpt-5.1","longContextThreshold":60000,"webSearch":"openrouter,google/gemini-3-pro-preview"}'
LOCAL_ROUTER='{"default":"localLLM,openai/gpt-oss-20b","background":"localLLM,openai/gpt-oss-20b","think":"localLLM,qwen/qwen3-coder-30b","longContext":"localLLM,qwen/qwen3-coder-30b","longContextThreshold":60000,"webSearch":"localLLM,openai/gpt-oss-20b"}'
GEMINI_ROUTER='{"default":"gemini,gemini-2.0-flash","background":"gemini,gemini-2.0-flash","think":"gemini,gemini-2.5-pro-preview-03-25","longContext":"gemini,gemini-1.5-flash","longContextThreshold":60000,"webSearch":"gemini,gemini-2.0-flash"}'

setup_ccr() {
    local mode="$1"
    local api_key="$2"
    local template_file="/app/scripts/ccr-config-template.json"

    # Create CCR config directory if needed
    mkdir -p "$CCR_CONFIG_DIR"

    # Create directory if it doesn't exist (e.g. if volume mount is fresh)
    sudo mkdir -p "$(dirname "$CCR_CONFIG_FILE")"
    sudo chown -R $USER:$USER "$(dirname "$CCR_CONFIG_FILE")"

    # Check if template exists
    if [ ! -f "$template_file" ]; then
        echo -e "${YELLOW}Error: CCR config template not found at $template_file${NC}"
        exit 1
    fi

    # Copy template and substitute placeholders
    sudo cp "$template_file" "$CCR_CONFIG_FILE"
    sudo chown $USER:$USER "$CCR_CONFIG_FILE"

    # Substitute API key (for openrouter or gemini mode)
    local mode_name="$mode"
    if [ "$mode_name" = "openrouter" ] && [ -n "$api_key" ]; then
        sudo sed -i "s/__OPENROUTER_API_KEY__/${api_key}/g" "$CCR_CONFIG_FILE"
    elif [ "$mode_name" = "gemini" ] && [ -n "$api_key" ]; then
        sudo sed -i "s/__GOOGLE_API_KEY__/${api_key}/g" "$CCR_CONFIG_FILE"
    fi

    # Substitute Router config based on mode
    if [ "$mode" = "openrouter" ]; then
        sudo sed -i "s|\"__ROUTER_CONFIG__\"|${OPENROUTER_ROUTER}|g" "$CCR_CONFIG_FILE"
        local display_model="openai/gpt-5.1 (via OpenRouter)"
    elif [ "$mode" = "gemini" ]; then
        sudo sed -i "s|\"__ROUTER_CONFIG__\"|${GEMINI_ROUTER}|g" "$CCR_CONFIG_FILE"
        local display_model="gemini-2.0-flash (Google Gemini)"
    else
        sudo sed -i "s|\"__ROUTER_CONFIG__\"|${LOCAL_ROUTER}|g" "$CCR_CONFIG_FILE"
        local display_model="localLLM (qwen/qwen3-coder-30b, openai/gpt-oss-20b)"
    fi

    echo -e "${BLUE}Starting Claude Code Router...${NC}"

    # Start CCR daemon (nohup to keep it running)
    nohup ccr start > /tmp/ccr.log 2>&1 &

    # Remove any existing ccr lines from bashrc to avoid duplicates
    sed -i '/# CCR startup/,/# END CCR startup/d' "$BASHRC_FILE" 2>/dev/null || true

    # Write a self-healing CCR startup block into .bashrc
    # This runs every time bash starts: starts CCR if not running, then exports env vars
    cat >> "$BASHRC_FILE" << 'BASHRC_BLOCK'
# CCR startup
_start_ccr() {
    if ! nc -z 127.0.0.1 3456 2>/dev/null; then
        nohup ccr start > /tmp/ccr.log 2>&1 &
        local i=0
        while ! nc -z 127.0.0.1 3456 2>/dev/null && [ $i -lt 10 ]; do
            sleep 1; i=$((i+1))
        done
    fi
    eval "$(ccr activate 2>/dev/null)" || true
}
_start_ccr
# END CCR startup
BASHRC_BLOCK

    # Start CCR now for entrypoint session too
    nohup ccr start > /tmp/ccr.log 2>&1 &
    local i=0
    while ! nc -z 127.0.0.1 3456 2>/dev/null && [ $i -lt 15 ]; do
        sleep 1; i=$((i+1))
    done

    if nc -z 127.0.0.1 3456 2>/dev/null; then
        echo -e "${GREEN}CCR daemon running on port 3456${NC}"
    else
        echo -e "${YELLOW}Warning: CCR did not start. Check /tmp/ccr.log${NC}"
    fi

    eval "$(ccr activate 2>/dev/null)" || true

    echo -e "${GREEN}CCR activated with ${mode} backend${NC}"
    echo -e "${BLUE}Default model: ${display_model}${NC}"
}

echo ""
echo -e "${BLUE}=== testinggpt Authentication ===${NC}"

case "$AUTH_MODE" in
    gemini)
        if [ -z "$GOOGLE_API_KEY" ]; then
            echo -e "${YELLOW}Error: GOOGLE_API_KEY not set${NC}"
            echo "Please set GOOGLE_API_KEY in your .env.auth file"
            exit 1
        fi
        echo -e "${GREEN}Using Google Gemini API${NC}"
        setup_ccr "gemini" "$GOOGLE_API_KEY"
        ;;
    openrouter)
        if [ -z "$OPENROUTER_API_KEY" ]; then
            echo -e "${YELLOW}Error: OPENROUTER_API_KEY not set${NC}"
            echo "Please run 'make config' and select OpenRouter option"
            exit 1
        fi
        setup_ccr "openrouter" "$OPENROUTER_API_KEY"
        ;;
    local)
        echo -e "${GREEN}Local LLM mode${NC}"
        echo -e "Ensure your local LLM server is running on host.docker.internal:1234"
        setup_ccr "local" ""
        ;;
    anthropic)
        if [ -z "$ANTHROPIC_API_KEY" ]; then
            echo -e "${YELLOW}Warning: ANTHROPIC_API_KEY not set${NC}"
            echo "Please run 'make config' and select Anthropic option"
        else
            echo -e "${GREEN}Using Anthropic API key${NC}"
        fi
        ;;
    manual)
        echo -e "${YELLOW}Manual login mode${NC}"
        echo -e "Run ${GREEN}claude login${NC} to authenticate"
        ;;
    *)
        echo -e "${YELLOW}Unknown auth mode: $AUTH_MODE${NC}"
        echo "Defaulting to manual login mode"
        echo -e "Run ${GREEN}claude login${NC} to authenticate"
        ;;
esac

echo -e "${BLUE}=================================${NC}"
echo ""

# Execute the passed command or start bash
# Use bash -l to ensure .bashrc is sourced (for ccr activation)
if [ "$1" = "/bin/bash" ]; then
    exec /bin/bash --login
else
    exec "$@"
fi
