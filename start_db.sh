#!/bin/bash
cd /home/raspy/dev/FinPool
npm install
npx json-server -w db.json
