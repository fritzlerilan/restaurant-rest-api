let cliente = {
    mesa: "",
    hora: "",
    pedido: [],
};

const categorias = {
    1: "Comida",
    2: "Bebidas",
    3: "Postres",
};
const contenidoResumen = document.querySelector("#resumen .contenido");
const btnGuardarCliente = document.querySelector("#guardar-cliente");
btnGuardarCliente.addEventListener("click", guardarCliente);

function guardarCliente() {
    const mesa = document.querySelector("#mesa").value;
    const hora = document.querySelector("#hora").value;

    // Revisar si hay campos vacios
    const camposVacios = [mesa, hora].some((campo) => campo === "");

    if (camposVacios) {
        // Verificar si ya existe alerta
        const existeAlerta = document.querySelector(".invalid-feedback");

        if (!existeAlerta) {
            const alerta = document.createElement("div");
            alerta.classList.add("invalid-feedback", "d-block", "text-center");
            alerta.textContent = "Todos los campos son obligatorios";
            document.querySelector(".modal-body form").appendChild(alerta);

            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }
        return;
    }

    cliente = { ...cliente, mesa, hora };

    //Ocultar modal
    const modalFormulario = document.querySelector("#formulario");
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    mostrarSecciones();
    obtenerPlatillos();
}

function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll(".d-none");
    seccionesOcultas.forEach((seccion) => seccion.classList.remove("d-none"));
}

function obtenerPlatillos() {
    const url = "http://localhost:3000/platillos";
    fetch(url)
        .then((response) => response.json())
        .then((data) => mostrarPlatillos(data))
        .catch();
}

function mostrarPlatillos(platillos) {
    const contenido = document.querySelector(".contenido");

    platillos.forEach((platillo) => {
        const row = document.createElement("div");
        row.classList.add("row", "py-3", "border-top");

        const nombre = document.createElement("div");
        nombre.classList.add("col-md-4");
        nombre.textContent = platillo.nombre;

        const precio = document.createElement("div");
        precio.classList.add("col-md-3", "fw-bold");
        precio.textContent = `$${platillo.precio}`;

        const categoria = document.createElement("div");
        categoria.classList.add("col-md-3");
        categoria.textContent = categorias[platillo.categoria];

        const inputCantidad = document.createElement("input");
        inputCantidad.type = "number";
        inputCantidad.min = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.value = 0;
        inputCantidad.classList.add("form-control");
        inputCantidad.onchange = function () {
            const cantidad = Number(inputCantidad.value);
            agregarPlatillo({ ...platillo, cantidad });
        };

        const agregar = document.createElement("div");
        agregar.classList.add("col-md-2");
        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);
        contenido.appendChild(row);
    });
}

function agregarPlatillo(producto) {
    // Extraer el pedido actual
    let { pedido } = cliente;
    // Revisar que la cantidad sea mayor a 0
    if (producto.cantidad > 0) {
        const existeProducto = pedido.some(
            (articulo) => articulo.id === producto.id
        );
        if (existeProducto) {
            const pedidoActualizado = pedido.map((articulo) => {
                if (articulo.id === producto.id) {
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });
            cliente.pedido = [...pedidoActualizado];
        } else {
            cliente.pedido = [...pedido, producto];
        }
    } else {
        const resultado = pedido.filter(
            (articulo) => articulo.id !== producto.id
        );
        cliente.pedido = [...resultado];
    }

    limpiarContenidoResumen();

    setResume();
}

function actualizarResumen() {
    limpiarContenidoResumen()
    const resumen = document.createElement("div");
    resumen.classList.add("col-md-6", "card", "py-2", "px-3", "shadow");

    const mesa = document.createElement("p");
    mesa.textContent = "Mesa: ";
    mesa.classList.add("fw-bold");

    const mesaSpan = document.createElement("span");
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add("fw-normal");

    const hora = document.createElement("p");
    hora.textContent = "Hora: ";
    hora.classList.add("fw-bold");

    const horaSpan = document.createElement("span");
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add("fw-normal");

    const heading = document.createElement("h3");
    heading.textContent = "Platillos consumidos";
    heading.classList.add("my-4", "text-center");

    const grupo = document.createElement("ul");
    grupo.classList.add("list-group");

    const { pedido } = cliente;
    pedido.forEach((articulo) => {
        const { nombre, cantidad, precio, id } = articulo;
        const lista = document.createElement("li");
        lista.classList.add("list-group-item");

        const nombreEl = document.createElement("h4");
        nombreEl.classList.add("my-4");
        nombreEl.textContent = nombre;

        const cantidadEl = document.createElement("p");
        cantidadEl.classList.add("fw-bold");
        cantidadEl.textContent = "Cantidad: ";

        const cantidadValor = document.createElement("span");
        cantidadValor.classList.add("fw-normal");
        cantidadValor.textContent = cantidad;

        const precioEl = document.createElement("p");
        precioEl.classList.add("fw-bold");
        precioEl.textContent = "Precio: ";

        const precioValor = document.createElement("span");
        precioValor.classList.add("fw-normal");
        precioValor.textContent = `$${precio}`;

        const subtotalEl = document.createElement("p");
        subtotalEl.classList.add("fw-bold");
        subtotalEl.textContent = "Subtotal: ";

        const subtotalValor = document.createElement("span");
        subtotalValor.classList.add("fw-normal");
        subtotalValor.textContent = `$${calcularSubtotal(precio, cantidad)}`;

        const btnEliminar = document.createElement("button");
        btnEliminar.classList.add("btn", "btn-danger");
        btnEliminar.textContent = "Eliminar del pedido";
        btnEliminar.onclick = function () {
            eliminarProducto(id);
        };

        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);

        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        grupo.appendChild(lista);
    });

    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenidoResumen.appendChild(resumen);

    formularioPropinas();
}

