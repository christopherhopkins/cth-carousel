<?php

function cth_carousel( $attributes ) {
    /**
     * Setup Query
    */
    $post_type = $attributes['post_type'] ?? 'post';
    $posts_per_page = $attributes['posts_per_page'] ?? 3;
    $orderby = $attributes['orderby'] ?? 'date';
    $order = $attributes['order'] ?? 'desc';
    $args = array(
        'post_type' => $post_type,
        'posts_per_page' => $posts_per_page,
        'orderby' => $orderby,
        'order' => $order
    );

    $posts = get_posts($args);
    
    /**
     * Setup Output
    */
    ob_start();
    ?>
    
    <div <?= get_block_wrapper_attributes(); ?> >
        <ul class="cth-post-carousel-list">
            <?php foreach($posts as $post) : ?>
                <li class="cth-post-carousel-list-item">
                    <?= get_the_title($post); ?>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>

    <?php 
    $return = ob_get_clean();
    return $return;
}