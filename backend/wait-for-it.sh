#!/usr/bin/env bash
# wait-for-it.sh
#
# Use this script to test if a given TCP host/port are available
# via the `/dev/tcp` mechanism.
#
# This script is based on the work from https://github.com/vishnubob/wait-for-it
#
# Usage: wait-for-it.sh host:port [-t timeout] [-- command args]
#
# Example:
#   wait-for-it.sh postgres:5432 -t 30 -- echo "Postgres is up"
#
# MIT License
# Copyright (c) 2016 Vishnu Bob

set -e

TIMEOUT=15
QUIET=0

usage() {
  echo "Usage: $0 host:port [-t timeout] [-- command args]"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    -q|--quiet)
      QUIET=1
      shift
      ;;
    --)
      shift
      break
      ;;
    *)
      break
      ;;
  esac
done

if [ -z "$1" ]; then
  usage
fi

HOSTPORT="$1"
HOST=$(echo "$HOSTPORT" | cut -d: -f1)
PORT=$(echo "$HOSTPORT" | cut -d: -f2)

if [ -z "$HOST" ] || [ -z "$PORT" ]; then
  echo "Error: Invalid host:port '$HOSTPORT'" >&2
  exit 1
fi

start_ts=$(date +%s)
while :
do
  if timeout 1 bash -c "cat < /dev/null > /dev/tcp/$HOST/$PORT" 2>/dev/null; then
    break
  fi
  now_ts=$(date +%s)
  elapsed=$(( now_ts - start_ts ))
  if [ $elapsed -ge $TIMEOUT ]; then
    echo "Timeout after ${TIMEOUT} seconds waiting for $HOST:$PORT" >&2
    exit 1
  fi
  sleep 1
done

if [ "$QUIET" -ne 1 ]; then
  echo "$HOST:$PORT is available after $elapsed seconds."
fi

if [ $# -gt 0 ]; then
  exec "$@"
fi
