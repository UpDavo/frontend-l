import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
    private readonly appName = 'Hint';

    constructor(private readonly title: Title) {
        super();
    }

    override updateTitle(snapshot: RouterStateSnapshot): void {
        const routeTitle = this.buildTitle(snapshot);
        this.title.setTitle(
            routeTitle ? `${routeTitle} | ${this.appName}` : this.appName
        );
    }
}
