/* Función que valida el nombre de usuario */
function validarNombre(input){  
    return /^[A-Za-z]{4,}$/.test(input);
}

/* Función que habilita el botón jugar si el nombre de usuario es válido.
Muestra mensajes de error en caso de que el usaurio introducido no sea válido */
function habilitarJugar(){
    let boton = document.getElementById("botonJugar");
    let formNombre = document.getElementById("nombreUsuario");

    /* En caso de que ya exista el elemento mensaje, se elimina para evitar duplicados */
    if(document.getElementById("mensajeBienvenida")) {
        const mensaje = document.getElementById("mensajeBienvenida");
        mensaje.remove();
    }

    const mensajeBienvenida = document.createElement("p");
    mensajeBienvenida.id = "mensajeBienvenida";

    if(validarNombre(formNombre.value)){
        boton.disabled = false; 
        mensajeBienvenida.textContent = `¡A luchar, héroe ${formNombre.value}!`;
    }
    else{
        boton.disabled = true;
        if(/\d/.test(formNombre.value)) 
            mensajeBienvenida.textContent = "Números no permitidos";
        else
            mensajeBienvenida.textContent = "El nombre debe tener 4 o más letras"; 
    }
          
    formNombre.insertAdjacentElement('afterend', mensajeBienvenida);

}

function pulsarJugar(){
    console.log("holaquetal");
}