- controllers and services
    1- App\Http\Controllers\Studio\VirtualTourController.php
    this will be for creating tours from start , will upload images , set node links and marker postions in panorama
    * will work with App\Services\VirtualTour\CreateTourService.php
    2- App\Http\Controllers\Studio\TourDrawController.php
    this will load existing tour with it's nodes ,and will allow to draw polygons and texts over it 
    * will work with App\Services\VirtualTour\TourDrawService.php
- views , all blade files
    - studio folder 
     - index, shows all the virtual tours , exist code , keep it as it is 
     - show , will show a specific tour by id , will load it's nodes,markers and links , and drawings
     - create_tour, will create new tour , link nodes together , nothing more 
     - draw_tour , will load existing tour and draw over it , polygons and texts
     - public_view, will be a shown to customers in exhibits or any events