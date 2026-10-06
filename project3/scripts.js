/* Shared behavior for the SpriteDex prototype. */
$(function () {
    const $searchResults = $("#search-results");

    // Other pages load this shared file but do not have search results to render.
    if ($searchResults.length === 0) {
        return;
    }

    const query = new URLSearchParams(window.location.search).get("q") || "";
    $("#site-search-q").val(query);

    // Simulated search requires the exact, case-sensitive phrase.
    if (query === "adventure sprite") {
        $("#search-summary").text('1 result for “adventure sprite”.');
        $searchResults.prop("hidden", false);
        $("#search-empty").prop("hidden", true);
    } else {
        // Use text(), not HTML, so submitted text is never interpreted as markup.
        $("#search-summary").text(query ? 'No results for “' + query + '”.' : "No search phrase entered.");
        $searchResults.prop("hidden", true);
        $("#search-empty").prop("hidden", false);
    }
});

// Initialize separately so the search page's early return does not skip this interaction.
$(function () {
    const $spriteSelect = $(".add-form #sprite");
    if ($spriteSelect.length === 0) {
        return;
    }

    // Prototype preview data for all six Sprites and their named variants.
    const sprites = {
        adventure: {
            name: "Adventure Sprite",
            rarity: "Rare",
            description: "Upgrades a random item in the player's inventory with each Level Up!",
            variants: ["Gold", "Cheat Master", "Loot Hacker", "Bounty Hunter"]
        },
        tails: {
            name: "Tails Sprite",
            rarity: "Epic",
            description: "(Active - Jump In Air) Hover with the help of Tails! Hover speed increased with each Level Up!",
            variants: ["Gold", "Cheat Master", "Loot Hacker", "Bounty Hunter"]
        },
        jonesy: {
            name: "Jonesy Sprite",
            rarity: "Rare",
            description: "Recover some health or shields after being damaged after a short duration. Increase amount healed with each Level Up!",
            variants: ["Gold", "Cheat Master", "Loot Hacker", "Bounty Hunter"]
        },
        bush: {
            name: "Bush Sprite",
            rarity: "Rare",
            description: "Grants a bush on you after a duration, gain a bush on elimination at max level. Time between bush activating decreases with each Level Up!",
            variants: ["Gold", "Cheat Master", "Loot Hacker", "Bounty Hunter"]
        },
        shadow: {
            name: "Shadow Sprite",
            rarity: "Epic",
            description: "Automatically reload unequipped weapons over time. Reloads equipped weapon at max level. Automatic reload gets faster with each Level Up!",
            variants: ["Gold", "Cheat Master", "Loot Hacker", "Bounty Hunter"]
        },
        sonic: {
            name: "Sonic Sprite",
            rarity: "Epic",
            description: "Gotta Go Fast! Sprint faster with each Level Up!",
            variants: ["Gold", "Cheat Master", "Loot Hacker", "Bounty Hunter"]
        }
    };

    // An initially empty live region announces each newly generated message.
    $("<div>", { class: "preview-status", role: "status", "aria-atomic": "true" })
        .appendTo($spriteSelect.closest(".add-form").siblings(".sprite-preview"));

    function updatePreview(announce) {
        const spriteId = $(this).val();
        if (!Object.prototype.hasOwnProperty.call(sprites, spriteId)) {
            return;
        }
        const sprite = sprites[spriteId];

        // Traverse from the changed select to its form, then to the sibling preview.
        const $form = $(this).closest(".add-form");
        const $preview = $form.siblings(".sprite-preview");
        $preview.find(".sprite-portrait").attr({
            src: "assets/" + spriteId + ".webp",
            alt: sprite.name
        });
        $preview.find(".preview-name").text(sprite.name);
        $preview.find(".preview-rarity").text(sprite.rarity);
        $preview.find(".preview-season").text("Chapter 7 Season 4");
        $preview.find(".preview-description").text(sprite.description);

        const $variants = $preview.find(".preview-variants").empty();
        const previewVariants = sprite.variants.length ? sprite.variants : ["Default"];
        previewVariants.forEach(function (variant) {
            $("<li>").text(variant).appendTo($variants);
        });

        // Keep the form's variant choices consistent with the selected Sprite.
        const $variantSelect = $form.find("#variant");
        const previousVariant = $variantSelect.val();
        $variantSelect.empty();
        ["Default"].concat(sprite.variants).forEach(function (variant) {
            const value = variant.toLowerCase().replace(/ /g, "-");
            $("<option>", { value: value, text: variant }).appendTo($variantSelect);
        });
        $variantSelect.val(announce ? "default" : previousVariant);
        if ($variantSelect.val() === null) {
            $variantSelect.val("default");
        }

        if (announce) {
            // Replace the last message with a new element to avoid a growing log.
            const $status = $preview.find(".preview-status").empty();
            $("<p>", { class: "preview-message" })
                .text("Preview updated for " + sprite.name + ".")
                .appendTo($status);
        }
    }

    $spriteSelect.on("change", function () {
        updatePreview.call(this, true);
    });

    // Respect a selection restored by the browser on page load.
    $spriteSelect.each(function () {
        updatePreview.call(this, false);
    });
});

