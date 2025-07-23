# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Desarrollo Local y Despliegue

Aquí encontrarás las instrucciones para descargar, configurar y ejecutar este proyecto en tu computadora local, así como para subirlo a un repositorio de GitHub.

### Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu sistema:
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [npm](https://www.npmjs.com/) (generalmente se instala con Node.js) o cualquier otro gestor de paquetes como `yarn` o `pnpm`.

### Instalación y Ejecución Local

1.  **Descarga los archivos del proyecto**: Primero, necesitas tener todos los archivos del proyecto en tu computadora.

2.  **Navega a la carpeta del proyecto**: Abre una terminal o línea de comandos y muévete a la carpeta donde descargaste el proyecto.
    ```bash
    cd ruta/a/tu-proyecto
    ```

3.  **Instala las dependencias**: Ejecuta el siguiente comando para instalar todos los paquetes y librerías que el proyecto necesita. Esto leerá el archivo `package.json` y creará la carpeta `node_modules`.
    ```bash
    npm install
    ```

4.  **Ejecuta el servidor de desarrollo**: Una vez que la instalación haya finalizado, puedes iniciar la aplicación con este comando:
    ```bash
    npm run dev
    ```
    Esto iniciará el servidor de desarrollo de Next.js, generalmente en `http://localhost:9002`.

### ¿Habrá problemas con los paquetes?

No deberías tener problemas significativos. El archivo `package.json` define las versiones exactas de las dependencias que se han utilizado. Al ejecutar `npm install`, se instalarán estas mismas versiones, lo que garantiza la compatibilidad. Si encuentras algún problema, a menudo se soluciona eliminando la carpeta `node_modules` y el archivo `package-lock.json` y volviendo a ejecutar `npm install`.

### Cómo subir tu proyecto a GitHub

1.  **Inicializa un repositorio de Git**: Si aún no lo has hecho, inicializa un repositorio en la carpeta de tu proyecto.
    ```bash
    git init
    ```

2.  **Crea un nuevo repositorio en GitHub**: Ve a [GitHub.com](https://github.com/new) y crea un nuevo repositorio (no lo inicialices con un `README` o `.gitignore` desde la web).

3.  **Enlaza tu repositorio local con el de GitHub**: Copia la URL de tu repositorio de GitHub y ejecútala en tu terminal.
    ```bash
    git remote add origin https://github.com/tu-usuario/nombre-del-repositorio.git
    ```

#### Trabajando con la rama principal (`main`)

Si quieres subir tus cambios directamente a la rama principal:

1.  **Asegúrate de que tu rama principal se llame `main`**:
    ```bash
    git branch -M main
    ```

2.  **Agrega y confirma tus cambios**:
    ```bash
    git add .
    git commit -m "Commit inicial del proyecto APDIS Manager"
    ```

3.  **Sube tus archivos a GitHub**:
    ```bash
    git push -u origin main
    ```

#### Trabajando con una nueva rama

Es una buena práctica trabajar en ramas separadas para nuevas funcionalidades o cambios importantes.

1.  **Crea y cámbiate a una nueva rama**: Elige un nombre descriptivo para tu rama (ej: `desarrollo`, `feature/nueva-auditoria`).
    ```bash
    git checkout -b nombre-de-la-nueva-rama
    ```

2.  **Agrega y confirma tus cambios en la nueva rama**:
    ```bash
    git add .
    git commit -m "Descripción de los cambios en esta rama"
    ```

3.  **Sube la nueva rama a GitHub**: La primera vez que subas la rama, necesitas usar el siguiente comando.
    ```bash
    git push -u origin nombre-de-la-nueva-rama
    ```
    Después del primer `push`, puedes simplemente usar `git push` para subir futuros cambios desde la misma rama.

¡Y listo! Tu proyecto estará disponible en GitHub en la rama que has creado.

---

## Despliegue en Vercel (Gratis)

Vercel es la plataforma creada por los desarrolladores de Next.js, por lo que la integración es perfecta. Ofrecen un plan "Hobby" gratuito ideal para desplegar este tipo de proyectos.

### Paso 1: Sube tu proyecto a GitHub

Si aún no lo has hecho, sigue los pasos de la sección anterior para subir tu código a un repositorio de GitHub. Este es un requisito indispensable para que Vercel pueda acceder a tu código.

### Paso 2: Crea una cuenta en Vercel

1.  Ve a [vercel.com](https://vercel.com/signup).
2.  La forma más sencilla es registrarte usando tu cuenta de GitHub. Haz clic en **"Continue with GitHub"** y autoriza la conexión.

### Paso 3: Importa tu proyecto desde Vercel

1.  Una vez dentro de tu dashboard de Vercel, haz clic en **"Add New..."** y selecciona **"Project"**.
2.  Vercel buscará tus repositorios de GitHub. Encuentra el repositorio de este proyecto en la lista y haz clic en el botón **"Import"** que está a su lado.

### Paso 4: Configura y Despliega

1.  **Configuración del Proyecto:** ¡Aquí viene la magia! Vercel detectará automáticamente que es un proyecto Next.js y pre-configurará todo por ti. No necesitas cambiar ninguna de las opciones de "Build & Development Settings".
2.  **Variables de Entorno:** Para este proyecto en particular, no necesitas configurar ninguna variable de entorno, ya que todas las URLs de las APIs son públicas.
3.  **Despliegue:** Simplemente haz clic en el botón **"Deploy"**.

Vercel comenzará el proceso de compilación y despliegue. Tomará unos minutos. Una vez finalizado, te mostrará una pantalla de felicitaciones con la URL pública de tu proyecto.

¡Y eso es todo! Tu aplicación estará en línea y accesible para todo el mundo. Cada vez que hagas un `git push` a la rama `main` de tu repositorio, Vercel automáticamente desplegará los nuevos cambios. Si quieres desplegar otras ramas, también puedes configurarlo fácilmente en los ajustes de tu proyecto en Vercel.
