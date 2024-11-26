'use strict';
/*----- Inicialización y configuración -----*/

document.addEventListener("DOMContentLoaded", inicio);

// Definición de variables y objetos globales

// Nombre del usuario
let nombre = '';
// Inicialización del contador de tiradas
let numeroTiradas = 0;
//Variables de posición de juego
const posicionHeroe = [];
const posicionObjetivo = [];

/* Configuración de los botones tras la carga inicial del documento */
function inicio(){
    configurarBotones();
}

function configurarBotones(){
    IU.botonValidar().addEventListener("click", iniciarJuego);
    IU.botonJugar().addEventListener("click", pulsarJugar);
    IU.botonTirar().addEventListener("click", tirarDado);
    IU.botonNuevaPartida().addEventListener("click", nuevaPartida);
    IU.botonRanking().addEventListener("click", mostrarRanking);
}

/* Objeto para acceder dinámicamente a elementos del DOM.
   Centraliza todas las referencias al DOM, facilitando su mantenimiento. */
const IU = {

    //Pantallas principales
    pantallaLogin: () => document.getElementById("pantallaLogin"),
    pantallaJuego: () => document.getElementById("pantallaJuego"),

    // Formulario de login
    formLogin: () => document.getElementById("formLogin"),
    botonJugar: () => document.getElementById("botonJugar"),
    botonValidar: () => document.getElementById("botonValidar"),
    nombreUsuario: () => document.getElementById("nombreUsuario").value,
    mensajeLogin: () => document.getElementById("mensajeLogin"),

    // Elementos del juego
    contenedorMensaje: () => document.getElementById("contenedorMensaje"),
    contenedorTablero: () => document.getElementById("contenedorTablero"),
    tablero: () => document.getElementById("tablero"),
    contenedorDado: () => document.getElementById("contenedorDado"),
    dado: () => document.getElementById("dado"),
    botonTirar: () => document.getElementById("botonTirar"),
    botonNuevaPartida: () => document.getElementById("botonNuevaPartida"),
    botonRanking: () => document.getElementById("botonRanking"),
    mensajeJuego: () => document.getElementById("mensajeJuego"),
    contenedorJuego: () => document.getElementById("contenedorJuego"),
    contenedorFinJuego: () => document.getElementById("contenedorFinJuego"),
    ranking: () => document.getElementById("ranking"),
    celda: (tabla, x,y) => tabla.querySelector(`[id='${x}-${y}']`),
    

    // Gráficos
    heroe: () => document.getElementById("heroe"),
    objetivo: () => document.getElementById("objetivo"),

};

/* Valida el nombre de usuario y devuelve un mensaje de error o `true` si es válido */
function validarNombre(input){
    let mensaje = '';  
    if(!input) {
        mensaje += "El nombre no puede estar vacío.";
    }
    else{
        if (input.length < 4) mensaje += "El nombre debe tener 4 o más letras.\n";
        if (/\d/.test(input)) mensaje += "Números no permitidos.";
    }
    
    return mensaje == '' ? true : mensaje;
}

/* Valida el nombre ingresado y habilita o deshabilita el botón "Jugar".
   Muestra mensajes de error en caso de nombre inválido. */
function iniciarJuego(){
    // En caso de que ya exista el elemento mensaje, se elimina para evitar duplicados 
    if(IU.mensajeLogin()) IU.mensajeLogin().remove();

    const mensaje = document.createElement("p");
    mensaje.id = "mensajeLogin";

    const validacion = validarNombre(IU.nombreUsuario());

    if(validacion === true){
        IU.botonJugar().disabled = false; 
        nombre = IU.nombreUsuario();
        mensaje.textContent = `Adéntrate en la cueva, ${nombre}, Gollum te necesita.`;
    }
    else{
        IU.botonJugar().disabled = true;
        mensaje.textContent = validacion;
    }
          
    formLogin.insertAdjacentElement('afterend', mensaje);

}

/* Oculta la pantalla de introducción de usuario y muestra la pantalla de juego. 
    - Recoge el nombre de usuario y reinicia el contador de tiradas */
function pulsarJugar(){
    IU.pantallaLogin().style.display = "none";
    nombre = IU.nombreUsuario();
    numeroTiradas = 0;
    mostrarJuego();
}

