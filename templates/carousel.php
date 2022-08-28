<?php
function render_cth_carousel_block_template( $attributes, $content, $block ) {
  /**
   * Setup Query
  */
  $blockID = $attributes["blockID"];
  $post_type = $attributes["query"]["postType"]["slug"] ?? "post";
  $posts_per_page = $attributes["query"]["perPage"];
  $orderby = $attributes["query"]["orderBy"] ?? "date";
  $order = $attributes["query"]["order"] ?? "desc";
  $tax_relation = $attributes["query"]["taxRelation"] ? "AND" : "OR";
  $tax_queries = $attributes["query"]["taxQuery"];
  $args = array(
      "post_type" => $post_type,
      "posts_per_page" => $posts_per_page,
      "orderby" => $orderby,
      "order" => $order,
  );
  if( !empty( $tax_queries ) ) {
    // var_dump("$tax_queries", $tax_queries);
    $args["tax_query"] = [ "relation" => $tax_relation ];
    foreach($tax_queries as $key => $tax_query) {
      $taxonomy_slug = $key;
      $taxonomy_terms_ids = $tax_query;
      $args["tax_query"][] = array(
        "taxonomy" => $taxonomy_slug,
        "field" => "term_id",
        "terms" => $taxonomy_terms_ids,
        "include_children" => false,
        "operator" => "IN"
      );
    }
  }

  $carousel_posts = new WP_Query( $args );

  $content = sprintf(
    '<div
      class="swiper"
      data-id="%1$s"
      data-slides-per-view="%2$s"
      data-navigation="%3$s"
      data-scrollbar="%4$s"
      data-pagination="%5$s"
      data-loop="%6$s"
      data-slide-gap="%7$s"
    >
    <div class="swiper-wrapper">',
    $attributes['blockID'],
    $attributes['slides_per_view'],
    $attributes['navigation'],
    $attributes['scrollbar'],
    $attributes['dots'],
    $attributes['loop'],
    $attributes['slide_gap']
  );

  if( $carousel_posts->have_posts() ) {
    while( $carousel_posts->have_posts() ) {
      $carousel_posts->the_post();
      $block_instance = $block->parsed_block;
      $block_instance['blockName'] = 'core/null';
      $block_content = (
        new WP_Block(
          $block_instance,
          array(
            'postType' => get_post_type(),
            'postId' => get_the_ID()
          )
        )
      )->render( array( 'dynamic' => false ) );
      $post_classes = implode( ' ', get_post_class( 'swiper-slide wp-block-post' ) );
      $content .= sprintf(
        '<div class="%1$s">%2$s</div>',
        $post_classes,
        $block_content
      );
    }
  } else {
    $content = '<p>No Results</p>';
  }
  $content .= '</div>'; // close .swiper-wrapper
  if( $attributes['navigation'] ) {
    $content .= '<button class="swiper-button-prev" data-id="' . $attributes['blockID'] . '"></button>';
    $content .= '<button class="swiper-button-next" data-id="' . $attributes['blockID'] . '"></button>';
  }
  if( $attributes['dots'] ) {
    $content .= '<div class="swiper-pagination" data-id="' . $attributes['blockID'] . '"></div>';
  }
  if( $attributes['scrollbar'] ) {
    $content .= '<div class="swiper-scrollbar" data-id="' . $attributes['blockID'] . '"></div>';
  }
  $content .= '</div>'; // close .swiper

  wp_reset_postdata();

  return sprintf(
    '<div %1$s>%2$s</div>',
    get_block_wrapper_attributes(),
    $content
  );
}