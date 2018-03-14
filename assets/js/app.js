var map, featureList, ReservationNoSearch = [], ModificationNoSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(boroughs.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 19);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through ReservationNo layer and add only features which are in the map bounds */
  ReservationNo.eachLayer(function (layer) {
    if (map.hasLayer(ReservationNoLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/r_dg.png"></td><td class="feature-name">' + layer.feature.properties.ResvNo + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Loop through ModificationNo layer and add only features which are in the map bounds */
  ModificationNo.eachLayer(function (layer) {
    if (map.hasLayer(ModificationNoLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/m_blue.png"></td><td class="feature-name">' + layer.feature.properties.ModiNo + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	maxzoom: 22,
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 22,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});


var BaseMap = new L.tileLayer('data/mbtiles.php?db=ALANDI.mbtiles&z={z}&x={x}&y={y}', {
		maxZoom: 22,			
		tms: true,
		    attribution: 'Tiles Courtesy of <a href="MaRsha Infosoft" target="_blank">MaRshaInfosoft.com</a>',
		  
		});
/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#8B0000",
  fillOpacity: 0.7,
  radius: 12
};

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 20
});

/* Empty layer placeholder to add to layer control for listening when to add/remove ReservationNo to markerClusters layer */
var ReservationNoLayer = L.geoJson(null);
var ReservationNo = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/r_dg.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>ReservationNumber</th><td>" + feature.properties.ResvNo + "</td></tr>" + 
																					"<tr><th>TypeOfReservation</th><td>" + feature.properties.TypeOfRev + "</td></tr>" + 
																					/*"<tr><th>Site Number</th><td>" + feature.properties.SITE_NO + "</td></tr>" +
																					"<tr><th>Purpose</th><td>" + feature.properties.PURPOSE + "</td></tr>" + 
																					"<tr><th>Survey Number</th><td>" + feature.properties.S_NO_C + "</td></tr>" +
																					"<tr><th>Village Name</th><td>" + feature.properties.VILLAGE + "</td></tr>" +
																					"<tr><th>Area Hecter</th><td>" + feature.properties.AREA_HEC + "</td></tr>" +
																					"<tr><th>Area</th><td>" + feature.properties.AREA + "</td></tr>" +
																					"<tr><th>SubOwner</th><td>" + feature.properties.SUB_OWNER + "</td></tr>" +
																					"<tr><th>BuildingName</th><td>" + feature.properties.BULD_NAME + "</td></tr>" +
																					"<tr><th>SocietyName</th><td>" + feature.properties.SOCI_NAME + "</td></tr>" +
																					"<tr><th>Address</th><td>" + feature.properties.HOUSE_ADD + "</td></tr>" +
																					"<tr><th>RoofType</th><td>" + feature.properties.ROOF_TYPE + "</td></tr>" +
																					"<tr><th>WaterMeterNo</th><td>" + feature.properties.WM_NO+ "</td></tr>" +
																					"<tr><th>PropertyType</th><td>" + feature.properties.PROP_CIDCO + "</td></tr>" +
																					//"<tr><th>RoofType</th><td>" + feature.properties.ROOF_TYPE + "</td></tr>" +
																					//"<tr><th>RainWatHarvesting</th><td>" + feature.properties.RWH + "</td></tr>" +
																					//"<tr><th>Septictank</th><td>" + feature.properties.SEP_TANK + "</td></tr>" +
																					//"<tr><th>HealthNOC</th><td>" + feature.properties.H_NOC + "</td></tr>" +
																					//"<tr><th>FlatArea</th><td>" + feature.properties.FLAT_AREA + "</td></tr>" +
																					//"<tr><th>ShopType</th><td>" + feature.properties.SHOP_TYPE + "</td></tr>" +
																					//"<tr><th>ShopLicNumber</th><td>" + feature.properties.LIC_NO + "</td></tr>" +
																					//"<tr><th>LBTNumber</th><td>" + feature.properties.LBT_NO + "</td></tr>" +
																					//"<tr><th>ChangeOfProperty</th><td>" + feature.properties.CS_PORP + "</td></tr>" +
																					//"<tr><th>ElectionWardNumber</th><td>" + feature.properties.EW_NO + "</td></tr>" +
																					//"<tr><th>AdminWard</th><td>" + feature.properties.AW_NO + "</td></tr>" +
																					//"<tr><th>MainPhoto</th><td><a class='url-break' href ='./samel/" + feature.properties.MAIN_PHOTO + "' target='_blank'>" + feature.properties.MAIN_PHOTO + "</a></td></tr>" + */
																					"<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/r_dg.png"></td><td class="feature-name">' + layer.feature.properties.ResvNo + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      ReservationNoSearch.push({
        name: layer.feature.properties.ResvNo,
        /* Type: layer.feature.properties.Type, */
        source: "ReservationNo",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/ReservationNo.geojson", function (data) {
  ReservationNo.addData(data);
  map.addLayer(ReservationNoLayer);
});

var ModificationNoLayer = L.geoJson(null);
var ModificationNo = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/m_blue.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Modification Number</th><td>" + feature.properties.ModiNo + "</td></tr>" + 
																					"<tr><th>Reasons</th><td>" + feature.properties.Reasons + "</td></tr>" + 
																					/*"<tr><th>Site Number</th><td>" + feature.properties.SITE_NO + "</td></tr>" +
																					"<tr><th>Purpose</th><td>" + feature.properties.PURPOSE + "</td></tr>" + 
																					"<tr><th>Survey Number</th><td>" + feature.properties.S_NO_C + "</td></tr>" +
																					"<tr><th>Village Name</th><td>" + feature.properties.VILLAGE + "</td></tr>" +
																					"<tr><th>Area Hecter</th><td>" + feature.properties.AREA_HEC + "</td></tr>" +
																					"<tr><th>Area</th><td>" + feature.properties.AREA + "</td></tr>" +
																					"<tr><th>SubOwner</th><td>" + feature.properties.SUB_OWNER + "</td></tr>" +
																					"<tr><th>BuildingName</th><td>" + feature.properties.BULD_NAME + "</td></tr>" +
																					"<tr><th>SocietyName</th><td>" + feature.properties.SOCI_NAME + "</td></tr>" +
																					"<tr><th>Address</th><td>" + feature.properties.HOUSE_ADD + "</td></tr>" +
																					"<tr><th>RoofType</th><td>" + feature.properties.ROOF_TYPE + "</td></tr>" +
																					"<tr><th>WaterMeterNo</th><td>" + feature.properties.WM_NO+ "</td></tr>" +
																					"<tr><th>PropertyType</th><td>" + feature.properties.PROP_CIDCO + "</td></tr>" +
																					//"<tr><th>RoofType</th><td>" + feature.properties.ROOF_TYPE + "</td></tr>" +
																					//"<tr><th>RainWatHarvesting</th><td>" + feature.properties.RWH + "</td></tr>" +
																					//"<tr><th>Septictank</th><td>" + feature.properties.SEP_TANK + "</td></tr>" +
																					//"<tr><th>HealthNOC</th><td>" + feature.properties.H_NOC + "</td></tr>" +
																					//"<tr><th>FlatArea</th><td>" + feature.properties.FLAT_AREA + "</td></tr>" +
																					//"<tr><th>ShopType</th><td>" + feature.properties.SHOP_TYPE + "</td></tr>" +
																					//"<tr><th>ShopLicNumber</th><td>" + feature.properties.LIC_NO + "</td></tr>" +
																					//"<tr><th>LBTNumber</th><td>" + feature.properties.LBT_NO + "</td></tr>" +
																					//"<tr><th>ChangeOfProperty</th><td>" + feature.properties.CS_PORP + "</td></tr>" +
																					//"<tr><th>ElectionWardNumber</th><td>" + feature.properties.EW_NO + "</td></tr>" +
																					//"<tr><th>AdminWard</th><td>" + feature.properties.AW_NO + "</td></tr>" +
																					//"<tr><th>MainPhoto</th><td><a class='url-break' href ='./samel/" + feature.properties.MAIN_PHOTO + "' target='_blank'>" + feature.properties.MAIN_PHOTO + "</a></td></tr>" + */
																					"<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/r_dg.png"></td><td class="feature-name">' + layer.feature.properties.ModiNo + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      ReservationNoSearch.push({
        name: layer.feature.properties.ModiNo,
        /* address: layer.feature.properties.PURPOSE, */
        source: "ModificationNo",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/ModificationNo.geojson", function (data) {
  ModificationNo.addData(data);
  map.addLayer(ModificationNoLayer);
});
map = L.map("map", {
  zoom: 18,
  center: [18.67, 73.89],
  layers: [BaseMap, cartoLight, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === ReservationNoLayer) {
    markerClusters.addLayer(ReservationNo);
    syncSidebar();
  }
  if (e.layer === ModificationNoLayer) {
    markerClusters.addLayer(ModificationNo);
    syncSidebar();
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === ReservationNoLayer) {
    markerClusters.removeLayer(ReservationNo);
    syncSidebar();
  }
  if (e.layer === ModificationNoLayer) {
    markerClusters.removeLayer(ModificationNo);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='MaRshaInfosoft@gmail.com'>MaRshaInfosoft.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
    "Alandi":BaseMap,
	"OSM Map":cartoLight,
	"Esri Imegery":Esri_WorldImagery,
};

var groupedOverlays = {
  "Points of Interest": {
    "<img src='assets/img/r_dg.png' width='24' height='28'>&nbsp;ReservationNo": ReservationNoLayer,
	"<img src='assets/img/m_blue.png' width='24' height='28'>&nbsp;ModificationNo": ModificationNoLayer,
    },
 };

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  sizeLayerControl();
  /* Fit map to ReservationNo bounds */
  map.fitBounds(ReservationNo.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var ReservationNoBH = new Bloodhound({
    name: "ReservationNo",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: ReservationNoSearch,
    limit: 10
  });
var ModificationNoBH = new Bloodhound({
    name: "ModificationNo",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: ModificationNoSearch,
    limit: 10
  });
  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  
  ReservationNoBH.initialize();
  ModificationNoBH.initialize();
  
  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 2,
    highlight: true,
    hint: false
  },  {
    name: "ReservationNo",
    displayKey: "name",
    source: ReservationNoBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/r_dg.png' width='24' height='28'>&nbsp;ReservationNo</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "ModificationNo",
    displayKey: "name",
    source: ModificationNoBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/m_blue.png' width='24' height='28'>&nbsp;ModificationNo</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
    }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "boroughs") {
      map.fitBounds(datum.bounds);
    }
    if (datum.source === "ReservationNo") {
      if (!map.hasLayer(ReservationNoLayer)) {
        map.addLayer(ReservationNoLayer);
      }
      map.setView([datum.lat, datum.lng], 20);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "ModificationNo") {
      if (!map.hasLayer(ModificationNoLayer)) {
        map.addLayer(ModificationNoLayer);
      }
      map.setView([datum.lat, datum.lng], 20);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
