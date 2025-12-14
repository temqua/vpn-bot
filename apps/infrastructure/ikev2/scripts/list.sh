#!/bin/bash
CA_NAME="IKEv2 VPN CA"
CERT_DB="sql:/etc/ipsec.d"
CONF_DIR="/etc/ipsec.d"
CONF_FILE="/etc/ipsec.d/.vpnconfig"
IKEV2_CONF="/etc/ipsec.d/ikev2.conf"
IPSEC_CONF="/etc/ipsec.conf"
list_existing_clients() {
  echo "Checking for existing IKEv2 client(s)..."
  echo
  client_names=$(certutil -L -d "$CERT_DB" | grep -v -e '^$' -e "$CA_NAME" -e '\.' | tail -n +3 | cut -f1 -d ' ')
  max_len=$(printf '%s\n' "$client_names" | wc -L 2>/dev/null)
  [[ $max_len =~ ^[0-9]+$ ]] || max_len=64
  [ "$max_len" -gt "64" ] && max_len=64
  [ "$max_len" -lt "16" ] && max_len=16
  printf "%-${max_len}s  %s\n" 'Client Name' 'Certificate Status'
  printf "%-${max_len}s  %s\n" '------------' '-------------------'
  if [ -n "$client_names" ]; then
    client_list=$(printf '%s\n' "$client_names" | LC_ALL=C sort)
    while IFS= read -r line; do
      printf "%-${max_len}s  " "$line"
      client_status=$(certutil -V -u C -d "$CERT_DB" -n "$line" | grep -o -e ' valid' -e expired -e revoked | sed -e 's/^ //')
      [ -z "$client_status" ] && client_status=unknown
      printf '%s\n' "$client_status"
    done <<< "$client_list"
  fi
  client_count=$(printf '%s\n' "$client_names" | wc -l 2>/dev/null)
  [ -z "$client_names" ] && client_count=0
  if [ "$client_count" = 1 ]; then
    printf '\n%s\n' "Total: 1 client"
  elif [ -n "$client_count" ]; then
    printf '\n%s\n' "Total: $client_count clients"
  fi
}

list_existing_clients