export function generateJSON(data: any): string {
    return JSON.stringify(data, null, 2);
}

export function generateCSV(data: any): string {
    let csv = "Regla,Nivel,Elemento,Mensaje,Aprobado\n";
    data.resultados.forEach((r: any) => {
        csv += `"${r.ruleId}","${r.level}","${r.element}","${r.message}","${r.passed}"\n`;
    });
    return csv;
}

export function generateHTML(data: any): string {
    let rows = data.resultados.map((r: any) => `
        <tr style="background-color: ${r.passed ? '#e8f5e9' : '#ffebee'};">
            <td>${r.ruleId}</td><td>${r.level}</td><td>${r.element}</td>
            <td>${r.message}</td><td>${r.passed ? 'Sí' : 'No'}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head><title>Reporte de Accesibilidad</title></head>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Reporte de Auditoría WCAG 2.1</h1>
        <p><strong>Documento/URL:</strong> ${data.documento}</p>
        <p><strong>Total Violaciones:</strong> ${data.totalViolaciones}</p>
        <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #1f4e79; color: white;">
                <th>Regla</th><th>Nivel</th><th>Elemento</th><th>Mensaje</th><th>Aprobado</th>
            </tr>
            ${rows}
        </table>
    </body>
    </html>`;
}