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
  RangeControl,
  __experimentalHeading as Header,
  __experimentalGrid as Grid,
} from "@wordpress/components";
import { useEffect, RawHTML } from "@wordpress/element";
import classnames from "classnames";
import _uniqueId from 'lodash/uniqueId';
import './editor.scss';
/**
 * Swiper
*/
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from "swiper/react";

export default function Edit({ attributes, setAttributes }) {
  const {
    blockID,
    posts_per_page,
    post_type,
    taxonomy,
    terms,
    order,
    orderby,
    slides_per_view,
    loop,
    navigation,
    dots,
    scrollbar
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
  /** Query Settings */
  const onChangePostsPerPage = (number) => {
    setAttributes( { posts_per_page: number } );
  }
  const onChangeOrder = (order) => {
    setAttributes( { order: order } );
  }
  const onChangeOrderBy = () => {
    setAttributes( { orderby: orderby } );
  }
  /** Carousel Settings */
  const onChangeSlidesPerView = (number) => {
    setAttributes( { slides_per_view: number } );
  }
  const onChangeLoop = () => {
    setAttributes( { loop: !loop } );
  }
  const onChangeNavigation = () => {
    setAttributes( { navigation: !navigation } );
  }
  const onChangeScrollbar = () => {
    setAttributes( { scrollbar: !scrollbar } );
  }
  const onChangeDots = () => {
    setAttributes( { dots: !dots } );
  }
  /**
   * Ensure unique ID
  */
  useEffect( () => {
    setAttributes( { blockID: _uniqueId() } );
  }, [] );
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
        <PanelBody title={__( "Carousel Settings", "cth" )}>
          
          <RangeControl
            label={__( "Slides Per View", "cth" )}
            value={slides_per_view}
            onChange={onChangeSlidesPerView}
            min={1}
            max={posts_per_page}
          />
          <Grid columns={2} gap={1}>
            <ToggleControl
              label={__( "Loop", "cth" )}
              help={
                loop
                ? __( "Infinite Loop", "cth")
                : __( "No Loop", "cth" )
              }
              checked={loop}
              onChange={onChangeLoop}
            />
            <ToggleControl
              label={__( "Arrows", "cth" )}
              help={
                navigation
                ? __( "Arrows", "cth")
                : __( "No Arrows", "cth" )
              }
              checked={navigation}
              onChange={onChangeNavigation}
            />
            <ToggleControl
              label={__( "Dots", "cth" )}
              help={
                dots
                ? __( "Dots", "cth")
                : __( "No Dots", "cth" )
              }
              checked={dots}
              onChange={onChangeDots}
            />
            <ToggleControl
              label={__( "Scrollbar", "cth" )}
              help={
                scrollbar
                ? __( "Scrollbar", "cth")
                : __( "No Scrollbar", "cth" )
              }
              checked={scrollbar}
              onChange={onChangeScrollbar}
            />
          </Grid>
        </PanelBody>
      </InspectorControls>
			<div { ...useBlockProps()}>
				<Swiper 
          className="cth-post-carousel-list swiper-wrapper"
          modules={[A11y, Navigation, Pagination, Scrollbar]}
          // onSwiper={(swiper) => console.log(swiper)}
          // onSlideChange={() => console.log('slide change')}
          slidesPerView={slides_per_view}
          navigation={navigation ? { clickable: true } : navigation}
          pagination={dots ? { clickable: true } : dots}
          scrollbar={scrollbar ? { draggable: true } : scrollbar}
          loop={loop}
        >
          {!posts &&
            placeholders.map( ( post ) => {
              return(
                <SwiperSlide key={post} className="cth-posts-carousel-placeholder-item">
                  <Spinner />
                </SwiperSlide>
              );
            } )
          }
          {posts &&
            posts.map( ( post ) => {
              return(
                <SwiperSlide key={post.id}>
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
                    <CardBody>
                      {post.excerpt.rendered && <RawHTML>{__(post.excerpt.rendered, "cth")}</RawHTML>}
                    </CardBody>
                  </Card>
                </SwiperSlide>
              );
            } )
          }
				</Swiper>
			</div>
		</>
	);
}