import express from 'express';
const app = express();
const port = 3000;

app.use(express.json());

// Estado en memoria
let alumnos = [];
let nextId = 1;

// POST /alumnos  { nombre, nota1, nota2, nota3 }
app.post('/alumnos', (req, res) => {
  const keys = Object.keys(req.body);
  if (!(keys.length === 4 && keys.includes('nombre') && keys.includes('nota1') && keys.includes('nota2') && keys.includes('nota3'))) {
    return res.status(400).json({ success: false, message: "El JSON debe contener únicamente 'nombre', 'nota1', 'nota2', 'nota3'" });
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
  if (![n1, n2, n3].every(n => n >= 0 && n <= 10)) {
    return res.status(400).json({ success: false, message: 'Las notas deben estar entre 0 y 10' });
  }

  // Unicidad por nombre
  const key = nombre.toLowerCase();
  const existe = alumnos.some(a => a.nombre.trim().toLowerCase() === key);
  if (existe) {
    return res.status(409).json({ success: false, message: 'Ya existe un alumno con ese nombre' });
  }

  const nuevo = { id: nextId++, nombre, nota1: n1, nota2: n2, nota3: n3 };
  alumnos.push(nuevo);

  return res.status(201).json({ success: true, data: nuevo });
});

// GET /alumnos/:id
app.get('/alumnos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'id inválido' });
  }

  const item = alumnos.find(a => a.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
  }

  const promedio = (item.nota1 + item.nota2 + item.nota3) / 3;
  let condicion = 'reprobado';
  if (promedio >= 8) condicion = 'promocionado';
  else if (promedio >= 6) condicion = 'aprobado';

  return res.json({ success: true, data: { ...item, promedio, condicion } });
});

// PUT /alumnos/:id 
app.put('/alumnos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'id inválido' });
  }

  const keys = Object.keys(req.body);
  if (!(keys.length === 4 && keys.includes('nombre') && keys.includes('nota1') && keys.includes('nota2') && keys.includes('nota3'))) {
    return res.status(400).json({ success: false, message: "El JSON debe contener únicamente 'nombre', 'nota1', 'nota2', 'nota3'" });
  }

  const nombre = (req.body.nombre ?? '').toString().trim();
  if (nombre === '' || nombre.length > 100) {
    return res.status(400).json({ success: false, message: 'El campo nombre es inválido' });
  }

  const n1 = Number(req.body.nota1);
  const n2 = Number(req.body.nota2);
  const n3 = Number(req.body.nota3);
  if (![n1, n2, n3].every(Number.isFinite)) {
    return res.status(400).json({ success: false, message: 'Las notas deben ser numéricas' });
  }
  if (![n1, n2, n3].every(n => n >= 0 && n <= 10)) {
    return res.status(400).json({ success: false, message: 'Las notas deben estar entre 0 y 10' });
  }

  const idx = alumnos.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
  }

  // Unicidad ignorando al propio id
  const key = nombre.toLowerCase();
  const colision = alumnos.some(a => a.id !== id && a.nombre.trim().toLowerCase() === key);
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

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