/*----- Finalización y reinicio -----*/
/* Comprueba si el jugador ha mejorado su puntuación o es nuevo.
En ese caso guarda las puntuaciones */
function guardarPuntuacion(){
    let ranking = recuperarMapaLocal("recordTiradas");

    if(!ranking.get(nombre) || (ranking.get(nombre) >= numeroTiradas)) {
        ranking.set(`${nombre}`, `${numeroTiradas}`);
        guardarEnLocal("recordTiradas", serializarMapa(ranking));
    }
}

/* Muestra el mensaje de victoria y los botones de fin de juego y registra la puntuación. */
function victoria(){
    guardarPuntuacion();
    IU.contenedorDado().style.display = "none";

    const mensaje = IU.mensajeJuego();
    mensaje.innerHTML = `¡Lo conseguiste, ${nombre}, Gollum ha encontrado el Anillo!<br>`;

    const mensajeRecord = document.createElement("div");
    mensajeRecord.id = "mensajeRecord";
    mensaje.insertAdjacentElement('afterend', mensajeRecord);
    
    mensaje.innerHTML += esRecord(nombre) ?  
        `¡Nadie ha sido más rápido!<br>¡Sólo necesitaste ${numeroTiradas} tiradas!`:
        `Has necesitado ${numeroTiradas} tiradas para mostrarle el camino.`;
    
    IU.contenedorFinJuego().style.display = "flex";
}

function reiniciarInterfaz(){
    IU.pantallaJuego().style.display = "none";
    IU.pantallaLogin().style.display = "flex";
    IU.contenedorDado().style.display = "flex";
    IU.contenedorJuego().style.display = "flex";
    IU.contenedorFinJuego().style.display = "none";
    IU.botonRanking().style.display = "block";
    IU.dado().src = "./img/placeholderDado.png";
    IU.botonJugar().disabled = true;
}

/* Restablece los datos del juego a sus valores iniciales. */
function reiniciarEstado(){
    nombre = '';
    numeroTiradas = 0;
}

function limpiarElementosDinamicos(){
    IU.formLogin().reset();
    if (IU.mensajeLogin()) IU.mensajeLogin().remove();
    if (IU.ranking()) IU.ranking().remove();
}

/* Reinicia la partida al estado inicial. */
function nuevaPartida(){
    reiniciarEstado();
    reiniciarInterfaz();
    limpiarElementosDinamicos();
}

/*----- Generación y gestión de la IU -----*/

/* Función que muestra la pantalla de juego al usuario.
    - Genera los elementos necesarios para la partida: tablero, gráficos,
    y configura el mensaje y el botón de tirar el dado. */
function mostrarJuego(){
    IU.pantallaJuego().style.display = "flex";
    definirMensajeJuego();
    generarTablero(10, 10);
    insertarGraficos();
}

/* Configura el mensaje principal mostrado durante la partida */
function definirMensajeJuego(){
    const mensaje = IU.mensajeJuego();
    mensaje.innerHTML = `Solo tú puedes guiar a Gollum, ${nombre}.<br>`
        + `Tira el dado y muéstrale el camino.`;

}

/* Genera el tablero de juego con un tamaño de x filas y y columnas.
    - Asigna un ID único a cada celda con el formato "-x-y" para facilitar su manejo. 
    - Elimina el tablero anterior si existe */
function generarTablero(x, y){
    if(IU.tablero()) IU.tablero().remove();
    const tablero = crearTabla(x,y);
    tablero.id = "tablero";
    tablero.addEventListener("click", controlClickMover);
    IU.contenedorTablero().appendChild(tablero);
}

/* Crea dinámicamente una tabla HTML con un tamaño de x filas por y columnas.
   Cada celda recibe un ID único en el formato "x-y". */
function crearTabla(x, y){
    let cadenaTabla = '';
    
    for(let i=1; i <= x; i++){
        cadenaTabla += '<tr>';
        for(let j=1; j <= y; j++){
            cadenaTabla += `<td id="${j}-${i}"></td>`;
        }
        cadenaTabla += '</tr>'
    }

    const tabla = document.createElement("table");
    tabla.innerHTML = cadenaTabla;
    return tabla;
}

/* Inserta los gráficos principales en el tablero:
    - El objetivo se coloca en la última celda (objetivo del juego).
    - El héroe se coloca en la primera celda (posición inicial).
    - Actualiza las posiciones iniciales de ambos elementos en sus respectivas variables. */
