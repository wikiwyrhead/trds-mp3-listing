jQuery(document).ready(function ($) {
  // MP3 Upload Functionality
  var mediaUploader;

  $(".upload-mp3-button").click(function (e) {
    e.preventDefault();
    var inputField = $(this).prev("input");

    if (mediaUploader) {
      mediaUploader.open();
      return;
    }

    mediaUploader = wp.media({
      title: "Choose MP3 File",
      button: {
        text: "Choose File",
      },
      multiple: false,
      library: {
        type: "audio/mpeg",
      },
    });

    mediaUploader.on("select", function () {
      var attachment = mediaUploader.state().get("selection").first().toJSON();
      inputField.val(attachment.url);
    });

    mediaUploader.open();
  });

  // Function to bind share button events
  function bindShareButtonEvents() {
    $(".share-button")
      .off("click")
      .on("click", function () {
        var $dropdown = $(this).next(".share-dropdown");
        $(".share-dropdown").not($dropdown).hide(); // Hide other dropdowns
        $dropdown.toggle(); // Toggle the current dropdown
      });
  }

  // Bind share button events on initial load
  bindShareButtonEvents();

  // Close dropdowns when clicking outside
  $(document).on("click", function (e) {
    if (!$(e.target).closest(".share-button, .share-dropdown").length) {
      $(".share-dropdown").hide(); // Hide all dropdowns
    }
  });

  // Play Count Functionality
  $("audio.mp3-audio").on("play", function () {
    var mp3_id = $(this).data("mp3-id");
    var nonce = $(this).data("nonce");
    $.ajax({
      url: mp3_ajax_params.ajax_url,
      type: "POST",
      data: {
        action: "mp3_update_play_count",
        mp3_id: mp3_id,
        nonce: nonce,
      },
      error: function (xhr, status, error) {
        console.error("Play count update error:", status, error);
      },
    });
  });

  // Utility: Normalize string for robust search (remove accents, convert to lowercase, replace non-alphanum with space)
  function normalizeString(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\d]+/g, ' ')      // Replace non-word, non-digit chars with space (preserve numbers)
      .replace(/_/g, ' ')               // Replace underscores with space
      .replace(/\s+/g, ' ')            // Collapse whitespace
      .trim();
  }

  // Instant Search Functionality
  let searchTimeout;
  let isSearchActive = false;
  let currentSearchTerm = "";

  $(".mp3-search-input").on("input", function () {
    clearTimeout(searchTimeout);
    const searchTerm = normalizeString($(this).val());
    currentSearchTerm = searchTerm;

    searchTimeout = setTimeout(function () {
      if (searchTerm === "") {
        // Reset to normal view
        isSearchActive = false;
        // Reload the first page (reset list)
        $(".mp3-list").empty();
        $(".load-more-button").data("page", 2).show();
        loadMoreItems(false); // Load the first page
        return;
      }

      isSearchActive = true;
      // Always fetch from backend for search
      const button = $(".load-more-button");
      const posts_per_page = button.data("posts-per-page") || 10;
      const playlist_id = button.data("playlist-id") || "";
      const nonce = button.data("nonce");
      $.ajax({
        url: mp3_frontend_params.ajax_url,
        type: "POST",
        data: {
          action: "mp3_load_more_tracks_frontend",
          page: 1,
          posts_per_page: posts_per_page,
          playlist_id: playlist_id,
          nonce: nonce,
          search: searchTerm,
        },
        success: function (response) {
          var html = "";
          if (typeof response.data === "object" && response.data !== null) {
            html = response.data.html || "";
          } else if (typeof response.data === "string") {
            html = response.data;
          }
          $(".mp3-list").html(html);
          bindShareButtonEvents();
          // Flexible AND-word matching/highlighting
          if (searchTerm) {
            $(".mp3-list li").each(function () {
              const originalTitle = $(this).find(".mp3-title").text();
              const normalizedTitle = normalizeString(originalTitle);
              // Show if the normalized search term is a substring of the normalized title
              const matches = normalizedTitle.includes(searchTerm);
              $(this).toggle(matches);
              // Highlight the matching substring
              let highlighted = originalTitle;
              if (matches && searchTerm.length > 0) {
                // Find the start index of the match in the normalized string
                const start = normalizedTitle.indexOf(searchTerm);
                if (start !== -1) {
                  // Map the start/end index back to the original string
                  // (approximate, since normalization may change length)
                  // We'll highlight the first occurrence of the raw search term in the original string
                  const rawRegex = new RegExp($(".mp3-search-input").val().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                  highlighted = originalTitle.replace(rawRegex, '<span class="highlight">$&</span>');
                }
              }
              $(this).find(".mp3-title").html(highlighted);
            });
          }
          // Hide load more button during search
          $(".load-more-button").hide();
        },
        error: function (xhr, status, error) {
          console.error("Search AJAX error:", status, error);
        },
      });
    }, 300);
  });

  // Load More Functionality
  function loadMoreItems(isSearching = false) {
    const button = $(".load-more-button");
    const page = button.data("page");
    const posts_per_page = button.data("posts-per-page") || 10;
    const playlist_id = button.data("playlist-id") || "";
    const nonce = button.data("nonce");
    const search = isSearching && currentSearchTerm ? currentSearchTerm : "";

    // Add loading state
    button.prop("disabled", true).addClass("is-loading");

    $.ajax({
      url: mp3_frontend_params.ajax_url,
      type: "POST",
      data: {
        action: "mp3_load_more_tracks_frontend",
        page: page,
        posts_per_page: posts_per_page,
        playlist_id: playlist_id,
        nonce: nonce,
        search: search,
      },
      success: function (response) {
        button.prop("disabled", false).removeClass("is-loading");

        if (response.success === false) {
          console.error("Error loading more items:", response.data);
          return;
        }

        // Robustly handle both object and string responses
        var html = "";
        var hasMore = true;
        if (typeof response.data === "object" && response.data !== null) {
          html = response.data.html || "";
          hasMore =
            response.data.has_more !== undefined
              ? response.data.has_more
              : true;
        } else if (typeof response.data === "string") {
          html = response.data;
          hasMore = false;
        }

        $(".mp3-list").append(html);
        button.data("page", page + 1);
        bindShareButtonEvents();

        if (isSearching && currentSearchTerm) {
          const searchTerm = currentSearchTerm;
          $(".mp3-list li").each(function () {
            const title = $(this).find(".mp3-title").text().toLowerCase();
            const matches = title.includes(searchTerm);
            $(this).toggle(matches);
            if (matches && searchTerm) {
              const regex = new RegExp("(" + searchTerm + ")", "gi");
              const highlightedTitle = $(this)
                .find(".mp3-title")
                .text()
                .replace(regex, '<span class="highlight">$1</span>');
              $(this).find(".mp3-title").html(highlightedTitle);
            }
          });
        }

        // Only hide the button if hasMore is explicitly false
        if (hasMore === false || html.trim() === "" || isSearchActive) {
          button.hide();
        }
      },
      error: function (xhr, status, error) {
        // Remove loading state on error
        button.prop("disabled", false).removeClass("is-loading");
        console.error("Load more error:", status, error);
      },
    });
  }

  // Bind load more button click
  $(".load-more-button").on("click", function () {
    loadMoreItems();
  });
});
