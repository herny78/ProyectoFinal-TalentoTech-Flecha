// Cargar productos desde el archivo JSON
const productos = [];

// Carrito de compras
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

/**
 * Carga productos desde el archivo JSON y maneja errores
 */
const fetchProductos = async () => {
    try {
        const response = await fetch('../JSON/productos.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo JSON');
        }
        const data = await response.json();
        productos.push(...(data.productos || []));
        cargarProductos();
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        mostrarErrorCargaProductos();
    }
};

/**
 * Muestra un mensaje de error si falla la carga de productos
 */
const mostrarErrorCargaProductos = () => {
    Swal.fire({
        icon: "error",
        title: "Error de carga",
        text: "No se pudieron cargar los productos. Por favor, intente más tarde.",
    });
};

/**
 * Agrega un producto al carrito
 * @param {string} nombre - Nombre del producto
 * @param {number} precio - Precio del producto
 */
const agregarAlCarrito = (nombre, precio) => {
    const producto = carrito.find(item => item.nombre === nombre);
    producto ? incrementarCantidad(producto) : agregarNuevoProducto(nombre, precio);
    guardarCarrito();
};

const incrementarCantidad = (producto) => {
    producto.cantidad += 1;
};

const agregarNuevoProducto = (nombre, precio) => {
    carrito.push({ nombre, precio, cantidad: 1 });
};

/**
 * Quita un producto del carrito
 * @param {string} nombre - Nombre del producto a quitar
 */
const quitarDelCarrito = (nombre) => {
    const index = carrito.findIndex(item => item.nombre === nombre);
    if (index !== -1) {
        carrito[index].cantidad > 1 ? decrementarCantidad(index) : eliminarProducto(index);
        guardarCarrito();
    }
};

const decrementarCantidad = (index) => {
    carrito[index].cantidad--;
};

const eliminarProducto = (index) => {
    carrito.splice(index, 1);
};

/**
 * Actualiza la visualización del carrito en el DOM
 */
const actualizarCarrito = () => {
    const carritoElement = document.getElementById("carritoContent");
    if (!carritoElement) return;

    carritoElement.innerHTML = "";
    
    carrito.forEach(renderizarItemCarrito);
    
    renderizarTotalCarrito(carritoElement);
    renderizarBotonesCarrito(carritoElement);
    actualizarContadorCarrito();
};

/**
 * Renderiza un item individual del carrito
 * @param {Object} item - Item del carrito
 */
const renderizarItemCarrito = ({ nombre, cantidad, precio }) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item";
    itemDiv.innerHTML = `
        ${nombre} (${cantidad}) - $${precio * cantidad}
        <div>
            <button class="btn btn-success btn-carrito" onclick="agregarAlCarrito('${nombre}', ${precio})">+</button>
            <button class="btn btn-danger btn-carrito" onclick="quitarDelCarrito('${nombre}')">-</button>
        </div>
    `;
    document.getElementById("carritoContent").appendChild(itemDiv);
};

/**
 * Renderiza el total del carrito
 * @param {HTMLElement} carritoElement - Elemento del DOM del carrito
 */
const renderizarTotalCarrito = (carritoElement) => {
    const total = carrito.reduce((total, { precio, cantidad }) => total + precio * cantidad, 0);
    const totalDiv = document.createElement("div");
    totalDiv.className = "d-flex justify-content-between align-items-center mt-2";
    totalDiv.innerHTML = `<strong>Total:</strong> $${total}`;
    carritoElement.appendChild(totalDiv);
};

/**
 * Renderiza los botones de comprar y cancelar
 * @param {HTMLElement} carritoElement - Elemento del DOM del carrito
 */
const renderizarBotonesCarrito = (carritoElement) => {
    const botonDiv = document.createElement("div");
    botonDiv.className = "d-flex justify-content-between mt-2";
    botonDiv.innerHTML = `
        <button class="btn btn-primary" onclick="comprar()">Comprar</button>
        <button class="btn btn-secondary" onclick="cancelarCompra()">Cancelar</button>
    `;
    carritoElement.appendChild(botonDiv);
};

