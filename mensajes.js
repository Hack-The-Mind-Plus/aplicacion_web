document.addEventListener("DOMContentLoaded", function() {
    var error404Message = document.getElementById("error404");
    var redirectToLoginButton = document.getElementById("redirectToLogin");

    // Mostrar el mensaje de error 404
    error404Message.style.display = "block";

    // Redirigir a la página de login al hacer clic en el botón
    redirectToLoginButton.addEventListener("click", function() {
        window.location.href = "login.html";
    });
});