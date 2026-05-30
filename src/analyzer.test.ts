
import { WCAGAnalyzer } from './analyzer';

describe('Pruebas Unitarias - Analizador WCAG Estático', () => {

    // --- REGLAS SEMANA 2 ---
    it('Regla 1: Debe detectar imágenes sin atributo alt (Criterio 1.1.1)', () => {
        const html = '<img src="imagen-error.png">';
        const analyzer = new WCAGAnalyzer(html);
        const results = analyzer.runAudit();
        expect(results.find(r => r.ruleId === '1.1.1')?.passed).toBe(false);
    });

	it('Regla 2: Debe detectar saltos abruptos en encabezados (Criterio 2.4.6)', () => {
        const html = '<h1>Título</h1><h3>Subtítulo sin pasar por H2</h3>';
        const analyzer = new WCAGAnalyzer(html);
        const results = analyzer.runAudit();        
        const regla = results.find(r => r.ruleId === '2.4.6' && r.element === 'h3');
        expect(regla?.passed).toBe(false);
    });

    it('Regla 3: Debe detectar contraste nulo en estilos inline (Criterio 1.4.3)', () => {
        const html = '<p style="color: #fff; background-color: #fff;">Texto invisible</p>';
        const analyzer = new WCAGAnalyzer(html);
        const results = analyzer.runAudit();
        expect(results.find(r => r.ruleId === '1.4.3')?.passed).toBe(false);
    });

    // --- REGLAS SEMANA 3 ---
    it('Regla 4: Debe detectar botones vacíos sin texto interactivo (Criterio 4.1.2)', () => {
        const html = '<button></button>';
        const analyzer = new WCAGAnalyzer(html);
        const results = analyzer.runAudit();
        const regla = results.find(r => r.ruleId === '4.1.2' && r.element.includes('button'));
        expect(regla?.passed).toBe(false);
    });

    it('Regla 5: Debe detectar atributo aria-label vacío (Criterio 4.1.2)', () => {
        const html = '<div aria-label="   ">Contenido</div>';
        const analyzer = new WCAGAnalyzer(html);
        const results = analyzer.runAudit();
        const regla = results.find(r => r.ruleId === '4.1.2' && r.element.includes('div'));
        expect(regla?.passed).toBe(false);
    });

    it('Regla 6: Debe detectar enlaces con texto genérico no significativo (Criterio 2.4.4)', () => {
        const html = '<a href="/test">haz clic aquí</a>';
        const analyzer = new WCAGAnalyzer(html);
        const results = analyzer.runAudit();
        expect(results.find(r => r.ruleId === '2.4.4')?.passed).toBe(false);
    });
});