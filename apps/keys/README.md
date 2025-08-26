# keys-bot

Telegram bot for keys management

### Variables used in project:

| Env Variable         | Description                                                      | Valid Values | Required | Default value                   |
| -------------------- | ---------------------------------------------------------------- | ------------ | -------- | ------------------------------- |
| `BOT_TOKEN`          | telegram bot token                                               | token string | true     | "\*\*\*"                        |
| `ADMIN_USER_ID`      | VPN admin chat id                                                | ""           | false    | "\*\*\*"                        |
| `IKE_CLIENTS_DIR`    | Host directory with IKEv2 clients                                | path string  | false    | "/home/\*\*\*/ikev2-clients"    |
| `WG_CLIENTS_DIR`     | Host directory with WireGuard clients                            | path string  | false    | "/home/\*\*\*/wg-clients"       |
| `OVPN_CLIENTS_DIR`   | Host directory with OpenVPN clients                              | path string  | false    | "/home/\*\*\*/ovpn-clients"     |
| `IKE_CONTAINER_DIR`  | Container directory with IKEv2 clients. Used in bash scripts     | path string  | true     | "/app/ikev2-clients"            |
| `WG_CONTAINER_DIR`   | Container directory with WireGuard clients. Used in bash scripts | path string  | true     | "/app/wg-clients"               |
| `OVPN_CONTAINER_DIR` | Container directory with OpenVPN clients. Used in bash scripts   | path string  | true     | "/app/ovpn-clients"             |
| `CREATE_PATH`        | Path to client creation script                                   | path string  | false    | "/app/scripts/create-client.sh" |
| `DELETE_PATH`        | Path to client deletion script                                   | path string  | false    | "/app/scripts/remove-client.sh" |
| `OUTLINE_API_ROOT`   | Outline API root                                                 | string       | true     | "\*\*\*"                        |
| `XUI_API_ROOT`       | 3X-UI API root                                                   | string       | true     | "\*\*\*"                        |
| `XUI_ADDRESS`        | 3X-UI server address                                             | string       | true     | "\*\*\*"                        |
| `XUI_USERNAME`       | 3X-UI server admin username                                      | string       | true     | "\*\*\*"                        |
| `XUI_PASSWORD`       | 3X-UI server admin pw                                            | string       | true     | "\*\*\*"                        |
