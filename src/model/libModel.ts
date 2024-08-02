import prisma from "./client/dbclient";
import { booksModel } from './booksModel'
const getLivro = booksModel.getLivro;

// ideia q veio do nada => colocar uma contagem de usuarios p cada livro no db,
// quando a contagem chegar a 0 (removendo livro da estante), o livro se apaga 

/* Model referente a biblioteca/estante de cada usuário */

// addBook()           :  Adiciona um livro a estante
// removeBook()        :  Remove um livro da estante
// updateRegistro()    :  Atualiza o número de páginas lidas e o tempo lido, o registro por completo
// updateTempoLido()   :  Atualiza só o tempo lido
// updatePagLidas()    :  Atualiza só o mnumero de páginas



//TERMINADA ( por enauanto )
async function insertBook(
    userId: number,
    titulo: string,
    desc: string, 
    autores: Array<string>, 
    generos: Array<string>,
    totalPag: number, 
    bookUrl: string,
){
    try{

        let livro = await prisma.livro.findUnique({
            where: {
                bookUrl: bookUrl,
            },
            select: {
                idlivro: true,
            }
        });

        if(!livro){ // cria o livro 
            let generosConOrCreate: Array<any> = [];
            generos.forEach( (genero) => {
                generosConOrCreate.push({ where: { nome: genero }, create: { nome: genero } });
            });

            if(!autores){
                livro = await prisma.livro.create({
                    data: {
                        titulo: titulo,
                        sinopse: desc,
                        totalPag: totalPag,
                        temBookUrl: true, 
                        bookUrl: bookUrl,
                        generos: {
                            connectOrCreate: generosConOrCreate
                        }
                    },
                    select: {
                        idlivro: true,
                    },
                })
            } else { 
                let autoresObj: Array<any> = [];
                autores.forEach( (autor) => {
                    autoresObj.push({ nome: autor});
                });
                livro = await prisma.livro.create({
                    data: {
                        titulo: titulo,
                        sinopse: desc,
                        totalPag:  totalPag,
                        temBookUrl: true, 
                        bookUrl: bookUrl,
                        autores: {
                            createMany: {
                                data: autoresObj,
                            },
                        },
                        generos: {
                            connectOrCreate: generosConOrCreate, 
                        }
                    },
                    select: {
                        idlivro: true,
                    },
                })
            }
        }

        console.log("ID do Livro registrado: " + livro.idlivro+ "\nID do Usuario do registro: "+ userId);

        let registro = await prisma.registro_livro.findFirst({
            where: {
                idlivro: livro.idlivro,
                idleitor: userId,
            },
        }); // testa se existe um registro do livro ja 

        if(!registro){
            return await prisma.registro_livro.create({
                data: {
                    tempo_lido: 0, 
                    paginas_lidas: 0,
                    idleitor: userId,
                    idlivro: livro.idlivro,
                },
                select: {
                    livro: {
                        select: {
                            idlivro: true,
                            totalPag: true,
                            titulo: true,
                            temBookUrl: true,
                            bookUrl: true,
                        }
                    }
                }
            });
        } 
        return null
    } catch (err) {
        console.log(err);
        return null;
    }
} 
//TERMINADA ( por enquanto )

async function removeBook(livroId: number, userId: number){
    try{

        let registro = await prisma.registro_livro.findUnique({
            where:{ 
                idlivro_idleitor: {
                    idleitor: userId,
                    idlivro: livroId,
                }
            },
        })

        if(registro){
            return await prisma.registro_livro.delete({
                where: {    
                    idlivro_idleitor: {
                        idleitor: userId,
                        idlivro: livroId,
                    },
                },
                select: {
                    idleitor: true,
                    idlivro: true,
                    livro: {
                        select: {
                            titulo: true,
                        }
                    }
                }
            });
        }
        return null;
    } catch (err){
        console.log(err);
        return false
    }
}

async function updateRegistro(tempoLido: number, paginasLidas: number, livroId: number, userId: number){
    try{
        let livro = await getLivro(livroId)
        let registro = await getRegistro(livroId, userId);

        if(livro && registro && paginasLidas <= livro.totalPag){
            return await prisma.registro_livro.update({
                where: {
                    idlivro_idleitor: {
                        idleitor: userId,
                        idlivro: livroId,
                    }
                },
                data: {
                    tempo_lido: tempoLido, 
                    paginas_lidas: paginasLidas,
                },
                select: {
                    idleitor: true,
                    idlivro: true ,
                    paginas_lidas: true,
                    tempo_lido: true,
                    livro: {
                        select: { 
                            titulo: true,
                            totalPag: true,
                        }
                    }
                }
            });
        }
        return null

    } catch (err) {
        console.log(err);
        return false;
    }
}


async function updatePagLidas(paginasLidas: number, livroId: number, userId: number){
    try{
        let livro = await getLivro(livroId)
        let registro = await getRegistro(livroId, userId);

        if(registro && livro && paginasLidas <= livro.totalPag){
            return await prisma.registro_livro.update({
                where: {
                    idlivro_idleitor: {
                        idleitor: userId,
                        idlivro: livroId,
                    }
                },
                data: {
                    paginas_lidas: paginasLidas,
                },
                select: {
                    idleitor: true,
                    idlivro: true ,
                    paginas_lidas: true,
                    tempo_lido: true,
                    livro: {
                        select: { 
                            titulo: true,
                            totalPag: true,
                        }
                    }
                }
            });
        }
        return null
    } catch (err) {
        console.log(err);
        return false;
    }
}


async function updateTempoLido(tempoLido: number, livroId: number, userId: number){
    try{
        let registro = await getRegistro(livroId, userId);

        if(registro){
            return await prisma.registro_livro.update({
                where: {
                    idlivro_idleitor: {
                        idleitor: userId,
                        idlivro: livroId,
                    }
                },
                data: {
                    tempo_lido: tempoLido, 
                },
                select: {
                    idleitor: true,
                    idlivro: true ,
                    paginas_lidas: true,
                    tempo_lido: true,
                    livro: {
                        select: { 
                            titulo: true,
                            totalPag: true,
                        }
                    }
                }
            });
        } 
        return null
    }  catch (err) {
        console.log(err);
        return false;
    }
}

async function getRegistro(livroId: number, userId: number){
    return await prisma.registro_livro.findUnique({
        where: {
            idlivro_idleitor: {
                idleitor: userId,
                idlivro: livroId,
            }
        }
    })
}

export const libModel = { 
    insertBook, 
    removeBook, 
    updateTempoLido, 
    updatePagLidas, 
    updateRegistro 
}

export {
    insertBook, 
    removeBook, 
    updateTempoLido, 
    updatePagLidas, 
    updateRegistro 
}