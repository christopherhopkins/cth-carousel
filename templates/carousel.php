<?php

function cth_carousel( $attributes ) {
    /**
     * Setup Query
    */
    $blockID = $attributes["blockID"];
    $post_type = $attributes["post_type"] ?? "post";
    $posts_per_page = $attributes["posts_per_page"] ?? 3;
    $orderby = $attributes["orderby"] ?? "date";
    $order = $attributes["order"] ?? "desc";
    $args = array(
        "post_type" => $post_type['slug'],
        "posts_per_page" => $posts_per_page,
        "orderby" => $orderby,
        "order" => $order,
        "tax_query" => array(
            "relation" => "OR"
        )
    );
    if( $attributes["terms"] ) {
        // Build Tax Query
        // TODO: support AND taxonomy relation
        foreach( $attributes["terms"] as $term ) {
            $taxonomy = $term["taxonomy"];
            $id = $term["id"];
            $tax_query_array = array(
                "taxonomy" => $taxonomy,
                "field" => "term_id",
                "terms" => [$id],
                "include_children" => false,
                "operator" => "IN"
            );
            array_push($args["tax_query"], $tax_query_array);
        }
    }
    $posts = get_posts($args);
    /**
     * Setup Output
    */
    ob_start();
    ?>
    <div <?= get_block_wrapper_attributes(); ?>>
        <div 
            class="swiper" 
            data-navigation="true" 
            data-scrollbar="true" 
            data-pagination="true"
            data-slides-per-view="<?= $attributes["slides_per_view"]; ?>"
            data-id="<?= $blockID; ?>"
            data-loop="<?= $attributes["loop"]; ?>"
        >
            <div class="swiper-wrapper">
                <?php foreach($posts as $post) : ?>
                    <div class="swiper-slide">
                        <h3><?= get_the_title($post); ?></h3>
                        <p><?= get_the_excerpt($post); ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
            <div class="swiper-pagination" data-id="<?= $blockID ?>"></div>
            <button class="swiper-button-prev" data-id="<?= $blockID ?>"></button>
            <button class="swiper-button-next" data-id="<?= $blockID ?>"></button>
            <div class="swiper-scrollbar" data-id="<?= $blockID ?>"></div>
        </div>
    </div>
    <?php 
    $return = ob_get_clean();
    return $return;
}