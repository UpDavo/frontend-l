import { Component, OnInit, inject, input, output, ViewChild, signal, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
// import { NotificationService } from '../../services/notifications/notification.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarModule, ButtonModule, BadgeModule, MenuModule],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent implements OnInit {
  private readonly router = inject(Router);
  // readonly notificationService = inject(NotificationService);

  fullName = input.required<string | null>();
  initials = input.required<string | null>();
  roleName = input<string | null>(null);
  brandName = input<string | null>(null);

  toggleSidebar = output<void>();
  logoutClick = output<void>();

  @ViewChild('userMenu') userMenu!: Menu;

  readonly showNotifications = signal(false);

  ngOnInit(): void {
    // this.notificationService.load();
  }

  userMenuItems = computed<MenuItem[]>(() => {
    const isBrandUser = this.roleName() === 'BrandUser';
    const items: MenuItem[] = [];

    if (!isBrandUser) {
      items.push(
        { separator: true },
      );
    }

    items.push({
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      styleClass: 'text-red-500',
      command: () => {
        this.userMenu.hide();
        setTimeout(() => this.logoutClick.emit(), 200);
      },
    });

    return items;
  });

  toggleUserMenu(event: Event): void {
    this.userMenu.toggle(event);
  }

  // toggleNotifications(): void {
  //   const opening = !this.showNotifications();
  //   this.showNotifications.set(opening);
  //   if (opening) { this.notificationService.load(); }
  // }

  // closeNotifications(): void { this.showNotifications.set(false); }

  // onNotificationClick(id: number): void {
  //   this.notificationService.markRead(id);
  //   this.showNotifications.set(false);
  // }

  // markAllRead(): void { this.notificationService.markAllRead(); }

  /** Cierra el panel al hacer clic fuera de él */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.showNotifications.set(false);
  }

  /** Icono y colores por tipo de notificación */
  notifMeta(type: string): { icon: string; colors: string } {
    const map: Record<string, { icon: string; colors: string }> = {
      info: { icon: 'pi-info-circle', colors: 'text-blue-600 bg-blue-100' },
      success: { icon: 'pi-check-circle', colors: 'text-green-600 bg-green-100' },
      warning: { icon: 'pi-exclamation-triangle', colors: 'text-amber-600 bg-amber-100' },
      error: { icon: 'pi-times-circle', colors: 'text-red-600 bg-red-100' },
      invoice: { icon: 'pi-file-edit', colors: 'text-violet-600 bg-violet-100' },
    };
    return map[type] ?? { icon: 'pi-bell', colors: 'text-gray-500 bg-gray-100' };
  }
}

