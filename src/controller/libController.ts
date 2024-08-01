import { libModel } from "../model/libModel";

async function addBookExistente(bookUrl: string, userId: number): Promise<object>{
    try{
        var bookExists = await (await fetch(`https://www.googleapis.com/books/v1/volumes/${bookUrl}`)).json();
        let generos = await bookExists.volumeInfo.categories[0].split(' / ');
        let autores = await bookExists.volumeInfo.authors;
        let titulo = await bookExists.volumeInfo.title;
        let desc = await bookExists.volumeInfo.description;
        console.log(titulo, desc, autores, generos);

        if(bookExists){
            //bookExists.volumeInfo.title
            let registro = await libModel.insertBook(userId, titulo, desc, autores, generos, bookUrl);
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
                "message": "Livro criado"
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

async function removeBook(){}

async function addBookNovo(){}  // opcional - 2

export const libController = { addBookExistente }









