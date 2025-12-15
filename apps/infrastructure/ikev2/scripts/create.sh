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
CONF_FILE="/etc/ipsec.d/.vpnconfig"
CONF_DIR="/etc/ipsec.d"
client_validity=120  # дни

# -------------------------------
# Функции
# -------------------------------

get_server_address() {
    server_addr=$(grep -s "leftcert=" "$IKEV2_CONF" | head -n1 | cut -d= -f2- | xargs)
    [ -z "$server_addr" ] && server_addr=$(grep -s "leftid=" "$IPSEC_CONF" | head -n1 | cut -d= -f2- | xargs)
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
cat <<EOF

*IMPORTANT* Password for client config files:
$p12_password
Write this down, you'll need it for import!
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
        --extKeyUsage serverAuth,clientAuth -8 "$client_name" >/dev/null 2>&1 || exiterr "Failed to create client certificate."
}

export_p12_file() {
  echo "Creating client configuration..."
  get_p12_password
  p12_file="$CLIENT_PATH.p12"
  p12_file_enc="$CLIENT_PATH.enc.p12"
  pk12util -W "$p12_password" -d "$CERT_DB" -n "$client_name" -o "$p12_file_enc" >/dev/null 2>&1
  ca_crt="$CLIENT_PATH.ca.crt"
  client_crt="$CLIENT_PATH.client.crt"
  client_key="$CLIENT_PATH.client.key"
  pem_file="$CLIENT_PATH.temp.pem"
  openssl pkcs12 -in "$p12_file_enc" -passin "pass:$p12_password" -cacerts -nokeys -out "$ca_crt" 
  openssl pkcs12 -in "$p12_file_enc" -passin "pass:$p12_password" -clcerts -nokeys -out "$client_crt"
  openssl pkcs12 -in "$p12_file_enc" -passin "pass:$p12_password" -passout "pass:$p12_password" \
    -nocerts -out "$client_key"
  cat "$client_key" "$client_crt" "$ca_crt" > "$pem_file"
  /bin/rm -f "$client_key" "$client_crt" "$ca_crt"
  openssl pkcs12 -keypbe PBE-SHA1-3DES -certpbe PBE-SHA1-3DES -export -in "$pem_file" -out "$p12_file_enc" \
    -legacy -name "$client_name" -passin "pass:$p12_password" -passout "pass:$p12_password"
  if [ "$use_config_password" = 0 ]; then
    openssl pkcs12 -keypbe PBE-SHA1-3DES -certpbe PBE-SHA1-3DES -export -in "$pem_file" -out "$p12_file" \
      -legacy -name "$client_name" -passin "pass:$p12_password" -passout pass:
  fi
  /bin/rm -f "$pem_file"
  /bin/cp -f "$p12_file_enc" "$p12_file"
  chmod 600 "$p12_file"
}


create_p12_password() {
    p12_password=$(LC_CTYPE=C tr -dc 'A-HJ-NPR-Za-km-z2-9' </dev/urandom 2>/dev/null | head -c 18)
    [ -z "$p12_password" ] && {
        echo "Error: could not generate p12 password" >&2
        exit 1
    }
}

get_p12_password() {
    p12_password=$(grep -s 'IKEV2_CONFIG_PASSWORD=.\+' "$CONF_FILE" | tail -n 1 | cut -f2- -d= | sed -e "s/^'//" -e "s/'$//")
    if [ -z "$p12_password" ]; then
      create_p12_password
      if [ -n "$CONF_FILE" ] && [ -n "$CONF_DIR" ]; then
        mkdir -p "$CONF_DIR"
        printf '%s\n' "IKEV2_CONFIG_PASSWORD='$p12_password'" >> "$CONF_FILE"
        chmod 600 "$CONF_FILE"
      fi
    fi
}

