# Juego Mi Tesoro

Este es un juego interactivo donde el jugador controla a Gollum en un tablero de 10x10 celdas, tratando de encontrar el Anillo. El jugador debe tirar un dado para mover a Gollum y alcanzar el objetivo antes que otros. Se incluye la opción de registrar el nombre del jugador y guardar las mejores puntuaciones en el almacenamiento local.

## Características

- **Tablero dinámico**: Genera un tablero de 10x10 con celdas identificadas por coordenadas.
- **Movimiento basado en dado**: El jugador tira un dado para determinar cuántas celdas puede moverse.
- **Posición de héroe y objetivo**: El héroe (Gollum) y el objetivo (Anillo) están representados por imágenes en el tablero.
- **Control por clic**: El jugador hace clic en las celdas resaltadas para mover a Gollum.
- **Registros de puntuación**: Al finalizar el juego, la puntuación (número de tiradas) se guarda y se puede comparar con los récords anteriores.
- **Nueva partida**: Permite reiniciar el juego tras ganar, mostrando un botón para jugar nuevamente.

## Requisitos

- **Navegador web moderno** (Chrome, Firefox, Safari, etc.) para ejecutar el juego.

## Instalación

1. Clona este repositorio a tu máquina local:
   	git clone https://github.com/tu_usuario/gollum-anillo.git

2. Accede al directorio del proyecto:
	cd gollum-anillo

3. Abre el archivo index.html en tu navegador para comenzar a jugar.

## Uso

1. **Pantalla de inicio**
Al cargar la página, el jugador debe ingresar su nombre en el campo correspondiente y presionar el botón "Validar". Si el nombre es válido (al menos 4 caracteres y sin números), el botón "Jugar" se habilitará.

2. **Comenzando el juego**
Después de iniciar el juego, se mostrará un tablero de 10x10 celdas. El jugador controlará a Gollum, quien comienza en la esquina superior izquierda, y debe lanzar el dado para moverlo hacia el objetivo (el Anillo), que se encuentra en la última celda del tablero.

3. **Lanzamiento de dado**
Al hacer clic en el botón "Tirar el dado", Gollum podrá moverse según el número obtenido en la tirada. Las celdas válidas se resaltarán y el jugador podrá hacer clic en una celda resaltada para mover a Gollum.

4. **Victoria**
Cuando Gollum llegue a la celda que contiene el Anillo, el juego se considera ganado. Se muestra un mensaje con la cantidad de tiradas utilizadas y se guarda el récord en el almacenamiento local.

5. **Nueva partida**
Al ganar, se ofrecerá un botón para iniciar una nueva partida, reiniciando el juego y mostrando el tablero vacío.

## Funciones clave del código

Funciones clave del código
- **validarNombre(input)**: Valida el nombre del usuario asegurándose de que tenga al menos 4 caracteres y no contenga números.
- **iniciarJuego()**: Se ejecuta al validar el nombre y habilita el botón para comenzar el juego.
- **tirarDado()**: Simula el lanzamiento de un dado y mueve a Gollum de acuerdo con el número obtenido.
- **moverHeroe(celda)*+: Mueve a Gollum a la celda seleccionada y verifica si ha ganado el juego.
- **guardarEnLocal(clave, valor)**: Guarda las puntuaciones en el almacenamiento local del navegador.

## Almacenamiento y puntuaciones

El juego guarda las mejores puntuaciones utilizando el almacenamiento local (localStorage). La puntuación se basa en el número de tiradas necesarias para alcanzar el objetivo, y se compara con las puntuaciones anteriores para determinar si el jugador ha establecido un nuevo récord.