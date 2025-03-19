/*
* Debido a que Apps Script no soporta carpetas y todos se encuentran en la raíz del proyecto, 
* Si quisieras realizar una estructuración en carpetas, tendrías que utilizar una Extensión como Black Apps Script para visualizar las carpetas bien.
* De otra forma, simplemente verías el path como parte del nombre del archivo. (carpeta/archivo.gs)
* Por lo tanto, en este caso, se ha optado por dejar todo en la raíz del proyecto.
* No obstante, si optaras por organizarlo, puedes utilizar esta estructura
* 
- /railCar/
  - /main/
    - app.js       (doGet, include)
    - utils.js     (columnToIndex, columnNameToNumber)
  - /services/
    - getFiles.js    (extraerIdDesdeUrl, esUrlGoogleSheetsValida)
    - getSheets.js    (obtenerHojas, validarAccesoHoja)
  - /operations/
    - dataTransfer.js  (transferirDatos, validarRango)
  - /ui/
    - form.html    (formulario principal)
    - instructions.html (instrucciones)
    - formHandler.html (lógica cliente)
*
*/


/**
 * Extrae el ID de Google Sheets desde la URL proporcionada.
 * Ahora elimina también cualquier fragmento o parámetros de consulta.
 * @param {string} url - URL del archivo de Google Sheets.
 * @return {string} ID del archivo de Google Sheets.
 */
function extraerIdDesdeUrl(url) {
  try {
    // Primero, eliminar cualquier fragmento (#) en la URL
    url = url.split('#')[0];
    
    // También eliminar parámetros de consulta después del ID
    url = url.split('?')[0];
    
    // Ahora extraer el ID
    const match = url.match(/[-\w]{25,}/);
    return match ? match[0] : null;
  } catch (e) {
    console.error("Error al extraer ID desde URL:", e);
    return null;
  }
}

/**
 * Obtiene las hojas disponibles desde una URL de Google Sheets.
 * @param {string} url - URL del archivo de Google Sheets.
 * @return {Array} Lista de nombres de hojas disponibles.
 */
function obtenerHojas(url) {
  try {
    // Registrar para depuración
    console.log("Obteniendo hojas para URL:", url);
    
    const id = extraerIdDesdeUrl(url);
    if (!id) {
      console.error("ID no encontrado en URL:", url);
      return ["Error: URL inválida"];
    }
    
    console.log("ID extraído:", id);
    
    const ss = SpreadsheetApp.openById(id);
    if (!ss) {
      console.error("No se pudo abrir la hoja con ID:", id);
      return ["Error: No se puede abrir el archivo. Comprueba la URL y tus permisos."];
    }
    
    const hojas = ss.getSheets();
    const nombresHojas = hojas.map(hoja => hoja.getName());
    
    console.log("Hojas encontradas:", nombresHojas);
    return nombresHojas;
  } catch (e) {
    console.error("Error al obtener hojas:", e.toString());
    return ["Error: " + e.toString()];
  }
}

/**
 * Valida si una URL es una URL válida de Google Sheets
 * @param {string} url - URL a validar
 * @return {boolean} Verdadero si es una URL válida de Google Sheets
 */
function esUrlGoogleSheetsValida(url) {
  try {
    // Validar formato básico de URL
    if (!url || typeof url !== 'string') return false;
    
    // Verificar que sea una URL de Google Sheets
    const patronSheets = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/i;
    return patronSheets.test(url);
  } catch (e) {
    console.error('Error al validar URL:', e);
    return false;
  }
}

/**
 * Valida si un rango de celdas es válido para una hoja específica.
 * @param {string} url - URL del archivo de Google Sheets.
 * @param {string} hoja - Nombre de la hoja.
 * @param {string} rango - Rango a validar (ej. "A1:B10").
 * @return {Object} Resultado de la validación con éxito y mensaje.
 */
