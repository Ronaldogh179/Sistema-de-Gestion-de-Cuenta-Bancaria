#!/usr/bin/env bash
set -euo pipefail
# Inicia un replica set de un solo miembro necesario para transferencias ACID.
if ! mongosh 'mongodb://mongo:27017/admin?directConnection=true' --quiet \
  --eval 'rs.status().ok' > /dev/null 2>&1; then
  mongosh 'mongodb://mongo:27017/admin?directConnection=true' --quiet \
    --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"mongo:27017"}]})'
fi
for i in $(seq 1 60); do
  if mongosh 'mongodb://mongo:27017/admin?directConnection=true' --quiet \
     --eval 'db.hello().isWritablePrimary' | grep -q true; then
    echo 'Replica set rs0 listo'; exit 0
  fi
  sleep 2
done
echo 'MongoDB no eligió un primario' >&2; exit 1
