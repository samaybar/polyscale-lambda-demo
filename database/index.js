'use strict';

var mysql = require('mysql2/promise');
var directConfig = require('./config.json');
var polyscaleConfig = require('./config2.json');


async function getMyData(databaseSource, myQuery){
    let config = {
        "dbhost" : process.env.DBHOST,
        "dbname" : process.env.DBNAME,
        "dbuser" : process.env.DBUSER,
        "dbpassword" : process.env.DBPASSWORD
    }
    
    if(databaseSource === "polyscale"){
            config.dbhost = process.env.PSHOST;
            config.dbuser = process.env.PSUSER;
    }
    console.log("in the database function");
    
    const connectionStartTime = Date.now();
    const connection = await createConnection(config);
    const connectionCompleteTime = Date.now();
    let dbData = "not created";
    var sql1 = myQuery;
    const [rows,fields] = await connection.query(sql1);
    const queryCompleteTime = Date.now();
    console.log(rows);
    dbData = rows[0];
    connection.end();
    const databaseCompleteTime = Date.now();
    const connectTime = connectionCompleteTime - connectionStartTime;
    const queryTime = queryCompleteTime - connectionCompleteTime;
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

async function createConnection(config){
    const connection = await mysql.createConnection({
        host: config.dbhost,
        user: config.dbuser,
        password: config.dbpassword,
        database: config.dbname,
        port: 3306 });
    return connection;
}

exports.handler = async (event) => {
    //console.log(event)
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
        host: databaseQuery.host
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify(myData),
    };
    return response;
};

