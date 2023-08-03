//= components/script.js
//= components/up-btn.js
//= components/first-alert.js


const windowHeight = $(window).height();
let previewPhotoHeight = windowHeight - $("header").height();

$(".preview_photo").height(previewPhotoHeight);

