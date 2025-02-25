// createResourceGroup.bicep

targetScope = 'subscription' // Set the target scope to subscription

param resourceGroupName string
param resourceGroupLocation string

resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: resourceGroupName
  location: resourceGroupLocation
}

output resourceGroupId string = rg.id
