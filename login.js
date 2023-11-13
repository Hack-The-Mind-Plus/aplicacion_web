document.addEventListener("DOMContentLoaded", function() {
    var $loginMsg = $('.loginMsg'),
        $login = $('.login'),
        $signupMsg = $('.signupMsg'),
        $signup = $('.signup'),
        $frontbox = $('.frontbox'),
        $mainHeader = $('.main-header');

 // Función para intentar iniciar sesión
    window.attemptLogin = function() {
        // Lógica de inicio de sesión...
        // En caso de error, redirigir a la página de mensajes
        showMessage("error404");
        window.location.href = "messages.html#error404";
    };

    // Función para intentar registrarse
    window.attemptSignup = function() {
        // Lógica de registro...
        // En caso de error, redirigir a la página de mensajes
        showMessage("error401");
        window.location.href = "messages.html#error401";
    };

    $('#switch1').on('click', function() {
        $loginMsg.toggleClass("visibility");
        $frontbox.addClass("moving");
        $signupMsg.toggleClass("visibility");

        $signup.removeClass('hide');
        $login.addClass('hide');

        $frontbox.removeClass('hide');

        // Desplazar la página hacia el frontbox de registro
        $frontbox[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Ocultar el encabezado al hacer clic en el botón
        $mainHeader.addClass('hide-header');
    });

    $('#switch2').on('click', function() {
        $loginMsg.toggleClass("visibility");
        $frontbox.removeClass("moving");
        $signupMsg.toggleClass("visibility");

        $signup.addClass('hide');
        $login.removeClass('hide');

        $frontbox.removeClass('hide');

        // Desplazar la página hacia el frontbox de inicio de sesión
        $frontbox[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Ocultar el encabezado al hacer clic en el botón
        $mainHeader.addClass('hide-header');
    });

    // Ocultar el frontbox al cargar la página
    $frontbox.addClass('hide');

    // Mostrar el encabezado al llegar al principio de la página
    window.addEventListener('scroll', function() {
        if (window.scrollY === 0) {
            $mainHeader.removeClass('hide-header');
        }
    });
});
