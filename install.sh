#!/usr/bin/env bash
# LARP Installer for macOS & Linux
# Usage: curl -fsSL https://raw.githubusercontent.com/shadowytop21/larp/main/install.sh | bash

set -euo pipefail

REPO="shadowytop21/larp"
BIN_NAME="larp"
INSTALL_DIR="/usr/local/bin"

echo ""
echo "  LARP Installer for macOS/Linux"
echo "  ==============================="
echo ""

# ── 1. Detect platform ────────────────────────────────────────────────────────
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux*)  PLATFORM="linux";;
  Darwin*) PLATFORM="macos";;
  *)       echo "  ERROR: Unsupported OS: $OS"; exit 1;;
esac

case "$ARCH" in
  x86_64|amd64)  ARCH_LABEL="x64";;
  arm64|aarch64) ARCH_LABEL="arm64";;
  *)             echo "  ERROR: Unsupported architecture: $ARCH"; exit 1;;
esac

echo "  Platform: ${PLATFORM}-${ARCH_LABEL}"

# Build the expected binary name for this platform+arch
if [ "$PLATFORM" = "macos" ] && [ "$ARCH_LABEL" = "arm64" ]; then
  ASSET_NAME="larp-lang-macos-arm64"
elif [ "$PLATFORM" = "macos" ]; then
  ASSET_NAME="larp-lang-macos"
else
  ASSET_NAME="larp-lang-linux"
fi

# ── 2. Fetch the latest release URL ──────────────────────────────────────────
RELEASE_URL="https://api.github.com/repos/$REPO/releases/latest"

if command -v curl &>/dev/null; then
  RELEASE_JSON=$(curl -fsSL "$RELEASE_URL" 2>/dev/null || echo "")
elif command -v wget &>/dev/null; then
  RELEASE_JSON=$(wget -qO- "$RELEASE_URL" 2>/dev/null || echo "")
else
  echo "  ERROR: Neither curl nor wget found."
  exit 1
fi

DOWNLOAD_URL=""
if [ -n "$RELEASE_JSON" ]; then
  # Look for the exact asset name in the release
  DOWNLOAD_URL=$(echo "$RELEASE_JSON" | grep -o "\"browser_download_url\": *\"[^\"]*${ASSET_NAME}[^\"]*\"" | head -1 | grep -o 'https://[^"]*' || echo "")
fi

# If arm64 asset not found, fall back to x64 (Rosetta 2 can run it on macOS)
if [ -z "$DOWNLOAD_URL" ] && [ "$ARCH_LABEL" = "arm64" ] && [ "$PLATFORM" = "macos" ]; then
  echo "  No arm64 binary found, trying x64 (will use Rosetta 2)..."
  ASSET_NAME="larp-lang-macos"
  DOWNLOAD_URL=$(echo "$RELEASE_JSON" | grep -o "\"browser_download_url\": *\"[^\"]*${ASSET_NAME}[^\"]*\"" | head -1 | grep -o 'https://[^"]*' || echo "")
fi

if [ -z "$DOWNLOAD_URL" ]; then
  echo "  Could not find a binary for ${PLATFORM}-${ARCH_LABEL} in the latest release."
  echo "  Looking for local binary..."
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  LOCAL_BIN="$SCRIPT_DIR/bin/${ASSET_NAME}"
  if [ -f "$LOCAL_BIN" ]; then
    echo "  Found local binary: $LOCAL_BIN"
  else
    echo "  ERROR: No binary found. Place it in ./bin/ or check your internet connection."
    exit 1
  fi
fi

# ── 3. Download or copy ──────────────────────────────────────────────────────
TMP_FILE=$(mktemp)
if [ -n "$DOWNLOAD_URL" ]; then
  echo "  Downloading from $DOWNLOAD_URL ..."
  if command -v curl &>/dev/null; then
    curl -fsSL "$DOWNLOAD_URL" -o "$TMP_FILE"
  else
    wget -qO "$TMP_FILE" "$DOWNLOAD_URL"
  fi
else
  cp "$LOCAL_BIN" "$TMP_FILE"
fi

chmod +x "$TMP_FILE"

# ── 4. Install ────────────────────────────────────────────────────────────────
DEST="$INSTALL_DIR/$BIN_NAME"
if [ -w "$INSTALL_DIR" ]; then
  mv "$TMP_FILE" "$DEST"
else
  echo "  Need sudo to install to $INSTALL_DIR"
  sudo mv "$TMP_FILE" "$DEST"
fi

echo "  Installed to: $DEST"

# ── 5. Smoke test ─────────────────────────────────────────────────────────────
echo ""
if VERSION_OUTPUT=$("$DEST" version 2>&1); then
  echo "  Smoke test:  $VERSION_OUTPUT"
else
  echo "  Smoke test failed — the binary may need a newer OS or runtime."
fi

echo ""
echo "  Done! Please open a completely new terminal window and type 'larp version' to confirm it worked."
echo ""
