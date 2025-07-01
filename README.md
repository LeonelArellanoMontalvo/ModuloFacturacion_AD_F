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

2.  **Agrega todos los archivos al repositorio**:
    ```bash
    git add .
    ```

3.  **Realiza tu primer commit**:
    ```bash
    git commit -m "Commit inicial del proyecto APDIS Manager"
    ```

4.  **Crea un nuevo repositorio en GitHub**: Ve a [GitHub.com](https://github.com/new) y crea un nuevo repositorio (no lo inicialices con un `README` o `.gitignore` desde la web).

5.  **Enlaza tu repositorio local con el de GitHub**: Copia la URL de tu repositorio de GitHub y ejecútala en tu terminal.
    ```bash
    git remote add origin https://github.com/tu-usuario/nombre-del-repositorio.git
    ```

6.  **Asegúrate de que tu rama principal se llame `main`**:
    ```bash
    git branch -M main
    ```

7.  **Sube tus archivos a GitHub**:
    ```bash
    git push -u origin main
    ```

¡Y listo! Tu proyecto estará disponible en GitHub.
