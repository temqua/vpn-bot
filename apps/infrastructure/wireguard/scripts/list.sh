#!/bin/bash
check_clients() {
	num_of_clients=$(grep -c '^# BEGIN_PEER' "$WG_CONF")
	if [[ "$num_of_clients" = 0 ]]; then
		echo
		echo "There are no existing clients!"
		exit 1
	fi
}

print_client_total() {
	if [ "$num_of_clients" = 1 ]; then
		printf '\n%s\n' "Total: 1 client"
	elif [ -n "$num_of_clients" ]; then
		printf '\n%s\n' "Total: $num_of_clients clients"
	fi
}

show_clients() {
	grep '^# BEGIN_PEER' "$WG_CONF" | cut -d ' ' -f 3
}

check_clients
echo
show_clients
print_client_total