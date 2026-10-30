// Places a commuter on the Laoag to Vigan road knows, written on the map so "where is the bus" has a picture.
// From OpenStreetMap, picked by hand (about 20 of the 87 near the road) so the map stays calm.
// `minZoom` is the zoom level from which the label shows: 14 for the big anchors, 15 where places are close together.
const LANDMARKS = [
  { name: "Laoag terminals", lat: 18.19606, lng: 120.5908, minZoom: 15 },
  { name: "St. William Cathedral", lat: 18.19386, lng: 120.59358, minZoom: 15 },
  { name: "SM City Laoag", lat: 18.18921, lng: 120.58614, minZoom: 14 },
  { name: "Robinsons Ilocos", lat: 18.17931, lng: 120.59227, minZoom: 14 },
  { name: "San Nicolas Town Hall", lat: 18.17293, lng: 120.59377, minZoom: 15 },
  { name: "Batac Public Market", lat: 18.06606, lng: 120.56326, minZoom: 14 },
  { name: "MMSU", lat: 18.06153, lng: 120.5498, minZoom: 14 },
  { name: "Sinait Town Hall", lat: 17.86562, lng: 120.45684, minZoom: 14 },
  { name: "Cabugao Town Hall", lat: 17.79458, lng: 120.45526, minZoom: 14 },
  { name: "San Juan Market", lat: 17.74688, lng: 120.45837, minZoom: 14 },
  { name: "Magsingal Town Hall", lat: 17.68502, lng: 120.42455, minZoom: 14 },
  { name: "Santo Domingo Mall", lat: 17.63998, lng: 120.4094, minZoom: 14 },
  { name: "San Ildefonso Town Hall", lat: 17.62394, lng: 120.39343, minZoom: 14 },
  { name: "JTC Mall", lat: 17.58941, lng: 120.38918, minZoom: 14 },
  { name: "Bantay Town Hall", lat: 17.58112, lng: 120.39046, minZoom: 14 },
  { name: "Vigan Cathedral", lat: 17.57474, lng: 120.38893, minZoom: 15 },
  { name: "Vigan terminals", lat: 17.57108, lng: 120.38635, minZoom: 15 },
  { name: "Vigan Public Market", lat: 17.5685, lng: 120.38477, minZoom: 15 },
  { name: "Puregold", lat: 17.56732, lng: 120.38506, minZoom: 15 },
];

export { LANDMARKS };
