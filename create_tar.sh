#!/usr/bin/env bash

set -euo pipefail

# Define the files you want to include
FILES=(
  "MtdrSpring/backend/pom.xml"
  "MtdrSpring/backend/Dockerfile"
  "MtdrSpring/backend/mvnw"
  "MtdrSpring/backend/mvnw.cmd"
  "MtdrSpring/backend/build.sh"
  "MtdrSpring/backend/src/"
  "MtdrSpring/env.sh"
)

TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
ARCHIVE_NAME="octotask_${TIMESTAMP}.tar.gz"

# Validate files
for file in "${FILES[@]}"; do
  if [[ ! -e "$file" ]]; then
    echo "Error: File not found: $file" >&2
    exit 1
  fi
done

# Create archive
tar -czf "$ARCHIVE_NAME" "${FILES[@]}"

echo "Archive created: $ARCHIVE_NAME"