import express = require('express');
import { streakController } from '../controller/streakController';
import { isInvalidDate } from '../util/date';
const router = express.Router();

router.get("/", async (req, res) => {
   let userId = res.locals.userId;
   if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");
   let body = await streakController.streakList(userId);
   if(!body || body?.erro) return res.sendStatus(500);
   return res.status(200).send(body);

});

router.put("/", async (req, res) =>{
   let userId = res.locals.userId;
   
   if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");
   if(!req.body.date) return res.status(400).send("Faltando: 'date' ");
   if(isInvalidDate(req.body.date)) return res.status(400).send("Data inválida");

   let date = new Date(req.body.date);
   let body = await streakController.processStreakUpdate(userId, date);

   if(!body){
      return res.send("body nao existe");
   }
   return res.status(200).send(body);
});


export { router };