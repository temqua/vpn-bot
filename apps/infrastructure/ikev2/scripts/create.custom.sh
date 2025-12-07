#!/bin/bash
client=$1
IKE_SH_PATH=""
clients_directory=$IKE_CLIENTS_DIR
if [[ "$LOCAL_DEBUG" == "true" ]]; then
  echo "Local debug enabled"
  clients_directory="../debug/clients"
  IKE_SH_PATH="./"
  mkdir -p $clients_directory
fi

echo "Creating IKEv2 client $client"
mkdir -p "$clients_directory/$client"
echo "Command: ${IKE_SH_PATH}ikev2.sh --addclient $client"
CONFIG_DIR=$clients_directory ${IKE_SH_PATH}ikev2.sh --addclient "$client"
if [[ $? -eq 0 ]]; then
  cd $clients_directory || exit
  mv "$client".* "$client"
  zip -r "$client.zip" "$client"
  mv "$client.zip" "$client"
fi

CA_NAME="IKEv2 VPN CA"
CERT_DB="sql:/etc/ipsec.d"
CONF_DIR="/etc/ipsec.d"
CONF_FILE="/etc/ipsec.d/.vpnconfig"
IKEV2_CONF="/etc/ipsec.d/ikev2.conf"
IPSEC_CONF="/etc/ipsec.conf"

  print_client_info() {
cat <<'EOF'
Client configuration is available at:
EOF
cat <<EOF
$export_dir$client_name.p12 (for Windows & Linux)
$export_dir$client_name.sswan (for Android)
$export_dir$client_name.mobileconfig (for iOS & macOS)
EOF
  if [ "$use_config_password" = 1 ]; then
cat <<EOF

*IMPORTANT* Password for client config files:
$p12_password
Write this down, you'll need it for import!
EOF
  fi
  config_url="https://vpnsetup.net/clients"
  if [ "$in_container" = 1 ]; then
    config_url="${config_url}2"
  fi
cat <<EOF

Next steps: Configure IKEv2 clients. See:
$config_url

================================================

EOF
}

check_and_set_client_validity() {
    client_validity=120
}

create_client_cert() {
  bigecho2 "Generating client certificate..."
  sleep 1
  certutil -z <(head -c 1024 /dev/urandom) \
    -S -c "$CA_NAME" -n "$client_name" \
    -s "O=IKEv2 VPN,CN=$client_name" \
    -k rsa -g 3072 -v "$client_validity" \
    -d "$CERT_DB" -t ",," \
    --keyUsage digitalSignature,keyEncipherment \
    --extKeyUsage serverAuth,clientAuth -8 "$client_name" >/dev/null 2>&1 || exiterr "Failed to create client certificate."
}

export_client_config() {
  install_base64_uuidgen
  update_ikev2_conf
  export_p12_file
  create_mobileconfig
  create_android_profile
}

