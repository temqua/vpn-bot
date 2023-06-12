#!/bin/bash

show_usage() {
	if [ -n "$1" ]; then
		echo "Error: $1" >&2
	fi
cat 1>&2 <<EOF

Usage: bash $0 [client_name] [options]

Options:
  --auto      auto install WireGuard using default options
  -h, --help  show this help message and exit

To customize install options, run this script without arguments.
EOF
	exit 1
}

if [[ "$#" -eq 0 ]]; then
	show_usage
fi

if [[ "$1" =~ -h|--help ]]; then
	show_usage
fi

if [[ "$1" =~ "--auto" ]]; then
	auto=1
fi

new_client_dns() {
	if [ "$auto" = 0 ]; then
		echo
		echo "Select a DNS server for the client:"
		echo "   1) Current system resolvers"
		echo "   2) Google Public DNS"
		echo "   3) Cloudflare DNS"
		echo "   4) OpenDNS"
		echo "   5) Quad9"
		echo "   6) AdGuard DNS"
		echo "   7) Custom"
		read -rp "DNS server [2]: " dns
		until [[ -z "$dns" || "$dns" =~ ^[1-7]$ ]]; do
			echo "$dns: invalid selection."
			read -rp "DNS server [2]: " dns
		done
	else
		dns=1
	fi
		# DNS
	case "$dns" in
		1)
			# Locate the proper resolv.conf
			# Needed for systems running systemd-resolved
			if grep '^nameserver' "/etc/resolv.conf" | grep -qv '127.0.0.53' ; then
				resolv_conf="/etc/resolv.conf"
			else
				resolv_conf="/run/systemd/resolve/resolv.conf"
			fi
			# Extract nameservers and provide them in the required format
			dns=$(grep -v '^#\|^;' "$resolv_conf" | grep '^nameserver' | grep -v '127.0.0.53' | grep -oE '[0-9]{1,3}(\.[0-9]{1,3}){3}' | xargs | sed -e 's/ /, /g')
		;;
		2|"")
			dns="8.8.8.8, 8.8.4.4"
		;;
		3)
			dns="1.1.1.1, 1.0.0.1"
		;;
		4)
			dns="208.67.222.222, 208.67.220.220"
		;;
		5)
			dns="9.9.9.9, 149.112.112.112"
		;;
		6)
			dns="94.140.14.14, 94.140.15.15"
		;;
		7)
			enter_custom_dns
			if [ -n "$dns2" ]; then
				dns="$dns1, $dns2"
			else
				dns="$dns1"
			fi
		;;
	esac
}

enter_client_name() {
	if [ "$auto" = 0 ]; then
		echo
		echo "Enter a name for the first client:"
		read -rp "Name [client]: " unsanitized_client
		set_client_name
		[[ -z "$client" ]] && client=client
	else
		unsanitized_client=$2
		echo "You entered: $2"
		if [[ -z "$unsanitized_client" ]]; then
			echo "Enter a client name!"
			abort_and_exit
		fi
		set_client_name
		[[ -z "$client" ]] && client=client
		echo "Provided name for the client: $client"
	fi
}

set_client_name() {
	# Allow a limited set of characters to avoid conflicts
	client=$(sed 's/[^0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-]/_/g' <<< "$unsanitized_client")
}

get_export_dir() {
	export_to_home_dir=0
	export_dir=~/
	if [ -n "$SUDO_USER" ] && getent group "$SUDO_USER" >/dev/null 2>&1; then
		user_home_dir=$(getent passwd "$SUDO_USER" 2>/dev/null | cut -d: -f6)
		if [ -d "$user_home_dir" ] && [ "$user_home_dir" != "/" ]; then
			export_dir="$user_home_dir/"
			export_to_home_dir=1
		fi
	fi
}


new_client_setup() {
	get_export_dir
	# Given a list of the assigned internal IPv4 addresses, obtain the lowest still
	# available octet. Important to start looking at 2, because 1 is our gateway.
	octet=2
	while grep AllowedIPs /etc/wireguard/wg0.conf | cut -d "." -f 4 | cut -d "/" -f 1 | grep -q "$octet"; do
		(( octet++ ))
	done
	# Don't break the WireGuard configuration in case the address space is full
	if [[ "$octet" -eq 255 ]]; then
		exiterr "253 clients are already configured. The WireGuard internal subnet is full!"
	fi
	key=$(wg genkey)
	psk=$(wg genpsk)
	# Configure client in the server
	cat << EOF >> /etc/wireguard/wg0.conf
# BEGIN_PEER $client
[Peer]
PublicKey = $(wg pubkey <<< "$key")
PresharedKey = $psk
AllowedIPs = 10.7.0.$octet/32$(grep -q 'fddd:2c4:2c4:2c4::1' /etc/wireguard/wg0.conf && echo ", fddd:2c4:2c4:2c4::$octet/128")
# END_PEER $client
EOF
	# Create client configuration
	cat << EOF > "$export_dir$client".conf
[Interface]
Address = 10.7.0.$octet/24$(grep -q 'fddd:2c4:2c4:2c4::1' /etc/wireguard/wg0.conf && echo ", fddd:2c4:2c4:2c4::$octet/64")
DNS = $dns
PrivateKey = $key

[Peer]
PublicKey = $(grep PrivateKey /etc/wireguard/wg0.conf | cut -d " " -f 3 | wg pubkey)
PresharedKey = $psk
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = $(grep '^# ENDPOINT' /etc/wireguard/wg0.conf | cut -d " " -f 3):$(grep ListenPort /etc/wireguard/wg0.conf | cut -d " " -f 3)
PersistentKeepalive = 25
EOF
	if [ "$export_to_home_dir" = 1 ]; then
		chown "$SUDO_USER:$SUDO_USER" "$export_dir$client".conf
	fi
	chmod 600 "$export_dir$client".conf
}

abort_and_exit() {
	echo "Abort. No changes were made." >&2
	exit 1
}

enter_client_name
[ -z "$client" ] && abort_and_exit
while [[ -z "$client" ]] || grep -q "^# BEGIN_PEER $client$" /etc/wireguard/wg0.conf; do
	echo "$client: invalid name."
	read -rp "Name: " unsanitized_client
	[ -z "$unsanitized_client" ] && abort_and_exit
	set_client_name
done
new_client_dns
new_client_setup
# Append new client configuration to the WireGuard interface
wg addconf wg0 <(sed -n "/^# BEGIN_PEER $client/,/^# END_PEER $client/p" /etc/wireguard/wg0.conf)
echo
qrencode -t UTF8 < "$export_dir$client".conf
echo -e '\xE2\x86\x91 That is a QR code containing the client configuration.'
echo
echo "$client added. Configuration available in: $export_dir$client.conf"
exit