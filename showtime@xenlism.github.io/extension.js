
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Util = imports.misc.util;
const ExtensionPath = imports.misc.extensionUtils.getCurrentExtension().path;

let text, button;
let python_script = ExtensionPath + '/ShowTime';

function init() {
     Util.spawnCommandLine(" /usr/bin/python3 " + python_script);
}

function enable() {
    
}

function disable() {
    
}
