// Importa las funciones necesarias de Firebase
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getDatabase, ref, set, get, child, push, onValue, orderByChild, equalTo, startAt, endAt, remove, update  } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

let cCelula = false; // Initialize to false
let cPrimera = false; // Initialize to false
let cPalabra = false; // Initialize to false
let cDiscipulado = false; // Initialize to false
let cHijos = false; // Initialize to false


// Configuración mínima para inicializar Firebase
const initialConfig = {
    apiKey: "AIzaSyDZ-_dETKSOZVWQMP91w-1o3OtlBTLFILM",
    authDomain: "sgifjs.firebaseapp.com",
    databaseURL: "https://sgifjs-default-rtdb.firebaseio.com"
};

// Inicializa la app Firebase con configuración mínima si no está ya inicializada
let app;
if (!getApps().length) {
    app = initializeApp(initialConfig);
} else {
    app = getApp();
}

const database = getDatabase(app);

// Lee la configuración completa desde la base de datos
const configRef = ref(database, 'sgi/config');
get(configRef).then((snapshot) => {
    if (snapshot.exists()) {
        const config = snapshot.val();
        if (!getApps().length) {
            initializeApp(config);
        }
    } else {
        console.log("No se encontró el documento de configuración.");
    }
}).catch((error) => {
    console.log("Error al obtener la configuración:", error);
});

const auth = getAuth(app);

window.onload = function() {
    // Verifica si el usuario está autenticado
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuario autenticado, carga los datos
            console.log('Usuario autenticado:', user);
            loadItems();
        } else {
            // Usuario no autenticado, redirige a la pantalla de login
            console.log('Usuario no autenticado, redirigiendo...');
            window.location.href = "../../public/index.html"; // Cambia esto a la ruta correcta de tu página de login
        }
    });
}

window.openModal = function() {
    const btnGuardar = document.querySelector('.btn-save');
    btnGuardar.dataset.action = 'agregar';
    btnGuardar.dataset.congreganteid = "";
    document.getElementById('myModal').style.display = 'block';
    limpiarCamposModal();
}

function limpiarCamposModal() {
    $('#nombre, #direccion, #telefono, #iglesiaKey,#iglesiaEstado,#suggestionsIglesia,#searchInputIglesia, #searchInput, #servicioKey, #servicioEstado, #suggestions ').val('');
    //$('input[type="checkbox"]').prop('checked', false);
    $('#selectIglesias').empty();
    $('#selectServicios').empty();
 }

window.closeModal = function() {
    document.getElementById('myModal').style.display = 'none';
}

window.saveItems = function(pFuncion, pCongreganteId) {
    const botonGuardar = document.getElementById('btn-save');
    const idCongregante = botonGuardar.dataset.congreganteid;
    console.log("SaveItems:",idCongregante);

    const nombre = document.getElementById('nombre').value;
    const direccion = document.getElementById('direccion').value;
    const telefono = document.getElementById('telefono').value;

    const Selectiglesias = document.getElementById('selectIglesias');
    const iglesias = [];

    // Iterar sobre las opciones del select
    for (let i = 0; i < Selectiglesias.options.length; i++) {
        const opcion = Selectiglesias.options[i];
        const iglesia = {
            key: opcion.value,
            estado: opcion.dataset.estado,
            descripcion: opcion.textContent
        };
        iglesias.push(iglesia);
        //iglesias.push(opcion.value); // O opcion.text si quieres el texto visible
        console.log('***iglesias:***');
        console.log('descripcion:', opcion.textContent);
        //console.log('estado:', opcion.dataset.estado);
        console.log('key:', opcion.value);
    }

    const SelectServicios = document.getElementById('selectServicios');
    const servicios = [];

    // Iterar sobre las opciones del select
    for (let i = 0; i < SelectServicios.options.length; i++) {
        const opcion = SelectServicios.options[i];
        const servicio = {
            key: opcion.value,
            estado: opcion.dataset.estado,
            descripcion: opcion.textContent
        };
        servicios.push(servicio); // O opcion.text si quieres el texto visible
        console.log('***servicios:***');
        console.log('descripcion:', opcion.textContent);
        //console.log('estado:', opcion.estado);
        console.log('key:', opcion.value);
    }

    //console.log(pFuncion);
    //console.log(pCongreganteId);
    
    const cCelulaObj = document.getElementById('cCelula');
    const cCelula = cCelulaObj.checked
    console.log("cCelula", cCelula);

    const cPrimeraObj = document.getElementById('cPrimera');
    const cPrimera = cPrimeraObj.checked
    console.log("cPrimera", cPrimera);

    const cPalabraObj = document.getElementById('cPrimera');
    const cPalabra = cPalabraObj.checked
    console.log("cPalabra", cPalabra);

    const cDiscipuladoObj = document.getElementById('cDiscipulado');
    const cDiscipulado = cDiscipuladoObj.checked
    console.log("cDiscipulado", cDiscipulado);


    const cHijosObj = document.getElementById('cHijos');
    const cHijos = cHijosObj.checked
    console.log("cHijos", cHijos);


    if (pFuncion=="agregar") {
        guardarCongregante(pFuncion,idCongregante,nombre, direccion, telefono, cCelula, cPrimera, cPalabra, cDiscipulado, cHijos, iglesias, servicios);
    }else if (pFuncion=="actualizar") {
        guardarCongregante(pFuncion,idCongregante,nombre, direccion, telefono, cCelula, cPrimera, cPalabra, cDiscipulado, cHijos, iglesias, servicios);
    }   

}
 
