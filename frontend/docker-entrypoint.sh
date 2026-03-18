#!/bin/sh
set -e

# BACKEND_HOST must be set by the container runtime
if [ -z "$BACKEND_HOST" ]; then
  echo "ERROR: BACKEND_HOST environment variable is not set" >&2
  exit 1
fi

echo "Using backend host: $BACKEND_HOST"

# Render the backend host into the nginx config template.
envsubst '${BACKEND_HOST}' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
