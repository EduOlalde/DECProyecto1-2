/*----- Inicialización y configuración -----*/

// Definición del objeto datosJuego
function datosJuego(){
    this.nombre;
    this.numeroTiradas = 0;
}

/* Función que valida el nombre de usuario */
function validarNombre(input){  
    return /^[A-Za-z]{4,}$/.test(input);
}

/* Función que habilita el botón jugar si el nombre de usuario es válido.
Muestra mensajes de error en caso de que el usaurio introducido no sea válido */
function iniciarJuego(){
    let boton = document.getElementById("botonJugar");
    let formLogin = document.getElementById("nombreUsuario");

    /* En caso de que ya exista el elemento mensaje, se elimina para evitar duplicados */
    if(document.getElementById("mensajeLogin")) {
        const mensaje = document.getElementById("mensajeLogin");
        mensaje.remove();
    }

    const mensaje = document.createElement("p");
    mensaje.id = "mensajeLogin";

    if(validarNombre(formLogin.value)){
        boton.disabled = false; 
        mensaje.textContent = `¡A luchar, héroe ${formLogin.value}!`;
    }
    else{
        boton.disabled = true;
        if(/\d/.test(formLogin.value)){ 
            mensaje.textContent = "Números no permitidos";
        }
        else
            mensaje.textContent = "El nombre debe tener 4 o más letras"; 
    }
          
    formLogin.insertAdjacentElement('afterend', mensaje);

}

/* Función que oculta la pantalla de introducción de usuario y genera y muestra la
pantalla de juego. Recoje el nombre de usuario en el objeto datosJuego */
function pulsarJugar(){
    document.getElementById("pantallaLogin").style.display = "none";
    datosJuego.nombre = document.getElementById("nombreUsuario").value;
    datosJuego.numeroTiradas = 0;

    let contenedor = document.createElement("div");
    contenedor.id = "pantallaJuego";
    document.body.appendChild(contenedor);

    generarTablero();
    generarBotonTirar();
    generarMensajeJuego();

}

/*----- Generación y gestión de la interfaz -----*/

function generarMensajeJuego(){
    let contenedorMensaje = document.createElement("div");
    contenedorMensaje.id = "contenedorMensaje";

    let mensaje = document.createElement("h2");
    mensaje.id = "mensajeJuego";
    mensaje.textContent = `Adelante ${datosJuego.nombre}, grandes riquezas te esperan...`;
    contenedorMensaje.appendChild(mensaje);

    contenedorJuego.insertAdjacentElement('beforeBegin', contenedorMensaje);

}

function generarBotonNuevaPartida(){
    let contenedor = document.createElement("div");
    contenedor.id = "contenedorBotonNuevaPartida";

    let boton = document.createElement("button");
    boton.id = "botonNuevaPartida";
    boton.type = "button";
    boton.textContent = "Jugar de nuevo";
    boton.addEventListener("click", nuevaPartida);
    contenedor.appendChild(boton);

    document.getElementById("contenedorJuego").insertAdjacentElement('afterend', contenedor);
}

/* Función que genera una tabla de x filas e y columnas, identificado
cada celda con un string de formato "x-y" */
function crearTabla(x, y){
    const tabla = document.createElement("table");

    for(let i=1; i <= x; i++){
        let fila = document.createElement("tr");
        for(let j=1; j <= y; j++){
            let celda = document.createElement("td");
            celda.id = `${i}-${j}`;
            celda.textContent = ``;

            fila.appendChild(celda);
        }
        tabla.appendChild(fila);
    }

    return tabla;
}

/* Función que genera los elementos de juego (tablero, botones, elementos gráficos) */
function generarTablero(){
    const contenedorJuego = document.createElement("div");
    contenedorJuego.id = "contenedorJuego";

    const tablero = crearTabla(10,10);
    tablero.id = "tablero";
    contenedorJuego.appendChild(tablero);

    document.getElementById("pantallaJuego").appendChild(contenedorJuego);

    insertarGraficos();
}

/* Función que crea los elementos gráficos del tablero de juego y los inserta
en el documento */
function insertarGraficos(){
    /* Se selecciona la última celda del tablero y se extraen sus coordenadas
    para insertar el cofre en ella independientemente del tamaño del tablero */
    let ultimaCelda = document.querySelector("#tablero tr:last-child td:last-child").id.split("-");
    let celdaCofre = document.getElementById(`${ultimaCelda[0]}-${ultimaCelda[1]}`);

    let celdaInicio = document.getElementById("1-1");

    let cofre = document.createElement("img");
    cofre.id = "cofre"
    cofre.src = "./img/cofre.png";
    cofre.setAttribute("posicion", `${ultimaCelda[0]}-${ultimaCelda[1]}`);

    let heroe = document.createElement("img");
    heroe.id = "heroe";
    heroe.src = "./img/heroe.svg";
    heroe.setAttribute("posicion", `1-1`);

    celdaCofre.appendChild(cofre);
    celdaInicio.appendChild(heroe);
}

/* Función que genera los elementos del botón de tirada de dado y los inserta
en el documento */
function generarBotonTirar(){
    let contenedorDados = document.createElement("div");
    contenedorDados.id = "contenedorDado";

    let imagenDado = document.createElement("img");
    imagenDado.id = "dado";
    contenedorDados.appendChild(imagenDado);

    let boton = document.createElement("button");
    boton.id = "botonTirar";
    boton.type = "button";
    boton.textContent = "Tirar";
    boton.addEventListener("click", tirarDado);
    contenedorDados.appendChild(boton);

    document.getElementById("contenedorJuego").appendChild(contenedorDados);
}



