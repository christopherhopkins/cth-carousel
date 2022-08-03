<?php
/**
 * Plugin Name:       Posts Carousel
 * Description:       Dynamic Posts Carousel
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Christopher Hopkins
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       cth-post-carousel
 *
 * @package           cth-blocks
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function cth_blocks_cth_post_carousel_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'cth_blocks_cth_post_carousel_block_init' );
