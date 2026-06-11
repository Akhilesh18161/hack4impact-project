export interface CityMetric {
  label: string
  value: number
  unit: string
  trend: number // percent change
  detail: string
}

export interface MonthlyData {
  month: string
  aqi: number
  greenCover: number
  wasteRecycled: number
  renewableEnergy: number
}

export interface EconomyData {
  sector: string
  value: number
  color: string
}

export interface City {
  id: string
  name: string
  region: string
  population: number
  area: number // km²
  elevation: number // meters
  image: string
  tagline: string
  metrics: {
    aqi: CityMetric
    greenCover: CityMetric
    renewableEnergy: CityMetric
    wasteRecycling: CityMetric
    gdpGrowth: CityMetric
    electricVehicles: CityMetric
  }
  monthlyTrends: MonthlyData[]
  economySectors: EconomyData[]
  sustainabilityScore: number
  aqiCategory: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous'
  highlights: string[]
}

export const CITIES: City[] = [
  {
    id: 'kathmandu',
    name: 'Kathmandu',
    region: 'Bagmati Province',
    population: 1442271,
    area: 49.45,
    elevation: 1400,
    image: '/hack4impact-project/cities/kathmandu.png',
    tagline: 'Capital of Culture & Change',
    sustainabilityScore: 62,
    aqiCategory: 'Moderate',
    highlights: [
      '14 new electric bus routes launched in 2024',
      'Bagmati River restoration: 40% improvement in water quality',
      '850 MW hydropower capacity feeding city grid',
      'Urban forest cover increased by 8% in 3 years',
    ],
    metrics: {
      aqi: {
        label: 'Air Quality Index',
        value: 87,
        unit: 'AQI',
        trend: -12,
        detail:
          'AQI has improved 12% year-over-year due to electric vehicle adoption and reduced brick kilns. PM2.5 remains the primary pollutant during winter months.',
      },
      greenCover: {
        label: 'Green Cover',
        value: 23.4,
        unit: '%',
        trend: 8.2,
        detail:
          'Urban tree canopy has expanded from 15.2% to 23.4% since 2021 through the Kathmandu Green Belt initiative. Target is 30% by 2027.',
      },
      renewableEnergy: {
        label: 'Renewable Energy',
        value: 78,
        unit: '%',
        trend: 15,
        detail:
          "78% of city's electricity comes from hydropower and solar. Nepal Electricity Authority targets 90% renewable by 2030.",
      },
      wasteRecycling: {
        label: 'Waste Recycling',
        value: 41,
        unit: '%',
        trend: 6,
        detail:
          'Municipal solid waste recycling at 41%, up from 35% last year. New composting stations handle 120 tonnes of organic waste daily.',
      },
      gdpGrowth: {
        label: 'GDP Growth',
        value: 6.2,
        unit: '%',
        trend: 1.1,
        detail:
          'Economic growth driven by IT services, tourism recovery, and remittances. Green economy jobs grew 22% in the past year.',
      },
      electricVehicles: {
        label: 'Electric Vehicles',
        value: 34800,
        unit: 'EVs',
        trend: 42,
        detail:
          '34,800 registered electric vehicles — 42% increase from 2023. Government subsidy program and low electricity cost are key drivers.',
      },
    },
    monthlyTrends: [
      { month: 'Jan', aqi: 142, greenCover: 19, wasteRecycled: 36, renewableEnergy: 70 },
      { month: 'Feb', aqi: 128, greenCover: 19, wasteRecycled: 37, renewableEnergy: 71 },
      { month: 'Mar', aqi: 105, greenCover: 20, wasteRecycled: 38, renewableEnergy: 73 },
      { month: 'Apr', aqi: 78, greenCover: 21, wasteRecycled: 39, renewableEnergy: 75 },
      { month: 'May', aqi: 62, greenCover: 23, wasteRecycled: 40, renewableEnergy: 76 },
      { month: 'Jun', aqi: 45, greenCover: 26, wasteRecycled: 40, renewableEnergy: 80 },
      { month: 'Jul', aqi: 38, greenCover: 28, wasteRecycled: 41, renewableEnergy: 82 },
      { month: 'Aug', aqi: 40, greenCover: 28, wasteRecycled: 41, renewableEnergy: 81 },
      { month: 'Sep', aqi: 52, greenCover: 27, wasteRecycled: 42, renewableEnergy: 79 },
      { month: 'Oct', aqi: 68, greenCover: 25, wasteRecycled: 41, renewableEnergy: 77 },
      { month: 'Nov', aqi: 95, greenCover: 22, wasteRecycled: 40, renewableEnergy: 74 },
      { month: 'Dec', aqi: 130, greenCover: 20, wasteRecycled: 38, renewableEnergy: 72 },
    ],
    economySectors: [
      { sector: 'Tourism', value: 28, color: '#22c55e' },
      { sector: 'IT & Services', value: 22, color: '#3b82f6' },
      { sector: 'Trade', value: 18, color: '#f59e0b' },
      { sector: 'Manufacturing', value: 16, color: '#ef4444' },
      { sector: 'Green Energy', value: 10, color: '#10b981' },
      { sector: 'Other', value: 6, color: '#8b5cf6' },
    ],
  },
  {
    id: 'biratnagar',
    name: 'Biratnagar',
    region: 'Province No. 1',
    population: 242548,
    area: 58.5,
    elevation: 72,
    image: '/hack4impact-project/cities/biratnagar.png',
    tagline: 'Industrial Hub Going Green',
    sustainabilityScore: 54,
    aqiCategory: 'Unhealthy',
    highlights: [
      'First industrial city to launch EV freight corridor',
      'Koshi river water quality monitoring 24/7',
      '12 industrial units converted to solar power',
      'Zero-waste textile park under construction',
    ],
    metrics: {
      aqi: {
        label: 'Air Quality Index',
        value: 148,
        unit: 'AQI',
        trend: -8,
        detail:
          'Industrial emissions remain a challenge. 3 major factories installed scrubbers in 2024, reducing particulate matter by 18%. Target: below 100 AQI by 2026.',
      },
      greenCover: {
        label: 'Green Cover',
        value: 14.2,
        unit: '%',
        trend: 4.1,
        detail:
          'Industrial buffer greening initiative added 12 km² of tree cover around factory zones. Target of 20% green cover by 2028.',
      },
      renewableEnergy: {
        label: 'Renewable Energy',
        value: 52,
        unit: '%',
        trend: 18,
        detail:
          '14 industrial units now solar-powered. City signed 150 MW solar park agreement. Renewable share grew 18% — fastest among Terai cities.',
      },
      wasteRecycling: {
        label: 'Waste Recycling',
        value: 29,
        unit: '%',
        trend: 9,
        detail:
          'Industrial waste recycling program launched. 29% recycling rate with textile industry leading at 44%. New waste-to-energy plant under construction.',
      },
      gdpGrowth: {
        label: 'GDP Growth',
        value: 7.8,
        unit: '%',
        trend: 2.3,
        detail:
          'Fastest growing economy in Province No.1. Export-oriented industries, especially textiles and agro-processing, driving growth.',
      },
      electricVehicles: {
        label: 'Electric Vehicles',
        value: 8200,
        unit: 'EVs',
        trend: 55,
        detail:
          '8,200 EVs registered — 55% growth. First EV freight zone in Nepal. E-rickshaws dominate last-mile connectivity.',
      },
    },
    monthlyTrends: [
      { month: 'Jan', aqi: 190, greenCover: 11, wasteRecycled: 24, renewableEnergy: 42 },
      { month: 'Feb', aqi: 178, greenCover: 11, wasteRecycled: 25, renewableEnergy: 43 },
      { month: 'Mar', aqi: 160, greenCover: 12, wasteRecycled: 26, renewableEnergy: 46 },
      { month: 'Apr', aqi: 135, greenCover: 13, wasteRecycled: 27, renewableEnergy: 49 },
      { month: 'May', aqi: 118, greenCover: 14, wasteRecycled: 28, renewableEnergy: 52 },
      { month: 'Jun', aqi: 95, greenCover: 16, wasteRecycled: 29, renewableEnergy: 56 },
      { month: 'Jul', aqi: 82, greenCover: 17, wasteRecycled: 30, renewableEnergy: 58 },
      { month: 'Aug', aqi: 88, greenCover: 17, wasteRecycled: 30, renewableEnergy: 57 },
      { month: 'Sep', aqi: 105, greenCover: 16, wasteRecycled: 29, renewableEnergy: 54 },
      { month: 'Oct', aqi: 128, greenCover: 14, wasteRecycled: 28, renewableEnergy: 50 },
      { month: 'Nov', aqi: 155, greenCover: 12, wasteRecycled: 27, renewableEnergy: 45 },
      { month: 'Dec', aqi: 182, greenCover: 11, wasteRecycled: 25, renewableEnergy: 43 },
    ],
    economySectors: [
      { sector: 'Manufacturing', value: 35, color: '#ef4444' },
      { sector: 'Trade', value: 25, color: '#f59e0b' },
      { sector: 'Agro-Industry', value: 18, color: '#22c55e' },
      { sector: 'Services', value: 12, color: '#3b82f6' },
      { sector: 'Green Industry', value: 7, color: '#10b981' },
      { sector: 'Other', value: 3, color: '#8b5cf6' },
    ],
  },
  {
    id: 'pokhara',
    name: 'Pokhara',
    region: 'Gandaki Province',
    population: 518452,
    area: 124.67,
    elevation: 822,
    image: '/hack4impact-project/cities/pokhara.png',
    tagline: 'Gateway to the Himalayas',
    sustainabilityScore: 78,
    aqiCategory: 'Good',
    highlights: [
      'Best AQI among Nepal cities — avg 38 in 2024',
      'Phewa Lake restoration: 98% water quality restored',
      'Airport switched to 100% solar power',
      'Zero single-use plastics in tourist zones since 2023',
    ],
    metrics: {
      aqi: {
        label: 'Air Quality Index',
        value: 38,
        unit: 'AQI',
        trend: -18,
        detail:
          'Best air quality in Nepal. Low industrial activity, high green cover, and strict vehicle emission standards contribute. Seasonal fluctuations minimal.',
      },
      greenCover: {
        label: 'Green Cover',
        value: 42.6,
        unit: '%',
        trend: 5.8,
        detail:
          'Pokhara leads Nepal in urban green cover. Lake catchment forest protection policy has preserved and expanded forests. 42.6% target reached ahead of schedule.',
      },
      renewableEnergy: {
        label: 'Renewable Energy',
        value: 91,
        unit: '%',
        trend: 8,
        detail:
          '91% renewable — highest in Nepal. Mix of hydropower (72%), solar (15%), and micro-hydro (4%). Pokhara aims to be fully renewable city by 2027.',
      },
      wasteRecycling: {
        label: 'Waste Recycling',
        value: 58,
        unit: '%',
        trend: 12,
        detail:
          'Tourism-driven waste management excellence. 58% recycling rate, highest in Nepal. Tourist area composting is mandatory. Phewa Lake area is plastic-free.',
      },
      gdpGrowth: {
        label: 'GDP Growth',
        value: 8.9,
        unit: '%',
        trend: 3.2,
        detail:
          'Tourism boom post-pandemic. New international airport drives foreign arrivals. Adventure tourism and eco-tourism growing 35% annually.',
      },
      electricVehicles: {
        label: 'Electric Vehicles',
        value: 15600,
        unit: 'EVs',
        trend: 68,
        detail:
          'Tourism sector leading EV adoption. Electric taxis, boats, and bikes dominate tourist zones. 68% growth — highest EV growth rate in Nepal.',
      },
    },
    monthlyTrends: [
      { month: 'Jan', aqi: 55, greenCover: 38, wasteRecycled: 50, renewableEnergy: 86 },
      { month: 'Feb', aqi: 48, greenCover: 39, wasteRecycled: 52, renewableEnergy: 87 },
      { month: 'Mar', aqi: 42, greenCover: 40, wasteRecycled: 53, renewableEnergy: 88 },
      { month: 'Apr', aqi: 35, greenCover: 42, wasteRecycled: 55, renewableEnergy: 90 },
      { month: 'May', aqi: 28, greenCover: 44, wasteRecycled: 57, renewableEnergy: 91 },
      { month: 'Jun', aqi: 22, greenCover: 47, wasteRecycled: 58, renewableEnergy: 93 },
      { month: 'Jul', aqi: 18, greenCover: 49, wasteRecycled: 60, renewableEnergy: 95 },
      { month: 'Aug', aqi: 20, greenCover: 49, wasteRecycled: 60, renewableEnergy: 94 },
      { month: 'Sep', aqi: 25, greenCover: 47, wasteRecycled: 59, renewableEnergy: 92 },
      { month: 'Oct', aqi: 32, greenCover: 44, wasteRecycled: 57, renewableEnergy: 90 },
      { month: 'Nov', aqi: 40, greenCover: 42, wasteRecycled: 55, renewableEnergy: 88 },
      { month: 'Dec', aqi: 50, greenCover: 39, wasteRecycled: 52, renewableEnergy: 87 },
    ],
    economySectors: [
      { sector: 'Tourism', value: 42, color: '#22c55e' },
      { sector: 'Eco-Tourism', value: 18, color: '#10b981' },
      { sector: 'Trade', value: 16, color: '#f59e0b' },
      { sector: 'Services', value: 14, color: '#3b82f6' },
      { sector: 'Agriculture', value: 6, color: '#a3e635' },
      { sector: 'Other', value: 4, color: '#8b5cf6' },
    ],
  },
  {
    id: 'lalitpur',
    name: 'Lalitpur',
    region: 'Bagmati Province',
    population: 284922,
    area: 15.43,
    elevation: 1350,
    image: '/hack4impact-project/cities/lalitpur.png',
    tagline: 'City of Fine Arts & Green Streets',
    sustainabilityScore: 70,
    aqiCategory: 'Moderate',
    highlights: [
      'UNESCO heritage zone 100% pedestrianized',
      'Highest green roof density in Nepal',
      'Artisan economy growing 28% with green craft exports',
      'Patan Hospital running on 60% solar energy',
    ],
    metrics: {
      aqi: {
        label: 'Air Quality Index',
        value: 72,
        unit: 'AQI',
        trend: -15,
        detail:
          'Heritage preservation policies restrict heavy vehicles. Pedestrian zones and cycle lanes have reduced emissions by 30%. Winter dust remains a challenge.',
      },
      greenCover: {
        label: 'Green Cover',
        value: 31.8,
        unit: '%',
        trend: 9.4,
        detail:
          'Green roof mandate for new construction. Courtyard garden revival program restored 230 traditional gardens. Fastest growing green cover in Kathmandu Valley.',
      },
      renewableEnergy: {
        label: 'Renewable Energy',
        value: 82,
        unit: '%',
        trend: 11,
        detail:
          'Solar panels integrated into heritage-compatible designs. Nepal Oil Corporation depot replaced by solar farm. 82% renewable — second highest in valley.',
      },
      wasteRecycling: {
        label: 'Waste Recycling',
        value: 51,
        unit: '%',
        trend: 14,
        detail:
          'Door-to-door organic waste collection serves 92% of households. Heritage conservation recycling program includes traditional materials processing.',
      },
      gdpGrowth: {
        label: 'GDP Growth',
        value: 7.1,
        unit: '%',
        trend: 1.8,
        detail:
          'Craft exports, cultural tourism, and IT services growing strongly. Green craft certification boosted export revenue by 40%.',
      },
      electricVehicles: {
        label: 'Electric Vehicles',
        value: 11400,
        unit: 'EVs',
        trend: 38,
        detail:
          '11,400 EVs — high density for city size. Electric safa-tempos (traditional green taxi) are iconic. Heritage zones exclusively EV-accessible.',
      },
    },
    monthlyTrends: [
      { month: 'Jan', aqi: 118, greenCover: 27, wasteRecycled: 44, renewableEnergy: 75 },
      { month: 'Feb', aqi: 105, greenCover: 27, wasteRecycled: 45, renewableEnergy: 77 },
      { month: 'Mar', aqi: 88, greenCover: 28, wasteRecycled: 46, renewableEnergy: 79 },
      { month: 'Apr', aqi: 65, greenCover: 30, wasteRecycled: 48, renewableEnergy: 81 },
      { month: 'May', aqi: 50, greenCover: 33, wasteRecycled: 50, renewableEnergy: 82 },
      { month: 'Jun', aqi: 38, greenCover: 36, wasteRecycled: 51, renewableEnergy: 85 },
      { month: 'Jul', aqi: 32, greenCover: 38, wasteRecycled: 52, renewableEnergy: 86 },
      { month: 'Aug', aqi: 35, greenCover: 38, wasteRecycled: 52, renewableEnergy: 85 },
      { month: 'Sep', aqi: 45, greenCover: 36, wasteRecycled: 51, renewableEnergy: 83 },
      { month: 'Oct', aqi: 58, greenCover: 33, wasteRecycled: 50, renewableEnergy: 81 },
      { month: 'Nov', aqi: 82, greenCover: 30, wasteRecycled: 48, renewableEnergy: 78 },
      { month: 'Dec', aqi: 110, greenCover: 28, wasteRecycled: 46, renewableEnergy: 76 },
    ],
    economySectors: [
      { sector: 'Crafts & Arts', value: 30, color: '#f59e0b' },
      { sector: 'Tourism', value: 25, color: '#22c55e' },
      { sector: 'IT Services', value: 20, color: '#3b82f6' },
      { sector: 'Trade', value: 14, color: '#ef4444' },
      { sector: 'Green Crafts', value: 8, color: '#10b981' },
      { sector: 'Other', value: 3, color: '#8b5cf6' },
    ],
  },
  {
    id: 'bharatpur',
    name: 'Bharatpur',
    region: 'Bagmati Province',
    population: 352836,
    area: 432.98,
    elevation: 200,
    image: '/hack4impact-project/cities/bharatpur.png',
    tagline: 'Gateway to Chitwan\'s Wilderness',
    sustainabilityScore: 66,
    aqiCategory: 'Good',
    highlights: [
      'Buffer zone reforestation: 22,000 hectares added',
      'Wildlife corridor connectivity improved by 40%',
      'Community forest program supports 38,000 households',
      'Biodiversity hotspot with 544 bird species documented',
    ],
    metrics: {
      aqi: {
        label: 'Air Quality Index',
        value: 52,
        unit: 'AQI',
        trend: -10,
        detail:
          'Proximity to Chitwan National Park buffers air quality. Brick kilns phased out with electric alternatives. AQI improved 10% with forest expansion.',
      },
      greenCover: {
        label: 'Green Cover',
        value: 48.2,
        unit: '%',
        trend: 7.2,
        detail:
          'Includes Chitwan National Park forest cover. Community-managed forests make up 18% of total. Nepal\'s second highest green cover city.',
      },
      renewableEnergy: {
        label: 'Renewable Energy',
        value: 68,
        unit: '%',
        trend: 20,
        detail:
          '20% growth — fastest among mid-sized cities. New 80 MW solar park operational since March 2024. Biogas from agricultural waste growing rapidly.',
      },
      wasteRecycling: {
        label: 'Waste Recycling',
        value: 38,
        unit: '%',
        trend: 8,
        detail:
          'Agricultural and organic waste composting leads at 65% diversion. Tourist zone waste management improved significantly in 2024.',
      },
      gdpGrowth: {
        label: 'GDP Growth',
        value: 9.2,
        unit: '%',
        trend: 4.1,
        detail:
          'Fastest growing economy among study cities. Eco-tourism boom from Chitwan, combined with logistics and agriculture processing hubs.',
      },
      electricVehicles: {
        label: 'Electric Vehicles',
        value: 9800,
        unit: 'EVs',
        trend: 48,
        detail:
          'Electric safari vehicles now mandatory in park zones. 9,800 EVs with 48% growth. Tourist mobility going fully electric by 2026.',
      },
    },
    monthlyTrends: [
      { month: 'Jan', aqi: 72, greenCover: 44, wasteRecycled: 33, renewableEnergy: 58 },
      { month: 'Feb', aqi: 65, greenCover: 44, wasteRecycled: 34, renewableEnergy: 60 },
      { month: 'Mar', aqi: 58, greenCover: 45, wasteRecycled: 35, renewableEnergy: 63 },
      { month: 'Apr', aqi: 48, greenCover: 46, wasteRecycled: 36, renewableEnergy: 66 },
      { month: 'May', aqi: 38, greenCover: 48, wasteRecycled: 37, renewableEnergy: 68 },
      { month: 'Jun', aqi: 28, greenCover: 51, wasteRecycled: 38, renewableEnergy: 72 },
      { month: 'Jul', aqi: 22, greenCover: 53, wasteRecycled: 39, renewableEnergy: 74 },
      { month: 'Aug', aqi: 25, greenCover: 53, wasteRecycled: 39, renewableEnergy: 73 },
      { month: 'Sep', aqi: 32, greenCover: 51, wasteRecycled: 38, renewableEnergy: 70 },
      { month: 'Oct', aqi: 42, greenCover: 48, wasteRecycled: 37, renewableEnergy: 67 },
      { month: 'Nov', aqi: 55, greenCover: 46, wasteRecycled: 36, renewableEnergy: 63 },
      { month: 'Dec', aqi: 68, greenCover: 44, wasteRecycled: 34, renewableEnergy: 60 },
    ],
    economySectors: [
      { sector: 'Eco-Tourism', value: 32, color: '#22c55e' },
      { sector: 'Agriculture', value: 28, color: '#a3e635' },
      { sector: 'Trade', value: 18, color: '#f59e0b' },
      { sector: 'Services', value: 12, color: '#3b82f6' },
      { sector: 'Green Energy', value: 8, color: '#10b981' },
      { sector: 'Other', value: 2, color: '#8b5cf6' },
    ],
  },
  {
    id: 'butwal',
    name: 'Butwal',
    region: 'Lumbini Province',
    population: 201979,
    area: 119.2,
    elevation: 205,
    image: '/hack4impact-project/cities/butwal.png',
    tagline: 'Crossroads of Commerce & Heritage',
    sustainabilityScore: 58,
    aqiCategory: 'Moderate',
    highlights: [
      'Lumbini circuit eco-tourism hub — Buddhist heritage',
      'Tinau river cleanup: 70% pollution reduced',
      'New 120 MW solar park approved in 2024',
      'Electric highway connecting Bhairahawa operational',
    ],
    metrics: {
      aqi: {
        label: 'Air Quality Index',
        value: 95,
        unit: 'AQI',
        trend: -5,
        detail:
          'Highway traffic and cross-border trade cause elevated AQI. EV adoption in commercial vehicles and new bypass reducing urban traffic load.',
      },
      greenCover: {
        label: 'Green Cover',
        value: 19.8,
        unit: '%',
        trend: 6.5,
        detail:
          'Lumbini buffer zone greening adds significant forest cover. Urban parks program added 45 new community gardens since 2023.',
      },
      renewableEnergy: {
        label: 'Renewable Energy',
        value: 61,
        unit: '%',
        trend: 22,
        detail:
          'New solar park will push renewable share to 75% by 2025. Lumbini is targeting carbon-neutral tourism by 2030 — major renewable push.',
      },
      wasteRecycling: {
        label: 'Waste Recycling',
        value: 32,
        unit: '%',
        trend: 11,
        detail:
          'Religious tourism generates significant waste. New smart bins and tourist area recycling improved rate to 32%. Pilgrimage route plastic-free campaign ongoing.',
      },
      gdpGrowth: {
        label: 'GDP Growth',
        value: 8.1,
        unit: '%',
        trend: 2.8,
        detail:
          'Religious tourism to Lumbini and cross-border trade with India driving strong growth. New SEZ attracting manufacturing investment.',
      },
      electricVehicles: {
        label: 'Electric Vehicles',
        value: 6400,
        unit: 'EVs',
        trend: 44,
        detail:
          '6,400 EVs with strong growth. Electric vehicles exclusive in Lumbini pilgrimage zone. Electric highway enables cross-border EV travel.',
      },
    },
    monthlyTrends: [
      { month: 'Jan', aqi: 132, greenCover: 16, wasteRecycled: 27, renewableEnergy: 52 },
      { month: 'Feb', aqi: 120, greenCover: 16, wasteRecycled: 28, renewableEnergy: 54 },
      { month: 'Mar', aqi: 108, greenCover: 17, wasteRecycled: 29, renewableEnergy: 57 },
      { month: 'Apr', aqi: 92, greenCover: 18, wasteRecycled: 30, renewableEnergy: 59 },
      { month: 'May', aqi: 78, greenCover: 20, wasteRecycled: 31, renewableEnergy: 62 },
      { month: 'Jun', aqi: 62, greenCover: 22, wasteRecycled: 32, renewableEnergy: 65 },
      { month: 'Jul', aqi: 55, greenCover: 24, wasteRecycled: 33, renewableEnergy: 67 },
      { month: 'Aug', aqi: 58, greenCover: 24, wasteRecycled: 33, renewableEnergy: 66 },
      { month: 'Sep', aqi: 70, greenCover: 22, wasteRecycled: 32, renewableEnergy: 63 },
      { month: 'Oct', aqi: 85, greenCover: 20, wasteRecycled: 31, renewableEnergy: 60 },
      { month: 'Nov', aqi: 105, greenCover: 18, wasteRecycled: 29, renewableEnergy: 56 },
      { month: 'Dec', aqi: 125, greenCover: 16, wasteRecycled: 27, renewableEnergy: 53 },
    ],
    economySectors: [
      { sector: 'Trade', value: 30, color: '#f59e0b' },
      { sector: 'Religious Tourism', value: 22, color: '#22c55e' },
      { sector: 'Manufacturing', value: 20, color: '#ef4444' },
      { sector: 'Services', value: 15, color: '#3b82f6' },
      { sector: 'Agriculture', value: 9, color: '#a3e635' },
      { sector: 'Other', value: 4, color: '#8b5cf6' },
    ],
  },
]

