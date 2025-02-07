export const models = [
  { 
    path: "./models/mystical_forest_cartoon.glb", 
    scale: 0.01, 
    position: [0, 0, 0], 
    rotation: [0, 0, 0],
    // name: 'Mystical Forest',
  },
  { 
    path: "./models/my_avatar.glb", 
    scale: 2, 
    position: [-3, 2, 50], 
    rotation: [0, Math.PI, 0], 
    isAvatar: true, 
    name: 'Avatar',
    evolution: 'X -> Avatar -> Y',
    stats: { attack: 100, defense: 80, specialAttack: 120, specialDefense: 90, speed: 95 },
    moves: [
      { name: 'Move 1', power: 90, pp: 15 },
      { name: 'Move 2', power: 40, pp: 30 },
      { name: 'Move 3', power: 100, pp: 15 },
      { name: 'Move 4', power: 60, pp: 10 }
    ]
  },
  { 
    path: "./models/Charzard Flying.glb", 
    scale: 3, 
    position: [0, 20, 0], 
    rotation: [0, 0, 0], 
    isCharizard: true, 
    name: 'Charizard',
    evolution: 'Charmander -> Charmeleon -> Charizard',
    stats: { attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 },
    moves: [
      { name: 'Flamethrower', power: 90, pp: 15 },
      { name: 'Dragon Claw', power: 80, pp: 15 },
      { name: 'Fly', power: 90, pp: 15 },
      { name: 'Fire Spin', power: 35, pp: 15 }
    ]
  },
  { 
    path: "./models/phantump_shiny.glb", 
    scale: 0.01, 
    position: [3, 5, 9], 
    rotation: [0, 0, 0], 
    name: 'Phantump',
    evolution: 'X -> Phantump -> Y',
    stats: { attack: 70, defense: 48, specialAttack: 50, specialDefense: 60, speed: 38 },
    moves: [
      { name: 'Move 1', power: 50, pp: 20 },
      { name: 'Move 2', power: 60, pp: 15 },
      { name: 'Move 3', power: 70, pp: 10 },
      { name: 'Move 4', power: 80, pp: 5 }
    ]
  },
  { 
    path: "./models/salamence.glb", 
    scale: 0.3, 
    position: [-30, 16, 27], 
    rotation: [0, (Math.PI * 2) / 3, 0], 
    name: 'Salamence',
    evolution: 'Bagon -> Shelgon -> Salamence',
    stats: { attack: 135, defense: 80, specialAttack: 110, specialDefense: 80, speed: 100 },
    moves: [
      { name: 'Dragon Claw', power: 80, pp: 15 },
      { name: 'Fly', power: 90, pp: 15 },
      { name: 'Crunch', power: 80, pp: 15 },
      { name: 'Flamethrower', power: 90, pp: 15 }
    ]
  },
  { 
    path: "./models/bulbasaur.glb", 
    scale: 2, 
    position: [13, -0.5, 22], 
    rotation: [0, 0, 0], 
    name: 'Bulbasaur',
    evolution: 'Bulbasaur -> Ivysaur -> Venusaur',
    stats: { attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
    moves: [
      { name: 'Vine Whip', power: 45, pp: 25 },
      { name: 'Razor Leaf', power: 55, pp: 25 },
      { name: 'Seed Bomb', power: 80, pp: 15 },
      { name: 'Solar Beam', power: 120, pp: 10 }
    ]
  },
  { 
    path: "./models/lucario_and_riolu_toy_edition.glb", 
    scale: 2, 
    position: [-27, 6.5, 6], 
    rotation: [0, Math.PI / 3, 0], 
    name: 'Lucario',
    evolution: 'Riolu -> Lucario -> Mega Lucario',
    stats: { attack: 110, defense: 70, specialAttack: 115, specialDefense: 70, speed: 90 },
    moves: [
      { name: 'Aura Sphere', power: 80, pp: 20 },
      { name: 'Close Combat', power: 120, pp: 5 },
      { name: 'Dragon Pulse', power: 85, pp: 10 },
      { name: 'Extreme Speed', power: 80, pp: 5 }
    ]
  },
  { 
    path: "./models/eevee.glb", 
    scale: 3.5, 
    position: [7, 0, 10], 
    rotation: [0, 0, 0], 
    name: 'Eevee',
    evolution: 'Eevee -> Vaporeon/Jolteon/Flareon/Espeon/Umbreon/Leafeon/Glaceon/Sylveon',
    stats: { attack: 55, defense: 50, specialAttack: 45, specialDefense: 65, speed: 55 },
    moves: [
      { name: 'Quick Attack', power: 40, pp: 30 },
      { name: 'Bite', power: 60, pp: 25 },
      { name: 'Swift', power: 60, pp: 20 },
      { name: 'Take Down', power: 90, pp: 20 }
    ]
  },
  { 
    path: "./models/pikachu.glb", 
    scale: 0.03, 
    position: [5, 0, 10], 
    rotation: [0, 0, 0], 
    name: 'Pikachu',
    evolution: 'Pichu -> Pikachu -> Raichu',
    stats: { attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
    moves: [
      { name: 'Thunderbolt', power: 90, pp: 15 },
      { name: 'Quick Attack', power: 40, pp: 30 },
      { name: 'Iron Tail', power: 100, pp: 15 },
      { name: 'Electro Ball', power: 'Varies', pp: 10 }
    ]
  },
  { 
    path: "./models/umbreon.glb", 
    scale: 3, 
    position: [6, 0, 10], 
    rotation: [0, 0, 0], 
    name: 'Umbreon',
    evolution: 'Eevee -> Umbreon',
    stats: { attack: 65, defense: 110, specialAttack: 60, specialDefense: 130, speed: 65 },
    moves: [
      { name: 'Foul Play', power: 95, pp: 15 },
      { name: 'Dark Pulse', power: 80, pp: 15 },
      { name: 'Shadow Ball', power: 80, pp: 15 },
      { name: 'Moonlight', power: 'N/A', pp: 5 }
    ]
  },
  { 
    path: "./models/pidgey.glb", 
    scale: 0.4, 
    position: [-2.5, 7, 32], 
    rotation: [0, Math.PI, 0], 
    name: 'Pidgey',
    evolution: 'Pidgey -> Pidgeotto -> Pidgeot',
    stats: { attack: 45, defense: 40, specialAttack: 35, specialDefense: 35, speed: 56 },
    moves: [
      { name: 'Gust', power: 40, pp: 35 },
      { name: 'Quick Attack', power: 40, pp: 30 },
      { name: 'Wing Attack', power: 60, pp: 35 },
      { name: 'Air Slash', power: 75, pp: 15 }
    ]
  },
  { 
    path: "./models/arcanine.glb", 
    scale: 1, 
    position: [10, 3.2, 29], 
    rotation: [0, (-Math.PI * 3) / 4, 0], 
    name: 'Arcanine',
    evolution: 'Growlithe -> Arcanine',
    stats: { attack: 110, defense: 80, specialAttack: 100, specialDefense: 80, speed: 95 },
    moves: [
      { name: 'Flamethrower', power: 90, pp: 15 },
      { name: 'Extreme Speed', power: 80, pp: 5 },
      { name: 'Crunch', power: 80, pp: 15 },
      { name: 'Flare Blitz', power: 120, pp: 15 }
    ]
  },
  { 
    path: "./models/ssbb_pokemon_trainer.glb", 
    scale: 0.4, 
    position: [-14, 3, 21], 
    rotation: [0, Math.PI / 2, 0], 
    isTrainer: true, 
    name: 'Trainer',
    evolution: 'X -> Trainer -> Y',
    stats: { attack: 70, defense: 70, specialAttack: 70, specialDefense: 70, speed: 70 },
    moves: [
      { name: 'Move 1', power: 50, pp: 20 },
      { name: 'Move 2', power: 60, pp: 15 },
      { name: 'Move 3', power: 70, pp: 10 },
      { name: 'Move 4', power: 80, pp: 5 }
    ]
  },
  { 
    path: "./models/plakia.glb", 
    scale: 0.6, 
    position: [-32, 23, -19], 
    rotation: [0, Math.PI / 2, 0], 
    name: 'Plakia',
    evolution: 'X -> Plakia -> Y',
    stats: { attack: 120, defense: 100, specialAttack: 150, specialDefense: 120, speed: 90 },
    moves: [
      { name: 'Move 1', power: 100, pp: 15 },
      { name: 'Move 2', power: 90, pp: 15 },
      { name: 'Move 3', power: 80, pp: 10 },
      { name: 'Move 4', power: 70, pp: 5 }
    ]
  },
  { 
    path: "./models/entei.glb", 
    scale: 0.4, 
    position: [-25, 15.5, -4], 
    rotation: [0, Math.PI / 2, 0], 
    name: 'Entei',
    evolution: 'X -> Entei -> Y',
    stats: { attack: 115, defense: 85, specialAttack: 90, specialDefense: 75, speed: 100 },
    moves: [
      { name: 'Move 1', power: 100, pp: 15 },
      { name: 'Move 2', power: 90, pp: 15 },
      { name: 'Move 3', power: 80, pp: 10 },
      { name: 'Move 4', power: 70, pp: 5 }
    ]
  },
  { 
    path: "./models/reshiram.glb", 
    scale: 3.5, 
    position: [60, 23, -14], 
    rotation: [0, -Math.PI / 4, 0], 
    name: 'Reshiram',
    evolution: 'X -> Reshiram -> Y',
    stats: { attack: 120, defense: 100, specialAttack: 150, specialDefense: 120, speed: 90 },
    moves: [
      { name: 'Move 1', power: 100, pp: 15 },
      { name: 'Move 2', power: 90, pp: 15 },
      { name: 'Move 3', power: 80, pp: 10 },
      { name: 'Move 4', power: 70, pp: 5 }
    ]
  },
  { 
    path: "./models/old_medieval_sign_board.glb", 
    scale: 7, 
    position: [3, 0, 44], 
    rotation: [0, 0, 0], 
    isSignboard: true,
    // name: 'Signboard',
  }
];