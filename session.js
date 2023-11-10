const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();
const mysql = require('mysql2');

const dbConnection = {
    host: process.env.HOST, 
    port: 20175, 
    user: process.env.USER, 
    password: process.env.PASSWORD, 
    database: process.env.DATABASE
}



module.exports = session({
    secret: process.env.SECRET, //gitignore
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({ ...dbConnection, useUniqueIDs: true, stringify: true}), //se crea un almacenamiento de sesiones en la BD
    cookie: {
        secure: false,
        maxAge: 1000*60*60,
    }
});

const sessionStore = new MySQLStore({ ...dbConnection, useUniqueIDs: true, stringify: true});
  

// Ejecuta la función `clearExpiredSessions()` cada minuto.
setInterval(() => {
  console.log("se destruyeron las sesiones expiradas");
  sessionStore.clearExpiredSessions();
}, 60 * 60 * 1000);


// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(async () => {
	// MySQL session store ready for use.
	console.log('MySQLStore ready');
});
