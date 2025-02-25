#!/bin/bash

BASE_NAME="nagp2024mcart0test5"
COUNTER=0

echo "Starting resource group name check..."

while true; do
  RESOURCE_GROUP_NAME="${BASE_NAME}${COUNTER}"
  echo "Checking for resource group: $RESOURCE_GROUP_NAME"

  if az group exists --name "$RESOURCE_GROUP_NAME"; then
    echo "Resource group '$RESOURCE_GROUP_NAME' exists. Incrementing counter."
    COUNTER=$((COUNTER + 1))
  else
    echo "Resource group '$RESOURCE_GROUP_NAME' does not exist. Proceeding with deployment."
    break
  fi
done

echo "Generated unique resource group name: $RESOURCE_GROUP_NAME"

# Create a temporary parameters file.
TEMP_PARAMS_FILE="temp.parameters.bicepparam"
cat <<EOF > "$TEMP_PARAMS_FILE"
using 'createResourceGroup.bicep'

param resourceGroupName = '$RESOURCE_GROUP_NAME'
param resourceGroupLocation = 'centralindia'
EOF

echo "Created temporary parameter file: $TEMP_PARAMS_FILE"

# Deploy using the temporary parameters file.
echo "Starting Azure deployment..."

az deployment sub create \
  --location centralindia \
  --template-file createResourceGroup.bicep \
  --parameters "$TEMP_PARAMS_FILE" \
  --name createResourceGroupDeployment

DEPLOYMENT_STATUS=$? # Capture the exit code of the deployment command

if [ $DEPLOYMENT_STATUS -eq 0 ]; then
  echo "Azure deployment successful."
else
  echo "Azure deployment failed. Exit code: $DEPLOYMENT_STATUS"
fi

# Optionally, remove the temporary parameters file.
rm "$TEMP_PARAMS_FILE"
echo "Removed temporary parameter file: $TEMP_PARAMS_FILE"

echo "Script execution complete."