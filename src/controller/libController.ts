import { findBook } from "../model/booksModel";
import { libModel } from "../model/libModel";
import { Note, Quote } from "../util/types";

const googleKey = process.env.GOOGLE_API_KEY;

interface Book{
    autores?: {
        nome: string;
    }[] | Array<string>;
    generos?: {
        nome: string;
    }[] | Array<string>;

    idlivro: number;
    temBookUrl: boolean;
    bookUrl: string | null;
    titulo: string;
    sinopse: string;
    totalPag: number;
}

async function getLibrary(userId: number){
    let response = await libModel.getLibrary(userId);
    if(response){
        let formatedData = response.map( (data) => {
            let livro: Book = data.livro;
            if(livro.autores && livro.autores.length > 0){
                livro.autores = livro.autores.map( (autor) => {
                    if(typeof autor != "string"){
                        return autor.nome;
                    }
                    return autor
                });
            } else {
                delete livro.autores;
            }
            if(livro.generos && livro.generos.length > 0){
                livro.generos = livro.generos.map( (genero) => {
                    if(typeof genero != "string"){
                        return genero.nome;
                    }
                    return genero;
                });
            } else {
                delete livro.generos
            }
            return {
                livro,
                "notas": data.nota,
                "paginasLidas": data.paginas_lidas,
                "tempoLido": data.tempo_lido,
            }
        });
        return { 
            "status": 200,
            "biblioteca": formatedData,
        }
    }
    if(response == null){
        return {
            "status": 400,
            "message": "Nenhum registro encontrado"
        }
    }
    return { 
        "status": 500,
        "erro": "Pane no sistema"
    }
}

async function getRegistro(userId: number, bookUrl: string){
    let book = await findBook(bookUrl);
    if(book){
        let response = await libModel.getRegistro(book.idlivro, userId);
        if(response){
            return {
                'status': 200,
                'registro': response,
                'message': 'ok',
            }
        }
    }
    return {
        'status': 200,
        'message': 'Registro não existe'
    }
    
}