export_p12_file() {
  bigecho2 "Creating client configuration..."
  get_p12_password
  p12_file="$export_dir$client_name.p12"
  p12_file_enc="$export_dir$client_name.enc.p12"
  pk12util -W "$p12_password" -d "$CERT_DB" -n "$client_name" -o "$p12_file_enc" >/dev/null || exit 1
  if [ "$os_ver" = "bookwormsid" ] || openssl version 2>/dev/null | grep -q "^OpenSSL 3"; then
    ca_crt="$export_dir$client_name.ca.crt"
    client_crt="$export_dir$client_name.client.crt"
    client_key="$export_dir$client_name.client.key"
    pem_file="$export_dir$client_name.temp.pem"
    openssl pkcs12 -in "$p12_file_enc" -passin "pass:$p12_password" -cacerts -nokeys -out "$ca_crt" || exit 1
    openssl pkcs12 -in "$p12_file_enc" -passin "pass:$p12_password" -clcerts -nokeys -out "$client_crt" || exit 1
    openssl pkcs12 -in "$p12_file_enc" -passin "pass:$p12_password" -passout "pass:$p12_password" \
      -nocerts -out "$client_key" || exit 1
    cat "$client_key" "$client_crt" "$ca_crt" > "$pem_file"
    /bin/rm -f "$client_key" "$client_crt" "$ca_crt"
    openssl pkcs12 -keypbe PBE-SHA1-3DES -certpbe PBE-SHA1-3DES -export -in "$pem_file" -out "$p12_file_enc" \
      -legacy -name "$client_name" -passin "pass:$p12_password" -passout "pass:$p12_password" || exit 1
    if [ "$use_config_password" = 0 ]; then
      openssl pkcs12 -keypbe PBE-SHA1-3DES -certpbe PBE-SHA1-3DES -export -in "$pem_file" -out "$p12_file" \
        -legacy -name "$client_name" -passin "pass:$p12_password" -passout pass: || exit 1
    fi
    /bin/rm -f "$pem_file"
  elif [ "$os_type" = "alpine" ] || [ "$os_ver" = "kalirolling" ] || [ "$os_ver" = "bullseyesid" ]; then
    pem_file="$export_dir$client_name.temp.pem"
    openssl pkcs12 -in "$p12_file_enc" -out "$pem_file" -passin "pass:$p12_password" -passout "pass:$p12_password" || exit 1
    openssl pkcs12 -keypbe PBE-SHA1-3DES -certpbe PBE-SHA1-3DES -export -in "$pem_file" -out "$p12_file_enc" \
      -name "$client_name" -passin "pass:$p12_password" -passout "pass:$p12_password" || exit 1
    if [ "$use_config_password" = 0 ]; then
      openssl pkcs12 -keypbe PBE-SHA1-3DES -certpbe PBE-SHA1-3DES -export -in "$pem_file" -out "$p12_file" \
        -name "$client_name" -passin "pass:$p12_password" -passout pass: || exit 1
    fi
    /bin/rm -f "$pem_file"
  elif [ "$use_config_password" = 0 ]; then
    pk12util -W "" -d "$CERT_DB" -n "$client_name" -o "$p12_file" >/dev/null || exit 1
  fi
  if [ "$use_config_password" = 1 ]; then
    /bin/cp -f "$p12_file_enc" "$p12_file"
  fi
  if [ "$export_to_home_dir" = 1 ]; then
    chown "$SUDO_USER:$SUDO_USER" "$p12_file"
  fi
  chmod 600 "$p12_file"
}

install_base64_uuidgen() {
  if ! command -v base64 >/dev/null 2>&1 || ! command -v uuidgen >/dev/null 2>&1; then
    bigecho2 "Installing required packages..."
    if [ "$os_type" = "ubuntu" ] || [ "$os_type" = "debian" ] || [ "$os_type" = "raspbian" ]; then
      export DEBIAN_FRONTEND=noninteractive
      apt-get -yqq update || apt-get -yqq update || exiterr "'apt-get update' failed."
    fi
  fi
  if ! command -v base64 >/dev/null 2>&1; then
      apt-get -yqq install coreutils >/dev/null || exiterr "'apt-get install' failed."
  fi
  if ! command -v uuidgen >/dev/null 2>&1; then
      apt-get -yqq install uuid-runtime >/dev/null || exiterr "'apt-get install' failed."
  fi
}

install_uuidgen() {
  if ! command -v uuidgen >/dev/null 2>&1; then
    bigecho2 "Installing required packages..."
    apk add -U -q uuidgen || exiterr "'apk add' failed."
  fi
}

update_ikev2_conf() {
  if grep -qs 'ike=aes256-sha2,aes128-sha2,aes256-sha1,aes128-sha1$' "$IKEV2_CONF"; then
    bigecho2 "Updating IKEv2 configuration..."
    sed -i \
      "/ike=aes256-sha2,aes128-sha2,aes256-sha1,aes128-sha1$/s/ike=/ike=aes_gcm_c_256-hmac_sha2_256-ecp_256,/" \
      "$IKEV2_CONF"
    restart_ipsec_service >/dev/null
  fi
}

