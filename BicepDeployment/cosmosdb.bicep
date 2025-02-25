param cosmosDbName string
param cosmosDbLocation string
param cosmosDbDatabaseName string
param cosmosDbContainerName string

resource cosmosdbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmosDbName
  location: cosmosDbLocation
  kind: 'MongoDB' // Or 'GlobalDocumentDB' for NoSQL
  properties: {
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: cosmosDbLocation
      }
    ]
    databaseAccountOfferType: 'Standard'
    // enableFreeTier: false // Change to 'true' if free tier is available
    enableFreeTier: true // Change to 'true' if free tier is available
  }
}

resource cosmosdbDatabase 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2023-04-15' = {
  name: cosmosDbDatabaseName
  parent: cosmosdbAccount
  properties: {
    resource: {
      id: cosmosDbDatabaseName
    }
    options: {
      throughput: 400 // Adjust RU/s as needed
    }
  }
}

resource cosmosdbContainer 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases/collections@2023-04-15' = {
  name: cosmosDbContainerName
  parent: cosmosdbDatabase
  properties: {
    resource: {
      id: cosmosDbContainerName
      shardKey: {
        category: 'Hash' // ✅ Fix: Using 'category' as the shard key
      }
    }
  }
}

output cosmosDbAccountEndpoint string = cosmosdbAccount.properties.documentEndpoint
