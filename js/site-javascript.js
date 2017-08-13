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

var DeedCalculator = {
    
    haveSavedValues : false,
    savedDeedWidth : 0,
    savedDeedHeight : 0,
    savedDeedArea : 0,
    savedPerimeter : 0,
    savedPerimeterArea : 0,
    
    updateDeedInfo: function(event) {
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
        console.log(source);
        
        var errors = [];
        
        var server = $("input:radio[name='serverRadioGroup']:checked").val();
        var isEpic = server === EPIC_SERVER;
        var west = $("#westInput").val();
        var east = $("#eastInput").val();
        var north = $("#northInput").val();
        var south = $("#southInput").val();
        var perimeter = $("#perimeterInput").val();
        var guards = $("#guardsInput").val();
        
        var deedWidth = west + east + 1;
        var deedHeight = north + south + 1;
        var deedArea = deedWidth * deedHeight;
        
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
    },
    
    currencyToString(amount) {
        var toReturn = "";
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
    
};

$(document).ready(function() {
    DeedCalculator.updateDeedInfo(null);
    $("#deed-calc-tab input[type!='button']").on("input", DeedCalculator.updateDeedInfo);
    $("#deed-calc-tab input[type='button']").on("click", DeedCalculator.updateDeedInfo);
});