// Función para guardar un nuevo congregante
async function guardarCongregante(pFuncion, pCongreganteId, nombre, direccion, telefono, cCelula, cPrimera, cPalabra, cDiscipulado, cHijos, iglesias, servicios) {
    console.log(pFuncion);
    console.log("guardarCongregante:",pCongreganteId);
    let congreganteRef="";
    let congreganteRefUpdate="";
    let newCongreganteKey="";
    try {
    // Referencia a la raíz de congregantes
    if (pFuncion=="agregar"){
        congreganteRef = ref(database, 'sgi/catalogos/congregantes');
        // Generar un ID único para el congregante
        newCongreganteKey = push(congreganteRef).key;
    }else if(pFuncion=="actualizar"){
        congreganteRefUpdate = ref(database, `sgi/catalogos/congregantes/${pCongreganteId}`);
    }

    // Validar y agregar iglesias y servicios si no existen
    const iglesiasValidadas = [];
    const serviciosValidados = [];

    // ... (Código para validar y agregar iglesias y servicios a los arreglos validados)
    async function validarYAgregar(tipo, key, estado, descripcion) {
        //const db = getDatabase();
        const catalogoRef = ref(database, `sgi/catalogos/${tipo}`);
        // Si la clave está vacía, generamos una nueva
        if (!key) {
            const newRef = push(catalogoRef);
            key = newRef.key;
        }
        if (!estado) {
            estado = "1";
        }
        const snapshot = await get(child(catalogoRef, key));
        
        if (!snapshot.exists()) {
            await set(child(catalogoRef, key), {
            descripcion,
            estado
            });
        }
        
        return key;
    }
    // Iterar sobre las iglesias y servicios para validar y agregar
    for (const iglesia of iglesias) {
        const keyValidada = await validarYAgregar('iglesias', iglesia.key, iglesia.estado, iglesia.descripcion);
        //iglesiasValidadas.push({ key: keyValidada, estado: iglesia.estado });
        iglesiasValidadas.push({ key: keyValidada });
    }
  
    for (const servicio of servicios) {
        const keyValidada = await validarYAgregar('servicios', servicio.key, servicio.estado, servicio.descripcion);
        //serviciosValidados.push({ key: keyValidada, estado: servicio.estado });
        serviciosValidados.push({ key: keyValidada });
    }
    if (pFuncion=="agregar"){
        // Guardar el congregante
        await set(ref(database, 'sgi/catalogos/congregantes/' + newCongreganteKey), {
            nombre,
            direccion,
            telefono,
            cCelula,
            cPrimera, 
            cPalabra, 
            cDiscipulado, 
            cHijos,
            iglesias: iglesiasValidadas,
            servicios: serviciosValidados
        });
        console.log('Congregante guardado correctamente');
        //mostrarMensajeExito("Congregante guardado correctamente");
    }else if(pFuncion=="actualizar"){
        // Actualizar los datos del congregante
        await update(congreganteRefUpdate, {
            nombre,
            direccion,
            telefono,
            cCelula,
            cPrimera, 
            cPalabra, 
            cDiscipulado, 
            cHijos,
            iglesias: iglesiasValidadas,
            servicios: serviciosValidados
          });
    }
    closeModal();
    loadItems();

  } catch (error) {
    console.error('Error al guardar el congregante:', error);
    //mostrarMensajeError("Ocurrió un error al guardar el congregante.");
  }

}

