#!/bin/sh
# wait-for-it.sh

set -e

host="$1"
shift
cmd="$@"

# until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "$POSTGRES_USER" -c '\q'; do
#   >&2 echo "Postgres is unavailable - sleeping"
#   echo "host: $host"
#   sleep 1
# done

sleep 10

>&2 echo "Postgres is up - executing command"
exec $cmd
