// Empire Metadata Configuration
// Historical empires and periods of Indian subcontinent
// Used by Timeline components for visualization and notifier

export const EMPIRE_METADATA = [
  {
    id: 'indus_valley',
    name: 'Indus Valley Civilization',
    startYear: -3300,
    endYear: -1300,
    displayColor: '#8B4513',
    description: 'One of the world\'s earliest urban civilizations'
  },
  {
    id: 'vedic_period',
    name: 'Vedic Period',
    startYear: -1500,
    endYear: -500,
    displayColor: '#DAA520',
    description: 'Period of Vedic literature and early Hinduism'
  },
  {
    id: 'mahajanapadas',
    name: 'Mahajanapadas',
    startYear: -600,
    endYear: -345,
    displayColor: '#CD853F',
    description: 'Sixteen great kingdoms of ancient India'
  },
  {
    id: 'maurya',
    name: 'Maurya Empire',
    startYear: -322,
    endYear: -185,
    displayColor: '#FF6B35',
    description: 'First major empire to unify most of the Indian subcontinent'
  },
  {
    id: 'gupta',
    name: 'Gupta Empire',
    startYear: 320,
    endYear: 550,
    displayColor: '#FFD700',
    description: 'Golden Age of Indian culture, science, and mathematics'
  },
  {
    id: 'chola',
    name: 'Chola Empire',
    startYear: 300,
    endYear: 1279,
    displayColor: '#FF8C42',
    description: 'Major maritime empire of South India'
  },
  {
    id: 'delhi_sultanate',
    name: 'Delhi Sultanate',
    startYear: 1206,
    endYear: 1526,
    displayColor: '#6A5ACD',
    description: 'Series of five successive dynasties ruling from Delhi'
  },
  {
    id: 'vijayanagara',
    name: 'Vijayanagara Empire',
    startYear: 1336,
    endYear: 1646,
    displayColor: '#FF4500',
    description: 'Powerful Hindu empire in South India'
  },
  {
    id: 'mughal',
    name: 'Mughal Empire',
    startYear: 1526,
    endYear: 1857,
    displayColor: '#4B0082',
    description: 'Influential empire known for art, architecture, and culture'
  },
  {
    id: 'british_raj',
    name: 'British Raj',
    startYear: 1858,
    endYear: 1947,
    displayColor: '#800020',
    description: 'British colonial rule over the Indian subcontinent'
  },
  {
    id: 'republic_of_india',
    name: 'Republic of India',
    startYear: 1947,
    endYear: 2025,
    displayColor: '#138808',
    description: 'Modern independent nation'
  }
];

// Helper function to get empire by ID
export function getEmpireById(id) {
  return EMPIRE_METADATA.find(empire => empire.id === id);
}

// Helper function to get empires in a date range
export function getEmpiresInRange(startYear, endYear) {
  return EMPIRE_METADATA.filter(empire => 
    empire.endYear >= startYear && empire.startYear <= endYear
  );
}

// Export for convenience
export default EMPIRE_METADATA;
