import { useSelect } from '@wordpress/data';
import {
  useMemo
} from "@wordpress/element";
import { store as coreStore } from '@wordpress/core-data';

export const usePostTypes = () => {
  const postTypes = useSelect( ( select ) => {
    const { getPostTypes } = select( coreStore );
    const excludedPostTypes = [ 'attachment' ];
    const filteredPostTypes = getPostTypes( { per_page: -1 } )?.filter(
      ( { viewable, slug } ) =>
        viewable && ! excludedPostTypes.includes( slug )
    );
    return filteredPostTypes;
  }, [] );
  const postTypesTaxonomiesMap = useMemo( () => {
    if ( ! postTypes?.length ) return;
    return postTypes.reduce( ( accumulator, type ) => {
      accumulator[ type.slug ] = type.taxonomies;
      return accumulator;
    }, {} );
  }, [ postTypes ] );
  const postTypesSelectOptions = useMemo(
    () =>
      ( postTypes || [] ).map( ( { labels, slug } ) => ( {
        label: labels.singular_name,
        value: slug,
      } ) ),
    [ postTypes ]
  );
  return { postTypesTaxonomiesMap, postTypesSelectOptions };
};

export const useTaxonomies = ( postType ) => {
  const taxonomies = useSelect(
    ( select ) => {
      const { getTaxonomies } = select( coreStore );
      const filteredTaxonomies = getTaxonomies( {
        type: postType,
        per_page: -1,
        context: 'view',
      } );
      return filteredTaxonomies;
    },
    [ postType ]
  );
  const taxonomiesTerms = useSelect(
    (select) => {
      if ( ! taxonomies?.length ) return;
      const { getEntityRecords } = select( coreStore );
      const postTypeTaxonomiesTerms = {};
      taxonomies.forEach(function(tax, index) {
        postTypeTaxonomiesTerms[tax.name] = [];
        const thisTaxonomyTerms = getEntityRecords( "taxonomy", tax.slug, {
          per_page: -1,
          hide_empty: true
        } )?.map((term) => {
          postTypeTaxonomiesTerms[tax.name].push(term)
        });
      });
      return postTypeTaxonomiesTerms;
    },
    [taxonomies]
  );
  return { taxonomies, taxonomiesTerms };
};