create_mobileconfig() {
    [ -z "${server_addr:-}" ] && get_server_address
    p12_file_enc="$CLIENT_PATH.enc.p12"
    p12_base64=$(base64 -w 52 "$p12_file_enc")
    /bin/rm -f "$p12_file_enc"
    [ -z "$p12_base64" ] && exiterr "Could not encode .p12 file."
    ca_base64=$(certutil -L -d "$CERT_DB" -n "$CA_NAME" -a | grep -v CERTIFICATE)
    uuid1=$(uuidgen)
    [ -z "$uuid1" ] && exiterr "Could not generate UUID value."
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
        <key>ChildSecurityAssociationParameters</key>
        <dict>
          <key>DiffieHellmanGroup</key>
          <integer>19</integer>
          <key>EncryptionAlgorithm</key>
          <string>AES-256-GCM</string>
          <key>LifeTimeInMinutes</key>
          <integer>1410</integer>
        </dict>
        <key>DeadPeerDetectionRate</key>
        <string>Medium</string>
        <key>DisableRedirect</key>
        <true/>
        <key>EnableCertificateRevocationCheck</key>
        <integer>0</integer>
        <key>EnablePFS</key>
        <integer>0</integer>
        <key>IKESecurityAssociationParameters</key>
        <dict>
          <key>DiffieHellmanGroup</key>
          <integer>19</integer>
          <key>EncryptionAlgorithm</key>
          <string>AES-256-GCM</string>
          <key>IntegrityAlgorithm</key>
          <string>SHA2-256</string>
          <key>LifeTimeInMinutes</key>
          <integer>1410</integer>
        </dict>
        <key>LocalIdentifier</key>
        <string>$client_name</string>
        <key>PayloadCertificateUUID</key>
        <string>$uuid1</string>
        <key>OnDemandEnabled</key>
        <integer>0</integer>
        <key>OnDemandRules</key>
        <array>
          <dict>
            <key>InterfaceTypeMatch</key>
            <string>WiFi</string>
            <key>URLStringProbe</key>
            <string>http://captive.apple.com/hotspot-detect.html</string>
            <key>Action</key>
            <string>Connect</string>
          </dict>
          <dict>
            <key>InterfaceTypeMatch</key>
            <string>Cellular</string>
            <key>Action</key>
            <string>Disconnect</string>
          </dict>
          <dict>
            <key>Action</key>
            <string>Ignore</string>
          </dict>
        </array>
        <key>RemoteAddress</key>
        <string>$server_addr</string>
        <key>RemoteIdentifier</key>
        <string>$server_addr</string>
        <key>UseConfigurationAttributeInternalIPSubnet</key>
        <integer>0</integer>
      </dict>
      <key>IPv4</key>
      <dict>
        <key>OverridePrimary</key>
        <integer>1</integer>
      </dict>
      <key>PayloadDescription</key>
      <string>Configures VPN settings</string>
      <key>PayloadDisplayName</key>
      <string>VPN</string>
      <key>PayloadOrganization</key>
      <string>IKEv2 VPN</string>
      <key>PayloadIdentifier</key>
      <string>com.apple.vpn.managed.$(uuidgen)</string>
      <key>PayloadType</key>
      <string>com.apple.vpn.managed</string>
      <key>PayloadUUID</key>
      <string>$(uuidgen)</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>Proxies</key>
      <dict>
        <key>HTTPEnable</key>
        <integer>0</integer>
        <key>HTTPSEnable</key>
        <integer>0</integer>
      </dict>
      <key>UserDefinedName</key>
      <string>$server_addr</string>
      <key>VPNType</key>
      <string>IKEv2</string>
    </dict>
    <dict>
      <key>PayloadCertificateFileName</key>
      <string>$client_name</string>
      <key>PayloadContent</key>
      <data>$p12_base64</data>
      <key>PayloadDescription</key>
      <string>Adds a PKCS#12-formatted certificate</string>
      <key>PayloadDisplayName</key>
      <string>$client_name</string>
      <key>PayloadIdentifier</key>
      <string>com.apple.security.pkcs12.$(uuidgen)</string>
      <key>PayloadType</key>
      <string>com.apple.security.pkcs12</string>
      <key>PayloadUUID</key>
      <string>$uuid1</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
    </dict>
    <dict>
      <key>PayloadContent</key>
      <data>$ca_base64</data>
      <key>PayloadCertificateFileName</key>
      <string>ikev2vpnca</string>
      <key>PayloadDescription</key>
      <string>Adds a CA root certificate</string>
      <key>PayloadDisplayName</key>
      <string>Certificate Authority (CA)</string>
      <key>PayloadIdentifier</key>
      <string>com.apple.security.root.$(uuidgen)</string>
      <key>PayloadType</key>
      <string>com.apple.security.root</string>
      <key>PayloadUUID</key>
      <string>$(uuidgen)</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
    </dict>
  </array>
  <key>PayloadDisplayName</key>
  <string>IKEv2 VPN $server_addr</string>
  <key>PayloadIdentifier</key>
  <string>com.apple.vpn.managed.$(uuidgen)</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>$(uuidgen)</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>
EOF
    chmod 600 "$mc_file"
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
    if ! jq . "$sswan_file" >/dev/null 2>&1; then
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
cd "$clients_directory"
zip -r "$client_name.zip" "$client_name"
mv "$client_name.zip" "$client_name"
chmod 666 $client_name/$client_name.zip
