/*----- Inicialización y configuración -----*/

// Definición de variables y objetos globales
let nombre = '';
let numeroTiradas = 0;
const posicionHeroe = [];
const posicionCofre = [];

/* Objeto que devuelve dinámicamente mediante métodos distintos elementos del documento 
para simplificar las instrucciones del resto de funciones. 
Esto centraliza todas las referencias al DOM para simplificar el código y facilita el 
mantenimiento en caso de cambios */
const IU = {

    //Pantallas principales
    pantallaLogin: () => document.getElementById("pantallaLogin"),
    pantallaJuego: () => document.getElementById("pantallaJuego"),

    // Formulario de login
    botonJugar: () => document.getElementById("botonJugar"),
    nombreUsuario: () => document.getElementById("nombreUsuario").value,
    mensajeLogin: () => document.getElementById("mensajeLogin"),

    // Elementos del juego
    formLogin: () => document.getElementById("formLogin"),
    contenedorTablero: () => document.getElementById("contenedorTablero"),
    tablero: () => document.getElementById("tablero"),
    contenedorDado: () => document.getElementById("contenedorDado"),
    dado: () => document.getElementById("dado"),
    botonTirar: () => document.getElementById("botonTirar"),
    mensajeJuego: () => document.getElementById("mensajeJuego"),
    contenedorJuego: () => document.getElementById("contenedorJuego"),
    contenedorBotonNuevaPartida: () => document.getElementById("contenedorBotonNuevaPartida"),

    // Gráficos
    heroe: () => document.getElementById("heroe"),
    cofre: () => document.getElementById("cofre"),

};

/* Función que valida el nombre de usuario y devuelve true o mensajes basados en los fallos de 
validación */
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

/* Función que habilita el botón jugar si el nombre de usuario es válido.
Muestra mensajes de error en caso de que el usaurio introducido no sea válido */
function iniciarJuego(){

    /* En caso de que ya exista el elemento mensaje, se elimina para evitar duplicados */
    if(IU.mensajeLogin()) IU.mensajeLogin().remove();

    const mensaje = document.createElement("p");
    mensaje.id = "mensajeLogin";

    const validacion = validarNombre(IU.nombreUsuario());

    if(validacion === true){
        IU.botonJugar().disabled = false; 
        nombre = IU.nombreUsuario();
        mensaje.textContent = `¡A luchar, héroe ${nombre}!`;
    }
    else{
        IU.botonJugar().disabled = true;
        mensaje.textContent = validacion;
    }
          
    formLogin.insertAdjacentElement('afterend', mensaje);

}

/* Función que oculta la pantalla de introducción de usuario y genera y muestra la
pantalla de juego. Recoge el nombre de usuario e inicia el número de tiradas a 0 */
function pulsarJugar(){
    IU.pantallaLogin().style.display = "none";
    nombre = IU.nombreUsuario();
    numeroTiradas = 0;

    mostrarJuego();
}

/*----- Finalización y reinicio -----*/

function victoria(){
    IU.contenedorDado().style.display = "none";

    const mensaje = IU.mensajeJuego();
    mensaje.textContent = `¡Enhorabuena ${nombre}, eres rico!\n`;

    let mapa = recuperarMapaLocal("recordTiradas");
    mapa.set(`${nombre}`, `${numeroTiradas}`);

    guardarenLocal("recordTiradas", serializarMapa(mapa));

    const mensajeRecord = document.createElement("div");
    mensajeRecord.id = "mensajeRecord";
    mensaje.insertAdjacentElement('afterend', mensajeRecord);
    
    mensaje.textContent += esRecord(nombre) ?  
        `¡Tienes el record con ${numeroTiradas} tiradas!`:
        `Has necesitado ${numeroTiradas} tiradas para encontrar el tesoro`;
    
    generarBotonNuevaPartida();
    
}
/* Función que devuelve los elementos necesarios a su estado inicial para una nueva partida */
function nuevaPartida(){
    reiniciarEstado();
    IU.pantallaJuego().style.display = "none";
    IU.pantallaLogin().style.display = "block";
    IU.contenedorDado().style.display = "block";
    IU.botonJugar().disabled = true;
    IU.formLogin().reset();

    // Eliminación de elentos si existen
    if(IU.tablero) IU.tablero().remove();
    if(IU.contenedorBotonNuevaPartida()) IU.contenedorBotonNuevaPartida().remove();
    if(IU.mensajeLogin()) IU.mensajeLogin().remove();
}

