document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.monit-qty button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var span = btn.parentElement.querySelector('span');
      var value = parseInt(span.textContent, 10);
      var isPlus = btn.textContent.trim() === '+';
      value = isPlus ? value + 1 : Math.max(1, value - 1);
      span.textContent = value;
    });
  });

  document.querySelectorAll('.monit-remove').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('.monit-row').remove();
    });
  });

  var finalizar = document.querySelector('.monit-btn-finalizar');
  if (finalizar) {
    finalizar.addEventListener('click', function () {
      alert('Compra ainda não conectada a um sistema real.');
    });
  }
});
