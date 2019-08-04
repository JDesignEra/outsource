//List service
function search() {
    let input = $('#search').val();
    let filter = input.toUpperCase();
    let cards = $('.servicecards');
    let name = $('.name');
    
    for (let i = 0, n = cards.length; i < n; i++) {
        let focus = $(cards[i]);
        let compare = $(name[i]).data('names');

        if (compare.toUpperCase().includes(filter)) {
            if ($(focus).hasClass('d-none')) {
                $(focus).removeClass('d-none');
                $(focus).addClass('animated faster fadeIn').one(animationEnd, function() {
                    let _this = $(this);
                    
                    _this.removeClass('animated faster fadeIn');
                    _this.addClass('d-flex');
                });
            }
        }
        else {
            if (!$(focus).hasClass('d-none')){
                $(focus).addClass('animated faster fadeOut').one(animationEnd, function(){
                    let _this = $(this);

                    _this.removeClass('animated faster fadeOut');
                    _this.removeClass('d-flex');
                    _this.addClass('d-none');
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
    else if (sort == "Most Popular"){
        cards.sort(function(a, b){ return $(b).data("favs")-$(a).data("favs")});    
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
    let focus = $('.file-upload');
    if (typeof img !== 'undefined') {
        let preview = focus.find('.preview');
        
        preview.addClass('d-block');
        preview.find('.renderer').html(`<img src="${img}">`);

        img = undefined
        $('script#img-script').remove();
    }
    else {
        let cardText = focus.find('.card-text');
        let icon = cardText.find('i');
        let text = cardText.find('p.font-weight-bolder');

        icon.removeClass('fa-cloud-upload-alt');
        icon.addClass('fa-image');
        text.text('No image uploaded')
    }
});

// Material Design example
$(document).ready(function () {
    let table = $('#requests-table', 'section.requests');
    let trs = $('tbody tr', '#requests-table');

    table.DataTable({
        ordering: true,
        order: [[1, 'asc']],
        paging: false,
        info: false,
        searching: false,
        language: { emptyTable: 'No requested service.' },
        columnDefs: [{
            orderable: false,
            targets: 5
        }],
    });

    $('input[name="search"]', 'section.requests').on('keyup', function() {
        let val = $(this).val().toLowerCase();
        let shown = trs.length;

        trs.each(function() {
            let _this = $(this);

            if (val) {
                let tds = _this.children('td[headers]:not([headers="action"], [id="empty-search"])');
                let show = false;

                for (let i = 0, n = tds.length; i < n && !show; i++) {
                    td = $(tds[i]);
                    
                    if (td.text().toLowerCase().indexOf(val) > -1) {
                        show = true;
                    }
                }
                
                if (show && _this.attr('style')) {
                    _this.removeAttr('style');

                    _this.addClass('flipInX').one(animationEnd, function() {
                        _this.removeClass('flipInX');
                    });
                }
                else if (!show) {
                    if (!_this.attr('style')) {
                        _this.addClass('flipOutX').one(animationEnd, function() {
                            _this.removeClass('flipOutX');
                            _this.prop('style', 'display: none !important;');
                        });
                    }

                    shown--;
                }
            }
            else {
                if (_this.attr('style')) {
                    _this.removeAttr('style');
                    _this.addClass('flipInX').one(animationEnd, function() {
                        $(this).removeClass('flipInX');
                    });
                }
            }
        });

        $('#empty-search', '#requests-table').remove();
        
        if (shown < 1) {
            $('tbody', '#requests-table').prepend(`
                <tr id="empty-search">
                    <td class="rounded-bottom" colspan=100>
                        Couldn\'t find anything for <span class="font-weight-bolder">${val}</span>
                    </td>
                </tr>
            `);
        }
    });
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
