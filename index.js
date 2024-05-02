const express = require('express')
const app = express()
const cors = require('cors')
const { verificacionToken, credencialesVerify, reportarConsulta } = require("./middleware/middleware")
const { registrarUsuario, iniciarSesion, getUsuarioData } = require('./consultas')
const jwt = require('jsonwebtoken')

app.listen(3000, console.log("SERVIDOR FUNCIONANDO EN PUERTO 3000"))
app.use(cors())
app.use(express.json())

app.post("/usuarios", reportarConsulta, async (req, res) => {
    try {
        const usuario = req.body;
        await registrarUsuario(usuario);
        res.send("Usuario creado con éxito!")
    } catch (error) {
        res.status(500).send(error);
        console.log("Error en app.post('/usuarios')")
    }
});

app.post("/login", credencialesVerify, reportarConsulta, async (req, res) => {
    try {
        const { email, password } = req.body;
        await iniciarSesion(email, password);

        const token = jwt.sign({ email, password }, "SecretPass");

        console.log("USUARIO INICIÓ SESIÓN CON ÉXITO! // SU TOKEN ES: " + token);
        res.send(token)
    } catch (error) {
        res.status(500).send(error);
        console.log("Error en app.post('/login')")
    }
});

app.get("/usuarios", verificacionToken, async (req, res) => {
    try {
        const Authorization = req.header("Authorization");
        const token = Authorization.split("Bearer ")[1];
        const { email } = jwt.verify(token, "SecretPass");

        const data = await getUsuarioData(email);
        res.send(data);
    } catch (error) {
        res.status(error.code || 500).send(error);
    }
});