/**
 * CoordinateSelector widget module
 *
 * @param {H5P.jQuery} $
 */
H5PEditor.widgets.coordinateSelector = H5PEditor.CoordinateSelector = (function ($) {

  /**
   * Creates a coordinate selector.
   *
   * @class H5PEditor.CoordinateSelector
   * @param {Object} parent
   * @param {Object} field
   * @param {Object} params
   * @param {function} setValue
   */
  function CoordinateSelector(parent, field, params, setValue) {
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
    
  }

  /**
   * Append the field to the wrapper.
   * @public
   * @param {H5P.jQuery} $wrapper
   */
  CoordinateSelector.prototype.appendTo = function ($wrapper) {
    var self = this;

    self.$container = $('<div>', {
      'class': 'field text h5p-coordinate-selector'
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
    }).appendTo(self.$container)
    // Create input field
    self.$coordinateSelector = $('<input>', {
      'type': 'text',
      'class': 'h5p-coordinate-picker h5peditor-text',
      'id': "field-" + self.ID,
      'placeholder': self.field.placeholder
    }).appendTo(self.$container);

    if (self.params !== undefined) {
      var defaultValue = "";
      //console.log(self.params);
      $.each(self.params, function( key, value ) {
        defaultValue += value;
      });
      self.$coordinateSelector.val(defaultValue);
    }
    self.$coordinatePicker = $('<div>', {
      'class': 'h5p-coordinateselector-map',
      'id': "map-" + self.ID,
    }).appendTo(self.$container);
    

    self.$container.appendTo($wrapper);
    self.$inputs = self.$container.find('input');
    // On change is called by leaflet click event
    // to fetch the coordinates and write it into input field
    self.$inputs.change(function () {
      self.$map.removeLayer(self.$marker);
      //console.log("Changed!!");
      self.params = $("#field-" + self.ID).val();
      self.setValue(self.field, self.params);
      self.TextToMarker();
    });

    setTimeout(function(){
      // Create coordinate picker widget
      self.$map = L.map("map-" + self.ID, {
        dragging: true
      });
      self.$map.setView([46.980252, 8.041992], 11);
      self.$map.on('click', self.fetchCoordinate, {item: self});
      var OpenStreetMapMapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      });
      
      self.$map.addLayer(OpenStreetMapMapnik);
      // Add a marker with the stored coordinates
      if ($("#field-" + self.ID).val() !== undefined) {
        try {
          self.TextToMarker();
        } catch(error) {
          //console.log(error);
        }
        
      }

    },500);
  };
  
  CoordinateSelector.prototype.TextToMarker = function () {
    var self = this;
    var res = $("#field-" + self.ID).val().split(",");
    var latlng = L.latLng(res[0], res[1]);
    self.$marker = new L.marker(latlng, { draggable: false });
    self.$marker.addTo(self.$map);
    self.centerMapOnMarker(self.$map, self.$marker);
  };
  
  
  CoordinateSelector.prototype.uniqueID = function () {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  
  CoordinateSelector.prototype.fetchCoordinate = function (event) {
    var self = this;
    var coord = event.latlng.lat + "," + event.latlng.lng;
    $("#field-" + self.item.ID).val(coord);
    $("#field-" + self.item.ID).trigger("change");
  }

  CoordinateSelector.prototype.centerMapOnMarker = function(map, marker) {
    var latLngs = [ marker.getLatLng() ];
    var markerBounds = L.latLngBounds(latLngs);
    //console.log(map.getBoundsZoom(markerBounds));
    map.fitBounds(markerBounds);
    map.setZoom(11);
  }


  /**
   * Hide coordinate selector
   * @method hide
   */
  CoordinateSelector.prototype.hide = function () {
    //this.hide();
  };

  /**
   * Validate the current value.
   */
  CoordinateSelector.prototype.validate = function () {
    this.hide();
    return true;
    // FIXME:return (this.params.length !== 0);
  };

  CoordinateSelector.prototype.remove = function () {};

  return CoordinateSelector;
})(H5P.jQuery);
