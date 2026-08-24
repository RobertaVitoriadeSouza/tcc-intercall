document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('.conta-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var senha = document.getElementById('contaSenha');
      var confirmar = document.getElementById('contaConfirmarSenha');
      if (senha.value !== confirmar.value) {
        alert('As senhas não coincidem.');
        return;
      }
      alert('Criação de conta ainda não conectada a um sistema real.');
    });
  }
});
