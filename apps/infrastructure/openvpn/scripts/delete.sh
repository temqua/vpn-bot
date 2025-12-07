#!/bin/bash
client=$1
clients_directory=$OVPN_CLIENTS_DIR
if [[ -z $client ]]
  echo "You should enter client"
  exit 1
fi

remove_client_conf() {
	ovpn_file="$clients_directory/$client.ovpn"
	if [ -f "$ovpn_file" ]; then
		echo "Removing $ovpn_file..."
		rm -f "$ovpn_file"
	fi
  echo "$client revoked!"
}

revoke_client_ovpn() {
  echo "Revoking $client..."
	cd /etc/openvpn/server/easy-rsa/ || exit 1
	(
		set -x
		./easyrsa --batch revoke "$client" >/dev/null 2>&1
		./easyrsa --batch --days=3650 gen-crl >/dev/null 2>&1
	)
	rm -f /etc/openvpn/server/crl.pem
	rm -f /etc/openvpn/server/easy-rsa/pki/reqs/"$client".req
	rm -f /etc/openvpn/server/easy-rsa/pki/private/"$client".key
	cp /etc/openvpn/server/easy-rsa/pki/crl.pem /etc/openvpn/server/crl.pem
	# CRL is read with each client connection, when OpenVPN is dropped to nobody
	chown nobody:"$group_name" /etc/openvpn/server/crl.pem
	remove_client_conf
}

revoke_client_ovpn

if [[ $? -eq 0 ]]; then
    echo "Client '$client' has been successfully removed from OpenVPN"
else
    echo "Error: failed to remove client '$client' from OpenVPN"
fi