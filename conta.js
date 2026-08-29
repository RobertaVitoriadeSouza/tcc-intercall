document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('.conta-form');
  var errorEl = document.getElementById('contaError');
  if (!form) return;

  function showError(message) {
    if (!errorEl) { alert(message); return; }
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (errorEl) errorEl.hidden = true;

    var email = document.getElementById('contaEmail').value.trim();
    var senha = document.getElementById('contaSenha').value;
    var confirmarSenha = document.getElementById('contaConfirmarSenha').value;

    if (senha !== confirmarSenha) {
      showError('As senhas não coincidem.');
      return;
    }

    var submitBtn = form.querySelector('.login-btn-entrar');
    submitBtn.disabled = true;

    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, senha: senha, confirmarSenha: confirmarSenha })
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (!result.ok) {
          showError(result.data.error || 'Não foi possível criar a conta.');
          return;
        }
        alert('Conta criada com sucesso! Faça login para continuar.');
        window.location.href = 'index.html';
      })
      .catch(function () {
        showError('Não foi possível conectar ao servidor. Verifique se ele está rodando.');
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
});
