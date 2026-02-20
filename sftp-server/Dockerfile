FROM alpine:3.19

LABEL maintainer="SFTP Gateway"
LABEL description="Multi-tenant SFTP server with audit logging"

RUN apk add --no-cache \
    openssh \
    shadow \
    jq \
    logrotate \
    supercronic

RUN mkdir -p /sftp/data /sftp/keys /sftp/logs /sftp/config

COPY sshd_config /etc/ssh/sshd_config
COPY entrypoint.sh /entrypoint.sh
COPY logrotate.conf /etc/logrotate.d/sftp

RUN chmod +x /entrypoint.sh && \
    chmod 644 /etc/ssh/sshd_config && \
    chmod 644 /etc/logrotate.d/sftp

RUN ssh-keygen -A 2>/dev/null || true

EXPOSE 22

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD nc -z localhost 22 || exit 1

ENTRYPOINT ["/entrypoint.sh"]
