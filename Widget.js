define([
  'dojo/_base/declare', 
  'dijit/_WidgetsInTemplateMixin',
  'jimu/BaseWidget',
  'dojo/_base/lang',
  'dojo/on',
  "esri/layers/GraphicsLayer",
  "esri/symbols/PictureMarkerSymbol",
  "esri/graphic",

  "esri/tasks/FeatureSet",
  "esri/tasks/ServiceAreaTask",
  "esri/tasks/ServiceAreaParameters",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/Color",
  "dojo/_base/array",

  "dijit/form/NumberSpinner",
  "dijit/form/Button",
  "dojo/_base/fx",
],
function(
  declare, _WidgetsInTemplateMixin, BaseWidget, lang, on,
  GraphicsLayer, PictureMarkerSymbol, Graphic,
  FeatureSet, ServiceAreaTask, ServiceAreaParameters,
  SimpleLineSymbol, SimpleFillSymbol, Color, arrayUtils
) {
  return declare([BaseWidget, _WidgetsInTemplateMixin], {

    baseClass: 'jimu-widget-drive-times',
    pointLayer: null,
    polyLayer: null,
    _driveTimeInputs: null,
    _markerGraphic: null,
    _loading: false,
    _bodyColors: [],
    _borderColors: [],
    _polygons: [],

    postCreate: function() {
      this.inherited(arguments);

      // gather input elements into array for ease of use
      this._setInputs();
      // get colors from the config
      this._setColors();
      // create the fill symbols
      this._setPolygons();

      // bind on click functions to click events
      this.own(on(this.map, "click", lang.hitch(this, this.onMapClick)));
      this.own(on(this.resetBtn, "click", lang.hitch(this, this.onResetClick)));

      // create graphics layers and attach them to the map
      this.polyLayer = new GraphicsLayer();
      this.pointLayer = new GraphicsLayer();
      this.map.addLayer(this.pointLayer);
      this.map.addLayer(this.polyLayer);

      console.log('DriveTimes::postCreate');
    },

    _setInputs: function() {
      this._driveTimeInputs = [this.driveTimeInput1, this.driveTimeInput2, this.driveTimeInput3];
    },

    _setColors: function() {
      this._bodyColors = [new Color(this.config.poly1BodyColor), new Color(this.config.poly2BodyColor), new Color(this.config.poly3BodyColor)];
      this._borderColors = [new Color(this.config.poly1BorderColor), new Color(this.config.poly2BorderColor), new Color(this.config.poly3BorderColor)];
    },

    _setLoading: function(toggle) {
      // show/hide loading state
      if (toggle) {
        this._loading = true;
        this.loadingDiv.hidden = false;
      } else {
        this._loading = false;
        this.loadingDiv.hidden = true;
      }
    },

    _setPolygons: function() {
      var polys = [];

      // create the fill symbols using the colors from config
      for (let i = 0; i<3; i++) {
        var line = new SimpleLineSymbol("solid", this._borderColors[i], 2);
        var poly = new SimpleFillSymbol(
          "solid", line, this._bodyColors[i] 
        );
        polys.push(poly);
      }

      this._polygons = polys;
    },

    _getMarkerGraphic: function(mapPoint) {
      var symbol = new PictureMarkerSymbol(
        this.folderUrl + "css/images/esriGreenPin16x26.png",
        16, 26
        );
      symbol.setOffset(0, 12);
      return new Graphic(mapPoint, symbol);
    },

    _resetGraphics: function() {
      // reset all graphics and hide reset button
      this.resetDiv.style.visibility = "hidden";
      this.pointLayer.clear();
      this.polyLayer.clear();
      this._markerGraphic = null;
    },

    onResetClick: function() {
      this._resetGraphics();
    },

    _createServiceAreaParams: function(locationGraphic, driveTimeCutoffs, outSpatialReference) {
      // create the parameters that the service area api uses
      var features = [];
      features.push(locationGraphic);

      var facilities = new FeatureSet();
      facilities.features = features

      var params = new ServiceAreaParameters();
      params.defaultBreaks = driveTimeCutoffs;
      params.outSpatialReference = outSpatialReference;
      params.returnFacilities = false;
      params.facilities = facilities;

      return params;
    },

    _solveServiceArea: function(widget, url, serviceAreaParams, polyLayer) {
      // run service area api and add graphics to map
      var serviceArea = new ServiceAreaTask(url);

      // serviceArea.solve is async
      serviceArea.solve(serviceAreaParams, function(solveResult){
        arrayUtils.forEach(solveResult.serviceAreaPolygons, function(serviceArea, i){
          // this keeps the polygons in the correct order (outer-middle-inner)
          if (solveResult.serviceAreaPolygons.length == 2 && i == 1) {
            i += 1;
          }

          serviceArea.setSymbol(widget._polygons[i]);
          polyLayer.add(serviceArea);
        });
        // end of async function, end loading state
        widget._setLoading(false);
      }, function(err){
        console.log(err.message);
      });
    },

    onMapClick: function(event) {
      // disable map click if loading, or map already has marker graphic
      if (this._loading || this._markerGraphic != null) {
        return;
      }

      // collect all values from the html inputs
      var driveTimes = [];
      this._driveTimeInputs.forEach((input) => {
        if (input.value != 0) {
          driveTimes.push(input.value)
        }
      });

      // if driveTimes has no values return
      if (driveTimes.length == 0) {
        //console.log("drive times array is empty");
        return
      }

      // function passed checks, is loading
      this._setLoading(true);
      this.resetDiv.style.visibility = "visible";

      // create point graphic and add it to the map
      this._markerGraphic = this._getMarkerGraphic(event.mapPoint);
      this.pointLayer.add(this._markerGraphic);

      // create params and send solve request
      const serviceAreaParams = this._createServiceAreaParams(this._markerGraphic, driveTimes, this._markerGraphic.geometry.spatialReference);
      this._solveServiceArea(this, this.config.serviceAreaUrl, serviceAreaParams, this.polyLayer);
    },

    onClose: function(){
      // reset everything on widget close
      this._resetGraphics();
      console.log('DriveTimes::onClose');
    },
  });
});
