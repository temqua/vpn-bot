#!/bin/bash
client=$1
clients_directory=$WG_CLIENTS_DIR
dns="8.8.8.8, 8.8.4.4"

exiterr()  { echo "Error: $1" >&2; exit 1; }

select_client_ip() {
	# Given a list of the assigned internal IPv4 addresses, obtain the lowest still
	# available octet. Important to start looking at 2, because 1 is our gateway.
	octet=2
	while grep AllowedIPs "$WG_CONF" | cut -d "." -f 4 | cut -d "/" -f 1 | grep -q "^$octet$"; do
		(( octet++ ))
	done
	# Don't break the WireGuard configuration in case the address space is full
	if [[ "$octet" -eq 255 ]]; then
		exiterr "253 clients are already configured. The WireGuard internal subnet is full!"
	fi
}

update_wg_conf() {
	# Append new client configuration to the WireGuard interface
	wg addconf wg0 <(sed -n "/^# BEGIN_PEER $client/,/^# END_PEER $client/p" "$WG_CONF")
}

new_client() {
	select_client_ip
	client_ip="10.7.0.$octet"
	echo "Using auto assigned IP address 10.7.0.$octet."
	key=$(wg genkey)
	psk=$(wg genpsk)
	# Configure client in the server
	cat << EOF >> "$WG_CONF"
# BEGIN_PEER $client
[Peer]
PublicKey = $(wg pubkey <<< "$key")
PresharedKey = $psk
AllowedIPs = 10.7.0.$octet/32$(grep -q 'fddd:2c4:2c4:2c4::1' "$WG_CONF" && echo ", fddd:2c4:2c4:2c4::$octet/128")
# END_PEER $client
EOF
	# Create client configuration
	cat << EOF > "$clients_directory/$client/$client".conf
[Interface]
Address = 10.7.0.$octet/24$(grep -q 'fddd:2c4:2c4:2c4::1' "$WG_CONF" && echo ", fddd:2c4:2c4:2c4::$octet/64")
DNS = $dns
PrivateKey = $key

[Peer]
PublicKey = $(grep PrivateKey "$WG_CONF" | cut -d " " -f 3 | wg pubkey)
PresharedKey = $psk
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = $(grep '^# ENDPOINT' "$WG_CONF" | cut -d " " -f 3):$(grep ListenPort "$WG_CONF" | cut -d " " -f 3)
PersistentKeepalive = 25
EOF
	chmod 600 "$clients_directory/$client/$client".conf
	update_wg_conf
	echo "$client added. Configuration available in: $clients_directory/$client/$client.conf"
  	qrencode -o "$clients_directory/$client/$client.png" -t PNG < "$clients_directory/$client/$client".conf  
}

echo "Creating WireGuard client $clients_directory/$client/$client.conf"
mkdir -p $clients_directory/$client
new_client
