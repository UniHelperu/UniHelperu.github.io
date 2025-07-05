# Calculadora de Equilibrio de Nash

Esta es una calculadora web interactiva para encontrar equilibrios de Nash puros en juegos de dos jugadores con matriz de pagos.

## Características
- Permite personalizar los nombres de los jugadores y sus estrategias.
- Ingreso manual de la matriz de pagos.
- Resalta únicamente los equilibrios de Nash puros en la tabla.
- Cada celda es interactiva: al hacer clic, se explica por qué es o no un equilibrio de Nash.
- Explicación lógica detallada de las mejores respuestas para cada jugador.
- Opción para subir una imagen de una matriz y extraer los datos automáticamente (OCR).
- Interfaz moderna, clara y adaptable a dispositivos móviles.

## ¿Qué es un equilibrio de Nash puro?
Es una combinación de estrategias donde ningún jugador puede mejorar su pago cambiando unilateralmente de estrategia. En la matriz, solo se resalta una celda por fila y columna (la mejor respuesta de cada jugador), y el equilibrio es la intersección de ambas.

## Uso
1. Abre el archivo `index.html` en tu navegador.
2. Personaliza los nombres de los jugadores y estrategias si lo deseas.
3. Ingresa la matriz de pagos (cada celda como `a,b` donde `a` es el pago del Jugador 1 y `b` el del Jugador 2).
4. Haz clic en "Calcular equilibrio de Nash".
5. Haz clic en cualquier celda para ver la explicación detallada en el panel lateral.
6. (Opcional) Sube una imagen de una matriz para extraer los datos automáticamente.

## Instalación y ejecución local
No requiere instalación de dependencias. Solo necesitas un navegador web moderno.

1. Descarga o clona este repositorio.
2. Abre el archivo `index.html` en tu navegador.

## Créditos
Desarrollado por UniHelperu.

---
¿Dudas o sugerencias? ¡No dudes en abrir un issue o contactarme! 