function validarRango(url, hoja, rango) {
  try {
    if (!esUrlGoogleSheetsValida(url)) {
      return { exito: false, mensaje: "URL de Google Sheets inválida" };
    }
    
    if (!rango || typeof rango !== 'string') {
      return { exito: false, mensaje: "Rango no especificado" };
    }
    
    // Verificar formato básico del rango (e.g. A1:B10)
    const formatoRango = /^[A-Za-z]+[0-9]+:[A-Za-z]+[0-9]+$/;
    if (!formatoRango.test(rango)) {
      return { exito: false, mensaje: `Formato de rango "${rango}" inválido. Use formato como A1:B10` };
    }
    
    // Verificar si podemos acceder a la hoja y al rango
    const id = extraerIdDesdeUrl(url);
    if (!id) {
      return { exito: false, mensaje: "No se pudo extraer el ID desde la URL" };
    }
    
    const archivo = SpreadsheetApp.openById(id);
    const sheet = archivo.getSheetByName(hoja);
    
    if (!sheet) {
      return { exito: false, mensaje: `Hoja "${hoja}" no encontrada` };
    }
    
    // Intentar acceder al rango para validar
    try {
      sheet.getRange(rango);
      return { exito: true, mensaje: "Rango válido" };
    } catch (e) {
      return { exito: false, mensaje: `Rango "${rango}" inválido: ${e.message}` };
    }
  } catch (e) {
    console.error('Error al validar rango:', e);
    return { exito: false, mensaje: `Error al validar rango: ${e.message}` };
  }
}

/**
 * Valida si un archivo de Google Sheets y una hoja específica existen y son accesibles
 * @param {string} url - URL del archivo de Google Sheets
 * @param {string} nombreHoja - Nombre de la hoja a verificar
 * @return {Object} - Objeto con estado de éxito y mensaje
 */
function validarAccesoHoja(url, nombreHoja) {
  try {
    const id = extraerIdDesdeUrl(url);
    if (!id) {
      return { exito: false, mensaje: "URL de hoja inválida." };
    }
    
    const archivo = SpreadsheetApp.openById(id);
    if (!archivo) {
      return { exito: false, mensaje: "No se pudo acceder al archivo. Verifica que la URL sea correcta y tengas permisos." };
    }
    
    const hoja = archivo.getSheetByName(nombreHoja);
    if (!hoja) {
      return { exito: false, mensaje: `La hoja "${nombreHoja}" no existe en el archivo.` };
    }
    
    return { exito: true, mensaje: "Acceso verificado correctamente." };
  } catch (e) {
    return { 
      exito: false, 
      mensaje: "Error al verificar acceso: " + e.toString() 
    };
  }
}

/**
 * Transfiere datos entre hojas de Google Sheets según las especificaciones
 * @param {Object} datosOrigen - Datos de origen para la transferencia
 * @param {Object} datosDestino - Datos de destino para la transferencia
 * @return {Object} Resultado de la operación
 */
