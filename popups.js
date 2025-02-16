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
    }, undefined, function (error) {
        console.error('An error occurred while loading the model:', error);
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
        closeBtn.onclick = function () {
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

    // Display image if the imagePath is provided
    if (model.imagePath) {
        const img = document.createElement('img');
        img.src = model.imagePath;
        img.style.width = '100%';
        img.style.height = 'auto';
        modelContainer.appendChild(img);
    } else {
        // Load and display 3D model
        initThreeJS(modelContainer);

        loadModel(model.path, function (modelScene) {
            modelScene.scale.set(model.scale, model.scale, model.scale);
            modelScene.position.set(...model.position);
            modelScene.rotation.set(...model.rotation);
            renderModel(modelScene); // Render the 3D model
        });
    }

    const pokemonNameElement = document.getElementById('pokemonName');
    if (pokemonNameElement) pokemonNameElement.innerText = pokemonName;

    const pokemonEvolutionElement = document.getElementById('pokemonEvolution');
    if (pokemonEvolutionElement) pokemonEvolutionElement.innerText = `Evolution: ${model.evolution}`;

    const pokemonTypeElement = document.getElementById('pokemonType');
    if (pokemonTypeElement) pokemonTypeElement.innerText = `Type: ${model.type.join(', ')}`;

    const pokemonAbilitiesElement = document.getElementById('pokemonAbilities');
    if (pokemonAbilitiesElement) pokemonAbilitiesElement.innerText = `Abilities: ${model.abilities.join(', ')}`;

    const pokemonHiddenAbilityElement = document.getElementById('pokemonHiddenAbility');
    if (pokemonHiddenAbilityElement) pokemonHiddenAbilityElement.innerText = `Hidden Ability: ${model.hiddenAbility}`;

    const pokemonWeaknessesElement = document.getElementById('pokemonWeaknesses');
    if (pokemonWeaknessesElement) pokemonWeaknessesElement.innerText = `Weaknesses: ${model.weaknesses.join(', ')}`;

    const pokemonResistancesElement = document.getElementById('pokemonResistances');
    if (pokemonResistancesElement) pokemonResistancesElement.innerText = `Resistances: ${model.resistances.join(', ')}`;

    const pokemonHabitatElement = document.getElementById('pokemonHabitat');
    if (pokemonHabitatElement) pokemonHabitatElement.innerText = `Habitat: ${model.habitat}`;

    const pokemonPokedexEntryElement = document.getElementById('pokemonPokedexEntry');
    if (pokemonPokedexEntryElement) pokemonPokedexEntryElement.innerText = `Pokedex Entry: ${model.pokedexEntry}`;

    const pokemonHeightElement = document.getElementById('pokemonHeight');
    if (pokemonHeightElement) pokemonHeightElement.innerText = `Height: ${model.height} m`;

    const pokemonWeightElement = document.getElementById('pokemonWeight');
    if (pokemonWeightElement) pokemonWeightElement.innerText = `Weight: ${model.weight} kg`;

    const pokemonEggGroupElement = document.getElementById('pokemonEggGroup');
    if (pokemonEggGroupElement) pokemonEggGroupElement.innerText = `Egg Group: ${model.eggGroup.join(', ')}`;

    const pokemonEvolvesAtElement = document.getElementById('pokemonEvolvesAt');
    if (pokemonEvolvesAtElement) pokemonEvolvesAtElement.innerText = `Evolves At: Level ${model.evolvesAt}`;

    const pokemonFriendshipElement = document.getElementById('pokemonFriendship');
    if (pokemonFriendshipElement) pokemonFriendshipElement.innerText = `Friendship: ${model.friendship}`;

    const pokemonBaseExpElement = document.getElementById('pokemonBaseExp');
    if (pokemonBaseExpElement) pokemonBaseExpElement.innerText = `Base Experience: ${model.baseExp}`;

    const pokemonCatchRateElement = document.getElementById('pokemonCatchRate');
    if (pokemonCatchRateElement) pokemonCatchRateElement.innerText = `Catch Rate: ${model.catchRate}`;

    const pokemonHPElement = document.getElementById('pokemonHP');
    if (pokemonHPElement) pokemonHPElement.innerText = `HP: ${model.baseHP}`;

    const pokemonAttackElement = document.getElementById('pokemonAttack');
    if (pokemonAttackElement) pokemonAttackElement.innerText = `Attack: ${model.stats.attack}`;

    const pokemonDefenseElement = document.getElementById('pokemonDefense');
    if (pokemonDefenseElement) pokemonDefenseElement.innerText = `Defense: ${model.stats.defense}`;

    const pokemonSpAttackElement = document.getElementById('pokemonSpAttack');
    if (pokemonSpAttackElement) pokemonSpAttackElement.innerText = `Special Attack: ${model.stats.specialAttack}`;

    const pokemonSpDefenseElement = document.getElementById('pokemonSpDefense');
    if (pokemonSpDefenseElement) pokemonSpDefenseElement.innerText = `Special Defense: ${model.stats.specialDefense}`;

    const pokemonSpeedElement = document.getElementById('pokemonSpeed');
    if (pokemonSpeedElement) pokemonSpeedElement.innerText = `Speed: ${model.stats.speed}`;

    const pokemonMovesElement = document.getElementById('pokemonMoves');
    if (pokemonMovesElement) {
        pokemonMovesElement.innerHTML = model.moves.map(move => `${move.name}: ${move.power} Power, ${move.pp} PP`).join('<br>');
    }

    const pokemonMovesTable = document.getElementById('pokemonMovesTable');
    if (pokemonMovesTable) {
        pokemonMovesTable.innerHTML = ''; // Clear existing moves
        model.moves.forEach(move => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${move.name}</td>
                <td>${move.type}</td>
                <td>${move.power}</td>
                <td>${move.accuracy}</td>
            `;
            pokemonMovesTable.appendChild(row);
        });
    } else {
        console.error('Element with id "pokemonMovesTable" not found.');
    }

    popup.style.display = 'block'; // Ensure the popup is displayed
    popup.classList.add('show'); // Add the show class to animate the popup

    updatePageVisibility(); // Ensure only the first page is visible initially
}

// Function to manage page visibility
function updatePageVisibility() {
    const pages = document.querySelectorAll('.page');
    const rightColumn = document.getElementById('rightColumn'); // Get right column

    pages.forEach(page => {
        if (page.classList.contains('active')) {
            page.style.opacity = '1';
            page.style.visibility = 'visible';
            page.style.display = 'block';
        } else {
            page.style.opacity = '0';
            page.style.visibility = 'hidden';
            page.style.display = 'none';
        }
    });

    // Hide right column when not on the first page
    const activePageIndex = Array.from(pages).findIndex(page => page.classList.contains('active'));
    rightColumn.style.display = activePageIndex === 0 ? 'block' : 'none';
}

// Navigation buttons
document.getElementById('prevPage').addEventListener('click', () => {
    const pages = document.querySelectorAll('.page');
    let activePageIndex = Array.from(pages).findIndex(page => page.classList.contains('active'));

    if (activePageIndex > 0) {
        pages[activePageIndex].classList.remove('active');
        activePageIndex--;
        pages[activePageIndex].classList.add('active');
    }

    updatePageVisibility();
});

document.getElementById('nextPage').addEventListener('click', () => {
    const pages = document.querySelectorAll('.page');
    let activePageIndex = Array.from(pages).findIndex(page => page.classList.contains('active'));

    if (activePageIndex < pages.length - 1) {
        pages[activePageIndex].classList.remove('active');
        activePageIndex++;
        pages[activePageIndex].classList.add('active');
    }

    updatePageVisibility();
});
