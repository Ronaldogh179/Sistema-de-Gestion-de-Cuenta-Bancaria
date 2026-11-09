#!/usr/bin/env bash
set -e
npm install
npm install --prefix server
npm install --prefix client
npm run seed --prefix server
echo "Entorno preparado correctamente"
