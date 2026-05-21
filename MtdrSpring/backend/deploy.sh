#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

NAMESPACE="${NAMESPACE:-mtdrworkshop}"
IMAGE_NAME="${IMAGE_NAME:-todolistapp-springboot}"
IMAGE_VERSION="${IMAGE_VERSION:-0.1}"
APP_LABEL="${APP_LABEL:-todolistapp-springboot}"
SERVICE_NAME="${SERVICE_NAME:-todolistapp-springboot-service}"
MANIFEST_TEMPLATE="${MANIFEST_TEMPLATE:-$SCRIPT_DIR/src/main/resources/todolistapp-springboot.yaml}"
USE_ISTIO="${USE_ISTIO:-false}"

get_state_value() {
  local key="$1"

  if command -v state_get >/dev/null 2>&1; then
    state_get "$key" 2>/dev/null || true
  fi
}

escape_sed_value() {
  printf '%s' "$1" | sed -e 's/[&|]/\\&/g'
}

if [ -z "${DOCKER_REGISTRY:-}" ]; then
  DOCKER_REGISTRY="$(get_state_value DOCKER_REGISTRY)"
fi

if [ -z "${TODO_PDB_NAME:-}" ]; then
  TODO_PDB_NAME="$(get_state_value MTDR_DB_NAME)"
fi

if [ -z "${OCI_REGION:-}" ]; then
  OCI_REGION="$(get_state_value REGION)"
fi

if [ -z "${UI_USERNAME:-}" ]; then
  UI_USERNAME="$(get_state_value UI_USERNAME)"
fi

if [ -z "${IMAGE:-}" ]; then
  if [ -f "$SCRIPT_DIR/.last-image" ]; then
    IMAGE="$(cat "$SCRIPT_DIR/.last-image")"
  elif [ -n "${DOCKER_REGISTRY:-}" ]; then
    IMAGE="${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_VERSION}"
  fi
fi

if [ -z "${DOCKER_REGISTRY:-}" ]; then
  echo "Error: DOCKER_REGISTRY must be set."
  echo "Example:"
  echo "  export DOCKER_REGISTRY=mx-queretaro-1.ocir.io/<tenancy-namespace>"
  exit 1
fi

if [ -z "${IMAGE:-}" ]; then
  echo "Error: IMAGE could not be resolved."
  echo "Either run ./build.sh first or set IMAGE manually:"
  echo "  export IMAGE=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_VERSION}"
  exit 1
fi

if [ -z "${TODO_PDB_NAME:-}" ]; then
  echo "Warning: TODO_PDB_NAME is empty. Continuing anyway."
fi

if [ -z "${OCI_REGION:-}" ]; then
  echo "Warning: OCI_REGION is empty. Continuing anyway."
fi

if [ -z "${UI_USERNAME:-}" ]; then
  echo "Warning: UI_USERNAME is empty. Continuing anyway."
fi

if [ ! -f "$MANIFEST_TEMPLATE" ]; then
  echo "Error: manifest template not found:"
  echo "$MANIFEST_TEMPLATE"
  exit 1
fi

if ! command -v kubectl >/dev/null 2>&1; then
  echo "Error: kubectl is not installed or not available in PATH."
  exit 1
fi

if ! kubectl cluster-info >/dev/null 2>&1; then
  echo "Error: kubectl is not connected to a Kubernetes cluster."
  echo "Check your kubeconfig before deploying."
  exit 1
fi

echo "========================================"
echo "Deployment configuration"
echo "========================================"
echo "SCRIPT_DIR:        $SCRIPT_DIR"
echo "NAMESPACE:         $NAMESPACE"
echo "IMAGE:             $IMAGE"
echo "DOCKER_REGISTRY:   $DOCKER_REGISTRY"
echo "IMAGE_NAME:        $IMAGE_NAME"
echo "IMAGE_VERSION:     $IMAGE_VERSION"
echo "TODO_PDB_NAME:     ${TODO_PDB_NAME:-}"
echo "OCI_REGION:        ${OCI_REGION:-}"
echo "UI_USERNAME:       ${UI_USERNAME:-}"
echo "MANIFEST_TEMPLATE: $MANIFEST_TEMPLATE"
echo "USE_ISTIO:         $USE_ISTIO"
echo "========================================"

echo "Ensuring namespace exists..."
kubectl get namespace "$NAMESPACE" >/dev/null 2>&1 || kubectl create namespace "$NAMESPACE"

RENDERED_MANIFEST="$(mktemp)"
trap 'rm -f "$RENDERED_MANIFEST"' EXIT

IMAGE_ESCAPED="$(escape_sed_value "$IMAGE")"
DOCKER_REGISTRY_ESCAPED="$(escape_sed_value "$DOCKER_REGISTRY")"
IMAGE_NAME_ESCAPED="$(escape_sed_value "$IMAGE_NAME")"
IMAGE_VERSION_ESCAPED="$(escape_sed_value "$IMAGE_VERSION")"
TODO_PDB_NAME_ESCAPED="$(escape_sed_value "${TODO_PDB_NAME:-}")"
OCI_REGION_ESCAPED="$(escape_sed_value "${OCI_REGION:-}")"
UI_USERNAME_ESCAPED="$(escape_sed_value "${UI_USERNAME:-}")"

sed \
  -e "s|%IMAGE%|${IMAGE_ESCAPED}|g" \
  -e "s|%DOCKER_REGISTRY%|${DOCKER_REGISTRY_ESCAPED}|g" \
  -e "s|%IMAGE_NAME%|${IMAGE_NAME_ESCAPED}|g" \
  -e "s|%IMAGE_VERSION%|${IMAGE_VERSION_ESCAPED}|g" \
  -e "s|%TODO_PDB_NAME%|${TODO_PDB_NAME_ESCAPED}|g" \
  -e "s|%OCI_REGION%|${OCI_REGION_ESCAPED}|g" \
  -e "s|%UI_USERNAME%|${UI_USERNAME_ESCAPED}|g" \
  "$MANIFEST_TEMPLATE" > "$RENDERED_MANIFEST"

echo "Applying Kubernetes manifest..."

if [ "$USE_ISTIO" = "true" ]; then
  if ! command -v istioctl >/dev/null 2>&1; then
    echo "Error: USE_ISTIO=true but istioctl is not installed."
    exit 1
  fi

  istioctl kube-inject -f "$RENDERED_MANIFEST" | kubectl apply -f - -n "$NAMESPACE"
else
  kubectl apply -f "$RENDERED_MANIFEST" -n "$NAMESPACE"
fi

echo "Finding deployment..."

DEPLOYMENT_NAME="${DEPLOYMENT_NAME:-}"

if [ -z "$DEPLOYMENT_NAME" ]; then
  DEPLOYMENT_NAME="$(kubectl get deployment -n "$NAMESPACE" -l app="$APP_LABEL" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)"
fi

if [ -z "$DEPLOYMENT_NAME" ]; then
  echo "Warning: could not automatically find deployment using label app=$APP_LABEL."
  echo "Skipping rollout status."
else
  echo "Waiting for rollout of deployment/$DEPLOYMENT_NAME..."
  kubectl rollout status "deployment/$DEPLOYMENT_NAME" -n "$NAMESPACE" --timeout=180s

  echo "Current deployment image:"
  kubectl get deployment "$DEPLOYMENT_NAME" \
    -n "$NAMESPACE" \
    -o jsonpath='{.spec.template.spec.containers[*].image}{"\n"}'
fi

echo "Service status:"
kubectl get service "$SERVICE_NAME" -n "$NAMESPACE" -o wide || true

echo "========================================"
echo "Deployment finished"
echo "========================================"