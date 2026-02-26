// Variables globales
let selectedFile = null;
let processedImageUrl = null;

// Elementos del DOM
const uploadBox = document.getElementById('uploadBox');
const imageInput = document.getElementById('imageInput');
const processBtn = document.getElementById('processBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const originalImage = document.getElementById('originalImage');
const processedImage = document.getElementById('processedImage');
const downloadBtn = document.getElementById('downloadBtn');
const newImageBtn = document.getElementById('newImageBtn');

// Click en la caja de upload
uploadBox.addEventListener('click', () => {
    imageInput.click();
});

// Cuando se selecciona archivo
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Validar tamaño (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('❌ La imagen es muy grande. Máximo 10MB');
            return;
        }
        
        // Validar tipo
        if (!file.type.match('image/(jpeg|jpg|png)')) {
            alert('❌ Solo se aceptan imágenes JPG o PNG');
            return;
        }
        
        selectedFile = file;
        uploadBox.style.borderColor = '#10b981';
        uploadBox.querySelector('.upload-text').textContent = '✅ ' + file.name;
        processBtn.disabled = false;
    }
});

// Drag and drop
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#764ba2';
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.borderColor = '#667eea';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
        imageInput.files = e.dataTransfer.files;
        imageInput.dispatchEvent(new Event('change'));
    }
});

// Procesar imagen
processBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    
    // Mostrar loading
    document.querySelector('.upload-section').style.display = 'none';
    loading.classList.add('active');
    
    try {
        // Convertir a base64
        const base64 = await fileToBase64(selectedFile);
        
        // Llamar a la API
        const response = await fetch('/api/remove-bg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                image: base64
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al procesar la imagen');
        }
        
        const data = await response.json();
        
        // Mostrar resultados
        originalImage.src = URL.createObjectURL(selectedFile);
        processedImage.src = data.imageUrl;
        processedImageUrl = data.imageUrl;
        
        loading.classList.remove('active');
        result.classList.add('active');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al procesar la imagen. Intenta de nuevo.');
        resetApp();
    }
});

// Descargar imagen
downloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = processedImageUrl;
    a.download = 'imagen-sin-fondo.png';
    a.click();
});

// Nueva imagen
newImageBtn.addEventListener('click', () => {
    resetApp();
});

// Función para convertir archivo a base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Resetear aplicación
function resetApp() {
    selectedFile = null;
    processedImageUrl = null;
    imageInput.value = '';
    uploadBox.style.borderColor = '#667eea';
    uploadBox.querySelector('.upload-text').textContent = 'Click para subir imagen';
    processBtn.disabled = true;
    loading.classList.remove('active');
    result.classList.remove('active');
    document.querySelector('.upload-section').style.display = 'block';
}