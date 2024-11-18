interface Note{
   title: string
   content: string
   type: "note"
}

interface Quote{ 
   title: string
   content: string
   page?: number
   line?: number
   type: "quote"
}

export {
   Note,
   Quote
}