import { libModel } from "../model/libModel";
const googleKey = process.env.GOOGLE_API_KEY;

async function addBookExistente(bookUrl: string, userId: number){
    try{
        var bookExists = await (await fetch(`https://www.googleapis.com/books/v1/volumes/${bookUrl}?key=${googleKey}`)).json();
        let generos = bookExists.volumeInfo.categories[0].split(' / ');
        let autores = bookExists.volumeInfo.authors;
        let titulo = bookExists.volumeInfo.title;
        let desc = bookExists.volumeInfo.description;
        let numPag = bookExists.volumeInfo.pageCount;
        console.log(titulo, autores, generos, numPag);

        if(bookExists){
            //bookExists.volumeInfo.title
            let registro = await libModel.insertBook(userId, titulo, desc, autores, generos, numPag, bookUrl);
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
    }
    catch (err){
        return {
            "status": 500,
            "erro": err,
            "message": "nem ideia do erro, mas, pane no sistema :)",
        }
    }
}

async function updateRegistro(livroId: number, userId: number, paginasLidas: number, tempoLido: number){
    try{
        let registro = await libModel.updateRegistro(tempoLido, paginasLidas, livroId, userId);
        if(registro){
            return await registroTemplate(registro);
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
        let registro = await libModel.updatePagLidas(paginasLidas, livroId, userId);
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
        let registro = await libModel.updateTempoLido(tempoLido, livroId, userId)
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

async function removeBook(){}

async function addBookNovo(){}  // opcional - 2



/*  utilidade - utilidade - utilidade - utilidade - utilidade */ 
async function registroTemplate(registro: any){
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

export const libController = {
    addBookExistente,
    addBookNovo,
    updateRegistro,
    updateTempoLido,
    updatePagLidas,
    removeBook,
}









