# NOVA SHOP 🛍️

**Tienda virtual de demostración**, construida desde cero con HTML, CSS y JavaScript. Puedes adaptarla para una tienda de ropa, tecnología, accesorios, regalos, artículos para el hogar o cualquier negocio.

## ¿Qué incluye?

- Diseño responsive para celular, tablet y computadora.
- Catálogo de 8 productos de ejemplo con imágenes SVG locales.
- Filtros por categoría, buscador y ordenamiento por precio o nombre.
- Carrito con cantidades, subtotal y almacenamiento en `localStorage`.
- Resumen de pedido para copiar o enviar por WhatsApp.
- Sin dependencias, sin instalación y compatible con GitHub Pages.

**Importante:** este proyecto es una demo de frontend. **No tiene pasarela de pagos, inventario real, cuentas de usuarios ni base de datos**. El carrito se guarda solo en el navegador de cada visitante. Los productos y los precios son ficticios. Nunca debes guardar contraseñas o claves privadas en el repositorio público.

## Estructura del proyecto

```text
tienda_nova_github/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js     # Configuración de la tienda y WhatsApp
│   ├── products.js   # Lista de artículos, precios y categorías
│   └── app.js        # Carrito, filtros, búsqueda y WhatsApp
├── assets/           # Imágenes SVG originales de demostración
├── .nojekyll
├── .gitignore
└── README.md
```

## 1. Abrir la tienda en tu PC

1. Descomprime el proyecto.
2. Abre la carpeta en Visual Studio Code.
3. Abre `index.html` en el navegador (o usa la extensión Live Server).
4. Revisa el catálogo y prueba el carrito.

## 2. Personalizarla para un cliente

- **Nombre y WhatsApp:** modifica `js/config.js`.
- **Productos, precios y categorías:** modifica `js/products.js`.
- **Imágenes:** guarda las fotografías optimizadas en `assets/` y cambia la ruta `image` del producto.
- **Colores y estilo:** edita `css/styles.css` (variables CSS al inicio).
- **Textos e información:** modifica `index.html`.

### Activar pedidos por WhatsApp

En `js/config.js` cambia esta línea:

```js
whatsapp: "",
```

por un número autorizado que sea tuyo o del negocio, con código de país y sin `+` ni espacios:

```js
whatsapp: "593999999999", // Ejemplo ficticio: reemplázalo
```

Cuando alguien pulse **Solicitar por WhatsApp**, se abrirá un mensaje prellenado. **El pedido no está confirmado automáticamente**: el negocio debe revisar disponibilidad, envío, precio final y confirmar al comprador. Sin configurar el número, el botón muestra una indicación y no envía nada.

## 3. Subir el código a GitHub

Crea un repositorio público **vacío** con nombre `tienda-nova`, sin generar README adicional desde GitHub. En la terminal abierta dentro de esta carpeta ejecuta:

```bash
git init
git add .
git commit -m "Crear tienda virtual NOVA SHOP"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/tienda-nova.git
git push -u origin main
```

Reemplaza `TU_USUARIO` por tu nombre de usuario de GitHub. Si Git te pide configurar identidad, puedes usar `git config user.name "Tu nombre"` y `git config user.email "tu-email"` (mejor usar el correo privado `noreply` de GitHub si quieres ocultar tu email real).

Si ya existe el repositorio, adapta los comandos a su historial y URL en lugar de forzar un `push`.

## 4. Publicar con GitHub Pages gratis

1. Abre el repositorio en GitHub.
2. Entra a **Settings** → **Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Escoge **main** y la carpeta **/(root)**, después **Save**.
5. Tu página estará disponible en `https://TU_USUARIO.github.io/tienda-nova/` cuando termine el despliegue.

La publicación es gratis con un repositorio público. GitHub Pages solo aloja la parte estática; para cobros reales, cuentas, inventario o APIs con Python/Flask necesitas además un backend y un servicio de alojamiento adecuado.

## Próximas mejoras

- Panel de administrador con inicio de sesión seguro.
- Backend, API y base de datos para pedidos e inventario.
- Pagos reales con pasarela adecuada y gestión segura (sin guardar datos de tarjeta en el código).
- Configuración personalizada del dominio y del envío.

---

Proyecto de ejemplo para aprender desarrollo web y construir un portafolio. Los nombres y precios de los productos son ilustrativos.
