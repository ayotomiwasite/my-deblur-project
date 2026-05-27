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
        const result = await puter.ai.txt2img("Enhance this image, improve quality and clarity to the highest level", {
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
