#!/bin/sh
set -e

# Read the nameserver from /etc/resolv.conf (works in Docker and Kubernetes)
RESOLVER=$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf)

if [ -z "$RESOLVER" ]; then
  echo "ERROR: could not determine DNS resolver from /etc/resolv.conf" >&2
  exit 1
fi

echo "Using DNS resolver: $RESOLVER"

# BACKEND_HOST must be set by the container runtime
if [ -z "$BACKEND_HOST" ]; then
  echo "ERROR: BACKEND_HOST environment variable is not set" >&2
  exit 1
fi

echo "Using backend host: $BACKEND_HOST"

# Substitute ${RESOLVER} and ${BACKEND_HOST} in the nginx config template
export RESOLVER
envsubst '${RESOLVER} ${BACKEND_HOST}' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
