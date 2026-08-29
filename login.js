document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('.login-form');
  var errorEl = document.getElementById('loginError');
  if (!form) return;

  function showError(message) {
    if (!errorEl) { alert(message); return; }
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (errorEl) errorEl.hidden = true;

    var email = document.getElementById('loginEmail').value.trim();
    var senha = document.getElementById('loginSenha').value;
    var submitBtn = form.querySelector('.login-btn-entrar');
    submitBtn.disabled = true;

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, senha: senha })
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (!result.ok) {
          showError(result.data.error || 'Não foi possível entrar.');
          return;
        }
        localStorage.setItem('intellicart-token', result.data.token);
        localStorage.setItem('intellicart-nome', result.data.nome);
        window.location.href = 'pagina1.html';
      })
      .catch(function () {
        showError('Não foi possível conectar ao servidor. Verifique se ele está rodando.');
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
});
