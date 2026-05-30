import { JSDOM } from 'jsdom';

export interface AuditResult {
    ruleId: string;
    level: string;
    element: string;
    message: string;
    passed: boolean;
}

export class WCAGAnalyzer {
    private document: Document;

    constructor(htmlString: string) {
        const dom = new JSDOM(htmlString);
        this.document = dom.window.document;
    }

    public runAudit(): AuditResult[] {
        const results: AuditResult[] = [];
        results.push(...this.auditImagesAlt());
        results.push(...this.auditHeadingOrder());
        results.push(...this.auditBasicContrast());
        return results;
    }

    /**
     * Error 1: Imágenes sin alt (Criterio 1.1.1 - Nivel A)
     */
    private auditImagesAlt(): AuditResult[] {
        const images = this.document.querySelectorAll('img');
        const results: AuditResult[] = [];
        images.forEach((img, index) => {
            const hasAlt = img.hasAttribute('alt');
            results.push({
                ruleId: '1.1.1',
                level: 'A',
                element: `img[index=${index}]`,
                message: hasAlt ? 'Atributo alt presente.' : 'Violación: Imagen detectada sin el atributo alt.',
                passed: hasAlt
            });
        });
        return results;
    }

    /**
     * Error 2: Encabezados fuera de orden (Criterio 2.4.6 - Nivel AA)
     * Verifica que la jerarquía de h1-h6 no salte niveles de forma abrupta.
     */
    private auditHeadingOrder(): AuditResult[] {
        const headings = this.document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const results: AuditResult[] = [];
        let previousLevel = 0;

        headings.forEach((heading) => {
            const currentLevel = parseInt(heading.tagName.substring(1)); // Extrae el número del tag (ej. H3 -> 3)
            let passed = true;
            let message = `Encabezado ${heading.tagName} sigue un orden lógico.`;

            // Si el nivel actual salta más de un nivel respecto al anterior (ej. de 1 a 3)
            if (previousLevel > 0 && currentLevel > previousLevel + 1) {
                passed = false;
                message = `Violación: Salto incorrecto en la jerarquía de encabezados. Se pasó de un H${previousLevel} a un H${currentLevel} de forma abrupta.`;
            }

            results.push({
                ruleId: '2.4.6',
                level: 'AA',
                element: heading.tagName.toLowerCase(),
                message: message,
                passed: passed
            });

            previousLevel = currentLevel;
        });

        return results;
    }

    /**
     * Error 3: Contraste básico (Criterio 1.4.3 - Nivel AA)
     * Evalúa de forma estática estilos inline propensos a baja visibilidad.
     */
    private auditBasicContrast(): AuditResult[] {
        const elementsWithStyle = this.document.querySelectorAll('[style]');
        const results: AuditResult[] = [];

        elementsWithStyle.forEach((el, index) => {
            const style = el.getAttribute('style') || '';
            // Patrón básico: Detectar si se fuerza texto blanco sobre fondo claro o viceversa mediante estilos en línea sencillos
            const hasWhiteText = style.includes('color: #fff') || style.includes('color: white');
            const hasLightBg = style.includes('background-color: #fff') || style.includes('background-color: white');
            
            let passed = true;
            let message = 'No se detectaron anomalías evidentes de contraste en los estilos inline.';

            if (hasWhiteText && hasLightBg) {
                passed = false;
                message = 'Violación: Combinación crítica de alto riesgo de contraste (Texto blanco sobre fondo blanco/claro inline).';
            }

            results.push({
                ruleId: '1.4.3',
                level: 'AA',
                element: `${el.tagName.toLowerCase()}[index=${index}]`,
                message: message,
                passed: passed
            });
        });

        return results;
    }
}