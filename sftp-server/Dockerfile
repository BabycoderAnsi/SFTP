FROM ubuntu:22.04

#install openssh-server
RUN apt-get update && apt-get install -y openssh-server && mkdir /var/run/sshd

#create a user for sftp service
RUN useradd -m sftpuser && echo "sftpuser:password" | chpasswd

#create a upload directory
RUN mkdir -p /home/sftpuser/upload && chown root:root /home/sftpuser && chmod 755 /home/sftpuser && chown -R sftpuser:sftpuser /home/sftpuser/upload

#SSH configuration
COPY sshd_config /etc/ssh/sshd_config

#expose port 22 for ssh
EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]
