<!DOCTYPE html>
<html>
  <head>
    <title>Leaflet.timeline</title>
    <script src="leaflet-src.js"></script>
    <script src="leaflet.timeline.js"></script>

    <link href="leaflet.css" rel="stylesheet">
    
    <style>
    
      @import url(http://fonts.googleapis.com/css?family=Open+Sans); 
      html, body{
        margin: 0;
        padding: 0;
        font-family: "Open Sans", sans-serif;
      }
      #info{
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 20vw;
        padding: 1em;
      }
      #map{
        position: fixed;
        top: 0;
        left: 20vw;
        bottom: 0;
        right: 0;
      }
      .leaflet-bottom.leaflet-left{
        width: 100%;
      }
      .leaflet-control-container .leaflet-timeline-controls{
        box-sizing: border-box;
        width: 100%;
        margin: 0;
        margin-bottom: 15px;
      }
    </style>
  </head>
  <body>
    <div id="info">
      <h1>Earthforests</h1>
      <h2>Over the Last 24 Hours</h2>
      <h3>Currently displayed:</h3>
      <ul id="displayed-list"></ul>
    </div>
    <div id="map"></div>

    <script>
      var osmUrl = 'https://api.mapbox.com/styles/v1/anenna9817/cjf01362h2u9z2rqpdidur1hr/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5lbm5hOTgxNyIsImEiOiJjamNpNHQzNHMyZjBjMnFuem01dHlpemdzIn0.D7J-gIDElbyHc3sP_WL9PQ';
      var osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">' +
        'OpenStreetMap</a> contributors';
      var osm = L.tileLayer(osmUrl, {
        maxZoom: 18,
        attribution: osmAttrib,
        noWrap: true
      });
      var map = L.map('map', {
        layers: [osm],
        center: new L.LatLng(0,0),
        zoom: 3,
        maxBounds: [[90,-180], [-90, 180]]
      });
      // this is just used to show the currently-displayed earthforests
      // in the little sidebar. meant as an example of a use for the 'change'
      // event
      function updateList(timeline){
        var displayed = timeline.getLayers();
        var list = document.getElementById('displayed-list');
        list.innerHTML = "";
        displayed.forEach(function(forest){
          var li = document.createElement('li');
          li.innerHTML = forest.feature.properties.title;
          list.appendChild(li);
        });
      }
      // eqfeed_callback is called once the earthforest geojsonp file below loads
      function eqfeed_callback(data){
        var getInterval = function(forest) {
          // earthforest data only has a time, so we'll use that as a "start"
          // and the "end" will be that + some value based on magnitude
          // 18000000 = 30 minutes, so a forest of magnitude 5 would show on the
          // map for 150 minutes or 2.5 hours
          return {
            start : forest.properties.start,
            end : forest.properties.end
            //start = first day of the year. end = last day. mag = % of land covered in forest
            //start: forest.properties.time,
            //end:   forest.properties.time + forest.properties.mag * 1800000
          };
        };
        var timelineControl = L.timelineSliderControl({
          formatOutput: function(date) {
            return new Date(date).toString();
          }
        });
        var timeline = L.timeline(data, {
          getInterval: getInterval,
          // lat long of center of each country
          pointToLayer: function(data, latlng){
            var hue_min = 120;
            var hue_max = 0;
            var hue = data.properties.percent / 10 * (hue_max - hue_min) + hue_min;
            return L.circleMarker(latlng, {
              radius: data.properties.percent * 3,
              color: "hsl("+hue+", 100%, 50%)",
              fillColor: "hsl("+hue+", 100%, 50%)"
            }).bindPopup('<a href="'+data.properties.url+'">click for more info</a>');
          }
        });
        timelineControl.addTo(map);
        timelineControl.addTimelines(timeline);
        timeline.addTo(map);
        timeline.on('change', function(e){
          updateList(e.target);
        });
        updateList(timeline);
      }
    </script>
    <script src="all_day.geojsonp"></script>
  </body>
</html>