function transferirDatos(datosOrigen, datosDestino) {
  try {
    // Registrar para depuración
    console.log("Iniciando transferencia de datos");
    console.log("Datos de origen:", JSON.stringify(datosOrigen));
    console.log("Datos de destino:", JSON.stringify(datosDestino));
    
    // Obtener IDs de los archivos (limpiando URLs)
    const idOrigen = extraerIdDesdeUrl(datosOrigen.url);
    const idDestino = extraerIdDesdeUrl(datosDestino.url);
    
    console.log("ID origen extraído:", idOrigen);
    console.log("ID destino extraído:", idDestino);
    
    if (!idOrigen || !idDestino) {
      console.error("ID inválido", "Origen:", idOrigen, "Destino:", idDestino);
      return { exito: false, mensaje: "URL de origen o destino inválida" };
    }
    
    // Abrir los archivos con manejo de errores mejorado
    let archivoOrigen, archivoDestino;
    try {
      archivoOrigen = SpreadsheetApp.openById(idOrigen);
      if (!archivoOrigen) throw new Error("No se pudo abrir el archivo de origen");
      
      archivoDestino = SpreadsheetApp.openById(idDestino);
      if (!archivoDestino) throw new Error("No se pudo abrir el archivo de destino");
    } catch (e) {
      console.error("Error al abrir archivos:", e.toString());
      return { exito: false, mensaje: "Error al abrir los archivos: " + e.toString() };
    }
    
    // Verificar acceso a las hojas con manejo de errores mejorado
    let hojaOrigen, hojaDestino;
    try {
      console.log("Buscando hoja origen:", datosOrigen.hoja);
      hojaOrigen = archivoOrigen.getSheetByName(datosOrigen.hoja);
      if (!hojaOrigen) {
        console.error("Hoja origen no encontrada:", datosOrigen.hoja);
        return { exito: false, mensaje: `Hoja de origen "${datosOrigen.hoja}" no encontrada` };
      }
      
      console.log("Buscando hoja destino:", datosDestino.hoja);
      hojaDestino = archivoDestino.getSheetByName(datosDestino.hoja);
      if (!hojaDestino) {
        console.error("Hoja destino no encontrada:", datosDestino.hoja);
        return { exito: false, mensaje: `Hoja de destino "${datosDestino.hoja}" no encontrada` };
      }
    } catch (e) {
      console.error("Error al acceder a las hojas:", e.toString());
      return { exito: false, mensaje: "Error al acceder a las hojas: " + e.toString() };
    }
    
    // Obtener los datos según el tipo de transferencia con manejo de errores mejorado
    let datos;
    try {
      console.log("Tipo de transferencia:", datosOrigen.tipo);
      
      switch (datosOrigen.tipo) {
        case 'hoja':
          const ultimaFila = hojaOrigen.getLastRow();
          const ultimaColumna = hojaOrigen.getLastColumn();
          console.log("Dimensiones de hoja completa:", ultimaFila, "x", ultimaColumna);
          
          if (ultimaFila === 0 || ultimaColumna === 0) {
            console.error("Hoja de origen vacía");
            return { exito: false, mensaje: "La hoja de origen está vacía" };
          }
          
          // Obtener todos los datos de la hoja - manejo de error explícito
          try {
            datos = hojaOrigen.getRange(1, 1, ultimaFila, ultimaColumna).getValues();
            console.log("Datos obtenidos correctamente:", datos.length, "filas x", datos[0].length, "columnas");
          } catch (rangeError) {
            console.error("Error al obtener rango de hoja completa:", rangeError);
            return { exito: false, mensaje: "Error al obtener datos de la hoja completa: " + rangeError.toString() };
          }
          break;
          
        case 'rango':
          const rangoCompleto = `${datosOrigen.rangoInicio}:${datosOrigen.rangoFin}`;
          console.log("Obteniendo rango:", rangoCompleto);
          const range = hojaOrigen.getRange(rangoCompleto);
          datos = range.getValues();
          break;
          
        case 'columnas':
          const columnaInicio = datosOrigen.columnaInicio.toUpperCase();
          const cantidadColumnas = parseInt(datosOrigen.columnaCantidad);
          console.log("Columnas:", columnaInicio, "cantidad:", cantidadColumnas);
          
          // Convertir columna a índice numérico
          const colIndex = columnToIndex(columnaInicio);
          
          const ultimaFilaCol = hojaOrigen.getLastRow();
          if (ultimaFilaCol === 0) {
            console.error("No hay filas en la hoja origen");
            return { exito: false, mensaje: "No hay datos en las columnas seleccionadas" };
          }
          
          datos = hojaOrigen.getRange(1, colIndex, ultimaFilaCol, cantidadColumnas).getValues();
          break;
          
        case 'filas':
          const filaInicio = parseInt(datosOrigen.filaInicio);
          const cantidadFilas = parseInt(datosOrigen.filaCantidad);
          console.log("Filas:", filaInicio, "cantidad:", cantidadFilas);
          
          const ultimaColumnaFila = hojaOrigen.getLastColumn();
          if (ultimaColumnaFila === 0) {
            console.error("No hay columnas en la hoja origen");
            return { exito: false, mensaje: "No hay datos en las filas seleccionadas" };
          }
          
          datos = hojaOrigen.getRange(filaInicio, 1, cantidadFilas, ultimaColumnaFila).getValues();
          break;
          
        default:
          console.error("Tipo de transferencia desconocido:", datosOrigen.tipo);
          return { exito: false, mensaje: "Tipo de transferencia no reconocido" };
      }
      
      console.log("Datos obtenidos:", datos.length, "filas x", datos[0].length, "columnas");
    } catch (e) {
      console.error("Error al obtener datos de origen:", e.toString());
      return { exito: false, mensaje: "Error al obtener datos de origen: " + e.toString() };
    }
    
    // Verificar que se obtuvieron datos
    if (!datos || datos.length === 0 || datos[0].length === 0) {
      console.error("No se encontraron datos para transferir");
      return { exito: false, mensaje: "No se encontraron datos para transferir" };
    }
    
    // Escribir los datos en el destino con manejo de errores mejorado
    try {
      console.log("Tipo de destino:", datosDestino.tipo);
      console.log("Escribiendo desde celda:", datosDestino.celdaInicio || 'A1');
      
      // Usar A1 como valor predeterminado si no se proporciona una celda inicial
      const celdaInicioDestino = datosDestino.celdaInicio || 'A1';
      
      try {
        // Limpiar la hoja de destino antes (opcional, dependiendo de requisitos)
        // hojaDestino.clear();
        
        // Obtener la referencia de celda y convertir a fila/columna
        const celdaRef = hojaDestino.getRange(celdaInicioDestino);
        const filaInicio = celdaRef.getRow();
        const colInicio = celdaRef.getColumn();
        
        console.log("Posición de celda:", filaInicio, ",", colInicio);
        
        // Escribir desde la celda especificada SOLO COMO VALORES
        const rangoDestino = hojaDestino.getRange(filaInicio, colInicio, datos.length, datos[0].length);
        rangoDestino.setValues(datos);
        
        // Activar la primera celda
        celdaRef.activate();
        console.log("Datos escritos correctamente");
      } catch (celdaError) {
        // Intento alternativo: escribir por lotes pequeños
        try {
          console.log("Intentando escribir por lotes desde celda...");
          const LOTE_TAMAÑO = 50;
          const filaInicio = hojaDestino.getRange(datosDestino.celdaInicio).getRow();
          const colInicio = hojaDestino.getRange(datosDestino.celdaInicio).getColumn();
          
          for (let i = 0; i < datos.length; i += LOTE_TAMAÑO) {
            const filasFin = Math.min(i + LOTE_TAMAÑO, datos.length);
            const loteDatos = datos.slice(i, filasFin);
            
            hojaDestino.getRange(filaInicio + i, colInicio, loteDatos.length, loteDatos[0].length).setValues(loteDatos);
            console.log(`Lote ${i} a ${filasFin-1} escrito correctamente desde celda`);
            
            Utilities.sleep(100);
          }
          return { exito: true, mensaje: `Transferencia completada con éxito (por lotes). Se transfirieron ${datos.length} filas y ${datos[0].length} columnas.` };
        } catch (loteError) {
          console.error("Error también al escribir por lotes desde celda:", loteError);
          return { exito: false, mensaje: "Error al escribir datos desde la celda especificada. Intente con una cantidad menor de datos." };
        }
      }
    } catch (e) {
      console.error("Error al escribir datos en destino:", e.toString());
      return { exito: false, mensaje: "Error al escribir datos en destino: " + e.toString() };
    }
    
    return { 
      exito: true, 
      mensaje: `Transferencia completada con éxito. Se transfirieron ${datos.length} filas y ${datos[0].length} columnas.`
    };
  } catch (e) {
    console.error("Error general en la transferencia:", e.toString());
    return { exito: false, mensaje: "Error en la transferencia: " + e.toString() };
  }
}

/**
 * Convierte una referencia de columna (A, B, AA, etc.) a su índice numérico (1-based)
 * @param {string} columna - Referencia de columna en formato de letra
 * @return {number} Índice numérico correspondiente
 */
function columnToIndex(columna) {
  columna = columna.toUpperCase();
  let indice = 0;
  
  for (let i = 0; i < columna.length; i++) {
    indice = indice * 26 + (columna.charCodeAt(i) - 64);
  }
  
  return indice;
}

/**
 * Convierte el nombre de una columna (A, B, AA, etc.) a su número correspondiente
 * @param {string} columnName - Nombre de la columna (A, B, AA, etc.)
 * @return {number} - Número de columna (A=1, B=2, etc.)
 */
function columnNameToNumber(columnName) {
  let result = 0;
  for (let i = 0; i < columnName.length; i++) {
    result = result * 26 + columnName.charCodeAt(i) - 64;
  }
  return result;
}