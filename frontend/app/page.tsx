{resultado && (
  <div style={{
    marginTop: 30,
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 10
  }}>

    <h2>Resultado da Análise</h2>

    <p><strong>Empresa:</strong> {resultado.empresa}</p>
    <p><strong>Palavra-chave:</strong> {resultado.palavraChave}</p>

    <h3 style={{
      color: resultado.score > 80 ? 'green' :
             resultado.score > 60 ? 'orange' : 'red'
    }}>
      Score: {resultado.score}/100
    </h3>

    <p><strong>Diagnóstico:</strong> {resultado.diagnostico}</p>

  </div>
)}