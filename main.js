// Configurazione Algoritmo
const GRID_SIZE = 32; // Griglia 32x32 = 1024 punti di scansione (leggerissima)
let audioCtx = null;
let currentOsc = null;
let modOsc = null;
let modGain = null;
let masterGain = null;
let filter = null;

let isPlaying = false;
let scanIndex = 0;
let scanInterval = null;
let imageAnalysisData = [];

// Elementi DOM
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');

const scanPosEl = document.getElementById('scanPos');
const entropyValEl = document.getElementById('entropyVal');
const gradientValEl = document.getElementById('gradientVal');
const freqValEl = document.getElementById('freqVal');

// Eventi Upload
dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleImage(e.target.files[0]));
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); });
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length) handleImage(e.dataTransfer.files[0]);
});

function handleImage(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const img = new Image();
  img.onload = () => {
    canvas.width = GRID_SIZE;
    canvas.height = GRID_SIZE;
    ctx.drawImage(img, 0, 0, GRID_SIZE, GRID_SIZE);
    analyzeImage();
    playBtn.disabled = false;
    document.getElementById('dropText').innerText = `Caricato: ${file.name}`;
  };
  img.src = URL.createObjectURL(file);
}

// Analisi Strutturale: Entropia + Gradiente Sobel + Traiettoria
function analyzeImage() {
  const imgData = ctx.getImageData(0, 0, GRID_SIZE, GRID_SIZE);
  const data = imgData.data;
  imageAnalysisData = [];

  // Converti in scala di grigi
  const gray = new Float32Array(GRID_SIZE * GRID_SIZE);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
  }

  // Genera punti di scansione non-lineare (Curva a zig-zag adattiva)
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const actualX = (y % 2 === 0) ? x : (GRID_SIZE - 1 - x);
      const idx = y * GRID_SIZE + actualX;

      // 1. Calcolo Gradiente di Bordo (Sobel Semplificato)
      let gx = 0, gy = 0;
      if (actualX > 0 && actualX < GRID_SIZE - 1 && y > 0 && y < GRID_SIZE - 1) {
        gx = -gray[(y - 1) * GRID_SIZE + (actualX - 1)] + gray[(y - 1) * GRID_SIZE + (actualX + 1)]
             -2 * gray[y * GRID_SIZE + (actualX - 1)] + 2 * gray[y * GRID_SIZE + (actualX + 1)]
             -gray[(y + 1) * GRID_SIZE + (actualX - 1)] + gray[(y + 1) * GRID_SIZE + (actualX + 1)];

        gy = -gray[(y - 1) * GRID_SIZE + (actualX - 1)] - 2 * gray[(y - 1) * GRID_SIZE + actualX] - gray[(y - 1) * GRID_SIZE + (actualX + 1)]
             +gray[(y + 1) * GRID_SIZE + (actualX - 1)] + 2 * gray[(y + 1) * GRID_SIZE + actualX] + gray[(y + 1) * GRID_SIZE + (actualX + 1)];
      }
      const edgeMagnitude = Math.min(1, Math.sqrt(gx * gx + gy * gy));

      // 2. Calcolo Entropia/Variazione Locale (Intorno 3x3)
      let sum = 0, sqSum = 0, count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = actualX + dx, ny = y + dy;
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            const val = gray[ny * GRID_SIZE + nx];
            sum += val;
            sqSum += val * val;
            count++;
          }
        }
      }
      const mean = sum / count;
      const variance = Math.max(0, (sqSum / count) - (mean * mean));

      imageAnalysisData.push({
        x: actualX,
        y: y,
        luminance: gray[idx],
        edge: edgeMagnitude,
        entropy: Math.sqrt(variance) * 2 // Normalizzato
      });
    }
  }
}

// Inizializzazione Audio Sintetizzatore FM
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.15, audioCtx.currentTime);

  filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';

  // Oscillatore Portante
  currentOsc = audioCtx.createOscillator();
  currentOsc.type = 'sine';

  // Oscillatore Modulatore (Modulazione di Frequenza per Ruvidezza/Timbro)
  modOsc = audioCtx.createOscillator();
  modOsc.type = 'triangle';

  modGain = audioCtx.createGain();

  // Conressioni audio
  modOsc.connect(modGain);
  modGain.connect(currentOsc.frequency);
  currentOsc.connect(filter);
  filter.connect(masterGain);
  masterGain.connect(audioCtx.destination);

  currentOsc.start();
  modOsc.start();
}

// Avvio Riproduzione
playBtn.addEventListener('click', () => {
  if (!isPlaying) {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    isPlaying = true;
    scanIndex = 0;
    playBtn.disabled = true;
    stopBtn.disabled = false;

    // Scansione ogni 60ms (ritmo fluido)
    scanInterval = setInterval(updateAudioStep, 60);
  }
});

stopBtn.addEventListener('click', stopAudio);

function stopAudio() {
  if (isPlaying) {
    clearInterval(scanInterval);
    if (masterGain) masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    isPlaying = false;
    playBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

// Aggiornamento Frequenza e parametri timbrici per ogni punto dell'immagine
function updateAudioStep() {
  if (scanIndex >= imageAnalysisData.length) {
    stopAudio();
    return;
  }

  const point = imageAnalysisData[scanIndex];

  // Mappatura non-melodica: Frequenza di base (60Hz - 1200Hz microtonale continua)
  const baseFreq = 60 + Math.pow(point.luminance, 2.2) * 1140;
  
  // Il gradiente determina la frequenza del modulatore (dissonanza)
  const modFreq = 10 + point.edge * 300;
  
  // L'entropia/variazione determina l'intensità della modulazione e il Q del filtro
  const modDepth = point.entropy * 400;
  const filterQ = 1 + (1 - point.entropy) * 15;

  // Applicazione parametri audio con transizioni morbide
  const now = audioCtx.currentTime;
  currentOsc.frequency.setTargetAtTime(baseFreq, now, 0.03);
  modOsc.frequency.setTargetAtTime(modFreq, now, 0.03);
  modGain.gain.setTargetAtTime(modDepth, now, 0.03);
  
  filter.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.03);
  filter.Q.setTargetAtTime(filterQ, now, 0.03);

  // Aggiornamento GUI
  scanPosEl.innerText = `${scanIndex + 1} / ${imageAnalysisData.length}`;
  entropyValEl.innerText = point.entropy.toFixed(3);
  gradientValEl.innerText = point.edge.toFixed(3);
  freqValEl.innerText = `${Math.round(baseFreq)} Hz`;

  scanIndex++;
}
