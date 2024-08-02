import e from 'express'; 
const router = e.Router();
import { checkToken } from '../util/token';
import { libController } from '../controller/libController';

router.put("/add/existente", checkToken, async (req, res) => {
    //res.locals.userId;
    let userId: number | undefined = res.locals.userId;
    
    let { bookUrl, titulo, descricao, autores } = req.body;
    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");
    if(!bookUrl) return res.status(400).send("faltando bookUrl");
    let resBody = await libController.addBookExistente(bookUrl, userId);
    if(!resBody) return res.status(200).send("resBody nao existe");
    res.status(200).json(resBody);
    // controller
})

router.post("/add/novo", checkToken, async (req, res) => {
    let userId: number | undefined = res.locals.userId;
    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");

    console.log(req.body);

})

router.put("/atualizar", checkToken, async (req, res) => {
    let userId: number | undefined = res.locals.userId;
    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");

    if(typeof req.query.id != 'string' ) return res.sendStatus(400);
    let { paginasLidas, tempoLido } = req.body;

    let bookId = parseInt(req.query.id);    
    paginasLidas = parseInt(paginasLidas)
    tempoLido = parseInt(tempoLido)
    if(tempoLido && paginasLidas){
        let body = await libController.updateRegistro(bookId, userId, paginasLidas, tempoLido);
        return res.status(200).send(body);
    }
    if(tempoLido && !paginasLidas){
        let body = await libController.updateTempoLido(bookId, userId, tempoLido);
        return res.status(200).send(body);
    }
    if(paginasLidas && !tempoLido){
        let body = await libController.updatePagLidas(bookId, userId, paginasLidas);
        return res.status(200).send(body);

    }
    return res.status(400).send("Falta no body: 'paginasLidas' e/ou 'tempoLido', pode colocar os dois ou nao");
})
export { router };