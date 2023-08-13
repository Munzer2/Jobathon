const oracledb = require("oracledb"); 
const axios = require("axios"); 

async function run(){
    const connection = await oracledb.getConnection({
        user: 'JOBATHON',
        password : '12345',
        connectString: 'localhost/orclpdb',
    }); 
    // let companyname = 'Google' ;  
    // const result = await connection.execute(`SELECT * FROM "Company" WHERE "Name" = '${companyname}'`); 
    // console.log('Result is: ', result.rows); 

    const response = await axios.get('https://randomuser.me/api/?results=50');  
    console.log(response.data.results);  
    const cpId = 2; 
    const middleName = 'SHA'; 
    const CEO_Of_Company= ""; 
    let c; 
    for(const person of response.data.results)
    {
        c= Math.floor(Math.random()%3); 
        const userID = person.login.uuid; 
        const firstName = person.name.first; 
        const lastName = person.name.last;
        const City = person.location.city; 
        const Postal =person.location.postcode; 
        const state = person.location.state; 
        const Country = person.location.country;
        const gender = person.gender; 
        const Age = person.dob.age;
        const phone = person.phone; 
        type =""; 
        if(c == 1) type = "Seeker";
        else if(c == 0) type = "Employer";   
        await connection.commit() ;
        await connection.execute(`INSERT INTO "User" VALUES('${userID}','${firstName}','${lastName}', '${City}','${Postal}','${state}', '${Country}','${Age}','${gender}','${phone}','${cpId}','${CEO_Of_Company}','${type}')`); 
    };

    // const res = await connection.execute(
    //     `SELECT * FROM "User"`
    // ); 
    // console.log(res.rows) ; 

    await connection.close() ; //Always close connections.
}

run() ; 