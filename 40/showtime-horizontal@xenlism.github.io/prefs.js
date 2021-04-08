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


const showtimeHorizontalPrefs = GObject.registerClass(class showtimeHorizontalPrefs extends Gtk.Box {

    setup() {
          this.margin_top = 12;
          this.margin_bottom = this.margin_top;
          this.margin_start = 30;
          this.spacing = 10;
          this.border_width = 10;
          this.orientation = Gtk.Orientation.VERTICAL;

          this._settings = Convenience.getSettings();


          let time_am_Label = new Gtk.Label({label: "Time Format 12 Hour with AM/PM",hexpand: true, xalign: 0});
          let time_am_Switch = new Gtk.Switch({active: this._settings.get_boolean("time-am"),halign: Gtk.Align.END});
          time_am_Switch.connect('notify::active', button => {
              this._settings.set_boolean("time-am", button.active);
          });
          this.append(this.boxpack(time_am_Label,time_am_Switch));

          let time_date_format_Label = new Gtk.Label({label: "Date Display Format",hexpand: true, xalign: 0});
          let time_date_format_list = new Gtk.ComboBoxText();
          time_date_format_list.append_text('Dayweek FullMonth Date');
          time_date_format_list.append_text('Dayweek ShortMonth Date');
          time_date_format_list.append_text('Date FullMonth Year');
          time_date_format_list.append_text('Date ShortMonth Year');
          time_date_format_list.set_active(this._settings.get_int('time-date-format'));
          time_date_format_list.connect('changed', list => {
              this._settings.set_int('time-date-format', list.get_active());
          });
          this.append(this.boxpack(time_date_format_Label,time_date_format_list));

          let time_date_font_Label = new Gtk.Label({label: "Date Font Family and Size",hexpand: true, xalign: 0});
          let time_date_font_button = new Gtk.FontButton({halign: Gtk.Align.END});
          time_date_font_button.set_use_font(true);
          time_date_font_button.set_use_size(true);
          time_date_font_button.set_font(this._settings.get_string("time-date-font"));
          time_date_font_button.connect("font_set", () => {
              this._settings.set_string("time-date-font", time_date_font_button.get_font());
          });
          this.append(this.boxpack(time_date_font_Label,time_date_font_button));


          let time_date_color_Label = new Gtk.Label({label: "Color of Date",hexpand: true, xalign: 0});
          let time_date_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
          let settings_date_color = this.hextogdkrgba(this._settings.get_string("time-date-color"));
          let _color = new Gdk.RGBA();
          _color.red = settings_date_color.r;
          _color.green = settings_date_color.g;
          _color.blue = settings_date_color.b;
          _color.alpha = 1;
          time_date_color_button.set_rgba(_color);
          time_date_color_button.connect("color_set", () => {
              let timedatecolor16bits = time_date_color_button.color.to_string();
              this._settings.set_string("time-date-color", this.hex16bitsto8bits(timedatecolor16bits));
          });

          this.append(this.boxpack(time_date_color_Label,time_date_color_button));

          let time_clock_format_Label = new Gtk.Label({label: "Clock Display Format",hexpand: true, xalign: 0});
          let time_clock_format_list = new Gtk.ComboBoxText();
          time_clock_format_list.append_text('Hour : Minute : Second (AM/PM)');
          time_clock_format_list.append_text('Hour : Minute (AM/PM)');
          time_clock_format_list.append_text('Hour : Minute : Second');
          time_clock_format_list.append_text('Hour : Minute');
          time_clock_format_list.set_active(this._settings.get_int('time-clock-format'));
          time_clock_format_list.connect('changed', list => {
              this._settings.set_int('time-clock-format', list.get_active());
          });
          this.append(this.boxpack(time_clock_format_Label,time_clock_format_list));

          let time_clock_font_Label = new Gtk.Label({label: "Clock Font Family and Size",hexpand: true, xalign: 0});
          let time_clock_font_button = new Gtk.FontButton({halign: Gtk.Align.END});
          time_clock_font_button.set_use_font(true);
          time_clock_font_button.set_use_size(true);
          time_clock_font_button.set_font(this._settings.get_string("time-clock-font"));
          time_clock_font_button.connect("font_set", () => {
              this._settings.set_string("time-clock-font", time_clock_font_button.get_font());
          });
          this.append(this.boxpack(time_clock_font_Label,time_clock_font_button));

          let time_clock_color_Label = new Gtk.Label({label: "Color of clock",hexpand: true, xalign: 0});
          let time_clock_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
          let settings_clock_color = this.hextogdkrgba(this._settings.get_string("time-clock-color"));
          _color.red = settings_clock_color.r;
          _color.green = settings_clock_color.g;
          _color.blue = settings_clock_color.b;
          _color.alpha = 1;
          time_clock_color_button.set_rgba(_color);
          time_clock_color_button.connect("color_set", () => {
              let timeclockcolor16bits = time_clock_color_button.color.to_string();
              this._settings.set_string("time-clock-color", this.hex16bitsto8bits(timeclockcolor16bits));
          });

          this.append(this.boxpack(time_clock_color_Label,time_clock_color_button));

          let time_shadow_Label = new Gtk.Label({label: "Shadow Transparency",hexpand: true, xalign: 0});
          let time_shadow_rang = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL,0, 100, 5);
          time_shadow_rang.set_value(this._settings.get_int("time-shadow-transparent"));
          time_shadow_rang.set_draw_value(false);
          time_shadow_rang.add_mark(25, Gtk.PositionType.TOP, "25");
          time_shadow_rang.add_mark(50, Gtk.PositionType.TOP, "50");
          time_shadow_rang.add_mark(75, Gtk.PositionType.TOP, "75");
          time_shadow_rang.set_size_request(200, -1);
          time_shadow_rang.connect('value-changed', slider => {
            this._settings.set_int("time-shadow-transparent", slider.get_value());
          });
          this.append(this.boxpack(time_shadow_Label,time_shadow_rang));


    }

    hex16bitsto8bits(val) {
      let r = Math.floor(parseInt(val.substr(1,4),16)/256);
      let g = Math.floor(parseInt(val.substr(5,4),16)/256);
      let b = Math.floor(parseInt(val.substr(9,4),16)/256);
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    hextogdkrgba(hex) {
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

    boxpack(label,widget) {
        let hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
        hbox.prepend(label);
        hbox.append(widget);
        return hbox;
    }
});

function init() {
}
function buildPrefsWidget() {
    let prefswidget = new showtimeHorizontalPrefs();
    prefswidget.setup();
    prefswidget.show();
    return prefswidget;
}