window.loadItems = async function() {
    try {
        const congregantesRef = ref(database, 'sgi/catalogos/congregantes');
        const iglesiasRef = ref(database, 'sgi/catalogos/iglesias');
        const serviciosRef = ref(database, 'sgi/catalogos/servicios');
    
        // Obtener los datos de Firebase
        const congregantesSnapshot = await get(congregantesRef);
        const iglesiasSnapshot = await get(iglesiasRef);
        const serviciosSnapshot = await get(serviciosRef);
    
        const congregantesData = congregantesSnapshot.val();
        const iglesiasData = iglesiasSnapshot.val();
        const serviciosData = serviciosSnapshot.val();
    
        //const congregantesList = document.getElementById('congregantes-list');
        //congregantesList.innerHTML = '';
        const contenedor = document.getElementById('mi-contenedor');
        contenedor.innerHTML = '';
        const tabla = document.createElement('table');
        tabla.classList.add('tabla1');

        // Crear un fragmento de documento para mejorar el rendimiento
        const fragment = document.createDocumentFragment();

            // Iterar sobre los congregantes
            Object.keys(congregantesData).forEach(congreganteKey => {
            const congregante = congregantesData[congreganteKey];
            
            //Nombre
            const fila = document.createElement('tr');
            fila.dataset.key = congreganteKey;
            //console.log("congregante.key:",congregante.key);
            //console.log("congregantekey:",congreganteKey);
             // Crear una celda y agregar el nombre
            const celdaNombreTitulo = document.createElement('td');
            celdaNombreTitulo.textContent = "Nombre:";

            const celdaNombre = document.createElement('td');
            celdaNombre.textContent = congregante.nombre;

            fila.appendChild(celdaNombreTitulo);
            fila.appendChild(celdaNombre);
            fragment.appendChild(fila);
        
            //Iglesia
            // Crear el select para las iglesias
            const iglesiasSelect = document.createElement('select');
            iglesiasSelect.id = `iglesias-${congreganteKey}`;
        
            // Iterar sobre las iglesias del congregante
            congregante.iglesias.forEach(iglesia => {
                // Buscar la iglesia en el catálogo utilizando la clave
                const iglesiaEnCatalogo = encontrarIglesia(iglesiasData, iglesia.key);

                if (iglesiaEnCatalogo) {
                    const option = document.createElement('option');
                    option.value = iglesiaEnCatalogo.key;
                    //option.textContent = `${iglesiaEnCatalogo.descripcion} (${iglesiaEnCatalogo.estado})`;
                    option.textContent = `${iglesiaEnCatalogo.descripcion}`;
                    iglesiasSelect.appendChild(option);
                }
            });   
            
            // Función para buscar una iglesia por su clave
            function encontrarIglesia(iglesias, clave) {
                for (const iglesiaKey in iglesias) {
                    if (iglesias.hasOwnProperty(iglesiaKey) && iglesiaKey === clave) {
                        return iglesias[iglesiaKey];
                    }
                }
                return null; // Si no se encuentra la iglesia
            }

            //Servicios
            // Crear el select para los servicios
            const serviciosSelect = document.createElement('select');
            serviciosSelect.id = `servicios-${congreganteKey}`;
        
            // Iterar sobre las iglesias del congregante
            congregante.servicios.forEach(servicio => {
                // Buscar la iglesia en el catálogo utilizando la clave
                const servicioEnCatalogo = encontrarServicio(serviciosData, servicio.key);

                if (servicioEnCatalogo) {
                    const option = document.createElement('option');
                    option.value = servicioEnCatalogo.key;
                    //option.textContent = `${iglesiaEnCatalogo.descripcion} (${iglesiaEnCatalogo.estado})`;
                    option.textContent = `${servicioEnCatalogo.descripcion}`;
                    serviciosSelect.appendChild(option);
                }
            });   
            
            // Función para buscar una iglesia por su clave
            function encontrarServicio(servicios, clave) {
                for (const servicioKey in servicios) {
                    if (servicios.hasOwnProperty(servicioKey) && servicioKey === clave) {
                        return servicios[servicioKey];
                    }
                }
                return null; // Si no se encuentra la iglesia
            }

            const filaRelaciones = document.createElement('tr');
            filaRelaciones.dataset.key = congreganteKey;
             // Crear una celda y agregar el nombre
            const celdaRelacionesTitulo = document.createElement('td');
            celdaRelacionesTitulo.textContent = "Iglesias/Servicios:";

            filaRelaciones.appendChild(celdaRelacionesTitulo);
            const celdaSelects = document.createElement('td');
            celdaSelects.appendChild(iglesiasSelect);
            celdaSelects.appendChild(serviciosSelect);

            filaRelaciones.appendChild(celdaSelects);
            fragment.appendChild(filaRelaciones);
       
            // Botones de borrar y editar
            // Botón de editar
            const editButton = document.createElement('button');
            editButton.classList.add('editar');
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', () => {
                // Aquí implementarías la lógica para editar el elemento
                populaDatosCongregante(congreganteKey);
                //console.log('Editar elemento:', congregante.id);
            });

            // Botón de borrar
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('borrar');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>'
            deleteButton.addEventListener('click', eliminarCongregante);

            const filaBotones = document.createElement('tr');
            filaBotones.dataset.key = congreganteKey;
             // Crear una celda y agregar el nombre
            const celdaBotonesTitulo = document.createElement('td');
            celdaBotonesTitulo.textContent = "-";
            filaBotones.appendChild(celdaBotonesTitulo);

            const celdaBotones = document.createElement('td');
            celdaBotones.appendChild(editButton);
            celdaBotones.appendChild(deleteButton);
            filaBotones.appendChild(celdaBotones);

            fragment.appendChild(filaBotones);

            //const filaSeparador = document.createElement('tr');
            //filaSeparador.dataset.key = congreganteKey;

            //fragment.appendChild(filaSeparador);
        });
        // Agregar la tabla al fragmento
        tabla.appendChild(fragment);

        // Agregar el fragmento al contenedor
        contenedor.appendChild(tabla);

    } catch (error) {
        console.error('Error al obtener los congregantes:', error);
    }

}

