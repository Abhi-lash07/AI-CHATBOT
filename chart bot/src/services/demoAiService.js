// Demo AI Service for realistic simulated responses with image understanding and streaming capability

const DEMO_RESPONSES = {
  quantum: `### ⚛️ Understanding Quantum Computing

Quantum computing is a revolutionary paradigm that harnesses the fundamental laws of **quantum mechanics** to solve problems that are computationally intractable for classical supercomputers.

#### 1. Classical vs. Quantum Bits
* **Classical Bit:** Can exist strictly as either \`0\` or \`1\` (like a standard light switch).
* **Qubit (Quantum Bit):** Can exist as \`0\`, \`1\`, or in a **superposition** of both states simultaneously (like a spinning coin).

#### 2. Key Quantum Phenomena
1. **Superposition:** Allows a quantum computer to evaluate an astronomical number of possibilities at once.
2. **Entanglement:** Einstein's *"spooky action at a distance"*, where qubits become interconnected such that the state of one instantaneously influences another.
3. **Interference:** Used to amplify correct problem solutions while cancelling out incorrect paths.

#### 3. Real-World Applications
\`\`\`text
┌────────────────────────┐      ┌────────────────────────┐
│   Drug Discovery       │      │   Cryptography         │
│   Simulating molecules │ ───► │   Post-quantum crypto  │
└────────────────────────┘      └────────────────────────┘
\`\`\``,

  oracleBadge: `### 🎓 Oracle Cloud Infrastructure (OCI) Certification Badge

Based on the image you uploaded, this is an official **Oracle Cloud Infrastructure (OCI) AI Foundations Associate** credential badge.

#### 📋 Credential Details Visible in Image:
* **Issuing Body:** Oracle Corporation (Oracle Cloud Infrastructure)
* **Certification Level:** Foundations / Associate Level
* **Specialization:** Artificial Intelligence (AI) Foundations
* **Status:** Verified Professional Certification Badge

#### 💡 What This Certification Validates:
1. **Core AI & ML Concepts:** Foundational understanding of Artificial Intelligence, Machine Learning algorithms, and Deep Learning principles.
2. **Generative AI Fundamentals:** Working knowledge of Large Language Models (LLMs), prompt engineering, and foundational models.
3. **OCI AI Services:** Familiarity with Oracle Cloud's native AI ecosystem, including:
   - *OCI Vision* (Document analysis and image classification)
   - *OCI Language* (Natural language processing and sentiment analysis)
   - *OCI Speech & Document Understanding*
4. **Responsible AI:** Understanding data privacy, ethical AI guidelines, and secure enterprise deployment on Oracle Cloud.

#### 🚀 Career & Industry Value:
This certification is recognized across cloud engineering, data science, and enterprise IT roles to validate foundational competence in applying AI workloads on Oracle's enterprise infrastructure.`,

  mathProblem: `### 📐 Mathematical Problem Analysis & Step-by-Step Solution

I have analyzed the mathematical problem presented in your uploaded image.

#### 📝 Problem Statement:
\`\`\`text
Linear Equation: 2x + 5 = 15
\`\`\`

#### 🔍 Step-by-Step Solution:
1. **Subtract the constant term (5) from both sides:**
   $$2x + 5 - 5 = 15 - 5$$
   $$2x = 10$$

2. **Divide both sides by the coefficient of x (2):**
   $$x = \\frac{10}{2}$$
   $$x = 5$$

3. **Check and verify the solution:**
   $$2(5) + 5 = 10 + 5 = 15 \\quad \\checkmark$$

**Final Answer:** **x = 5**`,

  flowchart: `### 📊 Flowchart & Process Diagram Analysis

I have inspected the workflow and structure of the diagram in your uploaded image.

#### 🔀 Step-by-Step Process Flow:
1. **Start / Initialization Node:** The system receives an incoming input or event trigger.
2. **Input / Processing Step:** Data is sanitized and parsed for validation criteria.
3. **Decision Node (Conditional Branching):**
   - **Condition YES:** Proceeds to the primary execution path and data persistence.
   - **Condition NO:** Routes to the fallback exception handling sequence.
4. **End / Output State:** The flow concludes, returning the processed output to the user.

#### 💡 Observations:
The diagram follows standard ISO flowchart conventions with clear directional vectors between sequential states.`,

  story: `### 🌌 The Echoes of Kepler-186f

The automated navigational beacon of the exploration vessel *Astraea* hummed in the silent vacuum of deep space. Dr. Elena Vance pressed her hand against the observation deck's reinforced quartz glass, watching the crimson glow of the red dwarf star bathe the planet below in copper light.

\`\`\`yaml
Mission: Deep Frontier Reconnaissance
Vessel: Astraea IX
Primary AI: ARIA (Automated Resonance & Intelligence Agent)
Target: Kepler-186f (Habitable Zone, Sector 4)
Telemetry: Stable | Atmosphere: Nitrogen-Oxygen Rich
\`\`\`

*"Elena,"* the synthetic voice of ARIA resonated softly through the cabin. *"The atmospheric probes have surfaced something unprecedented. It isn't a geological formation."*

Elena leaned closer to the holographic console. Spectral scans revealed a subterranean lattice pulsing at exact mathematical intervals—the Fibonacci sequence rendered in coherent gamma bursts.`,

  code: `### ⚡ Clean React Hook: \`useDebounce\`

Here is a production-ready custom React hook for debouncing fast-changing inputs to prevent excessive API requests.

\`\`\`jsx
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
\`\`\``,

  project: `### 🚀 5 Innovative Web App Ideas for Developers

1. **DevPulse:** AI-powered pull request auditor and accessibility reviewer.
2. **MindFlow:** Infinite-canvas spatial Markdown knowledge base.
3. **EcoTrack:** Personal carbon footprint tracker with actionable micro-goals.
4. **SoundScaper:** Ambient generative soundscape workstation.
5. **SkillMatrix:** Interactive developer curriculum progression tree.`
};

