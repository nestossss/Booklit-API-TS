import prisma from "./client/dbclient";

async function getByUsername(user: string){
    try{
        return await prisma.leitor.findUnique({
            where: {
                username: user,
            },
            select: {
                idleitor: true,
                username: true,
                email: true,
                senha: true,
            }
        });
    } catch (err){
        console.log(err);
        return null;
    }
}

async function getByEmail(email: string){
    try{ 
        return await prisma.leitor.findUnique({
            where: {
                email: email,
            },
            select: {
                idleitor: true,
                username: true,
                email: true,
                senha: true,
            }
        });
    } catch (err){
        console.log(err);
        return null;
    }
}

async function insertUser(nome: string, username: string, password: string, email: string){
    try {
        return await prisma.leitor.create({
            data: {         
                nome: nome,
                username: username,
                email: email,
                senha: password,
                create_time: new Date(Date.now()),
            }
        })
    } catch (err){
        console.log(err);
        return null
    }
}

export { insertUser, getByEmail, getByUsername };