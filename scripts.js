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
