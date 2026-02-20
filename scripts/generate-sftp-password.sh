#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
USERS_FILE="$PROJECT_ROOT/sftp-config/users.json"

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --password <password>  Password to hash (interactive if not provided)"
    echo "  -u, --username <username>  Username to update in users.json"
    echo "  -g, --generate             Generate a random password and hash it"
    echo "  -l, --list                 List all users from users.json"
    echo "  -h, --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Interactive password input"
    echo "  $0 -p MySecure@123                    # Hash specific password"
    echo "  $0 -p MySecure@123 -u client-a        # Update user password"
    echo "  $0 -g                                 # Generate random password"
    echo "  $0 -l                                 # List users"
}

generate_random_password() {
    local length=${1:-16}
    LC_ALL=C tr -dc 'A-Za-z0-9@#$%^&*!()' < /dev/urandom | head -c "$length"
}

hash_password() {
    local password="$1"
    
    if command -v openssl &> /dev/null; then
        openssl passwd -6 -salt "$(openssl rand -hex 8)" "$password"
    elif command -v mkpasswd &> /dev/null; then
        mkpasswd -m sha-512 "$password"
    else
        echo -e "${RED}Error: Neither openssl nor mkpasswd found.${NC}" >&2
        exit 1
    fi
}

update_user_password() {
    local username="$1"
    local hashed_password="$2"
    
    if [ ! -f "$USERS_FILE" ]; then
        echo -e "${RED}Error: Users file not found at $USERS_FILE${NC}" >&2
        exit 1
    fi
    
    if command -v jq &> /dev/null; then
        local tmp_file=$(mktemp)
        jq --arg user "$username" --arg hash "$hashed_password" \
            '(.users[] | select(.username == $user)).password = $hash' \
            "$USERS_FILE" > "$tmp_file" && mv "$tmp_file" "$USERS_FILE"
        echo -e "${GREEN}Password updated for user: $username${NC}"
    else
        echo -e "${YELLOW}Warning: jq not installed. Please manually update $USERS_FILE${NC}"
        echo "Username: $username"
        echo "Hashed password: $hashed_password"
    fi
}

list_users() {
    if [ ! -f "$USERS_FILE" ]; then
        echo -e "${RED}Error: Users file not found at $USERS_FILE${NC}" >&2
        exit 1
    fi
    
    if command -v jq &> /dev/null; then
        echo -e "${BLUE}Configured SFTP Users:${NC}"
        echo ""
        jq -r '.users[] | "  • \(.username) (uid: \(.uid))"' "$USERS_FILE"
        echo ""
        echo -e "${YELLOW}Note: Password hashes are not shown for security.${NC}"
    else
        echo -e "${YELLOW}jq not installed. Showing raw file:${NC}"
        cat "$USERS_FILE"
    fi
}

PASSWORD=""
USERNAME=""
GENERATE=false
LIST=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--password)
            PASSWORD="$2"
            shift 2
            ;;
        -u|--username)
            USERNAME="$2"
            shift 2
            ;;
        -g|--generate)
            GENERATE=true
            shift
            ;;
        -l|--list)
            LIST=true
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}" >&2
            print_usage
            exit 1
            ;;
    esac
done

if [ "$LIST" = true ]; then
    list_users
    exit 0
fi

if [ "$GENERATE" = true ]; then
    PASSWORD=$(generate_random_password)
    echo -e "${BLUE}Generated password: ${GREEN}$PASSWORD${NC}"
fi

if [ -z "$PASSWORD" ]; then
    if [ -t 0 ]; then
        read -s -p "Enter password: " PASSWORD
        echo ""
        if [ -z "$PASSWORD" ]; then
            echo -e "${RED}Error: Password cannot be empty.${NC}" >&2
            exit 1
        fi
    else
        PASSWORD=$(cat)
    fi
fi

echo -e "${BLUE}Hashing password...${NC}"
HASHED_PASSWORD=$(hash_password "$PASSWORD")

echo ""
echo -e "${GREEN}Password hash generated successfully!${NC}"
echo ""
echo -e "${BLUE}Hashed password (copy to users.json):${NC}"
echo "$HASHED_PASSWORD"
echo ""

if [ -n "$USERNAME" ]; then
    update_user_password "$USERNAME" "$HASHED_PASSWORD"
else
    echo -e "${YELLOW}To use this hash, add it to $USERS_FILE:${NC}"
    echo ""
    echo '{
  "username": "new-user",
  "password": "'"$HASHED_PASSWORD"'",
  "uid": 2004,
  "directories": {
    "inbound": "rw",
    "outbound": "r"
  }
}'
fi
