(function($) {

"use strict";

 function menu_switch(){

     $(".themeix-aside .control-bar").on("click", function(e){
          e.preventDefault();
           $(".themeix-aside").toggleClass("active-menu");
     });
 }

menu_switch();

// Smooth scrolling using jQuery easing

function sidebar_menu_scroll(){

   $('a.js-scroll-trigger[href*="#"]:not([href="#"])').on("click", function(){

    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 0)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }

   });
}

 sidebar_menu_scroll();

// init Isotope
 function active_isotope(){

   if($('.portfolio-grid').length >0) {

     $(document).ready(function(){
       var $grid = $('.portfolio-grid').isotope({
         itemSelector: '.portfolio-item',
         layoutMode: 'fitRows'
      });
       
        var filterFns = {
        numberGreaterThan50: function() {
          var number = $(this).find('.number').text();
          return parseInt( number, 10 ) > 50;
        },
        ium: function() {
          var name = $(this).find('.name').text();
          return name.match( /ium$/ );
        }
      };

        $('.portfolio-filters').on( 'click', 'button', function() {
          var filterValue = $(this).attr('data-filter');
          filterValue = filterFns[ filterValue ] || filterValue;
          $grid.isotope({ filter: filterValue });
        });

     });

  }

 }

  active_isotope();

   function scroll_to_top(){
    var offset = 300,
    offset_opacity = 1200,
    scroll_top_duration = 700,
    windows = $(window),
    back_to_top = $('.cd-top');
    windows.on("scroll", function(){

    ( $(this).scrollTop() > offset ) ? back_to_top.addClass('cd-is-visible') : back_to_top.removeClass('cd-is-visible cd-fade-out');
      if( $(this).scrollTop() > offset_opacity ) { 
        back_to_top.addClass('cd-fade-out');
      }

    });

    back_to_top.on('click', function(event){
      event.preventDefault();
      $('body,html').animate({
        scrollTop: 0 ,
        }, scroll_top_duration
      );
    });

   }

 scroll_to_top();


})(jQuery);