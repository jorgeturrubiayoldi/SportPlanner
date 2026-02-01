import { Component, EventEmitter, inject, Output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService, ActiveSubscription } from '../../../core/services/subscription.service';

type SettingsTab = 'profile' | 'users' | 'invoices';

@Component({
  selector: 'app-user-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-settings-modal.component.html',
  styles: []
})
export class UserSettingsModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  private authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  
  protected user = computed(() => this.authService.currentUser());
  protected activeTab = signal<SettingsTab>('profile');

  // Subscription Data
  protected activeSubscription = signal<ActiveSubscription | null>(null);
  protected invoices = signal<any[]>([]);
  protected members = signal<any[]>([]);
  
  // UI State
  protected loadingData = signal(false);
  protected newMemberId = signal('');
  protected addingMember = signal(false);

  async ngOnInit() {
    const userId = this.user()?.id;
    if (userId) {
      const sub = await this.subscriptionService.getActiveSubscription(userId);
      this.activeSubscription.set(sub);
    }
  }

  async onTabChange(tab: SettingsTab) {
    this.activeTab.set(tab);
    
    const sub = this.activeSubscription();
    if (!sub) return;

    if (tab === 'invoices') {
      await this.loadInvoices(sub.id);
    } else if (tab === 'users') {
      await this.loadMembers(sub.id);
    }
  }

  async loadInvoices(subId: string) {
    this.loadingData.set(true);
    const data = await this.subscriptionService.getInvoices(subId);
    this.invoices.set(data);
    this.loadingData.set(false);
  }

  async loadMembers(subId: string) {
    this.loadingData.set(true);
    const data = await this.subscriptionService.getMembers(subId);
    this.members.set(data);
    this.loadingData.set(false);
  }

  async addMember() {
    if (!this.newMemberId() || !this.activeSubscription()) return;
    
    this.addingMember.set(true);
    const success = await this.subscriptionService.addMember(this.activeSubscription()!.id, this.newMemberId());
    
    if (success) {
      this.newMemberId.set('');
      await this.loadMembers(this.activeSubscription()!.id);
    } else {
      alert('Error al añadir usuario. Verifica el ID.');
    }
    this.addingMember.set(false);
  }

  async removeMember(userId: string) {
    if (!confirm('¿Estás seguro de eliminar a este usuario de la suscripción?') || !this.activeSubscription()) return;

    await this.subscriptionService.removeMember(this.activeSubscription()!.id, userId);
    await this.loadMembers(this.activeSubscription()!.id);
  }
}
