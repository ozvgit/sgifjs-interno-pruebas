
// Importa las funciones necesarias de Firebase
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

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


// Función para autenticar al usuario
function login(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            //alert(user.uid);
            const mensaje = "Usuario Valido";
            mostrarAlerta(mensaje,'info','Pagina de acceso');
            console.log("Usuario autenticado:", user);
            // Aquí puedes acceder a la base de datos
            //window.location.href = "/intranet/asistencias/visorAsistencias.html";
            readData(user.uid);
        })
        .catch((error) => {
            //alert(error);
            const mensaje = "Usuario Invalido";
            mostrarAlerta(mensaje,'error', 'Pagina de acceso');
            console.error("Error al autenticar:", error);
        });
}

// Función para leer datos de la base de datos
/*
function readData(userId) {
    const dbRef = ref(database);
    get(child(dbRef, `users/${userId}`)).then((snapshot) => {
        if (snapshot.exists()) {
            console.log("Datos:", snapshot.val());
        } else {
            console.log("No hay datos disponibles");
        }
    }).catch((error) => {
        console.error("Error al leer datos:", error);
    });
}
    */

function readData(uid) {
    const database = getDatabase(app);
    const userRef = ref(database, `sgi/usuarios/${uid}`);

    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("Datos adicionales del usuario:", userData);
            // Aquí puedes manejar los datos adicionales del usuario como desees

            //Obtener la descripcion del role
            getRoleDescription(userData.role, userData.iglesia);
            // Redirigir a la página del menú basado en el rol

            //redirectToMenu(userData.rol);
        } else {
            console.log("No se encontraron datos del usuario.");
        }
    }).catch((error) => {
        console.error("Error al obtener los datos del usuario:", error);
    });
}

// Función para redirigir al usuario basado en el rol
function redirectToMenu(rol, idIglesia) {
    const menuUrl = `/intranet/menu/menu.html?rol=${rol}&iglesia=${idIglesia}`;
    window.location.href = menuUrl; // Redirige a la página del menú
}

// Función para obtener la descripción del rol
function getRoleDescription(roleId, iglesiaId) {
    const roleRef = ref(database, `sgi/congregantes/roles/${roleId}`);

    get(roleRef).then((snapshot) => {
        if (snapshot.exists()) {
            const roleData = snapshot.val();
            console.log("Descripción del rol:", roleData.descripcion);

            // Mostrar el menú basado en la descripción del rol
            redirectToMenu(roleData.descripcion, iglesiaId);
        } else {
            console.log("No se encontraron datos del rol.");
        }
    }).catch((error) => {
        console.error("Error al obtener la descripción del rol:", error);
    });
}

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    login(email, password);
});

function mostrarAlerta(Pmensaje,Picono, Ptitulo) {
    
    Swal.fire({
        title: Ptitulo,
        text: Pmensaje,
        icon: Picono,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    });

}


// Función para desloguear al usuario
function logout() {
    signOut(auth).then(() => {
        console.log("Usuario deslogueado");
        //window.location.href = "../acceso/login.html";
    }).catch((error) => {
        console.error("Error al desloguear:", error);
    });
}

// Llama a la función logout cuando se carga la página de login
window.addEventListener("load", logout);

