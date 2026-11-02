#!/usr/bin/env bash
# Builds the site and zips what Namecheap's "Setup Node.js App" needs.
#   npm run package:namecheap            # code only — safe for every deploy
#   npm run package:namecheap -- --data  # also the database + uploads (first deploy only:
#                                        # later deploys would overwrite live content)
# Dependencies are installed on the server ("Run NPM Install"), so native
# modules (sharp, libsql) get Linux binaries. See README → Deploying.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

out="dch-web-$(date +%Y%m%d-%H%M).zip"
items=(.next public src server.js server.cjs next.config.ts package.json package-lock.json tsconfig.json)
if [[ "${1:-}" == "--data" ]]; then items+=(data media); fi

rm -f "$out"
zip -qr "$out" "${items[@]}" -x ".next/cache/*" ".next/dev/*" "*.DS_Store"
echo "Wrote $out"
