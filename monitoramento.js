document.addEventListener('DOMContentLoaded', function () {
  var productsEl = document.querySelector('.monit-products');
  var subtotalEl = document.querySelector('.monit-total-line span:last-child');
  var totalEl = document.querySelector('.monit-total-line--big span:last-child');

  function toBRL(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }

  function updateTotals() {
    var subtotal = 0;
    document.querySelectorAll('.monit-row').forEach(function (row) {
      var unit = parseFloat(row.dataset.unitPrice || '0');
      var qty = parseInt(row.querySelector('.monit-qty span').textContent, 10);
      var rowTotal = unit * qty;
      row.querySelector('.monit-total').textContent = toBRL(rowTotal);
      subtotal += rowTotal;
    });
    if (subtotalEl) subtotalEl.textContent = toBRL(subtotal);
    if (totalEl) totalEl.textContent = toBRL(subtotal);
  }

  function wireRow(row) {
    row.querySelectorAll('.monit-qty button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var span = row.querySelector('.monit-qty span');
        var value = parseInt(span.textContent, 10);
        var isPlus = btn.textContent.trim() === '+';
        value = isPlus ? value + 1 : Math.max(1, value - 1);
        span.textContent = value;
        updateTotals();
      });
    });
    var removeBtn = row.querySelector('.monit-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        row.remove();
        updateTotals();
      });
    }
  }

  document.querySelectorAll('.monit-row').forEach(wireRow);
  updateTotals();

  var finalizar = document.querySelector('.monit-btn-finalizar');
  if (finalizar) {
    finalizar.addEventListener('click', function () {
      alert('Compra ainda não conectada a um sistema real.');
    });
  }

  // Sugestões: adicionar ao carrinho
  document.querySelectorAll('.monit-add-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.monit-suggest-card');
      var name = card.dataset.name;
      var price = parseFloat(card.dataset.price);
      var thumb = card.querySelector('.monit-thumb');

      var existingRow = null;
      document.querySelectorAll('.monit-row').forEach(function (row) {
        if (row.dataset.name === name) existingRow = row;
      });

      if (existingRow) {
        var span = existingRow.querySelector('.monit-qty span');
        span.textContent = parseInt(span.textContent, 10) + 1;
      } else {
        var row = document.createElement('div');
        row.className = 'monit-row';
        row.dataset.unitPrice = price;
        row.dataset.name = name;
        row.innerHTML =
          '<span class="monit-product">' +
            '<span class="monit-thumb" style="background:' + getComputedStyle(thumb).backgroundColor + '">' + thumb.textContent + '</span>' +
            name +
          '</span>' +
          '<span class="monit-qty">' +
            '<button type="button" aria-label="Diminuir">−</button>' +
            '<span>1</span>' +
            '<button type="button" aria-label="Aumentar">+</button>' +
          '</span>' +
          '<span class="monit-total">' + toBRL(price) + '</span>' +
          '<button type="button" class="monit-remove" aria-label="Remover ' + name + '">✕</button>';
        productsEl.insertBefore(row, document.querySelector('.monit-suggest-head'));
        wireRow(row);
      }

      updateTotals();

      card.classList.add('monit-just-added');
      btn.classList.add('monit-added-pulse');
      setTimeout(function () {
        card.classList.remove('monit-just-added');
        btn.classList.remove('monit-added-pulse');
      }, 200);
    });
  });

  // Carrossel de sugestões
  var track = document.querySelector('.monit-suggest-track');
  var prevBtn = document.querySelector('.monit-carousel-prev');
  var nextBtn = document.querySelector('.monit-carousel-next');

  function updateCarouselButtons() {
    if (!track || !prevBtn || !nextBtn) return;
    prevBtn.disabled = track.scrollLeft <= 4;
    nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }

  if (track && prevBtn && nextBtn) {
    var scrollByAmount = function () {
      var card = track.querySelector('.monit-suggest-card');
      return card ? card.getBoundingClientRect().width + 16 : 200;
    };
    prevBtn.addEventListener('click', function () {
      track.scrollBy({ left: -scrollByAmount() * 2, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', function () {
      track.scrollBy({ left: scrollByAmount() * 2, behavior: 'smooth' });
    });
    track.addEventListener('scroll', updateCarouselButtons);
    updateCarouselButtons();
  }
});
