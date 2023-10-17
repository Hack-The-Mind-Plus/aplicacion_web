const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();

const dbConnection = {
    host: process.env.HOST, 
    port: 3306, 
    user: process.env.USER, 
    password: process.env.PASSWORD, 
    database: process.env.DATABASE
}

const sessionStore = new MySQLStore(dbConnection); //se crea un almacenamiento de sesiones en la BD

module.exports = session({
    secret: process.env.SECRET, //gitignore
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: false,
        maxAge: 1000*60*60,
    }
});

// Elimina automáticamente las sesiones caducadas de la base de datos.
async function deleteExpiredSessions() {
    // Obtiene todas las sesiones de la base de datos.
    const sessions = await sessionStore.all();
  
    // Itera sobre las sesiones y elimina las que estén caducadas.
    for (const session of sessions) {
      if (session.expires < new Date()) {
        await sessionStore.destroy(session.id);
      }
    }
  }
  
  // Elimina las sesiones caducadas cada 10 minutos.
  setInterval(deleteExpiredSessions, 30 * 60 * 1000);

// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(() => {
	// MySQL session store ready for use.
	console.log('MySQLStore ready');
}).catch(error => {
	// Something went wrong.
	console.error(error);
});
