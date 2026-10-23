# image-sounder

**Image Sounder** is a minimalist, browser-based sound art application designed to translate visual matrices into non-melodic, electroacoustic soundscapes. 

Rather than relying on standard color-to-pitch mappings or rigid scanlines, the system extracts the structural "DNA" of an image—such as local entropy, edge gradient matrices, and luminance—and routes these variables directly into a continuous Web Audio synthesis engine.

## Conceptual Framework

The project explores the ontological difference between **optical time** (static, instantaneous, spatialized) and **acoustic time** (transitive, continuous, event-based). By reading images through non-linear trajectories and mapping micro-structures to sound parameters, *Image Sounder* unveils the internal resonance of visual material without reducing audio to mere illustration.

## Key Features

* **Zero Dependencies & Lightweight:** Built purely with vanilla JavaScript, HTML5 Canvas, and CSS3. No external libraries or heavy dependencies.
* **Structural Analysis:**
  * **Sobel Gradient Matrix:** Detects edge contrast and local transitions to drive frequency modulation (timbral roughness and dissonance).
  * **Local Entropy & Variance:** Analyzes 3x3 pixel neighborhood disorganization to modulate filter resonance ($Q$) and FM modulation depth.
* **Microtonal Synthesis Engine:** Powered by the Web Audio API, using continuous frequency ranges (60 Hz – 1200 Hz) instead of traditional tempered musical scales.
* **GitHub Pages Ready:** Designed for seamless deployment on static hosting platforms.

## Repository Structure
/
├── index.html    # Semantic structure and control panel
├── style.css     # Minimalist dark-mode styling
└── main.js       # Image analysis algorithms & Web Audio FM synthesizer
## Getting Started

### Local Setup
1. Clone this repository:
   ```bash
   git clone [https://github.com/your-username/image-sounder.git](https://github.com/your-username/image-sounder.git)
​2. Open index.html directly in any modern web browser.
Live Deployment via GitHub Pages
​Push the code to your GitHub repository.
​Go to Settings \rightarrow Pages.
​Under Build and deployment, select the main branch and click Save.
​Your application will be live at https://your-username.github.io/image-sounder/.

##​How It Works
1. ​Upload: Drag & drop any image into the canvas area.
2. ​Analysis: The image is downsampled to a lightweight grid where each cell's luminance, edge magnitude, and entropy are computed.
3. ​Transduction: Click Start Sound Transduction to initiate a non-linear scan through the matrix, triggering dynamic micro-modulations in real time.

##​License
​This project is open-source and available under the MIT License.
