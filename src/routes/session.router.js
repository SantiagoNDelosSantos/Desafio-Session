import { Router } from 'express';
import userModel from '../daos/mongodb/models/users.model.js';

const router = Router();

router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;

    const exist = await userModel.findOne({ email });

    if (exist) {
        return res.status(400).send({ status: 'error', message: 'Usuario ya registrado.' });
    }

    let result = await userModel.create({
        first_name,
        last_name,
        email,
        age,
        password
    });

    res.send({ status: 'success', message: 'Usuario registrado.' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email, password: password });
    if (!user) {
        console.log("Correo o contraseña incorrectos.");
        return res.status(401).send({ status: 'error', message: 'Correo o contraseña incorrectos.' });
    }

    req.session.user = {
        name: user.first_name + user.last_name,
        email: user.email,
        age: user.age,
        role: user.email === 'adminCoder@coder.com' ? 'admin' : 'usuario'
    };

    res.send({ status: 'success', message: req.session.user });
});

export default router;
