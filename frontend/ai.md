# frontend/ai.md

## Propósito
Contiene la SPA React para cargar audios de WhatsApp, enviarlos al backend y mostrar las transcripciones.

## Decisiones
- React + Vite para SPA moderna y rápida.
- Soporte de carga múltiple (drag & drop y file picker).
- Comunicación con backend vía API REST.
- Próximo paso: crear componente de carga múltiple y pantalla de resultados. 

## [2024-07-21] Mejora visual y paleta de colores

- Se definió una nueva paleta de colores moderna usando variables CSS en index.css.
- Se actualizaron los estilos de App.css para usar la nueva paleta y mejorar la estética visual.
- Se mejoraron botones, dropzone, contenedores y detalles visuales.
- Todo sigue usando CSS puro, sin frameworks externos. 

### [2024-07-21] Usabilidad mejorada
- Se agregó un spinner de carga visual durante la transcripción.
- Se añadió un botón para copiar cada transcripción al portapapeles, con feedback visual. 

### [2024-07-21] Mejoras visuales avanzadas
- Responsividad avanzada para mobile/tablet.
- Tarjetas visuales para resultados de transcripción.
- Banner destacado para errores generales.
- Badges para archivos con error.
- Animaciones de fade-in en listas y resultados.
- Separadores visuales entre secciones. 

### [2024-07-21] Rediseño premium visual
- Fondo oscuro con degradado azul-violeta.
- Glassmorphism en cards y contenedores.
- Acentos dorados y azul eléctrico en botones y detalles.
- Tipografía premium: Poppins (títulos), Inter (texto).
- Sombras profundas y suaves.
- Animaciones y microinteracciones elegantes. 

### [2024-07-21] Pulido premium visual
- Glassmorphism más marcado en cards y contenedores.
- Sombras dinámicas y profundas.
- Gradientes animados en botones y detalles.
- Glow sutil en botones principales.
- Divisores y líneas translúcidas más elegantes.
- Animaciones suaves de entrada y salida en todos los elementos clave.
- Feedback visual en dropzone al arrastrar archivos.
- Ripple en botones al click.
- Tilt en cards de resultados.
- Focus ring animado en botones.
- Highlight en card copiada.
- Bounce en spinner.
- Scale y glow en botón de subir.
- Slide y fade en listas y botones. 