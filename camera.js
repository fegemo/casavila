const cameraEl = document.querySelector('.camera');

function showCamera(e) {
    const pictureEl = e.currentTarget;
    const camSettings = pictureEl.dataset.cam.split('x');
    const isWideCamera = pictureEl.classList.contains('panoramic');

    // acha posição e ângulo da câmera
    const x = +camSettings[0] / 10;
    const y = +camSettings[1] / 7.5;
    const alpha = +camSettings[2];

    // posiciona elemento
    cameraEl.style.left = `calc(${x}% - var(--size) / 2)`;
    cameraEl.style.top = `calc(${y}% - var(--size) / 2)`;
    cameraEl.style.transform = `rotate(-${alpha}deg)`;
    cameraEl.classList.toggle('wide', isWideCamera);

    // mostra
    cameraEl.style.opacity = 1;
}

function hideCamera(e) {
    cameraEl.style.opacity = 0;
}





const galleryImagesWithCamera = document.querySelectorAll('.gallery figure[data-cam]');

for (let el of galleryImagesWithCamera) {
    el.addEventListener('mouseover', showCamera);
    el.addEventListener('mouseout', hideCamera);
}