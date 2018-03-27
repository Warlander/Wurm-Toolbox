var currentTab;

$(document).ready(function() {
    window.onhashchange = toggleTab;
    toggleTab();
});

function toggleTab() {
    var currentHash = location.hash;
    var idName = currentHash.replace("#", "");
    if (idName === "") {
        idName = "about-tab";
    }
    
    if (currentTab === idName) {
        return;
    }
    
    if (!currentTab) {
        $(".tab-container").hide();
        if ($(".tab-container[id*='" + idName +"']").length !== 0) {
            $(".tab-container[id*='" + idName +"']").show();
        }
        else {
            $("#about-tab").show();
            idName = "about-tab";
        }
    }
    else {
        $(".tab-container").slideUp();
        if ($(".tab-container[id*='" + idName +"']").length !== 0) {
            $(".tab-container[id*='" + idName +"']").slideDown();
        }
        else {
            $("#about-tab").slideDown();
        }
    }
    
    currentTab = idName;
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
    
    DeedCalculator.update = function(event) {
        const FREEDOM_SERVER = "Freedom";
        const EPIC_SERVER = "Epic";
        
        const IRON_COIN = 1;
        const COPPER_COIN = 100;
        const SILVER_COIN = 10000;
        const GOLD_COIN = 1000000;
        
        const FREE_PERIMETER_SIZE = 5;
        
        const DEED_TILE_CREATION_COST = 1 * COPPER_COIN;
        const DEED_TILE_UPKEEP_COST = 20 * IRON_COIN;
        const PERIMETER_TILE_CREATION_COST = 50 * IRON_COIN;
        const PERIMETER_TILE_UPKEEP_COST = 5 * IRON_COIN;
        const GUARD_FREEDOM_CREATION_COST = 2 * SILVER_COIN;
        const GUARD_FREEDOM_UPKEEP_COST = 1 * SILVER_COIN;
        const GUARD_EPIC_BASE_COST = 1 * SILVER_COIN;
        const GUARD_EPIC_INCREMENT_COST = 50 * COPPER_COIN;
        
        const TILES_PER_ANIMAL = 15;
        const TILES_PER_GUARD = 49;
        const MAX_EPIC_GUARDS = 20;
        
        var source = event !== null ? (event.target || event.srcElement) : null;
        var saveInfo = source && source.id === "deedCalcSaveDeedButton";
        
        var errors = [];
        
        var server = $("input:radio[name='deedCalcServerRadioGroup']:checked").val();
        var isEpic = server === EPIC_SERVER;
        var west = Number($("#deedCalcWestInput").val());
        var east = Number($("#deedCalcEastInput").val());
        var north = Number($("#deedCalcNorthInput").val());
        var south = Number($("#deedCalcSouthInput").val());
        var perimeter = Number($("#deedCalcPerimeterInput").val());
        var guards = Number($("#deedCalcGuardsInput").val());
        
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
            guardsCreationCost = 0;
            for (i = 0; i < guards; i++) {
                guardsCreationCost += GUARD_EPIC_BASE_COST;
                guardsCreationCost += GUARD_EPIC_INCREMENT_COST * i;
            }
        }
        else {
            guardsCreationCost = guards * GUARD_FREEDOM_CREATION_COST;
        }
        var guardsUpkeepCost;
        if (isEpic) {
            guardsUpkeepCost = 0;
            for (i = 0; i < guards; i++) {
                guardsUpkeepCost += GUARD_EPIC_BASE_COST;
                guardsUpkeepCost += GUARD_EPIC_INCREMENT_COST * i;
            }
        }
        else {
            guardsUpkeepCost = guards * GUARD_FREEDOM_UPKEEP_COST;
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
            infoString += "<br/>";
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
    DeedCalculator.update(null);
    $("#deed-calc-tab input[type!='button']").on("input", DeedCalculator.update);
    $("#deed-calc-tab input[type='button']").on("click", DeedCalculator.update);
    $("#deed-calc-tab input[type='radio']").on("click", DeedCalculator.update);
});