export const demoAiService = {
  /**
   * Generates a response simulating Gemini streaming
   */
  generateStreamingResponse: async (prompt, history = [], onChunk = () => {}, signal = null, files = []) => {
    const lower = prompt.toLowerCase();
    let responseText = '';

    // Check if an image is attached to the current prompt or in history
    const allImages = [];
    if (files && Array.isArray(files)) {
      files.forEach(f => {
        if (f.type?.startsWith('image/')) allImages.push(f);
      });
    }

    if (history && Array.isArray(history)) {
      history.forEach(m => {
        if (m.files && Array.isArray(m.files)) {
          m.files.forEach(f => {
            if (f.type?.startsWith('image/')) allImages.push(f);
          });
        }
      });
    }

    const hasImage = allImages.length > 0;
    const latestImage = allImages[allImages.length - 1];

    if (hasImage) {
      const fileNameLower = (latestImage?.name || '').toLowerCase();

      // Check if this is an Oracle badge
      if (
        fileNameLower.includes('oracle') ||
        fileNameLower.includes('badge') ||
        fileNameLower.includes('cert') ||
        fileNameLower.includes('foundations') ||
        fileNameLower.includes('oci') ||
        lower.includes('oracle') ||
        lower.includes('cert') ||
        lower.includes('badge')
      ) {
        responseText = DEMO_RESPONSES.oracleBadge;
      } else if (
        fileNameLower.includes('math') ||
        fileNameLower.includes('equation') ||
        lower.includes('solve') ||
        lower.includes('math') ||
        lower.includes('calculate')
      ) {
        responseText = DEMO_RESPONSES.mathProblem;
      } else if (
        fileNameLower.includes('flowchart') ||
        fileNameLower.includes('diagram') ||
        lower.includes('diagram') ||
        lower.includes('flowchart')
      ) {
        responseText = DEMO_RESPONSES.flowchart;
      } else if (lower.includes('explain') || lower.includes('what is this') || lower.includes('describe')) {
        // If user says "Explain" for an image, give image analysis rather than quantum computing!
        if (fileNameLower.includes('badge') || fileNameLower.includes('cert') || fileNameLower.includes('oracle')) {
          responseText = DEMO_RESPONSES.oracleBadge;
        } else {
          responseText = `### 🖼️ Image Analysis & Visual Inspection

I have analyzed the uploaded image (**${latestImage.name || 'Image'}**).

#### 🔍 Visible Elements & Overview:
* **Format:** ${latestImage.type || 'Image file'}
* **Content Type:** Visual graphic / document
* **Context:** The image contains structured elements matching your request: "${prompt}".

*Tip: For live multimodal vision recognition across all photos and diagrams, add your \`GEMINI_API_KEY\` in the backend \`.env\` file or in Settings.*`;
        }
      } else {
        responseText = `### 🖼️ Image Context: ${latestImage.name || 'Image'}

Regarding your question: "${prompt}"

I have analyzed the visual information provided in the image to answer your inquiry accurately. If you need a deeper explanation of a specific section or component, let me know!`;
      }
    } else {
      // Text-only queries
      if (lower.includes('quantum')) {
        responseText = DEMO_RESPONSES.quantum;
      } else if (lower.includes('story') || lower.includes('creative') || lower.includes('fiction')) {
        responseText = DEMO_RESPONSES.story;
      } else if (lower.includes('code') || lower.includes('hook') || lower.includes('react') || lower.includes('debounce')) {
        responseText = DEMO_RESPONSES.code;
      } else if (lower.includes('project') || lower.includes('idea') || lower.includes('brainstorm')) {
        responseText = DEMO_RESPONSES.project;
      } else if (lower.includes('who are you') || lower.includes('what can you do') || lower.includes('help')) {
        responseText = `### 👋 Hello! I am ChatBot AI

I am a modern, intelligent web assistant inspired by **Google Gemini**.

#### What I can do:
* 🖼️ **Image Understanding:** Upload PNG, JPG, JPEG, and WEBP images to analyze certificates, diagrams, math problems, and screenshots.
* 💻 **Code & Debug:** Generate clean code snippets, explain algorithms, and assist with full-stack development.
* 📚 **Explain & Teach:** Break down complex topics into beginner-friendly explanations.
* ⚙️ **Gemini Vision Backend:** Connect your **Google Gemini API Key** in \`.env\` for live multimodal vision streaming!`;
      } else {
        responseText = `### ✨ ChatBot AI Response\n\nYou asked: **"${prompt}"**\n\nI have processed your query. You can attach any image using the **+** button to test multimodal visual understanding!`;
      }
    }

    // Split response into chunks (words and punctuation) to simulate realistic streaming
    const words = responseText.split(/(\s+)/);
    let accumulated = '';

    for (let i = 0; i < words.length; i++) {
      if (signal && signal.aborted) {
        throw new Error('Generation cancelled by user');
      }

      accumulated += words[i];
      onChunk(accumulated);

      const delay = Math.floor(Math.random() * 16) + 10;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    return accumulated;
  }
};
