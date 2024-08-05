import prisma from "./client/dbclient";
import { streak } from "@prisma/client";

// Função para inserir uma nova streak
async function insertStreak(userId: number, date: Date): Promise<streak | null> { 

   // Verifica se já existe uma streak para o usuário na data fornecida
   let streakExists = await getStreak(userId, date);
   // Retorna null se a streak já existir
   if(streakExists) return null;

   // Se a streak não existir, cria uma nova
   return await prisma.streak.create({
      data: {
         primeiroDia: date,
         ultimoDia: date,
         leitor: {
            connect: {
               idleitor: userId,
            },
         }
      }
   })
}

// Função para atualizar uma streak existente
async function updateStreak(userId: number, firstDate: Date, lastDate: Date): Promise<streak | null>{
   // Atualiza o campo ultimoDia da streak identificada pelo idLeitor e primeiroDia
   return await prisma.streak.update({
      data: {
         ultimoDia: lastDate,
      },
      where: {
         idLeitor_primeiroDia: {
            idLeitor: userId,
            primeiroDia: firstDate,
         }
      },
   })
}

// Função para obter a lista de streaks de um usuário
async function getStreakList(userId: number): Promise<streak[]>{
   // Retorna todas as streaks do usuário fornecido
   return await prisma.streak.findMany({
      where: {
         idLeitor: userId,
      }
   })
}

// Função para obter uma streak específica de um usuário na data fornecida
async function getStreak(userId: number, date: Date): Promise<streak | null> {
   // Retorna a primeira streak que corresponde ao idLeitor e ultimoDia fornecidos
   return await prisma.streak.findFirst({
      where: {
         idLeitor: userId,
         ultimoDia: date,
      }
   })
}


// Função para obter a última streak de um usuário
async function getLastStreak(userId: number){
   // Retorna a primeira streak do usuário ordenada pelo campo ultimoDia em ordem decrescente
   return await prisma.streak.findFirst({
      where: {
         idLeitor: userId
      },
      orderBy: {
         ultimoDia: 'desc',
      }
   })
}

export const streakModel = {
   updateStreak,
   getStreakList,
   insertStreak,
   getLastStreak,
}

