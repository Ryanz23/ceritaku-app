const maps = {};

export function renderMap(id, lat, lon, name, desc) {
  if (typeof L === 'undefined') {
    console.error('Error: Leaflet library not loaded!');
    return;
  }

  const container = document.getElementById(id);
  if (!container) {
    console.warn(`Map container #${id} not found!`);
    return;
  }

  if (lat == null || lon == null) {
    console.warn(`Invalid coordinates for map container #${id}`);
    return;
  }

  if (maps[id]) {
    maps[id].remove();
    delete maps[id];
  }

  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  });

  const map = L.map(id, {
    zoomControl: false,
    attributionControl: false,
    layers: [osm]
  }).setView([lat, lon], 13);

  L.control.zoom({ position: 'topright' }).addTo(map);

  const marker = L.marker([lat, lon]).addTo(map);
  marker.bindPopup(`<b>${name}</b><br>${desc}`);

  requestAnimationFrame(() => map.invalidateSize());

  maps[id] = map;
}
