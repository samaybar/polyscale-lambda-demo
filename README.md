# polyscale-lambda-demo

## Overview
This respository contains two lambda functions that each allow you to compare accessing a MySQL database directly or via PolyScale.

In each directory, there are two config files which need your database information if you want to run this on your own.

Once updating the config files, if you have the AWS command line tool set up, you can navigate to the directory of the function you want to use and type `make` at the terminal command line. This will create the Lambda function in AWS. From the AWS console, you can then add a Rest API endpoint if you want to be able to run the function from a browser.  

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
