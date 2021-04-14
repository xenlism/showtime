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

const CirclePrefsWindow = GObject.registerClass(class CirclePrefs extends Gtk.Box {
  setup() {
        this.margin_top = 0;
        this.margin_bottom = this.margin_top;
        this.margin_start = 0;
        this.spacing = 10;
        this.border_width = 0;
        this.orientation = Gtk.Orientation.VERTICAL;

        this._settings = Convenience.getSettings();

        this.notebook = new Gtk.Notebook();
        this.append(this.notebook);

        this.page1 = new Gtk.Box();
        this.page1.margin_top = 12;
        this.page1.margin_bottom = this.margin_top;
        this.page1.margin_start = 30;
        this.page1.spacing = 10;
        this.page1.border_width = 10;
        this.page1.orientation = Gtk.Orientation.VERTICAL;
        let the_circles_modern_clock_show_label = new Gtk.Label({label: "Show Circle Modern Clock Widget",hexpand: true, xalign: 0});
        let the_circles_modern_clock_show_switch = new Gtk.Switch({active: this._settings.get_boolean("the-circles-modern-clock-show"),halign: Gtk.Align.END});
        the_circles_modern_clock_show_switch.connect('notify::active', button => {
            this._settings.set_boolean("the-circles-modern-clock-show", button.active);
        });
        this.page1.append(this.boxpack(the_circles_modern_clock_show_label,the_circles_modern_clock_show_switch));

        let the_circles_clock_show_label = new Gtk.Label({label: "Show Circle Clock Widget",hexpand: true, xalign: 0});
        let the_circles_clock_show_switch = new Gtk.Switch({active: this._settings.get_boolean("the-circles-clock-show"),halign: Gtk.Align.END});
        the_circles_clock_show_switch.connect('notify::active', button => {
            this._settings.set_boolean("the-circles-clock-show", button.active);
        });
        this.page1.append(this.boxpack(the_circles_clock_show_label,the_circles_clock_show_switch));

        let the_circles_digit_clock_show_label = new Gtk.Label({label: "Show Circle digit Clock Widget",hexpand: true, xalign: 0});
        let the_circles_digit_clock_show_switch = new Gtk.Switch({active: this._settings.get_boolean("the-circles-digit-clock-show"),halign: Gtk.Align.END});
        the_circles_digit_clock_show_switch.connect('notify::active', button => {
            this._settings.set_boolean("the-circles-digit-clock-show", button.active);
        });
        this.page1.append(this.boxpack(the_circles_digit_clock_show_label,the_circles_digit_clock_show_switch));


        let the_circles_cpu_show_label = new Gtk.Label({label: "Show Circle CPU Widget",hexpand: true, xalign: 0});
        let the_circles_cpu_show_switch = new Gtk.Switch({active: this._settings.get_boolean("the-circles-cpu-show"),halign: Gtk.Align.END});
        the_circles_cpu_show_switch.connect('notify::active', button => {
            this._settings.set_boolean("the-circles-cpu-show", button.active);
        });
        this.page1.append(this.boxpack(the_circles_cpu_show_label,the_circles_cpu_show_switch));
        let the_circles_ram_show_label = new Gtk.Label({label: "Show Circle RAM Widget",hexpand: true, xalign: 0});
        let the_circles_ram_show_switch = new Gtk.Switch({active: this._settings.get_boolean("the-circles-ram-show"),halign: Gtk.Align.END});
        the_circles_ram_show_switch.connect('notify::active', button => {
            this._settings.set_boolean("the-circles-ram-show", button.active);
        });
        this.page1.append(this.boxpack(the_circles_ram_show_label,the_circles_ram_show_switch));

        this.notebook.append_page(this.page1, new Gtk.Label({label: "Widgets"}));

        this.page2 = new Gtk.Box();
        this.page2.margin_top = 12;
        this.page2.margin_bottom = this.margin_top;
        this.page2.margin_start = 30;
        this.page2.spacing = 10;
        this.page2.border_width = 10;
        this.page2.orientation = Gtk.Orientation.VERTICAL;

        let the_circles_clock_digit_label = new Gtk.Label({label: "Show Digit Clock in The Widget",hexpand: true, xalign: 0});
        let the_circles_clock_digit_switch = new Gtk.Switch({active: this._settings.get_boolean("the-circles-clock-digit"),halign: Gtk.Align.END});
        the_circles_clock_digit_switch.connect('notify::active', button => {
            this._settings.set_boolean("the-circles-clock-digit", button.active);
        });
        this.page2.append(this.boxpack(the_circles_clock_digit_label,the_circles_clock_digit_switch));

        let the_circles_clock_am_label = new Gtk.Label({label: "Time Format 12 Hour with AM/PM",hexpand: true, xalign: 0});
        let the_circles_clock_am_switch = new Gtk.Switch({active: this._settings.get_boolean("the-circles-clock-am"),halign: Gtk.Align.END});
        the_circles_clock_am_switch.connect('notify::active', button => {
            this._settings.set_boolean("the-circles-clock-am", button.active);
        });
        this.page2.append(this.boxpack(the_circles_clock_am_label,the_circles_clock_am_switch));

        let the_circles_clock_color_label = new Gtk.Label({label: "Color of Clock Widget",hexpand: true, xalign: 0});
        let the_circles_clock_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
        let settings_clock_color = this.hextogdkrgba(this._settings.get_string("the-circles-clock-color"));
        let clock_color = new Gdk.RGBA();
        clock_color.red = settings_clock_color.r;
        clock_color.green = settings_clock_color.g;
        clock_color.blue = settings_clock_color.b;
        clock_color.alpha = 1;
        the_circles_clock_color_button.set_rgba(clock_color);
        the_circles_clock_color_button.connect("color_set", () => {
            let the_circles_clock_color16bits = the_circles_clock_color_button.color.to_string();
            this._settings.set_string("the-circles-clock-color", this.hex16bitsto8bits(the_circles_clock_color16bits));
        });

        this.page2.append(this.boxpack(the_circles_clock_color_label,the_circles_clock_color_button));


        let the_circles_clock_hour_ring_color_label = new Gtk.Label({label: "Color of Hour's Ring",hexpand: true, xalign: 0});
        let the_circles_clock_hour_ring_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
        let settings_clock_hour_ring_color = this.hextogdkrgba(this._settings.get_string("the-circles-clock-hour-ring-color"));
        let clock_hour_ring_color = new Gdk.RGBA();
        clock_hour_ring_color.red = settings_clock_hour_ring_color.r;
        clock_hour_ring_color.green = settings_clock_hour_ring_color.g;
        clock_hour_ring_color.blue = settings_clock_hour_ring_color.b;
        clock_hour_ring_color.alpha = 1;
        the_circles_clock_hour_ring_color_button.set_rgba(clock_hour_ring_color);
        the_circles_clock_hour_ring_color_button.connect("color_set", () => {
            let the_circles_clock_hour_ring_color16bits = the_circles_clock_hour_ring_color_button.color.to_string();
            this._settings.set_string("the-circles-clock-hour-ring-color", this.hex16bitsto8bits(the_circles_clock_hour_ring_color16bits));
        });

        this.page2.append(this.boxpack(the_circles_clock_hour_ring_color_label,the_circles_clock_hour_ring_color_button));


        let the_circles_clock_min_ring_color_label = new Gtk.Label({label: "Color of Minute's Ring",hexpand: true, xalign: 0});
        let the_circles_clock_min_ring_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
        let settings_clock_min_ring_color = this.hextogdkrgba(this._settings.get_string("the-circles-clock-min-ring-color"));
        let clock_min_ring_color = new Gdk.RGBA();
        clock_min_ring_color.red = settings_clock_min_ring_color.r;
        clock_min_ring_color.green = settings_clock_min_ring_color.g;
        clock_min_ring_color.blue = settings_clock_min_ring_color.b;
        clock_min_ring_color.alpha = 1;
        the_circles_clock_min_ring_color_button.set_rgba(clock_min_ring_color);
        the_circles_clock_min_ring_color_button.connect("color_set", () => {
            let the_circles_clock_min_ring_color16bits = the_circles_clock_min_ring_color_button.color.to_string();
            this._settings.set_string("the-circles-clock-min-ring-color", this.hex16bitsto8bits(the_circles_clock_min_ring_color16bits));
        });

        this.page2.append(this.boxpack(the_circles_clock_min_ring_color_label,the_circles_clock_min_ring_color_button));

        let the_circles_clock_sec_ring_color_label = new Gtk.Label({label: "Color of Second's Ring",hexpand: true, xalign: 0});
        let the_circles_clock_sec_ring_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
        let settings_clock_sec_ring_color = this.hextogdkrgba(this._settings.get_string("the-circles-clock-sec-ring-color"));
        let clock_sec_ring_color = new Gdk.RGBA();
        clock_sec_ring_color.red = settings_clock_sec_ring_color.r;
        clock_sec_ring_color.green = settings_clock_sec_ring_color.g;
        clock_sec_ring_color.blue = settings_clock_sec_ring_color.b;
        clock_sec_ring_color.alpha = 1;
        the_circles_clock_sec_ring_color_button.set_rgba(clock_sec_ring_color);
        the_circles_clock_sec_ring_color_button.connect("color_set", () => {
            let the_circles_clock_sec_ring_color16bits = the_circles_clock_sec_ring_color_button.color.to_string();
            this._settings.set_string("the-circles-clock-sec-ring-color", this.hex16bitsto8bits(the_circles_clock_sec_ring_color16bits));
        });

        this.page2.append(this.boxpack(the_circles_clock_sec_ring_color_label,the_circles_clock_sec_ring_color_button));
        let the_circles_clock_frame_optic_label = new Gtk.Label({label: "The Clock Widget Frame transparency",hexpand: true, xalign: 0});
        let the_circles_clock_frame_optic_rang = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL,0, 100, 5);
        the_circles_clock_frame_optic_rang.set_value(this._settings.get_int("the-circles-clock-frame-transparent"));
        the_circles_clock_frame_optic_rang.set_draw_value(false);
        the_circles_clock_frame_optic_rang.add_mark(25, Gtk.PositionType.TOP, "25");
        the_circles_clock_frame_optic_rang.add_mark(50, Gtk.PositionType.TOP, "50");
        the_circles_clock_frame_optic_rang.add_mark(75, Gtk.PositionType.TOP, "75");
        the_circles_clock_frame_optic_rang.set_size_request(200, -1);
        the_circles_clock_frame_optic_rang.connect('value-changed', slider => {
          this._settings.set_int("the-circles-clock-frame-transparent", slider.get_value());
        });
        this.page2.append(this.boxpack(the_circles_clock_frame_optic_label,the_circles_clock_frame_optic_rang));

        let the_circles_clock_optic_label = new Gtk.Label({label: "The Clock Widget transparency",hexpand: true, xalign: 0});
        let the_circles_clock_optic_rang = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL,0, 100, 5);
        the_circles_clock_optic_rang.set_value(this._settings.get_int("the-circles-clock-transparent"));
        the_circles_clock_optic_rang.set_draw_value(false);
        the_circles_clock_optic_rang.add_mark(25, Gtk.PositionType.TOP, "25");
        the_circles_clock_optic_rang.add_mark(50, Gtk.PositionType.TOP, "50");
        the_circles_clock_optic_rang.add_mark(75, Gtk.PositionType.TOP, "75");
        the_circles_clock_optic_rang.set_size_request(200, -1);
        the_circles_clock_optic_rang.connect('value-changed', slider => {
          this._settings.set_int("the-circles-clock-transparent", slider.get_value());
        });
        this.page2.append(this.boxpack(the_circles_clock_optic_label,the_circles_clock_optic_rang));

        let the_circles_clock_bg_ring_optic_label = new Gtk.Label({label: "The Clock Widget Background Ring transparency",hexpand: true, xalign: 0});
        let the_circles_clock_bg_ring_optic_rang = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL,0, 100, 5);
        the_circles_clock_bg_ring_optic_rang.set_value(this._settings.get_int("the-circles-clock-ring-transparent"));
        the_circles_clock_bg_ring_optic_rang.set_draw_value(false);
        the_circles_clock_bg_ring_optic_rang.add_mark(25, Gtk.PositionType.TOP, "25");
        the_circles_clock_bg_ring_optic_rang.add_mark(50, Gtk.PositionType.TOP, "50");
        the_circles_clock_bg_ring_optic_rang.add_mark(75, Gtk.PositionType.TOP, "75");
        the_circles_clock_bg_ring_optic_rang.set_size_request(200, -1);
        the_circles_clock_bg_ring_optic_rang.connect('value-changed', slider => {
          this._settings.set_int("the-circles-clock-ring-transparent", slider.get_value());
        });
        this.page2.append(this.boxpack(the_circles_clock_bg_ring_optic_label,the_circles_clock_bg_ring_optic_rang));


        this.notebook.append_page(this.page2,new Gtk.Label({label: "Clock"}));

        this.page3 = new Gtk.Box();
        this.page3.margin_top = 12;
        this.page3.margin_bottom = this.margin_top;
        this.page3.margin_start = 30;
        this.page3.spacing = 10;
        this.page3.border_width = 10;
        this.page3.orientation = Gtk.Orientation.VERTICAL;

        let the_circles_cpu_color_label = new Gtk.Label({label: "Color of CPU Widget",hexpand: true, xalign: 0});
        let the_circles_cpu_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
        let settings_cpu_color = this.hextogdkrgba(this._settings.get_string("the-circles-cpu-color"));
        let cpu_color = new Gdk.RGBA();
        cpu_color.red = settings_cpu_color.r;
        cpu_color.green = settings_cpu_color.g;
        cpu_color.blue = settings_cpu_color.b;
        cpu_color.alpha = 1;
        the_circles_cpu_color_button.set_rgba(cpu_color);
        the_circles_cpu_color_button.connect("color_set", () => {
            let the_circles_cpu_color16bits = the_circles_cpu_color_button.color.to_string();
            this._settings.set_string("the-circles-cpu-color", this.hex16bitsto8bits(the_circles_cpu_color16bits));
        });

        this.page3.append(this.boxpack(the_circles_cpu_color_label,the_circles_cpu_color_button));

        let the_circles_cpu_optic_label = new Gtk.Label({label: "The CPU Widget transparency",hexpand: true, xalign: 0});
        let the_circles_cpu_optic_rang = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL,0, 100, 5);
        the_circles_cpu_optic_rang.set_value(this._settings.get_int("the-circles-cpu-transparent"));
        the_circles_cpu_optic_rang.set_draw_value(false);
        the_circles_cpu_optic_rang.add_mark(25, Gtk.PositionType.TOP, "25");
        the_circles_cpu_optic_rang.add_mark(50, Gtk.PositionType.TOP, "50");
        the_circles_cpu_optic_rang.add_mark(75, Gtk.PositionType.TOP, "75");
        the_circles_cpu_optic_rang.set_size_request(200, -1);
        the_circles_cpu_optic_rang.connect('value-changed', slider => {
          this._settings.set_int("the-circles-cpu-transparent", slider.get_value());
        });
        this.page3.append(this.boxpack(the_circles_cpu_optic_label,the_circles_cpu_optic_rang));

        this.notebook.append_page(this.page3,new Gtk.Label({label: "CPU"}));

        this.page4 = new Gtk.Box();
        this.page4.margin_top = 12;
        this.page4.margin_bottom = this.margin_top;
        this.page4.margin_start = 30;
        this.page4.spacing = 10;
        this.page4.border_width = 10;
        this.page4.orientation = Gtk.Orientation.VERTICAL;

        let the_circles_ram_color_label = new Gtk.Label({label: "Color of RAM Widget",hexpand: true, xalign: 0});
        let the_circles_ram_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
        let settings_ram_color = this.hextogdkrgba(this._settings.get_string("the-circles-ram-color"));
        let ram_color = new Gdk.RGBA();
        ram_color.red = settings_ram_color.r;
        ram_color.green = settings_ram_color.g;
        ram_color.blue = settings_ram_color.b;
        ram_color.alpha = 1;
        the_circles_ram_color_button.set_rgba(ram_color);
        the_circles_ram_color_button.connect("color_set", () => {
            let the_circles_ram_color16bits = the_circles_ram_color_button.color.to_string();
            this._settings.set_string("the-circles-ram-color", this.hex16bitsto8bits(the_circles_ram_color16bits));
        });

        this.page4.append(this.boxpack(the_circles_ram_color_label,the_circles_ram_color_button));

        let the_circles_ram_optic_label = new Gtk.Label({label: "The RAM Widget transparency",hexpand: true, xalign: 0});
        let the_circles_ram_optic_rang = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL,0, 100, 5);
        the_circles_ram_optic_rang.set_value(this._settings.get_int("the-circles-ram-transparent"));
        the_circles_ram_optic_rang.set_draw_value(false);
        the_circles_ram_optic_rang.add_mark(25, Gtk.PositionType.TOP, "25");
        the_circles_ram_optic_rang.add_mark(50, Gtk.PositionType.TOP, "50");
        the_circles_ram_optic_rang.add_mark(75, Gtk.PositionType.TOP, "75");
        the_circles_ram_optic_rang.set_size_request(200, -1);
        the_circles_ram_optic_rang.connect('value-changed', slider => {
          this._settings.set_int("the-circles-ram-transparent", slider.get_value());
        });
        this.page4.append(this.boxpack(the_circles_ram_optic_label,the_circles_ram_optic_rang));

        this.notebook.append_page(this.page4,new Gtk.Label({label: "RAM"}));

        this.page5 = new Gtk.Box();
        this.page5.margin_top = 12;
        this.page5.margin_bottom = this.margin_top;
        this.page5.margin_start = 30;
        this.page5.spacing = 10;
        this.page5.border_width = 10;
        this.page5.orientation = Gtk.Orientation.VERTICAL;

        let the_circles_digit_am_label = new Gtk.Label({label: "Time Format 12 Hour with AM/PM",hexpand: true, xalign: 0});
        let the_circles_digit_am_switch = new Gtk.Switch({active: this._settings.get_boolean("the-circles-digit-am"),halign: Gtk.Align.END});
        the_circles_digit_am_switch.connect('notify::active', button => {
            this._settings.set_boolean("the-circles-digit-am", button.active);
        });
        this.page5.append(this.boxpack(the_circles_digit_am_label,the_circles_digit_am_switch));


        let the_circles_clock_hour_digit_color_label = new Gtk.Label({label: "Color of Hour's digit",hexpand: true, xalign: 0});
        let the_circles_clock_hour_digit_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
        let settings_clock_hour_digit_color = this.hextogdkrgba(this._settings.get_string("the-circles-clock-hour-digit-color"));
        let clock_hour_digit_color = new Gdk.RGBA();
        clock_hour_digit_color.red = settings_clock_hour_digit_color.r;
        clock_hour_digit_color.green = settings_clock_hour_digit_color.g;
        clock_hour_digit_color.blue = settings_clock_hour_digit_color.b;
        clock_hour_digit_color.alpha = 1;
        the_circles_clock_hour_digit_color_button.set_rgba(clock_hour_digit_color);
        the_circles_clock_hour_digit_color_button.connect("color_set", () => {
            let the_circles_clock_hour_digit_color16bits = the_circles_clock_hour_digit_color_button.color.to_string();
            this._settings.set_string("the-circles-clock-hour-digit-color", this.hex16bitsto8bits(the_circles_clock_hour_digit_color16bits));
        });

        this.page5.append(this.boxpack(the_circles_clock_hour_digit_color_label,the_circles_clock_hour_digit_color_button));


        let the_circles_clock_min_digit_color_label = new Gtk.Label({label: "Color of Minute's digit",hexpand: true, xalign: 0});
        let the_circles_clock_min_digit_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
        let settings_clock_min_digit_color = this.hextogdkrgba(this._settings.get_string("the-circles-clock-min-digit-color"));
        let clock_min_digit_color = new Gdk.RGBA();
        clock_min_digit_color.red = settings_clock_min_digit_color.r;
        clock_min_digit_color.green = settings_clock_min_digit_color.g;
        clock_min_digit_color.blue = settings_clock_min_digit_color.b;
        clock_min_digit_color.alpha = 1;
        the_circles_clock_min_digit_color_button.set_rgba(clock_min_digit_color);
        the_circles_clock_min_digit_color_button.connect("color_set", () => {
            let the_circles_clock_min_digit_color16bits = the_circles_clock_min_digit_color_button.color.to_string();
            this._settings.set_string("the-circles-clock-min-digit-color", this.hex16bitsto8bits(the_circles_clock_min_digit_color16bits));
        });

        this.page5.append(this.boxpack(the_circles_clock_min_digit_color_label,the_circles_clock_min_digit_color_button));

        let the_circles_clock_sec_digit_color_label = new Gtk.Label({label: "Color of Second's digit",hexpand: true, xalign: 0});
        let the_circles_clock_sec_digit_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
        let settings_clock_sec_digit_color = this.hextogdkrgba(this._settings.get_string("the-circles-clock-sec-digit-color"));
        let clock_sec_digit_color = new Gdk.RGBA();
        clock_sec_digit_color.red = settings_clock_sec_digit_color.r;
        clock_sec_digit_color.green = settings_clock_sec_digit_color.g;
        clock_sec_digit_color.blue = settings_clock_sec_digit_color.b;
        clock_sec_digit_color.alpha = 1;
        the_circles_clock_sec_digit_color_button.set_rgba(clock_sec_digit_color);
        the_circles_clock_sec_digit_color_button.connect("color_set", () => {
            let the_circles_clock_sec_digit_color16bits = the_circles_clock_sec_digit_color_button.color.to_string();
            this._settings.set_string("the-circles-clock-sec-digit-color", this.hex16bitsto8bits(the_circles_clock_sec_digit_color16bits));
        });

        this.page5.append(this.boxpack(the_circles_clock_sec_digit_color_label,the_circles_clock_sec_digit_color_button));

        let the_circles_clock_ampm_digit_color_label = new Gtk.Label({label: "Color of ampmond's digit",hexpand: true, xalign: 0});
        let the_circles_clock_ampm_digit_color_button = new Gtk.ColorButton({halign: Gtk.Align.END});
        let settings_clock_ampm_digit_color = this.hextogdkrgba(this._settings.get_string("the-circles-clock-ampm-digit-color"));
        let clock_ampm_digit_color = new Gdk.RGBA();
        clock_ampm_digit_color.red = settings_clock_ampm_digit_color.r;
        clock_ampm_digit_color.green = settings_clock_ampm_digit_color.g;
        clock_ampm_digit_color.blue = settings_clock_ampm_digit_color.b;
        clock_ampm_digit_color.alpha = 1;
        the_circles_clock_ampm_digit_color_button.set_rgba(clock_ampm_digit_color);
        the_circles_clock_ampm_digit_color_button.connect("color_set", () => {
            let the_circles_clock_ampm_digit_color16bits = the_circles_clock_ampm_digit_color_button.color.to_string();
            this._settings.set_string("the-circles-clock-ampm-digit-color", this.hex16bitsto8bits(the_circles_clock_ampm_digit_color16bits));
        });

        this.page5.append(this.boxpack(the_circles_clock_ampm_digit_color_label,the_circles_clock_ampm_digit_color_button));

        let the_circles_digit_optic_label = new Gtk.Label({label: "The Clock Widget transparency",hexpand: true, xalign: 0});
        let the_circles_digit_optic_rang = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL,0, 100, 5);
        the_circles_digit_optic_rang.set_value(this._settings.get_int("the-circles-digit-transparent"));
        the_circles_digit_optic_rang.set_draw_value(false);
        the_circles_digit_optic_rang.add_mark(25, Gtk.PositionType.TOP, "25");
        the_circles_digit_optic_rang.add_mark(50, Gtk.PositionType.TOP, "50");
        the_circles_digit_optic_rang.add_mark(75, Gtk.PositionType.TOP, "75");
        the_circles_digit_optic_rang.set_size_request(200, -1);
        the_circles_digit_optic_rang.connect('value-changed', slider => {
          this._settings.set_int("the-circles-digit-transparent", slider.get_value());
        });
        this.page5.append(this.boxpack(the_circles_digit_optic_label,the_circles_digit_optic_rang));

        this.notebook.append_page(this.page5,new Gtk.Label({label: "Digit Clock"}));

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
    let prefswidget = new CirclePrefsWindow();
    prefswidget.setup();
    prefswidget.show();
    return prefswidget;
}
