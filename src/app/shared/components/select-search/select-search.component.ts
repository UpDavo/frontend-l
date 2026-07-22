import {
    Component, ElementRef, HostListener,
    input, model, computed, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
    id: number;
    label: string;
}

@Component({
    selector: 'app-select-search',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './select-search.component.html',
})
export class SelectSearchComponent {
    readonly options     = input<SelectOption[]>([]);
    readonly placeholder = input('Seleccionar...');
    readonly disabled    = input(false);
    readonly loading     = input(false);
    readonly value       = model<number | null>(null);

    readonly searchQuery = signal('');
    readonly isOpen      = signal(false);

    readonly filtered = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        return q ? this.options().filter(o => o.label.toLowerCase().includes(q)) : this.options();
    });

    readonly selectedLabel = computed(
        () => this.options().find(o => o.id === this.value())?.label ?? null,
    );

    constructor(private elRef: ElementRef) {}

    @HostListener('document:click', ['$event'])
    onDocumentClick(e: MouseEvent): void {
        if (!this.elRef.nativeElement.contains(e.target as Node)) {
            this.close();
        }
    }

    toggleOpen(): void {
        if (this.disabled()) return;
        this.isOpen() ? this.close() : this.isOpen.set(true);
    }

    private close(): void {
        this.isOpen.set(false);
        this.searchQuery.set('');
    }

    select(opt: SelectOption): void {
        this.value.set(opt.id);
        this.close();
    }

    clear(e: MouseEvent): void {
        e.stopPropagation();
        this.value.set(null);
    }

    isSelected(opt: SelectOption): boolean {
        return this.value() === opt.id;
    }
}
