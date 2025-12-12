class ImageRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.img = new Image();
        this.imageLoaded = false;
        
        this.img.onload = () => {
            this.imageLoaded = true;
            this.render();
        };
        
        this.ctx.fillStyle = '#000000'; 
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    loadNewImage(url) {
        this.imageLoaded = false;
        this.img.src = url;
    }

    render(blockSize = 30) {
        if (!this.imageLoaded) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.drawImage(this.img, 0, 0, width, height);
        
        for (let y = 0; y < height; y += blockSize) {
            for (let x = 0; x < width; x += blockSize) {
                const pixelData = this.ctx.getImageData(x, y, 1, 1).data;
                const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x, y, blockSize, blockSize);
            }
        }
    }
}