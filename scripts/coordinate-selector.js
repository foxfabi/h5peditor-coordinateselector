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
    }).appendTo(self.$container);

    // Create location search input field
    self.$locationSearch = $('<input>', {
      'type': 'text',
      'class': 'h5p-search-location h5peditor-text',
      'id': "field-search-" + self.ID,
      'placeholder': CoordinateSelector.t('searchPlaceholder')
    }).appendTo(self.$container);
    self.$locationsDatalist = $('<datalist>', {
      'class': 'h5peditor-text h5p-location-datalist',
      'id': "field-search-" + self.ID + "-datalist"
    }).appendTo(self.$container);
    self.$locationSearch.bindWithDelay('keyup', {params: self}, self.searchLocationByName, 1000, true);
    self.$locationsDatalist.hide();

    // Create coordinate input field
    self.$coordinateSelector = $('<input>', {
      'type': 'text',
      'class': 'h5p-coordinate-picker h5peditor-text',
      'id': "field-" + self.ID,
      'value': self.field.placeholder,
      'placeholder': self.field.placeholder
    }).appendTo(self.$container);
    self.$coordinateSelector.val(self.field.placeholder);

    if (self.params !== undefined) {
      var defaultValue = "";
      $.each(self.params, function( key, value ) {
        defaultValue += value;
      });
      if (defaultValue !== "") {
        self.$coordinateSelector.val(defaultValue);
      }
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
      if (self.$marker !== undefined) {
        self.$map.removeLayer(self.$marker);
      }
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
        self.TextToMarker();
      }

    },500);
  };
  
  CoordinateSelector.prototype.TextToMarker = function () {
    var self = this;
    try {
      var res = $("#field-" + self.ID).val().split(",");
      var latlng = L.latLng(res[0], res[1]);
      self.$marker = new L.marker(latlng, { draggable: false });
      self.$marker.addTo(self.$map);
      self.centerMapOnMarker(self.$map, self.$marker);
    } catch(error) {
      //console.log(error);
    }
  };
  
  
  CoordinateSelector.prototype.uniqueID = function () {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  
  CoordinateSelector.prototype.fetchCoordinate = function (event) {
    var self = this;
    try {
      var coord = event.latlng.lat + "," + event.latlng.lng;
      $("#field-" + self.item.ID).val(coord);
      $("#field-" + self.item.ID).trigger("change");
    } catch(error) {
      //console.log(error);
    }
  }

  CoordinateSelector.prototype.centerMapOnMarker = function(map, marker) {
    try {
      var latLngs = [ marker.getLatLng() ];
      var markerBounds = L.latLngBounds(latLngs);
      map.fitBounds(markerBounds);
      map.setZoom(11);
    } catch(error) {
      //console.log(error);
    }
  }

  CoordinateSelector.prototype.searchLocationByName = function(event) {
    if (event.target.value !== undefined) {
      event.data.params.getPhotonLocations(event.target.value);
    }
  }
  
  /**
   * Search possible locations by asking photon.komoot.de
   *
   * @param {String} value string of searched location
   */  
  CoordinateSelector.prototype.getPhotonLocations = function (value) {
    var self = this;
    self.$locationsDatalist.html("");
    return new Promise(function(resolve, reject) {
      var items = [];
      // Force language
      // &osm_tag=place:city&osm_tag=place:locality
      // &osm_tag=tourism
      var url = "http://photon.komoot.de/api/?q=" + value + "&lang=en&limit=6&osm_tag=place";
      $.getJSON( url )
          .done(function( data ) {
            $.each( data, function( key, val ) {
              if ($.isArray(val)) {
                $.each( val, function( subKey, subVal ) {
                  var name = (subVal.properties.name !== undefined) ? subVal.properties.name : '';
                  var postcode = (subVal.properties.postcode !== undefined) ? subVal.properties.postcode : '';
                  var state = (subVal.properties.state !== undefined) ? subVal.properties.state : '';
                  var country = (subVal.properties.country !== undefined) ? subVal.properties.country : '';
                  var place = $.grep([name, state, country, postcode], Boolean).join(", "); // foo, bar
                  var option = $('<option/>', {
                    'value' : subVal.geometry.coordinates[1] + "," + subVal.geometry.coordinates[0],
                    'html': place
                  });
                  option.click(function (event) {
                    var coord = event.target.value;
                    $("#field-" + self.ID).val(coord);
                    $("#field-" + self.ID).trigger("change");
                    self.$locationsDatalist.hide();
                  });
                  self.$locationsDatalist.append(option);
                });
              }
              
            });
            resolve("getPhotonLocations worked!");
            //
          })
          .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
            reject(Error("getPhotonLocations broke"));
          });
      self.$locationsDatalist.show();
    });
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

  /**
   * Translate UI texts for this library.
   *
   * @param {String} key
   * @param {Object} vars
   * @returns {@exp;H5PEditor@call;t}
   */
  CoordinateSelector.t = function (key, vars) {
    return H5PEditor.t('H5PEditor.CoordinateSelector', key, vars);
  };

  CoordinateSelector.prototype.remove = function () {};

  return CoordinateSelector;
})(H5P.jQuery);

// Default english translations
H5PEditor.language['H5PEditor.CoordinateSelector'] = {
  libraryStrings: {
    searchPlaceholder: 'Search a location by it\'s name'
  }
};

/*
bindWithDelay jQuery plugin
Author: Brian Grinstead
MIT license: http://www.opensource.org/licenses/mit-license.php
http://github.com/bgrins/bindWithDelay
http://briangrinstead.com/files/bindWithDelay
Usage:
    See http://api.jquery.com/bind/
    .bindWithDelay( eventType, [ eventData ], handler(eventObject), timeout, throttle )
Examples:
    $("#foo").bindWithDelay("click", function(e) { }, 100);
    $(window).bindWithDelay("resize", { optional: "eventData" }, callback, 1000);
    $(window).bindWithDelay("resize", callback, 1000, true);
*/

(function($) {

$.fn.bindWithDelay = function( type, data, fn, timeout, throttle ) {

    if ( $.isFunction( data ) ) {
        throttle = timeout;
        timeout = fn;
        fn = data;
        data = undefined;
    }

    // Allow delayed function to be removed with fn in unbind function
    fn.guid = fn.guid || ($.guid && $.guid++);

    // Bind each separately so that each element has its own delay
    return this.each(function() {

        var wait = null;

        function cb() {
            var e = $.extend(true, { }, arguments[0]);
            var ctx = this;
            var throttler = function() {
                wait = null;
                fn.apply(ctx, [e]);
            };

            if (!throttle) { clearTimeout(wait); wait = null; }
            if (!wait) { wait = setTimeout(throttler, timeout); }
        }

        cb.guid = fn.guid;

        $(this).bind(type, data, cb);
    });
};

})(H5P.jQuery);
