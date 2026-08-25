=== TRDS MP3 Listing ===
Contributors: arnelbg
Tags: mp3, audio, player, download, social share
Requires at least: 5.0
Tested up to: 6.5
Stable tag: 1.2.7
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

A WordPress plugin for managing and displaying MP3 files with social sharing and download capabilities.

== Description ==

TRDS MP3 Listing is a powerful WordPress plugin that allows you to upload, manage, and display MP3 files on your website. It includes features like social media sharing, download tracking, and customizable colors.

= Features =

* Upload and manage MP3 files
* Social media sharing (Facebook, Twitter, LinkedIn, Reddit, WhatsApp, Email)
* Download tracking
* Customizable colors for buttons and titles
* Playlist management
* Responsive audio player
* Efficient search functionality
* Load more pagination

= Installation =

1. Upload the plugin files to the `/wp-content/plugins/mp3-listing-plugin` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Configure settings under MP3 Files > Settings

= Usage =

Use the shortcode `[mp3_listing]` to display the MP3 listing on any page or post.

== Changelog ==

= 1.2.7 =
* Fixed playlist search for numbered lesson titles such as `(01)`
* Fixed clearing search so the first page is restored
* Fixed search context for small playlists and multiple listings on one page
* Prevented duplicate frontend Load More requests

= 1.2.6 =
* Excluded MP3 listing records from front-end site search results
* Prevents search result cards linking to non-viewable audio records (404s)

= 1.2.5 =
* Improved search functionality efficiency
* Fixed playlist filtering during search
* Enhanced social media sharing dropdown behavior
* Optimized load more functionality

= 1.2.4 =
* Fixed social media sharing dropdown issues
* Improved playlist management
* Enhanced security features

= 1.2.3 =
* Added playlist support
* Improved UI/UX
* Fixed minor bugs

= 1.2.2 =
* Added support for both logged-in and logged-out users
* Improved AJAX handling
* Enhanced error handling

= 1.2.1 =
* Added color customization options
* Improved mobile responsiveness
* Fixed download tracking

= 1.2.0 =
* Added social media sharing
* Improved audio player
* Enhanced security features

= 1.1.0 =
* Initial release with basic functionality
* MP3 upload and management
* Download tracking
* Basic audio player

== Upgrade Notice ==

= 1.2.7 =
This update improves playlist search precision and restores pagination correctly after clearing a search.

= 1.2.6 =
This update keeps internal MP3 records out of front-end search results, preventing broken links on the search page.

= 1.2.5 =
This update improves search functionality and fixes playlist filtering issues.

== Frequently Asked Questions ==

= How do I add MP3 files? =

Go to MP3 Files > Add New in your WordPress admin area. Upload your MP3 file and add a title.

= How do I display the MP3 listing? =

Use the shortcode `[mp3_listing]` on any page or post where you want to display the MP3 listing.

= Can I customize the colors? =

Yes, go to MP3 Files > Settings to customize the colors of buttons, titles, and the audio player.

== Screenshots ==

1. MP3 Listing Frontend Display
2. MP3 Upload Interface
3. Settings Page
4. Playlist Management

== Support ==

For support, please visit the [GitHub repository](https://github.com/wikiwyrhead/TRDS-MP3-Listing/).
