import { __ } from '@wordpress/i18n';
import {
  useBlockProps,
  InspectorControls,
  BlockContextProvider,
  __experimentalUseBlockPreview as useBlockPreview,
  useInnerBlocksProps
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import {
  Spinner,
  PanelBody,
  ToggleControl,
  QueryControls,
  RangeControl,
  SelectControl,
  FormTokenField,
  __experimentalGrid as Grid,
} from "@wordpress/components";
import {
  useEffect,
  memo,
  useMemo,
  useState,
  useRef
} from "@wordpress/element";
import isEmpty from "lodash/isEmpty";
import _uniqueId from "lodash/uniqueId";
import { usePostTypes, useTaxonomies, getTermIdByName, getExistingTaxQueryValue } from './utils';
import './editor.scss';
/**
 * Swiper
*/
import { Navigation, Pagination, Scrollbar, A11y, Keyboard, EffectFade } from 'swiper';
import { Swiper, SwiperSlide } from "swiper/react";

const TEMPLATE = [
	[ 'core/post-title' ],
	[ 'core/post-date' ],
	[ 'core/post-excerpt' ],
];

const CarouselPostInnerBlocks = () => {
  const innerBlockProps = useInnerBlocksProps(
    { className: 'wp-block-post' },
    { template: TEMPLATE },
    { templateLock: 'all' }
  );
  return (
    <div {...innerBlockProps}></div>
  );
}

function CarouselPostBlockPreview( {
	blocks,
	blockContextId,
	isHidden,
	setActiveBlockContextId,
} ) {
	const blockPreviewProps = useBlockPreview( {
		blocks,
		props: {
			className: 'wp-block-post',
		},
	} );
	const handleOnClick = () => {
		setActiveBlockContextId( blockContextId );
	};
	const style = {
		display: isHidden ? 'none' : undefined,
	};
	return (
    <div
      { ...blockPreviewProps }
      tabIndex={ 0 }
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
      role="button"
      onClick={ handleOnClick }
      onKeyPress={ handleOnClick }
      style={ style }
    />
	);
}
const MemorizedCarouselPostBlockPreview = memo( CarouselPostBlockPreview );

export default function Edit({ attributes, setAttributes, clientId }) {
  const {
    blockID,
    query,
    slides_per_view,
    loop,
    navigation,
    dots,
    scrollbar,
    slide_gap,
    effect
  } = attributes;
  const [ activeBlockContextId, setActiveBlockContextId ] = useState();
  /**
  * Post Types
  * Get Post Types and Taxonomies
  */
  const postTypeSelectOptions = usePostTypes().postTypesSelectOptions;
  /**
   * Taxonomy Terms
  */
  const usingTaxonomies = useTaxonomies(query.postType);
  const taxonomiesTermsMap = usingTaxonomies.taxonomiesTerms;
  /**
   * Posts (Main Query for Rendering)
  */
  const { posts, blocks } = useSelect( // main query
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
        _embed: query._embed,
      };
      query_args["tax_relation"] = query.taxRelation ? "AND" : "OR";
      if( query.taxQuery ) {
        const taxonomies = usingTaxonomies.taxonomies;
        const builtTaxQuery = Object.entries( query.taxQuery ).reduce(
					( accumulator, [ taxonomySlug, terms ] ) => {
						const taxonomy = taxonomies?.find(
							( { slug } ) => slug === taxonomySlug
						);
						if ( taxonomy?.rest_base ) {
							accumulator[ taxonomy?.rest_base ] = terms;
						}
						return accumulator;
					},
					{}
				);
        if ( !! Object.keys( builtTaxQuery ).length ) {
					Object.assign( query_args, builtTaxQuery );
				}
      }
      return {
        posts: select("core").getEntityRecords("postType", query.postType, query_args ),
        blocks: select("core/block-editor").getBlocks( clientId )
      }
    }, [query, usingTaxonomies]
  );

  let swiperModules = [Navigation, Pagination, Scrollbar, A11y, Keyboard];
  const possibleEffects = {
    "fade": EffectFade,
    "slide": null
  };
  const ref = useRef();
  /**
   * On Change Functions
  */
  /** Query Settings */
  const onChangePostType = (newPostType) => {
    const updatedQuery = {...query}
    updatedQuery["postType"] = newPostType;
    setAttributes( { query: updatedQuery, terms: [] } );
  };
  const onChangeTaxQuery = ( taxonomySlug ) => (newTermSlugs) => {
    const termIds = newTermSlugs?.map((newTermSlug) => {
      const gottenTermByName = getTermIdByName(newTermSlug, taxonomiesTermsMap);
      return gottenTermByName.foundTermID;
    });
    const updatedQuery = {...query};
    if( taxonomySlug ) {
      const newTaxQuery = {
        ...query.taxQuery,
        [ taxonomySlug ]: termIds
      };
      updatedQuery["taxQuery"] = newTaxQuery;
      setAttributes( { query: updatedQuery } );
    }
  };
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
  const onChangeTaxRelation = () => {
    const updatedQuery = {...query};
    updatedQuery["taxRelation"] = !updatedQuery["taxRelation"];
    setAttributes({
      query: updatedQuery
    });
  }
  /** Carousel Settings */
  const onChangeSlidesPerView = (number) => {
    setAttributes( { slides_per_view: number } );
    if( number === 1 ) {
      setAttributes( { slide_gap: 0 } ); // no gap if only showing 1 slide
    }
    ref?.current.swiper.update();
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
  const onChangeEffect = (newEffect) => {
    let newModule = null;
    const newModuleModule = Object.entries(possibleEffects)?.map(
      ([key, module]) => {
        if( key === newEffect ) {
          console.log(module);
          return module;
        }
      }
    )
    // if( newModule ) {
    //   setAttributes({ effect: newEffect });
    //   setAttributes()
    // }
  }
  /**
   * UseEffects
  */
  useEffect( () => {
    setAttributes( { blockID: _uniqueId() } );
  }, [] );
  const blockContexts = useMemo(
		() =>
			posts?.map( ( post ) => ( {
				postType: post.type,
				postId: post.id,
			} ) ),
		[ posts ]
	);
	return (
		<>
      <InspectorControls>
        <PanelBody title={ __( "Query Settings", "cth" ) }>
          { postTypeSelectOptions
            ?
              <SelectControl
                label={__( "Post Type", "cth" )}
                value={query.postType}
                onChange={onChangePostType}
                options={postTypeSelectOptions}
                __nextHasNoMarginBottom
              />
            :
              <Spinner/>
          }
          <QueryControls
            numberOfItems={query.perPage}
            order={query.order}
            orderBy={query.orderBy}
            onNumberOfItemsChange={onChangePostsPerPage}
            onOrderChange={onChangeOrder}
            onOrderByChange={onChangeOrderBy}
          />

          {taxonomiesTermsMap &&
            Object.entries(taxonomiesTermsMap)?.map(
              ([key, value]) => {
                const termOptions = value?.map((term) => { return term.name } )
                return(
                  <FormTokenField
                    key={key}
                    label={key.replaceAll("-", " ").replaceAll("_", " ").toUpperCase()} // TODO, get nicer looking name. Maybe getTaxonomyNameFromSlug util function
                    value={getExistingTaxQueryValue(key, query, taxonomiesTermsMap)}
                    suggestions={termOptions}
                    onChange={onChangeTaxQuery( key )}
                  />
                );
              }
            )
          }
          {query.taxQuery &&
            <ToggleControl
            label={__( "Taxonomy Relation", "cth" )}
            help={
              query.taxRelation
              ? __( "AND relation between taxonomies", "cth")
              : __( "OR relation between taxonomies", "cth" )
            }
            checked={query.taxRelation}
            onChange={onChangeTaxRelation}
          />
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
          <SelectControl
            label={__( "Change Effect", "cth" )}
            value={effect}
            onChange={onChangeEffect}
            options={[
              {
                label: "Slide",
                value: "slide"
              },
              {
                label: "Fade",
                value: "fade",
                module: EffectFade,
              }
            ]}
            __nextHasNoMarginBottom
          />
        </PanelBody>
      </InspectorControls>
			<div { ...useBlockProps()}>
        {!posts &&
          <div className="posts-loading">
            <Spinner />
            <p>Loading...</p>
          </div>
        }
        {posts && isEmpty(posts) &&
          <div class="no-results">
            <h2>No Results</h2>
          </div>
        }

        {posts && !isEmpty(posts) &&
          <>
            <Swiper
              ref={ref}
              modules={[A11y, Navigation, Pagination, Scrollbar, Keyboard, EffectFade]}
              slidesPerView={slides_per_view}
              navigation={navigation ? { clickable: true } : navigation}
              pagination={dots ? { clickable: true } : dots}
              scrollbar={scrollbar ? { draggable: true } : scrollbar}
              loop={loop}
              spaceBetween={slide_gap}
              autoHeight={true}
              keyboard={true}
              effect="slide"
              fadeEffect={{crossFade: true}}
              /**
               * Don't allow swiping/dragging in editor
               * so editing post template is easier
              */
              allowTouchMove={false}
            >
              <div class="swiper-wrapper">
                {blockContexts &&
                  blockContexts.map( ( blockContext ) => {
                    return(
                      <SwiperSlide>
                        <BlockContextProvider key={blockContext.postId} value={blockContext}>
                          { blockContext.postId ===
                          ( activeBlockContextId ||
                            blockContexts[ 0 ]?.postId ) ? (
                              <CarouselPostInnerBlocks />
                          ) : null }
                          <MemorizedCarouselPostBlockPreview
                            blocks={ blocks }
                            blockContextId={ blockContext.postId }
                            setActiveBlockContextId={ setActiveBlockContextId }
                            isHidden={
                              blockContext.postId ===
                              ( activeBlockContextId ||
                                blockContexts[ 0 ]?.postId )
                            }
                          />
                        </BlockContextProvider>
                      </SwiperSlide>
                    );
                  } )
                }
              </div>
            </Swiper>
          </>
        }
			</div>
		</>
	);
}