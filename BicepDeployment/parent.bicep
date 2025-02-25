// // parent.bicep

// param deployAcr bool = true
// param acrName string
// param acrSkuName string = 'Basic'
// param acrLocation string = resourceGroup().location
// param acrAdminUserEnabled bool = false

// param cosmosDbName string
// param cosmosDbLocation string = resourceGroup().location
// param cosmosDbDatabaseName string // Removed default value
// param cosmosDbContainerName string // Removed default value

// module acrModule 'acr.bicep' = {
//   name: 'acrDeployment'
//   params: {
//     acrName: acrName
//     acrSkuName: acrSkuName
//     acrLocation: acrLocation
//     acrAdminUserEnabled: acrAdminUserEnabled
//   }
// }

// module cosmosDbModule 'cosmosdb.bicep' = {
//   name: 'cosmosDbDeployment'
//   params: {
//     cosmosDbName: cosmosDbName
//     cosmosDbLocation: cosmosDbLocation
//     cosmosDbDatabaseName: cosmosDbDatabaseName
//     cosmosDbContainerName: cosmosDbContainerName
//   } 
//   dependsOn: [
//     acrModule // Add this line to create the dependency
//   ]
// }

// output acrLoginServer string = acrModule.outputs.acrLoginServer
// output cosmosDbAccountEndpoint string = cosmosDbModule.outputs.cosmosDbAccountEndpoint

param deployAcr bool = false
param acrName string
param acrSkuName string = 'Basic'
param acrLocation string = resourceGroup().location
param acrAdminUserEnabled bool = false

param cosmosDbName string
param cosmosDbLocation string = resourceGroup().location
param cosmosDbDatabaseName string
param cosmosDbContainerName string

// Conditionally deploy ACR only if deployAcr is true
module acrModule 'acr.bicep' = if (deployAcr) {
  name: 'acrDeployment'
  params: {
    acrName: acrName
    acrSkuName: acrSkuName
    acrLocation: acrLocation
    acrAdminUserEnabled: acrAdminUserEnabled
  }
}

// Deploy CosmosDB, making it dependent on ACR **only if ACR is deployed**
module cosmosDbModule 'cosmosdb.bicep' = {
  name: 'cosmosDbDeployment'
  params: {
    cosmosDbName: cosmosDbName
    cosmosDbLocation: cosmosDbLocation
    cosmosDbDatabaseName: cosmosDbDatabaseName
    cosmosDbContainerName: cosmosDbContainerName
  }
  dependsOn: deployAcr ? [acrModule] : []
}

// Outputs: If ACR is not deployed, acrLoginServer will be empty
output acrLoginServer string = deployAcr ? acrModule.outputs.acrLoginServer : ''
output cosmosDbAccountEndpoint string = cosmosDbModule.outputs.cosmosDbAccountEndpoint
