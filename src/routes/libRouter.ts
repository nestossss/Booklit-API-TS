import e from 'express'; 
const router = e.Router();
import { checkToken } from '../util/token';
import { addBookExistente } from '../controller/libController';

router.put("/add/existente", checkToken, async (req, res) => {
    //res.locals.userId;
    let userId: number | undefined = res.locals.userId;
    
    let { bookUrl, titulo, descricao, autores } = req.body;
    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");
    if(!bookUrl) return res.status(400).send("faltando bookUrl");
    let resBody = await addBookExistente(bookUrl, userId);
    if(!resBody) return res.status(200).send("resBody nao existe");
    res.status(200).json(resBody);
    // controller
})

router.post("/add/novo", checkToken, async (req, res) => {
    let userId: number | undefined = res.locals.userId;
    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");

    console.log(req.body);

})

export { router };