# polyscale-lambda-demo

## Overview
This respository contains two lambda functions that each allow you to compare accessing a MySQL database directly or via PolyScale.

In each directory, there are two config files which need your database information if you want to run this on your own.

config.json should contain your direct database credentials
config2.json should update the host and username

Once updating the config files, if you have the AWS command line tool set up, from the root directory you can deploy both functions with:
`make bucket` -- creates a S3 bucket to store the Lambda zip files
`make deploy` -- creates/updates Lambda functions and creates API Gateway in front of it
The output of the ` deploy` will include the URL of the endpoints for each function. 

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
