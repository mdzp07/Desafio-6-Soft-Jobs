const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    host: process.env.HOST,
    user: process.env.USER,    
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    allowExitOnIdle: true
})
const registrarUsuario = async (usuario) => {
    let { email, password, rol, lenguage } = usuario;

    const passEncriptada = bcrypt.hashSync(password);

    console.log("Usuario creado: " + email);
    console.log("Contraseña Real: " + password);
    console.log("Contraseña Encriptada: " + passEncriptada);

    const consulta = "INSERT INTO usuarios VALUES (DEFAULT, $1, $2, $3, $4)";
    const values = [email, passEncriptada, rol, lenguage]

    try {
        await pool.query(consulta, values)
    } catch (error) {
        console.log(error);
    }
}

const iniciarSesion = async (email, password) => {

    const consulta = "SELECT * FROM usuarios WHERE email = $1"
    const values = [email];

    try {

        const { rows: [usuario], rowCount } = await pool.query(consulta, values);

        if (rowCount == 1) {
            const EncriptedDBPass = usuario.password;
            const passCorrecta = bcrypt.compareSync(password, EncriptedDBPass);

            if (passCorrecta) {
                console.log("Usuario Validado!");
                return { error: false, msg: "¡Credenciales válidas! Bienvenido." };
            } else {
                console.log("Credenciales Inválidas!");
                return { error: true, msg: "Sus credenciales son inválidas: Usuario y/o contraseña incorrectos" };
            }
        } else {
            return { error: true, msg: "Sus credenciales son inválidas: Usuario y/o contraseña incorrectos" };
        }

    } catch (error) {
        console.log(error);
        return { error: true, msg: "Hubo un error inesperado" };
    }

}

const getUsuarioData = async (email) => {

    const consulta = "SELECT email, rol, lenguage FROM usuarios WHERE email = $1";
    const values = [email];

    try {
        const { rows } = await pool.query(consulta, values);
        return rows[0];
    } catch (error) {
        console.log(error);
        throw error;
    }

};

const verificarEmailExistente = async (email) => {
    const consulta = "SELECT COUNT(*) FROM usuarios WHERE email = $1";
    const values = [email];

    try {
        const { rows: [{ count }] } = await pool.query(consulta, values);
        return count > 0;
    } catch (error) {
        console.log(error);
        throw new Error("Error verificando el email existente");
    }
};

const validarCredenciales = async (email, password) => {
    const consulta = "SELECT password FROM usuarios WHERE email = $1";
    const values = [email];

    try {
        const { rows } = await pool.query(consulta, values);
        if (rows.length === 0) {
            return false; // El email no existe
        }

        const storedPassword = rows[0].password;
        return bcrypt.compareSync(password, storedPassword);
    } catch (error) {
        console.log(error);
        throw new Error("Error validando las credenciales");
    }
};

module.exports = { registrarUsuario, iniciarSesion, getUsuarioData, verificarEmailExistente, validarCredenciales };
