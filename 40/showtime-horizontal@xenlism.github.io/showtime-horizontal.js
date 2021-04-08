const GObject = imports.gi;
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

//const settings = new Gio.Settings({ settings_id: 'gnome-shell-extension-showtime' });


let timeout;
Gtk.init(null);
let dayweek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
let datemonthinyear = ["January","February","March","April","May","June","July","August","September","October","November","December"]
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
    'org.gnome.shell.extensions.showtime-horizontal', true);
  if (!schemaObj) {
    throw new Error('cannot find schemas');
  }
  return new Gio.Settings({ settings_schema : schemaObj });
}
let settings = getSettings();
let setting_time_am = settings.get_boolean("time-am");
let setting_position_x = settings.get_int("time-position-x");
let setting_position_y = settings.get_int("time-position-y");
let setting_date_color = settings.get_string("time-date-color");
let setting_clock_color = settings.get_string("time-clock-color");
let setting_date_font = settings.get_string("time-date-font");
let setting_clock_font = settings.get_string("time-clock-font");
let setting_date_fomat = settings.get_int("time-date-format");
let setting_clock_fomat = settings.get_int("time-clock-format");
let setting_shadow_transparent = settings.get_int("time-shadow-transparent");


let win = new Gtk.Window();
        win._delegate = win;
      	win.set_keep_below = true;
        win.set_wmclass("Showtime", "showtime");
        win.set_default_size(400,400);
        win.set_type_hint(Gdk.WindowTypeHint.DESKTOP);
        win.set_opacity = 1;
        win.title = "Show Time Widget";
        win.resizable = false;
        win.set_decorated(false);
        win.set_skip_taskbar_hint(true);
        win.set_skip_pager_hint(true);
        win.Wnck = new Wnck.Window();
        let screen = win.get_screen();
        let visual = screen.get_rgba_visual();
            if (visual && screen.is_composited()) { win.set_visual(visual); }
            win.set_app_paintable(true);

        let xposition = ((screen.get_width()/2) - (win.get_size()[0]/2));
        let yposition = (screen.get_height()/2) - (win.get_size()[1]/2);
        win.move(setting_position_x,setting_position_y);
        win.wrapevbox = new Gtk.EventBox();
        win.timegrid = new Gtk.Grid();
        win.texttopleft = new Gtk.Label();
        win.textbottomleft = new Gtk.Label();

        win.texttopleft.set_name("time-text-topleft");
        win.textbottomleft.set_name("time-text-bottomleft");

        win.texttopleft.get_style_context().add_class("time-text-topleft");
        win.textbottomleft.get_style_context().add_class("time-text-bottomleft");

        win.css = new Gtk.CssProvider();
        win.css.load_from_data('label { margin:0 10px; text-shadow: 0px 3px rgba(0,0,0,' + setting_shadow_transparent/100 + '); }');
        //win.css.load_from_path(path + '/stylesheet.css');

        win.timegrid.get_style_context().add_provider(win.css, 0);
        win.texttopleft.get_style_context().add_provider(win.css, 0);
        win.textbottomleft.get_style_context().add_provider(win.css, 0);

        win.set_tooltip_text("SUPER + Drag for Move Widget Position.");
        win.wrapevbox.add(win.timegrid);
        win.timegrid.add(win.texttopleft);
        win.timegrid.attach_next_to(win.textbottomleft,win.texttopleft, Gtk.PositionType.BOTTOM, 1, 1);
        win.add(win.wrapevbox);


  win.textsetTime = function(val) {
        let now = GLib.DateTime.new_now_local();
        let timehour = parseInt(now.format("%H"));
        let clock_text_print, hour_text, min_text, sec_text, ampm_text;
        hour_text = timehour;
        min_text = now.format("%M");
        sec_text = now.format("%S");

        if (setting_time_am) {
            ampm_text = " " + "AM";
            min_text = now.format("%M");
            if (timehour > 12) { hour_text = timehour - 12; }
            else if (timehour < 1) { hour_text = timehour + 12; }
            if ((12 <= timehour) && (timehour < 24)) { ampm_text = " " + "PM"; }
        } else {
            ampm_text = "";
        }
        switch (setting_clock_fomat) {
        case 1:
            clock_text_print = hour_text + " : " + min_text + ampm_text;
            break;
        case 2:
            clock_text_print = hour_text + " : " + min_text + " : " + sec_text;
            break;
        case 3:
            clock_text_print = hour_text + " : " + min_text;
            break;
        default:
            clock_text_print = hour_text + " : " + min_text + " : " + sec_text + ampm_text;
        }
        win.texttopleft.set_markup("<span foreground='" + setting_clock_color + "' font_desc='" + setting_clock_font + "'>" + clock_text_print + "</span>");

        let date_text_print;
        switch (setting_date_fomat) {
        case 1:
            date_text_print = dayweek[parseInt(now.format("%w"))] + " " + datemonthinyear[(parseInt(now.format("%m")) - 1)].substr(0, 3) + " " + now.format("%d");
            break;
        case 2:
            date_text_print = now.format("%d") + " " + datemonthinyear[(parseInt(now.format("%m")) - 1)] + " " + now.format("%Y");
            break;
        case 3:
            date_text_print = now.format("%d") + " " + datemonthinyear[(parseInt(now.format("%m")) - 1)].substr(0, 3) + " " + now.format("%Y");
            break;
        default:
            date_text_print = dayweek[parseInt(now.format("%w"))] + " " + datemonthinyear[(parseInt(now.format("%m")) - 1)] + " " + now.format("%d");
        }
        win.textbottomleft.set_markup("<span foreground='" + setting_date_color + "' font_desc='" + setting_date_font + "'>" + date_text_print + "</span>");

        return true;
  }
 win.getposition = function(val) {
   let data_geometry = win.Wnck.get_geometry();
   let win_position = win.get_position();
 }
  win.quitShowtime = function(val) {
    Mainloop.source_remove(timeout);
    Gtk.main_quit();
    return true;
  }
  win.toggleWindowNORMALMode = function(val) {
    if(win.get_type_hint() == Gdk.WindowTypeHint.DESKTOP) {
      win.set_type_hint(Gdk.WindowTypeHint.NORMAL)
    }
  }
  win.toggleWindowDESKTOPMode = function(val) {
    if(win.get_type_hint() == Gdk.WindowTypeHint.NORMAL) {
      win.set_type_hint(Gdk.WindowTypeHint.DESKTOP);
      let win_position = win.get_position();
      settings.set_int("time-position-x",win_position[0]);
      settings.set_int("time-position-y",win_position[1]);
    }
  }
  win.testClick = function(val) {
    let win_position = win.get_position();
  }
  win.wrapevbox.set_events(Gdk.EventMask.BUTTON_PRESS_MASK);
  win.wrapevbox.connect("button-press-event", win.testClick.bind(this));
  win.wrapevbox.connect("enter-notify-event", win.toggleWindowNORMALMode.bind(this));
  win.wrapevbox.connect("leave-notify-event", win.toggleWindowDESKTOPMode.bind(this));
  settings.connect('changed::time-am', () => { setting_time_am = settings.get_boolean("time-am"); });
  settings.connect('changed::time-date-color', () => { setting_date_color = settings.get_string("time-date-color"); });
  settings.connect('changed::time-date-font', () => { setting_date_font = settings.get_string("time-date-font"); });
  settings.connect('changed::time-clock-color', () => { setting_clock_color = settings.get_string("time-clock-color"); });
  settings.connect('changed::time-date-format', () => { setting_date_fomat = settings.get_int("time-date-format"); });
  settings.connect('changed::time-clock-format', () => { setting_clock_fomat = settings.get_int("time-clock-format"); });
  settings.connect('changed::time-shadow-transparent', () => {
    setting_shadow_transparent = settings.get_int("time-shadow-transparent");
    win.css.load_from_data('label { margin:0 10px; text-shadow: 0px 3px rgba(0,0,0,' + setting_shadow_transparent/100 + '); }');
  });

  win.connect("move-focus", win.getposition);
  win.connect("destroy", win.quitShowtime);
  win.show_all();
  timeout = Mainloop.timeout_add_seconds(1.0, win.textsetTime);
  Gtk.main();
