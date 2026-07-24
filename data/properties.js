const propertySets = [
  {
    id: 'romance',
    name: 'Romance',
    displayName: 'Pink Set — Romance',
    emoji: '💗',
    color: 0xf45aa5,
    setBonus: 500,
    title: "Hopeless Romantic",
    properties: [
      {
        id: 'rosewood_manor',
        name: 'Rosewood Manor',
        requirement: 'Finish a romance book',
        reward: 100,
      },
      {
        id: 'lovers_lane',
        name: "Lovers Lane",
        requirement: 'Finish a book with a pink cover',
        reward: 125,
      },
      {
        id: 'cupids_corner',
        name: "Cupid's Corner",
        requirement: 'Read 150+ pages of a romance book',
        reward: 150,
      },
      {
        id: 'heartbreak_heights',
        name: 'Heartbreak Heights',
        requirement:
          'Join 3 reading sprints while reading a romance book',
        reward: 175,
      },
      {
        id: 'scarlet_suites',
        name: 'Scarlet Suites',
        requirement: 'Share 2 quotes from a romance read',
        reward: 200,
      },
      {
        id: 'happily_ever_after_hall',
        name: 'Happily Ever After Hall',
        requirement:
          'Post a mini reaction or review of a romance book',
        reward: 250,
      },
    ],
  },

  {
    id: 'fantasy',
    name: 'Fantasy',
    displayName: 'Purple Set — Fantasy',
    emoji: '🌙',
    color: 0x8e5bb7,
    setBonus: 600,
    title: "Realm Walker",
    properties: [
      {
        id: 'moonstone_keep',
        name: 'Moonstone Keep',
        requirement: 'Finish a fantasy or paranormal book',
        reward: 125,
      },
      {
        id: 'dragons_hollow',
        name: "Dragon's Hollow",
        requirement: 'Read 150+ pages of a fantasy book',
        reward: 150,
      },
      {
        id: 'enchanted_grove',
        name: 'Enchanted Grove',
        requirement:
          'Join 2 reading sprints while reading fantasy',
        reward: 175,
      },
      {
        id: 'starlight_citadel',
        name: 'Starlight Citadel',
        requirement:
          'Share a worldbuilding detail or piece of lore',
        reward: 200,
      },
      {
        id: 'crystal_caverns',
        name: 'Crystal Caverns',
        requirement:
          'Share your favorite character from a fantasy or paranormal read',
        reward: 225,
      },
      {
        id: 'the_fae_court',
        name: 'The Fae Court',
        requirement:
          'Post a mini reaction or review of a fantasy or paranormal book',
        reward: 275,
      },
    ],
  },

  {
    id: 'cozy',
    name: 'Cozy Reads',
    displayName: 'Green Set — Cozy Reads',
    emoji: '🌿',
    color: 0x6fa66f,
    setBonus: 500,
    title: "Comfort Reader",
    properties: [
      {
        id: 'tea_and_tales_cafe',
        name: 'Tea & Tales Café',
        requirement: 'Finish a cozy or light read',
        reward: 100,
      },
      {
        id: 'bookworm_cottage',
        name: 'Bookworm Cottage',
        requirement: 'Read 100+ pages of a cozy book',
        reward: 125,
      },
      {
        id: 'maple_lane',
        name: 'Maple Lane',
        requirement: 'Read for 2 total hours',
        reward: 150,
      },
      {
        id: 'lavender_library',
        name: 'Lavender Library',
        requirement: 'Join 3 reading sprints',
        reward: 175,
      },
      {
        id: 'hearthstone_cabin',
        name: 'Hearthstone Cabin',
        requirement: 'Share a comfort quote',
        reward: 200,
      },
      {
        id: 'pumpkin_porch',
        name: 'Pumpkin Porch',
        requirement:
          'Post a current-read update with your thoughts',
        reward: 225,
      },
    ],
  },

  {
    id: 'highstakes',
    name: 'High-Stakes',
    displayName: 'Red Set — High-Stakes',
    emoji: '🔥',
    color: 0xc1121f,
    setBonus: 600,
    title: "Master Detective",
    properties: [
      {
        id: 'crimson_crossing',
        name: 'Crimson Crossing',
        requirement: 'Finish a thriller or suspense book',
        reward: 150,
      },
      {
        id: 'blackout_boulevard',
        name: 'Blackout Boulevard',
        requirement: 'Read 200 pages in one day',
        reward: 175,
      },
      {
        id: 'shadow_alley',
        name: 'Shadow Alley',
        requirement: 'Join 2 back-to-back reading sprints',
        reward: 200,
      },
      {
        id: 'last_witness_lane',
        name: 'Last Witness Lane',
        requirement:
          'Share a shocking moment without posting spoilers',
        reward: 225,
      },
      {
        id: 'dead_end_drive',
        name: 'Dead End Drive',
        requirement: 'Read for 2 uninterrupted hours',
        reward: 250,
      },
    ],
  },

  {
    id: 'trending',
    name: 'Trending',
    displayName: 'Blue Set — Trending',
    emoji: '💙',
    color: 0x4f8fd8,
    setBonus: 500,
    title: "BookTok Famous",
    properties: [
      {
        id: 'bestseller_boulevard',
        name: 'Bestseller Boulevard',
        requirement: 'Finish a trending or BookTok book',
        reward: 125,
      },
      {
        id: 'trending_terrace',
        name: 'Trending Terrace',
        requirement: 'Read 150+ pages of a popular book',
        reward: 150,
      },
      {
        id: 'booktok_boulevard',
        name: 'BookTok Boulevard',
        requirement:
          'Join 3 reading sprints while reading a well-known book',
        reward: 175,
      },
      {
        id: 'viral_vista',
        name: 'Viral Vista',
        requirement: 'Share a reaction to a viral book moment',
        reward: 200,
      },
      {
        id: 'spotlight_square',
        name: 'Spotlight Square',
        requirement: 'Recommend the book to chat',
        reward: 225,
      },
    ],
  },

  {
    id: 'restricted',
    name: 'Restricted Section',
    displayName: 'Black Set — Restricted Section',
    emoji: '🖤',
    color: 0x2b2b2b,
    setBonus: 600,
    title: "Fearless Reader",
    properties: [
      {
        id: 'ravens_rest',
        name: "Raven's Rest",
        requirement: 'Finish a dark or heavy book',
        reward: 175,
      },
      {
        id: 'nocturne_manor',
        name: 'Nocturne Manor',
        requirement: 'Read 200+ pages of a dark or heavy book',
        reward: 200,
      },
      {
        id: 'ashen_estate',
        name: 'Ashen Estate',
        requirement:
          'Join 2 reading sprints while reading a dark or heavy book',
        reward: 225,
      },
      {
        id: 'midnight_manor',
        name: 'Midnight Manor',
        requirement: 'Share a heavy quote or reaction',
        reward: 250,
      },
      {
        id: 'hollow_haven',
        name: 'Hollow Haven',
        requirement:
          'Post a mini review of a dark or heavy book',
        reward: 275,
      },
    ],
  },

  {
    id: 'libraries',
    name: 'Libraries',
    displayName: 'Library Set — The Collector',
    emoji: '📚',
    color: 0xb8864b,
    setBonus: 800,
    title: "Head Librarian",
    properties: [
      {
        id: 'grand_central_library',
        name: 'Grand Central Library',
        requirement: 'Join 4 total reading sprints',
        reward: 250,
      },
      {
        id: 'story_station',
        name: 'Story Station',
        requirement: 'Read 500 total pages across the event',
        reward: 300,
      },
      {
        id: 'chapter_junction',
        name: 'Chapter Junction',
        requirement: 'Finish 4 books',
        reward: 350,
      },
      {
        id: 'archive_terminal',
        name: 'Archive Terminal',
        requirement:
          'Complete a full set',
        reward: 400,
      },
    ],
  },

  {
    id: 'wildcards',
    name: 'Wildcards',
    displayName: 'Wildcard Set — Utilities',
    emoji: '⚡',
    color: 0xf2c94c,
    setBonus: 600,
    title: "Wild Card",
    properties: [
      {
        id: 'chance_corner',
        name: 'Chance Corner',
        requirement: 'Draw 5 Bookopoly cards',
        reward: 150,
      },
      {
        id: 'curiosity_corner',
        name: 'Curiosity Corner',
        requirement: 'Finish 2 books',
        reward: 175,
      },
      {
        id: 'mystery_market',
        name: 'Mystery Market',
        requirement:
          'Share 3 reading updates or reactions in chat',
        reward: 200,
      },
      {
        id: 'fortune_fountain',
        name: 'Fortune Fountain',
        requirement:
          'Earn 2000 Baddie Bucks during the event',
        reward: 250,
      },
    ],
  },
];

function getRarity(reward) {
  if (reward >= 350) return 'Legendary';
  if (reward >= 250) return 'Epic';
  if (reward >= 200) return 'Rare';
  if (reward >= 150) return 'Uncommon';
  return 'Common';
}

const properties = propertySets.flatMap((set) =>
  set.properties.map((property) => ({
    ...property,
    rarity: getRarity(property.reward),
    setId: set.id,
    setName: set.name,
    setDisplayName: set.displayName,
    setEmoji: set.emoji,
    setColor: set.color,
    setBonus: set.setBonus,
    title: set.title,
  }))
);

function getPropertyById(propertyId) {
  return properties.find(
    (property) => property.id === propertyId
  );
}

function getPropertySetById(setId) {
  return propertySets.find((set) => set.id === setId);
}

function getPropertiesBySetId(setId) {
  return properties.filter(
    (property) => property.setId === setId
  );
}

module.exports = {
  propertySets,
  properties,
  getPropertyById,
  getPropertySetById,
  getPropertiesBySetId,
};
