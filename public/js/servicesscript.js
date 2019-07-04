//List service
function search() {
    let input = document.getElementById('search').value;
    let filter = input.toUpperCase();
    let cards = document.querySelectorAll('.servicecards');
    let name = document.querySelectorAll('.name');
    
    for (let i = 0; i < cards.length; i++) {
        let focus = cards[i]
        let compare = name[i].dataset.names;

        if (compare.toUpperCase().includes(filter)) {
            if ($(focus).hasClass('d-none')) {
                $(focus).removeClass('d-none');
                $(focus).addClass('animated fadeIn').one(animationEnd, function() {
                    $(this).removeClass('animated fadeIn');
                });
            }
        }
        else {
            if (!$(focus).hasClass('d-none')){
                $(focus).addClass('animated fadeOut').one(animationEnd, function(){
                    $(this).removeClass('animated fadeOut');
                    $(focus).addClass('d-none');
                })
            }
        }
    }
}

$(function() {
    let searchbut = document.getElementById('searchbut');

    if (searchbut) {
        searchbut.addEventListener('click', search);
    }
});

$('select.category-select').on('change', function(e) {
    let cards = $('.servicecards');
    let category = $(this).find('option:selected').text().replace(/\s/g, '');
    
    for (let i = 0; i < cards.length; i++) {
        let focus = cards[i];

        if (($(focus).hasClass(category) || category === "ShowAll")) {
            if ($(focus).hasClass('d-none')) {
                $(focus).removeClass('d-none');
                $(focus).addClass('animated fadeIn').one(animationEnd, function() {
                    $(this).removeClass('animated fadeIn');
                });
            }
        }
        else {
            if (!$(focus).hasClass('d-none')){
                $(focus).addClass('animated fadeOut').one(animationEnd, function(){
                    $(this).removeClass('animated fadeOut');
                    $(focus).addClass('d-none');
                })
            }
        }
    }
});

$('select.sort-select').on('change', function(e) {
    let cards = $('.servicecards');
    let sort = $(this).find('option:selected').text();
    if (sort == "Most viewed"){
        cards.sort(function(a, b){ return $(b).data("views")-$(a).data("views")});    
        $("#servcon").html(cards);
    }
    else if (sort == "Newest first"){
        cards.sort(function(a, b){ return $(b).data("date")-$(a).data("date")});    
        $("#servcon").html(cards);
    }
    else if (sort == "Oldest first"){
        cards.sort(function(a, b){ return $(a).data("date")-$(b).data("date")});    
        $("#servcon").html(cards);
    }
});

//Edit Service/Add Service
function categoryCheck() {
    var categories = document.getElementsByName('categories');
    var error = document.getElementById('categoryErr');
    var button = document.getElementById('butaddService');
    var ticks = 0;
    console.log('FIRE')
    for (var i = 0; i < categories.length; i++) {
        if (categories[i].checked == true) {
            ticks++;
        }
    }
    if (ticks == 0) {
        error.style.display = 'block';
        button.disabled = true;
    }
    else {
        error.style.display = 'none';
        button.disabled = false;
    }
}

// Replace upload image
$(function() {
    if (typeof img !== 'undefined') {
        let focus = $('.preview', '.file-upload');
        
        focus.addClass('d-block');
        focus.find('.renderer').html(`<img src="${img}">`);

        img = undefined
        $('script#img-script').remove();
    }
});

// function filterSelection(category){
//     let cards = document.querySelectorAll('.servicecards');
//     for (let i = 0; i < cards.length; i++) {
//         if (cards[i].classList.contains(category) || category === "all") {
//             cards[i].style.display = "";
//         }
//         else {
//             cards[i].style.display = "none";
//         }
//     }
// }
