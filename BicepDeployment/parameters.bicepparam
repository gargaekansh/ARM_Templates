// parameters.bicepparam
using 'parent.bicep'

param acrName = 'nagp2024mcart0testacr1'
param acrSkuName = 'Basic'
param acrLocation = 'centralindia'
param acrAdminUserEnabled = false

param cosmosDbName = 'cosmoamcart1catalogdb1'
param cosmosDbLocation = 'centralindia'
param cosmosDbDatabaseName = 'ProductDb' // Updated DatabaseName
param cosmosDbContainerName = 'Products' // Updated CollectionName
