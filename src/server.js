require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const verifyRoutes = require('./routes/verify');
const scriptsRoutes = require('./routes/scripts');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const servidoresRoutes = require('./routes/servidores');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${ip}`);
    next();
});
app.use('/api', verifyRoutes);         
app.use('/api/scripts', scriptsRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/servidores', servidoresRoutes); 
app.get('/', (req, res) => {
    res.json({
        name: 'MTA Protection API',
        version: '1.0.0',
        endpoints: {
            verify: 'GET /api/verify?key=KEY&port=PORT',
            status: 'GET /api/status',
            scripts: {
                list:       'GET    /api/scripts',
                get:        'GET    /api/scripts/:id',
                create:     'POST   /api/scripts',
                update:     'PUT    /api/scripts/:id',
                delete:     'DELETE /api/scripts/:id',
                toggle:     'POST   /api/scripts/:id/toggle',
                regenerate: 'POST   /api/scripts/:id/regenerate',
                renovar:    'POST   /api/scripts/:id/renovar',
            },
            logs: 'GET /api/scripts/logs/all?limit=100'
        }
    });
});

// Endpoint de diagnóstico
app.get('/api/health', async (req, res) => {
    try {
        const dbConnected = await db.testConnection();
        const config = {
            hasDbUrl: !!process.env.DATABASE_URL,
            dbHost: process.env.DB_HOST ? 'SET' : 'NOT SET',
            dbUser: process.env.DB_USER ? 'SET' : 'NOT SET',
            dbPass: process.env.DB_PASS ? 'SET' : 'NOT SET',
            dbName: process.env.DB_NAME ? 'SET' : 'NOT SET',
            dbSsl: process.env.DB_SSL || 'NOT SET'
        };
        
        let tableCheck = null;
        if (dbConnected) {
            try {
                const result = await db.query("SELECT COUNT(*) as total FROM admins");
                tableCheck = { admins: parseInt(result[0]?.total || 0) };
            } catch (e) {
                tableCheck = { error: e.message };
            }
        }
        
        res.json({
            status: dbConnected ? 'ok' : 'error',
            database: dbConnected ? 'connected' : 'disconnected',
            config,
            tables: tableCheck
        });
    } catch (err) {
        res.json({ status: 'error', message: err.message });
    }
});
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
});
async function start() {
    const dbOk = await db.initDatabase();
    if (!dbOk) {
        console.error('[!] No se pudo conectar/crear tablas en PostgreSQL');
        console.error('[!] Verifica DATABASE_URL o las variables DB_*');
    }
    app.listen(PORT, () => {
        console.log(`╔══════════════════════════════════════╗`);
        console.log(`║   MTA Protection API v1.0.0          ║`);
        console.log(`║   DB: PostgreSQL                     ║`);
        console.log(`║   Puerto: ${PORT}                        ║`);
        console.log(`║   Estado: ONLINE                     ║`);
        console.log(`╚══════════════════════════════════════╝`);
    });
}
start();
