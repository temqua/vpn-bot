#!/bin/bash

# Проверка аргумента
if [ $# -lt 1 ]; then
    echo "Usage: $0 <client_name>"
    exit 1
fi
client_name=$1

# Проверка переменной окружения IKE_CLIENTS_DIR
if [ -z "${IKE_CLIENTS_DIR:-}" ]; then
    echo "Error: environment variable IKE_CLIENTS_DIR is not set."
    exit 1
fi
clients_directory="$IKE_CLIENTS_DIR"

echo "Creating IKEv2 client $client_name"
CLIENT_PATH="$clients_directory/$client_name/$client_name"
mkdir -p "$clients_directory/$client_name"

# Константы
CA_NAME="IKEv2 VPN CA"
CERT_DB="sql:/etc/ipsec.d"
IKEV2_CONF="/etc/ipsec.d/ikev2.conf"
IPSEC_CONF="/etc/ipsec.conf"

client_validity=120  # дни

# -------------------------------
# Функции
# -------------------------------

get_server_address() {
    server_addr=$(grep -s "^leftcert=" "$IKEV2_CONF" | head -n1 | cut -d= -f2- | xargs)
    [ -z "$server_addr" ] && server_addr=$(grep -s "^leftcert=" "$IPSEC_CONF" | head -n1 | cut -d= -f2- | xargs)
    if [ -z "$server_addr" ]; then
        echo "Could not get VPN server address."
        exit 1
    fi
}

print_client_info() {
cat <<EOF
Client configuration is available at:
$CLIENT_PATH.p12 (Windows & Linux)
$CLIENT_PATH.sswan (Android)
$CLIENT_PATH.mobileconfig (iOS & macOS)
EOF
}

create_client_cert() {
    echo "Generating client certificate..."
    certutil -z <(head -c 1024 /dev/urandom) \
        -S -c "$CA_NAME" -n "$client_name" \
        -s "O=IKEv2 VPN,CN=$client_name" \
        -k rsa -g 3072 -v "$client_validity" \
        -d "$CERT_DB" -t ",," \
        --keyUsage digitalSignature,keyEncipherment \
        --extKeyUsage serverAuth,clientAuth -8 "$client_name"
}

export_p12_file() {
    p12_file="$CLIENT_PATH.p12"
    pk12util -d "$CERT_DB" -n "$client_name" -o "$p12_file" -W ""
    chmod 600 "$p12_file"
}

create_mobileconfig() {
    [ -z "${server_addr:-}" ] && get_server_address
    p12_base64=$(base64 -w 52 "$CLIENT_PATH.p12")
    ca_base64=$(certutil -L -d "$CERT_DB" -n "$CA_NAME" -a | grep -v CERTIFICATE)
    uuid1=$(uuidgen)

    mc_file="$CLIENT_PATH.mobileconfig"
cat > "$mc_file" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>IKEv2</key>
      <dict>
        <key>AuthenticationMethod</key>
        <string>Certificate</string>
        <key>LocalIdentifier</key>
        <string>$client_name</string>
        <key>RemoteAddress</key>
        <string>$server_addr</string>
        <key>RemoteIdentifier</key>
        <string>$server_addr</string>
      </dict>
      <key>PayloadCertificateUUID</key>
      <string>$uuid1</string>
    </dict>
    <dict>
      <key>PayloadContent</key>
      <data>
$p12_base64
      </data>
      <key>PayloadCertificateFileName</key>
      <string>$client_name</string>
    </dict>
    <dict>
      <key>PayloadContent</key>
      <data>
$ca_base64
      </data>
      <key>PayloadCertificateFileName</key>
      <string>ikev2vpnca</string>
    </dict>
  </array>
</dict>
</plist>
EOF
    chmod 600 "$mc_file"

    # Проверка синтаксиса mobileconfig
    if ! plistutil -lint "$mc_file"; then
        echo "Error: mobileconfig file is invalid!"
        exit 1
    fi
}

create_android_profile() {
    [ -z "${server_addr:-}" ] && get_server_address
    p12_base64_oneline=$(base64 -w 0 "$CLIENT_PATH.p12")
    uuid2=$(uuidgen)
    sswan_file="$CLIENT_PATH.sswan"
cat > "$sswan_file" <<EOF
{
  "uuid": "$uuid2",
  "name": "IKEv2 VPN $server_addr",
  "type": "ikev2-cert",
  "remote": {"addr": "$server_addr"},
  "local": {"p12": "$p12_base64_oneline", "rsa-pss": "true"},
  "ike-proposal": "aes256-sha256-modp2048",
  "esp-proposal": "aes128gcm16"
}
EOF
    chmod 600 "$sswan_file"

    # Проверка синтаксиса JSON
    if ! jq . "$sswan_file"; then
        echo "Error: sswan file is invalid!"
        exit 1
    fi
}

create_client_cert
export_p12_file
create_mobileconfig
create_android_profile
print_client_info

# Создание zip-архива
cd "$clients_directory/$client_name"
zip -r "$client_name.zip" "$client_name.*"
