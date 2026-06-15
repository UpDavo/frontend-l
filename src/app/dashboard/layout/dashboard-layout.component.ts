import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth/auth.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { FooterComponent } from './footer/footer.component';

@Component({
    selector: 'app-dashboard-layout',
    standalone: true,
    imports: [RouterOutlet, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly activatedRoute = inject(ActivatedRoute);

    private readonly routeData = toSignal(
        this.router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            map(() => {
                let route = this.activatedRoute;
                while (route.firstChild) route = route.firstChild;
                return route.snapshot.data as { title?: string; icon?: string };
            })
        ),
        { initialValue: {} as { title?: string; icon?: string } }
    );

    pageTitle = computed(() => this.routeData()?.['title'] ?? null);
    pageIcon = computed(() => this.routeData()?.['icon'] ?? null);

    user = this.authService.user;
    fullName = this.authService.fullName;
    initials = this.authService.initials;
    role = this.authService.role;
    isAdmin = this.authService.isAdmin;
    permissions = this.authService.permissions;

    readonly brandName = signal<string | null>(null);

    ngOnInit(): void {}

    private static readonly SIDEBAR_KEY = 'sidebar_collapsed';

    sidebarCollapsed = signal(
        localStorage.getItem(DashboardLayoutComponent.SIDEBAR_KEY) !== 'false'
    );

    mobileDrawerOpen = signal(false);

    toggleSidebar(): void {
        if (window.matchMedia('(min-width: 1024px)').matches) {
            this.sidebarCollapsed.update((v) => {
                const next = !v;
                localStorage.setItem(DashboardLayoutComponent.SIDEBAR_KEY, String(next));
                return next;
            });
        } else {
            this.mobileDrawerOpen.set(true);
        }
    }

    closeMobileDrawer(): void {
        this.mobileDrawerOpen.set(false);
    }

    logout(): void {
        this.authService.logout().subscribe();
    }
}
