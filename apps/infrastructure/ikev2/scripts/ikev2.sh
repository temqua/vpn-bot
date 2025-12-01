#!/bin/bash

# Проверяем, запущен ли скрипт в контейнере
is_container() {
    # Проверка 1: /.dockerenv (самый надёжный способ для Docker)
    if [ -f "/.dockerenv" ]; then
        return 0
    fi
    # 2. Проверка /proc/1/cgroup (более точная)
    if [ -f "/proc/1/cgroup" ]; then
        # Ищем docker, lxc, kubepods без совпадения с хостовыми путями
        if grep -q "docker\|lxc\|kubepods" /proc/1/cgroup 2>/dev/null && 
           ! grep -q "0::/" /proc/1/cgroup 2>/dev/null; then
            return 0
        fi
    fi

    return 1
}

generate_fake_cert() {
    echo "-----BEGIN FAKE CERTIFICATE-----"
    openssl rand -base64 30 | fold -w 64
    echo "-----END FAKE CERTIFICATE-----"
}

generate_fake_key() {
    echo "-----BEGIN FAKE PRIVATE KEY-----"
    openssl rand -base64 30 | fold -w 64
    echo "-----END FAKE PRIVATE KEY-----"
}

echo "CONFIG_DIR: $CONFIG_DIR"

case "$1" in
    --listclients)
        echo "Listing clients (fake response):"
        ls "$CONFIG_DIR"/*.sswan 2>/dev/null | sed 's/.*\///; s/\.sswan//' || echo "No clients found."
        ;;
    --exportclient)
        if [ -z "$2" ]; then
            echo "Error: Client name not specified."
            exit 1
        fi
        CLIENT_NAME="$2"
        if [ ! -f "$CONFIG_DIR/$CLIENT_NAME.sswan" ]; then
            echo "Error: Client '$CLIENT_NAME' does not exist."
            exit 1
        fi
        echo "Exporting fake configs for client '$CLIENT_NAME'..."
        echo "=== Fake StrongSwan config (.sswan) ==="
        cat "$CONFIG_DIR/$CLIENT_NAME.sswan"
        echo -e "\n=== Fake Apple MobileConfig (.mobileconfig) ==="
        cat "$CONFIG_DIR/$CLIENT_NAME.mobileconfig"
        echo -e "\n=== Fake PKCS#12 (.p12) ==="
        cat "$CONFIG_DIR/$CLIENT_NAME.p12"
        ;;
    --addclient)
        if [ -z "$2" ]; then
            echo "Error: Client name not specified."
            exit 1
        fi
        CLIENT_NAME="$2"
        if [ -f "$CONFIG_DIR/$CLIENT_NAME.sswan" ]; then
            echo "Error: Client '$CLIENT_NAME' already exists."
            exit 1
        fi

        echo "Creating fake IKEv2 configs for '$CLIENT_NAME'..."

        # Генерация фейкового StrongSwan конфига (.sswan)
        echo "conn $CLIENT_NAME
    keyexchange=ikev2
    ike=aes256-sha256-modp2048!
    esp=aes256-sha256!
    left=%config
    leftauth=eap-mschapv2
    leftsourceip=%config
    right=fake.ikev2.server
    rightid=@fake.ikev2.server
    rightsubnet=0.0.0.0/0
    eap_identity=$CLIENT_NAME
    auto=start" > "$CONFIG_DIR/$CLIENT_NAME.sswan"

        # Генерация фейкового MobileConfig (.mobileconfig)
        echo "<?xml version='1.0' encoding='UTF-8'?>
<!DOCTYPE plist PUBLIC '-//Apple//DTD PLIST 1.0//EN' 'http://www.apple.com/DTDs/PropertyList-1.0.dtd'>
<plist version='1.0'>
<dict>
    <key>PayloadDisplayName</key>
    <string>Fake IKEv2 VPN ($CLIENT_NAME)</string>
    <key>PayloadIdentifier</key>
    <string>com.fake.ikev2.$CLIENT_NAME</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>$(uuidgen)</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>VPN</key>
    <dict>
        <key>IPv4</key>
        <dict><key>OverridePrimary</key><integer>1</integer></dict>
        <key>PayloadDisplayName</key>
        <string>Fake IKEv2</string>
        <key>PayloadIdentifier</key>
        <string>com.fake.ikev2.client</string>
        <key>PayloadType</key>
        <string>com.apple.vpn.managed</string>
        <key>PayloadUUID</key>
        <string>$(uuidgen)</string>
        <key>UserDefinedName</key>
        <string>Fake IKEv2</string>
        <key>VPNType</key>
        <string>IKEv2</string>
        <key>IKEv2</key>
        <dict>
            <key>RemoteAddress</key>
            <string>fake.ikev2.server</string>
            <key>AuthenticationMethod</key>
            <string>None</string>
            <key>LocalIdentifier</key>
            <string>$CLIENT_NAME</string>
        </dict>
    </dict>
</dict>
</plist>" > "$CONFIG_DIR/$CLIENT_NAME.mobileconfig"

        # Генерация фейкового P12 (.p12)
        echo "-----BEGIN FAKE PKCS12-----" > "$CONFIG_DIR/$CLIENT_NAME.p12"
        openssl rand -base64 30 | fold -w 64 >> "$CONFIG_DIR/$CLIENT_NAME.p12"
        echo "-----END FAKE PKCS12-----" >> "$CONFIG_DIR/$CLIENT_NAME.p12"

        echo "Client '$CLIENT_NAME' added (fake). Configs:"
        echo "- $CONFIG_DIR/$CLIENT_NAME.sswan"
        echo "- $CONFIG_DIR/$CLIENT_NAME.mobileconfig"
        echo "- $CONFIG_DIR/$CLIENT_NAME.p12"
        ;;
    --revokeclient)
        if [ -z "$2" ]; then
            echo "Error: Client name not specified."
            exit 1
        fi
        CLIENT_NAME="$2"
        if [ ! -f "$CONFIG_DIR/$CLIENT_NAME.sswan" ]; then
            echo "Error: Client '$CLIENT_NAME' does not exist."
            exit 1
        fi
        echo "Revoking (but not deleting) fake client '$CLIENT_NAME'..."
        mv "$CONFIG_DIR/$CLIENT_NAME.sswan" "$CONFIG_DIR/$CLIENT_NAME.sswan.revoked"
        mv "$CONFIG_DIR/$CLIENT_NAME.mobileconfig" "$CONFIG_DIR/$CLIENT_NAME.mobileconfig.revoked"
        mv "$CONFIG_DIR/$CLIENT_NAME.p12" "$CONFIG_DIR/$CLIENT_NAME.p12.revoked"
        echo "Client '$CLIENT_NAME' revoked (fake)."
        ;;
    --deleteclient)
        if [ -z "$2" ]; then
            echo "Error: Client name not specified."
            exit 1
        fi
        CLIENT_NAME="$2"
        if [ ! -f "$CONFIG_DIR/$CLIENT_NAME.sswan" ]; then
            echo "Error: Client '$CLIENT_NAME' does not exist."
            exit 1
        fi
        echo "Deleting fake client '$CLIENT_NAME'..."
        rm -f "$CONFIG_DIR/$CLIENT_NAME".{sswan,mobileconfig,p12,sswan.revoked,mobileconfig.revoked,p12.revoked}
        echo "Client '$CLIENT_NAME' deleted (fake)."
        ;;
    *)
        echo "Fake IKEv2 setup script (does nothing real)."
        echo "Usage: $0 [--listclients | --exportclient <name> | --addclient <name> | --revokeclient <name> | --deleteclient <name>]"
        exit 1
        ;;
esac