export interface NewsItem {
  id: string
  title: string
  summary: string
  fullContent: string
  category: string
  city: string
  date: string
  readTime: number
  image: string
  tags: string[]
  source: string
}

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    title: 'Kathmandu Deploys 200 Solar-Powered Smart Buses',
    summary:
      'Nepal capital launches its largest fleet of electric buses, cutting downtown emissions by 35% and transforming daily commutes for 300,000 residents.',
    fullContent: `Kathmandu Metropolitan City has unveiled a transformative public transportation initiative with the deployment of 200 solar-powered smart electric buses across 18 major routes in the capital.

The fleet, procured from a joint venture between Nepal Electric Vehicle Company and a South Korean manufacturer, features real-time GPS tracking, smart payment systems, and onboard air quality monitors that display live AQI data at each stop.

Mayor Balendra Shah announced that this initiative will reduce downtown carbon emissions by an estimated 35%, equivalent to removing 45,000 petrol vehicles from the road annually. The buses are charged overnight using a dedicated 45 MW solar farm installed at Sundarijal and Pharping.

Each bus covers an average of 280 km per charge, sufficient for full daily routes. The routes prioritize high-density corridors including Ratna Park–Kalanki, Koteshwor–Chabahil, and the ring road circuit.

The project, funded through a green bond and ADB climate finance, is expected to carry 2.8 million passenger trips monthly. Phase 2 plans 150 more buses for suburban routes by Q3 2025.`,
    category: 'Clean Transport',
    city: 'Kathmandu',
    date: '2025-06-08',
    readTime: 4,
    image: '/hack4impact-project/news/electric-bus.png',
    tags: ['Electric Vehicles', 'Public Transport', 'Clean Energy'],
    source: 'My Republica',
  },
  {
    id: '2',
    title: "Pokhara's Phewa Lake Declared World's Cleanest Freshwater Lake",
    summary:
      'UNESCO certifies Phewa Lake as globally cleanest freshwater urban lake after 5-year restoration effort removes 98% of pollution indicators.',
    fullContent: `UNESCO has officially certified Phewa Lake in Pokhara as the world's cleanest freshwater urban lake, marking the culmination of a five-year restoration program that mobilized over 12,000 community volunteers.

The certification, announced at the World Water Forum in Vienna, acknowledges the removal of 98% of measurable pollution indicators, including phosphorous runoff, microplastics, and biological contamination, that had threatened the lake ecosystem.

The restoration involved banning motorized boats (replaced entirely by electric pedal boats and kayaks), establishing a 200-meter plastic-free buffer zone along the entire 5.5 km shoreline, and installing constructed wetlands at 4 major inlet streams.

Water quality now meets WHO Class A drinking standards without treatment — a first for any lake of its size in Asia. Over 48 endemic bird species and 12 fish species have returned to pre-1990 population levels.

Pokhara Metropolitan City's Green Lake Fund, financed through a 2% surcharge on hotel bookings, raised NPR 1.2 billion for the project. The model is being studied by cities in Bangladesh, Vietnam, and Ethiopia.`,
    category: 'Water Quality',
    city: 'Pokhara',
    date: '2025-06-05',
    readTime: 5,
    image: '/hack4impact-project/news/pokhara-lake.png',
    tags: ['Water Quality', 'UNESCO', 'Biodiversity'],
    source: 'The Kathmandu Post',
  },
  {
    id: '3',
    title: 'Kathmandu Rooftop Solar Program Hits 50 MW Milestone',
    summary:
      'Urban solar revolution reaches 50 MW as 28,000 households and 1,400 commercial buildings install rooftop panels under city subsidy scheme.',
    fullContent: `Kathmandu Metropolitan City's ambitious rooftop solar program has crossed the 50 MW installed capacity milestone, connecting 28,000 households and 1,400 commercial buildings to the city's clean energy grid.

The initiative, started in 2021 with seed funding from the Asian Development Bank, offers a 40% subsidy on installation costs and a guaranteed buy-back rate of NPR 12 per kWh fed back to the grid through a net metering program with Nepal Electricity Authority.

Total solar capacity on Kathmandu's rooftops now offsets approximately 72,000 tonnes of CO2 annually — the equivalent of planting 3.2 million trees. Average household savings on electricity bills reached NPR 3,400 per month.

The program has become a model for urban solar adoption in South Asia. Bhutan, Sri Lanka, and four Indian states have sent delegations to study the implementation, particularly the door-to-door installation support service and simplified NEA interconnection process.

Phase 3 targets an additional 80 MW by December 2026, with a focus on commercial districts and government buildings.`,
    category: 'Renewable Energy',
    city: 'Kathmandu',
    date: '2025-06-02',
    readTime: 4,
    image: '/hack4impact-project/news/kathmandu-solar.png',
    tags: ['Solar Energy', 'Urban Planning', 'Climate Action'],
    source: 'The Himalayan Times',
  },
  {
    id: '4',
    title: 'Biratnagar Launches Nepal\'s First Zero-Emission Industrial Zone',
    summary:
      'Industrial hub reinvents itself with 12 factories converting to electric operations and renewable energy, setting new national standards for green manufacturing.',
    fullContent: `Biratnagar Sub-Metropolitan City has inaugurated Nepal's first Zero-Emission Industrial Zone (ZEIZ), a landmark step in the country's effort to balance industrial growth with environmental sustainability.

The zone spans 340 hectares in the eastern part of the city and hosts 12 manufacturing units that have transitioned to fully electric operations powered by dedicated solar and hydropower supply agreements.

Industries in the zone — primarily textile, food processing, and light engineering — collectively reduced CO2 emissions by 84,000 tonnes in the pilot year. Wastewater treatment within the zone now achieves 98% purity before discharge, protecting the Koshi river system.

The ZEIZ was developed through a public-private partnership with the Nepal Chamber of Commerce and the Ministry of Industry. Export incentives for certified ZEIZ products have increased revenue for member companies by an average of 18%, as European buyers increasingly demand documented green supply chains.

The model demonstrates that industrial competitiveness and environmental responsibility can be aligned. An expansion to 600 hectares is planned by 2027, potentially making Biratnagar one of Asia's landmark green industrial cities.`,
    category: 'Green Industry',
    city: 'Biratnagar',
    date: '2025-05-28',
    readTime: 5,
    image: '/hack4impact-project/news/biratnagar-industry.png',
    tags: ['Industry', 'Zero Emissions', 'Manufacturing'],
    source: 'Nagarik News',
  },
  {
    id: '5',
    title: 'Nepal Cities Plant 2 Million Trees in Urban Greening Drive',
    summary:
      'Six major cities complete massive urban afforestation campaign, adding 2 million trees to city streets, parks, and degraded land in just 18 months.',
    fullContent: `A coordinated urban greening campaign across Nepal's six major cities has successfully planted 2 million trees over the past 18 months, creating new green corridors and significantly expanding urban forest cover.

The Hariyo Shahar (Green City) Campaign, coordinated by the Ministry of Forests and Environment, mobilized 380,000 citizen volunteers who planted native species including Sal, Uttis, Chilaune, and fruit-bearing trees chosen for urban resilience.

Kathmandu planted 680,000 trees, followed by Pokhara (420,000), Bharatpur (360,000), Lalitpur (240,000), Butwal (180,000), and Biratnagar (120,000). Survival rate at 18 months stands at 82%, well above the national target of 70%.

The campaign used a digital tree-tracking app where citizens could adopt and monitor individual trees. Over 290,000 downloads were recorded, with schoolchildren accounting for 35% of active tree stewards.

Forest ecologist Dr. Pratima Rana noted that the campaign has measurably reduced urban heat island effect in all six cities, with surface temperatures 2-4°C lower in planted areas during summer 2024.`,
    category: 'Urban Forestry',
    city: 'All Cities',
    date: '2025-05-20',
    readTime: 4,
    image: '/hack4impact-project/news/tree-planting.png',
    tags: ['Reforestation', 'Urban Green', 'Community'],
    source: 'Setopati',
  },
  {
    id: '6',
    title: 'Lalitpur Smart Waste System Achieves 58% Recycling Rate',
    summary:
      'AI-powered waste sorting and door-to-door collection transforms city recycling, making Lalitpur a model for sustainable waste management in South Asia.',
    fullContent: `Lalitpur Metropolitan City has achieved a 58% municipal waste recycling rate — the highest in Nepal and among the top in South Asia — through a comprehensive smart waste management system deployed over the past two years.

The system combines AI-powered sorting conveyor belts at the central facility in Sainbu, a gamified app that rewards households for correct waste segregation, and a fleet of 22 electric collection vehicles operating on optimized GPS routes.

The AI sorting system, developed in partnership with a Bangalore-based startup and Tribhuvan University engineering faculty, accurately classifies 96% of recyclable materials by type and condition, enabling higher-quality recycling streams that command better market prices.

Organic waste composting has become a significant revenue stream: 85 tonnes per day of compost is sold to Terai farms at NPR 8 per kg, generating NPR 25 million annually that funds the city's green infrastructure budget.

The system has created 340 formal green jobs in collection, sorting, and processing — many filled by women from marginalized communities. UNDP has nominated the project for its Urban Environment Prize 2025.`,
    category: 'Waste Management',
    city: 'Lalitpur',
    date: '2025-05-15',
    readTime: 5,
    image: '/hack4impact-project/news/waste-management.png',
    tags: ['Smart City', 'Recycling', 'AI Technology'],
    source: 'Online Khabar',
  },
]

export function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e'
  if (aqi <= 100) return '#f59e0b'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  return '#9333ea'
}

export function getAqiLabel(aqi: number): string {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for Sensitive'
  if (aqi <= 200) return 'Unhealthy'
  return 'Very Unhealthy'
}

export function getSustainabilityColor(score: number): string {
  if (score >= 75) return '#22c55e'
  if (score >= 60) return '#84cc16'
  if (score >= 45) return '#f59e0b'
  return '#ef4444'
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}
