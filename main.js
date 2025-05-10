function agregarAlCarrito(button) {
    const productoDiv = button.closest(".producto");
    const producto = {
      id: Date.now(),
      nombre: productoDiv.getAttribute("data-nombre"),
      precio: parseFloat(productoDiv.getAttribute("data-precio")),
      imagen: productoDiv.querySelector("img").src
    };
  
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push(producto);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContador();
  }
  
//Muestra ventana de compras
  document.getElementById("btn-carrito").addEventListener("click", () => {
    mostrarCarrito();
    document.getElementById("pestaña-carrito").style.display = "flex";
  });
  

  function cerrarModal() {
    document.getElementById("pestaña-carrito").style.display = "none";
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
    alert("¡Gracias por tu compra!");
    vaciarCarrito();
  }
  

  function actualizarContador() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contador = document.getElementById("contador");
    if (contador) contador.innerText = carrito.length;
  }
  

  document.addEventListener("DOMContentLoaded", () => {
    cargarProductos(); 
    actualizarContador();
  });
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
            <p><strong>Descripción:</strong> ${producto.descripcion || "Sin descripción"}</p>
            <p><strong>Tallas disponibles:</strong> ${producto.talla.join(', ')}</p>
            <button onclick="agregarAlCarrito(this)">Agregar al carrito</button>
          `;
          contenedor.appendChild(div);
        });
      })
      .catch(err => console.error("Error al cargar productos:", err));
  }
  
  document.getElementById('form-agregar-producto').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const nombre = document.getElementById('nombre').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const imagen = document.getElementById('imagen').value;
  
    fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre, precio, imagen })
    })
      .then(response => response.json())
      .then(producto => {
        alert('Producto agregado correctamente');
        renderizarProductos([producto]); 
        document.getElementById('form-agregar-producto').reset(); 
      })
      .catch(error => console.error('Error al agregar producto:', error));
  });
  