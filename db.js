let request = this.indexedDB.open("ProductosDB", 1);
let  dbProductos, operacion = 0;

request.onerror = function (e) {
    console.log("Error : " + e.target.errorCode)
}

request.onsuccess = function (e) {
    console.log("Database opened");
    dbProductos = e.target.result;

    showProductos();
}

request.onupgradeneeded = function (e) {
    let db = e.target.result;
    if (!db.objectStoreNames.contains("Productos")) {
        let objectStore = db.createObjectStore("Productos", { keyPath: "id", autoIncrement: true });

        objectStore.createIndex("descripcion", "descripcion", {unique : false});
    }

}

function addProducto() {
    let seccion = document.getElementById("txtSeccion").value;
    let descripcion = document.getElementById("txtxDescripcion").value;
    let fecha = document.getElementById("txtFecha").value;
    let pais = document.getElementById("txtPais").value;
    let precio = document.getElementById("txtPrecio").value;

    var prod = {
        seccion : seccion,
        descripcion : descripcion,
        fecha : fecha,
        pais : pais,
        precio : precio
    }

    let tx = dbProductos.transaction(["Productos"], "readwrite");
    let objectProducto = tx.objectStore("Productos");

    let request = objectProducto.add(prod);


    request.onsuccess = function(e){
        console.log("Producto añadido");
        showProductos();
        resetForm();
    }

    request.onerror = function(e){
        alert("Error en ingreso de producto")
    }
}

function modProducto() {
    const id = parseInt(document.getElementById("id-prod").value, 10);
    let seccion = document.getElementById("txtSeccion").value;
    let descripcion = document.getElementById("txtxDescripcion").value;
    let fecha = document.getElementById("txtFecha").value;
    let pais = document.getElementById("txtPais").value;
    let precio = document.getElementById("txtPrecio").value;

    var prod = {
        id : id,
        seccion : seccion,
        descripcion : descripcion,
        fecha : fecha,
        pais : pais,
        precio : precio
    }

    let tx = dbProductos.transaction(["Productos"], "readwrite");
    let objectProducto = tx.objectStore("Productos");

    let request = objectProducto.put(prod);


    request.onsuccess = function(e){
        console.log("Producto modificado");
        showProductos();
        resetForm();
    }

    request.onerror = function(e){
        alert("Error en modificacion de producto")
    }
}

function showProductos(){
    let tx = dbProductos.transaction(["Productos"], "readonly");
    let objectProducto = tx.objectStore("Productos");

    let index = objectProducto.index("descripcion");

    let tabla = "";

    index.openCursor().onsuccess = function(e){
        let cursor = e.target.result;

        let tbl = document.getElementById("tblBody");

        if(cursor){
            tabla += "<tr>";
            tabla += "<td>" + cursor.value.seccion + "</td>";
            tabla += "<td>" + cursor.value.descripcion + "</td>";
            tabla += "<td>" + cursor.value.fecha + "</td>";
            tabla += "<td>" + cursor.value.pais + "</td>";
            tabla += "<td>" + cursor.value.precio + "</td>";
            tabla += "<td class='btn-accion'>";
            tabla +=  "<button class='btn-modificar' onclick='getProduct(" + cursor.value.id +")'>Modificar</button>";
            tabla += "<button class='btn-eliminar' onclick='removeProduct(" + cursor.value.id +")'>Eliminar</button></td>";
            tabla += "</tr>";
            
            cursor.continue();
        }
        
        tbl.innerHTML = tabla;
        
    }
}

function removeProduct(prodID){
    const tx = dbProductos.transaction(["Productos"], "readwrite");
    const objStore = tx.objectStore("Productos");
    const request = objStore.delete(prodID);

    request.onsuccess = function (){
        console.log("Producto eliminado " + prodID);
        showProductos();
        resetForm();
        operacion = 0;
    }

    request.onerror = function (e){
        console.log("Producto no eliminado " + e.target.errorCode);
    }
}

function getProduct(prodID){
    const tx = dbProductos.transaction(["Productos"], "readwrite");
    const objStore = tx.objectStore("Productos");
    const request = objStore.get(prodID);

    request.onsuccess = function (e){
        console.log("Producto a mostrar : " + prodID);
        document.getElementById("txtSeccion").value = request.result.seccion;
        document.getElementById("txtxDescripcion").value = request.result.descripcion;
        document.getElementById("txtFecha").value = request.result.fecha;
        document.getElementById("txtPais").value = request.result.pais;
        document.getElementById("txtPrecio").value = request.result.precio;
        document.getElementById("id-prod").value = request.result.id;

        operacion = 1;
    }

    request.onerror = function (e){
        console.log("Producto no se puede mostrar : " + e.target.errorCode);
    }
}

function resetForm(){
    document.getElementById("txtSeccion").value = "";
    document.getElementById("txtxDescripcion").value = "";
    document.getElementById("txtFecha").value = "";
    document.getElementById("txtPais").value = "";
    document.getElementById("txtPrecio").value = "";
}

function clearAll(){
    //también se puede borrar tod la base de datos y luego crearla de nuevo recargando la pagina
    //indexedDB.deleteDatabase("ProductosDB");
    //window.location.href = "index.html";
    const tx = dbProductos.transaction(["Productos"], "readwrite");
    const objStore = tx.objectStore("Productos");

    const request = objStore.clear();

    request.onsuccess = () => {
        showProductos();
        operacion = 0;
    }
}

window.addEventListener("load", function () {

    document.getElementById("btnAgregar").addEventListener("click", (e) => {
        if(operacion === 0){
            addProducto();
        }
        else {
            modProducto();
            operacion = 0;
        }
        
    });
    document.getElementById("btn-borrar-todos").addEventListener("click", clearAll);

});