create_mobileconfig() {
  [ -z "$server_addr" ] && get_server_address
  p12_file_enc="$export_dir$client_name.enc.p12"
  p12_base64=$(base64 -w 52 "$p12_file_enc")
  /bin/rm -f "$p12_file_enc"
  [ -z "$p12_base64" ] && exiterr "Could not encode .p12 file."
  ca_base64=$(certutil -L -d "$CERT_DB" -n "$CA_NAME" -a | grep -v CERTIFICATE)
  [ -z "$ca_base64" ] && exiterr "Could not encode $CA_NAME certificate."
  uuid1=$(uuidgen)
  [ -z "$uuid1" ] && exiterr "Could not generate UUID value."
  mc_file="$export_dir$client_name.mobileconfig"
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
EOF
  if [ "$use_config_password" = 0 ]; then
cat >> "$mc_file" <<EOF
      <key>Password</key>
      <string>$p12_password</string>
EOF
  fi
cat >> "$mc_file" <<EOF
      <key>PayloadCertificateFileName</key>
      <string>$client_name</string>
      <key>PayloadContent</key>
      <data>
$p12_base64
      </data>
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
      <data>
$ca_base64
      </data>
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
  if [ "$export_to_home_dir" = 1 ]; then
    chown "$SUDO_USER:$SUDO_USER" "$mc_file"
  fi
  chmod 600 "$mc_file"
}

create_android_profile() {
  [ -z "$server_addr" ] && get_server_address
  p12_base64_oneline=$(base64 -w 52 "$export_dir$client_name.p12" | sed 's/$/\\n/' | tr -d '\n')
  [ -z "$p12_base64_oneline" ] && exiterr "Could not encode .p12 file."
  uuid2=$(uuidgen)
  [ -z "$uuid2" ] && exiterr "Could not generate UUID value."
  sswan_file="$export_dir$client_name.sswan"
cat > "$sswan_file" <<EOF
{
  "uuid": "$uuid2",
  "name": "IKEv2 VPN $server_addr",
  "type": "ikev2-cert",
  "remote": {
    "addr": "$server_addr"
  },
  "local": {
    "p12": "$p12_base64_oneline",
    "rsa-pss": "true"
  },
  "ike-proposal": "aes256-sha256-modp2048",
  "esp-proposal": "aes128gcm16"
}
EOF
  if [ "$export_to_home_dir" = 1 ]; then
    chown "$SUDO_USER:$SUDO_USER" "$sswan_file"
  fi
  chmod 600 "$sswan_file"
}

update_ikev2_conf() {
  if grep -qs 'ike=aes256-sha2,aes128-sha2,aes256-sha1,aes128-sha1$' "$IKEV2_CONF"; then
    bigecho2 "Updating IKEv2 configuration..."
    sed -i \
      "/ike=aes256-sha2,aes128-sha2,aes256-sha1,aes128-sha1$/s/ike=/ike=aes_gcm_c_256-hmac_sha2_256-ecp_256,/" \
      "$IKEV2_CONF"
    restart_ipsec_service >/dev/null
  fi
}

restart_ipsec_service() {
  if [ "$in_container" = 0 ] || { [ "$in_container" = 1 ] && service ipsec status >/dev/null 2>&1; }; then
    bigecho2 "Restarting IPsec service..."
    mkdir -p /run/pluto
    service ipsec restart 2>/dev/null
  fi
}

create_p12_password() {
  p12_password=$(LC_CTYPE=C tr -dc 'A-HJ-NPR-Za-km-z2-9' </dev/urandom 2>/dev/null | head -c 18)
  [ -z "$p12_password" ] && exiterr "Could not generate a random password for .p12 file."
}

get_p12_password() {
  if [ "$use_config_password" = 0 ]; then
    create_p12_password
  else
    p12_password=$(grep -s '^IKEV2_CONFIG_PASSWORD=.\+' "$CONF_FILE" | tail -n 1 | cut -f2- -d= | sed -e "s/^'//" -e "s/'$//")
    if [ -z "$p12_password" ]; then
      create_p12_password
      if [ -n "$CONF_FILE" ] && [ -n "$CONF_DIR" ]; then
        mkdir -p "$CONF_DIR"
        printf '%s\n' "IKEV2_CONFIG_PASSWORD='$p12_password'" >> "$CONF_FILE"
        chmod 600 "$CONF_FILE"
      fi
    fi
  fi
}



check_and_set_client_validity
create_client_cert
export_client_config
print_client_added
print_client_info