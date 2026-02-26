const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const totalScripts = await db.query('SELECT COUNT(*) as total FROM scripts');
        const totalServers = await db.query('SELECT COUNT(*) as total FROM servidores');
        const activeServers = await db.query("SELECT COUNT(*) as total FROM servidores WHERE estado='activo'");
        const totalLogs = await db.query('SELECT COUNT(*) as total FROM logs');
        const deniedLogs = await db.query("SELECT COUNT(*) as total FROM logs WHERE resultado='denegado'");
        const allowedLogs = await db.query("SELECT COUNT(*) as total FROM logs WHERE resultado='permitido'");
        const recentLogs = await db.query(
            "SELECT l.*, s.nombre as script_nombre FROM logs l LEFT JOIN scripts s ON l.script_id=s.id ORDER BY l.created_at DESC LIMIT 10"
        );
        res.json({
            status: 'success',
            stats: {
                totalScripts: parseInt(totalScripts[0].total),
                totalServers: parseInt(totalServers[0].total),
                activeServers: parseInt(activeServers[0].total),
                totalLogs: parseInt(totalLogs[0].total),
                deniedLogs: parseInt(deniedLogs[0].total),
                allowedLogs: parseInt(allowedLogs[0].total)
            },
            recentLogs
        });
    } catch (err) {
        console.error('Error en dashboard:', err.message);
        res.status(500).json({ status: 'error', message: 'Error al obtener estadísticas' });
    }
});

module.exports = router;
