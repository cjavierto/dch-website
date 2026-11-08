#!/bin/bash
# Runs on the server when cPanel deploys the `deploy` branch (see .cpanel.yml).
# Copies the prebuilt site into the Node.js app folder, installs dependencies
# if they changed, restarts the app, and expires the build-time page snapshots
# so pages render from the live database. Never touches data/, media/,
# uploads/, node_modules or the app's environment variables.
# Log: ~/dch-deploy.log
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
source "$REPO_DIR/.deploy-env"   # SITE_URL, APP_DIR, SOURCE_COMMIT
LOG="$HOME/dch-deploy.log"
exec > >(tee -a "$LOG") 2>&1

echo
echo "== $(date '+%Y-%m-%d %H:%M:%S') deploying build of ${SOURCE_COMMIT:0:7} to $APP_DIR"
mkdir -p "$APP_DIR/tmp"

# Lockfile before copying, to tell whether dependencies changed.
lock_changed=1
if [ -f "$APP_DIR/package-lock.json" ] && cmp -s "$REPO_DIR/package-lock.json" "$APP_DIR/package-lock.json"; then
  lock_changed=0
fi

# Mirror a directory (removing files the new build no longer has).
# Extra arguments are rsync excludes: paths kept on the server as they are.
mirror() {
  local dir=$1; shift
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete "$@" "$REPO_DIR/$dir/" "$APP_DIR/$dir/"
  else
    rm -rf "${APP_DIR:?}/$dir" && cp -R "$REPO_DIR/$dir" "$APP_DIR/$dir"
  fi
}

# Resized images (next/image) live in .next/cache/images. Keep them across
# deploys so every thumbnail isn't re-made, slowly, after each release.
image_cache="$APP_DIR/.next/cache/images"
kept_cache=""
if ! command -v rsync >/dev/null 2>&1 && [ -d "$image_cache" ]; then
  kept_cache="$(mktemp -d)" && mv "$image_cache" "$kept_cache/images"
fi
mirror .next --exclude /cache/images/
if [ -n "$kept_cache" ]; then
  mkdir -p "$APP_DIR/.next/cache" && mv "$kept_cache/images" "$image_cache" && rmdir "$kept_cache"
fi
mirror public
mirror src
for f in server.js server.cjs next.config.ts package.json package-lock.json tsconfig.json; do
  cp "$REPO_DIR/$f" "$APP_DIR/$f"
done
echo "Files copied."

# Install dependencies when they changed, inside the app's Node.js environment
# (the same as cPanel → Setup Node.js App → "Run NPM Install").
if [ "$lock_changed" = 1 ]; then
  app_name="$(basename "$APP_DIR")"
  activate="$(ls -d "$HOME"/nodevenv/"$app_name"/*/bin/activate 2>/dev/null | sort -V | tail -1 || true)"
  if [ -n "$activate" ]; then
    echo "Dependencies changed — installing (this can take a few minutes)…"
    # cPanel's activate script reads unset variables, so relax `set -u` around it.
    set +u
    # shellcheck disable=SC1090
    source "$activate"
    set -u
    (cd "$APP_DIR" && npm install --omit=dev --no-audit --no-fund)
    set +u
    deactivate || true
    set -u
  else
    echo "WARNING: dependencies changed but no Node.js environment was found for '$app_name'."
    echo "         Create the app in cPanel → Setup Node.js App, then click 'Run NPM Install'."
  fi
fi

# Restart the app (Passenger watches this file).
touch "$APP_DIR/tmp/restart.txt"
echo "App restart requested."

# Shared secret between this script and the site's /deploy-hook route,
# created on the first deploy. Readable only by this account.
SECRET_FILE="$HOME/.dch-deploy-hook-secret"
if [ ! -s "$SECRET_FILE" ]; then
  (umask 077 && head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n' > "$SECRET_FILE")
fi

# Expire build-time snapshots so pages show live content. The first request
# also starts the app, so allow time and retry.
if [ -n "${SITE_URL:-}" ]; then
  refreshed=0
  for attempt in 1 2 3; do
    if curl -fsS -m 120 -X POST -H "Authorization: Bearer $(cat "$SECRET_FILE")" "$SITE_URL/deploy-hook" >/dev/null; then
      refreshed=1
      break
    fi
    echo "Content refresh attempt $attempt failed; retrying in 10s…"
    sleep 10
  done
  if [ "$refreshed" = 1 ]; then
    echo "Live content refreshed."
  else
    echo "WARNING: could not refresh content. Pages may show build-time content for up to an hour; deploy again or edit any item in the admin."
  fi
fi

echo "== done"
