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
      .on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
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
      url: mp3_frontend_params.ajax_url,
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

  // Normalize accents and punctuation while preserving numbered suffixes such as (01).
  function normalizeString(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\d()]+/g, " ")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseResponse(response) {
    if (typeof response.data === "object" && response.data !== null) {
      return {
        html: response.data.html || "",
        hasMore:
          response.data.has_more !== undefined
            ? response.data.has_more
            : true,
      };
    }

    return {
      html: typeof response.data === "string" ? response.data : "",
      hasMore: false,
    };
  }

  function beginRequest(container) {
    const requestId = (container.data("request-id") || 0) + 1;
    container.data("request-id", requestId);
    return requestId;
  }

  function isCurrentRequest(container, requestId) {
    return container.data("request-id") === requestId;
  }

  function loadMoreItems(container, page, replaceItems, requestId) {
    const button = container.find(".load-more-button");
    const list = container.find(".mp3-list");
    const postsPerPage = container.data("posts-per-page") || 10;
    const playlistId = container.data("playlist-id") || "";
    const nonce = container.data("nonce");

    requestId = requestId || beginRequest(container);
    button.prop("disabled", true).addClass("is-loading");

    $.ajax({
      url: mp3_frontend_params.ajax_url,
      type: "POST",
      data: {
        action: "mp3_load_more_tracks_frontend",
        page: page,
        posts_per_page: postsPerPage,
        playlist_id: playlistId,
        nonce: nonce,
      },
      success: function (response) {
        if (!isCurrentRequest(container, requestId)) {
          return;
        }

        button.prop("disabled", false).removeClass("is-loading");

        if (response.success === false) {
          console.error("Error loading more items:", response.data);
          return;
        }

        const result = parseResponse(response);
        if (replaceItems) {
          list.html(result.html);
        } else {
          list.append(result.html);
        }

        button.data("page", page + 1);
        bindShareButtonEvents();

        if (result.hasMore === false || result.html.trim() === "") {
          button.hide();
        } else {
          button.show();
        }
      },
      error: function (xhr, status, error) {
        if (!isCurrentRequest(container, requestId)) {
          return;
        }

        button.prop("disabled", false).removeClass("is-loading");
        console.error("Load more error:", status, error);
      },
    });
  }

  // Instant Search Functionality
  $(".mp3-search-input").on("input", function () {
    const input = $(this);
    const container = input.closest(".mp3-listing-container");
    const list = container.find(".mp3-list");
    const button = container.find(".load-more-button");
    const searchTerm = normalizeString(input.val());
    const requestId = beginRequest(container);

    clearTimeout(container.data("search-timeout"));
    button.prop("disabled", false).removeClass("is-loading").hide();

    const searchTimeout = setTimeout(function () {
      if (searchTerm === "") {
        loadMoreItems(container, 1, true, requestId);
        return;
      }

      $.ajax({
        url: mp3_frontend_params.ajax_url,
        type: "POST",
        data: {
          action: "mp3_load_more_tracks_frontend",
          page: 1,
          posts_per_page: -1,
          playlist_id: container.data("playlist-id") || "",
          nonce: container.data("nonce"),
          search: searchTerm,
        },
        success: function (response) {
          if (!isCurrentRequest(container, requestId)) {
            return;
          }

          if (response.success === false) {
            console.error("Search error:", response.data);
            return;
          }

          list.html(parseResponse(response).html);
          bindShareButtonEvents();
          button.hide();
        },
        error: function (xhr, status, error) {
          if (!isCurrentRequest(container, requestId)) {
            return;
          }

          console.error("Search AJAX error:", status, error);
        },
      });
    }, 300);

    container.data("search-timeout", searchTimeout);
  });

  // Bind load more button click
  $(".load-more-button").on("click", function () {
    const button = $(this);
    const page = button.data("page") || 2;
    loadMoreItems(button.closest(".mp3-listing-container"), page, false);
  });
});
