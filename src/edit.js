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
  RangeControl,
  SelectControl,
  __experimentalHeading as Header,
  __experimentalGrid as Grid,
} from "@wordpress/components";
import { useEffect, RawHTML } from "@wordpress/element";
import isEmpty from "lodash/isEmpty";
import _uniqueId from "lodash/uniqueId";
import './editor.scss';
/**
 * Swiper
*/
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from "swiper/react";

export default function Edit({ attributes, setAttributes }) {
  const {
    blockID,
    terms,
    query,
    slides_per_view,
    loop,
    navigation,
    dots,
    scrollbar,
    slide_gap
  } = attributes;
  /**
   * Posts (Main Query for Rendering)
   * TODO: Support AND tax relation
  */
  const posts = useSelect( // main query
    ( select ) => {
      const query_args = {
        page: query.pages,
        per_page: query.perPage,
        search: query.search,
        author: query.author,
        offset: query.offset,
        order: query.order,
        orderby: query.orderBy,
        status: query.status,
        tax_relation: query.taxRelation,
        _embed: query._embed,
      };
      if( !isEmpty(terms) ) {
        for(const term of terms) {
          switch( term.taxonomy ) {
            case "category":
              if( !("categories" in query_args) ) {
                query_args["categories"] = [];
                query_args["categories"].push(term.id);
              } else {
                query_args["categories"].push(term.id);
              }
              break;
            case "post_tag":
              if( !("tags" in query_args) ) {
                query_args["tags"] = [];
                query_args["tags"].push(term.id);
              } else {
                query_args["tags"].push(term.id);
              }
              break;
            default:
              if( !(term.taxonomy in query_args) ) {
                query_args[term.taxonomy] = [];
                query_args[term.taxonomy].push(term.id);
              } else {
                query_args[term.taxonomy].push(term.id);
              }
          }
        }
      }
      return select("core").getEntityRecords("postType", query.postType.slug, query_args );
    }, [query, terms] // change to just query
  );
  /**
  * Post Types
  */
  let postTypeOptions = [];
  let registeredPostTypesFiltered = [];
  const registeredPostTypes = useSelect( // get All post types
    ( select ) => {
      return select("core").getPostTypes();
    }, [] // run on render, this won't change
  );
  if( registeredPostTypes ) {
    registeredPostTypesFiltered = registeredPostTypes.filter(pt => pt.viewable && pt.visibility.show_in_nav_menus);
    postTypeOptions = registeredPostTypesFiltered.map( (t) => {
      return { label: t.name, value: t.slug };
    } );
  }
  /**
   * Taxonomy Terms
  */
  const allCats = useSelect(
    ( select ) => {
      const returnArray = [];
      const postTypeObject = query.postType.taxonomies ? query.postType : registeredPostTypesFiltered.filter( (type) => type.slug === query.postType.slug )[0];
      if( postTypeObject ) {
        const postTypeTaxonomies = postTypeObject.taxonomies;
        if( postTypeTaxonomies ) {
          for(const tax of postTypeTaxonomies) {
            const taxTerms = select("core").getEntityRecords("taxonomy", tax, { per_page: -1 });
            if( taxTerms ) {
              for(const term of taxTerms) {
                returnArray.push(term);
              }
            }
          }
        }
      }
      return returnArray;
    }, [query]
  );
  const catSuggestions = {};
  if( allCats ) {
    for(const cat of allCats) {
      catSuggestions[cat.name] = cat;
    }
  }
  /**
   * Utilities
  */
  const placeholders = [];
  for ( let i = 0; i < query.perPage; i++ ) {
    placeholders.push(i);
  }
  /**
   * On Change Functions
  */
  /** Query Settings */
  const onChangePostType = (newPostType) => {
    const updatedPostType = registeredPostTypesFiltered.filter( (type) => type.slug === newPostType )[0] ?? { slug: newPostType };
    const updatedQuery = {...query}
    updatedQuery["postType"] = updatedPostType;
    updatedQuery["terms"] = [];
    setAttributes( { query: updatedQuery } );
  };
  const onChangeTerms = (newTerms) => {
    const hasNoSuggestions = newTerms.some((value) => typeof value === 'string' && !catSuggestions[value]);
    if( hasNoSuggestions ) return;
    const updatedCats = newTerms.map( (token) => {
      return typeof token === "string" ? catSuggestions[token] : token;
    } );
    setAttributes( { terms: updatedCats } );
  }
  const onChangePostsPerPage = (number) => {
    const updatedQuery = {...query}
    updatedQuery["perPage"] = number;
    setAttributes( { query: updatedQuery } );
    if( number === 1 || number <= slides_per_view ) {
      onChangeSlidesPerView(number); // make sure this doesn't get stuck
    }
  }
  const onChangeOrder = (newOrder) => {
    const updatedQuery = {...query}
    updatedQuery["order"] = newOrder;
    setAttributes( { query: updatedQuery } );
  }
  const onChangeOrderBy = (newOrderBy) => {
    const updatedQuery = {...query}
    updatedQuery["orderBy"] = newOrderBy;
    setAttributes( { query: updatedQuery } );
  }
  /** Carousel Settings */
  const onChangeSlidesPerView = (number) => {
    setAttributes( { slides_per_view: number } );
    if( number === 1 ) {
      setAttributes( { slide_gap: 0 } ); // no gap if only showing 1 slide
    }
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
  const onChangeSlideGap = (newGap) => {
    setAttributes( { slide_gap: newGap } );
  }
  /**
   * UseEffects
  */
  useEffect( () => {
    setAttributes( { blockID: _uniqueId() } );
  }, [] );
  useEffect( () => { // ensure actual term objects are set in attributes
    if( !isEmpty(terms) ) {
      terms.forEach(function(term, index) {
        if( !term.slug ) {
          const hasSuggestion = catSuggestions[term.value];
          if( !hasSuggestion ) {
            return;
          }
          let updatedTerms = [...terms];
          updatedTerms[index] = catSuggestions[term.value];
          setAttributes( { terms: updatedTerms } );
        }
      });
    }
  }, [catSuggestions] );
	return (
		<>
      <InspectorControls>
        <PanelBody title={ __( "Query Settings", "cth" ) }>
          { registeredPostTypes
            ?
              <SelectControl
                label={__( "Post Type", "cth" )}
                value={query.postType.slug}
                onChange={onChangePostType}
                options={postTypeOptions}
                __nextHasNoMarginBottom
              />
            :
              <Spinner/>
          }
          {catSuggestions && !isEmpty(catSuggestions)
            ?
              <QueryControls
                numberOfItems={query.perPage}
                order={query.order}
                orderBy={query.orderBy}
                categorySuggestions={catSuggestions}
                selectedCategories={terms}
                onNumberOfItemsChange={onChangePostsPerPage}
                onOrderChange={onChangeOrder}
                onOrderByChange={onChangeOrderBy}
                onCategoryChange={onChangeTerms}
              />
            :
              isEmpty(catSuggestions) && isEmpty(allCats)
              ?
                <QueryControls
                  numberOfItems={query.perPage}
                  order={query.order}
                  orderBy={query.orderBy}
                  onNumberOfItemsChange={onChangePostsPerPage}
                  onOrderChange={onChangeOrder}
                  onOrderByChange={onChangeOrderBy}
                />
              :
                <Spinner/>
          }
        </PanelBody>
        <PanelBody title={__( "Carousel Settings", "cth" )}>
          <RangeControl
            label={__( "Slides Per View", "cth" )}
            value={slides_per_view}
            onChange={onChangeSlidesPerView}
            min={1}
            max={query.perPage}
          />
          {slides_per_view > 1 &&
            <RangeControl
              label={__( "Slide Gap", "cth" )}
              value={slide_gap}
              onChange={onChangeSlideGap}
              min={0}
              max={100} //TODO: arbitrary, maybe use number input instead
            />
          }
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
        {posts
          ?
            <Swiper
              className="cth-post-carousel-list swiper-wrapper"
              modules={[A11y, Navigation, Pagination, Scrollbar]}
              slidesPerView={slides_per_view}
              navigation={navigation ? { clickable: true } : navigation}
              pagination={dots ? { clickable: true } : dots}
              scrollbar={scrollbar ? { draggable: true } : scrollbar}
              loop={loop}
              noSwipingSelector="[data-wp-component='Card']"
              spaceBetween={slide_gap}
            >
              { posts.map( ( post ) => {
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
              } ) }
            </Swiper>
          :
            <div className="posts-loading">
              <Spinner />
              <p>Loading...</p>
            </div>
        }
			</div>
		</>
	);
}