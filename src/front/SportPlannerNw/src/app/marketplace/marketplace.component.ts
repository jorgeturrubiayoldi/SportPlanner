import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-background p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
           <h1 class="text-3xl font-black uppercase tracking-tighter text-foreground">Marketplace <span class="text-primary">Global</span></h1>
           <p class="text-sm text-muted-foreground uppercase font-bold tracking-widest">Adquiere conocimiento de la élite</p>
        </div>
        <div class="flex gap-2">
            <button class="px-4 py-2 rounded-xl bg-card border border-border text-xs font-black uppercase tracking-widest hover:border-primary/50 transition-all">Mis Compras</button>
            <button class="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Vender Plan</button>
        </div>
      </div>

      <!-- Categories -->
      <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
         @for(cat of categories; track cat) {
             <button class="px-6 py-3 rounded-2xl bg-card border border-border text-sm font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all whitespace-nowrap">
                 {{ cat }}
             </button>
         }
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         <!-- Mock Item -->
         <div class="group relative bg-card border border-border rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
             <div class="h-48 bg-muted relative">
                 <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                 <span class="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-xs font-black uppercase tracking-widest border border-white/10">Elite</span>
                 <div class="absolute bottom-4 left-4">
                     <h3 class="text-white font-black text-xl italic uppercase leading-none">Pretemporada <br>Física Total</h3>
                     <p class="text-white/70 text-xs font-bold mt-1">Por Coach Pro</p>
                 </div>
             </div>
             <div class="p-5 space-y-4">
                 <div class="flex justify-between items-center">
                     <div class="flex gap-1 text-amber-400">★★★★★ <span class="text-muted-foreground text-xs font-bold ml-1">(42)</span></div>
                     <span class="text-xl font-black text-foreground">29.99€</span>
                 </div>
                 <button class="w-full py-3 rounded-xl bg-primary/10 text-primary font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all">
                     Ver Detalles
                 </button>
             </div>
         </div>
      </div>

    </div>
  `
})
export class MarketplaceComponent {
    categories = ['Táctica Avanzada', 'Preparación Física', 'Fútbol Base', 'Porteros', 'Psicología'];
}
