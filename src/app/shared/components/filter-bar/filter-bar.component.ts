import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-filter-bar',
    standalone: true,
    templateUrl: './filter-bar.component.html',
})
export class FilterBarComponent {
    @Input() isLoading = false;
    @Input() cols = 4;
    @Input() hasActions = false;
    @Input() hasExtras = false;
    @Output() search = new EventEmitter<void>();
    @Output() clear = new EventEmitter<void>();

    get gridClass(): string {
        const map: Record<number, string> = {
            4: 'grid grid-cols-2 md:grid-cols-4 gap-3 items-end',
            5: 'grid grid-cols-2 md:grid-cols-5 gap-3 items-end',
            6: 'grid grid-cols-2 md:grid-cols-6 gap-3 items-end',
            7: 'grid grid-cols-2 md:grid-cols-7 gap-3 items-end',
            8: 'grid grid-cols-2 md:grid-cols-8 gap-3 items-end',
        };
        return map[this.cols] ?? map[4];
    }
}
