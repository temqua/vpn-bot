#!/bin/bash
client=$1
ikev2.sh --revokeclient $client
ikev2.sh --deleteclient $client