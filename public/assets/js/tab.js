document.addEventListener('DOMContentLoaded', function () {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  const landlordContent = document.getElementById('landlordContent');
  const landlordSteps = landlordContent.querySelectorAll('.step-item');

  const tenantContent = document.getElementById('tenantContent');
  const tenantSteps = tenantContent.querySelectorAll('.step-item');

  const processImage = document.getElementById('processImage');
  const tenantProcessImage = document.getElementById('tenantProcessImage');

  // Function to preload images
  function preloadImages(imageUrls) {
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }

  // Preload images from both landlord and tenant steps
  const imageUrls = [];
  landlordSteps.forEach((item) => {
    const imgSrc = item.dataset.image;
    if (imgSrc) imageUrls.push(imgSrc);
  });
  tenantSteps.forEach((item) => {
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
  initializeImage(tenantProcessImage);

  // Function to change image with fade effect
  function changeImageWithFade(imageElement, newSrc) {
    console.log('Changing image for', imageElement.id, 'to', newSrc);

    imageElement.style.transition = 'opacity 0.5s ease-in-out';

    // Fade out the current image
    imageElement.style.opacity = '0';

    // Fallback in case 'transitionend' doesn't fire
    const transitionDuration = 500;
    let transitionEnded = false;

    function onFadeOut() {
      if (transitionEnded) return;
      transitionEnded = true;

      imageElement.removeEventListener('transitionend', onFadeOut);

      // Preload the new image
      const tempImage = new Image();
      tempImage.src = newSrc;
      tempImage.onload = function () {
        // Change the image source
        imageElement.src = newSrc;

        // Fade in the new image
        imageElement.style.opacity = '1';
      };
    }

    imageElement.addEventListener('transitionend', onFadeOut);
    setTimeout(onFadeOut, transitionDuration + 50);
  }

  // Tab switching functionality
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      console.log('Switching to tab:', button.dataset.userType);

      // Remove active class from all buttons
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      const userType = button.dataset.userType;

      // Hide all tab contents
      tabContents.forEach((content) => {
        content.classList.add('d-none');
      });

      // Show the selected tab content
      const activeContent = document.getElementById(`${userType}Content`);
      if (activeContent) {
        activeContent.classList.remove('d-none');

        // Reset first step in the active content
        const firstStepItem = activeContent.querySelector('.step-item');
        if (firstStepItem) {
          // Reset all step items in the active content
          const stepItemsInContent = activeContent.querySelectorAll('.step-item');
          stepItemsInContent.forEach((item) => {
            item.classList.remove('active');
            const content = item.querySelector('.step-content');
            const toggleBtn = item.querySelector('.toggle-btn');

            content.classList.remove('show');
            toggleBtn.innerHTML = '<i class="fas fa-plus"></i>';
          });

          // Activate first step
          firstStepItem.classList.add('active');
          const firstStepContent = firstStepItem.querySelector('.step-content');
          const firstStepToggleBtn = firstStepItem.querySelector('.toggle-btn');

          firstStepContent.classList.add('show');
          firstStepToggleBtn.innerHTML = '<i class="fas fa-minus"></i>';

          // Update image for the active tab
          const imageElementId = userType === 'landlord' ? 'processImage' : 'tenantProcessImage';
          const imageElement = document.getElementById(imageElementId);

          if (imageElement) {
            // Reset opacities
            if (userType === 'landlord') {
              processImage.style.opacity = '1';
              if (tenantProcessImage) tenantProcessImage.style.opacity = '0';
            } else {
              tenantProcessImage.style.opacity = '1';
              if (processImage) processImage.style.opacity = '0';
            }

            const newImage = firstStepItem.dataset.image;
            if (newImage) {
              changeImageWithFade(imageElement, newImage);
            }
          }
        }
      }
    });
  });

  // Event listeners for landlord steps
  landlordSteps.forEach((item) => {
    const header = item.querySelector('.step-header');
    const content = item.querySelector('.step-content');
    const toggleBtn = item.querySelector('.toggle-btn');

    header.addEventListener('click', () => {
      const isActive = content.classList.contains('show');

      // Deactivate all landlord steps
      landlordSteps.forEach((step) => {
        step.querySelector('.step-content').classList.remove('show');
        step.querySelector('.toggle-btn').innerHTML = '<i class="fas fa-plus"></i>';
        step.classList.remove('active');
      });

      if (!isActive) {
        // Activate the clicked step
        content.classList.add('show');
        toggleBtn.innerHTML = '<i class="fas fa-minus"></i>';
        item.classList.add('active');

        // Update the image
        if (processImage) {
          const newImage = item.dataset.image;
          if (newImage) {
            changeImageWithFade(processImage, newImage);
          }
        }
      }
    });
  });

  // Event listeners for tenant steps
  tenantSteps.forEach((item) => {
    const header = item.querySelector('.step-header');
    const content = item.querySelector('.step-content');
    const toggleBtn = item.querySelector('.toggle-btn');

    header.addEventListener('click', () => {
      const isActive = content.classList.contains('show');

      // Deactivate all tenant steps
      tenantSteps.forEach((step) => {
        step.querySelector('.step-content').classList.remove('show');
        step.querySelector('.toggle-btn').innerHTML = '<i class="fas fa-plus"></i>';
        step.classList.remove('active');
      });

      if (!isActive) {
        // Activate the clicked step
        content.classList.add('show');
        toggleBtn.innerHTML = '<i class="fas fa-minus"></i>';
        item.classList.add('active');

        // Update the image
        if (tenantProcessImage) {
          const newImage = item.dataset.image;
          if (newImage) {
            changeImageWithFade(tenantProcessImage, newImage);
          }
        }
      }
    });
  });

  // Ensure the default tab is set correctly on page load
  // Simulate a click on the active tab button
  const activeTabButton = document.querySelector('.tab-btn.active');
  if (activeTabButton) {
    activeTabButton.click();
  }
});