# Desplegar API en Render - Guía Paso a Paso

## Paso 1: Subir a GitHub

1. Ir a [github.com/new](https://github.com/new) y crear un repositorio nuevo
2. Nombre: `proteccion-mta-api` (o el que quieras)
3. Dejarlo **privado**
4. NO marcar "Add a README" (ya lo tenemos)
5. Abrir terminal en la carpeta `api-garamta/` y ejecutar:

```bash
git init
git add .
git commit -m "API proteccion MTA"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/proteccion-mta-api.git
git push -u origin main
```

## Paso 2: Crear Base de Datos PostgreSQL en Render

1. Ir a [dashboard.render.com](https://dashboard.render.com)
2. Click en **New +** (arriba a la derecha)
3. Seleccionar **PostgreSQL**
4. Configurar:
   - **Name:** `proteccion-db`
   - **Region:** Oregon (o la más cercana)
   - **PostgreSQL Version:** 16
   - **Plan:** Free
5. Click en **Create Database**
6. Esperar a que se cree (tarda ~1 minuto)
7. En la página de la base de datos, buscar la sección **Connections**
8. Copiar el valor de **Internal Database URL** (empieza con `postgresql://...`)
9. Guardar esa URL, la necesitarás en el siguiente paso

## Paso 3: Crear Web Service (la API)

1. En el dashboard de Render, click en **New +** → **Web Service**
2. Seleccionar **Build and deploy from a Git repository** → Next
3. Conectar tu cuenta de GitHub si no lo has hecho
4. Buscar y seleccionar el repositorio `proteccion-mta-api`
5. Configurar:
   - **Name:** `proteccion-mta-api`
   - **Region:** La misma que la base de datos
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. Antes de crear, ir a la sección **Environment Variables**
7. Agregar una variable:
   - **Key:** `DATABASE_URL`
   - **Value:** Pegar la Internal Database URL del paso 2
8. Click en **Create Web Service**

## Paso 4: Verificar

1. Esperar a que el deploy termine (2-3 minutos)
2. Render te dará una URL tipo: `https://proteccion-mta-api.onrender.com`
3. Abrir esa URL en el navegador, debería mostrar los endpoints disponibles
4. Probar: `https://proteccion-mta-api.onrender.com/api/status`
   - Debe responder: `{"status":"online","db":"conectada"}`
5. Las tablas se crean solas al primer arranque

## Paso 5: Conectar con el Script MTA

1. Abrir `reparacion/config.lua` en tu servidor MTA
2. Cambiar la línea `API_URL`:

```lua
API_URL = "https://proteccion-mta-api.onrender.com"
```

3. Reiniciar el recurso en MTA

## Notas Importantes

- El plan Free de Render **duerme** la API después de 15 min sin recibir peticiones. La primera petición después de dormir tarda ~30 segundos. El script MTA tiene reintentos automáticos para manejar esto.
- La base de datos Free de Render se **borra después de 90 días**. Para producción considerar un plan pago.
- Si cambias algo en el código, solo haz `git push` y Render redespliega automáticamente.
