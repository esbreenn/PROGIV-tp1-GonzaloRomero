import express from 'express';
const app = express();
const port = 3000;

app.use(express.json());

// Estado en memoria
let tareas = [];

/**
 * POST /tareas
 * Body exacto: { nombre, completada }  (completada: boolean)
 * Verifica que no se repitan nombres 
 */
app.post('/tareas', (req, res) => {
  const keys = Object.keys(req.body);
  if (!(keys.length === 2 && keys.includes('nombre') && keys.includes('completada'))) {
    return res
      .status(400)
      .json({ success: false, message: "El JSON debe contener únicamente 'nombre' y 'completada'" });
  }

  const nombre = (req.body.nombre ?? '').toString().trim();
  const completada = req.body.completada;

  if (nombre === '' || nombre.length > 100) {
    return res.status(400).json({ success: false, message: 'El campo nombre es inválido' });
  }
  if (typeof completada !== 'boolean') {
    return res.status(400).json({ success: false, message: "El campo 'completada' debe ser booleano" });
  }

  // Unico por nombre
  const key = nombre.toLowerCase();
  const existe = tareas.some(t => t.nombre.trim().toLowerCase() === key);
  if (existe) {
    return res.status(409).json({ success: false, message: 'Ya existe una tarea con ese nombre' });
  }

  const nueva = { nombre, completada };
  tareas.push(nueva);

  return res.status(201).json({ success: true, data: nueva });
});

/**
 * GET /tareas
 *   - completadas  → tareas con completada === true
 *   - pendientes   → tareas con completada === false
 * Cualquier otro valor de "estado" → 400.
 */

app.get('/tareas', (req, res) => {
  const estado = (req.query.estado || '').toString().trim().toLowerCase();

  let resultado = tareas;

  if (estado) {
    if (!['completadas', 'pendientes'].includes(estado)) {
      return res
        .status(400)
        .json({ success: false, message: "El parámetro 'estado' debe ser 'completadas' o 'pendientes'" });
    }
    const flag = estado === 'completadas';
    resultado = tareas.filter(t => t.completada === flag);
  }

  return res.json({ success: true, data: resultado });
});

/**
 * DELETE /tareas
 */
app.delete('/tareas', (req, res) => {
  const qNombre = (req.query.nombre ?? '').toString().trim();

  // Borrar una por nombre
  if (qNombre) {
    const key = qNombre.toLowerCase();
    const idx = tareas.findIndex(t => t.nombre.trim().toLowerCase() === key);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }

    const [eliminada] = tareas.splice(idx, 1);
    return res.json({ success: true, data: eliminada });
  }

  // Limpiar todas
  const count = tareas.length;
  tareas = [];
  return res.json({ success: true, message: `Se eliminaron ${count} tareas` });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});