const oracledb = require("oracledb"); 
const axios = require("axios"); 


const express = require('express');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; 

const app = express();  

app.use(express.static('public'));
app.listen(3000);


async function run(query){
    const connection = await oracledb.getConnection({
        user: 'JOBATHON',
        password : '12345',
        connectString: 'localhost/orclpdb',
    });

    const data = connection.execute(query); 

    await connection.close() ; //Always close connections.
    return data; 
}

// run() ;

app.get('/user/:username', async(req,res)=> {
    const username = req.params.username; 
    const data = await run(`SELECT * FROM "Company" WHERE "Name"= '${username}'`); 
    res.send(data.rows); 
    res.end();    
}); 
