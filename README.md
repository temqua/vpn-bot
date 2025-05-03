# vpn-bot

Telegram Bot for VPN management

### Variables used in project:

| Env Variable         | Description                                | Valid Values | Required | Default value                   |
| -------------------- | ------------------------------------------ | ------------ | -------- | ------------------------------- |
| `BOT_TOKEN`          | telegram bot token                         | token string | false    | "\*\*\*"                        |
| `ADMIN_USER_ID`      | VPN admin chat id                          | ""           | true     | "\*\*\*"                        |
| `IKE_CLIENTS_DIR`    | Host directory with IKEv2 clients          | path string  | false    | "/home/\*\*\*/ikev2-clients"    |
| `WG_CLIENTS_DIR`     | Host directory with WireGuard clients      | path string  | false    | "/home/\*\*\*/wg-clients"       |
| `OVPN_CLIENTS_DIR`   | Host directory with OpenVPN clients        | path string  | false    | "/home/\*\*\*/ovpn-clients"     |
| `IKE_CONTAINER_DIR`  | Container directory with IKEv2 clients     | path string  | false    | "/app/ikev2-clients"            |
| `WG_CONTAINER_DIR`   | Container directory with WireGuard clients | path string  | false    | "/app/wg-clients"               |
| `OVPN_CONTAINER_DIR` | Container directory with OpenVPN clients   | path string  | false    | "/app/ovpn-clients"             |
| `CREATE_PATH`        | Path to client creation script             | path string  | false    | "/app/scripts/create-client.sh" |
| `DELETE_PATH`        | Path to client deletion script             | path string  | false    | "/app/scripts/remove-client.sh" |
| `DATABASE_URL`       | PostgreSQL DB DSL                          | DSL string   | true     |                                 |
| `OUTLINE_API_ROOT`   | Outline API root                           | string       | true     | "\*\*\*"                        |
| `XUI_API_ROOT`       | 3X-UI API root                             | string       | true     | "\*\*\*"                        |
| `XUI_ADDRESS`        | 3X-UI server address                       | string       | true     | "\*\*\*"                        |
| `XUI_USERNAME`       | 3X-UI server admin username                | string       | true     | "\*\*\*"                        |
| `XUI_PASSWORD`       | 3X-UI server admin pw                      | string       | true     | "\*\*\*"                        |
| `POSTGRES_USER`      | VPN Database user                          | string       | true     | "\*\*\*"                        |
| `POSTGRES_PASSWORD`  | VPN Database PW                            | string       | true     | "\*\*\*"                        |
| `SHEET_ID`           | Google Spreadsheet ID                      | string       | true     | "\*\*\*"                        |
