# 🚀 TecnoCell — Tienda Online (Vercel + Supabase)

Tienda de accesorios de PC, teléfono y belleza con carrito dinámico, checkout automático por WhatsApp y **Panel de Administración (`/admin`)** conectado a **Supabase** (Base de datos PostgreSQL, Autenticación y Storage de imágenes) listo para desplegar en **Vercel**.

---

## 📁 Estructura del Proyecto

```
Tienda/
├── index.html         # Tienda pública (Catálogo, Carrito, WhatsApp)
├── styles.css         # Estilos de la tienda (Apple design aesthetic)
├── app.js             # Lógica dinámica conectada a Supabase
├── admin.html         # Panel de Administración (/admin)
├── admin.css          # Estilos del Panel Admin
├── admin.js           # CRUD, Subida de Fotos a Storage, Auth
├── supabaseClient.js  # Conector y helpers de Supabase
├── schema.sql         # Script SQL para tablas, RLS y Storage
├── vercel.json        # Configuración de rutas limpias para Vercel
└── README.md          # Esta guía
```

---

## 🛠️ Paso 1: Configurar Supabase (Base de Datos & Storage)

1. Entra a [supabase.com](https://supabase.com) e inicia sesión o crea una cuenta gratuita.
2. Haz clic en **"New Project"** y define el nombre de tu proyecto.
3. Ve al menú lateral **SQL Editor** y haz clic en **"New query"**.
4. Copia todo el contenido de [`schema.sql`](schema.sql) y pégalo allí.
5. Haz clic en **Run** (botón verde). Esto creará:
   - La tabla `products` con seguridad por filas (RLS).
   - El Storage Bucket `product-images` público para fotos.
   - Los 10 productos iniciales precargados.

---

## 👤 Paso 2: Crear tu Usuario Administrador

1. En tu panel de Supabase, ve a **Authentication** > **Users**.
2. Haz clic en **"Add user"** > **"Create user"**.
3. Ingresa tu correo (ej. `admin@tecnocell.com`) y una contraseña segura.
4. ¡Listo! Este será el usuario con el que ingresarás al panel `/admin`.

---

## 🔑 Paso 3: Conectar las Credenciales

1. En Supabase, ve a **Project Settings** (ícono de engranaje) > **API**.
2. Copia tu **Project URL** y tu **anon public Key**.
3. Abre [`supabaseClient.js`](supabaseClient.js) y reemplázalos:
   ```javascript
   window.SUPABASE_CONFIG = {
       url: 'https://TU_PROYECTO.supabase.co',
       anonKey: 'tu_clave_anon_publica_aqui'
   };
   ```
   *(También puedes ingresar las credenciales directamente en el botón **⚙️ Config** dentro del panel `/admin`)*.

---

## ⚡ Paso 4: Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Importa el repositorio **`speed205-ctrl/Tienda`**.
4. En **Framework Preset**, selecciona **Other** (HTML estático).
5. Haz clic en **Deploy**. ¡Tu tienda estará online con dominio `.vercel.app` en segundos!

---

## 🖥️ Módulo de Administración (`/admin`)

- Entra a `tudominio.vercel.app/admin` (o `admin.html`).
- Inicia sesión con el usuario que creaste en el **Paso 2**.
- Funcionalidades disponibles:
  - ➕ **Crear productos**: Título, categoría, precio, descripción.
  - 📸 **Subir fotos**: Arrastra imágenes directo desde tu PC y se subirán a Supabase Storage.
  - ✏️ **Editar o eliminar**: Modifica precios o datos en cualquier momento.
  - 👁️ **Ocultar / Destacar**: Activa o desactiva productos sin borrarlos.