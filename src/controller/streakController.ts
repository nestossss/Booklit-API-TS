import { streakModel } from "../model/streakModel";
import { streak } from "@prisma/client";
import { getDateWithoutTime } from "../util/date"
//Funcao para listar todas as streaks de um usuário
async function streakList(userId: number){
   // Obtém a lista de streaks do usuário
   let streakList = await streakModel.getStreakList(userId);  
   // Se ocorrer um erro ao obter a lista, retorna uma mensagem de erro
   if(!streakList){
      return {
         "status": 500,
         "erro": "Pane no sistema"
      }
   }

   // Se a lista estiver vazia, retorna uma mensagem informando que não há streaks
   if(streakList.length <= 0){
      return {
         "status": 200,
         "message": "Não existe nenhuma streak para o usuário",
      }
   }

   // Mapeia a lista de streaks para um formato específico para a resposta
   let body = streakList.map( (streak) => {
      return {
         "streakId": streak.idstreak,
         "start": streak.primeiroDia,
         "end": streak.ultimoDia
      }
   });

   // Retorna a lista de streaks encontrada
   return {
      "status": 200,
      "message": "Lista encontrada",
      "streakList": body
   }
}

async function processStreakUpdate(userId: number, actualDate: Date){
   
   // Obtém a última streak do usuário
   let lastStreak = await streakModel.getLastStreak(userId);

   // Se não existe nenhuma streak, cria a primeira de todas
   if(!lastStreak){ 
      lastStreak = await streakModel.insertStreak(userId, actualDate);
      return {
         "status": 200,
         "message": "Streak atualizada",
         lastStreak,
      }
   }

   // Remove a parte do tempo das datas para comparação
   let lastStreakDay = getDateWithoutTime(lastStreak.ultimoDia);
   let actualDateDay = getDateWithoutTime(actualDate);

   // Verifica se a data atual é válida
   if(actualDateDay < lastStreakDay){
      return {
         "status": 200,
         "message": "Data inválida: Envie a data atual",
      }
   }
   if(actualDateDay.getTime() == lastStreakDay.getTime()){
      return {
         "status": 200,
         "message": "Streak de hoje já foi atualizada",
      }
   }

   // Calcula o próximo dia esperado da streak
   let nextDay = lastStreakDay;
   nextDay.setDate(lastStreakDay .getDate()+1); 

   // Atualiza ou insere uma nova streak
   let body: streak | null = null;
   if(actualDateDay.getTime() == nextDay.getTime()){
      body = await streakModel.updateStreak(userId, lastStreak.primeiroDia, actualDate);
   }
   if(actualDateDay > nextDay){
      body = await streakModel.insertStreak(userId, actualDate);
   }

   // Verifica se a operação foi bem-sucedida
   if(!body){
      return {
         "status": 500,
         "erro": "Pane no sistema",
      }
   }

   // Retorna a resposta de sucesso
   return {
      "status": 200,
      "message": "Streak atualizada",
      body,
   }
}

export const streakController = { 
   streakList,
   processStreakUpdate,
}