function limpiarContenidoResumen() {
    while (contenidoResumen.hasChildNodes()) {
        contenidoResumen.firstChild.remove();
    }
}

function calcularSubtotal(precio, cantidad) {
    return precio * cantidad;
}

function eliminarProducto(id) {
    let { pedido } = cliente;
    const actualizado = pedido.filter((articulo) => articulo.id !== id);
    cliente.pedido = [...actualizado];

    document.querySelector(`#producto-${id}`).value = 0;
    setResume();
    if(document.querySelector('[type=radio]:checked')){
        calcularPropina();
    }
}

function mensajePedidoVacio() {
    const texto = document.createElement("p");
    texto.classList.add("text-center");
    texto.textContent = "Añade los elementos del pedido";

    contenidoResumen.appendChild(texto);
}

function setResume() {
    if (cliente.pedido.length) {
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }
}

function formularioPropinas() {
    const formulario = document.createElement("div");
    formulario.classList.add("col-md-6", "formulario");

    const divFormulario = document.createElement("div");
    divFormulario.classList.add("card", "py-2", "shadow", "px-3");

    const heading = document.createElement("h3");
    heading.classList.add("my-4", "text-center");
    heading.textContent = "Propina: ";

    formulario.appendChild(divFormulario);

    const radio10 = createRadioButtonPropina(10);
    const radio20 = createRadioButtonPropina(25);
    const radio30 = createRadioButtonPropina(50);

    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10);
    divFormulario.appendChild(radio20);
    divFormulario.appendChild(radio30);
    contenidoResumen.appendChild(formulario);
}

function createRadioButtonPropina(porcentaje) {
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "propina";
    radio.value = `${porcentaje}`;
    radio.classList.add("form-check-input");
    radio.onclick = calcularPropina;

    const radioLabel = document.createElement("label");
    radioLabel.textContent = `${porcentaje}%`;
    radioLabel.classList.add("form-check-label");

    const radioDiv = document.createElement("div");
    radioDiv.classList.add("form-check");

    radioDiv.appendChild(radio);
    radioDiv.appendChild(radioLabel);

    return radioDiv;
}
function calcularPropina() {
    limpiarTotales();
    const { pedido } = cliente;
    let subtotal = 0;

    pedido.forEach((articulo) => {
        subtotal += articulo.cantidad * articulo.precio;
    });
    const propina = subtotal * (parseInt(document.querySelector('[type=radio]:checked').value) / 100);

    const total = subtotal + propina;

    mostrarTotalHTML(subtotal, total, propina);
}

function mostrarTotalHTML(subtotal, total, propina) {
    const divTotales = document.createElement("div");
    divTotales.classList.add("total-pagar");

    const subtotalParrafo = document.createElement("p");
    subtotalParrafo.classList.add("fs-3", "fw-bold", "mt-5");
    subtotalParrafo.textContent = "Subtotal Consumo: ";

    const subtotalSpan = document.createElement("span");
    subtotalSpan.classList.add("fw-normal");
    subtotalSpan.textContent = `$${subtotal}`;

    subtotalParrafo.appendChild(subtotalSpan);

    const propinaParrafo = document.createElement("p");
    propinaParrafo.classList.add("fs-3", "fw-bold", "mt-5");
    propinaParrafo.textContent = "Propina: ";

    const propinaSpan = document.createElement("span");
    propinaSpan.classList.add("fw-normal");
    propinaSpan.textContent = `$${propina}`;

    propinaParrafo.appendChild(propinaSpan);

    const totalParrafo = document.createElement("p");
    totalParrafo.classList.add("fs-3", "fw-bold", "mt-5");
    totalParrafo.textContent = "Total Consumo: ";

    const totalSpan = document.createElement("span");
    totalSpan.classList.add("fw-normal");
    totalSpan.textContent = `$${total}`;

    totalParrafo.appendChild(totalSpan);

    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector(".formulario");
    formulario.appendChild(divTotales);
}

function limpiarTotales() {
    const totales = document.querySelector(".total-pagar");
    if (totales) {
        totales.remove();
    }
}
