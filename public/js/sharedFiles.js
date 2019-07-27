// sharedFiles by Joel
// Files-Table DataTable
$(function() {
    if ($('#files-table').length > 0) {
        function filesTableInit(tableId) {
            let focus = $(tableId);

            focus.DataTable({
                ordering: true,
                order: [[1, 'asc']],
                paging: false,
                info: false,
                searching: false,
                language: { emptyTable: 'No files or folders to display' },
                columnDefs: [{
                    orderable: false,
                    targets: 0
                }],
            });

            if (focus.find('.dataTables_empty').length > 0) {
                focus.find('#check-all').prop('disabled', true);
            }
            else {
                focus.find('#check-all').prop('disabled', false);
            }
        }

        filesTableInit("#files-table");

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

            if (i === rows.length) {
                clearInterval(this);
            }
        }, 250);

        $(window).on('resize', function () {
            $('#files-table').DataTable().destroy();
            filesTableInit('#files-table');
        });
    }
});

// Search
$(function() {
    let searchInput = $('input[name="search"]');
    let trs = $('tbody tr', '#files-table');

    let filterCheckboxes = $('.filter-all, .filter-name, .filter-size, .filter-type, .filter-shared, .filter-modified');
    let filters = ['name', 'size', 'type', 'shared', 'modified'];

    // Filters
    $('.search-filters').on('click', function(e) {
        return false;
    });

    filterCheckboxes.parent().on('click', function() {
        let checkbox = $(this).children('input[type="checkbox"]');

        if (checkbox.is(':checked')) {
            if (checkbox.hasClass('filter-all')) {
                $('.filter-all').prop('checked', false);
                $('.filter-name').prop('checked', false);
                $('.filter-size').prop('checked', false);
                $('.filter-type').prop('checked', false);
                $('.filter-shared').prop('checked', false);
                $('.filter-modified').prop('checked', false);

                filters = [];
            }
            else {
                $('.filter-all').prop('checked', false);

                if (checkbox.hasClass('filter-name')) {
                    $('.filter-name').prop('checked', false);
    
                    filters.splice($.inArray('name', filters), 1);
                }
                else if (checkbox.hasClass('filter-size')) {
                    $('.filter-size').prop('checked', false);
    
                    filters.splice($.inArray('size', filters), 1);
                }
                else if (checkbox.hasClass('filter-type')) {
                    $('.filter-type').prop('checked', false);
    
                    filters.splice($.inArray('type', filters), 1);
                }
                else if (checkbox.hasClass('filter-shared')) {
                    $('.filter-shared').prop('checked', false);
    
                    filters.splice($.inArray('shared', filters), 1);
                }
                else if (checkbox.hasClass('filter-modified')) {
                    
                    $('.filter-modified').prop('checked', false);
    
                    filters.splice($.inArray('modified', filters), 1);
                }
            }
        }
        else {
            if (checkbox.hasClass('filter-all')) {
                checkbox.prop('checked', true);
                $('.filter-all').prop('checked', true);
                $('.filter-name').prop('checked', true);
                $('.filter-size').prop('checked', true);
                $('.filter-type').prop('checked', true);
                $('.filter-shared').prop('checked', true);
                $('.filter-modified').prop('checked', true);

                filters = ['name', 'size', 'type', 'shared', 'modified'];
            }
            else {
                if (checkbox.hasClass('filter-name')) {
                    $('.filter-name').prop('checked', true);
    
                    if (!filters.includes('name')) {
                        filters.push('name');
                    }
                }
                else if (checkbox.hasClass('filter-size')) {
                    $('.filter-size').prop('checked', true);
    
                    if (!filters.includes('size')) {
                        filters.push('size');
                    }
                }
                else if (checkbox.hasClass('filter-type')) {
                    $('.filter-type').prop('checked', true);
    
                    if (!filters.includes('type')) {
                        filters.push('type');
                    }
                }
                else if (checkbox.hasClass('filter-shared')) {
                    $('.filter-shared').prop('checked', true);
    
                    if (!filters.includes('shared')) {
                        filters.push('shared');
                    }
                }
                else if (checkbox.hasClass('filter-modified')) {
                    $('.filter-modified').prop('checked', true);
    
                    if (!filters.includes('modified')) {
                        filters.push('modified');
                    }
                }

                if (filters.length > 4) {
                    $('.filter-all').prop('checked', true);
                }
            }
        }

        autocomplete(searchInput, trs, filters);
        $('input[name="search"]').trigger('keyup');
        return false;
    });

    // Mobile filter
    $('button[data-toggle="dropdown"]', '#mobile-search').on('click', function() {
        let focus = $(this).next();
        
        if (focus.css('display') === 'none') {
            focus.toggle();

            focus.addClass('animated faster fadeIn').one(animationEnd, function() {
                $(this).removeClass('fadeIn');
            });
        }
        else {
            focus.addClass('animated faster fadeOut').one(animationEnd, function() {
                $(this).removeClass('fadeOut');
                focus.toggle();
            });
        }

        return false;
    });

    // Autocomplete
    autocomplete(searchInput, trs, filters);

    // Search Function
    searchInput.on('keyup', function() {
        let _this = $(this);
        let val = _this.val().toLowerCase();
        let shown = trs.length;

        // Tie both value and label state together
        searchInput.val(val);
        
        if (_this.val() !== '') {
            searchInput.parent().find('label').addClass('active');
        }
        else {
            searchInput.parent().find('label').removeClass('active');
        }

        trs.each(function() {
            let _this = $(this);

            if (val) {
                let tds = _this.children('td[headers]:not([headers="select"], [headers="actions"], [id="empty-search"])');
                let show = false;

                for (let i = 0, n = tds.length; i < n && !show; i++) {
                    td = $(tds[i]);
                    
                    if (td.text().toLowerCase().indexOf(val) > -1 && filters.includes(td.attr('headers'))) {
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

        $('#empty-search', '#files-table').remove();
        
        if (shown < 1) {
            $('tbody', '#files-table').prepend(
                '<tr id="empty-search">'
                +'<td colspan=100>'
                +'Couldn\t find anything for <span class="font-weight-bolder">' + val + '</span>'
                +'</td>'
                +'</tr>'
            );
        }
    });

    searchInput.next('.mdb-autocomplete-wrap').on('click', function() {
        $(this).prev('.mdb-autocomplete').trigger('keyup');
        $(this).html('');
    });

    searchInput.next().next('.mdb-autocomplete-clear').on('click', function() {
        $(this).prev().prev('.mdb-autocomplete').trigger('keyup');
    });

    // Search Autocomplete
    function autocomplete(searchInput, trs, filters) {
        let autocomplete = [];

        trs.each(function() {
            let tds = $(this).children('td:not([headers="select"], [headers="actions"])');

            for (let i = 0, n = tds.length; i < n; i++) {
                header = $(tds[i]).attr('headers');

                if (filters.includes(header)) {
                    if (!autocomplete.hasOwnProperty(header)) {
                        autocomplete[header] = [$(tds[i]).text()];
                    }
                    else {
                        autocomplete[header].push($(tds[i]).text());
                    }
                }
            }
        });

        let data = Object.keys(autocomplete).reduce(function(arr, k) {
            return Array.from(new Set(arr.concat(autocomplete[k])));
        }, []);

        let wrapper = $('.mdb-autocomplete-wrap', '#action-search, #mobile-search');
        wrapper.remove();

        searchInput.mdbAutocomplete({ data: data });

        if (wrapper.length > 0) {
            wrapper.on('click', function(e) {
                return false;
            });
        }
    }
});

// Mobile-Action
$(function() {
    let focus = $('#mobile-action');

    if (focus.length > 0) {
        let toTopAction = $('#to-top-action');

        $(window).on('resize', function() {
            if ($(window).width() < 768) {
                if (!toTopAction.hasClass('invisible')) {
                    toTopAction.addClass('invisible');
                }
            }
            else {
                if (toTopAction.hasClass('invisible')) {
                    toTopAction.removeClass('invisible');
                }
            }
        });
    
        $(window).scroll(function() {
            if (focus.offset().top - 47 > $('main').height()) {
                focus.css('bottom', '40px');
            }
            else {
                focus.css('bottom', '5px');
            }
        });
    
        $(window).trigger('resize');
    }
});