import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.scss']
})
export class WhiteboardComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private router = inject(Router);

  // Estados de dibujo
  protected isDrawing = false;
  protected currentColor = signal('#ffffff');
  protected brushSize = signal(3);
  protected currentTool = signal<'brush' | 'eraser'>('brush');
  
  // Fondos
  protected backgrounds = [
    { id: 'basketball', name: 'Baloncesto', icon: '🏀' },
    { id: 'football', name: 'Fútbol', icon: '⚽' },
    { id: 'volleyball', name: 'Voleibol', icon: '🏐' },
    { id: 'handball', name: 'Balonmano', icon: '🤾' },
    { id: 'none', name: 'Limpio', icon: '⬜' }
  ];
  protected selectedBackground = signal('basketball');

  // Historial para deshacer
  private history: ImageData[] = [];
  private readonly MAX_HISTORY = 20;

  ngAfterViewInit() {
    this.initCanvas();
  }

  private initCanvas() {
    const canvasEl = this.canvas.nativeElement;
    this.ctx = canvasEl.getContext('2d', { willReadFrequently: true })!;
    
    // Set internal resolution to match displayed size
    this.resizeCanvas();
    
    // Guardar estado inicial
    this.saveState();
    
    // Configuración inicial del pincel
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  private saveState() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.history.push(imageData);
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
    }
  }

  undo() {
    if (this.history.length > 1) {
      this.history.pop(); // Eliminar estado actual
      const previousState = this.history[this.history.length - 1];
      this.ctx.putImageData(previousState, 0, 0);
    }
  }

  @HostListener('window:resize')
  resizeCanvas() {
    const canvasEl = this.canvas.nativeElement;
    const parent = canvasEl.parentElement;
    if (parent) {
      // Save content
      const tempImage = this.ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
      
      canvasEl.width = parent.clientWidth;
      canvasEl.height = parent.clientHeight;
      
      // Restore content (simplified, might need scaling if drastically different)
      this.ctx.putImageData(tempImage, 0, 0);
      
      // Reset context properties as they are lost on resize
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = this.currentTool() === 'eraser' ? '#000000' : this.currentColor();
      this.ctx.lineWidth = this.brushSize();
    }
  }

  // Handlers para mouse y touch
  startDrawing(event: MouseEvent | TouchEvent) {
    this.isDrawing = true;
    const pos = this.getPos(event);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
    event.preventDefault();
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    
    const pos = this.getPos(event);
    
    this.ctx.lineWidth = this.brushSize();
    this.ctx.strokeStyle = this.currentTool() === 'eraser' ? '#000000' : this.currentColor();
    this.ctx.globalCompositeOperation = this.currentTool() === 'eraser' ? 'destination-out' : 'source-over';
    
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    event.preventDefault();
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.ctx.closePath();
      this.saveState();
    }
  }

  private getPos(event: MouseEvent | TouchEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    let clientX, clientY;
    
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  // Herramientas
  setTool(tool: 'brush' | 'eraser') {
    this.currentTool.set(tool);
  }

  setColor(color: string) {
    this.currentColor.set(color);
    this.currentTool.set('brush');
  }

  clearCanvas() {
    if (confirm('¿Estás seguro de que quieres limpiar la pizarra?')) {
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }
  }

  selectBackground(bgId: string) {
    this.selectedBackground.set(bgId);
  }

  async saveSnapshot() {
    // Aquí podrías generar el PNG y abrir el modal de crear ejercicio con la imagen precargada
    const dataUrl = this.canvas.nativeElement.toDataURL('image/png');
    console.log('Snapshot saved:', dataUrl);
    
    // Por ahora solo notificamos
    alert('Imagen guardada temporalmente (funcionalidad de subida en desarrollo)');
  }

  goBack() {
    this.router.navigate(['/ejercicios']);
  }
}
