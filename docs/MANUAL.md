# 📘 Manual de usuario · ColombiaTech2

Guía para usar la plataforma paso a paso: qué significa cada campo, qué datos se ingresan y qué
protege la plataforma. Para la parte técnica vuelve al [README](../README.md).

**Demo:** [colombia-tech2.vercel.app](https://colombia-tech2.vercel.app)

## Contenido

1. [En pocas palabras](#1-en-pocas-palabras)
2. [Antes de empezar](#2-antes-de-empezar)
3. [Paso a paso](#3-paso-a-paso)
4. [Qué información ingresas y dónde queda](#4-qué-información-ingresas-y-dónde-queda)
5. [Seguridad: qué se garantiza](#5-seguridad-qué-se-garantiza)
6. [Límites y recomendaciones](#6-límites-y-recomendaciones)
7. [Preguntas frecuentes](#7-preguntas-frecuentes)

---

## 1. En pocas palabras

Plataforma de alquiler de vivienda: los arrendadores publican inmuebles con foto y quienes buscan
vivienda los consultan y conversan en un chat en tiempo real.

## 2. Antes de empezar

- Solo necesitas un navegador.
- El servidor se duerme sin uso: la primera acción del día puede tardar **entre 30 y 50 segundos**.
- Los textos de la interfaz están en inglés (Name, Address, Save…); este manual los traduce.

## 3. Paso a paso

### 3.1 Portada

![Portada de ColombiaTech2](img/manual/01-portada.png)

Desde el menú superior eliges **Crear Usuario** o **Login**. El botón 🌙 / ☀️ cambia el tema.

### 3.2 Crear una cuenta

![Formulario de registro con sus campos numerados](img/manual/02-registro.png)

| # | Campo | Qué escribir | Reglas |
|:-:|---|---|---|
| 1 | Name | Tu nombre | Obligatorio, mínimo 3 letras |
| 2 | Lastname | Tu apellido | Obligatorio en el formulario |
| 3 | Email | Correo con el que vas a entrar | Formato válido y único: no puede existir otra cuenta con él |
| 4 | Password | Tu contraseña | Mínimo **8 caracteres** con mayúscula, minúscula, número y un carácter especial |
| 5 | Avatar | Foto de perfil (opcional) | PNG o JPG, máximo **5 MB** |
| 6 | Save | Botón | Crea la cuenta |

### 3.3 Iniciar sesión

![Formulario de inicio de sesión](img/manual/03-login.png)

| # | Campo | Qué escribir |
|:-:|---|---|
| 1 | Email | El correo de tu cuenta |
| 2 | Password | Tu contraseña |
| 3 | Iniciar Sesion | Entra y muestra los menús **🏠 Casas** y **💬 Chat** |

Si el correo o la contraseña no coinciden, el mensaje es el mismo («Credenciales inválidas»), para
no revelar qué correos están registrados. La sesión se cierra sola tras **4 horas** sin actividad.

### 3.4 Ver casas

![Listado de inmuebles publicados](img/manual/04-casas.png)

**🏠 Casas → Ver casas** muestra todos los inmuebles publicados con su dirección, departamento,
ciudad, área, tipo, precio, código y foto. En **Actions**:

- **Edit** abre el formulario con los datos cargados.
- **Delete** pide confirmación antes de eliminar.

Solo el dueño del inmueble (o un administrador) puede editarlo o eliminarlo; si lo intenta otra
persona, el servidor lo rechaza.

### 3.5 Publicar un inmueble

![Formulario para crear un inmueble con sus campos numerados](img/manual/05-crear-casa.png)

| # | Campo | Qué escribir |
|:-:|---|---|
| 1 | Address | Dirección del inmueble |
| 2 | Department | Departamento, desde la lista oficial de Colombia |
| 3 | City | Ciudad del departamento elegido (la lista cambia según el campo 2) |
| 4 | Zip code | Código postal |
| 5 | Size (m2) | Área en metros cuadrados |
| 6 | Type | Tipo: casa, apartamento, apartaestudio… |
| 7 | Rooms | Número de habitaciones |
| 8 | Bathrooms | Número de baños |
| 9 | Parking | Sí o No |
| 10 | Price | Precio en pesos, sin puntos |
| 11 | Code | Código que identifica el inmueble (lo usas para buscarlo y editarlo) |
| 12 | Imagen | Foto del inmueble: PNG o JPG, máximo 5 MB |

Pulsa **Save** para publicarlo. Todos los campos de texto y número son obligatorios.

### 3.6 Chat

![Chat en tiempo real](img/manual/06-chat.png)

| # | Campo | Qué escribir |
|:-:|---|---|
| 1 | Escribir mensaje... | Tu mensaje; pulsa **Send** para enviarlo |

Es una **sala general**: el mensaje llega al instante a todas las personas que tengan el chat
abierto y queda guardado con su fecha y hora.

### 3.7 Cambiar la contraseña

![Formulario de cambio de contraseña](img/manual/07-cambiar-clave.png)

Desde tu avatar (arriba a la derecha) → **Change Password**:

| # | Campo | Qué escribir |
|:-:|---|---|
| 1 | Password | Tu contraseña actual |
| 2 | New Password | La nueva contraseña |
| 3 | Repeat New Password | La nueva contraseña otra vez |
| 4 | Botón | Guarda el cambio |

En el mismo menú, **Profile** edita nombre, apellido, correo y avatar, y **Logout** cierra la
sesión.

## 4. Qué información ingresas y dónde queda

| Dato | Para qué se usa | Dónde se guarda | Quién lo ve |
|---|---|---|---|
| Nombre, apellido y correo | Identificar tu cuenta | MongoDB Atlas | Tú y el administrador |
| Contraseña | Iniciar sesión | MongoDB Atlas, **solo su huella bcrypt** | Nadie: no se puede leer ni recuperar |
| Avatar | Foto de perfil | Cloudinary | Quien vea tu perfil |
| Datos del inmueble y su foto | Publicar el aviso | MongoDB Atlas y Cloudinary | Todas las personas con sesión |
| Mensajes del chat | Conversar | MongoDB Atlas | Todas las personas en el chat |
| Sesión (token) | Mantenerte conectado | `localStorage` de tu navegador | Solo tu navegador; vence a las 4 horas |

## 5. Seguridad: qué se garantiza

Comprobado en el código del proyecto (`backend/src/auth`, `users`, `houses`, `upload`):

- **Contraseñas con bcrypt** (factor 10). Las respuestas de la API nunca incluyen la contraseña ni su
  huella.
- **Política de contraseña robusta** en el registro: 8 caracteres o más, con mayúscula, minúscula,
  número y carácter especial.
- **Sesión con JWT que vence a las 4 horas**, más cierre automático por 4 horas de inactividad.
- **Cada quien solo alcanza lo suyo:** solo el dueño (o un administrador) puede editar o borrar un
  inmueble, ver o modificar una cuenta o cambiar un avatar; el resto recibe un error 403. Esto se
  aplica igual por REST y por GraphQL.
- **Cuentas suspendidas** no pueden iniciar sesión, y si ya tenían un token, deja de servir.
- **Validación en el servidor** de todos los datos de entrada (la API descarta los campos que no
  esperaba).
- **Imágenes controladas:** solo JPG, PNG, GIF o WEBP, con un máximo de 5 MB.
- **CORS restringido:** la API solo acepta llamadas desde la web oficial.
- **Secretos fuera del repositorio:** la conexión a MongoDB, la clave JWT y las credenciales de
  Cloudinary viven en variables de entorno de Render.

## 6. Límites y recomendaciones

Es una demo de portafolio:

- **El chat es una sala general** y su conexión en tiempo real no exige sesión: no compartas
  teléfonos, documentos ni datos personales por ese medio.
- Los inmuebles publicados son visibles para todas las personas con cuenta: publica datos de
  ejemplo, no tu dirección real.
- El token se guarda en `localStorage`; cierra sesión con **Logout** en equipos compartidos.
- No hay verificación de correo ni recuperación de contraseña por correo.

## 7. Preguntas frecuentes

**¿Por qué la primera carga tarda?** El servidor gratuito de Render se suspende sin uso y tarda
hasta 50 segundos en despertar.

**¿Puedo editar la casa de otra persona?** No. El botón aparece, pero el servidor responde que
solo el dueño o un administrador puede modificarla.

**¿Por qué la contraseña no me deja registrarme?** Revisa que tenga 8 caracteres o más, con
mayúscula, minúscula, número y un carácter especial (por ejemplo `#` o `!`).

**¿Qué significa la pantalla "Estamos en mantenimiento"?** El servicio o su base de datos no están respondiendo en ese momento. No se perdió nada: tus casas, mensajes y tu cuenta siguen guardados, y ninguna acción quedó a medias (si no viste la confirmación, no se guardó). La pantalla se actualiza sola y vuelve a la normalidad apenas el servicio responda; también puedes reintentar más tarde.
