#!/bin/sh
set -e

# Read the nameserver from /etc/resolv.conf (works in Docker and Kubernetes)
RESOLVER=$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf)

if [ -z "$RESOLVER" ]; then
  echo "ERROR: could not determine DNS resolver from /etc/resolv.conf" >&2
  exit 1
fi

echo "Using DNS resolver: $RESOLVER"

# Substitute ${RESOLVER} in the nginx config template
export RESOLVER
envsubst '${RESOLVER}' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
