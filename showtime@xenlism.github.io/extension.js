
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Util = imports.misc.util;
const ExtensionPath = imports.misc.extensionUtils.getCurrentExtension().path;

let text, button;
let showtime_script = ExtensionPath + '/showtime.js';

function init() {
     Util.spawnCommandLine(" /usr/bin/gjs " + showtime_script);
}

function enable() {

}

function disable() {

}
