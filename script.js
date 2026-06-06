(function(){
    const canvas = document.getElementById('coverCanvas');
    const ctx = canvas.getContext('2d');
    const titleInput = document.getElementById('titleInput');
    const fontSelect = document.getElementById('fontSelect');
    const weightSelect = document.getElementById('weightSelect');
    const textColorInput = document.getElementById('textColor');
    const fontSizeRange = document.getElementById('fontSizeRange');
    const sizeSpan = document.getElementById('sizeValue');
    const paddingRange = document.getElementById('paddingRange');
    const padSpan = document.getElementById('padValue');
    const dimColorInput = document.getElementById('dimColor');
    const dimOpacityRange = document.getElementById('dimOpacity');
    const textAlignSelect = document.getElementById('textAlignSelect');
    const textBaselineSelect = document.getElementById('textBaselineSelect');
    const typeBtns = document.querySelectorAll('.type-btn');
    const customBlockDiv = document.getElementById('customBlock');
    const customWInput = document.getElementById('customW');
    const customHInput = document.getElementById('customH');
    const dropZoneDiv = document.getElementById('dropZone');
    const fileInputEl = document.getElementById('fileInput');
    const downloadBtn = document.getElementById('downloadBtn');
    
    const modal = document.getElementById('exportModal');
    const exportW = document.getElementById('exportW');
    const exportH = document.getElementById('exportH');
    const exportScale = document.getElementById('exportScale');
    const confirmExportBtn = document.getElementById('confirmExport');
    const cancelModalBtn = document.getElementById('cancelModal');
    
    let currentImage = null;
    let imageType = 'cover';
    let canvasWidth = 960, canvasHeight = 540;
    let currentTitle = "ПРИМЕР ТЕКСТА";
    let currentFont = "Courier New, monospace";
    let currentWeight = 700;
    let currentTextColor = "#ffffff";
    let currentFontSize = 84;
    let currentPaddingPercent = 0.05;
    let currentDimColor = "#000000";
    let currentDimOpacity = 0.38;
    let currentAlign = "center";
    let currentBaseline = "middle";
    let customW = 16, customH = 9;
    
    function updateUI() {
        sizeSpan.innerText = fontSizeRange.value + "px";
        padSpan.innerText = paddingRange.value + "%";
        currentFontSize = parseInt(fontSizeRange.value);
        currentPaddingPercent = parseFloat(paddingRange.value) / 100;
    }
    
    function computeCanvasDimensions() {
        if (imageType === 'cover') {
            canvasWidth = 960;
            canvasHeight = 540;
        } else if (imageType === 'poster') {
            canvasWidth = 333;
            canvasHeight = 500;
        } else {
            let w = parseInt(customWInput.value) || 16;
            let h = parseInt(customHInput.value) || 9;
            if (w < 1) w = 16;
            if (h < 1) h = 9;
            customW = w; customH = h;
            const base = 560;
            canvasWidth = base;
            canvasHeight = Math.round(base * (h / w));
            if (canvasHeight < 90) canvasHeight = 180;
            canvasWidth = Math.round(canvasHeight * (w / h));
        }
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }
    
    function drawFullCanvas() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        if (!currentImage) {
            ctx.fillStyle = "#070910";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.fillStyle = "#ff6a0011";
            for (let i=0;i<140;i++) {
                ctx.fillRect((i*29)%canvasWidth, (i*19)%canvasHeight, 1, 1);
            }
        } else {
            const imgW = currentImage.width, imgH = currentImage.height;
            const targetRatio = canvasWidth / canvasHeight;
            const imgRatio = imgW / imgH;
            let dw, dh, ox=0, oy=0;
            if (imgRatio > targetRatio) {
                dh = canvasHeight;
                dw = imgW * (canvasHeight / imgH);
                ox = (canvasWidth - dw)/2;
            } else {
                dw = canvasWidth;
                dh = imgH * (canvasWidth / imgW);
                oy = (canvasHeight - dh)/2;
            }
            ctx.drawImage(currentImage, ox, oy, dw, dh);
        }
        ctx.fillStyle = currentDimColor;
        ctx.globalAlpha = currentDimOpacity;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.globalAlpha = 1;
        drawWrappedText();
    }
    
    function drawWrappedText() {
        if (!currentTitle || currentTitle.trim() === "") {
            return;
        }
        ctx.save();
        ctx.font = `${currentWeight} ${currentFontSize}px ${currentFont}`;
        ctx.fillStyle = currentTextColor;
        ctx.textAlign = currentAlign;
        ctx.textBaseline = currentBaseline;
        
        const maxWidth = canvasWidth - (canvasWidth * currentPaddingPercent * 2);
        const words = currentTitle.split(/\s+/);
        let lines = [];
        let line = words[0] || '';
        for (let i=1;i<words.length;i++) {
            const test = line + " " + words[i];
            const m = ctx.measureText(test);
            if (m.width > maxWidth && line.length>0) {
                lines.push(line);
                line = words[i];
            } else {
                line = test;
            }
        }
        if (line) lines.push(line);
        if (lines.length === 0) return;
        
        const lineHeight = currentFontSize * 1.42;
        const totalHeight = lines.length * lineHeight;
        let startY;
        if (currentBaseline === 'top') startY = canvasHeight * currentPaddingPercent;
        else if (currentBaseline === 'middle') startY = (canvasHeight/2) - (totalHeight/2);
        else startY = canvasHeight - (canvasHeight * currentPaddingPercent) - totalHeight;
        
        if (startY < canvasHeight*0.02) startY = canvasHeight*0.02;
        if (startY + totalHeight > canvasHeight - canvasHeight*0.02) startY = canvasHeight - totalHeight - canvasHeight*0.02;
        
        for (let i=0;i<lines.length;i++) {
            const y = startY + i*lineHeight;
            ctx.fillText(lines[i], canvasWidth/2, y);
        }
        ctx.restore();
    }
    
    function refresh() {
        computeCanvasDimensions();
        drawFullCanvas();
    }
    
    function loadImageFromFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                refresh();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function setDefaultImage() {
        const fallback = new Image();
        fallback.onload = () => {
            currentImage = fallback;
            refresh();
        };
        fallback.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%2311131c'/%3E%3Cpath d='M0 0 L600 400 M600 0 L0 400' stroke='%23ff6a0018' stroke-width='2'/%3E%3C/svg%3E";
    }
    
    function exportHighRes() {
        let w = Math.max(120, parseInt(exportW.value) || canvasWidth);
        let h = Math.max(120, parseInt(exportH.value) || canvasHeight);
        let scale = parseFloat(exportScale.value) || 1;
        const finalW = Math.round(w * scale);
        const finalH = Math.round(h * scale);
        const off = document.createElement('canvas');
        off.width = finalW;
        off.height = finalH;
        const offCtx = off.getContext('2d');
        offCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, finalW, finalH);
        const link = document.createElement('a');
        const name = (currentTitle && currentTitle.trim() !== "" ? currentTitle.replace(/[^a-z0-9]/gi,'_') : 'cover').slice(0,30);
        link.download = `reagent_${name}.png`;
        link.href = off.toDataURL('image/png');
        link.click();
    }
    
    function openModal() {
        exportW.value = canvasWidth;
        exportH.value = canvasHeight;
        exportScale.value = 2;
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
    }
    function closeModal() {
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        setTimeout(() => modal.style.display = 'none', 200);
    }
    
    function bindEvents() {
        titleInput.addEventListener('input', (e) => { 
            currentTitle = e.target.value;
            refresh();
        });
        fontSelect.addEventListener('change', (e) => { currentFont = e.target.value; refresh(); });
        weightSelect.addEventListener('change', (e) => { currentWeight = parseInt(e.target.value); refresh(); });
        textColorInput.addEventListener('input', (e) => { currentTextColor = e.target.value; refresh(); });
        fontSizeRange.addEventListener('input', () => { currentFontSize = parseInt(fontSizeRange.value); updateUI(); refresh(); });
        paddingRange.addEventListener('input', () => { currentPaddingPercent = parseFloat(paddingRange.value)/100; updateUI(); refresh(); });
        dimColorInput.addEventListener('input', (e) => { currentDimColor = e.target.value; refresh(); });
        dimOpacityRange.addEventListener('input', (e) => { currentDimOpacity = parseFloat(e.target.value); refresh(); });
        textAlignSelect.addEventListener('change', (e) => { currentAlign = e.target.value; refresh(); });
        textBaselineSelect.addEventListener('change', (e) => { currentBaseline = e.target.value; refresh(); });
        
        typeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                imageType = type;
                typeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                customBlockDiv.style.display = (type === 'custom') ? 'block' : 'none';
                computeCanvasDimensions();
                let ratio = canvasWidth/canvasHeight;
                let newSize = currentFontSize;
                if (ratio >= 1.6) newSize = Math.min(115, currentFontSize + 12);
                else if (ratio <= 0.7) newSize = Math.max(52, currentFontSize - 18);
                fontSizeRange.value = newSize;
                currentFontSize = newSize;
                updateUI();
                refresh();
            });
        });
        
        customWInput.addEventListener('input', () => { if(imageType === 'custom') refresh(); });
        customHInput.addEventListener('input', () => { if(imageType === 'custom') refresh(); });
        
        dropZoneDiv.addEventListener('click', () => fileInputEl.click());
        fileInputEl.addEventListener('change', (e) => { if(e.target.files[0]) loadImageFromFile(e.target.files[0]); });
        
        window.addEventListener('dragover', (e) => { e.preventDefault(); });
        window.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length && files[0].type.startsWith('image/')) {
                loadImageFromFile(files[0]);
                dropZoneDiv.style.background = "#0b0d14";
            }
        });
        dropZoneDiv.addEventListener('dragover', (e) => { e.preventDefault(); dropZoneDiv.style.background = "#1c1f2c"; });
        dropZoneDiv.addEventListener('dragleave', () => { dropZoneDiv.style.background = "#0b0d14"; });
        dropZoneDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZoneDiv.style.background = "#0b0d14";
            const files = e.dataTransfer.files;
            if(files.length) loadImageFromFile(files[0]);
        });
        
        downloadBtn.addEventListener('click', openModal);
        confirmExportBtn.addEventListener('click', () => { exportHighRes(); closeModal(); });
        cancelModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });
    }
    
    function init() {
        bindEvents();
        setDefaultImage();
        currentTitle = "ПРИМЕР ТЕКСТА";
        titleInput.value = currentTitle;
        currentFontSize = 84;
        fontSizeRange.value = 84;
        currentPaddingPercent = 0.05;
        paddingRange.value = 5;
        updateUI();
        refresh();
    }
    init();
})();