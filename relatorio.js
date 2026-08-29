document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.rel-qty button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var span = btn.parentElement.querySelector('span');
      var value = parseInt(span.textContent, 10);
      var isPlus = btn.textContent.trim() === '+';
      value = isPlus ? value + 1 : Math.max(1, value - 1);
      span.textContent = value;
    });
  });

  document.querySelectorAll('.rel-remove').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('.rel-row').remove();
    });
  });

  var search = document.querySelector('.rel-search input');
  if (search) {
    search.addEventListener('input', function () {
      var term = search.value.trim().toLowerCase();
      document.querySelectorAll('.rel-row').forEach(function (row) {
        var name = row.querySelector('.rel-product').textContent.toLowerCase();
        row.style.display = name.includes(term) ? '' : 'none';
      });
    });
  }
});
