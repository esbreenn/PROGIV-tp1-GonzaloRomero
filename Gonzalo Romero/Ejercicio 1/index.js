import express from 'express';
const app = express();
const port = 3000;

app.use(express.json());

// Estado en memoria
let calculos = [];
let nextId = 1;

app.get('/', (_req, res) => {
  res.send('API Cálculos OK');
});

// POST /rectangulos
app.post('/rectangulos', (req, res) => {
  const keys = Object.keys(req.body);
  if (!(keys.length === 2 && keys.includes('base') && keys.includes('altura'))) {
    return res
      .status(400)
      .json({ success: false, message: "El JSON debe contener únicamente 'base' y 'altura'" });
  }

  const baseNum = Number(req.body.base);
  const alturaNum = Number(req.body.altura);

  if (!Number.isFinite(baseNum) || baseNum <= 0 || !Number.isFinite(alturaNum) || alturaNum <= 0) {
    return res
      .status(400)
      .json({ success: false, message: 'Solo se aceptan valores numéricos positivos' });
  }

  const perimetro = 2 * (baseNum + alturaNum);
  const superficie = baseNum * alturaNum;

  const nuevo = { id: nextId++, base: baseNum, altura: alturaNum, perimetro, superficie };
  calculos.push(nuevo);

  return res.status(201).json({ success: true, data: nuevo });
});

// GET /calculos  
app.get('/calculos', (req, res) => {
  const tipo = (req.query.tipo || '').toString().trim().toLowerCase();

  let resultado = calculos.map(e => ({
    ...e,
    tipo: e.base === e.altura ? 'cuadrado' : 'rectángulo'
  }));

  if (tipo) {
    if (!['cuadrado', 'rectangulo', 'rectángulo'].includes(tipo)) {
      return res
        .status(400)
        .json({ success: false, message: "El parámetro 'tipo' debe ser 'cuadrado' o 'rectangulo'" });
    }
    const esperado = tipo.startsWith('cuad') ? 'cuadrado' : 'rectángulo';
    resultado = resultado.filter(r => r.tipo === esperado);
  }

  return res.json({ success: true, data: resultado });
});

// GET /calculos/:id
app.get('/calculos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'id inválido' });
  }

  const item = calculos.find(c => c.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Cálculo no encontrado' });
  }

  return res.json({
    success: true,
    data: {
      ...item,
      tipo: item.base === item.altura ? 'cuadrado' : 'rectángulo'
    }
  });
});

// PUT /calculos/:id 
app.put('/calculos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'id inválido' });
  }

  const keys = Object.keys(req.body);
  if (!(keys.length === 2 && keys.includes('base') && keys.includes('altura'))) {
    return res
      .status(400)
      .json({ success: false, message: "El JSON debe contener únicamente 'base' y 'altura'" });
  }

  const baseNum = Number(req.body.base);
  const alturaNum = Number(req.body.altura);
  if (!Number.isFinite(baseNum) || baseNum <= 0 || !Number.isFinite(alturaNum) || alturaNum <= 0) {
    return res.status(400).json({ success: false, message: 'Solo se aceptan numeros positivos' });
  }

  const idx = calculos.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'calculo no encontrado' });
  }

  const perimetro = 2 * (baseNum + alturaNum);
  const superficie = baseNum * alturaNum;
  calculos[idx] = { id, base: baseNum, altura: alturaNum, perimetro, superficie };

  return res.json({
    success: true,
    data: {
      ...calculos[idx],
      tipo: baseNum === alturaNum ? 'cuadrado' : 'rectángulo'
    }
  });
});

// DELETE /calculos/:id
app.delete('/calculos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'parametro id invalido' });
  }

  const item = calculos.find(c => c.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'calculo no encontrado' });
  }

  calculos = calculos.filter(c => c.id !== id);

  return res.json({
    success: true,
    data: {
      ...item,
      tipo: item.base === item.altura ? 'cuadrado' : 'rectángulo'
    }
  });
});

// DELETE /calculos
app.delete('/calculos', (_req, res) => {
  const count = calculos.length;
  calculos = [];
  nextId = 1;
  return res.json({ success: true, message: `Se eliminaron ${count} cálculos` });
});

// 404 
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint no encontrado' });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
