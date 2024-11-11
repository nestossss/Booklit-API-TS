import prisma from "./client/dbclient";
import { findBook, getBook, newBook } from './booksModel'
import { Note, Quote } from "../util/types";
 
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
    totalPag: number, 
    autores: Array<string> | undefined, 
    generos: Array<string> | undefined,
    bookUrl: string | undefined,
    imgUri: string,
){
    try{
        let livro;
        if(bookUrl){
            livro = await findBook(bookUrl);
        }
        if(!livro){
            livro = await newBook(titulo, desc, imgUri, totalPag, autores, generos, bookUrl);
        }
        if(!livro){
            return null;
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

async function updateRegistro(
    data: {
        tempo_lido?: number,
        paginas_lidas?: number
    },
    livroId: number,
    userId: number
){
    try{
        let livro = await getBook(livroId)
        let registro = await getRegistro(livroId, userId);
        if (livro && registro && Object.keys(data).length != 0 && (!data.paginas_lidas || data.paginas_lidas < livro.totalPag)){
            return await prisma.registro_livro.update({
                where: {
                    idlivro_idleitor: {
                        idleitor: userId,
                        idlivro: livroId,
                    }
                },
                data: data,
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


async function getLibrary(userId: number){
    return await prisma.registro_livro.findMany({
        where: {
            idleitor: userId,
        },
        select: {
            idlivro: true,
            nota: true,
            livro: {
                include: {
                    autores: {
                        select: {
                            nome: true,
                        },
                    },
                    generos: {
                        select: {
                            nome: true,
                        }
                    }
                },
            },
            paginas_lidas: true,
            tempo_lido: true,
        }
    });
}

async function getRegistro(livroId: number, userId: number){
    return await prisma.registro_livro.findUnique({
        where: {
            idlivro_idleitor: {
                idleitor: userId,
                idlivro: livroId,
            }
        },
        select: {
            idlivro: true,
            paginas_lidas: true,
            tempo_lido: true,
        }
    })
}

async function addNota(livroId: number, userId: number, nota: Note | Quote){
    try {
        return await prisma.nota.create({ 
            data: {
                title: nota.title,
                content: nota.content,
                page: nota.type == "quote"? nota.page : undefined,
                line: nota.type == "quote" && nota.line ? nota.line : undefined,
                type: nota.type,
                registro_livro: {
                    connect: {
                        idleitor_idlivro: {
                            idleitor: userId,
                            idlivro: livroId,
                        }
                    }
                },
            },
        });
    } catch(err){
        console.log(err);
        return null
    }
}

async function deleteNota(noteId: number, userId: number){
    try{
        let noteExists = await prisma.nota.findUnique({
            where: {
                idnota: noteId,
            }
        })
        if(!noteExists || noteExists.idleitor != userId) return false;
        let delNote = await prisma.nota.delete({
            where: {
                idnota: noteId
            }, 
        }) 
        if(!delNote) return null;
        return true
    } catch(err){

    }
}

export const libModel = { 
    insertBook, 
    removeBook, 
    updateRegistro,
    getLibrary,
    getRegistro,
    addNota,
    deleteNota
} // Exporta separado e junto - nsei se é uma boa
export {
    insertBook, 
    removeBook, 
    updateRegistro, 
    getLibrary,
    getRegistro,
    addNota,
    ResultsLibrary,
}




interface ResultsLibrary{
    livro: {
        autores: {
            nome: string;
        }[];
        generos: {
            nome: string;
        }[];
        idlivro: number;
        temBookUrl: boolean;
        bookUrl: string | null;
        titulo: string;
        sinopse: string;
        totalPag: number;
    };
    idlivro: number;
    paginas_lidas: number;
    tempo_lido: number;
}