/* Reinicio de los datos de juego */
function reiniciarEstado(){
    nombre = '';
    numeroTiradas = 0;
}

/*----- Generación y gestión de la IU -----*/

/* Función que muestra la pantalla de juego y genera los elementos necesarios */
function mostrarJuego(){
    IU.pantallaJuego().style.display = "block";
    definirMensajeJuego();
    generarTablero();
    insertarGraficos();
    configurarBotonTirar();
}

/* Función que configura el mensaje mostrado durante la partida */
function definirMensajeJuego(){
    const mensaje = IU.mensajeJuego();
    mensaje.textContent = `Adelante ${nombre}, grandes riquezas te esperan...`;

}

/* Función que genera los elementos de juego (tablero, botones, elementos gráficos) */
function generarTablero(){
    const tablero = crearTabla(10,10);
    tablero.id = "tablero";
    IU.contenedorTablero().appendChild(tablero);
}

/* Función que genera una tabla de x filas e y columnas, identificado
cada celda con un string de formato "x-y" */
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

/* Función que crea los elementos gráficos del tablero de juego y los inserta
en el documento */
function insertarGraficos(){
    /* Se crean los elementos gráficos del juego, o se seleccionan si ya existen, y se
    declaran sus propiedades */

    /* Se selecciona la última celda del tablero y se extraen sus coordenadas
    para insertar el cofre en ella independientemente del tamaño del tablero */
    const ultimaCelda = IU.tablero().querySelector("tr:last-child td:last-child").id.split("-");
    
    let cofre;
    if(IU.cofre()) {
        cofre = IU.cofre();
    }  
    else {
        cofre = document.createElement("img");
        document.getElementById(`${ultimaCelda[0]}-${ultimaCelda[1]}`).appendChild(cofre);
    }
    cofre.id = "cofre"
    cofre.src = "./img/cofre.png";
    posicionCofre[0] = parseInt(ultimaCelda[0]);
    posicionCofre[1] = parseInt(ultimaCelda[1]);

    /* Se inserta el héroe en la primera celda */
    let heroe;
    if(IU.heroe()) {
        heroe = IU.heroe();
    }
    else {
        heroe = document.createElement("img");
        document.getElementById("1-1").appendChild(heroe);
    }
    heroe.id = "heroe";
    heroe.src = "./img/heroe.svg";
    posicionHeroe[0] = 1;
    posicionHeroe[1] = 1;
}

/* Función que configura los elementos del botón de tirada de dado */
function configurarBotonTirar(){
    const boton = IU.botonTirar();
    boton.removeEventListener("click", tirarDado);
    boton.addEventListener("click", tirarDado);
}

/* Función que devuelve una sección contenedora de un botón generado a partir de los parámetros */
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

/* Función que crea e inserta un botón que reinicia la partida */
function generarBotonNuevaPartida(){
    const boton = generarBoton(
        "contenedorBotonNuevaPartida", 
        "botonNuevaPartida", 
        "Jugar de nuevo", 
        nuevaPartida);
    IU.contenedorJuego().insertAdjacentElement('afterend', boton);
}

/*----- Lógica del juego -----*/

/* Función que simula una tirada de dado de 6 generando un número aleatorio,
selecciona la imagen asignada al dado, y modifica las celdas para las que la tirada
permite el movimiento */
function tirarDado(ev){
    numeroTiradas += 1;
    let tirada = parseInt(Math.random()*6 + 1);
    const imagenDado = IU.dado();
    imagenDado.src = `./img/dado${tirada}.png`;
    
    ev.currentTarget.disabled = true;
    resaltarCeldas(tirada);
}

