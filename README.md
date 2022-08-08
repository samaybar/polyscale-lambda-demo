# polyscale-lambda-demo

## Overview
This respository contains two lambda functions that each allow you to compare accessing a MySQL database directly or via PolyScale.

If you have AWS SAM cli (https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed, this repository includes a Makefile to easily deploy these functions.

In order to deploy these functions, you need to define the following parameters:  
`DBHOST` : Hostname for your database  
`DBNAME` : name of your database  
`DBUSER` : username to access your database  
`DBPASSWORD` : password for the database user  
`PSHOST` : this is already filled with psedge.global  
`PSUSER` : POLYSCALE_CACHE_ID-DBUSER  

These should be updated in the template.yaml file on lines 11 through 26.

You also need to create a unique bucket name in `Makefile` on line 2, and choose a different AWS Region on line 3 if desired.

Once these configurations are made, from the root directory you can deploy both functions with:  
`make bucket` -- creates a S3 bucket to store the Lambda zip files.  
`make deploy` -- creates/updates Lambda functions and creates API Gateway in front of it.  
The output of the `deploy` will include the URL of the endpoints for each function. 

Alternately, you can just run the function from the Lambda test console with  
```
{
  "queryStringParameters": {
    "source": "direct",
    "query": "long"
  }
}
```  

Options for `source`: direct, polyscale  
Options for `query`: short, long  

The default queries are based on the MySQL sample Employee database. You can change your queries in the index.js file to suite your database.

To deploy the functions manually, you will need to go to the directory for each function (database and database-serverless) 
`npm install` 
zip the contents and upload to create a Lambda function.