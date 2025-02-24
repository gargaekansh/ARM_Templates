// parent.bicep

param acrName string
param acrSkuName string = 'Basic'
param acrLocation string = resourceGroup().location
param acrAdminUserEnabled bool = false

param cosmosDbName string
param cosmosDbLocation string = resourceGroup().location
param cosmosDbDatabaseName string // Removed default value
param cosmosDbContainerName string // Removed default value

module acrModule 'acr.bicep' = {
  name: 'acrDeployment'
  params: {
    acrName: acrName
    acrSkuName: acrSkuName
    acrLocation: acrLocation
    acrAdminUserEnabled: acrAdminUserEnabled
  }
}

module cosmosDbModule 'cosmosdb.bicep' = {
  name: 'cosmosDbDeployment'
  params: {
    cosmosDbName: cosmosDbName
    cosmosDbLocation: cosmosDbLocation
    cosmosDbDatabaseName: cosmosDbDatabaseName
    cosmosDbContainerName: cosmosDbContainerName
  } 
  dependsOn: [
    acrModule // Add this line to create the dependency
  ]
}

output acrLoginServer string = acrModule.outputs.acrLoginServer
output cosmosDbAccountEndpoint string = cosmosDbModule.outputs.cosmosDbAccountEndpoint
