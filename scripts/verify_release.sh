#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo '[1/3] Node tests'
npm test
echo '[2/3] Production Vite build'
npm run build
echo '[3/3] Done. Start with npm run dev and manually test animations, Chapter 10 and capstone.'
