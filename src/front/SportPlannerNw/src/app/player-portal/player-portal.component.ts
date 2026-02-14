import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-portal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-background pb-20 font-sans">
      
      <!-- Mobile Header -->
      <header class="bg-card/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 border-b border-white/5 flex items-center justify-between">
         <div class="flex items-center gap-3">
             <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black border border-primary/20">JP</div>
             <div>
                 <h1 class="text-sm font-black uppercase tracking-wider">Juan Pérez</h1>
                 <p class="text-[10px] text-muted-foreground font-bold uppercase">Delantero • #9</p>
             </div>
         </div>
         <button class="relative">
             <div class="w-2 h-2 rounded-full bg-red-500 absolute top-0 right-0 animate-pulse"></div>
             <svg class="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
         </button>
      </header>

      <!-- Next Session Card (Hero) -->
      <div class="p-6">
          <h2 class="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Próxima Misión</h2>
          <div class="relative bg-gradient-to-br from-primary to-primary/80 rounded-[30px] p-6 shadow-2xl shadow-primary/30 overflow-hidden">
              <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              
              <div class="relative z-10 text-primary-foreground">
                  <div class="flex justify-between items-start mb-4">
                      <span class="px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Mañana, 18:00</span>
                      <svg class="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 class="text-2xl font-black italic uppercase leading-tight mb-2">Táctica Ofensiva <br>& Finalización</h3>
                  <p class="text-white/80 text-xs font-medium">Campo 2 • Césped Natural</p>
                  
                  <div class="mt-6 flex gap-3">
                      <button class="flex-1 py-3 rounded-xl bg-white text-primary font-black uppercase tracking-widest text-xs shadow-lg hover:bg-white/90 active:scale-95 transition-all">Confirmar</button>
                      <button class="px-4 py-3 rounded-xl bg-white/10 text-white font-black hover:bg-white/20 transition-all">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <!-- Stats Grid -->
      <div class="px-6 space-y-4">
          <h2 class="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Tu Rendimiento</h2>
          <div class="grid grid-cols-2 gap-4">
              <div class="bg-card border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span class="text-3xl font-black text-foreground">92%</span>
                  <span class="text-[10px] text-muted-foreground uppercase font-bold mt-1">Asistencia</span>
              </div>
              <div class="bg-card border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span class="text-3xl font-black text-secondary">8.5</span>
                  <span class="text-[10px] text-muted-foreground uppercase font-bold mt-1">Valoración Media</span>
              </div>
          </div>
      </div>

      <!-- Bottom Nav -->
      <nav class="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-white/5 pb-safe pt-2 px-6 flex justify-between items-center z-50">
          <button class="flex flex-col items-center gap-1 p-2 text-primary">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span class="text-[9px] font-black uppercase tracking-widest">Home</span>
          </button>
          <button class="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span class="text-[9px] font-black uppercase tracking-widest">Stats</span>
          </button>
           <button class="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span class="text-[9px] font-black uppercase tracking-widest">Perfil</span>
          </button>
      </nav>

    </div>
  `
})
export class PlayerPortalComponent {}
