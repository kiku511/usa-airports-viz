// 1. Create a map object.
var mymap = L.map('map', {
  center: [48.13, -99.93],
  zoom: 4,
  maxZoom: 10,
  minZoom: 3,
  detectRetina: true,
  // add fullscreen plugin
  fullscreenControl: true,
});

var baseMap = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

// 2. Add a base map.
L.tileLayer(baseMap).addTo(mymap);

// 3. Add airports GeoJSON Data
// Null variable that will hold airport data
var airports = null;

// 4. build up a set of colors from colorbrewer's dark2 category
var colors = chroma.scale('RdYlGn').mode('lch').colors(2);

// 5. dynamically append style classes to this page. This style classes will be used for colorize the markers.
for (i = 0; i < 2; i++) {
  $('head').append(
    $(
      '<style> .marker-color-' +
        (i + 1).toString() +
        ' { color: ' +
        colors[i] +
        '; font-size: 14px; text-shadow: 0 0 3px #ffffff;} </style>'
    )
  );
}

// Construct data for the popup for each airport
function getPopupData(airport) {
  return `<div> Airport: ${airport.properties.AIRPT_NAME} </div> 
          <div> Location: ${airport.properties.CITY}, ${
    airport.properties.STATE
  }</div
    <div> Control Tower: ${
      airport.properties.CNTL_TWR == 'Y' ? 'Yes' : 'No'
    } </div>`;
}

// Get GeoJSON and put on it on the map when it loads
airports = L.geoJson
  .ajax('assets/airports.geojson', {
    // assign a function to the onEachFeature parameter of the airports object.
    // Then each (point) feature will bind a popup window.
    // The content of the popup window is the value of `feature.properties.company`
    onEachFeature: function (feature, layer) {
      layer.bindPopup(getPopupData(feature));
    },
    pointToLayer: function (feature, latlng) {
      var id = 0;
      if (feature.properties.CNTL_TWR == 'N') {
        id = 0;
      } else {
        id = 1;
      }
      return L.marker(latlng, {
        icon: L.divIcon({
          className:
            'fa fa-plane marker-color-' + (id + 1).toString() + ' rotate-45',
        }),
        rotationAngle: 45,
      });
    },
    attribution:
      'US Airports &copy; catalog.data.gov | US States &copy; Mike Bostock, D3 | Base Map &copy; CartoDB | Made By Vansh Gambhir',
  })
  .addTo(mymap);

// 6. Set function for color ramp
colors = chroma.scale('Blues').colors(5); //colors = chroma.scale('RdPu').colors(5);

function setColor(count) {
  var id = 0;
  if (count > 20) {
    id = 4;
  } else if (count > 15 && count <= 20) {
    id = 3;
  } else if (count > 10 && count <= 15) {
    id = 2;
  } else if (count > 5 && count <= 10) {
    id = 1;
  } else {
    id = 0;
  }
  return colors[id];
}

// 7. Set style function that sets fill color.md property equal to airport count
function style(feature) {
  return {
    fillColor: setColor(feature.properties.count),
    fillOpacity: 0.5,
    weight: 1,
    opacity: 1,
    color: 'gray',
    dashArray: '3',
  };
}

// 8. Add state polygons
// create states variable, and assign null to it.
var states = null;
states = L.geoJson
  .ajax('assets/us-states.geojson', {
    style: style,
  })
  .addTo(mymap);

// 9. Create Leaflet Control Object for Legend
var legend = L.control({ position: 'topright' });

// 10. Function that runs when legend is added to map
legend.onAdd = function () {
  // Create Div Element and Populate it with HTML
  var div = L.DomUtil.create('div', 'legend');
  div.innerHTML += '<b># Airports </b><br />';
  // div.innerHTML += '<table>';
  div.innerHTML +=
    '<div  class="box" style="background: ' + colors[4] + ';"></div><p>20+</p>';
  div.innerHTML +=
    '<div class="box" style="background: ' +
    colors[3] +
    ';"></div><p>16-20</p>';
  div.innerHTML +=
    '<div class="box" style="background: ' +
    colors[2] +
    ';"></div><p>11-15</p>';
  div.innerHTML +=
    '<div class="box" style="background: ' +
    colors[1] +
    ';"></div><p> 6-10</p>';
  div.innerHTML +=
    '<div class="box" style="background: ' + colors[0] + ';"></div><p> 0-5</p>';
  div.innerHTML += '<hr><b>With Control Tower</b><br />';
  div.innerHTML += '<i class="fa fa-plane marker-color-2"></i><p> Yes</p>';
  div.innerHTML += '<i class="fa fa-plane marker-color-1"></i><p> No</p>';

  // Return the Legend div containing the HTML content
  return div;
};

// 11. Add a legend to map
legend.addTo(mymap);

// 12. Add a scale bar to map
L.control.scale({ position: 'bottomleft' }).addTo(mymap);

// Add a mini map
var mini = new L.TileLayer(baseMap, {
  minZoom: 5,
  maxZoom: 18,
});

mymap.addLayer(mini);
mymap.setView(new L.LatLng(48.13, -99.93), 4);

var mini = new L.TileLayer(baseMap, {
  minZoom: 0,
  maxZoom: 13,
});
var miniMap = new L.Control.MiniMap(mini, { toggleDisplay: true }).addTo(mymap);
