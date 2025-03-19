# Sheets RailCar 🛤️

Web app construida en Google Apps Script para transferir datos entre hojas de cálculo de Google Sheets de manera rápida y sencilla.

## Por qué?
Al intentar seleccionar grandes volúmenes de datos en Google Sheets, el navegador puede trabarse y suele ser inestable.
Sheets RailCar te permite delegar esta función en el entorno de Apps Script que se ejecuta y transfiere los datos por tí.

## Características 🚀

- **UI**: Diseño responsive con Tailwind CSS incorporado por CDN. 
- **Personalización de transferencia**:
    - Hojas completas
    - Rangos específicos
    - Columnas seleccionadas
    - Filas seleccionadas
- **Control sobre del destino**: Especifica la celda exacta donde insertar los datos.
- **Validación en tiempo real**: Feedback inmediato sobre errores de formato para mantener al usuario al tanto.
- **Manejo de errores**: Identificación de problemas y sugerencia de soluciones.
- **Compatible Mobile**: Funciona perfectamente en dispositivos de cualquier tamaño, para ello puedes obtener los enlaces en tu app de Google Sheets.

## 📷 Vista general

![Web App View](https://res.cloudinary.com/dsbjzd18p/image/upload/v1742353068/o9vtboo3vp0yogklctj1.png)


## 🔧 Instalación

### Opción 1: Despliegue con Google Clasp

1. Clonar este repositorio:
     ```bash
     git clone https://github.com/username/sheets-railcar.git
     cd sheets-railcar
     ```

2. Asegurarse de tener Clasp instalado:
     ```bash
     npm install -g @google/clasp
     ```

3. Iniciar sesión en Google:
     ```bash
     clasp login
     ```

4. Crear un nuevo proyecto de Apps Script:
     ```bash
     clasp create --title "Sheets RailCar" --type webapp
     ```

[clasp.template.json tiene un modelo de cómo debe quedar el file]

5. Desplegar el código:
     ```bash
     clasp push
     ```

6. Abrir el script desde consola:
     ```bash
     clasp open
     ```


7. Publica la aplicación web desde el editor de Apps Script.

-- Si tenés dudas sobre Google Clasp, este es el material de referencia [Google Clasp 🔗](https://developers.google.com/apps-script/guides/clasp)


### Opción 2: Despliegue manual

1. Crear un nuevo proyecto en Google Apps Script.
2. Copiar y pegar los archivos de este repositorio en el proyecto.
3. Guardar y desplegar la aplicación como una Web app.

## 🔍 Uso

1. Abrir la aplicación web desplegada.
2. Ingresar las URLs de las hojas de cálculo de origen y destino.
3. Seleccionar las hojas específicas en ambas.
4. Elegir el tipo de transferencia (hoja, rango, columnas o filas).
5. Especificar la celda de destino donde insertar los datos.
6. Hacer click en el botón "Transferir Datos".

-- Material de refencia para despliegue de [Web Apps en Google 🔗](https://developers.google.com/apps-script/guides/web?hl=es-419)


## ⚙️ Configuración avanzada

Se puede personalizar el comportamiento de la aplicación modificando el archivo `appsscript.json` en cuanto a configuraciones de Apps Script:

```json
{
    "timeZone": "America/Argentina/Buenos_Aires",
    "dependencies": {},
    "exceptionLogging": "STACKDRIVER",
    "runtimeVersion": "V8",
    "webapp": {
        "executeAs": "USER_ACCESSING",
        "access": "DOMAIN"
    }
}
```

- `access`: Cambiar a `"ANYONE"` para permitir el acceso público, o matener `"DOMAIN"` para limitarlo a usuarios de tu organización en caso de que sea cuenta con dominio propio de organización.
- `executeAs`: Define si la aplicación se ejecuta como el usuario que accede (`"USER_ACCESSING"`) o como el propietario (`"OWNER"`).

!!! **Si vas a compartir tu Web App asegúrate de no ejecutar como OWNER ya que con esto, los usuarios pueden tener acceso a documentos a los que tienes permiso**. 


## 📝 Notas importantes

- La aplicación requiere permisos para acceder a las hojas de cálculo.
- Ambas hojas (origen y destino) deben ser accesibles por el usuario que ejecuta la aplicación.
- Para mejores resultados, evitar hojas con validaciones de datos complejas en el destino.
- El tiempo máximo de ejecución es de 18000 segundos, por lo que si tu transferencia es muy grande, te recomiendo hacerla en 2 ejecuciones. 

## 🔒 Privacidad y seguridad

Esta aplicación no almacena ni comparte datos. Todos los datos se procesan localmente en el navegador y del lado del servidor mediante Google Apps Script.

## ⚠️ Solución de problemas comunes

- **Error "Haz clic e introduce un valor del intervalo"**: Este error suele ocurrir cuando la hoja de destino tiene validaciones de datos. 
- **Error de permisos**: Asegurate de tener acceso de edición a ambas hojas de cálculo.

## 🏗️ Tecnologías utilizadas
- HTML
- CSS
- Tailwind CSS
- JavaScript
- Google Apps Script
## Funcionamiento y edición

1. El punto de entrada es la función `doGet()` que devuelve un `HtmlService.createTemplateFromFile('index')` como punto de inicio.

2. Los elementos del formulario, las instrucciones (tipo modal) y el script con la lógica de las funciones de JS están separados del `index.html` para mantener todo más prolijo (dentro de las limitaciones de Apps Script, por supuesto). Se anexan al `index.html` usando 'Scriptlets'.

3. Cuando se ejecutan las funciones del formulario, este llama a las funciones del servidor definidas en `validate.js` mediante `google.script.run` => API de comunicación cliente-servidor de Apps Script:
     - Se obtienen las hojas disponibles para rellenar los selectores.
     - Se validan URLs, rangos y accesos antes de seguir.
     - Finalmente, se ejecuta la transferencia cuando todo está en orden.

4. La función principal `transferirDatos()` procesa las solicitudes con estas características:
     - Manejo detallado de errores en cada paso.
     - Adaptabilidad a diferentes tipos de transferencia (hojas, rangos, columnas, filas).
     - Logging extensivo, este se puede quitar para acelerar un poco el rendimiento, pero no tendrás control sobre lo que ejecuta el Script.

5. La organización de archivos es:
     - `index.html`: Estructura principal.
     - `form.html`: Formulario de transferencia.
     - `instructions.html`: Modal con las instrucciones.
     - `formHandler.html`: JavaScript del lado cliente.
     - `main.ks`: Punto de entrada.
     - `railCar.js`: Lógica principal del servidor.
     - `appsscript.json`: Configuración de la aplicación en el entorno.



### Datos de color: 
- El número máximo de celdas de un file de Google Sheets es 10.000.000, tenerlo en cuenta al transferir datos ⛓️‍💥.
- Una transferencia de 91359 filas x 70 columnas tarda aproximadamente 1500 segundos (cercano al límite), podés prepararte un cafecito mientras se ejecuta ☕. 

<div align="center">
    <br>
    <p>Comparto esto para que lo puedas aplicar en tus tareas diarias</p>
    <p>Si te sirvió, por favor dale a la estrellita 💛</p>
</div>
