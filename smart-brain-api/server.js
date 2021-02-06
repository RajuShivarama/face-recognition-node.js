const express = require('express');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
                client: 'pg',
                connection: {
                    host : '127.0.0.1',
                    user : 'your username',
                    password: 'your password',
                    database: 'your database name'
                }
            });

const app = express();
// this body parser module passes the json, buffer, string and url encoded data submitted using Http post request
app.use(bodyparser.json());
app.use(cors());

app.get('/', (req, res)=> { res.send(db.users) })

// signin[incase of signing we just need pass the data from postman and check with databases email and password]
app.post('/signin', signin.handleSignin(db, bcrypt))

// register[incase of register we just need pass the data from postman and push to the database]
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })

// profile/:id
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db)})

// image/id
// update the entries in the table
app.put('/image', (req, res) => { image.handleImage(req, res, db)})

app.listen(3001, () => {
    console.log('app is running on port 3000');
})
