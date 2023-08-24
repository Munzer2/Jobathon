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
    ///For data population.
    ///console.log(response.data.results);   
    const CEO_Of_Company= ""; 
    let hobbies =["Reading manga","Football", "Books", "Gardening", "Cricket", "Table Tennis", "Long Tennis", "Organize", "Sleep", "Driving", "Cooking", "Games", "Streaming", "Eating", "Solitare", "Uno"];
    let reviews = ["5","4","3","2","1"];  
    for(const person of response.data.results)
    {
        let c= Math.floor(Math.random()*3); 
        let temp_cpID  = Math.floor(Math.random()*22) + 1;
        const cpID = temp_cpID;    
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
        const pic_url_large = person.picture.large; 
        const pic_url_med = person.picture.medium ; 
        const pic_url_thumb =person.picture.thumbnail; 
        type =""; 
        if(c == 1) type = "Seeker";
        else if(c == 0) type = "Employer";  
        await connection.execute(
        `INSERT INTO "User" 
        VALUES('${userID}','${firstName}','${lastName}','${City}','${Postal}','${state}','${Country}','${Age}','${gender}','${phone}','${cpID}','${CEO_Of_Company}','${type}','${pic_url_med}')`);
        let idx = Math.floor(Math.random()*hobbies.length); 
        await connection.execute(`INSERT INTO "Hobbies" VALUES('${userID}','${hobbies[idx]}')`);
        if(c == 0)///Employer
        {
            await connection.execute(`INSERT INTO "Employer" VALUES('${cpID}','${userID}','${pic_url_med}')`);
            ///check whether he is a reviewer.
            let check = Math.floor(Math.random()*2);
            if(!check)
            {
                ///he is a reviewer.
                let idx_review = Math.floor(Math.random()*reviews.length); 
                await connection.execute(`INSERT INTO "Review" VALUES('${userID}','${cpID}','${reviews[idx_review]}')`); 
            } 
        } 
        else if(c == 1)////Job seeker.
        {
            await connection.execute(`INSERT INTO "Job seeker" VALUES('${userID}','${pic_url_med}')`);
            ///check whether he is a reviewer.  
            let check = Math.floor(Math.random()*2);
            if(!check)
            {
                ///he is a reviewer.
                let idx_review = Math.floor(Math.random()*reviews.length); 
                await connection.execute(`INSERT INTO "Review" VALUES('${userID}','${cpID}','${reviews[idx_review]}')`); 
            } 
        }
        else///he may be currently working but provides reviews about his old companies. 
        {
            let check = Math.floor(Math.random()*2);
            if(!check)
            {
                ///he is a reviewer.
                let idx_review = Math.floor(Math.random()*reviews.length); 
                await connection.execute(`INSERT INTO "Review" VALUES('${userID}','${cpID}','${reviews[idx_review]}')`); 
            } 
        }
    }
    await connection.commit() ;

    const res = await connection.execute(
        `SELECT * FROM "User"`
    ); 
    console.log(res.rows) ; 

    await connection.close() ; //Always close connections.
}

run() ; 

