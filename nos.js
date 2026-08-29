document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('.nos-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Mensagem ainda não conectada a um sistema real.');
      form.reset();
    });
  }
});
