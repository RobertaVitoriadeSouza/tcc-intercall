document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.ref-link[href="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      alert('Link do artigo ainda não cadastrado.');
    });
  });
});
