import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class MapsLoaderService {
  private readonly apiLoaded = (window as any).mapInitPromise;

  async load(): Promise<void> {
    return this.apiLoaded;
  }
}
