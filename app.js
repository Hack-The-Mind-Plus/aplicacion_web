    document.addEventListener('DOMContentLoaded', function () {
        // Obtener referencia al botón de cerrar sesión
        const logoutButton = document.getElementById('logoutButton');

        // Agregar un evento de clic al botón
        logoutButton.addEventListener('click', function () {
            // Redirigir al usuario a la ruta de cierre de sesión
            window.location.href = '/cerrar_sesion';
        });
    });

