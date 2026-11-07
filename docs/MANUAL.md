# 📘 Manual de usuario · ColombiaTech2

Guía para usar la plataforma paso a paso: qué significa cada campo, qué datos se ingresan y qué
protege la plataforma. Para la parte técnica vuelve al [README](../README.md).

**Demo:** [colombia-tech2.vercel.app](https://colombia-tech2.vercel.app)

## Contenido

1. [Proyecto: objetivos y alcances](#1-proyecto-objetivos-y-alcances)
2. [Glosario](#2-glosario)
3. [Plataformas, base de datos y servicios](#3-plataformas-base-de-datos-y-servicios)
4. [Paso a paso](#4-paso-a-paso)
5. [Seguridad: tu información protegida](#5-seguridad-tu-información-protegida)
6. [Agradecimientos](#6-agradecimientos)

---

## 1. Proyecto: objetivos y alcances

### Objetivo

Plataforma de alquiler de vivienda: los arrendadores publican inmuebles con foto y quienes buscan
vivienda los consultan y conversan en un chat en tiempo real.

### Alcance: qué necesitas y qué esperar

- Solo necesitas un navegador.
- El servidor se duerme sin uso: la primera acción del día puede tardar **entre 30 y 50 segundos**.
- Los textos de la interfaz están en inglés (Name, Address, Save…); este manual los traduce.

### Límites

Es una demo de portafolio:

- **El chat es una sala general** y su conexión en tiempo real no exige sesión: no compartas
  teléfonos, documentos ni datos personales por ese medio.
- Los inmuebles publicados son visibles para todas las personas con cuenta: publica datos de
  ejemplo, no tu dirección real.
- El token se guarda en `localStorage`; cierra sesión con **Logout** en equipos compartidos.
- El registro no verifica el correo: para recuperar la cuenta con **¿Olvidaste tu contraseña?**,
  regístrate con un correo al que tengas acceso.

## 2. Glosario

Palabras técnicas que aparecen en este manual, explicadas en lenguaje simple.

| Término | Qué significa |
|---|---|
| **Administrador** | Cuenta con permisos para gestionar usuarios y configuraciones de la aplicación. |
| **API** | Puerta de entrada de un programa para que otros programas le pidan o le envíen datos. |
| **Arranque en frío** | Los servidores gratuitos se apagan sin uso; la primera visita tarda unos segundos mientras vuelven a encenderse. |
| **Backend** | La parte de la aplicación que trabaja "detrás": procesa lo que envías y habla con la base de datos. |
| **Base de datos** | Lugar donde la aplicación guarda la información de forma ordenada y permanente. |
| **Contraseña cifrada (hash)** | La contraseña no se guarda tal cual, sino como una "huella" de la que no se puede recuperar el texto original. |
| **CORS** | Regla que impide que páginas ajenas usen la API de la aplicación desde el navegador. |
| **GraphQL** | Forma de consultar una API pidiendo exactamente los datos que se necesitan. |
| **JWT** | Tipo de token firmado digitalmente: si alguien lo altera, el servidor lo rechaza. |
| **localStorage** | Espacio del navegador donde la aplicación guarda datos pequeños en tu equipo (por ejemplo, el tema o la sesión). |
| **Modo mantenimiento** | Pantalla que aparece cuando el servicio o su base de datos no responden; se recupera sola cuando vuelven. |
| **Navegador** | Programa con el que abres páginas web: Chrome, Edge, Firefox, Safari. |
| **Nube** | Servidores de una empresa (Amazon, Microsoft, Google, Oracle…) donde la aplicación funciona sin depender de un computador propio. |
| **REST** | Forma estándar de organizar una API usando direcciones web y métodos como GET o POST. |
| **Servidor** | Computador en la nube que atiende las peticiones de la aplicación. |
| **Sesión** | El tiempo en que la aplicación te reconoce después de iniciar sesión, sin pedirte la contraseña de nuevo. |
| **Tema claro / oscuro** | Combinación de colores de la interfaz; puedes elegir la clara o la oscura. |
| **Tiempo real (WebSockets / SignalR)** | Conexión abierta que muestra mensajes o cambios al instante, sin recargar la página. |
| **Token** | Credencial temporal que la aplicación te entrega al iniciar sesión, en lugar de enviar tu contraseña en cada paso. |
| **Variables de entorno / secretos** | Claves y contraseñas internas de la aplicación, guardadas fuera del código para que no queden expuestas. |

## 3. Plataformas, base de datos y servicios

Qué servicio de nube, base de datos o API usa el proyecto y para qué sirve cada uno.

| Plataforma | Tipo | Qué hace en el proyecto |
|---|---|---|
| ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) | Nube | Sirve la aplicación React (Vite + Redux Toolkit + Tailwind) y el cliente de chat. |
| ![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black) | Nube | Corre el backend NestJS: las rutas REST (`/api`), GraphQL (`/graphql`) y el gateway de chat (Socket.IO) llegan a los mismos módulos de dominio, protegidos con JWT. Admite conexiones WebSocket persistentes. |
| ![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white) | Base de datos | Guarda usuarios, inmuebles y mensajes. |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white) | API / servicio externo | Almacena las imágenes: avatares de usuario y fotos de inmuebles. |
| ![API Colombia](https://img.shields.io/badge/API_Colombia-FCD116?style=for-the-badge&logoColor=black) | API / servicio externo | Catálogo público de departamentos y ciudades para los selectores del formulario de inmuebles (sin registro ni clave). |

## 4. Paso a paso

### 4.1 Portada

![Portada de Alquiler de vivienda](img/manual/01-portada.png)

La portada de **Alquiler de vivienda** muestra el inicio de sesión. Si aún no tienes cuenta,
pulsa **Crea una**; si olvidaste la contraseña, **¿Olvidaste tu contraseña?**. El botón 🌙 / ☀️
cambia el tema.

### 4.2 Crear una cuenta

![Formulario de registro con sus campos numerados](img/manual/02-registro.png)

| # | Campo | Qué escribir | Reglas |
|:-:|---|---|---|
| 1 | Name | Tu nombre | Obligatorio, mínimo 3 letras |
| 2 | Lastname | Tu apellido | Obligatorio en el formulario |
| 3 | Email | Correo con el que vas a entrar | Formato válido y único: no puede existir otra cuenta con él |
| 4 | Password | Tu contraseña | Mínimo **8 caracteres** con mayúscula, minúscula, número y un carácter especial |
| 5 | Avatar | Foto de perfil (opcional) | PNG o JPG, máximo **5 MB** |
| 6 | Save | Botón | Crea la cuenta |

### 4.3 Iniciar sesión

![Formulario de inicio de sesión](img/manual/03-login.png)

| # | Campo | Qué escribir |
|:-:|---|---|
| 1 | Email | El correo de tu cuenta |
| 2 | Password | Tu contraseña |
| 3 | Iniciar Sesion | Pide el código de tu verificación en dos pasos; al escribirlo y pulsar **Verificar** entras y ves los menús **🏠 Casas** y **💬 Chat** |
| 4 | ¿Olvidaste tu contraseña? | Abre la recuperación por correo (ver más abajo) |

Si el correo o la contraseña no coinciden, el mensaje es el mismo («Credenciales inválidas»), para
no revelar qué correos están registrados. La sesión se cierra sola tras **4 horas** sin actividad.

#### Verificación en dos pasos (obligatoria)

Cada ingreso pide, además de la contraseña, un código. La primera vez que ingresas eliges cómo
recibirlo:

| Método | Cómo funciona |
|---|---|
| **App autenticadora** (recomendado) | Escaneas un código QR con Google Authenticator, Microsoft Authenticator u otra app; desde ese momento la app muestra un código nuevo cada 30 segundos, incluso sin internet. Si no puedes escanear, escribe la clave que aparece bajo el QR. En la app la cuenta aparece como **Alquiler de vivienda** (si la configuraste antes con otro nombre, sigue funcionando igual). |
| **Código por correo** | Cada vez que ingresas te llega un código de 6 dígitos que vence en 10 minutos y sirve una sola vez. |

Confirma el método escribiendo el primer código. Desde tu avatar → **Seguridad** puedes **agregar el
método que no elegiste** y escoger cuál se pide **por defecto**; tener los dos te permite entrar
aunque no tengas el teléfono a mano.

#### Perdí mi autenticador

![Pantalla del código con el enlace Perdí mi autenticador](img/manual/08-perdi-autenticador.png)

| # | Elemento | Qué hace |
|:-:|---|---|
| 1 | Código de 6 dígitos | El código de tu app autenticadora (o del correo, si ese es tu método) |
| 2 | Perdí mi autenticador | Siempre visible: envía un código de 6 dígitos al correo de tu cuenta, **aunque no hayas activado el código por correo** |

1. Pulsa **Perdí mi autenticador**: llega un código al correo de tu cuenta. Vence en **15 minutos**
   y sirve una sola vez; si no llega, usa **Enviar otro código** (hay un límite de envíos).
2. Escríbelo y pulsa **Verificar**. Con **5 códigos errados** la recuperación queda bloqueada
   **15 minutos**.
3. Aparece un código QR nuevo: escanéalo con tu app autenticadora y escribe el código que muestra.
   Al pulsar **Activar** entras, y la app anterior deja de servir.

#### ¿Olvidaste tu contraseña?

1. En el inicio de sesión pulsa **¿Olvidaste tu contraseña?** y escribe el correo de tu cuenta.
2. La respuesta es la misma exista o no la cuenta. Si existe, llega un correo con el enlace
   **Crear contraseña nueva**: vence en 30 minutos y sirve una sola vez.
3. Escribe la nueva contraseña (misma regla del registro) y su confirmación, y vuelve a ingresar.
   Al guardarla **se cierran todas las sesiones abiertas** (en cualquier equipo) y tu verificación
   en dos pasos **sigue activa**: al ingresar se te pedirá el código como siempre.

Se pueden pedir como máximo 3 enlaces cada 15 minutos por correo; pedirlos no bloquea el ingreso.

Todos los correos de la plataforma (enlaces y códigos) llegan con el remitente **Alquiler de
vivienda** y ese nombre en el asunto, el encabezado y el pie.

### 4.4 Ver casas

![Listado de inmuebles publicados](img/manual/04-casas.png)

**🏠 Casas → Ver casas** muestra todos los inmuebles publicados con su dirección, departamento,
ciudad, área, tipo, precio, código y foto. En **Actions**:

- **Edit** abre el formulario con los datos cargados.
- **Delete** pide confirmación antes de eliminar.

Solo el dueño del inmueble (o un administrador) puede editarlo o eliminarlo; si lo intenta otra
persona, el servidor lo rechaza.

### 4.5 Publicar un inmueble

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
| 12 | Imagen | Foto del inmueble: PNG o JPG, máximo 5 MB (opcional) |

Pulsa **Save** para publicarlo. Todos los campos de texto y número son obligatorios.

**Imagen automática:** si no subes una foto, la plataforma crea una ilustración del inmueble con
su tipo (casa, apartamento, finca o local), ciudad, habitaciones, baños, área, parqueadero, precio
y código. Si luego editas los datos, la ilustración se actualiza; si subes una foto, la reemplaza.
Al eliminar el inmueble, su imagen se borra también.

### 4.6 Chat

![Chat en tiempo real](img/manual/06-chat.png)

| # | Campo | Qué escribir |
|:-:|---|---|
| 1 | Escribir mensaje... | Tu mensaje; pulsa **Send** para enviarlo |

Es una **sala general**: el mensaje llega al instante a todas las personas que tengan el chat
abierto y queda guardado con su fecha y hora.

### 4.7 Cambiar la contraseña

![Formulario de cambio de contraseña](img/manual/07-cambiar-clave.png)

Desde tu avatar (arriba a la derecha) → **Change Password**:

| # | Campo | Qué escribir |
|:-:|---|---|
| 1 | Contraseña actual | Tu contraseña actual |
| 2 | Nueva contraseña | Mínimo 8 caracteres con mayúscula, minúscula, número y carácter especial; distinta de la actual |
| 3 | Repite la nueva contraseña | La nueva contraseña otra vez |
| 4 | Cambiar contraseña | Guarda el cambio |

El servidor comprueba la contraseña actual y guarda solo la huella de la nueva.

En el mismo menú, **Profile** edita nombre, apellido, correo y avatar, y **Logout** cierra la
sesión.

### 4.8 Preguntas frecuentes

**¿Por qué la primera carga tarda?** El servidor gratuito de Render se suspende sin uso y tarda
hasta 50 segundos en despertar.

**¿Puedo editar la casa de otra persona?** No. El botón aparece, pero el servidor responde que
solo el dueño o un administrador puede modificarla.

**¿Por qué la contraseña no me deja registrarme?** Revisa que tenga 8 caracteres o más, con
mayúscula, minúscula, número y un carácter especial (por ejemplo `#` o `!`).

**¿Qué significa la pantalla "Estamos en mantenimiento"?** El servicio o su base de datos no están respondiendo en ese momento. No se perdió nada: tus casas, mensajes y tu cuenta siguen guardados, y ninguna acción quedó a medias (si no viste la confirmación, no se guardó). La pantalla se actualiza sola y vuelve a la normalidad apenas el servicio responda; también puedes reintentar más tarde.

## 5. Seguridad: tu información protegida

Tu confianza es lo primero: la plataforma solo pide los datos necesarios para funcionar, los protege y no los comparte con terceros. Esto es lo que se guarda y cómo se protege.

### Qué datos se guardan y dónde

| Dato | Para qué se usa | Dónde se guarda | Quién lo ve |
|---|---|---|---|
| Nombre, apellido y correo | Identificar tu cuenta | MongoDB Atlas | Tú y el administrador |
| Contraseña | Iniciar sesión | MongoDB Atlas, **solo su huella** | Nadie: no se puede leer ni recuperar |
| Avatar | Foto de perfil | Cloudinary | Quien vea tu perfil |
| Datos del inmueble y su foto (o la ilustración generada) | Publicar el aviso | MongoDB Atlas y Cloudinary | Todas las personas con sesión |
| Mensajes del chat | Conversar | MongoDB Atlas | Todas las personas en el chat |
| Verificación en dos pasos | Confirmar que eres tú al ingresar | MongoDB Atlas: clave de la app **cifrada** y código del correo **solo como huella**; nunca sale en las respuestas de la API | Nadie: no se puede leer desde la base |
| Sesión (token) | Mantenerte conectado | `localStorage` de tu navegador | Solo tu navegador; vence sola |

### Cómo se protege tu información

Comprobado en el código del proyecto (`backend/src/auth`, `users`, `houses`, `upload`):

- **Contraseñas protegidas con hash.** Las respuestas de la API nunca incluyen la contraseña ni su
  huella.
- **Verificación en dos pasos obligatoria** con app autenticadora (TOTP) o código por correo:
  la clave de la app se guarda cifrada, un código no se acepta dos veces, los intentos errados
  bloquean temporalmente y el código del correo vence en pocos minutos.
- **Política de contraseña robusta** en el registro: 8 caracteres o más, con mayúscula, minúscula,
  número y carácter especial.
- **Sesión que vence sola**, con cierre automático por inactividad.
- **Cada quien solo alcanza lo suyo:** solo el dueño (o un administrador) puede editar o borrar un
  inmueble, ver o modificar una cuenta o cambiar un avatar; el resto recibe un error 403. Esto se
  aplica igual por REST y por GraphQL.
- **Cuentas suspendidas** no pueden iniciar sesión, y si ya tenían un token, deja de servir.
- **Restablecer la contraseña cierra todas las sesiones:** los tokens emitidos antes del cambio
  dejan de servir y el navegador vuelve al inicio de sesión.
- **Recuperación del autenticador por correo:** el código vence, tiene límite de envíos e intentos,
  y la app nueva reemplaza a la anterior solo cuando se activa.
- **Validación en el servidor** de todos los datos de entrada (la API descarta los campos que no
  esperaba).
- **Imágenes controladas:** solo JPG, PNG, GIF o WEBP, con un máximo de 5 MB.
- **CORS restringido:** la API solo acepta llamadas desde la web oficial.
- **Secretos fuera del repositorio:** la conexión a MongoDB, la clave JWT y las credenciales de
  Cloudinary viven en variables de entorno de Render.
- **Bloqueo temporal** ante intentos fallidos repetidos de contraseña o de código.
- **Registro de eventos de seguridad:** ingresos, intentos fallidos, bloqueos, cambios de
  contraseña y recuperaciones del autenticador quedan registrados (nunca contraseñas ni códigos) y se depuran solos.
- **Al día en seguridad:** el runtime, el sistema y las dependencias se mantienen con los últimos
  parches y se revisan periódicamente.

## 6. Agradecimientos

A mi familia, por su apoyo incondicional, su paciencia y por creer en cada proyecto incluso cuando apenas era una idea. Este trabajo también es de ustedes.

Y a ti, que usas esta plataforma: cada prueba, comentario y sugerencia ayuda a que siga mejorando.
