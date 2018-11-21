/**
 * MapSelector widget module
 *
 * @param {H5P.jQuery} $
 */
H5PEditor.widgets.mapSelector = H5PEditor.MapSelector = (function ($) {

  /**
   * Creates a map selector.
   *
   * @class H5PEditor.MapSelector
   * @param {Object} parent
   * @param {Object} field
   * @param {Object} params
   * @param {function} setValue
   */
  function MapSelector(parent, field, params, setValue) {
    var self = this;
    /**
     * Keeps track of parent container
     * @type {Object}
     */
    this.parent = parent;
    /**
     * @type {object}
     */
    this.field = field;
    /**
     * Keeps track of class parameters
     * @type {Object}
     */
    this.params = $.extend({}, params);
    this.setValue = setValue;
    this.ID = this.uniqueID();

    /**
     * Keeps track of available map types
     * @type {Array}
     */
    this.mapTypes = {
        'CartoDB.VoyagerNoLabels': 'CartoDB - VoyagerNoLabels',
        'Hydda.Base': 'Hydda - Base',
        'Stamen.Watercolor': 'Stamen - Watercolor',
        'Stamen.TerrainBackground': 'Stamen - TerrainBackground',
        'Esri.WorldImagery': 'Esri - WorldImagery',
    }
    
  }

  /**
   * Append the field to the wrapper.
   * @public
   * @param {H5P.jQuery} $wrapper
   */
  MapSelector.prototype.appendTo = function ($wrapper) {
    var self = this;

    self.$container = $('<div>', {
      'class': 'field text h5p-map-selector'
    });
 
    // Add header:
    $('<span>', {
      'class': 'h5peditor-label',
      html: self.field.label
    }).appendTo(self.$container);

    // Add description:
    $('<span>', {
      'class': 'h5peditor-field-description',
      html: self.field.description
    }).appendTo(self.$container);

    if (self.params !== undefined) {
      var defaultValue = "CartoDB.VoyagerNoLabels";
      $.each(self.params, function( key, value ) {
        self.defaultValue += value;
      });
      if (self.defaultValue !== "") {
        // FIXME: self.$mapSelector.val(defaultValue);
      }
    }
    
    // Wrapper for radio buttons
    var $options = $('<div class="h5p-mapselector-options">').appendTo(self.$container); 
    var s = $('<select>', {
      'id': "map-selector-" + self.ID,
    });
    for(var val in self.mapTypes) {
        $('<option />', {value: val, text: self.mapTypes[val]}).appendTo(s);
    }
    s.appendTo($options);

    self.mapContainer = $('<div>', {
      'class': 'h5p-mapselector-map',
      'id': "map-" + self.ID,
    }).appendTo(self.$container);
    self.$container.appendTo($wrapper);

    setTimeout(function() {
      // Create map preview widget
      self.map = L.map("map-" + self.ID, {
        dragging: false,
        boxZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        scrollWheelZoom: false,
        zoomControl: false
      });
      self.map.setView([46.980252, 8.041992], 8);
      self.setMapType();
    }, 200);
    
    $( "#map-selector-" + self.ID ).change(function() {
      self.defaultValue = this.value;
      self.map.removeLayer(self.mapLayer); 
      self.setMapType();
    });
    
  };

  MapSelector.prototype.setMapType = function() {
    var self = this;
    switch (self.defaultValue) {
      case 'CartoDB.VoyagerNoLabels':
        self.mapLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
          subdomains: 'abcd',
          maxZoom: 19
        });
        break;
      case 'Hydda.Base':
        self.mapLayer = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        break;
      case 'Stamen.Watercolor':
        self.mapLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          subdomains: 'abcd',
          minZoom: 1,
          maxZoom: 16,
          ext: 'png'
        });
        break;
      case 'Stamen.TerrainBackground':
        self.mapLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}', {
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          subdomains: 'abcd',
          minZoom: 0,
          maxZoom: 18,
          ext: 'png'
        });
        break;
      case 'Esri.WorldImagery':
        self.mapLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });
        break;
      default:
        self.mapLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
          subdomains: 'abcd',
          maxZoom: 19
        });
        break;
    }
    self.map.addLayer(self.mapLayer);    
  }
  MapSelector.prototype.uniqueID = function () {
    return 'xxxxxxxxxxxx9xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Hide coordinate selector
   * @method hide
   */
  MapSelector.prototype.hide = function () {
    //this.hide();
  };

  /**
   * Validate the current value.
   */
  MapSelector.prototype.validate = function () {
    this.hide();
    return true;
    // FIXME:return (this.params.length !== 0);
  };

  MapSelector.prototype.remove = function () {};

  return MapSelector;
})(H5P.jQuery);
