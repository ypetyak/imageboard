function checkScrollPos() {
    var docHeight = $(document).height();
    // console.log(docHeight);
    var scroll = $(document).scrollTop() + $(window).height();
    // console.log(scroll);
    if (scroll + 1 >= docHeight) {
        console.log("Infinity War is here! BOOM!");
        // infinite();
    } else {
        // console.log("nope");
        setTimeout(checkScrollPos, 800);
    }
}

var infiniteScroll = location.search.indexOf("scroll=infinite") != -1;

console.log(infiniteScroll);

// $(document).addEventListener("click", function() {
//     checkScrollPos();
// });
