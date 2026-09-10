import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { DatasetPayload } from '../../../../core/models/dataset.model';
import { asNumber, findColumn } from '../../../../core/utils/columns';

const INDIA_CENTER: L.LatLngExpression = [22.5, 79.0];

@Component({
  selector: 'app-latlong-map',
  standalone: true,
  template: '<div class="map" #mapHost></div>',
  styleUrl: './latlong-map.css',
})
export class LatLongMap implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) payload!: DatasetPayload;
  @ViewChild('mapHost', { static: true }) private readonly mapHost!: ElementRef<HTMLDivElement>;

  private map: L.Map | null = null;
  private markers: L.LayerGroup = L.layerGroup();

  ngAfterViewInit(): void {
    this.map = L.map(this.mapHost.nativeElement).setView(INDIA_CENTER, 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(this.map);
    this.markers.addTo(this.map);
    this.renderMarkers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['payload'] && this.map) {
      this.renderMarkers();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private renderMarkers(): void {
    this.markers.clearLayers();
    if (!this.payload) {
      return;
    }

    const latCol = findColumn(this.payload, 'latitude');
    const lonCol = findColumn(this.payload, 'longitude');
    const valueCol = findColumn(this.payload, 'value');
    if (!latCol || !lonCol) {
      return;
    }

    for (const row of this.payload.rows) {
      const lat = asNumber(row[latCol]);
      const lon = asNumber(row[lonCol]);
      if (lat === null || lon === null) {
        continue;
      }
      const value = valueCol ? row[valueCol] : null;
      const popupLines = this.payload.columns.map((col) => `<strong>${col}:</strong> ${row[col] ?? '-'}`).join('<br>');
      L.circleMarker([lat, lon], {
        radius: 7,
        color: '#5c2f7a',
        fillColor: '#7f45a8',
        fillOpacity: 0.75,
        weight: 1,
      })
        .bindPopup(popupLines || String(value ?? ''))
        .addTo(this.markers);
    }
  }
}
