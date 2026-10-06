/* Shared behavior for the SpriteDex prototype. */
$(function () {
    const $searchResults = $("#search-results");

    // other pages load this shared file but do not have search results to render.
    if ($searchResults.length === 0) {
        return;
    }

    const query = new URLSearchParams(window.location.search).get("q") || "";
    $("#site-search-q").val(query);

    // simulated search  requires the exact phrase
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

    // Prototype preview data. Other Sprites use Default until more variants are modeled.
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
