// files by Joel
// files page collapse
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
    function tableInit(tableId) {
        let data = { 'order': 1, 'targets': 0 };
        let focus = $(tableId);

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

    tableInit("#files-table");

    let tableResponsive = $('.table-responsive', '#files-card');
    let rows = $('tbody tr', '#files-table');
    let i = 1;

    tableResponsive.addClass('overflow-x-hidden');

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
            setTimeout(function() {
                tableResponsive.removeClass('overflow-x-hidden');
                clearTimeout(this);
            }, 500);
            
            clearInterval(this);
        }
    }, 250);

    $(window).on('resize', function () {
        $('#files-table').DataTable().destroy();
        tableInit('#files-table');

        $(function () {
            $(".sticky").sticky({
                topSpacing: 90,
                zIndex: 2,
                stopper: "footer"
            });
        });
    });

    // Checkbox
    let focuses = $('input[type="checkbox"][name="fid"]', '#files-table');

    $('input#check-all', '#files-table').on('change', function() {
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
            else if (checkbox.hasClass('filter-name')) {
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
            else if (checkbox.hasClass('filter-name')) {
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
        }

        autocomplete(searchInput, trs, filters);
        $('input[name="search"]').trigger('keyup');
        return false;
    });

    // Mobile filter
    $('button[data-toggle]', '#mobile-search').on('click', function() {
        $(this).next().toggle();
        return false;
    });

    // Autocomplete
    autocomplete(searchInput, trs, filters);

    // Search Function
    searchInput.on('keyup', function() {
        let _this = $(this);
        let val = _this.val().toLowerCase();

        // Tie both value and llabel state together
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
                let tds = _this.children('td:not([headers="select"], [headers="actions"])');
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
                else if (!show && typeof _this.attr('style') === 'undefined') {
                    _this.addClass('flipOutX').one(animationEnd, function() {
                        _this.removeClass('flipOutX');
                        _this.prop('style', 'display: none !important;');
                    });
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
    });

    // Autocomplete
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

        let wrapper = $('.mdb-autocomplete-wrap');
        wrapper.remove();

        searchInput.mdbAutocomplete({ data: data });

        if (wrapper.length > 0) {
            wrapper.on('click', function(e) {
                return false;
            });
        }
    }
});

// Show Modal if url contains modal id
$(function() {
    let url = window.location.href;
    param = url.slice(url.lastIndexOf('/'));
    
    if (param === '/~upload') {
        history.replaceState(null, null, url.replace(/\/~upload/gi, ''));
        $('#uploadModal').modal('show');
    }
    else if (param === '/~newfile') {
        $('#newFileModal').modal('show');
        history.replaceState(null, null, url.replace(/\/~newfile/gi, ''));
    }
    else if (param === '/~newfolder') {
        history.replaceState(null, null, url.replace(/\/~newfolder/gi, ''));
        $('#newFolderModal').modal('show');
    }
});