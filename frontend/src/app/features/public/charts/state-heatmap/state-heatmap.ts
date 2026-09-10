import { Component, Input, OnChanges, OnInit, SimpleChanges, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { geoMercator, geoPath, GeoGeometryObjects } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { DatasetPayload } from '../../../../core/models/dataset.model';
import { asNumber, findColumn } from '../../../../core/utils/columns';

interface StateFeature {
  type: 'Feature';
  properties: { ST_NM: string };
  geometry: GeoGeometryObjects;
}

interface StateFeatureCollection {
  type: 'FeatureCollection';
  features: StateFeature[];
}

const WIDTH = 600;
const HEIGHT = 520;
const EMPTY_COLOR = '#e4e9e1';
const COLOR_RANGE: [string, string] = ['#d6e6da', '#17452b'];

const STATE_ABBREVIATIONS: Record<string, string> = {
  'Andaman and Nicobar Islands': 'AN',
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  Assam: 'AS',
  Bihar: 'BR',
  Chandigarh: 'CH',
  Chhattisgarh: 'CG',
  'Dadra and Nagar Haveli': 'DN',
  'Daman and Diu': 'DD',
  Delhi: 'DL',
  Goa: 'GA',
  Gujarat: 'GJ',
  Haryana: 'HR',
  'Himachal Pradesh': 'HP',
  'Jammu and Kashmir': 'JK',
  Jharkhand: 'JH',
  Karnataka: 'KA',
  Kerala: 'KL',
  Ladakh: 'LA',
  Lakshadweep: 'LD',
  'Madhya Pradesh': 'MP',
  Maharashtra: 'MH',
  Manipur: 'MN',
  Meghalaya: 'ML',
  Mizoram: 'MZ',
  Nagaland: 'NL',
  Odisha: 'OD',
  Puducherry: 'PY',
  Punjab: 'PB',
  Rajasthan: 'RJ',
  Sikkim: 'SK',
  'Tamil Nadu': 'TN',
  Telangana: 'TG',
  Tripura: 'TR',
  'Uttar Pradesh': 'UP',
  Uttarakhand: 'UK',
  'West Bengal': 'WB',
};

function isRing(ring: unknown): ring is number[][] {
  return Array.isArray(ring) && ring.length >= 4 && ring.every((pt) => Array.isArray(pt) && pt.length >= 2);
}

/** Rejects malformed Polygon/MultiPolygon geometry (e.g. a ring that isn't a proper
 *  list of [lng, lat] points) so one bad feature can't break d3-geo's projection.fitSize
 *  for the whole collection. The supplied india.geojson.json has one such feature. */
function hasValidRingGeometry(geometry: GeoGeometryObjects): boolean {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.length > 0 && geometry.coordinates.every(isRing);
  }
  if (geometry.type === 'MultiPolygon') {
    return (
      geometry.coordinates.length > 0 &&
      geometry.coordinates.every((polygon) => polygon.length > 0 && polygon.every(isRing))
    );
  }
  return false;
}

@Component({
  selector: 'app-state-heatmap',
  standalone: true,
  template: `
    <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="heatmap">
      @for (path of paths(); track path.name) {
        <path [attr.d]="path.d" [attr.fill]="path.color" stroke="#ffffff" stroke-width="0.5">
          <title>{{ path.name }}{{ path.value !== null ? ': ' + path.value : ' (no data)' }}</title>
        </path>
      }
      @for (path of paths(); track path.name) {
        <text [attr.x]="path.labelX" [attr.y]="path.labelY" class="state-label">{{ path.abbreviation }}</text>
      }
    </svg>
  `,
  styleUrl: './state-heatmap.css',
})
export class StateHeatmap implements OnInit, OnChanges {
  @Input({ required: true }) payload!: DatasetPayload;

  protected readonly width = WIDTH;
  protected readonly height = HEIGHT;
  protected readonly paths = signal<
    {
      name: string;
      d: string;
      color: string;
      value: number | null;
      abbreviation: string;
      labelX: number;
      labelY: number;
    }[]
  >([]);

  private geoData: StateFeatureCollection | null = null;

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<StateFeatureCollection>('/india-states.geojson.json').subscribe((data) => {
      this.geoData = { ...data, features: data.features.filter((f) => hasValidRingGeometry(f.geometry)) };
      this.render();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['payload'] && this.geoData) {
      this.render();
    }
  }

  private render(): void {
    if (!this.geoData || !this.payload) {
      return;
    }

    const stateCol = findColumn(this.payload, 'state');
    const valueCol = findColumn(this.payload, 'value');
    const valuesByState = new Map<string, number>();
    if (stateCol && valueCol) {
      for (const row of this.payload.rows) {
        const name = String(row[stateCol] ?? '').trim().toLowerCase();
        const value = asNumber(row[valueCol]);
        if (name && value !== null) {
          valuesByState.set(name, value);
        }
      }
    }

    const [min, max] = extent(Array.from(valuesByState.values())) as [number | undefined, number | undefined];
    const colorScale = scaleLinear<string>()
      .domain([min ?? 0, max ?? 1])
      .range(COLOR_RANGE);

    const projection = geoMercator().fitSize([WIDTH, HEIGHT], this.geoData);
    const pathGenerator = geoPath(projection);

    const computed = this.geoData.features.map((feature) => {
      const name = feature.properties.ST_NM;
      const value = valuesByState.get(name.toLowerCase()) ?? null;
      const [labelX, labelY] = pathGenerator.centroid(feature.geometry);
      return {
        name,
        d: pathGenerator(feature.geometry) ?? '',
        color: value === null ? EMPTY_COLOR : colorScale(value),
        value,
        abbreviation: STATE_ABBREVIATIONS[name] ?? '',
        labelX,
        labelY,
      };
    });
    this.paths.set(computed);
  }
}
