import * as fs from 'fs';
import * as path from 'path';
import { WCAGAnalyzer, AuditResult } from './analyzer';

// Interfaz para estructurar el JSON de salida unificado por página
interface ProjectReport {
    documento: string;
    fechaAuditoria: string;
    totalViolaciones: number;
    resultados: AuditResult[];
}

function runLocalSuite() {
    // Definición de las rutas físicas de las 3 páginas locales requeridas
    const targetFiles = [
        'test-pages/pagina1.html',
        'test-pages/pagina2.html',
        'test-pages/pagina3.html',
		'test-pages/pagina4.html' // apliacion nuevas pruemas semana 3
    ];

    const finalReport: ProjectReport[] = [];

    targetFiles.forEach((relativeUrl) => {
        const absolutePath = path.resolve(relativeUrl);

        // Validación de existencia física del archivo antes de la lectura
        if (!fs.existsSync(absolutePath)) {
            console.error(`Error crítico: El archivo local no existe en la ruta: ${absolutePath}`);
            return;
        }

        // Lectura del archivo HTML físico como String
        const htmlContent = fs.readFileSync(absolutePath, 'utf-8');

        // Instanciación del motor pasando el contenido dinámico extraído del archivo
        const analyzer = new WCAGAnalyzer(htmlContent);
        const auditResults = analyzer.runAudit();

        // Filtrar solo los elementos que fallaron para el conteo de violaciones
        const violaciones = auditResults.filter(r => !r.passed).length;

        finalReport.push({
            documento: relativeUrl,
            fechaAuditoria: new Date().toISOString(),
            totalViolaciones: violaciones,
            resultados: auditResults
        });
    });

    // Emisión del JSON estructurado final por consola
    console.log(JSON.stringify(finalReport, null, 2));
    
	// 1. Emisión en la terminal (lo que ya ve en la pantalla)
    console.log("=== EJECUCIÓN DEL REPORTE AUTOMATIZADO DE ACCESIBILIDAD ===");
    console.log(JSON.stringify(finalReport, null, 2));

    // 2. NUEVO: Escritura física del archivo JSON en la raíz del proyecto
    const outputPath = path.resolve('reporte-salida.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalReport, null, 2), 'utf-8');
    
    console.log(`\n[Éxito]: El archivo físico del reporte se generó correctamente en: ${outputPath}`);
}

// Ejecución de la suite
runLocalSuite();