$(function () {
	var swiper = new Swiper('.swiper-container', {
		slidesPerView: 1,
		loop: true,
		spaceBetween: 30,
		speed: 1000,
		autoplay: {
			delay: 2500,
			disableOnInteraction: false,
		},
		pagination: {
			el: '.swiper-pagination',
			clickable: true,
		},
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
	});
	$('.swiper-button-pause.pause').on('click', function () {
		$(this).toggleClass('play');
		if ($(this).hasClass('play')) {
			swiper.autoplay.stop();
		} else {
			swiper.autoplay.start();
		}
	});
})
