/* Función que valida el nombre de usuario */
function validarNombre(input){  
    return /^[A-Za-z]{4,}$/.test(input);
}

/* Función que habilita el botón jugar si el nombre de usuario es válido.
Muestra mensajes de error en caso de que el usaurio introducido no sea válido */
function iniciarJuego(){
    let boton = document.getElementById("botonJugar");
    let formNombre = document.getElementById("nombreUsuario");

    /* En caso de que ya exista el elemento mensaje, se elimina para evitar duplicados */
    if(document.getElementById("mensaje")) {
        const mensaje = document.getElementById("mensaje");
        mensaje.remove();
    }

    const mensaje = document.createElement("p");
    mensaje.id = "mensaje";

    if(validarNombre(formNombre.value)){
        boton.disabled = false; 
        mensaje.textContent = `¡A luchar, héroe ${formNombre.value}!`;
    }
    else{
        boton.disabled = true;
        if(/\d/.test(formNombre.value)){ 
            mensaje.textContent = "Números no permitidos";
        }
        else
            mensaje.textContent = "El nombre debe tener 4 o más letras"; 
    }
          
    formNombre.insertAdjacentElement('afterend', mensaje);

}

/* Función que oculta la pantalla de introducción de usuario y genera y muestra la
pantalla de juego */
function pulsarJugar(){
    document.getElementById("login").style.display = "none";

    generarTablero();
    generarBotonTirar();

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

    document.body.appendChild(contenedorJuego);

    insertarGraficos();
}

/* Función que crea los elementos gráficos del tablero de juego y los inserta
en el documento */
function insertarGraficos(){
    let celdaCofre = document.getElementById("10-10");
    let celdaInicio = document.getElementById("1-1");

    let imgCofre = document.createElement("img");
    imgCofre.id = "graficoCofre"
    imgCofre.src = "./img/cofre.png";

    let imgHeroe = document.createElement("img");
    imgHeroe.id = "graficoHeroe";
    imgHeroe.src = "./img/heroe.svg";
    imgHeroe.setAttribute("posicionx", 1);
    imgHeroe.setAttribute("posiciony", 1);

    celdaCofre.appendChild(imgCofre);
    celdaInicio.appendChild(imgHeroe);
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
    boton.addEventListener("click", () => tirarDado());
    contenedorDados.appendChild(boton);

    document.getElementById("contenedorJuego").appendChild(contenedorDados);
}

/* Función que simula una tirada de dado de 6 generando un número aleatorio,
selecciona la imagen asignada al dado, y modifica las celdas para las que la tirada
permite el movimiento */
function tirarDado(){
    let tirada = parseInt(Math.random()*6 + 1);
    let imagenDado = document.getElementById("dado");

    switch(tirada){
        case 1: 
            imagenDado.src = "./img/dado1.png";
            break;
        case 2: 
            imagenDado.src = "./img/dado2.png";
            break;
        case 3: 
            imagenDado.src = "./img/dado3.png";
            break;
        case 4: 
            imagenDado.src = "./img/dado4.png";
            break;
        case 5: 
            imagenDado.src = "./img/dado5.png";
            break;
        case 6: 
            imagenDado.src = "./img/dado6.png";
            break;

    }

    resaltarCeldas(tirada);
}

/* Función que recoje el resultado de una tirada de dado, recoje la posición actual
del personaje, y a partir de esos datos modifica las celdas apropiadas a la tirada
asignádolas la clase "celdaResaltada" */
function resaltarCeldas(tirada){
    /* Se recoje el elemento img del personaje */
    let heroe = document.getElementById("graficoHeroe");
    /* Se recoje en formato numérico en un array la posición actual de la imagen
    en el mapa */
    let posActual = [parseInt(heroe.getAttribute("posicionx")), 
        parseInt(heroe.getAttribute("posiciony"))];

    /* En cada eje, horizontal y vertical, se aplica la clase "celdaResaltada"
    a cada elemento de la tabla desde la posición actual hasta posición +/- tirada 
    Se controla que sólo se aplique a elementos que existen */   
    for(let i = 1; i <= tirada; i++){
 
        let celdaDerecha = document.getElementById(`${posActual[0] + i}-${posActual[1]}`);
        if(celdaDerecha)
            celdaDerecha.className=("celdaResaltada");

        let celdaIzquierda = document.getElementById(`${posActual[0]-i}-${posActual[1]}`);
        if(celdaIzquierda)
            celdaIzquierda.className=("celdaResaltada");

        let celdaSuperior = document.getElementById(`${posActual[0]}-${posActual[1] + i}`);
        if(celdaSuperior)
            celdaSuperior.className=("celdaResaltada");

        let celdaInferior = document.getElementById(`${posActual[0]}-${posActual[1]- i}`);
        if(celdaInferior)
            celdaInferior.className=("celdaResaltada");


    }

    habilitarClick();
}

/* Función que añade un event listener de click a cada celda de clase "celdaResaltada" */
function habilitarClick(){
    let celdas = document.getElementsByClassName("celdaResaltada");
     
    for (let celda of celdas){
        celda.addEventListener("click", () => controlClick(celda));
    }
    
}

/* Función de control de evento en habilitarClick() */
function controlClick(celda){
    moverHeroe(celda);
}

/* Función que elimina el gráfico del personaje de su posición actual, lo coloca
en la celda que ha sido pulsada, y ejecuta la función esperarTirada() */
function moverHeroe(celda){
    let heroe = document.getElementById("graficoHeroe");
    heroe.remove();
    celda.appendChild(heroe);

    let posActual= celda.id.split("-");
    heroe.setAttribute("posicionx", posActual[0]);
    heroe.setAttribute("posiciony", posActual[1]);
    
    esperarTirada();
}

/* Función que reinicia el tablero a la espera de una tirada ejecutando
la función reiniciarCelda() para cada celda resaltada */
function esperarTirada(){
    let celdas = Array.from(document.getElementsByClassName("celdaResaltada"));
    for(let celda of celdas) reiniciarCelda(celda);
    
}

/* Función que reinicia una celda eliminando su clase "celdaResaltada" y
el event listener de click en el mapa */
function reiniciarCelda(celda){
    celda.removeEventListener("click", controlClick);
    celda.classList.remove("celdaResaltada");
    
}