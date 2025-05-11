// CARRITO
function agregarAlCarrito(button) {
  const productoDiv = button.closest(".producto");
  const tallaSelect = productoDiv.querySelector(".select-talla");
  const tallaSeleccionada = tallaSelect ? tallaSelect.value : null;

  const producto = {
    id: Date.now(),
    nombre: productoDiv.getAttribute("data-nombre"),
    precio: parseFloat(productoDiv.getAttribute("data-precio")),
    imagen: productoDiv.querySelector("img").src,
    talla: tallaSeleccionada
  };

  if (!producto.talla) {
    alert("Por favor selecciona una talla antes de agregar al carrito");
    return;
  }

  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.push(producto);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContador();
}


function mostrarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedor = document.getElementById("carrito-contenido");
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }

  carrito.forEach((producto, index) => {
    const item = document.createElement("div");
    item.classList.add("producto-carrito");
    item.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p>$${producto.precio}</p>
      <button onclick="eliminarProducto(${index})">Eliminar</button>
    `;
    contenedor.appendChild(item);
  });
}

function eliminarProducto(index) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
  actualizarContador();
}

function vaciarCarrito() {
  localStorage.removeItem('carrito');
  mostrarCarrito();
  actualizarContador();
}

function finalizarCompra() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  carrito.forEach(producto => {
    fetch(`http://localhost:3000/api/products/${producto.id}/decrement-stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ talla: producto.talla, cantidad: 1 })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => console.error('Error al actualizar stock:', error));
  });

  alert("¡Gracias por tu compra!");
  vaciarCarrito();
  cargarProductos(); // Actualiza vista con nuevo stock
}


function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contador = document.getElementById("contador");
  if (contador) contador.innerText = carrito.length;
}

// LOGIN y REGISTRO
document.getElementById('btn-login').addEventListener("click", () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    document.getElementById('modal-login').style.display = 'block';
  }
});

function cerrarModal() {
  document.getElementById("modal-login").style.display = "none";
  document.getElementById("modal-registro").style.display = "none";
  document.getElementById("pestaña-carrito").style.display = "none";
}

function mostrarRegistro() {
  document.getElementById("modal-login").style.display = "none";
  document.getElementById("modal-registro").style.display = "block";
}

document.getElementById('registro-form').addEventListener('submit', function (event) {
  event.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const contraseña = document.getElementById('contraseña').value;

  localStorage.setItem('usuario', JSON.stringify({ nombre, email, contraseña }));
  alert('Usuario registrado');
  cerrarModal();
});

document.getElementById('login-form').addEventListener('submit', function (event) {
  event.preventDefault();
  const emailLogin = document.getElementById('email-login').value;
  const contraseñaLogin = document.getElementById('contraseña-login').value;

  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));
  if (usuarioGuardado && usuarioGuardado.email === emailLogin && usuarioGuardado.contraseña === contraseñaLogin) {
    alert('Inicio de sesión exitoso');
    cerrarModal();
    document.getElementById('btn-login').textContent = usuarioGuardado.nombre || usuarioGuardado.email;
  } else {
    alert('Credenciales incorrectas');
  }
});
//LOGOUT

function cerrarSesion() {
  localStorage.removeItem('usuario');  
  document.getElementById('btn-login').textContent = 'Iniciar sesión';  
  alert('Has cerrado sesión exitosamente');
}

// Asignar el evento de cierre de sesión
document.getElementById('btn-logout').addEventListener('click', cerrarSesion);

// CARRITO MODAL
document.getElementById("btn-carrito").addEventListener("click", () => {
  mostrarCarrito();
  document.getElementById("pestaña-carrito").style.display = "flex";
});

