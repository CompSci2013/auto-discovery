#!/bin/bash
#
# GitLab Triage Bot Runner
#
# Usage:
#   ./run-triage.sh              # Dry run (preview mode)
#   ./run-triage.sh --live       # Actual run (makes changes)
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================="
echo "GitLab Triage Bot"
echo "=================================="
echo ""

# Check if config exists
if [ ! -f "config.yml" ]; then
    echo -e "${RED}ERROR: config.yml not found${NC}"
    echo ""
    echo "Setup instructions:"
    echo "  1. cp config.yml.example config.yml"
    echo "  2. Edit config.yml with your GitLab credentials"
    echo "  3. Run this script again"
    echo ""
    exit 1
fi

# Check if dependencies are installed
if ! python3 -c "import gitlab" 2>/dev/null; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pip install -r requirements.txt
    echo ""
fi

# Determine mode
if [ "$1" == "--live" ]; then
    echo -e "${YELLOW}MODE: LIVE RUN (will make changes to GitLab)${NC}"
    echo ""
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        exit 0
    fi
    echo ""
    python3 gitlab_triage.py --config config.yml
else
    echo -e "${GREEN}MODE: DRY RUN (preview only, no changes)${NC}"
    echo ""
    python3 gitlab_triage.py --config config.yml --dry-run
    echo ""
    echo -e "${GREEN}Dry run complete.${NC}"
    echo "To run for real: ./run-triage.sh --live"
fi