var FavorCalculator;
(function(FavorCalculator, $, undefined) {
    
    function timeToString(inputSeconds) {
        var seconds = inputSeconds % 60;
        inputSeconds = Math.floor(inputSeconds / 60);
        var minutes = inputSeconds % 60;
        var hours = Math.floor(inputSeconds / 60);
        
        var timeString = seconds + " seconds";
        if (minutes > 0 || hours > 0) {
            timeString = minutes + " minutes, " + timeString;
        }
        if (hours > 0) {
            timeString = hours + " hours, " + timeString;
        }
        
        return timeString;
    }
    
    function calculateSecondsToFavor(favor) {
        return (favor * favor) * 1.5;
    }
    
    FavorCalculator.update = function(event) {
        var currentFavor = Number($("#favorCalcCurrentInput").val());
        var targetFavor = Number($("#favorCalcTargetInput").val());
        var actionsPenalty = $("#favorCalcActionsPenaltyCheckbox").is(":checked");
        
        if (currentFavor > targetFavor) {
            $("#favorCalcInfo").removeClass("alert-info");
            $("#favorCalcInfo").addClass("alert-danger");
            $("#favorCalcInfo").html("Target favor must be higher than current favor");
            return;
        }
        
        var requiredSeconds = calculateSecondsToFavor(targetFavor) - calculateSecondsToFavor(currentFavor);
        if (actionsPenalty) {
            requiredSeconds *= 2;
        }
        
        requiredSeconds = Math.floor(requiredSeconds / 10) * 10;
        var timeString = timeToString(requiredSeconds);
        
        $("#favorCalcInfo").removeClass("alert-danger");
        $("#favorCalcInfo").addClass("alert-info");
        $("#favorCalcInfo").html("Time needed: " + timeString);
    };
    
}(window.FavorCalculator = window.FavorCalculator || {}, jQuery));

$(document).ready(function() {
    FavorCalculator.update(null);
    $("#favor-calc-tab").on("input", FavorCalculator.update);
    $("#favor-calc-tab input[type='checkbox']").on("click", FavorCalculator.update);
});

