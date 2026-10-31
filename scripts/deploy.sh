#!/usr/bin/env bash
# Build game và đẩy lên nhánh gh-pages (GitHub Pages). Dùng đăng nhập của GitHub CLI (gh).
set -euo pipefail
cd "$(dirname "$0")/.."

REPO_URL="$(git remote get-url origin)"
npx vite build

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cp -R dist/. "$TMP"/
touch "$TMP/.nojekyll"

cd "$TMP"
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push -q -f "$REPO_URL" gh-pages

echo "✅ Đã deploy. Khoảng 1 phút nữa trang sẽ cập nhật: https://quanvpit.github.io/learn-en-game/"
