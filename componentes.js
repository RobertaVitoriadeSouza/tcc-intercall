document.addEventListener('DOMContentLoaded', function () {
  var track = document.querySelector('.products-track');
  if (!track) return;

  track.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      track.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });
});
