/* files page collapse */
$(function() {
    $('a[data-toggle="collapse"][data-target="#folders-tree"]', '#folders-card').on('click', function() {
        let focus = $(this).find('i[class*="rotate-icon"]');

        if ($('#folders-tree').hasClass('show')) {
            focus.removeClass('fa-angle-up');
            focus.addClass('fa-angle-down');
        }
        else {
            focus.removeClass('fa-angle-down');
            focus.addClass('fa-angle-up');
        }
    });
});

// DataTable
$(function() {
    function tableInit() {
        let data = { 'order': 1, 'targets': 0 };
        let focus = $('#files-table');

        if (window.innerWidth <= 767.98) {
            data = { 'order': 1, 'targets': null };
        }
        else {
            data = { 'order': 1, 'targets': 0 };
        }

        focus.DataTable({
            ordering: true,
            order: [[data['order'], 'asc']],
            paging: false,
            info: false,
            searching: false,
            language: { emptyTable: 'No files or folders to display' },
            columnDefs: [{
                orderable: false,
                targets: data['targets']
            }],
        });
    }

    tableInit();

    let rows = $('tbody tr', '#files-table');
    let i = 1;

    $(rows[0]).removeClass('d-none');
    $(rows[0]).addClass('flipInX').one(animationEnd, function() {
        $(this).removeClass('flipInX');
        $(this).removeClass('d-none');
    });

    setInterval(function() {
        $(rows[i]).removeClass('d-none');
        $(rows[i]).addClass('flipInX').one(animationEnd, function() {
            $(this).removeClass('flipInX');
        });

        i++;

        if (i > rows.length - 1) {
            clearInterval(this);
        }
    }, 250);

    $(window).on('resize', function () {
        $('#files-table').DataTable().destroy();
        tableInit();

        $(function () {
            $(".sticky").sticky({
                topSpacing: 90,
                zIndex: 2,
                stopper: "footer"
            });
        });
    });
});

// Checkbox
$(function() {
    let focuses = $('input[type="checkbox"][name="fid"]', '#files-table');

    $('input[type="checkbox"]#checkAll', '#files-table').on('change', function() {
        if ($(this).prop('checked') === true) {
            focuses.prop('checked', true);
        }
        else {
            focuses.prop('checked', false);
        }

        $(focuses[0]).trigger('change');
    });

    focuses.on('change', function() {
        let focus = $('#cb-actions');
        let count = focuses.filter(':checked').length;

        $('#cb-count').text(count + ' Item(s) Selected');

        if (count > 0) {
            if (focus.hasClass('d-none')) {
                focus.removeClass('d-none');

                focus.addClass('fadeIn').one(animationEnd, function() {
                    $(this).removeClass('fadeIn');
                });
            }

            if (count > 1) {
                let find = focus.find('.download.list-group-item');
                
                if (!find.hasClass('d-none')) {
                    find.addClass('fadeOut').one(animationEnd, function() {
                        $(this).addClass('d-none');
                        $(this).removeClass('fadeOut');
                    });
                }

                find = focus.find('.comments.list-group-item');

                if (!find.hasClass('d-none')) {
                    find.addClass('fadeOut').one(animationEnd, function() {
                        $(this).addClass('d-none');
                        $(this).removeClass('fadeOut');
                    });
                }

                find = focus.find('.rename.list-group-item');

                if (!find.hasClass('d-none')) {
                    find.addClass('fadeOut').one(animationEnd, function() {
                        $(this).addClass('d-none');
                        $(this).removeClass('fadeOut');
                    });
                }
            }
            else {
                let find = focus.find('.list-group-item');

                find.removeClass('d-none');
                find.addClass('fadeIn').one(animationEnd, function() {
                    $(this).removeClass('fadeIn');
                });
            }
        }
        else {
            if (!focus.hasClass('d-none')) {
                focus.addClass('fadeOut').one(animationEnd, function() {
                    $(this).addClass('d-none');
                    $(this).removeClass('fadeOut');
                });
            }
        }
    });
});

