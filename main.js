/**
 * Función principal que se ejecuta cuando se accede a la aplicación web.
 * @return {HtmlOutput} La página HTML renderizada.
 */
function doGet() {
    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('RailCar - Transferencia de Google Sheets')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  /**
   * Función de utilidad para incluir archivos HTML.
   * @param {string} filename - El nombre del archivo HTML a incluir.
   * @return {string} El contenido del archivo HTML.
   */
  function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  }
  