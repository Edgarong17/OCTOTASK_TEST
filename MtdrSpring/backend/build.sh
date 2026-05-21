#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

IMAGE_NAME="${IMAGE_NAME:-todolistapp-springboot}"
IMAGE_VERSION="${IMAGE_VERSION:-0.1}"
PUSH_IMAGE="${PUSH_IMAGE:-true}"
REMOVE_LOCAL_IMAGE="${REMOVE_LOCAL_IMAGE:-false}"
RUN_MAVEN_BEFORE_DOCKER="${RUN_MAVEN_BEFORE_DOCKER:-auto}"

get_state_value() {
  local key="$1"

  if command -v state_get >/dev/null 2>&1; then
    state_get "$key" 2>/dev/null || true
  fi
}

if [ -z "${DOCKER_REGISTRY:-}" ]; then
  DOCKER_REGISTRY="$(get_state_value DOCKER_REGISTRY)"
fi

if [ -z "${DOCKER_REGISTRY:-}" ]; then
  echo "Error: DOCKER_REGISTRY must be set."
  echo "Example:"
  echo "  export DOCKER_REGISTRY=mx-queretaro-1.ocir.io/<tenancy-namespace>"
  exit 1
fi

IMAGE="${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_VERSION}"

echo "========================================"
echo "Build configuration"
echo "========================================"
echo "SCRIPT_DIR:              $SCRIPT_DIR"
echo "IMAGE_NAME:              $IMAGE_NAME"
echo "IMAGE_VERSION:           $IMAGE_VERSION"
echo "DOCKER_REGISTRY:         $DOCKER_REGISTRY"
echo "IMAGE:                   $IMAGE"
echo "PUSH_IMAGE:              $PUSH_IMAGE"
echo "REMOVE_LOCAL_IMAGE:      $REMOVE_LOCAL_IMAGE"
echo "RUN_MAVEN_BEFORE_DOCKER: $RUN_MAVEN_BEFORE_DOCKER"
echo "========================================"

should_run_maven=false

if [ "$RUN_MAVEN_BEFORE_DOCKER" = "true" ]; then
  should_run_maven=true
elif [ "$RUN_MAVEN_BEFORE_DOCKER" = "auto" ]; then
  if grep -q "COPY .*target/.*\.jar" Dockerfile; then
    should_run_maven=true
  fi
fi

if [ "$should_run_maven" = "true" ]; then
  echo "Running Maven package because Dockerfile expects a pre-built jar..."

  if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    ./mvnw -B clean package spring-boot:repackage
  else
    mvn -B clean package spring-boot:repackage
  fi
else
  echo "Skipping Maven before Docker build. Dockerfile is expected to build the jar itself."
fi

echo "Building Docker image..."
docker build -f Dockerfile -t "$IMAGE" .

if [ "$PUSH_IMAGE" = "true" ]; then
  echo "Pushing Docker image..."
  docker push "$IMAGE"
else
  echo "Skipping docker push because PUSH_IMAGE=false"
fi

echo "$IMAGE" > .last-image

if [ "$REMOVE_LOCAL_IMAGE" = "true" ]; then
  echo "Removing local Docker image..."
  docker rmi "$IMAGE" || true
fi

echo "========================================"
echo "Build finished successfully"
echo "Image:"
echo "$IMAGE"
echo "Saved image reference to:"
echo "$SCRIPT_DIR/.last-image"
echo "========================================"