/**
 * Actualiza el contador del carrito en el DOM
 */
const actualizarContadorCarrito = () => {
    const carritoCount = document.getElementById("carritoCount");
    if (carritoCount) carritoCount.textContent = carrito.length;
};

/**
 * Guarda el carrito en el almacenamiento local
 */
const guardarCarrito = () => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();
};

/**
 * Muestra u oculta el carrito
 */
const toggleCarrito = () => {
    const carritoContainer = document.getElementById("carritoContainer");
    if (carritoContainer) {
        carritoContainer.style.display = carritoContainer.style.display === "none" ? "block" : "none";
    }
};

/**
 * Muestra un mensaje de éxito al enviar el formulario de contacto
 */
const mostrarMensajeExito = () => {
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Muchas gracias por contactarnos",
        showConfirmButton: false,
        timer: 1500
    });
    document.getElementById("contactForm")?.reset();
    $('#contactModal').modal('hide');
};

/**
 * Muestra un mensaje de error si el formulario de contacto está incompleto
 */
const mostrarMensajeError = () => {
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Por favor, complete todos los campos",
    });
};

/**
 * Maneja el envío del formulario de contacto
 */
const enviarMensaje = () => {
    const name = document.getElementById("name")?.value;
    const email = document.getElementById("email")?.value;
    const message = document.getElementById("message")?.value;

    name && email && message ? mostrarMensajeExito() : mostrarMensajeError();
};

// Inicialización al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    fetchProductos();
    actualizarCarrito();
});

/**
 * Carga productos dinámicamente en cards usando Bootstrap
 * @param {string} [categoria] - Categoría de productos a mostrar
 */
const cargarProductos = (categoria) => {
    const productosContainer = document.getElementById("productosContainer");
    if (!productosContainer) return;

    productosContainer.innerHTML = "";

    const productosFiltrados = categoria ? productos.filter(p => p.categoria === categoria) : productos;

    productosFiltrados.forEach(renderizarProducto);
};

/**
 * Renderiza un producto individual
 * @param {Object} producto - Producto a renderizar
 */
const renderizarProducto = ({ imagen, nombre, precio }) => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-4";
    card.innerHTML = `
        <div class="card h-100">
            <img src="${imagen}" class="card-img-top" alt="${nombre}" title="${nombre}">
            <div class="card-body">
                <h5 class="card-title">${nombre}</h5>
                <p class="card-text">$${precio}</p>
                <button class="btn btn-primary" onclick="agregarAlCarrito('${nombre}', ${precio})">Añadir al Carrito</button>
            </div>
        </div>
    `;
    document.getElementById("productosContainer").appendChild(card);
};

/**
 * Muestra productos por categoría
 * @param {string} categoria - Categoría de productos a mostrar
 */
const mostrarCategoria = (categoria) => cargarProductos(categoria);

/**
 * Muestra un mensaje si el carrito está vacío
 */
const mostrarCarritoVacio = () => {
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "¡El carrito está vacío!",
        footer: '<a href="#">¿Por qué tengo este problema?</a>'
    });
};

/**
 * Realiza la compra y muestra un mensaje de éxito
 */
const realizarCompra = () => {
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: "¡Compra realizada con éxito!",
        showConfirmButton: false,
        timer: 2500
    });
    carrito = [];
    guardarCarrito();
    toggleCarrito();
};

/**
 * Maneja el proceso de compra
 */
const comprar = () => { 
    carrito.length === 0 ? mostrarCarritoVacio() : realizarCompra(); 
};

/**
 * Cancela la compra y vacía el carrito
 */
const cancelarCompra = () => {
    carrito = [];
    guardarCarrito();
    toggleCarrito();
};
