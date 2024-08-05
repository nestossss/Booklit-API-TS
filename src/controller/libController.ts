import { libModel } from "../model/libModel";

const googleKey = process.env.GOOGLE_API_KEY;

interface BookCreate {
    titulo: string,
    desc: string,
    numPag: number, 
    generos?: Array<string>, 
    autores?: Array<string>
}

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

async function addBookExistente(bookUrl: string, userId: number){
    try{
        let response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookUrl}?key=${googleKey}`).catch( (err) => undefined);
        let bookExists = await response?.json();
        let categories = bookExists?.volumeInfo.categories[0].split(' / ');
        let { authors, title, description, pageCount } = bookExists?.volumeInfo;
        console.log(title, authors, categories, pageCount);

        if(bookExists){
            //bookExists.volumeInfo.title
            let registro = await libModel.insertBook(userId, title, description, pageCount, authors, categories, bookUrl);
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


export const libController = {
    getLibrary,
    addBookExistente,
    // addBookNovo,
    updateRegistro,
    updateTempoLido,
    updatePagLidas,
    removeBook,
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









