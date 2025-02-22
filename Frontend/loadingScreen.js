// Create loading screen elements
export const loadingScreen = document.createElement('div');
loadingScreen.id = 'loadingScreen';
loadingScreen.style.position = 'fixed';
loadingScreen.style.top = '0';
loadingScreen.style.left = '0';
loadingScreen.style.width = '100%';
loadingScreen.style.height = '100%';
loadingScreen.style.backgroundColor = 'rgba(0, 0, 0, 1)';
loadingScreen.style.color = 'white';
loadingScreen.style.display = 'flex';
loadingScreen.style.flexDirection = 'column';
loadingScreen.style.justifyContent = 'center';
loadingScreen.style.alignItems = 'center';
loadingScreen.style.fontSize = '24px';

// Create loading text
export const loadingText = document.createElement('div');
loadingText.innerHTML = 'Generating World 0%';
loadingScreen.appendChild(loadingText);

// Create loading bar container
const loadingBarContainer = document.createElement('div');
loadingBarContainer.style.width = '50%';
loadingBarContainer.style.height = '10px';
loadingBarContainer.style.backgroundColor = '#333';
loadingBarContainer.style.borderRadius = '5px';
loadingBarContainer.style.marginTop = '50px';

// Create loading bar
export const loadingBar = document.createElement('div');
loadingBar.style.width = '0%';
loadingBar.style.height = '100%';
loadingBar.style.backgroundColor = 'white';
loadingBar.style.borderRadius = '5px';

// Append loading bar to container
loadingBarContainer.appendChild(loadingBar);
loadingScreen.appendChild(loadingBarContainer);

document.body.appendChild(loadingScreen);

export let loadedModels = 0;
export const totalModels = 17; // Update this count based on the total number of models
export let currentProgress = 0; // Track current progress for smooth transition
export let loadingComplete = false; // Track if loading is complete

export function updateLoadingScreen() {
  loadedModels++;
  const targetProgress = Math.floor((loadedModels / totalModels) * 100);
  
  // Smoothly update the progress
  const updateInterval = setInterval(() => {
    if (currentProgress < targetProgress) {
      currentProgress++;
      loadingText.innerHTML = `Generating World ${currentProgress}%`;
      loadingBar.style.width = `${currentProgress}%`;
    } else {
      clearInterval(updateInterval);
      if (loadedModels === totalModels) {
        setTimeout(() => {
          loadingScreen.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
          loadingScreen.style.opacity = '0';
          loadingScreen.style.transform = 'translateY(-100%)';
          setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingComplete = true; // Set loading complete to true
          }, 1000);
        }, 500);
      }
    }
  }, 10); // Adjust the interval time for smoother or faster transitions
}