function eliminarCongregante(event) {
    const boton = event.target;
    const fila = boton.closest('tr');
    const idCongregante = fila.dataset.key;
    console.log('ID Congregante:', idCongregante); // Verifica el ID
  
    // Confirmar la eliminación
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará al congregante y todos sus datos.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
        if (result.isConfirmed){
            // Referencia a la base de datos de Firebase
            //const congregantesRef = ref(database, 'sgi/catalogos/congregantes');
            const dbRef = ref(getDatabase());
        
            // Eliminar el registro del congregante de Firebase
            const congreganteRef = child(dbRef, `sgi/catalogos/congregantes/${idCongregante}`);
            remove(congreganteRef)
            .then(() => {
                // Eliminar las filas de la interfaz
                const filasAEliminar = document.querySelectorAll(`tr[data-key="${idCongregante}"]`);
                filasAEliminar.forEach(fila => fila.remove());
                console.log('Congregante eliminado exitosamente');
            })
            .catch((error) => {
                console.error('Error al eliminar el congregante:', error);
            });
        }
    })
}

function populaDatosCongregante(congreganteId) {
    const db = getDatabase();
    const congreganteRef = ref(db, `sgi/catalogos/congregantes/${congreganteId}`);

    get(congreganteRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const congreganteData = snapshot.val();

            // Abrir el modal (ajusta según tu implementación)
            document.getElementById("myModal").style.display = "block";
    
            // Precargar los campos del modal
            $('#nombre').val(congreganteData.nombre);
            $('#telefono').val(congreganteData.telefono);
            $('#direccion').val(congreganteData.direccion);
            $('#cCelula').prop('checked', congreganteData.cCelula);
            $('#cPrimera').prop('checked', congreganteData.cPrimera);
            $('#cPalabra').prop('checked', congreganteData.cPalabra);
            $('#cDiscipulado').prop('checked', congreganteData.cDiscipulado);
            $('#cHijos').prop('checked', congreganteData.cHijos);
            
            // Obtener el nombre y estado de la iglesia
            $('#selectIglesias').empty();
            $('#selectServicios').empty();

            const iglesiasRef = ref(db, 'sgi/catalogos/iglesias');
            const serviciosRef = ref(db, 'sgi/catalogos/servicios');
            const iglesiasCongregante = congreganteData.iglesias.map(iglesia => iglesia.key);
            const serviciosCongregante = congreganteData.servicios.map(servicio => servicio.key);
            poblarSelect(iglesiasRef, iglesiasCongregante, 'selectIglesias');
            poblarSelect(serviciosRef, serviciosCongregante, 'selectServicios');

            const btnGuardar = document.querySelector('.btn-save');
            btnGuardar.dataset.action = 'actualizar';
            btnGuardar.dataset.congreganteid = congreganteId;
            console.log("btnGuardar.dataset.congreganteid:",btnGuardar.dataset.congreganteid);

        } else {
          console.log("No se encontró el congregante");
        }
      })
      .catch((error) => {
        console.error(error);
      });
}