function insertarGraficos(){
    // Identificar la última celda del tablero para colocar el objetivo.
    const ultimaCelda = IU.tablero().querySelector("tr:last-child td:last-child").id.split("-");
    
    // Crear o seleccionar el elemento gráfico del objetivo.
    let objetivo;
    if(IU.objetivo()) {
        objetivo = IU.objetivo();
    }  
    else {
        objetivo = document.createElement("img");
        let celda = IU.celda(IU.tablero(), ultimaCelda[0], ultimaCelda[1]);
        celda.appendChild(objetivo);
    }
    objetivo.id = "objetivo"
    objetivo.src = "./img/anillo.png";
    posicionObjetivo[0] = parseInt(ultimaCelda[0]);
    posicionObjetivo[1] = parseInt(ultimaCelda[1]);

    // Crear o seleccionar el elemento gráfico del héroe.
    let heroe;
    if(IU.heroe()) {
        heroe = IU.heroe();
    }
    else {
        heroe = document.createElement("img");
        let celda = IU.celda(IU.tablero(), 1, 1);
        celda.appendChild(heroe);
    }
    heroe.id = "heroe";
    heroe.src = "./img/gollum.png";
    posicionHeroe[0] = 1;
    posicionHeroe[1] = 1;
}

/* Crea un contenedor que incluye un botón dinámico basado en los parámetros recibidos.
    - contenedorID: ID para el contenedor.
    - botonID: ID único para el botón.
    - texto: Texto mostrado en el botón.
    - funcionDisparada: Función que se ejecuta al pulsar el botón.
    - Devuelve el contenedor con el botón incluido. */
function generarBoton(contenedorID, botonID, texto, funcionDisparada){
    let contenedor = document.getElementById(contenedorID);
    if(!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = contenedorID;
    }

    const boton = document.createElement("button");
    boton.id = botonID;
    boton.type = "button";
    boton.textContent = texto;
    boton.addEventListener("click", funcionDisparada);
    contenedor.appendChild(boton);

    return contenedor;
}

/*----- Lógica del juego -----*/

/* Simula el lanzamiento de un dado.
    - Desactiva temporalmente el botón de tirar.
    - Genera un número aleatorio entre 1 y 6.
    - Anima el cambio de caras del dado durante 1 segundo.
    - Actualiza la imagen del dado con el resultado final.
    - Resalta las celdas disponibles según el número obtenido. */
function tirarDado(ev){
    ev.currentTarget.disabled = true;
    numeroTiradas += 1;

    const tirada = parseInt(Math.random()*6 + 1);

    const duracionAnimacion = 1000; 
    const intervalo = 100; // Tiempo de cambio entre imágenes en ms
    let tiempoTranscurrido = 0;

    const animacion = setInterval(() => {
        const tiradaTemp = parseInt(Math.random() * 6 + 1); // Número temporal
        IU.dado().src = `./img/dado${tiradaTemp}.png`; // Cambia la imagen temporalmente
        tiempoTranscurrido += intervalo;

        // Si el tiempo total se alcanza, se detiene la animación y muestra el resultado
        if (tiempoTranscurrido >= duracionAnimacion) {
            clearInterval(animacion); 
            IU.dado().src = `./img/dado${tirada}.png`; 
            resaltarCeldas(tirada); 
        }
    }, intervalo);
}

/* Resalta las celdas disponibles para mover el héroe.
    - Toma el resultado de la tirada y calcula las celdas accesibles en las
        direcciones vertical y horizontal (izquierda, derecha, arriba, abajo).
    - Aplica la clase "celdaResaltada" a las celdas dentro del rango permitido.
    - Evita errores al verificar que las celdas existan antes de aplicar la clase. */
function resaltarCeldas(tirada){
    const direcciones =[[-1, 0], [1, 0], [0, -1], [0, 1]];

    direcciones.forEach(d => {
        for(let i = 1; i <= tirada; i++){
            const celda = IU.celda(IU.tablero(), posicionHeroe[0] + i*d[0], posicionHeroe[1] + i*d[1]);
            if(celda) celda.className=("celdaResaltada");
        }
    })
}

/* Controlador para el evento de clic en el tablero.
    - Selecciona la celda más cercana al evento
    - Mueve el héroe a la celda seleccionada si es celdaResaltada. 
    - Se comprueba que celda no sea null para evitar errores */
function controlClickMover(ev){
        let celda = ev.target.closest("td");
        if(celda && celda.classList.contains("celdaResaltada")) moverHeroe(celda);
}

/* Verifica si el héroe ha alcanzado el objetivo.
    - Devuelve true si las posiciones coinciden, de lo contrario, false. */
