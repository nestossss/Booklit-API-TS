import prisma from "./client/dbclient";

async function getLivro(livroId: number) {
   return await prisma.livro.findUnique({
       where: {
           idlivro: livroId,
       },
   });
}

async function deleteLivro(livroId: number){
   return await prisma.livro.delete({
      where: {
         idlivro: livroId,
      }
   })
}

export const booksModel = {
   getLivro,
   deleteLivro,
}

export {
   getLivro,
   deleteLivro,
}