function poblarSelect(ref, ids, selectId) {
    get(ref)
      .then((snapshot) => {
        const opciones = snapshot.val();
        const select = document.getElementById(selectId);
        select.innerHTML = '';
  
        // Iterar sobre los IDs y agregar las opciones correspondientes
        Object.keys(opciones).forEach(id => {
        if (ids.includes(id)) { // Si el ID está en la lista de IDs del congregante
            const opcion = opciones[id];
            const optionElement = document.createElement('option');
            optionElement.value = id;
            console.log("optionElement.value:",optionElement.value);
            optionElement.text = opcion.descripcion; // Ajustar según la propiedad que contenga el nombre
            console.log("optionElement.text:",optionElement.text);
            select.appendChild(optionElement);
          }
        });
      })
      .catch((error) => {
        console.error('Error al poblar select:', error);
      });
}

window.onload = function() {
    loadItems();
};

/********* Iglesias **********/
const selectIglesias = document.getElementById('selectIglesias');
const btnAgregarIglesia = document.getElementById('btnAgregarIglesia');
const btnEliminarIglesia = document.getElementById('btnEliminarIglesia'); // Suponiendo que tienes un botón con este ID
const iglesias = [];
const dbRefIglesia = ref(database, 'sgi/catalogos/iglesias');
/*------- Iglesias_DB --------*/
get(dbRefIglesia).then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const iglesiaData = childSnapshot.val();
        const descripcion = iglesiaData.descripcion;
        const estado = iglesiaData.estado;
        //const iglesia = childSnapshot.val();
        //iglesias.push(iglesia.descripcion);
        iglesias.push({
            key,
            descripcion,
            estado
        });
    });
});

const searchInputIglesia = document.getElementById('searchInputIglesia');
const iglesiaKey = document.getElementById('iglesiaKey');
const iglesiaEstado = document.getElementById('iglesiaEstado');
const suggestionsListIglesia = document.getElementById('suggestionsIglesia');
const rIglesia = document.getElementById('rIglesia');
/*------- Iglesias_Search --------*/
searchInputIglesia.addEventListener('input', (event) => {
    const valorBuscadoIglesia = event.target.value.toLowerCase();
  
    suggestionsListIglesia.innerHTML = ''; // Clear the list before populating
  
    if (valorBuscadoIglesia.trim() === '') {
        suggestionsListIglesia.style.display = 'none'; // Hide if no search term
        rIglesia.style.display='none';
      return;
    }
  
    //alert(iglesias.length);
    //const iglesiasFiltradas = iglesias.filter(iglesia => iglesia.toLowerCase().includes(valorBuscadoIglesia));
    const iglesiasFiltradas = iglesias.filter(iglesia => iglesia.descripcion.toLowerCase().includes(valorBuscadoIglesia));

    if (iglesiasFiltradas.length > 0) {
        suggestionsListIglesia.style.display = 'block'; // Show the list
        rIglesia.style.display='block';
  
        iglesiasFiltradas.forEach(iglesia => {
        const li = document.createElement('li');
        //li.textContent = iglesia;
        li.textContent = iglesia.descripcion; // Mostrar la descripción
        li.dataset.key = iglesia.key; // Guardar la clave en el atributo data-key
        li.dataset.estado = iglesia.estado; // Agregar la propiedad estado al elemento li
        li.classList.add('suggestion-item'); // Add class for styling
  
        li.addEventListener('click', () => {
          //const selectedKey = li.dataset.key;
          //console.log('Iglesia seleccionada:', selectedKey);
          searchInputIglesia.value = iglesia.descripcion;
          iglesiaKey.value=iglesia.key;
          iglesiaEstado.value=iglesia.estado;
          suggestionsListIglesia.style.display = 'none';
          rIglesia.style.display='none';
        });
  
        suggestionsListIglesia.appendChild(li);
      });
    } else {
      suggestionsListIglesia.style.display = 'none'; // Hide if no matches
    }
});

