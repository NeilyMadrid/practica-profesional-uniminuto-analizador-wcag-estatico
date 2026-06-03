import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { WCAGAnalyzer } from './analyzer';
import { generateCSV, generateHTML, generateJSON } from './reporter';

async function run() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("Uso: i-access-analyze <ruta-o-url> [--format=json|csv|html]");
        process.exit(1);
    }

    // Le decimos a TypeScript que estamos seguros de que 'target' es un string
    const target = args[0] as string;
    let format = 'json';
    const formatArg = args.find(a => a.startsWith('--format='));
    
    if (formatArg) {
        // Aseguramos que el resultado del split sea tratado como string
        format = formatArg.split('=')[1] as string;
    }

    let htmlContent = '';
    try {
        if (target.startsWith('http')) {
            console.log(`Descargando y analizando URL remota: ${target}...`);
            //const response = await axios.get(target);
            const response = await axios.get(target, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            htmlContent = response.data;
        } else {
            console.log(`Leyendo y analizando archivo local: ${target}...`);
            htmlContent = fs.readFileSync(path.resolve(target), 'utf-8');
        }

        const analyzer = new WCAGAnalyzer(htmlContent);
        const results = analyzer.runAudit();
        const reportData = {
            documento: target, 
            totalViolaciones: results.filter(r => !r.passed).length, 
            resultados: results
        };

        let outputStr = '';
        if (format === 'csv') outputStr = generateCSV(reportData);
        else if (format === 'html') outputStr = generateHTML(reportData);
        else outputStr = generateJSON(reportData);

        const outPath = path.resolve(`reporte-salida.${format}`);
        fs.writeFileSync(outPath, outputStr, 'utf-8');
        console.log(`[Éxito] Reporte exportado en: ${outPath}`);
    } catch (error: any) {
        console.error(`Error en el análisis: ${error.message}`);
    }
}
run();