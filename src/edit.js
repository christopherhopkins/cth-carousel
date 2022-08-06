import { __ } from '@wordpress/i18n';
import {
  useBlockProps,
  InspectorControls
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import {
  Spinner,
  PanelBody,
  ToggleControl,
  QueryControls,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  __experimentalHeading as Header
} from "@wordpress/components";
import { useEffect, RawHTML } from "@wordpress/element";
import classnames from "classnames";
import './editor.scss';
/**
 * Swiper
*/
import Swiper, { Navigation, Pagination } from 'swiper';
import "swiper/css";

export default function Edit({ attributes, setAttributes }) {
  const {
    posts_per_page,
    post_type,
    taxonomy,
    terms,
    order,
    orderby
  } = attributes;
  const posts = useSelect(
    ( select ) => {
      return select('core').getEntityRecords('postType', post_type, {
        per_page: posts_per_page,
        _embed: true,
        order: order,
        orderby: orderby,
        taxonomy: terms
      } );
    }, [posts_per_page, order, orderby, taxonomy]
  );
  const placeholders = [];
  for ( let i = 0; i < posts_per_page; i++ ) {
    placeholders.push(i);
  }
  /**
   * On Change Functions
  */
  const onChangePostsPerPage = (number) => {
    setAttributes( { posts_per_page: number } );
  }
  const onChangeOrder = (order) => {
    setAttributes( { order: order } );
  }
  const onChangeOrderBy = () => {
    setAttributes( { orderby: orderby } );
  }
  useEffect(() => {
    const swiper = new Swiper(".swiper", {
      modules: [Navigation, Pagination],
      slidesPerView: 1,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
        type: "progressbar",
      },
    });
  }, [posts_per_page, order, orderby, taxonomy]);
	return (
		<>
      <InspectorControls>
        <PanelBody title={ __( "Query Settings", "cth" ) }>
          <QueryControls
            numberOfItems={posts_per_page}
            order={order}
            orderBy={orderby}
            onOrderChange={onChangeOrder}
            onOrderByChange={onChangeOrderBy}
            onNumberOfItemsChange={onChangePostsPerPage}
          />
        </PanelBody>
      </InspectorControls>
			<div { ...useBlockProps({
        className: `swiper`
      }) }>
        <button class="swiper-button-prev">Previous</button>
				<div className="cth-post-carousel-list swiper-wrapper">
          {!posts &&
            <p class="cth-post-carousel-placeholder">
              Posts Carousel Block
            </p>
          }
          {!posts &&
            placeholders.map( ( post ) => {
              return(
                <li key={post} className="cth-posts-carousel-placeholder-item">
                  <Spinner />
                </li>
              );
            } )
          }
          {posts &&
            posts.map( ( post ) => {
              return(
                <div key={post.id} class="cth-post-carousel-list-item swiper-slide">
                  <Card>
                    <CardHeader>
                      { post.title.rendered ? (
                        <Header size={3}>
                          { post.title.rendered }
                        </Header>
                      ) : (
                        __( "No Title", "cth" )
                      ) }
                    </CardHeader>
                  </Card>
                </div>
              );
            } )
          }
				</div>
        <button class="swiper-button-next">Next</button>
        <div class="swiper-pagination"></div>
			</div>
		</>
	);
}
