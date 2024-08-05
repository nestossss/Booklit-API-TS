import e from 'express'; 
const router = e.Router();
import { checkToken } from '../util/token';
import { libController } from '../controller/libController';

router.get("/", async (req, res, next) => {
    let userId: number = res.locals.userId;
    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");

    let resBody = await libController.getLibrary(userId); 
    if(!resBody) return res.sendStatus(500);

    return res.status(resBody.status).send(resBody);
});

router.put("/adicionar/existente", async (req, res) => {
    //res.locals.userId;
    let userId: number | undefined = res.locals.userId;
    
    let { bookUrl } = req.body;

    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");
    if(!bookUrl) return res.status(400).send("faltando bookUrl");
    let resBody = await libController.addBookExistente(bookUrl, userId);
    if(!resBody) return res.status(200).send("resBody nao existe");
    res.status(200).send(resBody);
    // controller
})

router.post("/adicionar/novo", async (req, res) => {
    let userId: number | undefined = res.locals.userId;
    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");

    res.send("Não implementada ainda");

    console.log(req.body);

})

router.put("/atualizar", async (req, res) => {
    let userId: number | undefined = res.locals.userId;
    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");

    if(typeof req.query.id != 'string' ) return res.sendStatus(400);
    let { paginasLidas, tempoLido } = req.body;

    let bookId = parseInt(req.query.id);    
    paginasLidas = parseInt(paginasLidas);
    tempoLido = parseInt(tempoLido);

    if(bookId){
        let body;
        if(tempoLido && paginasLidas){
            body = await libController.updateRegistro(bookId, userId, paginasLidas, tempoLido);
        }
        if(tempoLido && !paginasLidas){
            body = await libController.updateTempoLido(bookId, userId, tempoLido);
        }
        if(paginasLidas && !tempoLido){
            body = await libController.updatePagLidas(bookId, userId, paginasLidas);
        }
        return res.status(200).send(body);
    }
    return res.status(400).send("Falta no body: 'paginasLidas' e/ou 'tempoLido', pode colocar os dois ou nao; Ou 'bookId' nos parametros");
})

router.delete("/remover", async (req, res) => {
    let userId: number | undefined = res.locals.userId;
    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");

    if(req.body?.bookId){
        let bookId: number = parseInt(req.body.bookId);
        let body = await libController.removeBook(bookId, userId);
        if(body?.erro){
            return res.status(500).send(body);
        }
        if (body){
            return res.status(200).send(body);
        }
        return res.sendStatus(500);
    }
    return res.status(400).send("Falta bookId no body");

});

export { router };