// Search
$(function() {
    let focuses = $('input[name="search"]');

    focuses.on('keyup', function() {
        let tr = $('tbody tr', '#files-table');
        let val = $(this).val();

        // Tie both value and label animation together
        focuses.val(val);
        
        if ($(this).val() !== '') {
            $(focuses).next().addClass('active');
        }
        else {
            $(focuses).next().removeClass('active');
        }

        // Search function
        tr.each(function() {
            if (val){
                let td = $(this).children('td:not(.dropleft,:has(input))');
                let show = false;

                $(this).removeClass('fadeIn');
                $(this).removeClass('fadeOut');

                for (let i = 0; i < td.length && !show; i++) {
                    if ($(td[i]).text().toLowerCase().indexOf(val) > -1) {
                        show = true;
                    }
                }
                
                if (show && $(this).attr('style')) {
                    $(this).removeAttr('style');

                    $(this).addClass('flipInX').one(animationEnd, function() {
                        $(this).removeClass('flipInX');
                    });
                }
                else if (!show && typeof $(this).attr('style') === 'undefined') {
                    $(this).addClass('flipOutX').one(animationEnd, function() {
                        $(this).removeClass('flipOutX');
                        $(this).prop('style', 'display: none !important;');
                    });
                }
            }
            else {
                if ($(this).attr('style')) {
                    $(this).removeAttr('style');
                    $(this).addClass('flipInX').one(animationEnd, function() {
                        $(this).removeClass('flipInX');
                    });
                }
            }
        });
    });

    // Filters
    // ToDo: Fix Search Filters Not Propagating issue.
    $('.filter-all, .filter-name, .filter-size, .filter-type, .filter-shared, .filter-modified').on('click', function() {
        let _this = $(this);
        let sameId = $('[id=".' + $(this).attr('id') + '"]');

        switch (_this.attr('id')) {
            case 'filter-all':
                if (_this.is(':checked')) {
                    sameId.prop('checked', true);
                    $('.filter-name').prop('checked', true);
                    $('.filter-size').prop('checked', true);
                    $('.filter-type').prop('checked', true);
                    $('.filter-shared').prop('checked', true);
                    $('.filter-modified').prop('checked', true);
                }
                else {
                    sameId.prop('checked', false);
                    $('.filter-name').prop('checked', false);
                    $('.filter-size').prop('checked', false);
                    $('.filter-type').prop('checked', false);
                    $('.filter-shared').prop('checked', false);
                    $('.filter-modified').prop('checked', false);
                }
                break;
        
            default:
                break;
        }
    });

    // Desktop filter
    $('.search-filters', '#action-search').on('click', function(e) {
        e.stopPropagation();
    });

    // Mobile filter
    let dropdown = $('#mobile-action > .dropdown-menu');
    let filters = $('.search-filters', "#mobile-search");
    let filtersHeight = 0;

    $('.input-group', '#mobile-search').on('click', function(e) {
        filters.collapse('toggle');
    });

    filters.on('show.bs.collapse', function(e) {
        console.log(e.target.attr('class'));
        
        let translate3d = dropdown.css('transform').split(',');
        let tx = parseInt(translate3d[4]);
        let ty = parseInt(translate3d[5]);
        filtersHeight = filters.height();
        translate3d = 'translate3d(' + tx +'px, ' + (ty - filtersHeight) + 'px, 0px)';

        dropdown.css('transform', translate3d);
    });

    filters.on('hide.bs.collapse', function() {
        let translate3d = dropdown.css('transform').split(',');
        let tx = parseInt(translate3d[4]);
        let ty = parseInt(translate3d[5]);
        translate3d = 'translate3d(' + tx +'px, ' + (ty + filtersHeight) + 'px, 0px)';

        dropdown.css('transform', translate3d);
    });

    $('#mobile-search', '#mobile-action').on('click', function(e) {
        e.stopPropagation();
    });
});

// Show Modal if url contains modal id
$(function() {
    let focus = window.location.href.split('/').pop();
    
    if (focus === '%3Fupload') {
        history.replaceState(null, '', window.location.href.replace('/%3Fupload', ''));
        $('#uploadModal').modal('show');
    }
    else if (focus === '%3Fnewfile') {
        history.replaceState(null, '', window.location.href.replace('/%3Fnewfile', ''));
        $('#newFileModal').modal('show');
    }
    else if (focus === '%3Fnewfolder') {
        history.replaceState(null, '', window.location.href.replace('/%3Fnewfolder', ''));
        $('#newFolderModal').modal('show');
    }
});