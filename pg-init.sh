#!/bin/bash
set -e
psql -U postgres <<EOF
CREATE USER vpnuser WITH PASSWORD 'T396Ju3mD&34';
EOF
npx prisma generate