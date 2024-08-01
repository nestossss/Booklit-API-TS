require('dotenv').config();""
import { getByEmail, getByUsername, insertUser } from "../model/authModel";
import { setToken } from "../util/token";
const SECRET_KEY: string = (process.env.TOKEN_KEY? process.env.TOKEN_KEY : process.exit("secret key nao existe"));

async function register(nome: string, username: string, password: string, email: string){
    if(!nome || !username || !password || !email){
        return {
            "status": 400, 
            "message":"faltando parametro"
        };
    }

    try{
        let userExists = await getByUsername(username);
        if(userExists){
            return {
                "status": 200,
                "cadastro_feito": false,
                "message": "Nome de usuário já cadastrado"
            }
        }
        userExists = await getByEmail(email);
        if(userExists){
            return {
                "status": 200,
                "cadastro_feito": false,
                "message": "Email já cadastrado"
            }
        }

        const result = await insertUser(nome, username, password, email);
        
        let token;
        if(result) token = setToken(result.idleitor, SECRET_KEY);

        return {
            "status": 200,
            "cadastro_feito": result? true : false,
            "token": result? token : false,
            "message": result? "cadastrado" : "nao cadastrado", 
        }
    } catch {
        return {
            "status": 500,
            "message": "pane no sistema",
        }
    }
}

async function checkUser(username: string){
    let userData = await getByUsername(username);
    
    if(!userData)  return {
        "status": 200,
        "cadastrado": false,
        "message":"Usuário não cadastrado"
    }
    if(userData.username == username) return {
        "status": 200,
        "cadastrado":true,
        "message":"Nome de usuario cadastrado"
    }
    return {
        "status": 500,
        "cadastrado": false,
        "message":"Algo deu errado"
    }
}


async function authUser(username: string, senha: string){

    let userInfo = await checkUser(username);
    if(!userInfo.cadastrado){
        return userInfo;
    }
    
    let user = await getByUsername(username);
    try {
        if(user && user.senha == senha) {
            let token = setToken(user.idleitor, SECRET_KEY)
            return {
                "status": 200,
                "cadastrado": true,
                "senha_correta": true,
                "token": token,
                "message": "ok"
            }
        }
        return {
            "status": 200,
            "cadastrado": true,
            "senha_correta": false,
            "message": "Senha incorreta" 
        }
    } catch {
        return {
            "status": 500,
            "message": "pane no sistema",
        }
    }
}

export { authUser, checkUser, register } 