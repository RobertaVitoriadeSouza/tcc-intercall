
document.addEventListener('DOMContentLoaded', function () {
  var videoFrame = document.querySelector('.jogo-video-frame');

  if (videoFrame) {
    videoFrame.addEventListener('click', function (event) {
      event.preventDefault();

      window.open(
        'https://intellicartgame.vercel.app/',
        '_blank',
        'noopener,noreferrer'
      );
    });
  }
});

