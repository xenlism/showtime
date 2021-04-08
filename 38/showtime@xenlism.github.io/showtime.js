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
let dayweek = ["Su","Mo","Tu","We","Th","Fr","Sa"];
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
    'org.gnome.shell.extensions.showtime', true);
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


let win = new Gtk.Window();
        win._delegate = win;
      	win.set_keep_below = true;
        win.set_wmclass("Showtime", "showtime");
        win.set_default_size(250,250);
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
            print("screen width" + screen.get_width());
            print("window width" + win.get_size()[0]);
            if (visual && screen.is_composited()) { win.set_visual(visual); }
            win.set_app_paintable(true);

        let xposition = ((screen.get_width()/2) - (win.get_size()[0]/2));
        let yposition = (screen.get_height()/2) - (win.get_size()[1]/2);
        win.move(setting_position_x,setting_position_y);
        win.wrapevbox = new Gtk.EventBox();
        win.timegrid = new Gtk.Grid({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        win.texttopleft = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        win.texttopright = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        win.textmidleft = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        win.textmidright = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        win.textbottomleft = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });
        win.textbottomright = new Gtk.Label({ halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER });

        win.texttopleft.set_name("time-text-topleft");
        win.texttopright.set_name("time-text-topright");
        win.textmidleft.set_name("time-text-midleft");
        win.textmidright.set_name("time-text-midright");
        win.textbottomleft.set_name("time-text-bottomleft");
        win.textbottomright.set_name("time-text-bottomright");

        win.texttopleft.get_style_context().add_class("time-text-topleft");
        win.texttopright.get_style_context().add_class("time-text-topright");
        win.textmidleft.get_style_context().add_class("time-text-midleft");
        win.textmidright.get_style_context().add_class("time-text-midright");
        win.textbottomleft.get_style_context().add_class("time-text-bottomleft");
        win.textbottomright.get_style_context().add_class("time-text-bottomright");

        let css = new Gtk.CssProvider();
        css.load_from_path(path + '/stylesheet.css');

        win.timegrid.get_style_context().add_provider(css, 0);
        win.texttopleft.get_style_context().add_provider(css, 0);
        win.texttopright.get_style_context().add_provider(css, 0);
        win.textmidleft.get_style_context().add_provider(css, 0);
        win.textmidright.get_style_context().add_provider(css, 0);
        win.textbottomleft.get_style_context().add_provider(css, 0);
        win.textbottomright.get_style_context().add_provider(css, 0);


        win.set_tooltip_text("SUPER + Drag for Move Widget Position.");
        win.wrapevbox.add(win.timegrid);
        win.timegrid.add(win.texttopleft);
        win.timegrid.attach_next_to(win.textmidleft,win.texttopleft, Gtk.PositionType.BOTTOM, 1, 1);
        win.timegrid.attach_next_to(win.textbottomleft,win.textmidleft, Gtk.PositionType.BOTTOM, 1, 1);
        win.timegrid.attach_next_to(win.texttopright,win.texttopleft, Gtk.PositionType.RIGHT, 1, 1);
        win.timegrid.attach_next_to(win.textmidright,win.textmidleft, Gtk.PositionType.RIGHT, 1, 1);
        win.timegrid.attach_next_to(win.textbottomright,win.textbottomleft, Gtk.PositionType.RIGHT, 1, 1);
        win.add(win.wrapevbox);


  win.textsetTime = function(val) {
        let now = GLib.DateTime.new_now_local();
        let timehour = parseInt(now.format("%H"));

        let texttopright_text, textmidright_text, textbottomright_text;
        if (setting_time_am) {
            texttopright_text = timehour;
            textbottomright_text = "AM";
            textmidright_text = now.format("%M");
            if (timehour > 12) { texttopright_text = timehour - 12; }
            else if (timehour < 1) { texttopright_text = timehour + 12; }
            if ((12 <= timehour) && (timehour < 24)) { textbottomright_text = "PM"; }
        } else {
            texttopright_text = now.format("%H");
            textmidright_text = now.format("%M");
            textbottomright_text = now.format("%S");
          }

        win.texttopright.set_markup("<span foreground='" + setting_clock_color + "' font_desc='" + setting_clock_font + "'>" + texttopright_text + "</span>");
        win.textmidright.set_markup("<span foreground='" + setting_clock_color + "' font_desc='" + setting_clock_font + "'>" + textmidright_text + "</span>");
        win.textbottomright.set_markup("<span foreground='" + setting_clock_color + "' font_desc='" + setting_clock_font + "'>" + textbottomright_text + "</span>");
        win.texttopleft.set_markup("<span foreground='" + setting_date_color + "' font_desc='" + setting_date_font + "'>" + dayweek[parseInt(now.format("%w"))] + "</span>");
        win.textmidleft.set_markup("<span foreground='" + setting_date_color + "' font_desc='" + setting_date_font + "'>" + now.format("%m") + "</span>");
        win.textbottomleft.set_markup("<span foreground='" + setting_date_color + "' font_desc='" + setting_date_font + "'>" + now.format("%d") + "</span>");
        /*
        win.texttopright.set_text(now.format("%H"));
        win.textmidright.set_text(now.format("%M"));
        win.textbottomright.set_text(now.format("%S"));
        win.texttopleft.set_text(dayweek[parseInt(now.format("%w"))]);
        win.textmidleft.set_text(now.format("%m"));
        win.textbottomleft.set_text(now.format("%d"));
        */
        return true;
  }
 win.getposition = function(val) {
   print("Changeed Position");
   let data_geometry = win.Wnck.get_geometry();
   let win_position = win.get_position();
   print(data_geometry,win_position[0],win_position[1]);
 }
  win.quitShowtime = function(val) {
    Mainloop.source_remove(timeout);
    Gtk.main_quit();
    return true;
  }
  win.toggleWindowNORMALMode = function(val) {
    if(win.get_type_hint() == Gdk.WindowTypeHint.DESKTOP) {
      win.set_type_hint(Gdk.WindowTypeHint.NORMAL)
      print("Normal Mode");
    }
  }
  win.toggleWindowDESKTOPMode = function(val) {
    if(win.get_type_hint() == Gdk.WindowTypeHint.NORMAL) {
      win.set_type_hint(Gdk.WindowTypeHint.DESKTOP)
      print("Desktop Mode");
      print("Changeed Position");
      let win_position = win.get_position();
      settings.set_int("time-position-x",win_position[0]);
      settings.set_int("time-position-y",win_position[1]);
      print(win_position[0],win_position[1]);
    }
  }
  win.testClick = function(val) {
    let win_position = win.get_position();
    print("clicked",win_position[0],win_position[1]);
  }
  win.wrapevbox.set_events(Gdk.EventMask.BUTTON_PRESS_MASK);
  win.wrapevbox.connect("button-press-event", win.testClick.bind(this));
  win.wrapevbox.connect("enter-notify-event", win.toggleWindowNORMALMode.bind(this));
  win.wrapevbox.connect("leave-notify-event", win.toggleWindowDESKTOPMode.bind(this));
  settings.connect('changed::time-am', () => { setting_time_am = settings.get_boolean("time-am"); });
  settings.connect('changed::time-date-color', () => { setting_date_color = settings.get_string("time-date-color"); });
  settings.connect('changed::time-date-font', () => { setting_date_font = settings.get_string("time-date-font"); });
  settings.connect('changed::time-clock-color', () => { setting_clock_color = settings.get_string("time-clock-color"); });
  settings.connect('changed::time-clock-font', () => { setting_clock_font = settings.get_string("time-clock-font"); });

  //win.wrapevimage.connect("clicked", win.toggleWindowMode.bind(this));
  win.connect("move-focus", win.getposition);
  win.connect("destroy", win.quitShowtime);
  win.show_all();
  timeout = Mainloop.timeout_add_seconds(1.0, win.textsetTime);
  Gtk.main();
