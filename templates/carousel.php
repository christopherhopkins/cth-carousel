<?php

function cth_carousel( $attributes ) {
    /**
     * Setup Query
    */
    $args = array(
        'post_type' => 'post',
        'posts_per_page' => 3,
        'order' => 'asc',
        'orderby' => 'title'
    );

    $posts = get_posts($args);
    
    /**
     * Setup Output
    */
    ob_start();
    ?>
    
    <div <?= get_block_wrapper_attributes(); ?> >Test</div>

    <?php 
    $return = ob_get_clean();
    return $return;
}