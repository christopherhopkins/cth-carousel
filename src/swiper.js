// Import all possible module options
import Swiper, { Navigation, Pagination, Scrollbar, A11y, Keyboard } from "swiper";

const cthBlocksCarousels = document.querySelectorAll(".wp-block-cth-blocks-cth-post-carousel");
if( cthBlocksCarousels ) {
  cthBlocksCarousels.forEach( (element, index) => {
    const carousel = element;
    const swiperEl = carousel.querySelector(".swiper");
    const blockID = swiperEl.getAttribute("data-id");
    const slidesPerView = swiperEl.getAttribute('data-slides-per-view');
    const loop = swiperEl.getAttribute('data-loop');
    const slideGap = swiperEl.getAttribute('data-slide-gap');
    const pagination = swiperEl.getAttribute("data-pagination");
    const navigation = swiperEl.getAttribute("data-navigation");
    const scrollbar = swiperEl.getAttribute("data-scrollbar");
    // Set up interactive elements
    const nextEl = `.swiper-button-next[data-id="${blockID}"]`;
    const prevEl = `.swiper-button-prev[data-id="${blockID}"]`;
    const scrollbarEl = `.swiper-scrollbar[data-id="${blockID}"]`;
    const paginationEl = `.swiper-pagination[data-id="${blockID}"]`;
    // set up default modules always included

    const initArgs = {
      modules: [A11y, Navigation, Pagination, Scrollbar, Keyboard],
      slidesPerView: slidesPerView,
      autoHeight: true,
      a11y: { // https://swiperjs.com/swiper-api#accessibility-a11y
        enabled: true
      },
      keyboard: true
    };
    if( slideGap ) {
      initArgs.spaceBetween = parseInt(slideGap);
    }
    if( pagination ) {
      initArgs.pagination = {
        el: paginationEl,
        type: "bullets",
        clickable: true
      }
    }
    if( navigation ) {
      initArgs.navigation = {
        nextEl: nextEl,
        prevEl: prevEl,
        clickable: true
      }
    }
    if( loop ) {
      initArgs.rewind = loop;
    }
    if( scrollbar ) {
      initArgs.scrollbar = {
        el: scrollbarEl,
        draggable: true
      }
    }
    const swiper = new Swiper(swiperEl, initArgs);
  } );
}