/*------- Iglesias_Agregar --------*/
btnAgregarIglesia.addEventListener('click', () => {
    const iglesia = searchInputIglesia.value.trim();

    if (iglesia !== '') {
        //console.log('iglesia',iglesia);

        const existeEnSelectIglesia = Array.from(selectIglesias.options).some(option => option.textContent.toLowerCase() === iglesia.toLowerCase());

        if (!existeEnSelectIglesia) {
            const option = document.createElement('option');
            option.value = iglesiaKey.value;
            option.textContent = iglesia;
            //option.dataset.key = iglesiaKey.value; // Replace with the actual key
            option.dataset.estado = iglesiaEstado.value; // Replace with the actual state
            selectIglesias.appendChild(option);

            console.log('Valor:', option.textContent);
            console.log('Key:', option.value);
            console.log('estado:', option.dataset.estado);

            searchInputIglesia.value = '';
            iglesiaKey.value= '';
            iglesiaEstado.value= '';
        } else {
            alert('La iglesia ya ha sido agregada.');
        }
    }
});

btnEliminarIglesia.addEventListener('click', () => {
    const opcionSeleccionada = selectIglesias.value;
    const option = selectIglesias.querySelector(`option[value="${opcionSeleccionada}"]`);
    selectIglesias.removeChild(option);
});

/********* Servicios **********/
//const inputServicio = document.getElementById('inputServicio');
//const listaSugerencias = document.getElementById('listaSugerencias');
const selectServicios = document.getElementById('selectServicios');
const btnAgregar = document.getElementById('btnAgregar');
const btnEliminar = document.getElementById('btnEliminar'); // Suponiendo que tienes un botón con este ID
const servicios = [];
const dbRef = ref(database, 'sgi/catalogos/servicios');
/*------- Servicios_DB --------*/
get(dbRef).then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
        //const servicio = childSnapshot.val();
        const key = childSnapshot.key;
        const servicioData = childSnapshot.val();
        const descripcion = servicioData.descripcion;
        const estado = servicioData.estado;
        servicios.push({
            key,
            descripcion,
            estado
        });
        //servicios.push(servicio.descripcion);
    });
});

const searchInput = document.getElementById('searchInput');
const servicioKey = document.getElementById('servicioKey');
const servicioEstado = document.getElementById('servicioEstado');
const suggestionsList = document.getElementById('suggestions');
const rServicio = document.getElementById('rServicio');

//const servicios   
// = ['Servicio 1', 'Servicio 2', 'Servicio 3']; // Sustituye con tus servicios
/*------- Servicios_Search --------*/
searchInput.addEventListener('input', (event) => {
    const valorBuscado = event.target.value.toLowerCase();
  
    suggestionsList.innerHTML = ''; // Clear the list before populating
  
    if (valorBuscado.trim() === '') {
      suggestionsList.style.display = 'none'; // Hide if no search term
      rServicio.style.display='none';
      return;
    }
  
    const serviciosFiltrados = servicios.filter(servicio => servicio.descripcion.toLowerCase().includes(valorBuscado));
      // Crea los elementos li y los agrega a la lista

    if (serviciosFiltrados.length > 0) {
      suggestionsList.style.display = 'block'; // Show the list
      rServicio.style.display='block';
  
      serviciosFiltrados.forEach(servicio => {
        const li = document.createElement('li');
        li.textContent = servicio.descripcion;
        li.dataset.key = servicio.key; // Guardar la clave en el atributo data-key
        li.dataset.estado = servicio.estado; // Agregar la propiedad estado al elemento li
        li.classList.add('suggestion-item'); // Add class for styling
  
        li.addEventListener('click', () => {
          searchInput.value = servicio.descripcion;
          servicioKey.value=servicio.key;
          servicioEstado.value=servicio.estado;

          suggestionsList.style.display = 'none';
          rServicio.style.display='none';
  
          // Here, handle selection (e.g., update a select or perform other actions)
        });
  
        suggestionsList.appendChild(li);
      });
    } else {
      suggestionsList.style.display = 'none'; // Hide if no matches
    }
});

