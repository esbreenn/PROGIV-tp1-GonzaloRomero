import express from 'express';
const app = express();
const port = 3000;

app.use(express.json());

// Arreglo interno
const calculos = [];

// POST /calculos  { base, altura }
app.post('/calculos', (req, res) => {
  const keys = Object.keys(req.body);
  if (!(keys.length === 2 && keys.includes('base') && keys.includes('altura'))) {
    return res.status(400).json({ error: "El JSON debe contener únicamente 'base' y 'altura'" });
  }

  const baseNum = Number(req.body.base);
  const alturaNum = Number(req.body.altura);
  if (!Number.isFinite(baseNum) || baseNum <= 0 || !Number.isFinite(alturaNum) || alturaNum <= 0) {
    return res.status(400).json({ error: 'Solo se aceptan numeros' });
  }

  const perimetro = 2 * (baseNum + alturaNum);
  const superficie = baseNum * alturaNum;


//guardamos en el arreglo
  calculos.push({ base: baseNum, altura: alturaNum, perimetro, superficie });

  return res.status(201).json({ base: baseNum, altura: alturaNum, perimetro, superficie });
});

// GET /calculos
app.get('/calculos', (_req, res) => {
  const resultado = calculos.map(e => ({
    ...e,
    tipo: e.base === e.altura ? 'cuadrado' : 'rectángulo'
  }));
  res.json(resultado);
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
