const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 3000;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const oracledb = require('oracledb');
const { log } = require('console');
oracledb.autoCommit = true; //Commita queries

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//-------------------------------------Connect to Database
const dbConfig = {
    user          : "system", //usuário do banco
    password      : "123", //senha do banco
    connectString : "localhost:1521/orcl",
    //privilege: oracledb.SYSDBA, //depende do nível de acesso do usuário que você esta usando para conectar ao banco
    poolMin: 10,
    poolMax: 10,
    poolIncrement: 0
};
//-------------------------------------CRUD
// app.get('/find', (req, res) => {
//     let users = new Array();
//     let connection;
//     oracledb.getConnection(dbConfig)
//     .then((c) => {
//         connection = c;
//         return connection.execute("select * from users");
//     })
//     .then((result) => {
//         result.rows.forEach((elemento) => {
//             let user = new Object();
//             user.id = elemento[0];
//             user.name= elemento[1];
//             user.password= elemento[2];
//             users.push(user);
//         });
//         res.status(200).json(users);
//     }).then(()=>{
//         if(connection){
//             connection.close();
//         }
//     }).catch((error)=>{
//         res.status(500).json({ message: error.message || "Some error occurred!" });
//     });
// });

app.get('/', (req, res) => {
    let users = new Array();
    let connection;
    oracledb.getConnection(dbConfig)
    .then((c) => {
        connection = c;
        return connection.execute("select * from customer");
    })
    .then((result) => {
        console.log(result);
        result.rows.forEach((elemento) => {
            let user = new Object();
            user.name = elemento[1];
            user.address= elemento[2];
            user.phone= elemento[3];
            user.email= elemento[4];
            users.push(user);
            
        });
        res.render('customers', {
            data: users
         });
    }).then(()=>{
        if(connection){
            connection.close();
        }
    }).catch((error)=>{
        res.status(500).json({ message: error.message || "Some error occurred!" });
    });
});

// app.get('/',async (req, res) => {
//     let connection;
//     connection = await oracledb.getConnection(dbConfig);
//     connection.execute(
//         `SELECT *
//          FROM customer`,
//         [],  
//        function(err, result) {
//           if (err) {
//             console.error(err.message);
//             return;
//           }
//           console.log(result);
//        });
//    });


app.get('/find/:userId', (req, res) => {
    let connection;
    let user = new Object();
    oracledb.getConnection(dbConfig)
    .then((c) => {
        connection = c;
        return connection.execute("SELECT * FROM users WHERE id = :id ",{
            id : req.params.userId
        });
    })
    .then((result) => {
        result.rows.forEach((elemento) => {
            user.id = elemento[0];
            user.nome= elemento[1];
            user.email= elemento[2];
        });
        res.status(200).json(user);
    }).then(()=>{
        if(connection){
            connection.close();
        }
    }).catch((error)=>{
        res.status(500).json({ message: error.message || "Some error occurred!" });
    });
});

app.post('/create', (req, res) => {
    oracledb.getConnection(dbConfig)
    .then((c) => {
        connection = c;
        return connection.execute("INSERT INTO users (name, password) VALUES (:name, :password) RETURN id INTO :id",
        {
            name: req.body.name,
            password: req.body.email,
            id : {type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        });
    }).then((result) => {
        res.status(201).json("User successfully created! ID: "+result.outBinds.id[0]);            
    }).then(()=>{
        if(connection){
            connection.close();
        }
    }).catch((error)=>{
        res.status(500).json({ message: error.message || "Some error occurred!" });
    });
});

app.put('/update/:userId', (req, res) => {
    oracledb.getConnection(dbConfig)
    .then((c) => {
        connection = c;
        return connection.execute("UPDATE user_db SET name = :name, email = :email WHERE id = :id",
        {
            id : req.params.userId,
            name: req.body.name,
            email: req.body.email
        });
    }).then(() => {
        res.status(200).json("User successfully updated! ID: "+ req.params.userId);            
    }).then(()=>{
        if(connection){
            connection.close();
        }
    }).catch((error)=>{
        res.status(500).json({ message: error.message || "Some error occurred!" });
    });
});


app.delete('/delete/:userId', (req, res) => {
    oracledb.getConnection(dbConfig)
    .then((c) => {
        connection = c;
        return connection.execute("DELETE FROM user_db WHERE id = :id",
        {
            id : req.params.userId
        });
    }).then(() => {
        res.status(200).json("User successfully deleted!");           
    }).then(()=>{
        if(connection){
            connection.close();
        }
    }).catch((error)=>{
        res.status(500).json({ message: error.message || "Some error occurred!" });
    });
});
//-------------------------------------
app.listen(PORT, () => {
    console.log(`Server is up and running on port: ${PORT}`);
});