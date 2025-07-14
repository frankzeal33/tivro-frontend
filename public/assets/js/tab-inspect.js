document.addEventListener('DOMContentLoaded', function () {

    const landlordContent = document.getElementById('landlordContent');
    const landlordSteps = landlordContent.querySelectorAll('.step-item');
    const processImage = document.getElementById('processImage');
  
    // Function to preload images
    function preloadImages(imageUrls) {
      imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }
  
    // Preload landlord images
    const imageUrls = [];
    landlordSteps.forEach((item) => {
      const imgSrc = item.dataset.image;
      if (imgSrc) imageUrls.push(imgSrc);
    });
    preloadImages(imageUrls);
  
    // Initialize images
    function initializeImage(imageElement) {
      if (imageElement) {
        imageElement.style.opacity = '1';
        imageElement.style.transition = 'opacity 0.5s ease-in-out';
      }
    }
    initializeImage(processImage);
  
    // Function to change image with fade effect
    function changeImageWithFade(imageElement, newSrc) {
      console.log('Changing image to', newSrc);
  
      imageElement.style.transition = 'opacity 0.5s ease-in-out';
      imageElement.style.opacity = '0';
  
      const transitionDuration = 500;
      let transitionEnded = false;
  
      function onFadeOut() {
        if (transitionEnded) return;
        transitionEnded = true;
  
        imageElement.removeEventListener('transitionend', onFadeOut);
  
        const tempImage = new Image();
        tempImage.src = newSrc;
        tempImage.onload = function () {
          imageElement.src = newSrc;
          imageElement.style.opacity = '1';
        };
      }
  
      imageElement.addEventListener('transitionend', onFadeOut);
      setTimeout(onFadeOut, transitionDuration + 50);
    }
  
    // Event listeners for landlord steps
    landlordSteps.forEach((item) => {
      const header = item.querySelector('.step-header');
      const content = item.querySelector('.step-content');
      const toggleBtn = item.querySelector('.toggle-btn');
  
      header.addEventListener('click', () => {
        const isActive = content.classList.contains('show');
  
        // Deactivate all steps
        landlordSteps.forEach((step) => {
          step.querySelector('.step-content').classList.remove('show');
          step.querySelector('.toggle-btn').innerHTML = '<i class="fas fa-plus"></i>';
          step.classList.remove('active');
        });
  
        if (!isActive) {
          // Activate clicked step
          content.classList.add('show');
          toggleBtn.innerHTML = '<i class="fas fa-minus"></i>';
          item.classList.add('active');
  
          const newImage = item.dataset.image;
          if (newImage && processImage) {
            changeImageWithFade(processImage, newImage);
          }
        }
      });
    });
  
    // Show landlord content by default on page load
    landlordContent.classList.remove('d-none');
  
  });
  