/*----- Lógica del juego -----*/

/* Función que simula una tirada de dado de 6 generando un número aleatorio,
selecciona la imagen asignada al dado, y modifica las celdas para las que la tirada
permite el movimiento */
function tirarDado(ev){
    datosJuego.numeroTiradas += 1;
    let tirada = parseInt(Math.random()*6 + 1);
    let imagenDado = document.getElementById("dado");
    imagenDado.src = `./img/dado${tirada}.png`;
    
    ev.currentTarget.disabled = true;
    resaltarCeldas(tirada);
}

/* Función que recoje el resultado de una tirada de dado, recoje la posición actual
del personaje, y a partir de esos datos modifica las celdas apropiadas a la tirada
asignádolas la clase "celdaResaltada" */
function resaltarCeldas(tirada){
    /* Se recoje el elemento img del personaje */
    let heroe = document.getElementById("heroe");
    /* Se recoje en formato numérico en un array la posición actual del héroe
    en el mapa */
    let posHeroe = heroe.getAttribute("posicion").split("-");
    posHeroe = [parseInt(posHeroe[0]), parseInt(posHeroe[1])];

    /* En cada eje, horizontal y vertical, se aplica la clase "celdaResaltada"
    a cada elemento de la tabla desde la posición actual hasta posición +/- tirada 
    Se controla que sólo se aplique a elementos que existen */   
    for(let i = 1; i <= tirada; i++){
 
        let celdaDerecha = document.getElementById(`${posHeroe[0] + i}-${posHeroe[1]}`);
        if(celdaDerecha)
            celdaDerecha.className=("celdaResaltada");

        let celdaIzquierda = document.getElementById(`${posHeroe[0]-i}-${posHeroe[1]}`);
        if(celdaIzquierda)
            celdaIzquierda.className=("celdaResaltada");

        let celdaSuperior = document.getElementById(`${posHeroe[0]}-${posHeroe[1] + i}`);
        if(celdaSuperior)
            celdaSuperior.className=("celdaResaltada");

        let celdaInferior = document.getElementById(`${posHeroe[0]}-${posHeroe[1]- i}`);
        if(celdaInferior)
            celdaInferior.className=("celdaResaltada");
    }

    habilitarClick();
}

/* Función que añade un event listener de click a cada celda de clase "celdaResaltada" */
function habilitarClick(){
    let celdas = document.getElementsByClassName("celdaResaltada");
     
    for (let celda of celdas){
        celda.addEventListener("click", controlClick);
    }
    
}

/* Función de control de evento en habilitarClick() */
function controlClick(ev){
    moverHeroe(ev.currentTarget);
}

/* Función que elimina el gráfico del personaje de su posición actual, lo coloca
en la celda que ha sido pulsada, y ejecuta la función esperarTirada() */
function moverHeroe(celda){
    let heroe = document.getElementById("heroe");
    heroe.remove();
    celda.appendChild(heroe);

    let posHeroe= celda.id.split("-");
    heroe.setAttribute("posicion", `${posHeroe[0]}-${posHeroe[1]}`);

    let posCofre = document.getElementById("cofre").getAttribute("posicion").split("-");

    if((posHeroe[0] == posCofre[0]) && (posHeroe[1] == posCofre[1])){
        victoria();
    }
    
    esperarTirada();
}

/* Función que reinicia el tablero a la espera de una tirada ejecutando
la función reiniciarCelda() para cada celda resaltada */
function esperarTirada(){
    let celdas = Array.from(document.getElementsByClassName("celdaResaltada"));
    for(let celda of celdas) reiniciarCelda(celda);
    document.getElementById("botonTirar").disabled = false;
    
}

/* Función que reinicia una celda eliminando su clase "celdaResaltada" y
el event listener de click en el mapa */
function reiniciarCelda(celda){
    celda.removeEventListener("click", controlClick);
    celda.classList.remove("celdaResaltada");
    
}


/*----- Finalización y reinicio -----*/

function victoria(){
    document.getElementById("contenedorDado").style.display = "none";

    let mensaje = document.getElementById("mensajeJuego");
    mensaje.textContent = `¡Enhorabuena ${datosJuego.nombre}, eres rico!`;

    let mapa = recuperarMapaLocal("recordTiradas");
    mapa.set(`${datosJuego.nombre}`, `${datosJuego.numeroTiradas}`);

    guardarenLocal("recordTiradas", serializarMapa(mapa));

    let mensajeRecord = document.createElement("div");
    mensajeRecord.id = "mensajeRecord";
    mensaje.insertAdjacentElement('afterend', mensajeRecord);
    
    mensajeRecord.textContent = esRecord(datosJuego.nombre) ?  
        `¡Tienes el record con ${datosJuego.numeroTiradas} tiradas!`:
        `Has necesitado ${datosJuego.numeroTiradas} tiradas para encontrar el tesoro`;
    
    generarBotonNuevaPartida();
    
}

function nuevaPartida(){
    document.getElementById("pantallaJuego").remove();
    document.getElementById("mensajeLogin").remove();
    document.getElementById("formLogin").reset();
    document.getElementById("pantallaLogin").style.display = "block";

    datosJuego.nombre = '';
    datosJuego.numeroTiradas = 0;
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

/* Función que recoje un mapa guardado en el almacenamiento local con clave "entrada", o devuelve
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
    catch(e){
        console.log("Almacenamiento local inaccesible.");
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


