import e from 'express'; 
const router = e.Router();
import { libController } from '../controller/libController';
import { getBook } from '../model/booksModel';
import { Note, Quote } from '../util/types';

router.get("/", async (req, res, next) => {
    let userId: number = res.locals.userId;
    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");

    let resBody = await libController.getLibrary(userId); 
    if(!resBody) return res.sendStatus(500);

    return res.status(resBody.status).send(resBody);
});

router.get("/registro", async (req, res, next) => {
    let userId: number = res.locals.userId;
    let bookUrl = req.query?.bookUrl?.toString();

    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");
    if(!bookUrl) return res.status(400).send("Faltando parametro");

    bookUrl = bookUrl.trim();

    let resBody = await libController.getRegistro(userId, bookUrl);
    if(!resBody) return res.sendStatus(500);
    return res.status(200).json(resBody);
})

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
        if(!paginasLidas && !tempoLido){
            body = await getBook(bookId);
            if(!body || body == null){ 
                body = undefined;
            }
            if(body?.bookUrl) body = await libController.getRegistro(userId, body.bookUrl);
        }
        return res.status(200).send(body);
    }
    return res.status(400).send("Falta no body: 'paginasLidas' e/ou 'tempoLido', pode colocar os dois ou nao; Ou 'bookId' nos parametros");
})

router.delete("/remover", async (req, res) => {
    let userId: number | undefined = res.locals.userId;
    if(!userId) return res.status(400).send("por algum motivo nao existe userId na API, token invalido?");

    if(req.query?.bookId){
        let bookId: number = parseInt(req.query.bookId.toString().trim());
        let body = await libController.removeBook(bookId, userId);
        if(body?.erro){
            return res.status(500).send(body);
        }
        if (body){
            return res.status(200).send(body);
        }
        return res.sendStatus(500);
    }
    return res.status(400).send("Falta bookId nos parametros");

});

router.put("/atualizar/nota", async (req, res) => {
    if(typeof req.query.idlivro != 'string' ) return res.sendStatus(400);
    let bookId = parseInt(req.query.idlivro.trim());
    let userId: number = res.locals.userId;
    
    let { title, content, page, line, type }: { 
        title: string, 
        content: string, 
        page?: string, 
        line?: string, 
        type: "quote" | "note"
    } = req.body;
    if((!title || !content || !type) || (type == 'quote' && !page)) return res.status(400).send("Faltando informações no body");

    if(type != 'quote' && type != 'note') return res.status(400).send("O tipo de anotação pode ser 'note' ou 'quote'")
    if(type == 'quote' && !page) return res.status(400).send("Não é possível adicionar uma citação sem informar a página");
    let infoNote = {title, content, page: page? parseInt(page): undefined, line: line? parseInt(line): undefined, type}
    let body = await libController.addNota(bookId, userId, infoNote)
    return res.status(body?.erro? 500:200).send(body);
})

router.delete("/atualizar/nota", async (req, res) =>{
    if(typeof req.query.idnota != 'string' ) return res.sendStatus(400);
    let noteId = parseInt(req.query.idnota.trim());
    let userId: number = res.locals.userId;

    let body = await libController.removeNota(noteId, userId);
    return res.status(body.status).send(body);
})

export { router };