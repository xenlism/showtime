var libnm_glib = imports.gi.GIRepository.Repository.get_default().is_registered('NMClient', '1.0');


const GObject = imports.gi.GObject;
const Gio   = imports.gi.Gio;
imports.gi.versions.Gtk = '3.0';
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const Pango = imports.gi.Pango;
const Mainloop = imports.mainloop;
const Cairo = imports.cairo;
const Lang  = imports.lang;
const GLib  = imports.gi.GLib;
const Wnck = imports.gi.Wnck;
const Clutter = imports.gi.Clutter;
const UPower = imports.gi.UPowerGlib;
var ByteArray = imports.byteArray;
var GTop = imports.gi.GTop;
const GtkClutter    = imports.gi.GtkClutter;


Gtk.init(null);
GtkClutter.init(null);
Clutter.init(null);
// const System = imports.system;
function getAppFileInfo() {
    let stack = (new Error()).stack,
        stackLine = stack.split('\n')[1],
        coincidence, path, file;
    if (!stackLine) throw new Error('Could not find current file (1)');
    coincidence = new RegExp('@(.+):\\d+').exec(stackLine);
    if (!coincidence) throw new Error('Could not find current file (2)');
    path = coincidence[1];
    file = Gio.File.new_for_path(path);
    return [file.get_path(), file.get_parent().get_path(), file.get_basename()];
}
const path = getAppFileInfo()[1];
imports.searchPath.push(path);

function getSettings() {
  let GioSSS = Gio.SettingsSchemaSource;
  let schemaSource = GioSSS.new_from_directory(
    path ,
    GioSSS.get_default(),
    false
  );
  let schemaObj = schemaSource.lookup(
    'org.gnome.shell.extensions.the-circles-widget', true);
  if (!schemaObj) {
    throw new Error('cannot find schemas');
  }
  return new Gio.Settings({ settings_schema : schemaObj });
}
let settings = getSettings();


