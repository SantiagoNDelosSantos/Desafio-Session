import {
    Router
} from 'express';
import userModel from '../daos/mongodb/models/users.model.js';

const router = Router();

// Registro:
router.post('/register', async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            age,
            password
        } = req.body;
        const exist = await userModel.findOne({
            email
        });
        if (exist) {
            return res.status(400).send({
                status: 'error',
                message: 'Usuario ya registrado.'
            });
        }
        let result = await userModel.create({
            first_name,
            last_name,
            email,
            age,
            password,
            role: "User",
        });

        // Guardar datos del usuario en la sesión
        req.session.user = {
            name: result.first_name,
            apellido: result.last_name,
            email: result.email,
            age: result.age,
            role: result.role
        };

        res.send({
            status: 'success',
            message: 'Usuario registrado.'
        });
    } catch (error) {
        res.send(401).send({
            error: error.message
        });
    }
});


// Login:

router.post('/login', async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;
        let user;
        if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
            user = {
                first_name: "Admin",
                last_name: "CoderHouse",
                email: "adminCoder@coder.com",
                age: 0,
                role: "Admin",
            }
        } else {
            user = await userModel.findOne({
                email: email,
                password: password
            });
        }
        if (!user) {
            console.log("Correo o contraseña incorrectos.");
            return res.status(401).send({
                status: 'error',
                message: 'Correo o contraseña incorrectos.'
            });
        }
        req.session.user = {
            name: user.first_name,
            apellido: user.last_name,
            email: user.email,
            age: user.age,
            role: user.role,
        };
        res.send({
            status: 'success',
            message: req.session.user,
        });
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }
});


//Cerrar session:
router.get("/logout", async (req, res) => {
    try {
        // Destruir sesión
        req.session.destroy();
        res.send("Sesión cerrada");
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }
});

export default router;