/*
inputServicio.addEventListener('input', (event) => {
  const valorBuscado = event.target.value.toLowerCase();
  const serviciosFiltrados = servicios.filter(servicio => 
    servicio.toLowerCase().includes(valorBuscado));
    
    if (valorBuscado.trim() === '') {
        return;
    }
     
    if (serviciosFiltrados.length > 0) {
        Swal.fire({
        title: 'Selecciona un servicio',
        input: 'select',
        inputOptions: {
            servicios: serviciosFiltrados
        },
        inputPlaceholder: 'Selecciona una opción'
        }).then((result) => {
        if (result.isConfirmed) {
            // Actualiza el valor del select con el servicio seleccionado
            selectServicios.value = result.value;
            inputServicio.value = result.value; // Opcional: Limpia el campo de búsqueda
        }
        });
    } else {
        // Si no hay coincidencias, puedes mostrar un mensaje o limpiar el campo
        Swal.fire('No se encontraron servicios');
    }
});


inputServicio.addEventListener('input', (event) => {
  const valorBusqueda = event.target.value;
  listaSugerencias.innerHTML = '';

  if (valorBusqueda.trim() === '') {
    return;
  }

  const sugerencias = serviciosBD.filter(servicio =>
    servicio.toLowerCase().includes(valorBusqueda.toLowerCase())
  );

  sugerencias.forEach(sugerencia => {
    const li = document.createElement('li');
    li.textContent = sugerencia;
    // Agregar clase para estilos al pasar el cursor
    li.classList.add('suggestion-item');
    li.addEventListener('click', () => {
      inputServicio.value = sugerencia;
      listaSugerencias.innerHTML = '';
    });
    listaSugerencias.appendChild(li);
  });
});
*/
/*------- Servicios_Agregar --------*/
btnAgregar.addEventListener('click', () => {
    const servicio = searchInput.value.trim();

    if (servicio !== '') {
        const existeEnSelect = Array.from(selectServicios.options).some(option => option.textContent.toLowerCase() === servicio.toLowerCase());

        if (!existeEnSelect) {
            const option = document.createElement('option');
            option.value = servicioKey.value;
            option.textContent = servicio;
            //option.dataset.key = servicioKey.value; // Replace with the actual key
            option.dataset.estado = servicioEstado.value; // Replace with the actual state

            selectServicios.appendChild(option);
            console.log('Valor:', option.textContent);
            console.log('Key:', option.value);
            console.log('estado:', option.dataset.estado);

            searchInput.value = '';
            servicioKey.value= '';
            servicioEstado.value= '';
        } else {
            alert('El servicio ya ha sido agregado.');
        }
    }
});

btnEliminar.addEventListener('click', () => {
    const opcionSeleccionada = selectServicios.value;
    const option = selectServicios.querySelector(`option[value="${opcionSeleccionada}"]`);
    selectServicios.removeChild(option);
});

const telefonoInput = document.getElementById('telefono');

telefonoInput.addEventListener('input', function() {
  // Eliminar cualquier carácter no numérico
  this.value = this.value.replace(/\D/g, '');

  // Formatear el valor
  if (this.value.length > 0) {
    this.value = this.value.replace(/(\d{3})(\d{2})(\d+)/, '($1) $2-$3');
  }
});

