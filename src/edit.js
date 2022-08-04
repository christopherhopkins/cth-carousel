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
} from "@wordpress/components";
import { RawHTML } from "@wordpress/element";
import './editor.scss';
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
	return (
		<>
      <InspectorControls>
        <PanelBody title={ __( "Query Settings", "cth" ) }>

        </PanelBody>
      </InspectorControls>
			<div { ...useBlockProps() }>
				<ul className="cth-post-carousel-list">
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
                <li key={post.id} class="cth-post-carousel-list-item">
                  { post.title.rendered ? (
                    <RawHTML>
                      { post.title.rendered }
                    </RawHTML>
                  ) : (
                    __( "No Title", "cth" )
                  ) }
                </li>
              );
            } )
          }
				</ul>	
			</div>
		</>
	);
}
