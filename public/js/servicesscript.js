
function search() {
    let input = document.getElementById('search').value;
    let filter = input.toUpperCase();
    let cards = document.querySelectorAll('.servicecards');
    let name = document.querySelectorAll('.name');
    for (let i = 0; i < cards.length; i++) {
        let compare = name[i].dataset.names;
        if (compare.toUpperCase().includes(filter)) {
            if ($(cards[i]).hasClass('d-none')) {
                $(cards[i]).removeClass('d-none');
                $(cards[i]).addClass('animated fadeIn').one(animationEnd, function() {
                    $(this).removeClass('animated fadeIn');
                });
            }
        }
        else {
            if (!$(cards[i]).hasClass('d-none')){
                $(cards[i]).addClass('animated fadeOut').one(animationEnd, function(){
                    $(this).removeClass('animated fadeOut');
                    $(cards[i]).addClass('d-none');
                })
            }
        }
    }
}

document.getElementById('searchbut').addEventListener('click', search);

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
            
            // if (!$(focus).hasClass('d-none')) {
            //     $(focus).addClass('animated fadeOut').on(animationEnd, function() {
                    
            //         $(this).removeClass('animated fadeOut');
            //     });
            // }
        }
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
