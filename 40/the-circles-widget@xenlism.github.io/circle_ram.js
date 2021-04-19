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


const CircleRAM = GObject.registerClass(class CircleRAMWin extends Gtk.Window {
    _init() {
      super._init({ title: "System Infomations" });
      this._delegate = this;
      this.set_keep_below = true;
      this.set_wmclass("CircleRAM", "CircleRAM");
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
      xposition = settings.get_int("the-circles-ram-position-x");
      yposition = settings.get_int("the-circles-ram-position-y");
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
      //this.wrapevbox.add(this.box);
      this.wrapevbox.add(this.xbox);
      this.add(this.wrapevbox);
      this.update();

      this.wrapevbox.set_events(Gdk.EventMask.BUTTON_PRESS_MASK);
      this.wrapevbox.connect("button-press-event", this.onClick.bind(this));
      this.wrapevbox.connect("enter-notify-event", this.toggleWindowNORMALMode.bind(this));
      this.wrapevbox.connect("leave-notify-event", this.toggleWindowDESKTOPMode.bind(this));

    }

    draw(ctx, height, width) {

      let xe, ye;
        xe = width / 2;
        ye = height / 2;
        ctx.save();
        ctx.setSourceRGBA(0, 0, 0, 0);
        ctx.paint();
        ctx.restore();
        ctx.setSourceRGBA(settings_ram_color.r, settings_ram_color.g, settings_ram_color.b, settings_ram_transparent);

      	let radius = 80.0;
      	let angle1 = -90.0  * (Math.PI/180.0); // angles are specified
      	let angle2 = 270.0 * (Math.PI/180.0); // in radians
        ctx.setLineWidth(8);
        ctx.setLineCap(Cairo.LineCap.BUTT);
      	ctx.arc(xe, ye, radius, angle1, angle2);
      	ctx.stroke();

        ctx.setSourceRGBA(settings_ram_color.r, settings_ram_color.g, settings_ram_color.b, 0.3);
        radius = 60.0;
        ctx.setLineWidth(15);
        ctx.setLineCap(Cairo.LineCap.BUTT);
        ctx.arc(xe, ye, radius, angle1, angle2);
        ctx.stroke();


        this.get_ram_usage();
        angle1 = -90.0  * (Math.PI/180.0); // angles are specified
      	angle2 = ((this.usepercent * 3.6) - 90 ) * (Math.PI/180.0); // in radians

        ctx.setSourceRGBA(settings_ram_color.r, settings_ram_color.g, settings_ram_color.b, 0.6);
        radius = 60.0;
        ctx.setLineWidth(15);
        ctx.setLineCap(Cairo.LineCap.BUTT);
        ctx.arc(xe, ye, radius, angle1, angle2);
        ctx.stroke();



        ctx.selectFontFace("Ubuntu", Cairo.FontSlant.NORMAL,Cairo.FontWeight.BOLD);
        ctx.setFontSize(25);
        ctx.setSourceRGBA(settings_ram_color.r, settings_ram_color.g, settings_ram_color.b, 0.8);
        let x = (width / 2) - 25;
        let y = (height / 2) - 10;
        ctx.moveTo( x, y);
        ctx.showText("RAM");

        ctx.selectFontFace("Ubuntu", Cairo.FontSlant.NORMAL,Cairo.FontWeight.BOLD);
        ctx.setFontSize(25);
        ctx.setSourceRGBA(settings_ram_color.r, settings_ram_color.g, settings_ram_color.b, 0.8);
        x = (width / 2) - 25;
        y = (height / 2) + 20;
        ctx.moveTo( x, y);
        ctx.showText( this.usepercent + "%");
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

    buildArea() {
          let area, actor, widget, stage;
          area = new Gtk.DrawingArea();
          area.set_size_request(250, 250);
          area.connect('draw', (area, ctx) => { this.drawCairo(area, ctx); });
          //area.connect("expose_event",() => { this.update(); });
          return area;
    }
    drawCairo(area, ctx) {
          // area is Gtk.DrawingArea
          // ctx is Cairo.Context
          let height, width;
          height = area.get_allocated_height();
          width = area.get_allocated_width();
          this.draw(ctx, height, width);
    }
    get_ram_usage() {
          this._gtop = new GTop.glibtop_mem();
          GTop.glibtop_get_mem(this._gtop);
          this._ram = [0,0,0];
          this._unitConversion = 1024 * 1024;
          this._decimals = 100;
          GTop.glibtop_get_mem(this._gtop);
          this._ram[0] = Math.round(this._gtop.user / this._unitConversion);
          this._ram[1] = Math.round(this._gtop.free / this._unitConversion) ;
          this._ram[2] = Math.round(this._gtop.total / this._unitConversion) ;
          this.usage = Math.round((this._ram[0]/1000)*100)/100;
          this.free = Math.round((this._ram[1]/1000)*100)/100;
          this.total = Math.round((this._ram[2]/1000)*100)/100;
          this.usepercent = Math.round((this._ram[0]/this._ram[2])*100);
          this.freepercent = Math.round((this._ram[1]/this._ram[2])*100);
    }
    _get_ram_usage() {
           let file = Gio.file_new_for_path('/proc/meminfo');
           file.load_contents_async(null, (source, result) => {
               let contents = source.load_contents_finish(result)[1];
               let lines = ByteArray.toString(contents).split('\n');

               let total, available, used;

               for (let i = 0; i < 3; i++) {
                   let values;
                   let line = lines[i];

                   if (line.match(/^MemTotal/)) {
                       values = line.match(/^MemTotal:\s*([^ ]*)\s*([^ ]*)$/);
                       total = parseInt(values[1]);
                   } else if (line.match(/^MemAvailable/)) {
                       values = line.match(/^MemAvailable:\s*([^ ]*)\s*([^ ]*)$/);
                       available = parseInt(values[1]);
                   }
               }

               used = total - available;
               this.usepercent = (100 * used / total).toFixed(1);
           });
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
        settings.set_int("the-circles-ram-position-x",win_position[0]);
        settings.set_int("the-circles-ram-position-y",win_position[1]);
      }
    }
});
let settings_ram_color = hextogdkrgba(settings.get_string("the-circles-ram-color"));
let settings_ram_transparent = settings.get_int("the-circles-ram-transparent") / 100;
settings.connect('changed::the-circles-ram-transparent', () => { settings_ram_transparent = settings.get_int("the-circles-ram-transparent") / 100; });
settings.connect('changed::the-circles-ram-color', () => { settings_ram_color = hextogdkrgba(settings.get_string("the-circles-ram-color")); });

let App = new CircleRAM();
App.show_all();
App.connect("destroy", App.quit);
App.refresh = function() {
  App.update();
  return GLib.SOURCE_CONTINUE;
}
App.timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, App.refresh);
Gtk.main();
