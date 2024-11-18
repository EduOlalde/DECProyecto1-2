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
    IU.botonValidar().addEventListener("click", iniciarJuego);
    IU.botonJugar().addEventListener("click", pulsarJugar);
}

/* OObjeto para acceder dinámicamente a elementos del DOM.
   Centraliza todas las referencias al DOM, facilitando su mantenimiento. */
const IU = {

    //Pantallas principales
    pantallaLogin: () => document.getElementById("pantallaLogin"),
    pantallaJuego: () => document.getElementById("pantallaJuego"),

    // Formulario de login
    botonJugar: () => document.getElementById("botonJugar"),
    botonValidar: () => document.getElementById("botonValidar"),
    nombreUsuario: () => document.getElementById("nombreUsuario").value,
    mensajeLogin: () => document.getElementById("mensajeLogin"),

    // Elementos del juego
    formLogin: () => document.getElementById("formLogin"),
    contenedorTablero: () => document.getElementById("contenedorTablero"),
    tablero: () => document.getElementById("tablero"),
    celda: (x,y) => document.getElementById(`${x}-${y}`),
    contenedorDado: () => document.getElementById("contenedorDado"),
    dado: () => document.getElementById("dado"),
    botonTirar: () => document.getElementById("botonTirar"),
    mensajeJuego: () => document.getElementById("mensajeJuego"),
    contenedorJuego: () => document.getElementById("contenedorJuego"),
    contenedorBotonNuevaPartida: () => document.getElementById("contenedorBotonNuevaPartida"),

    // Gráficos
    heroe: () => document.getElementById("heroe"),
    objetivo: () => document.getElementById("objetivo"),

};

/* Valida el nombre de usuario y devuelve un mensaje de error `true` si es válido */
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
Recoge el nombre de usuario y reinicia el contador de tiradas */
function pulsarJugar(){
    IU.pantallaLogin().style.display = "none";
    nombre = IU.nombreUsuario();
    numeroTiradas = 0;

    mostrarJuego();
}

/*----- Finalización y reinicio -----*/

/* Muestra el mensaje de victoria, registra la puntuación y permite iniciar una nueva partida. */
function victoria(){
    IU.contenedorDado().style.display = "none";

    const mensaje = IU.mensajeJuego();
    mensaje.innerHTML = `¡Lo conseguiste, ${nombre}, Gollum ha encontrado el Anillo!<br>`;

    let mapa = recuperarMapaLocal("recordTiradas");
    mapa.set(`${nombre}`, `${numeroTiradas}`);

    guardarEnLocal("recordTiradas", serializarMapa(mapa));

    const mensajeRecord = document.createElement("div");
    mensajeRecord.id = "mensajeRecord";
    mensaje.insertAdjacentElement('afterend', mensajeRecord);
    
    mensaje.innerHTML += esRecord(nombre) ?  
        `¡Nadie ha sido más rápido!<br>¡Sólo necesitaste ${numeroTiradas} tiradas!`:
        `Has necesitado ${numeroTiradas} tiradas para mostrarle el camino.`;
    
    generarBotonNuevaPartida();
    
}
/* Reinicia la partida al estado inicial. */
function nuevaPartida(){
    reiniciarEstado();
    IU.pantallaJuego().style.display = "none";
    IU.pantallaLogin().style.display = "flex";
    IU.contenedorDado().style.display = "flex";
    IU.dado().src = "./img/placeholderDado.png"
    IU.botonJugar().disabled = true;
    IU.formLogin().reset();

    // Eliminación de elentos si existen
    if(IU.tablero) IU.tablero().remove();
    if(IU.contenedorBotonNuevaPartida()) IU.contenedorBotonNuevaPartida().remove();
    if(IU.mensajeLogin()) IU.mensajeLogin().remove();
}

/* Restablece los datos del juego a sus valores iniciales. */
function reiniciarEstado(){
    nombre = '';
    numeroTiradas = 0;
}

/*----- Generación y gestión de la IU -----*/

/* Función que muestra la pantalla de juego al usuario.
   Genera los elementos necesarios para la partida: tablero, gráficos,
   y configura el mensaje y el botón de tirar el dado. */
function mostrarJuego(){
    IU.pantallaJuego().style.display = "flex";
    definirMensajeJuego();
    generarTablero();
    insertarGraficos();
    configurarBotonTirar();
}

/* Configura el mensaje principal mostrado durante la partida */
function definirMensajeJuego(){
    const mensaje = IU.mensajeJuego();
    mensaje.innerHTML = `Solo tú puedes guiar a Gollum, ${nombre}.<br>`
        + `Tira el dado y muéstrale el camino.`;

}

/* Genera el tablero de juego con un tamaño de 10x10 celdas.
   Asigna un ID único a cada celda con el formato "x-y" para facilitar su manejo. */
function generarTablero(){
    const tablero = crearTabla(10,10);
    tablero.id = "tablero";
    IU.contenedorTablero().appendChild(tablero);
}

/* Crea dinámicamente una tabla HTML con un tamaño de x filas por y columnas.
   Cada celda recibe un ID único en el formato "x-y". */
