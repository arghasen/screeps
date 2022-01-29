# Graphana Agent

Installed on windows as WSL doesnt have systemd

http://localhost:12345/-/healthy
http://localhost:12345/agent/api/v1/targets

Create API Key in Graphana Cloud

Windows agent config

  remote_write:
    - basic_auth:
        password: <API Key>
        username: 316522
      url: <Cloud URL>