// CARGAR PRODUCTOS
function cargarProductos() {
  fetch("http://localhost:3000/api/products")
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("contenedor-productos");
      contenedor.innerHTML = "";

      data.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.setAttribute("data-nombre", producto.nombre);
        div.setAttribute("data-precio", producto.precio);
        div.innerHTML = `
  <img src="${producto.imagen}" alt="${producto.nombre}">
  <h3>${producto.nombre}</h3>
  <p><strong>Marca:</strong> ${producto.marca}</p>
  <p><strong>Precio:</strong> $${producto.precio}</p>
  <p><strong>Inventario:</strong> ${producto.stock || 0}</p>
  <p><strong>Descripción:</strong> ${producto.descripcion || "Sin descripción"}</p>
  <p><strong>Tallas disponibles:</strong> 
  <select class="select-talla">
    ${producto.talla?.map(t => `<option value="${t}">${t}</option>`).join('') || '<option>No disponibles</option>'}
  </select>
</p>

  <button onclick="agregarAlCarrito(this)">Agregar al carrito</button>
`;

        contenedor.appendChild(div);
      });
    })
    .catch(err => console.error("Error al cargar productos:", err));
}

// AGREGAR NUEVO PRODUCTO
document.getElementById('form-agregar-producto').addEventListener('submit', function (e) {
  e.preventDefault(); // Evita que recargue la página

  const nombre = document.getElementById('nombre').value;
  const precio = document.getElementById('precio').value;
  const imagen = document.getElementById('imagen').value;

  const stockS = document.getElementById('stock-S').value || 0;
  const stockM = document.getElementById('stock-M').value || 0;
  const stockL = document.getElementById('stock-L').value || 0;


  // Crear el div del producto
  const productoDiv = document.createElement('div');
  productoDiv.classList.add('producto');

  productoDiv.innerHTML = `
    <img src="${imagen}" alt="${nombre}">
    <h3>${nombre}</h3>
    <p>$${precio} MXN</p>
    <p><strong>Tallas disponibles:</strong>
      <select class="select-talla">
        ${stockS > 0 ? '<option value="S">S</option>' : ''}
        ${stockM > 0 ? '<option value="M">M</option>' : ''}
        ${stockL > 0 ? '<option value="L">L</option>' : ''}
      </select>
    </p>
    <button onclick="agregarAlCarrito(this)">Agregar al carrito</button>
  `;

  // Agregar al contenedor
  document.getElementById('contenedor-productos').appendChild(productoDiv);

  // Limpiar el formulario
  e.target.reset();
});


  fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nombre, precio, imagen, stock })
  })
  
    .then(response => response.json())
    .then(producto => {
      alert('Producto agregado correctamente');
      cargarProductos();
      document.getElementById('form-agregar-producto').reset();
    })
    .catch(error => console.error('Error al agregar producto:', error));
    

// INICIO
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarContador();

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (usuario) {
    document.getElementById('btn-login').textContent = usuario.nombre || usuario.email;
  }
});

// Formulario de agregar producto
document.getElementById('form-agregar-producto').addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const precio = parseFloat(document.getElementById('precio').value);
  const imagen = document.getElementById('imagen').value;
  const stock = parseInt(document.getElementById('stock').value);

  fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nombre, precio, imagen, stock })
    
  })
    .then(response => response.json())
    .then(producto => {
      alert('Producto agregado correctamente');
      cargarProductos();  // Actualiza la lista de productos
      document.getElementById('form-agregar-producto').reset();  // Limpia el formulario
    })
    .catch(error => console.error('Error al agregar producto:', error));
});

// Funciones adicionales
function cargarProductos() {
  fetch("http://localhost:3000/api/products")
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("contenedor-productos");
      contenedor.innerHTML = "";

      data.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.setAttribute("data-nombre", producto.nombre);
        div.setAttribute("data-precio", producto.precio);
        div.innerHTML = `
          <img src="${producto.imagen}" alt="${producto.nombre}">
          <h3>${producto.nombre}</h3>
          <p><strong>Marca:</strong> ${producto.marca}</p>
          <p><strong>Precio:</strong> $${producto.precio}</p>
          <p><strong>Inventario:</strong> ${producto.stock || 0}</p>
          <p><strong>Descripción:</strong> ${producto.descripcion || "Sin descripción"}</p>
          <p><strong>Tallas disponibles:</strong> ${producto.talla?.join(', ') || 'N/A'}</p>
          <button onclick="agregarAlCarrito(this)">Agregar al carrito</button>
        `;

        contenedor.appendChild(div);
      });
    })
    .catch(err => console.error("Error al cargar productos:", err));
}

function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contador = document.getElementById("contador");
  if (contador) contador.innerText = carrito.length;
}