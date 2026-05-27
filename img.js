const uploadImg = document.getElementById("uploadImg");
const uploadedImg = document.querySelector(".uploadedImg");
const file = document.getElementById("file");
const preview = document.getElementById("preview");
const progressVal = document.getElementById("progressVal");
const dis = document.getElementById("dis");
const downloadBtn = document.querySelector(".dwnd");
const blurrImg = document.getElementById("blurrImg");
const enhancedImg = document.getElementById("enhancedImg");
const err = document.getElementById("err");

const enhanceOverlayMarkup = `
                <div class="enhanceOverlay" aria-live="polite" aria-label="Enhancing image">
                <div class="dotGrid" aria-hidden="true">
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span>
                </div>
                <span class="enhanceLabel">Enhancing image...</span>
                </div>
                `;

function setEnhancingState(isEnhancing) {
    preview.classList.toggle("enhancing", isEnhancing);

    const existingOverlay = preview.querySelector(".enhanceOverlay");

    if (isEnhancing && !existingOverlay) {
        preview.insertAdjacentHTML("beforeend", enhanceOverlayMarkup);
    }

    if (!isEnhancing && existingOverlay) {
        existingOverlay.remove();
    }
}

// Prevent default drag and drop behavior
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

// Handle drop upload
document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        file.files = files;
        processFile(files[0]);
    }
});

// Process file change
file.addEventListener("change", (e) => {
    const fileVal = e.target.files[0];
    processFile(fileVal);
});

async function processFile(fileVal) {
    if (!fileVal || !fileVal.type.startsWith("image/")) {
        return;
    }

    // Reset error display on new attempt
    err.style.display = "none";
    err.textContent = "";

    const imageURL = URL.createObjectURL(fileVal);
    preview.innerHTML = `<img src="${imageURL}" alt="uploaded image">`;
    setEnhancingState(true);

    const initialTargetImg = document.querySelector(".DoneIMG .img:first-child");
    if (initialTargetImg) {
        initialTargetImg.src = imageURL;
    }

    progressVal.value = 20;
    dis.textContent = "20%";

    try {
        // Convert image file to Base64 for Puter's SDK
        const reader = new FileReader();
        const base64Image = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(fileVal);
        });

        progressVal.value = 50;
        dis.textContent = "50% (AI working...)";

        // Call Puter's built-in AI image-to-image feature
        const result = await puter.ai.txt2img(`Advanced System Instruction: Ultra-Resolution Photogrammetry Enhancement
Objective: Perform a precision-engineered reconstruction of low-resolution/blurry input into an ultra-sharp, high-frequency image. Eliminate all digital "noise" and compression artifacts while maintaining absolute identity and environmental accuracy.

Operational Workflow:

Sensor-Data Interpolation: Treat the input as a "raw" sensor capture that requires high-resolution reconstruction. Infer the high-frequency pixel data (edges, textures, specular highlights) that was lost due to sensor blur, rather than simply upscaling existing pixels.

Edge & Contour Sharpening: Apply a sharp-focus algorithm to all subject outlines and environmental features (mountain ridges, shoreline, clothing folds). Ensure distinct separation between foreground subjects and the background, increasing local contrast without creating halos.

Texture Synthesis (No-Smoothing Protocol): * Strictly Prohibit: "Airbrushing," "skin-smoothing," or "plastic" texture generation.

Mandate: Maintain natural skin pores, fabric weaves, and environmental grit.

Luminance & Tone Calibration: Match the lighting density of the original sunset. Ensure that the light-to-shadow ratios (chiaroscuro) are enhanced to increase clarity, making the subjects pop from the background without artificial light injection.

Multi-Pass Identity Verification: Before final rendering, perform a recursive comparison against the original image. Any facial feature that deviates by >2% of the original structural geometry must be re-processed to ensure 1:1 identity retention.

Output Specification:

Result: A clean, crisp, professional-grade photograph.

Aesthetic: High-end DSLR clarity, deep dynamic range, and noise-free, high-frequency detail.

Constraint: Zero "AI-style" smudging. If the data is missing, the model must synthesize realistic, non-uniform textures to match the local environment.`, {
            model: "gemini-2.5-flash-image-preview",
            input_image: base64Image,
            input_image_mime_type: fileVal.type
        });

        progressVal.value = 100;
        dis.textContent = "100%";

        // Show results
        blurrImg.src = imageURL;
        enhancedImg.src = result.src;
        setEnhancingState(false);
        uploadedImg.classList.add("active");

        // Fixed duplicate listener attachment and fixed the 'linl' typo safely
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = result.src;
            link.download = 'enhanced-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

    } catch (error) {
        console.error(error);
        setEnhancingState(false);
        progressVal.value = 0; // Fixed from dis.value = 0
        dis.textContent = "";
        err.style.display = "block";
        err.textContent = "Connection error, please refresh the page";
    }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (!uploadedImg.contains(e.target) && uploadedImg.classList.contains("active") && e.target !== uploadImg) {
        uploadedImg.classList.remove("active");
    }
});

// Add keyboard support for modal close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && uploadedImg.classList.contains("active")) {
        uploadedImg.classList.remove("active");
    }
});
