#!/bin/bash
# Copyright (c) 2022 Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

set -e

APP_DB_USER="${DB_APP_USERNAME:-OCTOTASK}"
WALLET_DIR="${MTDRWORKSHOP_LOCATION}/wallet"
WALLET_ZIP="${WALLET_DIR}/wallet.zip"
# Wallet download password, not the DB user password
WALLET_PASSWORD="${WALLET_PASSWORD:-Wallet1234}"

# Create Object Store Bucket (kept because later steps use it)
while ! state_done OBJECT_STORE_BUCKET; do
  echo "Checking object storage bucket"
  if oci os bucket get --name "$(state_get RUN_NAME)-$(state_get MTDR_KEY)" >/dev/null 2>&1; then
    state_set_done OBJECT_STORE_BUCKET
    echo "finished checking object storage bucket"
  else
    echo "Waiting for object storage bucket to exist"
    sleep 5
  fi
done

# Wait for DB OCID
while ! state_done MTDR_DB_OCID; do
  echo "`date`: Waiting for MTDR_DB_OCID"
  sleep 2
done

# Download wallet into the expected folder
while ! state_done WALLET_GET; do
  echo "downloading wallet into ${WALLET_DIR}"

  rm -rf "${WALLET_DIR}"
  mkdir -p "${WALLET_DIR}"

  oci db autonomous-database generate-wallet \
    --autonomous-database-id "$(state_get MTDR_DB_OCID)" \
    --file "${WALLET_ZIP}" \
    --password "${WALLET_PASSWORD}" \
    --generate-type ALL

  cd "${WALLET_DIR}"
  unzip -o wallet.zip >/dev/null

  for f in cwallet.sso ewallet.p12 keystore.jks ojdbc.properties sqlnet.ora tnsnames.ora truststore.jks; do
    if test ! -f "${WALLET_DIR}/${f}"; then
      echo "ERROR: Wallet file missing after download: ${f}"
      exit 1
    fi
  done

  cd "${MTDRWORKSHOP_LOCATION}"
  state_set_done WALLET_GET
  echo "finished downloading wallet"
done

# Upload cwallet.sso to Object Store
while ! state_done CWALLET_SSO_OBJECT; do
  echo "uploading cwallet.sso to object storage"
  cd "${WALLET_DIR}"
  oci os object put \
    --bucket-name "$(state_get RUN_NAME)-$(state_get MTDR_KEY)" \
    --name "cwallet.sso" \
    --file "cwallet.sso" >/dev/null
  cd "${MTDRWORKSHOP_LOCATION}"
  state_set_done CWALLET_SSO_OBJECT
  echo "done uploading wallet object"
done

# Create authenticated link to wallet object
while ! state_done CWALLET_SSO_AUTH_URL; do
  echo "creating authenticated link to wallet"
  ACCESS_URI=`oci os preauth-request create \
    --object-name 'cwallet.sso' \
    --access-type 'ObjectRead' \
    --bucket-name "$(state_get RUN_NAME)-$(state_get MTDR_KEY)" \
    --name 'mtdrworkshop' \
    --time-expires $(date '+%Y-%m-%d' --date '+7 days') \
    --query 'data."access-uri"' \
    --raw-output`
  state_set CWALLET_SSO_AUTH_URL "https://objectstorage.$(state_get REGION).oraclecloud.com${ACCESS_URI}"
  echo "done creating authenticated link to wallet"
done

# Wait for DB password secret
while ! state_done DB_PASSWORD; do
  echo "Waiting for DB_PASSWORD"
  sleep 5
done

# Create wallet secret for Kubernetes
while ! state_done DB_WALLET_SECRET; do
  echo "creating db-wallet-secret"
  cd "${WALLET_DIR}"

  cat - >sqlnet.ora <<!
