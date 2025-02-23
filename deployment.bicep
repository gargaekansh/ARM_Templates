// param name string = 'nagp2024mcart0testacr'
param name string

param location string = resourceGroup().location

// Check if ACR already exists
resource existingAcr 'Microsoft.ContainerRegistry/registries@2022-12-01' existing = {
  name: name
}

// Deploy ACR only if it does NOT exist
resource acr 'Microsoft.ContainerRegistry/registries@2022-12-01' = if (existingAcr.name == null) {
  name: name
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
  }
}