function crearTabla(x, y){
    let cadenaTabla = '';
    
    for(let i=1; i <= x; i++){
        cadenaTabla += '<tr>';
        for(let j=1; j <= y; j++){
            cadenaTabla += `<td id="${i}-${j}"></td>`;
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
   Actualiza las posiciones iniciales de ambos elementos en sus respectivas variables. */
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
        document.getElementById(`${ultimaCelda[0]}-${ultimaCelda[1]}`).appendChild(objetivo);
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
        document.getElementById("1-1").appendChild(heroe);
    }
    heroe.id = "heroe";
    heroe.src = "./img/gollum.png";
    posicionHeroe[0] = 1;
    posicionHeroe[1] = 1;
}

/* Configura el botón de tirar el dado:
   - Quita evento previo asociado al botón para prevenir errores.
   - Añade un nuevo event listener que ejecuta la función tirarDado() al ser pulsado. */
function configurarBotonTirar(){
    const boton = IU.botonTirar();
    boton.removeEventListener("click", tirarDado);
    boton.addEventListener("click", tirarDado);
}

/* Crea un contenedor que incluye un botón dinámico basado en los parámetros recibidos.
   - contenedorID: ID único para el contenedor.
   - botonID: ID único para el botón.
   - texto: Texto mostrado en el botón.
   - funcionDisparada: Función que se ejecuta al pulsar el botón.
   Devuelve el contenedor con el botón incluido. */
function generarBoton(contenedorID, botonID, texto, funcionDisparada){
    const contenedor = document.createElement("div");
    contenedor.id = contenedorID;

    const boton = document.createElement("button");
    boton.id = botonID;
    boton.type = "button";
    boton.textContent = texto;
    boton.addEventListener("click", funcionDisparada);
    contenedor.appendChild(boton);

    return contenedor;
}

/* Genera un botón que permite iniciar una nueva partida al finalizar la actual.
   El botón se inserta en el documento junto al contenedor de juego. */
function generarBotonNuevaPartida(){
    const boton = generarBoton(
        "contenedorBotonNuevaPartida", 
        "botonNuevaPartida", 
        "Jugar de nuevo", 
        nuevaPartida);
    IU.contenedorJuego().insertAdjacentElement('afterend', boton);
}

/*----- Lógica del juego -----*/

/* Simula el lanzamiento de un dado.
   - Genera un número aleatorio entre 1 y 6.
   - Actualiza la imagen del dado en la interfaz.
   - Desactiva temporalmente el botón de tirar.
   - Resalta las celdas disponibles según el número obtenido. */
function tirarDado(ev){
    numeroTiradas += 1;
    let tirada = parseInt(Math.random()*6 + 1);
    IU.dado().src = `./img/dado${tirada}.png`;
    
    ev.currentTarget.disabled = true;
    resaltarCeldas(tirada);
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
            const celda = IU.celda(posicionHeroe[0] + i*d[0], posicionHeroe[1] + i*d[1]);
            if(celda) celda.className=("celdaResaltada");
        }
    })

    habilitarClick();
}

/* Activa la funcionalidad de click en celdas resaltadas.
   - Agrega un event listener de click a cada celda con la clase "celdaResaltada".
   - Permite mover al héroe al hacer click en una celda válida. */
function habilitarClick(){
    const celdas = document.getElementsByClassName("celdaResaltada");
     
    for (let celda of celdas){
        celda.addEventListener("click", controlClick);
    }
    
}

/* Controlador para el evento de clic en celdas resaltadas.
   - Mueve el héroe a la celda seleccionada. */
function controlClick(ev){
    moverHeroe(ev.currentTarget);
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
   - Limpia las celdas resaltadas eliminando su clase y event listeners.
   - Reactiva el botón de tirar. */
function esperarTirada(){
    const celdas = Array.from(document.getElementsByClassName("celdaResaltada"));
    celdas.forEach(celda => reiniciarCelda(celda));
    IU.botonTirar().disabled = false;
    
}

/* Reinicia una celda resaltada.
   - Elimina la clase "celdaResaltada".
   - Quita el event listener de clic. */
function reiniciarCelda(celda){
    celda.removeEventListener("click", controlClick);
    celda.classList.remove("celdaResaltada");
    
}

/*----- Almacenamiento y puntuaciones -----*/

/* Serializa un mapa en una cadena de texto con formato 'clave=valor;'.
   - Convierte las entradas del mapa en pares clave-valor separados por '='.
   - Une los pares con ';' para formar la cadena final. */
function serializarMapa(mapa){

    let itrMapa = mapa.entries();
    let sigPar = itrMapa.next();
    let aPar = [];

    while(!sigPar.done){
        aPar.push(sigPar.value);  
        sigPar = itrMapa.next();
    }

    let aPar2 = [];

    for (let i=0; i < aPar.length; i++){
        aPar2.push(aPar[i].join("="));
    }

    cadena = aPar2.join(";");

    return cadena;
}

/* Deserializa una cadena en formato 'clave=valor;' en un mapa.
   - Divide la cadena en pares clave-valor y los almacena en un mapa. */
function deserializarMapa(entrada){
    let mapa = new Map();   
    entrada = entrada.split(";");
   
    for(let el of entrada){
        el = el.split("=");
        mapa.set(el[0], el[1]);
    }

    return mapa;
}

/* Recupera un mapa almacenado localmente.
   - Devuelve un mapa vacío si no existe una entrada válida con la clave proporcionada. */
function recuperarMapaLocal(clave){

    let mapa = new Map();

    if(localStorage.getItem(clave)!= "" && localStorage.getItem(clave) != null){
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
        else
            return false;
    }
    else return true;

}