$(function () {
    const $grid = $(".collection-grid");
    const $dashboard = $(".dashboard");
    if ($grid.length === 0 && $dashboard.length === 0) {
        return;
    }

    // Both pages share progress in this browser; no server or account is required.
    const storageKey = "spritedex.collection.v1";
    const initialProgress = { adventure: 100, tails: 100, bush: 100, jonesy: 60, shadow: 50, sonic: 40 };
    let collection = {};
    let storageAvailable = true;

    function loadCollection() {
        let saved = {};
        try {
            saved = storageAvailable ? JSON.parse(window.localStorage.getItem(storageKey)) || {} : collection;
        } catch (error) {
            // Keep the current page usable when storage is unavailable or invalid.
            saved = collection;
        }
        Object.keys(initialProgress).forEach(function (id) {
            const entry = saved[id];
            const valid = entry && Number.isFinite(entry.progress) && entry.progress >= 0 && entry.progress <= 100
                && Number.isFinite(entry.previousProgress) && entry.previousProgress >= 0 && entry.previousProgress < 100;
            collection[id] = valid ? { progress: entry.progress, previousProgress: entry.previousProgress }
                : { progress: initialProgress[id], previousProgress: initialProgress[id] === 100 ? 0 : initialProgress[id] };
        });
    }

    function renderCollection() {
        const total = Object.keys(collection).length;
        const masteredCount = Object.values(collection).filter(function (entry) {
            return entry.progress === 100;
        }).length;
        $grid.find(".sprite-card").each(function () {
            const $card = $(this);
            const entry = collection[$card.attr("data-sprite")];
            if (!entry) {
                return;
            }
            const progress = entry.progress;
            $card.find(".collection-mastery-checkbox").prop("checked", progress === 100);
            $card.find(".mastery-progress progress").val(progress).text(progress + "%")
                .attr("aria-label", $card.find("h2").text() + " mastery: " + progress + "%");
            $card.find(".mastery-progress span").text(progress + "%");
            $card.find(".collection-status-tag").text(progress === 100 ? "Mastered" : "In Progress");
        });
        $grid.closest(".collection").find(".mastered-count").text(masteredCount + " / " + total);
        $dashboard.find(".dashboard-mastered-count").text(masteredCount);
        $dashboard.find(".dashboard-mastered-label").text("Mastered (" + masteredCount + ")");
        $dashboard.find(".status-owned").css("flex-grow", total - masteredCount);
        $dashboard.find(".status-mastered").css("flex-grow", masteredCount);
        $dashboard.find(".status-bar").attr("aria-label", total + " Sprites: " + (total - masteredCount)
            + " owned but not mastered, " + masteredCount + " mastered, and 0 not owned.");
    }

    function refreshCollection() {
        loadCollection();
        renderCollection();
    }

    refreshCollection();
    // Refresh after Back/Forward navigation and changes made in another open tab.
    $(window).on("pageshow", refreshCollection).on("storage", function (event) {
        if (event.originalEvent.key === storageKey || event.originalEvent.key === null) {
            refreshCollection();
        }
    });
    if ($grid.length === 0) {
        return;
    }

    const $activity = $("<section>", {
        class: "collection-activity",
        "aria-labelledby": "collection-activity-title"
    }).insertAfter($grid);
    $("<h2>", { id: "collection-activity-title", text: "Collection Activity" }).appendTo($activity);
    const $emptyActivity = $("<p>")
        .text("Check or uncheck Mastered to update a Sprite and your dashboard.")
        .appendTo($activity);
    const $activityLog = $("<ul>", {
        class: "collection-activity-log",
        role: "log",
        "aria-labelledby": "collection-activity-title",
        "aria-relevant": "additions"
    }).appendTo($activity);

    // One delegated click handler also handles cards added to the grid later.
    $grid.on("click", ".collection-mastery-checkbox", function () {
        const $checkbox = $(this);
        const mastered = this.checked;
        const $card = $checkbox.closest(".sprite-card");
        const spriteName = $card.find("h2").text();
        // Read the latest saved values before updating this Sprite.
        loadCollection();
        const entry = collection[$card.attr("data-sprite")];
        if (!entry) {
            return;
        }

        // Remember partial progress so unchecking can undo marking a Sprite mastered.
        if (mastered) {
            if (entry.progress < 100) {
                entry.previousProgress = entry.progress;
            }
        }
        const progress = mastered ? 100 : entry.previousProgress;
        entry.progress = progress;
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(collection));
        } catch (error) {
            storageAvailable = false;
            $("<li>").text("Your browser could not save this change. It will only apply on this page.")
                .appendTo($activityLog);
        }
        renderCollection();

        $emptyActivity.prop("hidden", true);
        const message = mastered ? "You mastered " + spriteName + "."
            : "You marked " + spriteName + " as in progress.";
        $("<li>").text(message + " Mastery is now " + progress + "%.")
            .appendTo($activityLog);
    });
});
