const dropZone = document.getElementById('dropZone');
const imageInput = document.getElementById('imageInput');
const originalImg = document.getElementById('originalImg');
const enhancedImg = document.getElementById('enhancedImg');
const processBtn = document.getElementById('processBtn');
const statusText = document.getElementById('statusText');

// Manejar eventos de arrastrar y soltar
dropZone.addEventListener('click', () => imageInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = '#bbdefb';
});
dropZone.addEventListener('dragleave', () => {
    dropZone.style.background = '#e3f2fd';
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = '#e3f2fd';
    
    if(e.dataTransfer.files.length) {
        imageInput.files = e.dataTransfer.files;
        loadImage(e.dataTransfer.files[0]);
    }
});

// Cargar imagen seleccionada
imageInput.addEventListener('change', (e) => {
    if(e.target.files.length) {
        loadImage(e.target.files[0]);
    }
});

function loadImage(file) {
    if(!file.type.match('image.*')) {
        statusText.textContent = 'Por favor, sube un archivo de imagen válido';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        originalImg.src = e.target.result;
        enhancedImg.src = '';
        statusText.textContent = 'Imagen cargada. Haz clic en "Mejorar Calidad"';
    };
    reader.readAsDataURL(file);
}

// Procesar imagen con IA
processBtn.addEventListener('click', async () => {
    if(!imageInput.files.length) {
        statusText.textContent = 'Por favor, sube una imagen primero';
        return;
    }

    statusText.textContent = 'Mejorando calidad... (puede tardar 20-30 segundos)';
    processBtn.disabled = true;
    
    const formData = new FormData();
    formData.append('image', imageInput.files[0]);

    try {
        // Usar Cloudflare Worker como proxy
        const response = await fetch('https://your-worker-name.your-cloudflare-subdomain.workers.dev', {
            method: 'POST',
            body: formData
        });

        if(!response.ok) throw new Error('Error en el servidor');
        
        const result = await response.json();
        enhancedImg.src = result.output;
        statusText.textContent = '¡Calidad mejorada con éxito!';
    } catch (error) {
        console.error(error);
        statusText.textContent = 'Error: ' + error.message;
    } finally {
        processBtn.disabled = false;
    }
});