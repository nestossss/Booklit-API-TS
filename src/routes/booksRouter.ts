import express = require('express');
const router = express.Router();
import { checkToken } from "../util/token";

router.get("/recomendacoes", checkToken, (req, res)=>{ 
    console.log(res.locals.userId);
    res.send("Não implementado")
});

router.get("/info", checkToken, (req, res)=>{
    res.send("Não implementado")
})


router.get("/popular", (req, res)=>{
    res.send("Não implementado")
})

export { router }