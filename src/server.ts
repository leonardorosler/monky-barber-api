import app from './app'
 
const PORTA = process.env.PORT || 3333
 
app.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando na porta ${PORTA}`)
})
 