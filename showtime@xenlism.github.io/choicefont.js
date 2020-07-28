#!/usr/bin/gjs

const GObject = imports.gi;
const Gio   = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const Pango = imports.gi.Pango;
const Mainloop = imports.mainloop;
const Cairo = imports.cairo;
const Lang  = imports.lang;
const GLib  = imports.gi.GLib;
const Wnck = imports.gi.Wnck;

hex16bitsto8bits = function(val) {
  let r = Math.floor(parseInt(val.substr(1,4),16)/256);
  let g = Math.floor(parseInt(val.substr(5,4),16)/256);
  let b = Math.floor(parseInt(val.substr(9,4),16)/256);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
class ImageViewerWindow {
    constructor(app) {
        this._app = app;
        this._window = null;
        this._box = null;
        this._image = null;
        this._fileChooserButton = null;
    }

    _buildUI() {
        this._window = new Gtk.ApplicationWindow({
            application: this._app,
            defaultHeight: 200,
            defaultWidth: 200
        });
        this._box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL
        });
        this._grid = new Gtk.Grid();
        this._grid.set_orientation(Gtk.Orientation.VERTICAL);
        this._clockcolorbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL,margin: 7});
        this._timecolorbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL,margin: 7});
        this._clockfontbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL,margin: 7});
        this._timefontbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL,margin: 7});

        this._space_1st = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        this._space_2nd = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        this._space_3rd = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        this._space_4th = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        this._space_5th = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        this._space_6th = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        this._space_7th = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        this._space_8th = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });

        this._clock_color_label = new Gtk.Label({ label: "Clock's 'Color", xalign: 0});
        this._time_color_label = new Gtk.Label({ label: "Date's 'Color", xalign: 0 });
        this._clock_font_label = new Gtk.Label({ label: "Clock's Font", xalign: 0 });
        this._time_font_label = new Gtk.Label({ label: "Date's Font", xalign: 0 });

        this._space_1st.set_text("\t");
        this._space_2nd.set_text("\t");
        this._space_3rd.set_text("\t");
        this._space_4th.set_text("\t");
        this._space_5th.set_text("\t");
        this._space_6th.set_text("\t");
        this._space_7th.set_text("\t");
        this._space_8th.set_text("\t");

        this._timecolorbutton = new Gtk.ColorButton()
        this._clockcolorbutton = new Gtk.ColorButton()
        this._color = new Gdk.RGBA();
        this._color.red = 0.0;
        this._color.green = 0.0;
        this._color.blue = 1.0;
        this._color.alpha = 1;
        this._timecolorbutton.set_rgba(this._color);
        this._clockcolorbutton.set_rgba(this._color);

        this._timecolorbutton.connect("color_set", () => {
            let timecolor16bits = this._timecolorbutton.color.to_string();
            print(timecolor16bits, this.hex16bitsto8bits(timecolor16bits));
        });
        this._clockcolorbutton.connect("color_set", () => {
            let clockcolor16bits = this._clockcolorbutton.color.to_string();
            print(clockcolor16bits, this.hex16bitsto8bits(clockcolor16bits));
        });

        this._timefontbutton = new Gtk.FontButton();
        this._timefontbutton.set_show_style(true);
        this._timefontbutton.set_show_size(true);
        this._timefontbutton.set_font("ubuntu 40");

        this._clockfontbutton = new Gtk.FontButton();
        this._clockfontbutton.set_show_style(true);
        this._clockfontbutton.set_show_size(true);
        this._clockfontbutton.set_font("ubuntu 40");

        this._timefontbutton.connect("font_set", () => {
            print(this._timefontbutton.get_font());
        });
        this._clockfontbutton.connect("font_set", () => {
            print(this._clockfontbutton.get_font());
        });
        this._timefontbox.pack_start(this._time_font_label, true, true, 0);
        this._timefontbox.add(this._space_1st);
        this._timefontbox.add(this._timefontbutton);

        this._grid.add(this._timefontbox);

        this._box.add(this._grid);
        this._box.show_all();

        this._window.add(this._box);
    }
    hex16bitsto8bits(val) {
      let r = Math.floor(parseInt(val.substr(1,4),16)/256);
      let g = Math.floor(parseInt(val.substr(5,4),16)/256);
      let b = Math.floor(parseInt(val.substr(9,4),16)/256);
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    getWidget() {
        this._buildUI();
        return this._window;
    }
}

const application = new Gtk.Application({
    application_id: 'org.gnome.Sandbox.ImageViewerExample',
    flags: Gio.ApplicationFlags.FLAGS_NONE
});

application.connect('activate', app => {
    let activeWindow = app.activeWindow;

    if (!activeWindow) {
        let imageViewerWindow = new ImageViewerWindow(app);
        activeWindow = imageViewerWindow.getWidget();
    }

    activeWindow.present();
});

application.run(null);