let hextogdkrgba = function(hex) {
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

let hex16bitsto8bits = function(val) {
  let r = Math.floor(parseInt(val.substr(1,4),16)/256);
  let g = Math.floor(parseInt(val.substr(5,4),16)/256);
  let b = Math.floor(parseInt(val.substr(9,4),16)/256);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
const CircleClock = GObject.registerClass(class CircleClockWin extends Gtk.Window {
    _init() {
      super._init({ title: "System Infomations" });
      this._delegate = this;
      this.set_keep_below = true;
      this.set_wmclass("CircleClock", "CircleClock");
      this.set_default_size(250,250);
      this.set_type_hint(Gdk.WindowTypeHint.DESKTOP);
      this.set_opacity = 1;
      this.resizable = false;
      this.set_decorated(false);
      this.set_skip_taskbar_hint(true);
      this.set_skip_pager_hint(true);
      this.Wnck = new Wnck.Window();
      let screen = this.get_screen();
      let visual = screen.get_rgba_visual();
          if (visual && screen.is_composited()) { this.set_visual(visual); }
          this.set_app_paintable(true);

      let xposition = ((screen.get_width()/2) - (this.get_size()[0]/2));
      let yposition = ((screen.get_height()/2) - (this.get_size()[1]/2));
      xposition = settings.get_int("the-circles-digit-clock-position-x");
      yposition = settings.get_int("the-circles-digit-clock-position-y");
      this.move(xposition,yposition);
      this.wrapevbox = new Gtk.EventBox();
      this.xbox = new Gtk.Box();
      this.xbox.margin_top = 0;
      this.xbox.margin_bottom = this.margin_top;
      this.xbox.margin_start = 0;
      this.xbox.spacing = 0;
      this.xbox.border_width = 0;
      this.xbox.orientation = Gtk.Orientation.VERTICAL;
      this.area = this.buildArea();
      this.xbox.add(this.area);
      this.wrapevbox.add(this.xbox);
      this.add(this.wrapevbox);
      this.update();

      this.wrapevbox.set_events(Gdk.EventMask.BUTTON_PRESS_MASK);
      this.wrapevbox.connect("button-press-event", this.onClick.bind(this));
      this.wrapevbox.connect("enter-notify-event", this.toggleWindowNORMALMode.bind(this));
      this.wrapevbox.connect("leave-notify-event", this.toggleWindowDESKTOPMode.bind(this));
    }

    draw(ctx, height, width) {
      let now = GLib.DateTime.new_now_local();
      let hour = parseInt(now.format("%H"));
      let timehour = parseInt(now.format("%H"));
      let ampm = "AM";
      let min = parseInt(now.format("%M"));
      let sec = parseInt(now.format("%S"));

      if (setting_clock_am) {
          if (timehour > 12) { hour = timehour - 12; }
          else if (timehour < 1) { hour = timehour + 12; }
      }

      if ((12 <= timehour) && (timehour < 24)) { ampm = "PM"; } else { ampm = "AM"; }
      let xe, ye;
        xe = width / 2;
        ye = height / 2;
        ctx.save();
        ctx.setSourceRGBA(0, 0, 0, 0);
        ctx.paint();
        ctx.restore();

        ctx.selectFontFace("Ubuntu", Cairo.FontSlant.NORMAL,Cairo.FontWeight.NORMAL);
        ctx.setFontSize(60);
        ctx.setSourceRGBA(settings_clock_hour_digit_color.r, settings_clock_hour_digit_color.g, settings_clock_hour_digit_color.b, settings_digit_transparent);
        let x = 0
        let y = 60
        ctx.moveTo( x, y);
        ctx.showText(this.leadingzero(hour));

        ctx.selectFontFace("Ubuntu", Cairo.FontSlant.NORMAL,Cairo.FontWeight.NORMAL);
        ctx.setFontSize(60);
        ctx.setSourceRGBA(settings_clock_min_digit_color.r, settings_clock_min_digit_color.g, settings_clock_min_digit_color.b, settings_digit_transparent);
        x = 0
        y = 110
        ctx.moveTo( x, y);
        ctx.showText(this.leadingzero(min));

        ctx.selectFontFace("Ubuntu", Cairo.FontSlant.NORMAL,Cairo.FontWeight.NORMAL);
        ctx.setFontSize(60);
        ctx.setSourceRGBA(settings_clock_sec_digit_color.r, settings_clock_sec_digit_color.g, settings_clock_sec_digit_color.b, settings_digit_transparent);
        x = 0
        y = 160
        ctx.moveTo( x, y);
        ctx.showText(this.leadingzero(sec));

        ctx.selectFontFace("Ubuntu", Cairo.FontSlant.NORMAL,Cairo.FontWeight.NORMAL);
        ctx.setFontSize(15);
        ctx.setSourceRGBA(settings_clock_ampm_digit_color.r, settings_clock_ampm_digit_color.g, settings_clock_ampm_digit_color.b, settings_digit_transparent);
        x = 70
        y = 30
        ctx.moveTo( x, y);
        ctx.showText(ampm);
        ctx.$dispose();
        return true;
    }

    onClick(val) {
      let win_position = this.get_position();
    }

    boxpack(label,widget) {
        let hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });
        hbox.pack_start(label, true, true, 0);
        hbox.add(widget);
        return hbox;
    }
    leadingzero(val) {
      if (val.toString().length == 1 ) { val = "0" + val.toString(); } else { val = val.toString(); }
      return val;
    }
    buildArea() {
          let area, actor, widget, stage;
          area = new Gtk.DrawingArea();
          area.set_size_request(300, 300);
          area.connect('draw', (area, ctx) => { this.drawClock(area, ctx); });
          //area.connect("expose_event",() => { this.update(); });
          return area;
    }
    drawClock(area, ctx) {
          // area is Gtk.DrawingArea
          // ctx is Cairo.Context
          let height, width;
          height = area.get_allocated_height();
          width = area.get_allocated_width();
          this.draw(ctx, height, width);
    }
    update() {
      this.area.queue_draw();
    }
    quit(val) {
      Gtk.main_quit();
      return GLib.SOURCE_REMOVE;
    }
    getposition() {
      let data_geometry = this.Wnck.get_geometry();
      let win_position = this.get_position();
    }
    toggleWindowNORMALMode() {
      if(this.get_type_hint() == Gdk.WindowTypeHint.DESKTOP) {
        this.set_type_hint(Gdk.WindowTypeHint.NORMAL)
      }
    }
    toggleWindowDESKTOPMode() {
      if(this.get_type_hint() == Gdk.WindowTypeHint.NORMAL) {
        this.set_type_hint(Gdk.WindowTypeHint.DESKTOP);
        let win_position = this.get_position();
        settings.set_int("the-circles-digit-clock-position-x",win_position[0]);
        settings.set_int("the-circles-digit-clock-position-y",win_position[1]);
      }
    }
});
let setting_clock_am = settings.get_boolean("the-circles-digit-am");
let settings_clock_hour_digit_color = hextogdkrgba(settings.get_string("the-circles-clock-hour-digit-color"));
let settings_digit_transparent = settings.get_int("the-circles-digit-transparent") / 100;
let settings_clock_min_digit_color = hextogdkrgba(settings.get_string("the-circles-clock-min-digit-color"));
let settings_clock_sec_digit_color = hextogdkrgba(settings.get_string("the-circles-clock-sec-digit-color"));
let settings_clock_ampm_digit_color = hextogdkrgba(settings.get_string("the-circles-clock-ampm-digit-color"));

settings.connect('changed::the-circles-digit-am', () => { setting_clock_am = settings.get_boolean("the-circles-digit-am"); });
settings.connect('changed::the-circles-clock-ampm-digit-color', () => { settings_clock_ampm_digit_color = hextogdkrgba(settings.get_string("the-circles-clock-ampm-digit-color")); });
settings.connect('changed::the-circles-clock-sec-digit-color', () => { settings_clock_sec_digit_color = hextogdkrgba(settings.get_string("the-circles-clock-sec-digit-color")); });
settings.connect('changed::the-circles-clock-min-digit-color', () => { settings_clock_min_digit_color = hextogdkrgba(settings.get_string("the-circles-clock-min-digit-color")); });
settings.connect('changed::the-circles-clock-hour-digit-color', () => { settings_clock_hour_digit_color = hextogdkrgba(settings.get_string("the-circles-clock-hour-digit-color")); });
settings.connect('changed::the-circles-digit-transparent', () => { settings_digit_transparent = settings.get_int("the-circles-digit-transparent") / 100; });

let App = new CircleClock();
App.show_all();
App.connect("destroy", App.quit);
App.refresh = function() {
  App.update();
  return GLib.SOURCE_CONTINUE;
}
App.timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, App.refresh);
Gtk.main();
