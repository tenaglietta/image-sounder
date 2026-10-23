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

