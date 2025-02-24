// param name string = 'nagp2024mcart0testacr'
param name string
param skuName string = 'Basic' // Add parameter for SKU
param location string = resourceGroup().location
param adminUserEnabled bool = false // Add parameter for admin user

// Check if ACR already exists
resource existingAcr 'Microsoft.ContainerRegistry/registries@2022-12-01' existing = {
  name: name
}

// Deploy ACR only if it does NOT exist
resource acr 'Microsoft.ContainerRegistry/registries@2022-12-01' = if (existingAcr.name == null) {
  name: name
  location: location
  sku: {
    name:  skuName // Use the parameter for SKU
  }
  properties: {
    adminUserEnabled: adminUserEnabled // Use the parameter
  }
}

output acrLoginServer string = acr.properties.loginServer
output acrResourceId string = acr.id
