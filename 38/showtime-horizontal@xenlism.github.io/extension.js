
const St = imports.gi.St;
const Main = imports.ui.main;
const Util = imports.misc.util;
const GLib = imports.gi.GLib;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const ExtensionPath = imports.misc.extensionUtils.getCurrentExtension().path;

let showtime_script = ExtensionPath + '/showtime-horizontal.js';


function killshowtime() {
  GLib.spawn_command_line_sync("/usr/bin/pkill -f " + showtime_script);
}

function startshowtime() {
  Util.spawnCommandLine(" /usr/bin/gjs " + showtime_script);
}
function init() {
    let settings = Convenience.getSettings();
}

function enable() {
  killshowtime();
  startshowtime();
}

function disable() {
  killshowtime();
}
