// Importa las funciones necesarias de Firebase
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getDatabase, ref, set, get, child, push, onValue } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

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

const congregantesRef = ref(database, 'sgi/congregantes');
const iglesiasRef = ref(database, 'iglesias');
const serviciosRef = ref(database, 'servicios');

let iglesiasData = [];
let serviciosData = [];
let congregantesData = [];

// Función para cargar los datos iniciales
const cargarDatos = async () => {
    iglesiasData = (await get(iglesiasRef)).val();
    serviciosData = (await get(serviciosRef)).val();
    congregantesData = (await get(congregantesRef)).val();
    renderizarCongregantes(congregantesData);
};

// Función para renderizar la lista de congregantes
const renderizarCongregantes = (data) => {
    const congregantesList = document.getElementById('congregantes');
    congregantesList.innerHTML = '';
  
    for (const uid in data) {
      const congregante = data[uid];
      const li = document.createElement('li');
      li.classList.add('congregante');
  
      // Crear elementos para el nombre, selects y botones
      const nombre = document.createElement('span');
      nombre.textContent = congregante.nombre;
  
      const iglesiasSelect = document.createElement('select');
      // Llenar el select con las opciones de iglesias
      for (const iglesiaId in iglesiasData) {
        const option = document.createElement('option');
        option.value = iglesiaId;
        option.textContent = iglesiasData[iglesiaId].nombre; // Ajusta según tu estructura
        iglesiasSelect.appendChild(option);
      }
  
      // Similarmente, crear el select para servicios
  
      const borrarBtn = document.createElement('button');
      borrarBtn.textContent = 'Borrar';
      borrarBtn.addEventListener('click', () => {
        // Lógica para borrar el congregante de la base de datos
        remove(ref(database, `congregantes/${uid}`));
      });
  
      const editarBtn = document.createElement('button');
      editarBtn.textContent = 'Editar';
      editarBtn.addEventListener('click', () => {
        // Lógica para mostrar un formulario de edición
      });
  
      li.appendChild(nombre);
      li.appendChild(iglesiasSelect);
      // ... agregar el select de servicios
      li.appendChild(borrarBtn);
      li.appendChild(editarBtn);
      congregantesList.appendChild(li);
    }
  };
  
  // Llamar a la función para cargar los datos al inicio
  cargarDatos();


const agregarCongregante = async (nombre, iglesiasIds, serviciosIds) => {
  await push(congregantesRef, { nombre, iglesias: iglesiasIds, servicios: serviciosIds });
  cargarDatos(); // Recarga los datos para mostrar el nuevo congregante
};

const buscarCongregante = (busqueda) => {
  // Implementa la lógica de búsqueda aquí
  // Puedes filtrar los datos de congregantesData y luego llamar a renderizarCongregantes
};

const agregarCongreganteBtn = document.getElementById('agregar-congregante');
agregarCongreganteBtn.addEventListener('click', () => {
  // Muestra un formulario o modal para ingresar los datos del nuevo congregante
  // Luego, llama a la función agregarCongregante con los datos ingresados
});

const buscador = document.getElementById('buscador');
buscador.addEventListener('input', () => {
  const busqueda = buscador.value.toLowerCase();
  buscarCongregante(busqueda);
});

