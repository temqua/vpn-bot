#!/bin/bash
client=$1
clients_directory=$WG_CLIENTS_DIR
if [[ -z $client ]]
  echo "You should enter client"
  exit 1
fi
remove_client_conf() {
	wg_dir="$clients_directory/$client"
	if [ -d "$wg_dir" ]; then
		echo "Removing $wg_dir..."
		rm -rf "$wg_dir"
  else
    echo "Failed to remove $wg_dir: is not a directory"
	fi
}

remove_client_wg() {
	# The following is the right way to avoid disrupting other active connections:
	# Remove from the live interface
	wg set wg0 peer "$(sed -n "/^# BEGIN_PEER $client$/,\$p" "$WG_CONF" | grep -m 1 PublicKey | cut -d " " -f 3)" remove
	# Remove from the configuration file
	sed -i "/^# BEGIN_PEER $client$/,/^# END_PEER $client$/d" "$WG_CONF"
	remove_client_conf
}

remove_client_wg