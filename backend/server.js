const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('🔥 BACKEND OK 🔥')
})

app.post('/analyze', (req, res) => {
  const { query, keyword, percentual } = req.body

  const score = percentual !== undefined
    ? Math.round(percentual * 0.6 + Math.floor(Math.random() * 20) + 30)
    : Math.floor(Math.random() * 40) + 60

  const finalScore = Math.min(score, 100)

  let diagnostico = ''
  if (finalScore > 85) {
    diagnostico = 'Perfil muito forte e bem posicionado'
  } else if (finalScore > 70) {
    diagnostico = 'Bom perfil, mas pode melhorar SEO e avaliações'
  } else if (finalScore > 50) {
    diagnostico = 'Perfil regular, algumas melhorias são necessárias'
  } else {
    diagnostico = 'Perfil fraco, precisa de otimização urgente'
  }

  res.json({
    empresa: query,
    palavraChave: keyword,
    score: finalScore,
    diagnostico
  })
})

app.listen(5001, () => {
  console.log('Servidor rodando na porta 5001')
})