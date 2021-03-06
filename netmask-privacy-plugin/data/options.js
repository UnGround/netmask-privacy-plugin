var privacy_preferences = {};
//html for every preference selection
var toggle_html =  '<div class="row">';
toggle_html += '<div class="col-xs-8"><span class="qs">';
toggle_html += '<b>%NAME%</b> <a href="" onclick="return false;">  <span class="glyphicon glyphicon-question-sign" aria-hidden="true"></span></a>';
toggle_html += '<span class="popover above">';
toggle_html += '<p>%DESC%</p>';
toggle_html += '</span></span></div>';
toggle_html += '<div class="col-xs-2"> <button id=%KEY% type="button" class="btn %CLASS% ">%BUTTON_TEXT%</button>';
toggle_html += "</div></div>";

/****
replace placeholders in str with their replacements
placeholders are in the format %PLACEHOLDER_NAME%

replacements are in the format {"%NAME%":"Netmask"}
built with input from
http://stackoverflow.com/questions/7975005/format-a-string-using-placeholders-and-an-object-of-substitutions 
**/
function formatString(str, replacements) {
    str = str.replace(/%\w+%/g, function(all) {
        return all in replacements ? replacements[all] : all;
    });
    return str;
}

/***
Refreshes the HTML of the popup with all the data we want to show
**/
function display_status() {
    var options_div = document.getElementById("about-config-options");
    options_div.innerHTML = ''
    for(var pref in privacy_preferences) {
        key = pref
        current = privacy_preferences[pref]['current_value']
        suggested = privacy_preferences[pref]['suggested']
        pdefault = privacy_preferences[pref]['default'] 
        style = "btn-warning"
        button_text = "Custom Setting"
        if(pdefault == current) {
            style = "btn-danger";
            button_text = "Not Secure"
        }
        else if(suggested == current) {
            style = "btn-success";
            button_text = "Secure"
        }
        replacements = {
            "%KEY%": key,
            "%NAME%": privacy_preferences[pref]['name'],
            "%DESC%": privacy_preferences[pref]['description'],
            "%DEFAULT%": pdefault,
            "%BUTTON_TEXT%": button_text,
            "%SUGGESTED%": suggested,
            "%CLASS%": style,
        };
        options_div.innerHTML += formatString(toggle_html, replacements);
    }
    //nsole.log(options_div.innerHTML)
    addEventListeners()
}

function addEventListeners() {
    for(var pref in privacy_preferences) {
        var button = document.getElementById(pref);
        button.addEventListener("click", togglePref);
    }
}

function togglePref(e) {
    pref = e.target.id
    key = privacy_preferences[pref]['key']
    current = privacy_preferences[pref]['current_value']
    suggested = privacy_preferences[pref]['suggested']
    pdefault = privacy_preferences[pref]['default'] 

    if(current == pdefault )
        self.port.emit('set-preference', key, suggested)
    if(current == suggested )
        self.port.emit('set-preference', key, pdefault)

    update_preferences();
}

function show_preferences(preferences) {
    privacy_preferences = preferences;
    display_status();
}

/****
Request a refresh of the preference data
***/
function update_preferences() {
    self.port.emit('get-preferences');
}


//Our window is about to be shown
self.port.on("show", function onShow() {
    update_preferences();
    //set listeners on the default buttons
    var button_all = document.getElementById("set-all-suggested");
    button_all.addEventListener("click", function setall() {
        self.port.emit('set-all');
        update_preferences();
    });
    var button_reset = document.getElementById("set-all-default");
    button_reset.addEventListener("click", function setall() {
        self.port.emit('reset-all');
        update_preferences();
    });
});

self.port.on("get-preferences", show_preferences)