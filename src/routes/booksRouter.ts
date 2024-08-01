import express = require('express');
const router = express.Router();
import { checkToken } from "../util/token";

router.get("/recomendacoes", checkToken, (req, res)=>{ 
    console.log(res.locals.userId);
});

router.get("/info", checkToken, (req, res)=>{


})


router.get("/popular", (req, res)=>{

})

export { router }