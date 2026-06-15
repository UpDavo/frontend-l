import {
    Component, ElementRef, HostListener,
    input, model, computed, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-multi-select',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './multi-select.component.html',
})
export class MultiSelectComponent {
    readonly options     = input<string[]>([]);
    readonly placeholder = input('Seleccionar...');
    readonly value       = model<string[]>([]);

    readonly searchQuery = signal('');
    readonly isOpen      = signal(false);

    readonly filtered = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        return q ? this.options().filter(o => o.toLowerCase().includes(q)) : this.options();
    });

    constructor(private elRef: ElementRef) {}

    @HostListener('document:click', ['$event'])
    onDocumentClick(e: MouseEvent): void {
        if (!this.elRef.nativeElement.contains(e.target as Node)) {
            this.close();
        }
    }

    toggleOpen(): void {
        this.isOpen() ? this.close() : this.isOpen.set(true);
    }

    private close(): void {
        this.isOpen.set(false);
        this.searchQuery.set('');
    }

    toggle(opt: string): void {
        const cur = this.value();
        this.value.set(cur.includes(opt) ? cur.filter(v => v !== opt) : [...cur, opt]);
    }

    remove(opt: string, e: MouseEvent): void {
        e.stopPropagation();
        this.value.set(this.value().filter(v => v !== opt));
    }

    clearAll(e: MouseEvent): void {
        e.stopPropagation();
        this.value.set([]);
    }

    isSelected(opt: string): boolean {
        return this.value().includes(opt);
    }
}
