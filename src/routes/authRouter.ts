import express = require('express');
const router = express.Router();
import { authUser, checkUser, register } from '../controller/authController'

router.post("/checkUser", async (req, res) => {
    try { 
        let resBody = await checkUser(req.body.username)
        res.status(resBody.status).json(resBody);
    } catch (err) { 
        res.status(400).send("parametro");
    }
})

router.post("/login", async (req, res)=>{
    try {
        let [username, password] = [req.body.username, req.body.password];
        let resBody;
        if(!username && !password)
            resBody = { "status":200, "message":"ta faltando username e password"};
        else if(!username)
            resBody = { "status":200,"message": "ta faltando username"};
        else if (!password)
            resBody = { "status":200, "message":"ta faltando password"};

        else resBody = await authUser(username, password);
        res.status(resBody.status).json(resBody);
    } catch(err){ 
        res.send("provavelmente sem parametro, ou outro erro");
    }
}) 

router.post('/signup', async (req, res) => {
    try {
        let { nome, username, password, email } = req.body;
        let resBody = await register(nome, username, password, email);
        res.json(resBody);
    } catch(err) {

    }
})

export { router }