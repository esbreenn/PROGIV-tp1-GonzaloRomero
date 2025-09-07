import express from 'express';
const app = express();
const port = 3000;

app.use(express.json());

// Estado en memoria
let alumnos = [];
let nextId = 1;

app.get('/', (_req, res) => {
  res.send('API Alumnos OK');
});

// POST /alumnos 
app.post('/alumnos', (req, res) => {
  const keys = Object.keys(req.body);
  if (
    !(
      keys.length === 4 &&
      keys.includes('nombre') &&
      keys.includes('nota1') &&
      keys.includes('nota2') &&
      keys.includes('nota3')
    )
  ) {
    return res
      .status(400)
      .json({ success: false, message: "El JSON debe contener únicamente 'nombre', 'nota1', 'nota2', 'nota3'" });
  }

  const nombre = (req.body.nombre ?? '').toString().trim();
  if (nombre === '' || nombre.length > 100) {
    return res.status(400).json({ success: false, message: 'El campo nombre es inválido' });
  }

  // Validar notas numéricas
  const n1 = Number(req.body.nota1);
  const n2 = Number(req.body.nota2);
  const n3 = Number(req.body.nota3);

  if (![n1, n2, n3].every(Number.isFinite)) {
    return res.status(400).json({ success: false, message: 'Las notas deben ser numéricas' });
  }
  if (![n1, n2, n3].every((n) => n >= 0 && n <= 10)) {
    return res.status(400).json({ success: false, message: 'Las notas deben estar entre 0 y 10' });
  }

  // Un unico nombre
  const key = nombre.toLowerCase();
  const existe = alumnos.some((a) => a.nombre.trim().toLowerCase() === key);
  if (existe) {
    return res.status(409).json({ success: false, message: 'Ya existe un alumno con ese nombre' });
  }

  const nuevo = { id: nextId++, nombre, nota1: n1, nota2: n2, nota3: n3 };
  alumnos.push(nuevo);

  return res.status(201).json({ success: true, data: nuevo });
});

// GET /alumnos 
app.get('/alumnos', (req, res) => {
  const estado = (req.query.estado || '').toString().trim().toLowerCase();

  let resultado = alumnos.map((a) => {
    const promedio = (a.nota1 + a.nota2 + a.nota3) / 3;
    let condicion = 'reprobado';
    if (promedio >= 8) condicion = 'promocionado';
    else if (promedio >= 6) condicion = 'aprobado';

    return { ...a, promedio, condicion };
  });

  if (estado) {
    if (!['reprobado', 'aprobado', 'promocionado'].includes(estado)) {
      return res
        .status(400)
        .json({ success: false, message: "El parámetro 'estado' debe ser 'reprobado', 'aprobado' o 'promocionado'" });
    }
    resultado = resultado.filter((r) => r.condicion === estado);
  }

  return res.json({ success: true, data: resultado });
});

// GET /alumnos/:id
app.get('/alumnos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'id inválido' });
  }

  const item = alumnos.find((a) => a.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
  }

  const promedio = (item.nota1 + item.nota2 + item.nota3) / 3;
  let condicion = 'reprobado';
  if (promedio >= 8) condicion = 'promocionado';
  else if (promedio >= 6) condicion = 'aprobado';

  return res.json({ success: true, data: { ...item, promedio, condicion } });
});

// PUT /alumnos/:id  { nombre, nota1, nota2, nota3 }
app.put('/alumnos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'id inválido' });
  }

  const keys = Object.keys(req.body);
  if (
    !(
      keys.length === 4 &&
      keys.includes('nombre') &&
      keys.includes('nota1') &&
      keys.includes('nota2') &&
      keys.includes('nota3')
    )
  ) {
    return res
      .status(400)
      .json({ success: false, message: "El JSON debe contener únicamente 'nombre', 'nota1', 'nota2', 'nota3'" });
  }

  const nombre = (req.body.nombre ?? '').toString().trim();
  if (nombre === '' || nombre.length > 100) {
    return res.status(400).json({ success: false, message: 'El campo nombre es inválido' });
  }

  const n1 = Number(req.body.nota1);
  const n2 = Number(req.body.nota2);
  const n3 = Number(req.body.nota3);

  if (![n1, n2, n3].every(Number.isFinite)) {
    return res.status(400).json({ success: false, message: 'Las notas deben ser unicamente numeros' });
  }
  if (![n1, n2, n3].every((n) => n >= 0 && n <= 10)) {
    return res.status(400).json({ success: false, message: 'Las notas deben estar entre 0 y 10' });
  }

  const idx = alumnos.findIndex((a) => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
  }

  // Unicidad ignorando al propio alumno
  const key = nombre.toLowerCase();
  const colision = alumnos.some((a) => a.id !== id && a.nombre.trim().toLowerCase() === key);
  if (colision) {
    return res.status(409).json({ success: false, message: 'Ya existe un alumno con ese nombre' });
  }

  alumnos[idx] = { id, nombre, nota1: n1, nota2: n2, nota3: n3 };

  const promedio = (n1 + n2 + n3) / 3;
  let condicion = 'reprobado';
  if (promedio >= 8) condicion = 'promocionado';
  else if (promedio >= 6) condicion = 'aprobado';

  return res.json({ success: true, data: { ...alumnos[idx], promedio, condicion } });
});

// DELETE /alumnos/:id
app.delete('/alumnos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'id inválido' });
  }

  const item = alumnos.find((a) => a.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
  }

  alumnos = alumnos.filter((a) => a.id !== id);

  const promedio = (item.nota1 + item.nota2 + item.nota3) / 3;
  let condicion = 'reprobado';
  if (promedio >= 8) condicion = 'promocionado';
  else if (promedio >= 6) condicion = 'aprobado';

  return res.json({ success: true, data: { ...item, promedio, condicion } });
});

// DELETE /alumnos
app.delete('/alumnos', (_req, res) => {
  const count = alumnos.length;
  alumnos = [];
  nextId = 1;
  return res.json({ success: true, message: `Se eliminaron ${count} alumnos` });
});

// 404 
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint no encontrado' });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
