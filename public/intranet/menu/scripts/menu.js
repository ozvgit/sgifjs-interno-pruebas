// Función para obtener parámetros de la URL
function getParameterByName(name) {
    const url = window.location.href;
    const nameRegex = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Cambiar la imagen de fondo del header basado en el rol
window.onload = function() {
    const rol = getParameterByName('rol');
    const iglesiaId = getParameterByName('iglesia');
    const headerElement = document.querySelector('header');

    console.log(`RoleW: ${rol}, Iglesia IDW: ${iglesiaId}`); // Añade esto para depuración

    if (rol === 'pastor') {
        headerElement.style.backgroundImage = "url('../images/fondo2.webp')";
    } else if (rol === 'Ujier') {
        headerElement.style.backgroundImage = "url('../images/fondo5.jpeg')";
    } else {
        headerElement.style.backgroundImage = "url('../images/fondo2.webp')";
    }

    mostrarMenu(rol, iglesiaId);
};

// Mostrar el menú basado en el rol
function mostrarMenu(rol, iglesiaId) {
    console.log(`Rol: ${rol}, Iglesia ID: ${iglesiaId}`); // Asegúrate de que los valores son correctos aquí
    //const rol = getParameterByName('rol');
    //const iglesiaId = getParameterByName('iglesia');
    const headerElement = document.querySelector('header');

    let menuHtml = '<ul>';

    if (rol === 'pastor') {
        menuHtml += `
            <ul>
                <li>Asistencias
                    <ul>
                        <li><a href="dashboard.html">Visor</a></li>
                    </ul>
                </li>
                <li>Gestionar Usuarios
                    <ul>
                        <li><a href="usuarios.html">Usuarios</a></li>
                    </ul>
                </li>
                <li>Catalogos
                    <ul>
                        <li><a href="../../intranet/catalogos/cCongregantes.html">Congregantes</a></li>
                    </ul>
                </li>
        `;
    } else if (rol === 'Ujier') {

        menuHtml += `
            <ul>
                <li>Catalogos
                    <ul>
                        <li><a href="../../intranet/catalogos/cCongregantes.html">Congregantes</a></li>
                    </ul>
                </li>
        `;
    } else {
        menuHtml += `<li><a href="#">Opción predeterminada</a></li>`;
    }

    menuHtml += '</ul>';
    menuHtml += `<p>Role: ${rol}</p>`;
    menuHtml += `<p>ID de la Iglesia: ${iglesiaId}</p>`;
    document.getElementById('menu').innerHTML = menuHtml;
}