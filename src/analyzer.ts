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
               
        // Reglas Semana 2
        results.push(...this.auditImagesAlt());
        results.push(...this.auditHeadingOrder());
        results.push(...this.auditBasicContrast());
       
        // Nuevas Reglas Semana 3
        results.push(...this.auditBotonesSinTexto());
        results.push(...this.auditAriaLabel());
        results.push(...this.auditEnlacesSinTexto());

        // Nuevas Reglas Semana 5
        results.push(...this.auditInvalidAriaRoles());
        results.push(...this.auditTableHeaders());
        results.push(...this.auditDynamicOpacity());
       
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
   
    /*
        Semana 3
    */
    private auditBotonesSinTexto(): AuditResult[] {
        const buttons = this.document.querySelectorAll('button');
        const results: AuditResult[] = [];
        buttons.forEach((btn, index) => {
            const hasText = btn.textContent ? btn.textContent.trim().length > 0 : false;
            const hasAria = btn.hasAttribute('aria-label') && btn.getAttribute('aria-label')!.trim().length > 0;
            const passed = hasText || hasAria;
            results.push({
                ruleId: '4.1.2', level: 'A', element: `button[index=${index}]`,
                message: passed ? 'Botón accesible.' : 'Violación: Botón sin texto interno ni aria-label.', passed
            });
        });
        return results;
    }


    private auditAriaLabel(): AuditResult[] {
        const elements = this.document.querySelectorAll('[aria-label]');
        const results: AuditResult[] = [];
        elements.forEach((el, index) => {
            const ariaLabel = el.getAttribute('aria-label') || '';
            const passed = ariaLabel.trim().length > 0;
            results.push({
                ruleId: '4.1.2', level: 'A', element: `${el.tagName.toLowerCase()}[index=${index}]`,
                message: passed ? 'aria-label válido.' : 'Violación: Atributo aria-label presente pero vacío.', passed
            });
        });
        return results;
    }


    private auditEnlacesSinTexto(): AuditResult[] {
        const links = this.document.querySelectorAll('a');
        //const genericTexts = ['click aqui', 'haz clic aqui', 'leer mas', 'link', 'mas info'];
        const genericTexts = ['click aqui', 'click aquí', 'haz clic aqui', 'haz clic aquí',  'leer mas', 'leer más',  'link', 'mas info', 'más info'];
        const results: AuditResult[] = [];
        links.forEach((link, index) => {
            const text = (link.textContent || '').trim().toLowerCase();
            const hasAria = link.hasAttribute('aria-label') && link.getAttribute('aria-label')!.trim().length > 0;
           
            let passed = text.length > 0 && !genericTexts.includes(text);
            if (!passed && hasAria) passed = true; // El aria-label salva el enlace genérico/vacío


            results.push({
                ruleId: '2.4.4', level: 'A', element: `a[index=${index}]`,
                message: passed ? 'Enlace significativo.' : 'Violación: Enlace vacío o con texto genérico no descriptivo.', passed
            });
        });
        return results;
    }

    /*
        Semana 5
    */
    private auditInvalidAriaRoles(): AuditResult[] {
        const elements = this.document.querySelectorAll('[role]');
        const validRoles = ['alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog', 'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'];
        
        const results: AuditResult[] = [];
        elements.forEach((el, index) => {
            const role = el.getAttribute('role')?.toLowerCase() || '';
            const passed = validRoles.includes(role);
            results.push({
                ruleId: '4.1.2', level: 'A', element: `${el.tagName.toLowerCase()}[role="${role}"]`,
                message: passed ? 'Rol ARIA válido.' : `Violación: El rol '${role}' no existe en el estándar W3C.`, passed
            });
        });
        return results;
    }

    private auditTableHeaders(): AuditResult[] {
        const tables = this.document.querySelectorAll('table');
        const results: AuditResult[] = [];
        tables.forEach((table, index) => {
            const hasHeaders = table.querySelectorAll('th').length > 0;
            results.push({
                ruleId: '1.3.1', level: 'A', element: `table[index=${index}]`,
                message: hasHeaders ? 'Tabla con encabezados detectados.' : 'Violación: Tabla sin estructura de encabezados (<th>).', passed: hasHeaders
            });
        });
        return results;
    }

    private auditDynamicOpacity(): AuditResult[] {
        const elementsWithStyle = this.document.querySelectorAll('[style]');
        const results: AuditResult[] = [];
        elementsWithStyle.forEach((el, index) => {
            const style = el.getAttribute('style')?.replace(/\s+/g, '').toLowerCase() || '';
            const passed = !style.includes('opacity:0;');
            results.push({
                ruleId: '1.4.3', level: 'AA', element: `${el.tagName.toLowerCase()}[index=${index}]`,
                message: passed ? 'Estilos dinámicos válidos.' : 'Violación: Opacidad nula detectada (ocultamiento visual que rompe lecturas ARIA).', passed
            });
        });
        return results;
    }
}
