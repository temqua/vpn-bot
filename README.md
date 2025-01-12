# vpn-bot

Telegram Bot for VPN management

### Variables used in project:

| Env Variable        | Description                                | Valid Values | Required | Default value                                    |
| ------------------- | ------------------------------------------ | ------------ | -------- | ------------------------------------------------ |
| `BOT_TOKEN`         | telegram bot token                         | token string | false    | "7735973144:AAG4aojhaBjVIQSo4G3BapDkc-snBt1fm1U" |
| `ADMIN_USER_ID`     | VPN admin chat id                          | ""           | true     |                                                  |
| `IKE_CLIENTS_DIR`   | Host directory with IKEv2 clients          | path string  | false    | "/root/ikev2-clients"                            |
| `WG_CLIENTS_DIR`    | Host directory with WireGuard clients      | path string  | false    | "/root/wg-clients"                               |
| `IKE_CONTAINER_DIR` | Container directory with IKEv2 clients     | path string  | false    | "/app/ikev2-clients"                             |
| `WG_CONTAINER_DIR`  | Container directory with WireGuard clients | path string  | false    | "/app/wg-clients"                                |
| `CREATE_PATH`       | Path to client creation script             | path string  | false    | "/app/scripts/create-client.sh"                  |
| `DELETE_PATH`       | Path to client deletion script             | path string  | false    | "/app/scripts/remove-client.sh"                  |
| `DATABASE_URL`      | PostrgreSQL DSL                            | DSL string   | true     |                                                  |
