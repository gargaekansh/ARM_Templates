//acr.bicep
// param name string
// param skuName string = 'Basic'
// param location string = resourceGroup().location
// param adminUserEnabled bool = false

// // acr.bicep
// param acrName string
// param acrSkuName string
// param acrLocation string
// param acrAdminUserEnabled bool

// resource existingAcr 'Microsoft.ContainerRegistry/registries@2022-12-01' existing = {
//   name: acrName
// }

// resource acr 'Microsoft.ContainerRegistry/registries@2022-12-01' = if (existingAcr.name == null) {
//   name: acrName
//   location: acrLocation
//   sku: {
//     name: acrSkuName
//   }
//   properties: {
//     adminUserEnabled: acrAdminUserEnabled
//   }
// }

// output acrLoginServer string = acr.properties.loginServer
// output acrResourceId string = acr.id

param acrName string
param acrSkuName string = 'Basic'
param acrLocation string = resourceGroup().location
param acrAdminUserEnabled bool = false
param userManagedIdentityName string = 'acr-umi'  // Default UMI name

resource acr 'Microsoft.ContainerRegistry/registries@2022-12-01' = if (!contains(resourceGroup().id, acrName)) {
  name: acrName
  location: acrLocation
  sku: {
    name: acrSkuName
  }
  properties: {
    adminUserEnabled: acrAdminUserEnabled
  }
}

output acrLoginServer string = acr.properties.loginServer
output acrResourceId string = acr.id
