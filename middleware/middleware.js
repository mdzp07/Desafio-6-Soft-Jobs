const jwt = require('jsonwebtoken')
const { verificarEmailExistente, validarCredenciales } = require('../consultas')


const verificacionToken = (req, res, next) => {
    const token = req.header("Authorization").split("Bearer ")[1]
    if (!token) throw { code: 401, message: "Debe incluir el token en las cabeceras (Authorization)" }

    const tokenValido = jwt.verify(token, "SecretPass")
    if (!tokenValido) throw { code: 401, message: "El token no es válido" }
    const { email } = jwt.decode(token)
    console.log("Solicitud enviada por: " + email)
    next()
}

const credencialesVerify = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const emailExists = await verificarEmailExistente(email);
        if (!emailExists) {
            return res.status(400).send("El usuario no existe");
        }

        const credencialesValidas = await validarCredenciales(email, password);
        if (!credencialesValidas) {
            return res.status(401).send("Credenciales inválidas");
        }

        next();
    } catch (error) {
        res.status(500).send(error.message);
        console.log("Error en credencialesVerify");
    }
};

const reportarConsulta = async (req, res, next) => {
    const parametros = req.method === "GET" ? req.query : req.body;
    const url = req.url
    console.log(`
    Hoy ${new Date()}
    Se ha recibido una consulta en la ruta ${url}
    con los parámetros:
    `, parametros)
    next()
}

module.exports = { verificacionToken, credencialesVerify, reportarConsulta }