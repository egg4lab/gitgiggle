#!/bin/sh
# Cadence Virtuoso launcher (Tcl/Tk). UNIX/Linux: chmod +x && ./virtuoso_launcher.tcl
# -*- tcl -*-
exec wish "$0" ${1+"$@"}

package require Tk

# Optional: persist fields in ~/.config/gitgiggle/virtuoso_launcher.rc (Tcl source)
if {![info exists env(HOME)]} {
    if {[info exists env(USERPROFILE)]} {
        set env(HOME) $env(USERPROFILE)
    } else {
        set env(HOME) [file normalize ~]
    }
}
set config_dir [file join $::env(HOME) .config gitgiggle]
set config_file [file join $config_dir virtuoso_launcher.rc]

# Defaults — override via UI or config file
if {![info exists env(CDSROOT)]} {
    set env(CDSROOT) "/path/to/cadence/install"
}
if {![info exists env(REF_BASE_LIB)]} {
    set env(REF_BASE_LIB) "/path/to/reference/base/library"
}
set setup_script "/path/to/cdsenv.sh"
set virtuoso_cmd "virtuoso"

# Bash single-quoted string: wrap in '...' with internal ' as '\''
proc bash_single_quote {s} {
    return "'[string map [list ' "'\\''"] $s]'"
}

proc load_config {} {
    global config_file env setup_script virtuoso_cmd
    if {[file readable $config_file]} {
        uplevel #0 [list source $config_file]
    }
}

proc save_config {} {
    global config_file config_dir env setup_script virtuoso_cmd
    if {[catch {
        file mkdir $config_dir
        set fd [open $config_file w]
        puts $fd {# Written by virtuoso_launcher.tcl — edit or delete to reset.}
        puts $fd [list set env(CDSROOT) $env(CDSROOT)]
        puts $fd [list set env(REF_BASE_LIB) $env(REF_BASE_LIB)]
        puts $fd [list set setup_script $setup_script]
        puts $fd [list set virtuoso_cmd $virtuoso_cmd]
        close $fd
    } err]} {
        tk_messageBox -icon error -title "Save failed" -message $err
    }
}

load_config

wm title . "Virtuoso launcher (wish)"
wm minsize . 520 0

label .l0 -text "Set reference base library and Cadence env, then launch Virtuoso."
label .l1 -text "Reference base library (REF_BASE_LIB):"
entry .e1 -textvariable env(REF_BASE_LIB) -width 64

label .l2 -text "CDSROOT:"
entry .e2 -textvariable env(CDSROOT) -width 64

label .l3 -text "Setup script to source (optional, bash-compatible):"
entry .e3 -textvariable setup_script -width 64

label .l4 -text "Virtuoso command (e.g. virtuoso or virtuoso -64; spaces ok if quoted in shell):"
entry .e4 -textvariable virtuoso_cmd -width 64

frame .fb
button .fb.b1 -text "Launch Virtuoso" -command launch_virtuoso
button .fb.b2 -text "Save settings" -command save_config
button .fb.b3 -text "Quit" -command exit
pack .fb.b1 .fb.b2 .fb.b3 -side left -padx 4

label .hint -text "Config: ~/.config/gitgiggle/virtuoso_launcher.rc"

pack .l0 -fill x -padx 8 -pady 4
pack .l1 .e1 .l2 .e2 .l3 .e3 .l4 .e4 -fill x -padx 8 -pady 2
pack .fb -fill x -pady 8
pack .hint -fill x -padx 8 -pady 4

proc launch_virtuoso {} {
    global env setup_script virtuoso_cmd

    set ref [string trim $env(REF_BASE_LIB)]
    set cds [string trim $env(CDSROOT)]

    if {![file isdirectory $cds]} {
        tk_messageBox -icon error -title "CDSROOT" -message "Not a directory:\n$cds"
        return
    }
    if {$ref ne "" && ![file isdirectory $ref]} {
        tk_messageBox -icon error -title "REF_BASE_LIB" -message "Not a directory:\n$ref"
        return
    }
    if {$setup_script ne "" && ![file readable $setup_script]} {
        tk_messageBox -icon error -title "Setup script" -message "Not readable:\n$setup_script"
        return
    }
    if {[string trim $virtuoso_cmd] eq ""} {
        tk_messageBox -icon error -title "Command" -message "Virtuoso command is empty."
        return
    }

    set qcds [bash_single_quote $cds]
    set qref [bash_single_quote $ref]
    set qsetup [bash_single_quote $setup_script]

    set lines [list \
        "#!/usr/bin/env bash" \
        "set -e" \
        "export CDSROOT=$qcds" \
        "export REF_BASE_LIB=$qref" \
    ]
    lappend lines {if [ -d "$CDSROOT/tools/bin" ]; then export PATH="$CDSROOT/tools/bin:$PATH"; fi}
    lappend lines {if [ -d "$CDSROOT/tools/dfII/bin" ]; then export PATH="$CDSROOT/tools/dfII/bin:$PATH"; fi}

    if {$setup_script ne ""} {
        lappend lines "source $qsetup"
    }
    lappend lines "exec $virtuoso_cmd"

    set bash_body [join $lines "\n"]

    set tmppath [write_temp_bash $bash_body]

    if {[catch {
        exec bash $tmppath >@stdout 2>@stderr &
    } err]} {
        file delete -force $tmppath
        tk_messageBox -icon error -title "Launch failed" -message $err
        return
    }
    after 2000 [list file delete -force $tmppath]
}

# Tcl 8.5-friendly temp file (avoid file tempfile, added in 8.6)
proc write_temp_bash {body} {
    set dir /tmp
    if {[info exists ::env(TMPDIR)] && [file isdirectory $::env(TMPDIR)]} {
        set dir $::env(TMPDIR)
    }
    set p [file join $dir gitgiggle_virtuoso_[pid]_[clock clicks -milliseconds].sh]
    set fd [open $p w]
    puts $fd $body
    close $fd
    file attributes $p -permissions 0700
    return $p
}
