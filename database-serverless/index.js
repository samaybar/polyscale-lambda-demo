'use strict';

const MYSQL = require('mysql2');
var directConfig = require('./config.json');
var polyscaleConfig = require('./config2.json');
//track whether we have a new container
let containerCounter = 0;
let isNewContainer = true;

//set up containter connection direct to DB
const connectionStartTimeD = Date.now();
const mysqlDirect = require('serverless-mysql')({
    library: require('mysql2'),
    config: {
        host     : directConfig.dbhost,
        database : directConfig.dbname,
        user     : directConfig.dbuser,
        password : directConfig.dbpassword
    
    }
});
const connectionCompleteTimeD = Date.now();
const connectTimeD = connectionCompleteTimeD - connectionStartTimeD;

//set up containter connection via PolyScale to DB
const connectionStartTimeP = Date.now();
const mysqlPolyscale = require('serverless-mysql')({
   library: require('mysql2'),
    config: {
        host     : polyscaleConfig.dbhost,
        database : polyscaleConfig.dbname,
        user     : polyscaleConfig.dbuser,
        password : polyscaleConfig.dbpassword
    
    }
});

const connectionCompleteTimeP = Date.now();
const connectTimeP = connectionCompleteTimeP - connectionStartTimeP;

async function getMyData(databaseSource, myQuery){
    //default query is direct to database
    let mysql = mysqlDirect;
    let config = directConfig;
    let connectTime = connectTimeD;
    //if polyscale is the method
    if(databaseSource === "polyscale"){
            mysql = mysqlPolyscale;
            connectTime = connectTimeP;
            config = polyscaleConfig;
    }
    console.log("in the database function");
    
    //mark when the query starts
    const queryStartTime = Date.now();
    let dbData = "not created";
    var sql1 = myQuery;
    const results = await mysql.query(sql1);
    const queryCompleteTime = Date.now();
    dbData = results;
   // await mysql.end(); //not closing the connection
    const databaseCompleteTime = Date.now();
    const queryTime = queryCompleteTime - queryStartTime;
    const closeTime = databaseCompleteTime - queryCompleteTime;
    console.log(`Connect time: ${connectTime}`);
    console.log(`query time: ${queryTime}`);
    return {
        "data": dbData,
        "host": config.dbhost,
        "connectTime": connectTime,
        "queryTime": queryTime,
        "closeTime": closeTime
        };
}



exports.handler = async (event) => {
    //console.log(event)
    if(containerCounter > 0){
        isNewContainer = false;
    }
    containerCounter ++;
    
    const region_code = process.env.AWS_REGION;
    let databaseSource = "direct";
    try {
        databaseSource = event.queryStringParameters.source;
    } catch (e) {
        console.log("no source provided, defaulting to direct");
    }
    
    let querySelection = "short";
    try {
        querySelection = event.queryStringParameters.query;
    } catch (e) {
        console.log("no query provided, defaulting to short");
    }
    var myQuery = 'SELECT * from employees where emp_no=10001;';
    if(querySelection === "long"){
        myQuery = `SELECT COUNT(*) AS employ_count, MAX(salary) AS max_salary, MIN(salary) AS min_salary FROM employees e INNER JOIN dept_emp de ON e.emp_no = de.emp_no INNER JOIN departments d ON de.dept_no = d.dept_no INNER JOIN salaries s ON s.emp_no = e.emp_no WHERE d.dept_name = 'Sales';`;
    }
    console.log(databaseSource,myQuery);
    const startTime = Date.now();
    let databaseQuery = await getMyData(databaseSource,myQuery);
    const endTime = Date.now();
    
    const myData = {
        aws_region:region_code,
        time: startTime,
        endTime: endTime,
        fullTime: endTime - startTime,
        connectTime: databaseQuery.connectTime,
        queryTime: databaseQuery.queryTime,
        closeTime: databaseQuery.closeTime,
        name: databaseQuery.data,
        database: databaseSource,
        host: databaseQuery.host,
        containerCounter: containerCounter,
        isNewContainer: isNewContainer
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify(myData),
    };
    return response;
};

