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
};

var DeedCalculator;
(function(DeedCalculator, $, undefined) {
    
    var haveSavedValues = false;
    var savedDeedWidth;
    var savedDeedHeight;
    var savedDeedArea;
    var savedPerimeterWidth;
    var savedPerimeterHeight;
    var savedTotalArea;
    var savedCreationCost;
    var savedUpkeepCost;
    
    function currencyToString(amount) {
        var toReturn = "";
        if (amount < 0) {
            toReturn += "-";
            amount = -amount;
        }
        
        var irons = amount % 100;
        amount = Math.floor(amount / 100);
        var coppers = amount % 100;
        amount = Math.floor(amount / 100);
        var silvers = amount % 100;
        var golds = Math.floor(amount / 100);
        
        if (golds > 0) {
            toReturn += golds + "g ";
        }
        if (silvers > 0) {
            toReturn += silvers + "s ";
        }
        if (coppers > 0) {
            toReturn += coppers + "c ";
        }
        if (irons > 0) {
            toReturn += irons + "i";
        }
        
        if (toReturn.length === 0) {
            return "none";
        }
        return toReturn.trim();
    }
    
    DeedCalculator.updateDeedInfo = function(event) {
        const FREEDOM_SERVER = "Freedom";
        const EPIC_SERVER = "Epic";
        
        const COPPER_COIN = 100;
        const SILVER_COIN = 10000;
        const GOLD_COIN = 1000000;
        
        const FREE_PERIMETER_SIZE = 5;
        
        const DEED_TILE_CREATION_COST = 100;
        const DEED_TILE_UPKEEP_COST = 20;
        const PERIMETER_TILE_CREATION_COST = 50;
        const PERIMETER_TILE_UPKEEP_COST = 5;
        const GUARD_FREEDOM_CREATION_COST = 2 * SILVER_COIN;
        const GUARD_FREEDOM_UPKEEP_COST = 1 * SILVER_COIN;
        const GUARD_EPIC_CREATION_COST = 3 * SILVER_COIN;
        const GUARD_EPIC_UPKEEP_COST = 3 * SILVER_COIN;
        
        const TILES_PER_ANIMAL = 15;
        const TILES_PER_GUARD = 49;
        const MAX_EPIC_GUARDS = 20;
        
        var source = event !== null ? (event.target || event.srcElement) : null;
        var saveInfo = source && source.id === "saveDeedButton";
        
        var errors = [];
        
        var server = $("input:radio[name='serverRadioGroup']:checked").val();
        var isEpic = server === EPIC_SERVER;
        var west = Number($("#westInput").val());
        var east = Number($("#eastInput").val());
        var north = Number($("#northInput").val());
        var south = Number($("#southInput").val());
        var perimeter = Number($("#perimeterInput").val());
        var guards = Number($("#guardsInput").val());
        
        var deedWidth = west + east + 1;
        var deedHeight = north + south + 1;
        var deedArea = deedWidth * deedHeight;
        
        if (deedWidth > deedHeight * 4 || deedHeight > deedWidth * 4) {
            errors.push("Deed width cannot be more than 4 times bigger/smaller than height");
        }
        
        var perimeterWidth = deedWidth + perimeter * 2;
        var perimeterHeight = deedHeight + perimeter * 2;
        var totalArea = perimeterWidth * perimeterHeight;
        var perimeterArea = totalArea - deedArea;
        
        var freePerimeterWidth = deedWidth + FREE_PERIMETER_SIZE * 2;
        var freePerimeterHeight = deedHeight + FREE_PERIMETER_SIZE * 2;
        var totalFreeArea = freePerimeterWidth * freePerimeterHeight;
        var freePerimeterArea = totalFreeArea - deedArea;
        
        var paidPerimeterArea = perimeterArea - freePerimeterArea;
        
        var maxAnimals = Math.floor(deedArea / TILES_PER_ANIMAL);
        var maxGuards = Math.floor(deedArea / TILES_PER_GUARD);
        if (isEpic) {
            maxGuards = Math.min(maxGuards, MAX_EPIC_GUARDS);
        }
        if (guards > maxGuards) {
            if (isEpic && guards > MAX_EPIC_GUARDS) {
                errors.push("Epic deed cannot have more than " + MAX_EPIC_GUARDS + " guards");
            }
            else {
                errors.push("Deed is too small for specified number of guards");
            }
        }
        
        var deedAreaCreationCost = deedArea * DEED_TILE_CREATION_COST;
        var deedAreaUpkeepCost = deedArea * DEED_TILE_UPKEEP_COST;
        var perimeterAreaCreationCost = paidPerimeterArea * PERIMETER_TILE_CREATION_COST;
        var perimeterAreaUpkeepCost = paidPerimeterArea * PERIMETER_TILE_UPKEEP_COST;
        var guardsCreationCost;
        if (isEpic) {
            guardsCreationCost = guards * GUARD_EPIC_CREATION_COST;
        }
        else {
            guardsCreationCost = guards * GUARD_FREEDOM_CREATION_COST;
        }
        var guardsUpkeepCost;
        if (isEpic) {
            guardsUpkeepCost = guards * GUARD_EPIC_UPKEEP_COST;
        }
        else {
            guardsUpkeepCost = guards * GUARD_EPIC_CREATION_COST;
        }
        
        var totalCreationCost = deedAreaCreationCost + perimeterAreaCreationCost + guardsCreationCost;
        var totalUpkeepCost = deedAreaUpkeepCost + perimeterAreaUpkeepCost + guardsUpkeepCost;
        totalUpkeepCost = Math.max(totalUpkeepCost, SILVER_COIN);
        
        if (saveInfo) {
            haveSavedValues = true;
            savedDeedWidth = deedWidth;
            savedDeedHeight = deedHeight;
            savedDeedArea = deedArea;
            savedPerimeterWidth = perimeterWidth;
            savedPerimeterHeight = perimeterHeight;
            savedTotalArea = totalArea;
            savedCreationCost = totalCreationCost;
            savedUpkeepCost = totalUpkeepCost;
        }
        
        var infoString = "";
        infoString += "Total deed size: " + deedWidth + "X" + deedHeight + "  (" + deedArea + " tiles)<br/>";
        infoString += "Including perimeter: " + perimeterWidth + "X" + perimeterHeight + " (" + totalArea + " tiles)<br/>";
        infoString += "Total creation cost: " + currencyToString(totalCreationCost) + "<br/>";
        infoString += "Total upkeep cost: " + currencyToString(totalUpkeepCost) + "<br/>";
        infoString += "Max animals: " + maxAnimals + "<br/>";
        infoString += "Max guards: " + maxGuards + "<br/>";
        
        if (haveSavedValues) {
            infoString += "<br/>"
            infoString += "Saved deed size: " + savedDeedWidth + "X" + savedDeedHeight + "  (" + savedDeedArea + " tiles)<br/>";
            infoString += "Including perimeter: " + savedPerimeterWidth + "X" + savedPerimeterHeight + " (" + savedTotalArea + " tiles)<br/>";
            infoString += "Saved creation cost: " + currencyToString(savedCreationCost) + "<br/>";
            infoString += "Saved upkeep cost: " + currencyToString(savedUpkeepCost) + "<br/>";
            
            var creationCostDiff = totalCreationCost - savedCreationCost;
            var upkeepCostDiff = totalUpkeepCost - savedUpkeepCost;
            if (creationCostDiff < 0) {
                errors.push("There are <b>no refunds</b> for downsizing the deed");
            }
            
            infoString += "Difference in creation cost: " + currencyToString(creationCostDiff) + "<br/>";
            infoString += "Difference in upkeep cost: " + currencyToString(upkeepCostDiff);
        }
        
        $("#deedCalcInfo").html(infoString);
        
        if (errors.length === 0) {
            $("#deedCalcErrors").slideUp();
        }
        else {
            var errorsString = "";
            for (var i = 0; i < errors.length - 1; i++) {
                errorsString += errors[i] + "<br/>";
            }
            errorsString += errors[errors.length - 1];
            $("#deedCalcErrors").html(errorsString);
            $("#deedCalcErrors").slideDown();
        }
    };
    
}(window.DeedCalculator = window.DeedCalculator || {}, jQuery));

$(document).ready(function() {
    DeedCalculator.updateDeedInfo(null);
    $("#deed-calc-tab input[type!='button']").on("input", DeedCalculator.updateDeedInfo);
    $("#deed-calc-tab input[type='button']").on("click", DeedCalculator.updateDeedInfo);
});

