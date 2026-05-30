# practica-profesional-uniminuto-analizador-wcag-estatico
# Alcance del Analizador Estático WCAG 2.1

Este motor de análisis estático evalúa el DOM en busca de violaciones de accesibilidad basándose en las pautas WCAG 2.1. Se han implementado 12 validaciones estructurales clasificadas en los niveles A y AA.

## Nivel A (Accesibilidad Básica)
1. **[Criterio 1.1.1] Contenido no textual:** Todo elemento `<img>` debe poseer un atributo `alt` para ser interpretado por lectores de pantalla.
2. **[Criterio 1.3.1] Información y relaciones (Formularios):** Todo elemento `<input>`, `<select>` o `<textarea>` debe tener un `<label>` asociado (ya sea implícito, explícito o vía `aria-label`).
3. **[Criterio 2.4.2] Página titulada:** El documento HTML debe contener una etiqueta `<title>` no vacía dentro del `<head>`.
4. **[Criterio 3.1.1] Idioma de la página:** La etiqueta raíz `<html>` debe contener un atributo `lang` válido.
5. **[Criterio 2.4.4] Propósito de los enlaces (En contexto):** Las etiquetas `<a>` deben contener texto discernible (no estar vacías) y evitar frases genéricas (ej. "clic aquí").
6. **[Criterio 4.1.2] Nombre, función, valor:** Los elementos `<button>` deben poseer texto interno o un atributo `aria-label` que describa su acción.
7. **[Criterio 2.1.1] Teclado:** Elementos no interactivos por defecto (como `<div>` o `<span>`) que posean eventos de ratón (`onclick`) deben incluir eventos de teclado (ej. `onkeydown`) o el rol ARIA adecuado.
8. **[Criterio 4.1.1] Procesamiento:** Los atributos `id` deben ser únicos en todo el documento HTML para no romper referencias de accesibilidad.

## Nivel AA (Accesibilidad Intermedia)
9. **[Criterio 1.4.4] Cambio de tamaño del texto:** La etiqueta `<meta name="viewport">` no debe contener `user-scalable=no` ni `maximum-scale=1.0`, ya que bloquea el zoom para usuarios con baja visión.
10. **[Criterio 2.4.6] Encabezados y etiquetas:** La jerarquía de los encabezados debe ser lógica y secuencial. No se deben saltar niveles (ej. pasar de un `<h1>` a un `<h3>` sin un `<h2>` intermedio).
11. **[Criterio 1.3.5] Identificación del propósito de la entrada:** Elementos `<input>` que soliciten información personal (ej. correo, nombre, teléfono) deben incluir el atributo `autocomplete` correcto.
12. **[Criterio 3.1.2] Idioma de las partes:** Si existen elementos dentro del DOM que cambien de idioma respecto al `lang` principal, el atributo `lang` en dichos elementos secundarios debe cumplir con el formato BCP 47 (ej. `en`, `es-CO`).