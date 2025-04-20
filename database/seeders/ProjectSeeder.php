<?php

namespace Database\Seeders;

use App\Enums\Sales\ProjectStatus;
use App\Models\Sales\Project;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Objects\LineString;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Enums\Srid;
class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
            // Base coordinates
            $baseLng = 46.32918028445792;
            $baseLat = 25.23909486132066;

            // Project 1 - North of base point
            Project::create([
                'name' => 'Project 1',
                'description' => 'Description 1',
                'city' => 'Riyadh',
                'location' => 'Al-Khaznah',
                'status' => ProjectStatus::Available,
                // 'shape' => "POLYGON(({$baseLng} {$baseLat}, " .
                //           ($baseLng + 0.01) . " {$baseLat}, " .
                //           ($baseLng + 0.01) . " " . ($baseLat + 0.01) . ", " .
                //           "{$baseLng} " . ($baseLat + 0.01) . ", " .
                //           "{$baseLng} {$baseLat}))",
                'shape' => new Polygon([
                    new LineString([
                        new Point($baseLng, $baseLat),
                        new Point($baseLng + 0.01, $baseLat),
                        new Point($baseLng + 0.01, $baseLat + 0.01),
                        new Point($baseLng, $baseLat + 0.01),
                        new Point($baseLng, $baseLat),
                    ]),
                ]),
            ]);

            // Project 2 - East of base point
            Project::create([
                'name' => 'Project 2',
                'description' => 'Description 2',
                'city' => 'Riyadh',
                'location' => 'Al-Khaznah',
                'status' => ProjectStatus::Available,
                // 'shape' => "POLYGON((" . ($baseLng + 0.015) . " {$baseLat}, " .
                //           ($baseLng + 0.025) . " {$baseLat}, " .
                //           ($baseLng + 0.025) . " " . ($baseLat + 0.01) . ", " .
                //           ($baseLng + 0.015) . " " . ($baseLat + 0.01) . ", " .
                //           ($baseLng + 0.015) . " {$baseLat}))",
                'shape' => new Polygon([
                    new LineString([
                        new Point($baseLng + 0.015, $baseLat),
                        new Point($baseLng + 0.025, $baseLat),
                        new Point($baseLng + 0.025, $baseLat + 0.01),
                        new Point($baseLng + 0.015, $baseLat + 0.01),
                        new Point($baseLng + 0.015, $baseLat),
                    ]),
                ]),
            ]);

            // Project 3 - South of base point
            Project::create([
                'name' => 'Project 3',
                'description' => 'Description 3',
                'city' => 'Riyadh',
                'location' => 'Al-Khaznah',
                'status' => ProjectStatus::Available,
                // 'shape' => "POLYGON(({$baseLng} " . ($baseLat - 0.015) . ", " .
                //           ($baseLng + 0.01) . " " . ($baseLat - 0.015) . ", " .
                //           ($baseLng + 0.01) . " " . ($baseLat - 0.005) . ", " .
                //           "{$baseLng} " . ($baseLat - 0.005) . ", " .
                //           "{$baseLng} " . ($baseLat - 0.015) . "))",
                'shape' => new Polygon([
                    new LineString([
                          new Point(12.455363273620605, 41.90746728266806),
                          new Point(12.450309991836548, 41.906636872349075),
                          new Point(12.445632219314575, 41.90197359839437),
                          new Point(12.447413206100464, 41.90027269624499),
                          new Point(12.457906007766724, 41.90000118654431),
                          new Point(12.458517551422117, 41.90281205461268),
                          new Point(12.457584142684937, 41.903107507989986),
                          new Point(12.457734346389769, 41.905918239316286),
                          new Point(12.45572805404663, 41.90637337450963),
                          new Point(12.455363273620605, 41.90746728266806),
                    ]),
                ]),
            ]);
    }
}
