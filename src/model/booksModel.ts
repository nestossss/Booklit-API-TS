import prisma from "./client/dbclient";

async function newBook(
   titulo: string,
   desc: string,
   totalPag: number, 
   autores: Array<string> | undefined, 
   generos: Array<string> | undefined, 
   bookUrl: string | undefined,
){
   try{
       let data: any = {
           titulo: titulo,
           sinopse: desc,
           totalPag: totalPag,
       }
       
       let generosObj, autoresObj;

       if(bookUrl){
           data.bookUrl = bookUrl;
           data.temBookUrl = true;
       } else {
           data.temBookUrl = false;
       }

       if(generos){
           let generosConOrCreate: Array<any> = [];
           generos.forEach( (genero) => {
               generosConOrCreate.push({ where: { nome: genero }, create: { nome: genero } });
           });
           generosObj = {
               connectOrCreate: generosConOrCreate,
           }
           data.generos = generosObj;
       }

       if(autores){
           let autoresConOrCreate: Array<any> = [];
           autores.forEach( (autor) => {
               autoresConOrCreate.push({ where: { nome: autor }, create: { nome: autor } });
           });
           autoresObj = {
               connectOrCreate: autoresConOrCreate,
           }
           data.autores = autoresObj;
       }

       return await prisma.livro.create({
           data,
           select:{
               idlivro: true,
           }
       });

   } catch (err){
       console.log("deu erro, esse aqui ó:" + err);
       return null;
   }
}

async function getBook(livroId: number) {
   return await prisma.livro.findUnique({
       where: {
           idlivro: livroId,
       },
   });
}

async function findBook(bookUrl: string){
   return await prisma.livro.findUnique({
       where: {
           bookUrl: bookUrl,
       },
       select: {
           idlivro: true,
       }
   });
}

async function deleteBook(livroId: number){
   return await prisma.livro.delete({
      where: {
         idlivro: livroId,
      }
   })
}

export const booksModel = {
   newBook,
   findBook,
   getBook,
   deleteBook,
}

export {
   newBook,
   findBook,
   getBook,
   deleteBook,
}