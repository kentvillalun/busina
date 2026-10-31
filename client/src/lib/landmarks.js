// Places a commuter on the Laoag to Vigan road knows, written on the map so "where is the bus" has a picture.
// From OpenStreetMap, picked by hand (45 of the 224 named places within 400 m of the road) so the map stays calm.
// A label shows from `minZoom` up to `maxZoom` (always, when there is none). Three kinds, from north to south:
//   towns   - zoom 12 to 13 only, so a zoomed-out map shows where you are; the town hall or market takes over at 14
//   anchors - 14, the places everyone knows (malls, markets, town halls, the big hospital)
//   barangays and the busy centers - 14 on the open road, 15 or 16 where places are close together
const LANDMARKS = [
  { name: "Laoag", lat: 18.19545, lng: 120.59268, minZoom: 11, maxZoom: 13 },
  { name: "San Nicolas", lat: 18.17345, lng: 120.59446, minZoom: 12, maxZoom: 13 },
  { name: "Sinait", lat: 17.86574, lng: 120.45719, minZoom: 12, maxZoom: 13 },
  { name: "Cabugao", lat: 17.79153, lng: 120.45659, minZoom: 12, maxZoom: 13 },
  { name: "San Juan", lat: 17.74469, lng: 120.4583, minZoom: 12, maxZoom: 13 },
  { name: "Magsingal", lat: 17.68492, lng: 120.42478, minZoom: 12, maxZoom: 13 },
  { name: "Santo Domingo", lat: 17.63902, lng: 120.40981, minZoom: 12, maxZoom: 13 },
  { name: "San Ildefonso", lat: 17.62386, lng: 120.39382, minZoom: 12, maxZoom: 13 },
  { name: "Bantay", lat: 17.58112, lng: 120.39046, minZoom: 13, maxZoom: 13 },
  { name: "Vigan", lat: 17.57474, lng: 120.38893, minZoom: 12, maxZoom: 13 },

  { name: "Laoag terminals", lat: 18.19606, lng: 120.5908, minZoom: 15 },
  { name: "St. William Cathedral", lat: 18.19386, lng: 120.59358, minZoom: 15 },
  { name: "Laoag Public Market", lat: 18.1941, lng: 120.59586, minZoom: 17 },
  { name: "SM City Laoag", lat: 18.18921, lng: 120.58614, minZoom: 14 },
  { name: "Robinsons Ilocos", lat: 18.17931, lng: 120.59227, minZoom: 14 },
  { name: "San Nicolas Town Hall", lat: 18.17293, lng: 120.59377, minZoom: 15 },
  { name: "St. Therese Hospital", lat: 18.1432, lng: 120.58397, minZoom: 16 },
  { name: "San Lorenzo", lat: 18.14026, lng: 120.58305, minZoom: 14 },
  { name: "Bil-loca", lat: 18.08894, lng: 120.56814, minZoom: 14 },
  { name: "Batac Public Market", lat: 18.06606, lng: 120.56326, minZoom: 14 },
  { name: "Mariano Marcos Memorial Hospital", lat: 18.06062, lng: 120.55955, minZoom: 15 },
  { name: "MMSU", lat: 18.06153, lng: 120.5498, minZoom: 14 },
  { name: "Tabug", lat: 18.04255, lng: 120.55045, minZoom: 14 },
  { name: "Pias Norte", lat: 17.99275, lng: 120.5027, minZoom: 14 },
  { name: "Apatut-Lubong", lat: 17.96489, lng: 120.47884, minZoom: 14 },
  { name: "Napu", lat: 17.9419, lng: 120.49124, minZoom: 14 },
  { name: "Caraitan", lat: 17.90517, lng: 120.47452, minZoom: 14 },
  { name: "Sinait Town Hall", lat: 17.86562, lng: 120.45684, minZoom: 14 },
  { name: "Pug-os", lat: 17.82108, lng: 120.45744, minZoom: 14 },
  { name: "Cabugao Town Hall", lat: 17.79458, lng: 120.45526, minZoom: 14 },
  { name: "San Juan Market", lat: 17.74688, lng: 120.45837, minZoom: 14 },
  { name: "Barbarit", lat: 17.71138, lng: 120.44625, minZoom: 14 },
  { name: "Magsingal Town Hall", lat: 17.68502, lng: 120.42455, minZoom: 14 },
  { name: "Santo Domingo Mall", lat: 17.63998, lng: 120.4094, minZoom: 14 },
  { name: "San Ildefonso Town Hall", lat: 17.62394, lng: 120.39343, minZoom: 14 },
  { name: "Bahet", lat: 17.61072, lng: 120.39536, minZoom: 14 },
  { name: "Northside Doctor's Hospital", lat: 17.60283, lng: 120.39491, minZoom: 15 },
  { name: "JTC Mall", lat: 17.58941, lng: 120.38918, minZoom: 14 },
  { name: "Aggay", lat: 17.58387, lng: 120.40286, minZoom: 14 },
  { name: "Bantay Town Hall", lat: 17.58112, lng: 120.39046, minZoom: 14 },
  { name: "Vigan Cathedral", lat: 17.57474, lng: 120.38893, minZoom: 15 },
  { name: "Vigan terminals", lat: 17.57108, lng: 120.38635, minZoom: 15 },
  { name: "Vigan Public Market", lat: 17.5685, lng: 120.38477, minZoom: 15 },
  { name: "Puregold", lat: 17.56732, lng: 120.38506, minZoom: 15 },
  { name: "Beddeng Laud", lat: 17.55933, lng: 120.38892, minZoom: 14 },
];

export { LANDMARKS };
