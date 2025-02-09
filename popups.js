import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Import GLTFLoader
import { models } from './models.js'; // Import models

let renderer, scene, camera;
const raycaster = new THREE.Raycaster();

function initThreeJS(container) {
    const canvas = document.createElement('canvas'); // Create a new canvas element
    canvas.id = 'modelCanvas'; // Set the id for the canvas
    container.appendChild(canvas); // Append the canvas to the container

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight); // Set the size of the renderer

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const light = new THREE.AmbientLight(0x404040, 3);
    scene.add(light);
}

function renderModel(model) {
    if (!renderer || !scene || !camera) return;

    scene.add(model);
    renderer.render(scene, camera);
}

// Function to load a 3D model
function loadModel(path, onLoad) {
    const loader = new GLTFLoader();
    loader.load(path, function (gltf) {
        const modelScene = gltf.scene.clone();
        onLoad(modelScene);
    });
}

// Function to create and show welcome popup
export function showPopup() {
    let popup = document.getElementById('welcomePopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'welcomePopup';
        popup.className = 'popup';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = function() {
            popup.style.display = 'none';
        };
        
        const message = document.createElement('span');
        message.innerHTML = 'Welcome to the Pokemon World!';
        
        popup.appendChild(closeBtn);
        popup.appendChild(message);
        document.body.appendChild(popup);
    }
    popup.style.display = 'block';
}

// Function to show Pokemon popup
export function showPokemonPopup(pokemonName) {
    const model = models.find(model => model.name === pokemonName);
    if (!model) return;

    const popup = document.getElementById('pokemonPopup');
    const modelContainer = document.getElementById('modelContainer');
    modelContainer.innerHTML = ''; // Clear previous model

    initThreeJS(modelContainer);

    loadModel(model.path, function (modelScene) {
        modelScene.scale.set(model.scale, model.scale, model.scale);
        modelScene.position.set(...model.position);
        modelScene.rotation.set(...model.rotation);
        renderModel(modelScene); // Render the 3D model
    });

    document.getElementById('pokemonName').innerText = pokemonName;
    document.getElementById('pokemonEvolution').innerText = `Evolution: ${model.evolution}`;
    document.getElementById('pokemonType').innerText = `Type: ${model.type.join(', ')}`;
    document.getElementById('pokemonAbilities').innerText = `Abilities: ${model.abilities.join(', ')}`;
    document.getElementById('pokemonHiddenAbility').innerText = `Hidden Ability: ${model.hiddenAbility}`;
    document.getElementById('pokemonWeaknesses').innerText = `Weaknesses: ${model.weaknesses.join(', ')}`;
    document.getElementById('pokemonResistances').innerText = `Resistances: ${model.resistances.join(', ')}`;
    document.getElementById('pokemonHabitat').innerText = `Habitat: ${model.habitat}`;
    document.getElementById('pokemonPokedexEntry').innerText = `Pokedex Entry: ${model.pokedexEntry}`;
    document.getElementById('pokemonHeight').innerText = `Height: ${model.height} m`;
    document.getElementById('pokemonWeight').innerText = `Weight: ${model.weight} kg`;
    document.getElementById('pokemonEggGroup').innerText = `Egg Group: ${model.eggGroup.join(', ')}`;
    document.getElementById('pokemonEvolvesAt').innerText = `Evolves At: Level ${model.evolvesAt}`;
    document.getElementById('pokemonFriendship').innerText = `Friendship: ${model.friendship}`;
    document.getElementById('pokemonBaseExp').innerText = `Base Experience: ${model.baseExp}`;
    document.getElementById('pokemonCatchRate').innerText = `Catch Rate: ${model.catchRate}`;
    document.getElementById('pokemonStats').innerHTML = `
        HP: ${model.baseHP}<br>
        Attack: ${model.stats.attack}<br>
        Defense: ${model.stats.defense}<br>
        Special Attack: ${model.stats.specialAttack}<br>
        Special Defense: ${model.stats.specialDefense}<br>
        Speed: ${model.stats.speed}
    `;
    document.getElementById('pokemonMoves').innerHTML = model.moves.map(move => `${move.name}: ${move.power} Power, ${move.pp} PP`).join('<br>');

    popup.style.display = 'block'; // Ensure the popup is displayed
    popup.classList.add('show'); // Add the show class to animate the popup

    // Show the first page and hide others
    document.querySelectorAll('.page').forEach((page, index) => {
        page.classList.toggle('active', index === 0);
    });

    // Update navigation buttons visibility
    updateNavigationButtons();
}

document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('pokemonPopup').classList.remove('show'); // Remove the show class to hide the popup
        document.getElementById('pokemonPopup').style.display = 'none'; // Hide the popup
        document.getElementById('welcomePopup').style.display = 'none'; // Hide the welcome popup
    });
});

// Function to handle signboard click
function onSignboardClick(event) {
    if (!camera) return; // Ensure camera is initialized

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject.userData.isSignboard) {
            showPopup();
        }
    }
}

// Function to show the Pokémon popup
function onPokemonClick(event) {
    if (!camera) return; // Ensure camera is initialized

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const parentObject = intersects[0].object.parent || intersects[0].object;
        const pokemonModel = models.find(model => model.name === parentObject.userData.pokemonName);
        if (pokemonModel) {
            showPokemonPopup(pokemonModel.name);
        }
    }
}

// Modify the click event listener to handle both signboard and Pokémon clicks
window.addEventListener('click', (event) => {
    onSignboardClick(event);
    onPokemonClick(event);
});

// Navigation buttons
document.getElementById('prevPage').addEventListener('click', () => {
    const pages = document.querySelectorAll('.page');
    const activePage = Array.from(pages).findIndex(page => page.classList.contains('active'));
    if (activePage > 0) {
        pages[activePage].classList.remove('active');
        pages[activePage - 1].classList.add('active');
    }
    updateNavigationButtons();
});

document.getElementById('nextPage').addEventListener('click', () => {
    const pages = document.querySelectorAll('.page');
    const activePage = Array.from(pages).findIndex(page => page.classList.contains('active'));
    if (activePage < pages.length - 1) {
        pages[activePage].classList.remove('active');
        pages[activePage + 1].classList.add('active');
    }
    updateNavigationButtons();
});

function updateNavigationButtons() {
    const pages = document.querySelectorAll('.page');
    const activePage = Array.from(pages).findIndex(page => page.classList.contains('active'));
    document.getElementById('prevPage').style.display = activePage === 0 ? 'none' : 'block';
    document.getElementById('prevPage').innerText = '<';
    document.getElementById('nextPage').style.display = activePage === pages.length - 1 ? 'none' : 'block';
    document.getElementById('nextPage').innerText = '>';
}
