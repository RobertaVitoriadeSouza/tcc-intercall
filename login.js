document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('.login-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Login ainda não conectado a um sistema real.');
    });
  }
});