WALLET_LOCATION = (SOURCE = (METHOD = file) (METHOD_DATA = (DIRECTORY="/mtdrworkshop/creds")))
SSL_SERVER_DN_MATCH=yes
!

  if kubectl create -f - -n mtdrworkshop; then
    state_set_done DB_WALLET_SECRET
  else
    echo 'Error: Failure to create db-wallet-secret. Retrying...'
    sleep 5
  fi <<!
apiVersion: v1
data:
  README: $(base64 -w0 README 2>/dev/null || true)
  cwallet.sso: $(base64 -w0 cwallet.sso)
  ewallet.p12: $(base64 -w0 ewallet.p12)
  keystore.jks: $(base64 -w0 keystore.jks)
  ojdbc.properties: $(base64 -w0 ojdbc.properties)
  sqlnet.ora: $(base64 -w0 sqlnet.ora)
  tnsnames.ora: $(base64 -w0 tnsnames.ora)
  truststore.jks: $(base64 -w0 truststore.jks)
kind: Secret
metadata:
  name: db-wallet-secret
!
  cd "${MTDRWORKSHOP_LOCATION}"
done

# Local DB connection setup
export TNS_ADMIN="${WALLET_DIR}"

cat - >"${TNS_ADMIN}/sqlnet.ora" <<!
WALLET_LOCATION = (SOURCE = (METHOD = file) (METHOD_DATA = (DIRECTORY="${TNS_ADMIN}")))
SSL_SERVER_DN_MATCH=yes
!

# Pick the first *_tp service from tnsnames.ora
MTDR_DB_SVC="$(grep -E '^[A-Za-z0-9_]+_tp[[:space:]]*=' "${TNS_ADMIN}/tnsnames.ora" | head -n1 | cut -d= -f1 | xargs)"
if test -z "${MTDR_DB_SVC}"; then
  MTDR_DB_SVC="$(state_get MTDR_DB_NAME)_tp"
fi

echo "Using DB service: ${MTDR_DB_SVC}"

# Read DB username from secret if present
DB_USERNAME="$(kubectl get secret dbuser -n mtdrworkshop --template='{{index .data "dbusername"}}' 2>/dev/null | base64 --decode || true)"
if test -z "${DB_USERNAME}"; then
  DB_USERNAME="${APP_DB_USER}"
fi
echo "Using DB user: ${DB_USERNAME}"

# Read DB password from secret
while true; do
  if DB_PASSWORD=`kubectl get secret dbuser -n mtdrworkshop --template={{.data.dbpassword}} | base64 --decode`; then
    if ! test -z "${DB_PASSWORD}"; then
      break
    fi
  fi
  echo "Error: Failed to get DB password. Retrying..."
  sleep 5
done

# Wait for marker from main-setup
while ! state_done MTDR_DB_PASSWORD_SET; do
  echo "`date`: Waiting for MTDR_DB_PASSWORD_SET"
  sleep 2
done

# Use existing DB user/schema and ensure the table exists
while ! state_done TODO_USER; do
  echo "connecting to database as existing user ${DB_USERNAME}"

  sqlplus /nolog <<!
WHENEVER SQLERROR EXIT 1
connect ${DB_USERNAME}/"${DB_PASSWORD}"@${MTDR_DB_SVC}

DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM user_tables
  WHERE table_name = 'TODOITEM';

  IF v_count = 0 THEN
    EXECUTE IMMEDIATE q'[
      CREATE TABLE todoitem (
        id NUMBER GENERATED ALWAYS AS IDENTITY,
        description VARCHAR2(4000),
        creation_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        done NUMBER(1,0),
        PRIMARY KEY (id)
      )
    ]';

    EXECUTE IMMEDIATE q'[
      INSERT INTO todoitem (description, done)
      VALUES ('Manual item insert', 0)
    ]';

    COMMIT;
  END IF;
END;
/
EXIT
!
  state_set_done TODO_USER
  echo "finished connecting to database and ensuring schema objects exist"
done

state_set_done DB_SETUP