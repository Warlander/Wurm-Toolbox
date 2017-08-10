// <editor-fold desc="Setup and general functions">

$(document).ready(function() {
    window.onhashchange = toggleTab;
    toggleTab();
});

function toggleTab() {
    var currentHash = location.hash;
    var idName = currentHash.replace("#", "");
    $(".tab-container").css("display", "none");
    if ($(".tab-container[id*='" + idName +"']").length !== 0) {
        $(".tab-container[id*='" + idName +"']").css("display", "block");
    }
    else {
        $("#about-tab").css("display", "block");
    }
}

// </editor-fold>

// <editor-fold desc="Deed Calculator">

$(document).ready(function() {
    $("#deed-calc-tab input").on("input", updateDeedInfo);
});

function updateDeedInfo(event) {
    var source = event.target || event.srcElement;
    console.log(source);
}

// </editor-fold>