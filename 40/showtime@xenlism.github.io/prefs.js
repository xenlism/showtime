// Tweaks-system-menu - Put Gnome Tweaks in the system menu.
// Copyright (C) 2019, 2020 Philippe Troin (F-i-f on Github)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
const GObject = imports.gi.GObject;
const Gio   = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const Pango = imports.gi.Pango;
const Mainloop = imports.mainloop;
const Cairo = imports.cairo;
const Lang  = imports.lang;
const GLib  = imports.gi.GLib;
const Config = imports.misc.config;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

hex16bitsto8bits = function(val) {
  let r = Math.floor(parseInt(val.substr(1,4),16)/256);
  let g = Math.floor(parseInt(val.substr(5,4),16)/256);
  let b = Math.floor(parseInt(val.substr(9,4),16)/256);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
hextogdkrgba = function(hex) {
  var x = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(x, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16)/255,
    g: parseInt(result[2], 16)/255,
    b: parseInt(result[3], 16)/255
  } : null;
}
const showtimePrefs = GObject.registerClass(class showtimePrefs extends Gtk.Grid {

    setup() {
          this.margin_top = 12;
          this.margin_bottom = this.margin_top;
          this.margin_start = 60;
          this.margin_end = this.margin_start;
          this.row_spacing = 6;
          this.column_spacing = this.row_spacing;
          this.orientation = Gtk.Orientation.VERTICAL;

          this._settings = Convenience.getSettings();
          let ypos = 1;

          let time_am_Label = new Gtk.Label({label: "Time Format 12 Hour with AM/PM",halign: Gtk.Align.START});
          let time_am_Switch = new Gtk.Switch({active: this._settings.get_boolean("time-am"),halign: Gtk.Align.END});
          time_am_Switch.connect('notify::active', button => {
              this._settings.set_boolean("time-am", button.active);
          });

          this.attach(time_am_Label , 1, 1, 1, 1);
          this.attach(time_am_Switch, 2, 1, 1, 1);


          let time_date_font_Label = new Gtk.Label({label: "Date Font Family and Size",halign: Gtk.Align.START});
          let time_date_font_button = new Gtk.FontButton({halign: Gtk.Align.END});
          time_date_font_button.set_use_font(true);
          time_date_font_button.set_use_size(true);
          time_date_font_button.set_font(this._settings.get_string("time-date-font"));
          time_date_font_button.connect("font_set", () => {
              this._settings.set_string("time-date-font", time_date_font_button.get_font());
          });
          this.attach(time_date_font_Label , 1, 2, 1, 1);
          this.attach(time_date_font_button, 2, 2, 1, 1);


          let time_date_color_Label = new Gtk.Label({label: "Color of Date",halign: Gtk.Align.START});
          let time_date_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
          let settings_date_color = hextogdkrgba(this._settings.get_string("time-date-color"));
          let _color = new Gdk.RGBA();
          _color.red = settings_date_color.r;
          _color.green = settings_date_color.g;
          _color.blue = settings_date_color.b;
          _color.alpha = 1;
          time_date_color_button.set_rgba(_color);
          time_date_color_button.connect("color_set", () => {
              let timedatecolor16bits = time_date_color_button.color.to_string();
              this._settings.set_string("time-date-color", hex16bitsto8bits(timedatecolor16bits));
          });

          this.attach(time_date_color_Label , 1, 3, 1, 1);
          this.attach(time_date_color_button, 2, 3, 1, 1);


          let time_clock_font_Label = new Gtk.Label({label: "Clock Font Family and Size",halign: Gtk.Align.START});
          let time_clock_font_button = new Gtk.FontButton({halign: Gtk.Align.END});
          time_clock_font_button.set_use_font(true);
          time_clock_font_button.set_use_size(true);
          time_clock_font_button.set_font(this._settings.get_string("time-clock-font"));
          time_clock_font_button.connect("font_set", () => {
              this._settings.set_string("time-clock-font", time_clock_font_button.get_font());
          });
          this.attach(time_clock_font_Label , 1, 4, 1, 1);
          this.attach(time_clock_font_button, 2, 4, 1, 1);

          let time_clock_color_Label = new Gtk.Label({label: "Color of clock",halign: Gtk.Align.START});
          let time_clock_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
          let settings_clock_color = hextogdkrgba(this._settings.get_string("time-clock-color"));
          _color.red = settings_clock_color.r;
          _color.green = settings_clock_color.g;
          _color.blue = settings_clock_color.b;
          _color.alpha = 1;
          time_clock_color_button.set_rgba(_color);
          time_clock_color_button.connect("color_set", () => {
              let timeclockcolor16bits = time_clock_color_button.color.to_string();
              this._settings.set_string("time-clock-color", hex16bitsto8bits(timeclockcolor16bits));
          });

          this.attach(time_clock_color_Label , 1, 5, 1, 1);
          this.attach(time_clock_color_button, 2, 5, 1, 1);

    }
});

function init() {
}
function buildPrefsWidget() {
    let prefswidget = new showtimePrefs();
    prefswidget.setup();
    prefswidget.show();
    return prefswidget;
}
