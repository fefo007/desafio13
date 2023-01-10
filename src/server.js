const express = require('express')
const routerLog=require('./routes/logRoutes')
const {engine} = require('express-handlebars')

const app = express()

app.use(express.static('public'));
app.use('/',routerLog)

app.engine("handlebars",engine())
app.set("view engine","handlebars")
app.set("views","src/views")


const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => { 
    console.log(`Servidor Http con Websockets escuchando en el puerto ${server.address().port}`);
})
server.on('error', error => console.log(`Error en servidor ${error}`))