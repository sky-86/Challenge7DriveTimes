define([
  'dojo/_base/declare',
  'jimu/BaseWidgetSetting',
  'dijit/_WidgetsInTemplateMixin',
  "dijit/form/HorizontalSlider",
  "dijit/form/HorizontalRule",
  "dijit/ColorPalette",
  "dijit/form/TextBox",
  "esri/dijit/ColorPicker",
  "dijit/form/TextBox",
],
function(
  declare, 
  BaseWidgetSetting,
  _WidgetsInTemplateMixin,
) {
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-drive-times-setting',

    postCreate: function(){
      //the config object is passed in
      this.setConfig(this.config);
    },

    setConfig: function(config){
      this.serviceAreaUrlInput.set("value", config.serviceAreaUrl);

      this.poly1BodyColorInput.set("color", config.poly1BodyColor);
      this.poly2BodyColorInput.set("color", config.poly2BodyColor);
      this.poly3BodyColorInput.set("color", config.poly3BodyColor);

      this.poly1BorderColorInput.set("color", config.poly1BorderColor);
      this.poly2BorderColorInput.set("color", config.poly2BorderColor);
      this.poly3BorderColorInput.set("color", config.poly3BorderColor);
    },

    getConfig: function(){
      //WAB will get config object through this method
      return {
        serviceAreaUrl: this.serviceAreaUrlInput.value,

        poly1BodyColor: this.poly1BodyColorInput.get("color"),
        poly2BodyColor: this.poly2BodyColorInput.get("color"),
        poly3BodyColor: this.poly3BodyColorInput.get("color"),

        poly1BorderColor: this.poly1BorderColorInput.get("color"),
        poly2BorderColor: this.poly2BorderColorInput.get("color"),
        poly3BorderColor: this.poly3BorderColorInput.get("color"),
      };
    }
  });
});
