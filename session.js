const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);


const dbConnection = {
    host: 'brlgxguwx7dkkpw9dn50-mysql.services.clever-cloud.com',
    port: 3306,
    user: 'ufcazzoen9xcbzsl',
    password: 'CsmPJLXJS0ST6TvSNJk6',
    database: 'brlgxguwx7dkkpw9dn50'
}

const sessionStore = new MySQLStore(dbConnection); //se crea un almacenamiento de sesiones en la BD

module.exports = session({
    secret: 'hackthemind',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: false,
        maxAge: 1000*60*60,
    }
});

// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(() => {
	// MySQL session store ready for use.
	console.log('MySQLStore ready');
}).catch(error => {
	// Something went wrong.
	console.error(error);
});
