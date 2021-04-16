

var libnm_glib = imports.gi.GIRepository.Repository.get_default().is_registered('NMClient', '1.0');

var siDepsGtop = true;
var siDepsNM = true;

const St = imports.gi.St;
const Main = imports.ui.main;
const Util = imports.misc.util;
const GLib = imports.gi.GLib;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;
const Tweener = imports.tweener;
const UPower = imports.gi.UPowerGlib;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const path = imports.misc.extensionUtils.getCurrentExtension().path;


// Code by Florian Mounier aka paradoxxxzero from System Monitor Gnome Extension
var Shell = imports.gi.Shell;
var ExtensionSystem = imports.ui.extensionSystem;

let widget_clock_script = path + '/circle_clock.js';
let widget_ram_script = path + '/circle_ram.js';
let widget_cpu_script = path + '/circle_cpu.js';
let widget_digit_script = path + '/circle_digit.js';
let widget_modern_script = path + '/circle_modern.js';

let settings = Convenience.getSettings();
let setting_clock_show = settings.get_boolean("the-circles-clock-show");
let setting_cpu_show = settings.get_boolean("the-circles-cpu-show");
let setting_ram_show = settings.get_boolean("the-circles-ram-show");
let setting_modern_clock_show = settings.get_boolean("the-circles-modern-clock-show");
let setting_digit_clock_show = settings.get_boolean("the-circles-digit-clock-show");
let setting_widget_signal;


// const System = imports.system;
var ModalDialog = imports.ui.modalDialog;

var ByteArray = imports.byteArray;
var Lang = imports.lang;
var GObject = imports.gi.GObject;
var Gio = imports.gi.Gio;
var GTop, NM, NetworkManager, gc_timeout, menu_timeout;

try {
    GTop = imports.gi.GTop;
} catch (e) {
    log('[System Infomations] catched error: ' + e);
    siDepsGtop = false;
}

try {
    NM = libnm_glib ? imports.gi.NMClient : imports.gi.NM;
    NetworkManager = libnm_glib ? imports.gi.NetworkManager : NM;
} catch (e) {
    log('[System Infomations] catched error: ' + e);
    siDepsNM = false;
}
const MESSAGE = 'System Infomations - Desktop Widget\n\n\
Dependencies Missing\n\
Please install: \n\
libgtop, Network Manager and gir bindings \n\
\t    on Ubuntu: gir1.2-gtop-2.0, gir1.2-networkmanager-1.0 \n\
\t    on Fedora: libgtop2-devel, NetworkManager-glib-devel \n\
\t    on Arch: libgtop, networkmanager\n\
\t    on openSUSE: typelib-1_0-GTop-2_0, typelib-1_0-NetworkManager-1_0\n';


function widgetSettings() {
    setting_clock_show = settings.get_boolean("the-circles-clock-show");
    setting_cpu_show = settings.get_boolean("the-circles-cpu-show");
    setting_ram_show = settings.get_boolean("the-circles-ram-show");
    setting_modern_clock_show = settings.get_boolean("the-circles-modern-clock-show");
    setting_digit_clock_show = settings.get_boolean("the-circles-digit-clock-show");
}

let text;
function hidesiDialog() {
    Main.uiGroup.remove_actor(text);
    text = null;
}
function showSiDialog() {
    if (!text) {
        text = new St.Label({ style_class: 'label', text: MESSAGE });
        Main.uiGroup.add_actor(text);
    }
    text.opacity = 255;
    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),monitor.y + Math.floor(monitor.height / 2 - text.height / 2));
    Tweener.addTween(text,
                     { opacity: 0,
                       time: 50,
                       transition: 'easeOutQuad',
                       onComplete: hidesiDialog });
}

function OnOffWidget(key,path) {
  if(key) {
    Util.spawnCommandLine(" /usr/bin/gjs " + path);
  } else {
    GLib.spawn_command_line_sync("/usr/bin/pkill -f " + path);
  }
}

function killall() {
  OnOffWidget(false,widget_clock_script);
  OnOffWidget(false,widget_cpu_script);
  OnOffWidget(false,widget_ram_script);
  OnOffWidget(false,widget_modern_script);
  OnOffWidget(false,widget_digit_script);
}
function runall() {
  OnOffWidget(setting_clock_show,widget_clock_script);
  OnOffWidget(setting_cpu_show,widget_cpu_script);
  OnOffWidget(setting_ram_show,widget_ram_script);
  OnOffWidget(setting_modern_clock_show,widget_modern_script);
  OnOffWidget(setting_digit_clock_show,widget_digit_script);
}

function enable() {
  if (!(siDepsGtop && siDepsNM)) {
      showSiDialog();
  } else {
    killall();
    runall();
    setting_widget_signal = settings.connect("changed", () => {
          widgetSettings();
          runall();
    });

  }
}

function disable() {
  killall();
  settings.disconnect(setting_widget_signal);
}
