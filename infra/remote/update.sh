#!/bin/bash
# Pulls the current release from S3, swaps it in and re-runs the installer.
# Run by infra/release.ps1 through SSM Run Command.
set -euo pipefail
export PATH="$PATH:/snap/bin"
# shellcheck disable=SC1091
source /etc/milk/deploy.env

tmp=$(mktemp -d)
aws s3 cp "s3://$MILK_BUCKET/$MILK_RELEASE_KEY" "$tmp/release.tar.gz" --region "$MILK_REGION" --only-show-errors
mkdir "$tmp/app"
tar -xzf "$tmp/release.tar.gz" -C "$tmp/app"
rm -rf /opt/milk/app.old
if [ -d /opt/milk/app ]; then mv /opt/milk/app /opt/milk/app.old; fi
mv "$tmp/app" /opt/milk/app
rm -rf "$tmp"
bash /opt/milk/app/infra/remote/install.sh