var ArmorCalculator;
(function(ArmorCalculator, $, undefined) {
    
    ArmorCalculator.rarityTypes = {
        "Normal": 1,
        "Rare": 1.03,
        "Supreme": 1.06,
        "Fantastic": 1.09
    };
    
    ArmorCalculator.modifierTypes = ["base", "bite", "crush", "pierce", "slash", "burn", "cold", "acid", "infection", "internal", "poison"];
    
    ArmorCalculator.metalTypeReduction = {
        "Iron": 0,
        "Steel": 0.025,
        "Bronze": 0.01,
        "Brass": 0.01,
        "Adamantine": 0.05,
        "Glimmersteel": 0.05,
        "Seryll": 0.05,
        "Copper": -0.01,
        "Gold": -0.01,
        "Lead": -0.025,
        "Silver": -0.0075,
        "Tin": -0.0175,
        "Zinc": -0.02
    };
    
    ArmorCalculator.armorTypes = {
        "Cloth": {
            "baseReduction": 0.35,
            "materialReduction": 0,
            "reductionModifier": {
                "base": 1,
                "bite": 0.9,
                "crush": 1.15,
                "pierce": 1,
                "slash": 0.8,
                "burn": 0.9,
                "cold": 1.25,
                "acid": 1,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.3,
                "crush": 0.5,
                "pierce": 0.35,
                "slash": 0.35,
                "burn": 0.1,
                "cold": 0.6,
                "acid": 0.6,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Leather": {
            "baseReduction": 0.45,
            "materialReduction": 0,
            "reductionModifier": {
                "base": 1,
                "bite": 0.95,
                "crush": 1,
                "pierce": 0.9,
                "slash": 1.1,
                "burn": 1.15,
                "cold": 1,
                "acid": 0.9,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.3,
                "crush": 0.5,
                "pierce": 0.3,
                "slash": 0.3,
                "burn": 0.1,
                "cold": 0.6,
                "acid": 0.2,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Studded leather": {
            "baseReduction": 0.5,
            "materialReduction": 0,
            "reductionModifier": {
                "base": 1,
                "bite": 1.05,
                "crush": 1,
                "pierce": 1.1,
                "slash": 0.9,
                "burn": 1,
                "cold": 0.9,
                "acid": 1.05,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.45,
                "crush": 0.6,
                "pierce": 0.25,
                "slash": 0.25,
                "burn": 0.1,
                "cold": 0.6,
                "acid": 0.2,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Chain": {
            "baseReduction": 0.55,
            "materialReduction": 0,
            "reductionModifier": {
                "base": 1,
                "bite": 1.05,
                "crush": 1.1,
                "pierce": 0.9,
                "slash": 1,
                "burn": 1.05,
                "cold": 0.9,
                "acid": 1,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.6,
                "crush": 0.25,
                "pierce": 0.25,
                "slash": 0.6,
                "burn": 0.6,
                "cold": 0.1,
                "acid": 0.2,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Steel chain": {
            "baseReduction": 0.57,
            "materialReduction": 0,
            "reductionModifier": {
                "base": 1,
                "bite": 1.05,
                "crush": 1.1,
                "pierce": 0.9,
                "slash": 1,
                "burn": 1.05,
                "cold": 0.9,
                "acid": 1,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.6,
                "crush": 0.25,
                "pierce": 0.25,
                "slash": 0.6,
                "burn": 0.6,
                "cold": 0.1,
                "acid": 0.2,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Adamantine chain": {
            "baseReduction": 0.55,
            "materialReduction": 0.05,
            "reductionModifier": {
                "base": 1,
                "bite": 1.05,
                "crush": 1.1,
                "pierce": 0.9,
                "slash": 1,
                "burn": 1.05,
                "cold": 0.9,
                "acid": 1,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.6,
                "crush": 0.25,
                "pierce": 0.25,
                "slash": 0.6,
                "burn": 0.6,
                "cold": 0.1,
                "acid": 0.2,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Glimmersteel chain": {
            "baseReduction": 0.55,
            "materialReduction": 0.1,
            "reductionModifier": {
                "base": 1,
                "bite": 1.05,
                "crush": 1.1,
                "pierce": 0.9,
                "slash": 1,
                "burn": 1.05,
                "cold": 0.9,
                "acid": 1,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.6,
                "crush": 0.25,
                "pierce": 0.25,
                "slash": 0.6,
                "burn": 0.6,
                "cold": 0.1,
                "acid": 0.2,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Seryll chain": {
            "baseReduction": 0.55,
            "materialReduction": 0.1,
            "reductionModifier": {
                "base": 1,
                "bite": 1.05,
                "crush": 1.1,
                "pierce": 0.9,
                "slash": 1,
                "burn": 1.05,
                "cold": 0.9,
                "acid": 1,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.6,
                "crush": 0.25,
                "pierce": 0.25,
                "slash": 0.6,
                "burn": 0.6,
                "cold": 0.1,
                "acid": 0.2,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Iron plate": {
            "baseReduction": 0.63,
            "materialReduction": 0,
            "reductionModifier": {
                "base": 1,
                "bite": 1.075,
                "crush": 0.85,
                "pierce": 1,
                "slash": 1.05,
                "burn": 0.95,
                "cold": 1,
                "acid": 1.075,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.45,
                "crush": 0.25,
                "pierce": 0.6,
                "slash": 0.25,
                "burn": 0.3,
                "cold": 0.3,
                "acid": 0.3,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Steel plate": {
            "baseReduction": 0.65,
            "materialReduction": 0,
            "reductionModifier": {
                "base": 1,
                "bite": 1.075,
                "crush": 0.85,
                "pierce": 1,
                "slash": 1.05,
                "burn": 0.95,
                "cold": 1,
                "acid": 1.075,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.45,
                "crush": 0.25,
                "pierce": 0.6,
                "slash": 0.25,
                "burn": 0.3,
                "cold": 0.3,
                "acid": 0.3,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Adamantine plate": {
            "baseReduction": 0.65,
            "materialReduction": 0.05,
            "reductionModifier": {
                "base": 1,
                "bite": 1.075,
                "crush": 0.85,
                "pierce": 1,
                "slash": 1.05,
                "burn": 0.95,
                "cold": 1,
                "acid": 1.075,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.45,
                "crush": 0.25,
                "pierce": 0.6,
                "slash": 0.25,
                "burn": 0.3,
                "cold": 0.3,
                "acid": 0.3,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Glimmersteel plate": {
            "baseReduction": 0.65,
            "materialReduction": 0.1,
            "reductionModifier": {
                "base": 1,
                "bite": 1.075,
                "crush": 0.85,
                "pierce": 1,
                "slash": 1.05,
                "burn": 0.95,
                "cold": 1,
                "acid": 1.075,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.45,
                "crush": 0.25,
                "pierce": 0.6,
                "slash": 0.25,
                "burn": 0.3,
                "cold": 0.3,
                "acid": 0.3,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Seryll plate": {
            "baseReduction": 0.65,
            "materialReduction": 0.1,
            "reductionModifier": {
                "base": 1,
                "bite": 1.075,
                "crush": 0.85,
                "pierce": 1,
                "slash": 1.05,
                "burn": 0.95,
                "cold": 1,
                "acid": 1.075,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.45,
                "crush": 0.25,
                "pierce": 0.6,
                "slash": 0.25,
                "burn": 0.3,
                "cold": 0.3,
                "acid": 0.3,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Dragon leather": {
            "baseReduction": 0.65,
            "materialReduction": 0,
            "reductionModifier": {
                "base": 1,
                "bite": 1,
                "crush": 1.1,
                "pierce": 1,
                "slash": 0.9,
                "burn": 1,
                "cold": 1.05,
                "acid": 0.95,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.5,
                "crush": 0.5,
                "pierce": 0.2,
                "slash": 0.5,
                "burn": 0.3,
                "cold": 0.5,
                "acid": 0.3,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        },
        "Dragon scale": {
            "baseReduction": 0.7,
            "materialReduction": 0,
            "reductionModifier": {
                "base": 1,
                "bite": 1,
                "crush": 0.95,
                "pierce": 1.1,
                "slash": 1,
                "burn": 1.1,
                "cold": 0.95,
                "acid": 1,
                "infection": 1,
                "internal": 1,
                "poison": 1
            },
            "blockChance": {
                "base": 0,
                "bite": 0.4,
                "crush": 0.5,
                "pierce": 0.6,
                "slash": 0.2,
                "burn": 0.5,
                "cold": 0.2,
                "acid": 0.2,
                "infection": 0,
                "internal": 0,
                "poison": 0
            }
        }
    };
    
    function calculateQualityModifier(normalizedQuality) {
        return Math.max(0.05, 1 - (1 - normalizedQuality) * (1 - normalizedQuality));
    }
    
    ArmorCalculator.update = function() {
        const baseReduction = 0.05;
        const baseBlock = 0.05;
        
        var includeBlockChance = $("#armorCalcBlockCheckbox").is(":checked");
        
        var armorTypeString = $("#armorCalcSelect").val();
        var armorType = ArmorCalculator.armorTypes[armorTypeString];
        var armorBaseReduction = armorType["baseReduction"];
        var armorMaterialReduction = armorType["materialReduction"];
        var reductionModifiers = armorType["reductionModifier"];
        var blockChances = armorType["blockChance"];
        
        var rarityModifier = Number($("#armorCalcRarity").val());
        var quality = Number($("#armorCalcQuality").val());
        var normalizedQuality = quality / 100;
        var qualityModifier = calculateQualityModifier(normalizedQuality);
        
        var tableRows = $("#armorCalcTable > tbody > tr");
        $.each(tableRows, function(key, value) {
            var type = $(value).find("td")[0].innerHTML.toLowerCase();
            var reductionModifier = reductionModifiers[type];
            var blockChance = blockChances[type];
            
            var totalReduction = armorBaseReduction;
            totalReduction *= reductionModifier;
            totalReduction += armorMaterialReduction;
            totalReduction *= rarityModifier;
            totalReduction *= qualityModifier;
            totalReduction += baseReduction;
            var totalReductionPercent = (totalReduction * 100).toFixed(2) + "%";
            
            var totalBlock = blockChance;
            totalBlock += (rarityModifier - 1);
            totalBlock *= qualityModifier;
            totalBlock += baseBlock;
            var totalBlockPercent = (totalBlock * 100).toFixed(2) + "%";
            
            var totalAbsorb = 1 - ((1 - totalReduction) * (1 - totalBlock));
            var totalAbsorbPercent = (totalAbsorb * 100).toFixed(2) + "%";
            
            $(value).find("td")[1].innerHTML = totalReductionPercent;
            $(value).find("td")[2].innerHTML = totalBlockPercent;
            $(value).find("td")[3].innerHTML = totalAbsorbPercent;
        });
    };
    
}(window.ArmorCalculator = window.ArmorCalculator || {}, jQuery));

$(document).ready(function() {
    var raritySelects = $(".armorCalcRaritySelect");
    $.each(ArmorCalculator.rarityTypes, function(key, value) {
        raritySelects.append($("<option/>").val(value).text(key));
    });
    
    var armorSelects = $(".armorCalcArmorSelect");
    $.each(ArmorCalculator.armorTypes, function(key, value) {
        armorSelects.append($("<option/>").val(key).text(key));
    });
    
    $("#armor-calc-tab").on("input", ArmorCalculator.update);
    
    ArmorCalculator.update();
});