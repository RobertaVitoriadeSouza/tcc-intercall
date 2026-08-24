document.addEventListener('DOMContentLoaded', function () {
  var videoFrame = document.querySelector('.video-frame');
  if (videoFrame) {
    videoFrame.addEventListener('click', function () {
      alert('Vídeo demonstrativo em breve.');
    });
  }
});
