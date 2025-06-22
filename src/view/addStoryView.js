// View form tambah cerita dengan kamera dan peta
export function addStoryView({ onSubmit }) {
  const section = document.createElement('section');
  section.innerHTML = `
    <a href="#main-content" class="skip-link">Lewati ke Konten utama</a>
    <main id="main-content" tabindex="-1">
    <h2>Tambah Cerita Baru</h2>
    <form id="add-story-form" autocomplete="off">
      <label for="description">Deskripsi</label>
      <textarea id="description" required aria-label="Deskripsi cerita"></textarea>

      <label for="photo">Foto (kamera)</label>
      <input type="file" id="photo" accept="image/*" capture="environment" style="display:none" aria-label="Foto cerita">
      <button type="button" id="camera-btn" style="margin-bottom:8px"><i class="fa-solid fa-camera"></i> Ambil Foto dari Perangkat</button>
      <button type="button" id="start-camera" style="margin-bottom:8px"><i class="fa-solid fa-video"></i> Aktifkan Kamera</button>
      <video id="camera-preview" autoplay playsinline style="display:none;max-width:100%;margin-bottom:1rem;border-radius:6px;"></video>
      <button type="button" id="capture-btn" style="display:none;margin-bottom:8px"><i class="fa-solid fa-circle-dot"></i> Ambil Foto</button>

      <img id="photo-preview" alt="Preview foto cerita" style="display:none;max-width:100%;margin-bottom:1rem;border-radius:6px;" />

      <label for="map">Pilih Lokasi</label>
      <div id="add-map" style="height:220px;"></div>
      <input type="hidden" id="lat" required>
      <input type="hidden" id="lon" required>

      <button type="submit"><i class="fa-solid fa-paper-plane"></i> Kirim Cerita</button>
    </form>
  </main>
`;

const skipLink = section.querySelector('.skip-link');
if (skipLink) {
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    skipLink.blur();
    window.location.hash = '#/stories'; // Pindah ke halaman list cerita
  });
}


  setTimeout(() => setupMap(section), 0);

  const form = section.querySelector('form');
  const photoInput = form.querySelector('#photo');
  const cameraBtn = form.querySelector('#camera-btn');
  const startCameraBtn = form.querySelector('#start-camera');
  const video = form.querySelector('#camera-preview');
  const captureBtn = form.querySelector('#capture-btn');
  const preview = section.querySelector('#photo-preview');
  let stream = null;
  let capturedFile = null;

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
      video.srcObject = null;
      video.style.display = 'none';
      captureBtn.style.display = 'none';
      startCameraBtn.style.display = 'inline-block';
    }
  }

  cameraBtn.onclick = (e) => {
    e.preventDefault();
    photoInput.click();
  };

  startCameraBtn.onclick = async (e) => {
    e.preventDefault();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.style.display = 'block';
        captureBtn.style.display = 'inline-block';
        startCameraBtn.style.display = 'none';
        preview.style.display = 'none';
      } catch (err) {
        alert('Tidak dapat mengakses kamera: ' + err.message);
      }
    } else {
      alert('Browser tidak mendukung kamera langsung.');
    }
  };

  captureBtn.onclick = (e) => {
    e.preventDefault();
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      capturedFile = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      preview.src = URL.createObjectURL(blob);
      preview.style.display = 'block';
    }, 'image/jpeg');
    stopCamera();
  };

  photoInput.onchange = () => {
    const file = photoInput.files[0];
    if (file) {
      capturedFile = file;
      const reader = new FileReader();
      reader.onload = e => {
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.display = 'none';
      preview.src = '';
      capturedFile = null;
    }
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    const description = form.description.value;
    const photo = capturedFile;
    const lat = form.lat.value;
    const lon = form.lon.value;
    if (!lat || !lon) return alert('Pilih lokasi di peta!');
    if (!photo) return alert('Ambil atau pilih foto terlebih dahulu!');
    onSubmit({ description, photo, lat, lon });
  };

  return {
    element: section,
    cleanup: stopCamera
  };
}

function setupMap(section) {
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OSM' });
  const maptiler = L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=GetYourOwnKey', { maxZoom: 19, attribution: '© MapTiler' });

  const map = L.map(section.querySelector('#add-map'), {
    zoomControl: false,
    attributionControl: false,
    layers: [osm]
  }).setView([-6.2, 106.8], 10);

  const baseMaps = { 'OpenStreetMap': osm, 'MapTiler': maptiler };
  L.control.layers(baseMaps).addTo(map);

  let marker;
  map.on('click', function (e) {
    const { lat, lng } = e.latlng;
    section.querySelector('#lat').value = lat;
    section.querySelector('#lon').value = lng;
    if (marker) marker.setLatLng([lat, lng]);
    else marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup('Lokasi cerita di sini').openPopup();
  });

  const mainContent = document.querySelector('#main-content'); // Seleksi elemen id="main-content" bisa disesuaikan kembali jika berbeda
  const skipLink = document.querySelector('.skip-link'); // Seleksi elemen class="skip-link" bisa disesuaikan kembali jika berbeda
  skipLink.addEventListener('click', function (event) {
    event.preventDefault(); // Mencegah refresh halaman
    skipLink.blur(); // Menghilangkan fokus skip to content

    mainContent.focus(); // Fokus ke konten utama
    mainContent.scrollIntoView(); // Halaman scroll ke konten utama
});

}
