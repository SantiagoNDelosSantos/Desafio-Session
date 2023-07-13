import {
    Router
} from 'express';
import userModel from '../daos/mongodb/models/users.model.js';
import { createHash, isValidPassword } from '../utils.js';
import passport from 'passport';


const router = Router();

// Registro:

router.post('/register', passport.authenticate('register', {failureRedirect: '/failregister'}), async (req,res) => { res.send({status: "success", message: "User registered"})})

router.get('/failregister', async(req, res) => {
    console.log("Failed Strategy");
    res.send({error: "Failed"});
})



router.post('/register', async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            age,
            password
        } = req.body;
        const exist = await userModel.findOne({ email });
        
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
            password: createHash(password),
            role: "User",
        });
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


router.post('/login', passport.authenticate('login', {failureRedirect: '/faillogin'}), async (req, res) => {
    if(!req.user) return res.status(400).send({status:"error", error:"Invalid credentials"})
    req.session.user ={
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email
    }
    res.send({status: "success", payload: req.session.user})
})

router.get('/faillogin', (req, res) => {
    res.send({error:"Failed Login"})
})






router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
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
            user = await userModel.findOne({email: email});
        }
        if (!user) {
            console.log("Correo incorrecto.");
            return res.status(401).send({
                status: 'error',
                message: 'Correo incorrecto.'
            });
        }
        if(!isValidPassword(user, password)){
            console.log("Corntraseña incorrecta.");
            return res.status(401).send({
                status: 'error',
                message: 'Contraseña incorrecta.'
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


// Github: 

router.get('/github', passport.authenticate('github', {scope:'user: email' }), 
    (req,res)=>{}
)

router.get('/githubcallback', passport.authenticate('github', {failureRedirect: '/login'}), async (req, res) => {
    console.log('exito');
    req.session.user = req.user;
    res.redirect('/');
})



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