const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const rows = await db.query(
            "SELECT sv.*, s.nombre as script_nombre, s.script_key FROM servidores sv JOIN scripts s ON sv.script_id = s.id ORDER BY sv.created_at DESC"
        );
        res.json({ status: 'success', servidores: rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Error al listar servidores' });
    }
});

router.get('/scripts-list', async (req, res) => {
    try {
        const rows = await db.query("SELECT id, nombre FROM scripts WHERE estado='activo' ORDER BY nombre");
        res.json({ status: 'success', scripts: rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Error al listar scripts' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { script_id, ip_servidor, puerto, propietario } = req.body;
        if (!script_id || !ip_servidor) {
            return res.status(400).json({ status: 'error', message: 'Script e IP son obligatorios' });
        }
        await db.query(
            'INSERT INTO servidores (script_id, ip_servidor, puerto, propietario) VALUES ($1, $2, $3, $4)',
            [script_id, ip_servidor, puerto || '22003', propietario || '']
        );
        res.json({ status: 'success', message: 'Servidor creado' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Error al crear servidor' });
    }
});

router.post('/:id/toggle', async (req, res) => {
    try {
        const id = req.params.id;
        await db.query(
            "UPDATE servidores SET estado = CASE WHEN estado = 'activo' THEN 'inactivo' ELSE 'activo' END WHERE id = $1",
            [id]
        );
        res.json({ status: 'success', message: 'Estado cambiado' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Error al cambiar estado' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM servidores WHERE id = $1', [req.params.id]);
        res.json({ status: 'success', message: 'Servidor eliminado' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Error al eliminar' });
    }
});

module.exports = router;