$(document).ready(function() {
    // Inicializar el checkbox como desmarcado
    $('#cCelula').prop('checked', false);

    // Escuchar el evento change del checkbox
    $('#cCelula').change(function() {
        // Obtener el estado actual del checkbox
        const isChecked = $(this).is(':checked');
        // Actualizar el valor en tu variable o realizar otras acciones
        cCelula = isChecked;
        console.log('El checkbox está', isChecked ? 'marcado' : 'desmarcado');
    });
    // Inicializar el checkbox como desmarcado
    $('#cPrimera').prop('checked', false);

    // Escuchar el evento change del checkbox
    $('#cPrimera').change(function() {
        // Obtener el estado actual del checkbox
        const isChecked = $(this).is(':checked');
        // Actualizar el valor en tu variable o realizar otras acciones
        cPrimera = isChecked;
        console.log('El checkbox está', isChecked ? 'marcado' : 'desmarcado');
    });
    // Inicializar el checkbox como desmarcado
    $('#cPalabra').prop('checked', false);

    // Escuchar el evento change del checkbox
    $('#cPalabra').change(function() {
        // Obtener el estado actual del checkbox
        const isChecked = $(this).is(':checked');
        // Actualizar el valor en tu variable o realizar otras acciones
        cPalabra = isChecked;
        console.log('El checkbox está', isChecked ? 'marcado' : 'desmarcado');
    });
    // Inicializar el checkbox como desmarcado
    $('#cDiscipulado').prop('checked', false);

    // Escuchar el evento change del checkbox
    $('#cDiscipulado').change(function() {
        // Obtener el estado actual del checkbox
        const isChecked = $(this).is(':checked');
        // Actualizar el valor en tu variable o realizar otras acciones
        cDiscipulado = isChecked;
        console.log('El checkbox está', isChecked ? 'marcado' : 'desmarcado');
    });

    // Escuchar el evento change del checkbox
    // Inicializar el checkbox como desmarcado
    $('#cHijos').prop('checked', false);
    $('#cHijos').change(function() {
        // Obtener el estado actual del checkbox
        const isChecked = $(this).is(':checked');
        // Actualizar el valor en tu variable o realizar otras acciones
        cHijos = isChecked;
        console.log('El checkbox está', isChecked ? 'marcado' : 'desmarcado');
    });

});

function buscarCongregante(nombre) {
    const tabla = document.querySelector('.tabla1');
    const filas = tabla.querySelectorAll('tr');

    filas.forEach((fila, index) => {
        // Verificamos si la fila es la primera de un grupo de 3
        if (index % 3 === 0) {
            const celdaNombre = fila.cells[1]; // Seleccionamos la segunda celda (índice 1)
            console.log("celdaNombre:",celdaNombre);

            if (celdaNombre) {
                const nombreCongregante = celdaNombre.textContent.toLowerCase();
                const nombreBuscado = nombre.toLowerCase();

                console.log("nombreCongregante:",nombreCongregante);
                console.log("nombreBuscado:",nombreBuscado);

                if (nombreCongregante.includes(nombreBuscado)) {
                    // Mostrar la fila y sus dos siguientes
                    fila.style.display = '';
                    fila.nextElementSibling.style.display = '';
                    fila.nextElementSibling.nextElementSibling.style.display = '';
                } else {
                    // Ocultar la fila y sus dos siguientes
                    fila.style.display = 'none';
                    if (fila.nextElementSibling) {
                        fila.nextElementSibling.style.display = 'none';
                        if (fila.nextElementSibling.nextElementSibling) {
                            fila.nextElementSibling.nextElementSibling.style.display = 'none';
                        }
                    }
                }
            } else {
                console.error('Celda de nombre no encontrada en la fila:', index);
            }
        }
    });
}

const inputBusqueda = document.getElementById('input-busqueda');
inputBusqueda.addEventListener('input', () => {
    const nombreBuscado = inputBusqueda.value;
    buscarCongregante(nombreBuscado);
});

// Obtén el botón por su ID
const btnReporte = document.getElementById('btn-reporte');

// Agrega un evento de clic al botón
btnReporte.addEventListener('click', () => {
    // Abre la nueva página en una nueva pestaña o ventana
    window.open('../reportes/rCongregantes.html', '_blank');
});

function generarReporte() {
    database.ref('sgi/catalogos/congregantes').once('value', (snapshot) => {
      const congregantes = snapshot.val();
      const congregantesArray = Object.values(congregantes); // Convertir a array
  
      // Crear un template para la tabla (similar a las respuestas anteriores)
      const template = document.createElement('template');
      // ...
  
      // Rellenar la tabla con los datos (iterando sobre el array)
      const tbody = template.content.querySelector('tbody');
      congregantesArray.forEach(congregante => {
        const newRow = tbody.insertRow();
        newRow.insertCell().textContent = congregante.nombre;
       });
  
      // Agregar la tabla al DOM (similar a las respuestas anteriores)
      const reporteDiv = document.getElementById('reporte');
      reporteDiv.innerHTML = '';
      reporteDiv.appendChild(template.content.cloneNode(true));
    });
  }
