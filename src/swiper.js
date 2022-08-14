// Import all possible module options
import Swiper, { Navigation, Pagination, Scrollbar, A11y } from "swiper";

const cthBlocksCarousels = document.querySelectorAll(".wp-block-cth-blocks-cth-post-carousel");
if( cthBlocksCarousels ) {
  cthBlocksCarousels.forEach( (element, index) => {
    const carousel = element;
    const swiperEl = carousel.querySelector(".swiper");
    const blockID = swiperEl.getAttribute("data-id");
    const slidesPerView = swiperEl.getAttribute('data-slides-per-view');
    const loop = swiperEl.getAttribute('data-loop');
    const slideGap = swiperEl.getAttribute('data-slide-gap');
    // Set up interactive elements
    const nextEl = `.swiper-button-next[data-id="${blockID}"]`;
    const prevEl = `.swiper-button-prev[data-id="${blockID}"]`;
    const scrollbarEl = `.swiper-scrollbar[data-id="${blockID}"]`;
    const paginationEl = `.swiper-pagination[data-id="${blockID}"]`;
    // set up default modules always included

    const swiper = new Swiper(swiperEl, {
      modules: [A11y, Navigation, Pagination, Scrollbar],
      slidesPerView: slidesPerView,
      // slidesPerView: "auto",
      autoHeight: true,
      rewind: true,
      a11y: { // https://swiperjs.com/swiper-api#accessibility-a11y
        enabled: true
      },
      navigation: {
        nextEl: nextEl,
        prevEl: prevEl
      },
      scrollbar: {
        el: scrollbarEl,
        draggable: true
      },
      pagination: {
        el: paginationEl,
        type: "bullets"
      }
    });
    console.log(swiper);
  } );
}