/* Función que recoge el resultado de una tirada de dado, recoge la posición actual
del personaje, y a partir de esos datos modifica las celdas apropiadas a la tirada
asignádolas la clase "celdaResaltada" */
function resaltarCeldas(tirada){
    /* En cada eje, horizontal y vertical, se aplica la clase "celdaResaltada"
    a cada elemento de la tabla desde la posición actual hasta posición +/- tirada 
    Se controla que sólo se aplique a elementos que existen */   
    for(let i = 1; i <= tirada; i++){
 
        const celdaDerecha = document.getElementById(`${posicionHeroe[0] + i}-${posicionHeroe[1]}`);
        if(celdaDerecha)
            celdaDerecha.className=("celdaResaltada");

        const celdaIzquierda = document.getElementById(`${posicionHeroe[0]-i}-${posicionHeroe[1]}`);
        if(celdaIzquierda)
            celdaIzquierda.className=("celdaResaltada");

        const celdaSuperior = document.getElementById(`${posicionHeroe[0]}-${posicionHeroe[1] + i}`);
        if(celdaSuperior)
            celdaSuperior.className=("celdaResaltada");

        const celdaInferior = document.getElementById(`${posicionHeroe[0]}-${posicionHeroe[1]- i}`);
        if(celdaInferior)
            celdaInferior.className=("celdaResaltada");
    }

    habilitarClick();
}

/* Función que añade un event listener de click a cada celda de clase "celdaResaltada" */
function habilitarClick(){
    const celdas = document.getElementsByClassName("celdaResaltada");
     
    for (let celda of celdas){
        celda.addEventListener("click", controlClick);
    }
    
}

/* Función de control de evento en habilitarClick() */
function controlClick(ev){
    moverHeroe(ev.currentTarget);
}

function esVictoria(posicionHeroe, posicionCofre){
    return posicionHeroe[0] == posicionCofre[0] && posicionHeroe[1] == posicionCofre[1];
}

/* Función que elimina el gráfico del personaje de su posición actual, lo coloca
en la celda que ha sido pulsada, comprueba si se ha alcanzado el objetivo, en cuyo caso
ejecuta la función victoria(), y ejecuta la función esperarTirada() */
function moverHeroe(celda){
    const heroe = IU.heroe();
    heroe.remove();
    celda.appendChild(heroe);

    const posActual = celda.id.split("-");
    posicionHeroe[0] = parseInt(posActual[0]);
    posicionHeroe[1] = parseInt(posActual[1]);

    if((esVictoria(posicionHeroe, posicionCofre))) victoria();
    
    esperarTirada();
}

/* Función que reinicia el tablero a la espera de una tirada ejecutando
la función reiniciarCelda() para cada celda resaltada */
function esperarTirada(){
    const celdas = Array.from(document.getElementsByClassName("celdaResaltada"));
    celdas.forEach(celda => reiniciarCelda(celda));
    IU.botonTirar().disabled = false;
    
}

/* Función que reinicia una celda eliminando su clase "celdaResaltada" y
el event listener de click en el mapa */
function reiniciarCelda(celda){
    celda.removeEventListener("click", controlClick);
    celda.classList.remove("celdaResaltada");
    
}

/*----- Almacenamiento y puntuaciones -----*/

/* Función que genera una cadena de caracteres a partir de un mapa con formato
'clave=valor;' */
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

/* Función que genera un mapa a partir del valor de una entrada tipo cadena de caracteres
en formato 'clave=valor;' */
function deserializarMapa(entrada){
    let mapa = new Map();   
    entrada = entrada.split(";");
   
    for(let el of entrada){
        el = el.split("=");
        mapa.set(el[0], el[1]);
    }

    return mapa;
}

/* Función que recoge un mapa guardado en el almacenamiento local con clave "entrada", o devuelve
un mapa vacío si la clave no existe o está vacía */
function recuperarMapaLocal(clave){

    let mapa = new Map();

    if(localStorage.getItem(clave)!= "" && localStorage.getItem(clave) != null){
        mapa = deserializarMapa(localStorage.getItem(clave));
    }

    return mapa;
}

/* Función que guarda una entrada en el almacenamiento local si es accesible */
function guardarenLocal(clave, valor){
    try{
        localStorage.setItem(`${clave}`, `${valor}`);
    }
    catch{
        console.error("No se pudo acceder al almacenamiento local.");
    }
    
}

/* Función que compara la entrada con el valor mínimo de todas las puntuaciones almacenadas
localmente, devuelve true si la entrada es igual al valor mínimo, flase si no */
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


