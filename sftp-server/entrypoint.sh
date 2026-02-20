#!/bin/sh
set -e

LOG_FILE="/sftp/logs/sftp-server.log"
USERS_CONFIG="/sftp/config/users.json"

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    echo "{\"timestamp\":\"$timestamp\",\"level\":\"$level\",\"message\":\"$message\"}" >> "$LOG_FILE"
    echo "[$level] $message"
}

log "info" "SFTP server starting..."

mkdir -p /sftp/keys /sftp/logs /sftp/data

if [ ! -f /sftp/keys/ssh_host_rsa_key ]; then
    log "info" "Generating SSH host keys..."
    ssh-keygen -t rsa -b 4096 -f /sftp/keys/ssh_host_rsa_key -N "" -q
    ssh-keygen -t ecdsa -b 256 -f /sftp/keys/ssh_host_ecdsa_key -N "" -q
    ssh-keygen -t ed25519 -f /sftp/keys/ssh_host_ed25519_key -N "" -q
    log "info" "SSH host keys generated"
else
    log "info" "Using existing SSH host keys"
fi

cp -f /sftp/keys/ssh_host_* /etc/ssh/ 2>/dev/null || true
chmod 600 /etc/ssh/ssh_host_*_key 2>/dev/null || true

if ! getent group sftpusers > /dev/null 2>&1; then
    addgroup -g 1000 sftpusers
    log "info" "Created sftpusers group"
fi

if [ -f "$USERS_CONFIG" ]; then
    log "info" "Processing users from $USERS_CONFIG"
    
    user_count=$(jq '.users | length' "$USERS_CONFIG" 2>/dev/null || echo "0")
    
    if [ "$user_count" -gt 0 ]; then
        for i in $(seq 0 $((user_count - 1))); do
            username=$(jq -r ".users[$i].username" "$USERS_CONFIG")
            password=$(jq -r ".users[$i].password" "$USERS_CONFIG")
            uid=$(jq -r ".users[$i].uid // empty" "$USERS_CONFIG")
            
            if [ -z "$uid" ]; then
                uid=$((2000 + i))
            fi
            
            if id "$username" > /dev/null 2>&1; then
                log "info" "User $username already exists, updating..."
                deluser "$username" > /dev/null 2>&1 || true
            fi
            
            adduser -D -u "$uid" -G sftpusers -s /sbin/nologin -h "/sftp/data/$username" "$username"
            
            if [ -n "$password" ] && [ "$password" != "null" ]; then
                echo "$username:$password" | chpasswd -e > /dev/null 2>&1
            fi
            
            user_home="/sftp/data/$username"
            mkdir -p "$user_home"
            
            chown root:root "$user_home"
            chmod 755 "$user_home"
            
            dirs=$(jq -r ".users[$i].directories // {} | keys[]" "$USERS_CONFIG" 2>/dev/null)
            
            if [ -n "$dirs" ]; then
                echo "$dirs" | while read -r dir_name; do
                    dir_path="$user_home/$dir_name"
                    perm=$(jq -r ".users[$i].directories[\"$dir_name\"]" "$USERS_CONFIG")
                    
                    mkdir -p "$dir_path"
                    
                    case "$perm" in
                        "rw"|"rwx"|"write"|"w")
                            chown -R "$username:sftpusers" "$dir_path"
                            chmod 750 "$dir_path"
                            ;;
                        "r"|"ro"|"read")
                            chown -R "root:sftpusers" "$dir_path"
                            chmod 750 "$dir_path"
                            ;;
                        *)
                            chown -R "$username:sftpusers" "$dir_path"
                            chmod 750 "$dir_path"
                            ;;
                    esac
                done
            else
                mkdir -p "$user_home/inbound"
                mkdir -p "$user_home/outbound"
                chown -R "$username:sftpusers" "$user_home/inbound" "$user_home/outbound"
                chmod 750 "$user_home/inbound" "$user_home/outbound"
            fi
            
            log "info" "User $username configured (uid=$uid)"
        done
        
        log "info" "Processed $user_count users"
    else
        log "warn" "No users found in configuration"
    fi
else
    log "warn" "No users config found at $USERS_CONFIG, creating default user"
    
    if ! id "sftpuser" > /dev/null 2>&1; then
        adduser -D -u 2000 -G sftpusers -s /sbin/nologin -h "/sftp/data/sftpuser" sftpuser
        echo "sftpuser:sftpuser" | chpasswd > /dev/null 2>&1
        
        mkdir -p /sftp/data/sftpuser/inbound
        mkdir -p /sftp/data/sftpuser/outbound
        chown root:root /sftp/data/sftpuser
        chmod 755 /sftp/data/sftpuser
        chown -R sftpuser:sftpusers /sftp/data/sftpuser/inbound /sftp/data/sftpuser/outbound
        chmod 750 /sftp/data/sftpuser/inbound /sftp/data/sftpuser/outbound
        
        log "info" "Default user 'sftpuser' created"
    fi
fi

log "info" "SFTP server ready on port 22"

exec /usr/sbin/sshd -D -e 2>&1 | while IFS= read -r line; do
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    echo "{\"timestamp\":\"$timestamp\",\"level\":\"info\",\"source\":\"sshd\",\"message\":\"$line\"}" >> "$LOG_FILE"
    echo "$line"
done
