import { NextFunction, Request, Response } from "express";
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.TOKEN_KEY;

const setToken = (userId: number, key: string): string | false => {
    if(userId){
        return jwt.sign({userId}, key);
    }
    return false;
}


const decToken = (token: string, key: string): number | false => {
    try {
        let dec = jwt.verify(token, key);
        if(dec){
            return dec.userId;
        }
        return false;
    } catch {
        return false;
    }
}

// middleware de verificacao
function checkToken(req: Request, res: Response, next: NextFunction){
    if(!SECRET_KEY)
        return res.status(500).send("pane no system");
    if(!req.headers.authorization) 
        return res.status(401).send("Não autorizado: Insira um token no Header 'Authorization'");
    let authorization = req.headers.authorization.split(' ');
    if(authorization[0] != 'Bearer')
        return res.status(401).send("falta bearer");
    let token = authorization[1];
    if(token.length <= 0)
        return res.status(401).send("Não autorizado: Token faltando");
    let userId = decToken(token, SECRET_KEY);
    if(!userId) 
        return res.status(401).send("Não autorizado: Token invalido");
    res.locals.userId = userId;
    next();
}

export { setToken, decToken, checkToken };