function esVictoria(posicionHeroe, posicionObjetivo){
    return posicionHeroe[0] == posicionObjetivo[0] && posicionHeroe[1] == posicionObjetivo[1];
}

/* Mueve al héroe a la celda seleccionada.
    - Elimina al héroe de su posición actual y lo agrega a la nueva celda.
    - Actualiza las coordenadas del héroe.
    - Verifica si se ha alcanzado el objetivo (objetivo) y ejecuta la función de victoria.
    - Prepara el tablero para la próxima tirada. */
function moverHeroe(celda){
    const heroe = IU.heroe();
    heroe.remove();
    celda.appendChild(heroe);

    const posActual = celda.id.split("-");
    posicionHeroe[0] = parseInt(posActual[0]);
    posicionHeroe[1] = parseInt(posActual[1]);

    if((esVictoria(posicionHeroe, posicionObjetivo))) victoria();
    
    esperarTirada();
}

/* Prepara el tablero para la próxima tirada.
    - Limpia las celdas resaltadas eliminando su clase.
    - Reactiva el botón de tirar. */
function esperarTirada(){
    const celdas = Array.from(document.getElementsByClassName("celdaResaltada"));
    celdas.forEach(celda => reiniciarCelda(celda));
    IU.botonTirar().disabled = false;
}

/* Reinicia una celda resaltada.
    - Elimina la clase "celdaResaltada". */
function reiniciarCelda(celda){
    celda.classList.remove("celdaResaltada");   
}

/*----- Almacenamiento y puntuaciones -----*/

/* Serializa un mapa en una cadena de texto con formato 'clave=valor;'.
    - Convierte las entradas del mapa en pares clave-valor separados por '='.
    - Une los pares con ';' para formar la cadena final. */
function serializarMapa(mapa){
    return Array.from(mapa.entries()).map(par => par.join("=")).join(";");
}

/* Deserializa una cadena en formato 'clave=valor;' en un mapa.
    - Divide la cadena en pares clave-valor y los almacena en un mapa. */
function deserializarMapa(cadena){
    return new Map(cadena.split(";").map(par => par.split("=")));
}

/* Recupera un mapa almacenado localmente.
    - Devuelve un mapa vacío si no existe una entrada válida con la clave proporcionada. */
function recuperarMapaLocal(clave){

    let mapa = new Map();

    if(localStorage.getItem(clave)!= ("" || null)){
        mapa = deserializarMapa(localStorage.getItem(clave));
    }

    return mapa;
}

/* Guarda un valor en el almacenamiento local.
    - Maneja errores si el almacenamiento local no está accesible. */
function guardarEnLocal(clave, valor){
    try{
        localStorage.setItem(`${clave}`, `${valor}`);
    }
    catch{
        console.error("No se pudo acceder al almacenamiento local.");
    }
    
}

/* Comprueba si un usuario tiene un récord.
    - Compara el valor mínimo entre todas las puntuaciones almacenadas.
    - Devuelve true si la puntuación del usuario es igual o menor al récord. */
function esRecord(usuario){
    let mapaRecords = recuperarMapaLocal("recordTiradas");
    const record = Math.min(...Array.from(mapaRecords.values()));

    if(!isNaN(record)){
        if(mapaRecords.get(`${usuario}`) <= record){
            return true;
        }
        return false;
    }
    else return true;
}

/* Muestra una tabla de puntuaciones
    - Esconde el tablero de juego
    - Forma un array a partir de las claves almacenadas en el recordTiradas
    - Genera una tabla con filas = número de jugadores + 1 y 2 columnas
    - Rellena la tabla con las puntuaciones */
function mostrarRanking(){
    IU.contenedorJuego().style.display = "none";
    IU.botonRanking().style.display = "none";
    const ranking = recuperarMapaLocal("recordTiradas");
    
    let jugadores = Array.from(ranking.keys());
    
    let tabla = crearTabla(jugadores.length + 1 , 2);
    tabla.id = "ranking";
    IU.contenedorMensaje().insertAdjacentElement('afterend', tabla);
    IU.celda(tabla, 1, 1).innerHTML = `Jugador`;
    IU.celda(tabla, 2, 1).innerHTML = `Tiradas`;

    for(let i = 0; i < jugadores.length; i++){
        IU.celda(tabla, 1, i+2).innerHTML = jugadores[i];
        IU.celda(tabla, 2, i+2).innerHTML = ranking.get(jugadores[i]);
    }
}