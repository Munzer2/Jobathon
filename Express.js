const oracledb = require("oracledb"); 
const axios = require("axios"); 
const crypto = require("crypto");
const path = require("path");


const express = require('express');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; 

const app = express();  


// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static('public'));
app.listen(3000);


async function run(query){
    const connection = await oracledb.getConnection({
        user: 'JOBATHON',
        password : '12345',
        connectString: 'localhost/orclpdb',
    });

    try{
        const data = await connection.execute(query);
        return data;  
    }
    finally{
        await connection.close() ; //Always close connections.
    }
}



app.get('/verifyLogin', async(req,res)=>{
    let user =req.query.username;
    let pass =req.query.password;
    const hashedPassword = crypto.createHash('sha256').update(pass).digest('hex');
    const query = `SELECT * FROM "User" WHERE "firstName" = '${user}' AND "Password(hashed)" = '${hashedPassword}'`; 
    try{
        const result = await run(query); 
        ///console.log(result.rows);
        if( result.rows.length == 1 )
        {
            res.status(200).json({ success: true });
        }
        else res.status(200).json({ success: false });
    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({ success: false });
    }
});  



app.get('/user/:username', async (req, res) => {
    const username = req.params.username;
    // Fetch user data from the database based on the username and render the user profile page
    const query =`SELECT * FROM "User" WHERE "firstName" = '${username}'`;
    try
    {
        const user_info = await run(query) ; 
        
        res.render('userProfile', { user: user_info.rows[0]}); // Pass user_info, hobbies to the template
    }  
    catch(error) 
    {
        console.log("Error!");
    }
});

app.get('/fetchHobbies/:userID', async (req, res) => {
    const userID = req.params.userID;
    const query = `SELECT "Hobby" FROM "Hobbies" WHERE "User_ID" = '${userID}'`;

    try {
        const hobbies_result = await run(query);
        const hobbies = hobbies_result.rows.map(row => row.Hobby);
        res.status(200).json(hobbies);
    } catch (error) {
        console.error('Error fetching hobbies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// API endpoint to add a new hobby
app.post('/addHobby', async (req, res) => {
    const userID = req.body.userID;
    const hobby = req.body.hobby;

    const insertQuery = `
        INSERT INTO "Hobbies" ("User_ID", "Hobby")
        VALUES (:userID, :hobby)
    `;

    try {
        const connection = await oracledb.getConnection({
            user: 'JOBATHON',
            password: '12345',
            connectString: 'localhost/orclpdb',
        });

        const result = await connection.execute(insertQuery, {
            userID,
            hobby,
        });

        await connection.close();

        console.log('Hobby added:', result);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error adding hobby:', error);
        res.status(500).json({ success: false });
    }
});


app.get('/fetchCompany/:companyId', async (req, res) => {
    const companyId = req.params.companyId;
    const query = `SELECT * FROM "Company" WHERE "CompanyID" = '${companyId}'`;

    try {
        const companyDetails = await run(query);
        res.json(companyDetails.rows[0]);
    } catch (error) {
        console.error('Error fetching company details:', error);
        res.status(500).json({ error: 'An error occurred while fetching company details' });
    }
});