async function addBookExistente(bookUrl: string, userId: number){
    try{
        let response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookUrl}?key=${googleKey}`).catch( (err) => undefined);
        let bookExists = await response?.json();
        let categories = bookExists?.volumeInfo.categories[0].split(' / ');
        let { authors, title, description, pageCount } = bookExists?.volumeInfo;
        let imgLinks = bookExists?.volumeInfo.imageLinks;
        let imgUri: string = imgLinks.medium? imgLinks.medium : imgLinks.large? imgLinks.large : imgLinks.small? imgLinks.small : imgLinks.thumbnail  
        console.log(title, authors, categories, pageCount);

        if(bookExists){
            //bookExists.volumeInfo.title
            let registro = await libModel.insertBook(userId, title, description, pageCount, authors, categories, bookUrl, imgUri);
            if(!registro) {
                console.log("Registro não criado, provavelmente já existe :)");
                return{
                    "status": 200,
                    "message": "Registro já existe",
                }
            }
            return {
                "status": 200,
                registro,
                "message": "Registro criado"
            }
        } // talvez metendo outro if aqui da pra usar a mesma funcao pra existente e novo
        return {
            "status": 400,
            "message": "ID não existe no Google Books",
        }
    } catch (err) {
        return {
            "status": 500,
            "erro": err,
            "message": "nem ideia do erro, mas, pane no sistema"
        }
    }
}

// async function addBookNovo(bookInfo: BookCreate, userId: number){
//     try{
//         let{ titulo, desc, numPag, autores, generos} = bookInfo
//         let book = libModel.insertBook(userId, titulo, desc, numPag, autores, generos, undefined);

//     } catch {

//     }
// }

async function updateRegistro(livroId: number, userId: number, paginasLidas: number, tempoLido: number){
    try{
        let registro = await libModel.updateRegistro({
            paginas_lidas: paginasLidas, tempo_lido: tempoLido,
        }, livroId, userId);

        if(registro){
            return registroTemplate(registro);
        }
        if(registro == null){
            return {
                "status": 200,
                "message": "Não foi possível atualizar o registro",
            }
        }
        return "ue numero 3"
    } catch (err) {
        console.log(err);
    }
}

async function updatePagLidas(livroId: number, userId: number, paginasLidas: number){
    try{
        let registro = await libModel.updateRegistro({
            paginas_lidas: paginasLidas,
        }, livroId, userId);
        if(registro){
            return await registroTemplate(registro);
        }
        if(registro == null){
            return {
                "status": 200,
                "message": "Não foi possível atualizar o registro",
            }
        }
        return "erro"
    } catch (err) {
        console.log(err);
    }
};

async function updateTempoLido(livroId: number, userId: number, tempoLido: number){
    try{
        let registro = await libModel.updateRegistro({
            tempo_lido: tempoLido,
        }, livroId, userId);
        if(registro){
            return registroTemplate(registro);
        }
        if(registro == null){
            return {
                "status": 200,
                "erro": "Não foi possível atualizar o registro",
                "motivo": "Registro não existe ou número de páginas excedido"
            }
        }
        return "erro"
    } catch (err) {
        console.log(err);
    }
};

async function removeBook(livroId: number, userId: number){
    try{
        let removido = await libModel.removeBook(livroId, userId);
        if(removido){
            return {
                "status": 200,
                "message": `Registro de ${removido.livro.titulo} removido`,
                "registroRemovido": removido,
            }
        }
        if(removido == null){
            return {
                "status": 200,
                "erro": "Não foi possível remover o registro",
                "motivo": "Registro não existe"
            }
        }
        return {
            "status": 500,
            "erro": "Pane no sistema",
        }
    } catch (err){
        console.log(err);
    }
}


async function addNota(bookUrl: string, userId: number, nota: Note | Quote){
    try{
        let newNote = await libModel.addNota(bookUrl, userId, nota);
        console.log(newNote)
        if(newNote){    
            return {
                "status": 200,
                "message": "Nova nota adicionada",
                "nota": {
                    ...newNote,
                    idlivro: undefined,
                    idleitor: undefined,
                }
            }
        }
        if(newNote === false){
            return {
                "status": 404,
                "message": "Livro não existe"
            }
        }
        return {
            "status": 500,
            "erro": "algo deu errado"
        }
    } catch(err) {
        console.log(err);
        return {
            "status": 500,
            "erro": "algo deu errado"
        }
    }
}

async function updateNota(noteId: number, userId: number, updatedData: Partial<Note | Quote>) {
    try {
        let updatedNote = await libModel.updateNota(noteId, userId, updatedData);

        if (updatedNote) {
            return {
                status: 200,
                message: "Nota atualizada com sucesso",
                nota: {
                    ...updatedNote,
                    idlivro: undefined,
                    idleitor: undefined,
                },
            };
        }

        return {
            status: 404,
            message: "Nota não encontrada ou você não tem permissão para atualizá-la",
        };
    } catch (err) {
        console.log(err);
        return {
            status: 500,
            erro: "Erro ao tentar atualizar a nota",
        };
    }
}


async function removeNota(noteId: number, userId: number){
    try{
        let deletedNote = await libModel.deleteNota(noteId, userId);
        if(deletedNote){
            return {
                "status": 200,
                "message": "Nota removida"
            }
        }
        if(deletedNote == false){
            return {
                "status": 404,
                "message": "Nota não existe"
            }
        }
        return {
            "status": 500,
            "message": "Algo deu errado"
        }
    } catch(err) {
        console.log(err);
        return {
            "status": 500,
            "erro": "Algo deu errado"
        }
    }
}
export const libController = {
    getLibrary,
    getRegistro,
    addBookExistente,
    // addBookNovo,
    updateRegistro,
    updateTempoLido,
    updatePagLidas,
    removeBook,
    addNota,
    updateNota,
    removeNota
}

/*  utilidade - utilidade - utilidade - utilidade - utilidade */ 
function registroTemplate(registro: any){
    return {
        "status": 200,
        "registro": {
            "tempoLeitura": registro.tempo_lido,
            "paginasLidas": registro.paginas_lidas,
            "paginasFaltando": registro.livro.totalPag - registro.paginas_lidas,
            "livro": {
                "livroId": registro.idlivro,
                "titulo": registro.livro.titulo,
                "numeroPaginas": registro.livro.totalPag,
            },
        },
        "message": "Registro atualizado",
    }
}









