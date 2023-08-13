const oracledb = require("oracledb"); 
const axios = require("axios"); 


const express = require('express');
const app = express();

app.listen(3000);

async function run(){
    const connection = await oracledb.getConnection({
        user: 'JOBATHON',
        password : '12345',
        connectString: 'localhost/orclpdb',
    });

    await connection.close() ; //Always close connections.
}

// run() ;

app.get('/',(req,res)=> {
    res.send(
        {name :123, username : "nice"}
    );  
}); 