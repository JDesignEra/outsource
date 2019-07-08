// files by Joel
// Folders Card
$(function() {
    // My Folders Collapse
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

    // Folders Tree
    if (typeof tree !== 'undefined') {
        let insert = $('<ul class="treeview-animated-list mt-3"></ul>');
        
        tree.forEach((val) => {
            let li = insert.find(`[data-child="${val.parent}"]`);

            if (li.length < 1) {
                insert.append(
                    `<li class="text-capitalize" data-name="${val.name}" data-link="${val.link}" data-child="${val.child}" data-parent="${val.parent}">` +
                        `<a class="treeview-animated-element d-flex align-items-center" href="${val.link}">` +
                            `<i class="far fa-folder mr-2"></i>${val.name}` +
                        `</a>` +
                    `</li>`
                );
            }
            else {
                li = li.last();
                
                let parentName = li.attr('data-name'),
                    parentLink = li.attr('data-link');

                if (!li.hasClass('treeview-animated-items')) {
                    li.addClass('treeview-animated-items');
                    li.html(
                        `<a class="closed">` +
                            `<i class="fas fa-angle-right mr-2"></i>` +
                            `<i class="far fa-folder mr-2"></i>${parentName}` +
                        `</a>` +
                        `<ul class="nested">`+
                            `<div class="pt-2 pr-2">` +
                                `<a class="btn btn-sm btn-block btn-primary" href="${parentLink}">Open Folder</a>`+
                                `<hr class="mt-3 mb-2">` +
                            `</div>` +
                        `</ul>`
                    );
                }
                
                let ul = li.find('.nested').last();

                ul.append(
                    `<li class="text-capitalize" data-name="${val.name}" data-link="${val.link}" data-child="${val.child}" data-parent="${val.parent}">` +
                        `<a class="treeview-animated-element d-flex align-items-center" href="${val.link}">` +
                            `<i class="far fa-folder mr-2"></i>${val.name}` +
                        `</a>` +
                    `</li>`
                );
            }
        });

        tree = undefined;
        $('script#tree-script').remove();

        let path = '';

        decodeURI(window.location.pathname).split('/').forEach(val => {
            let target = insert.find('a[href]');
            path += val;
            
            target.each(function() {
                let _this = $(this);

                if (_this.attr('href') === path) {
                    _this.addClass('open');

                    let icon = _this.find('.fa-angle-right');
                    icon.addClass('down');

                    _this.parent().find('.nested').addClass('active');
                }
            });

            path += '/';
        });

        $('#folders-tree', '#folders-card').html(insert);

        $('[data-toggle="popover"]').popover();

        let target = $('.closed:not(.open) + .nested', '#folders-tree')
        target.hide();

        let elements = $('.treeview-animated-element', '#folders-tree');
        
        $('.closed', '#folders-tree').click(function () {
            _this = $(this);
            target = _this.siblings('.treeview-animated .nested');
            pointer = _this.children('.treeview-animated .fa-angle-right');
            _this.toggleClass('open');
            pointer.toggleClass('down');
            !target.hasClass('active') ? target.addClass('active').slideDown() : target.removeClass('active').slideUp();
            return false;
        });

        elements.click(function () {
            _this = $(this);
            _this.hasClass('opened') ? _this.removeClass('opened') : (elements.removeClass('opened'), _this.addClass('opened'));
        });
    }
});

// Files-Table DataTable
$(function() {
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

    // Checkbox
    let focuses = $('input[type="checkbox"][name="fid"]', '#files-table');
    let checked = focuses.filter(':checked');

    if (checked.length > 0) {
        setTimeout(function() {
            $(focuses[0]).trigger('change');
            
            clearTimeout(this);
        }, 250);
    }

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
        let checkboxAll = $('#check-all', '#files-table').last();
        let focus = $('.select-actions', '#mobile-action-menu, #action-card');
        let count = focuses.filter(':checked').length;

        $('.select-count', '#mobile-action-menu, #action-card').text(`${count} Item(s) Selected`);
        $('.move-count', '#moveModal').text(`Move ${count} file(s) or folder(s).`);
        
        if (count >= focuses.length) {
            checkboxAll.prop('checked', true);
        }
        else {
            checkboxAll.prop('checked', false);
        }
        
        if (count > 0) {
            focus.each(function() {
                _this = $(this);

                if (_this.hasClass('d-none')) {
                    if (_this.hasClass('animated')) {
                        _this.removeClass('d-none');
    
                        _this.addClass('flipInX').one(animationEnd, function() {
                            $(this).removeClass('flipInX');
                        });
                    }
                    else {
                        _this.removeClass('d-none');
                    }
                }
            });

            let singleActions = focus.find('.single-select');
            
            if (count > 1) {
                singleActions.each(function() {
                    _this = $(this);

                    if (!_this.hasClass('d-none')) {
                        if (_this.hasClass('animated')) {
                            _this.addClass('flipOutX').one(animationEnd, function() {
                                $(this).addClass('d-none');
                                $(this).removeClass('flipOutX');
                            });
                        }
                        else {
                            _this.addClass('d-none');
                        }
                    }
                });
            }
            else {
                singleActions.each(function() {
                    _this = $(this);

                    if (_this.hasClass('d-none')) {
                        if (_this.hasClass('animated')) {
                            _this.removeClass('d-none');

                            _this.addClass('flipInX').one(animationEnd, function() {
                                $(this).removeClass('flipInX');
                            });
                        }
                        else {
                            _this.removeClass('d-none');
                        }
                    }
                });
            }
        }
        else {
            focus.each(function() {
                _this = $(this);

                if (!_this.hasClass('d-none')) {
                    if (_this.hasClass('animated')) {
                        _this.addClass('flipOutX').one(animationEnd, function() {
                            $(this).addClass('d-none');
                            $(this).removeClass('flipOutX');
                        });
                    }
                    else {
                        _this.addClass('d-none');
                    }
                }
            });
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

// Mobile-Action
$(function() {
    let toTopAction = $('#to-top-action');
    let focus = $('#mobile-action');

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
});

// New File Extension Autocomplete
$(function() {
    if (typeof types !== 'undefined') {
        $('input[name="ext"]', '#newFileModal').mdbAutocomplete({ data: types });
        types = undefined;
        $('script#types-script').remove();
    }
});

// Action Buttons
$(function() {
    $('.copy-action, .delete-action').on('click', function() {
        let _this = $(this);
        let url = null;
        let form = $('#action-form');

        if (_this.hasClass('copy-action')) {
            url = form.attr('action') + '~copy';
        }
        else if (_this.hasClass('delete-action')) {
            url = form.attr('action') + '~delete';
        }
        
        form.attr('action', url);
        form.submit();
    });

    // Rename Modal, Move Modal
    $('#renameModal, #moveModal').on('show.bs.modal', function() {
        let focus = $(this).find('form');
        let td = $('td[headers="select"] input:checked', '#files-table').last();
        let inputName = focus.find('input[name="name"]');
        
        focus.find('input[name="fid"]').val(td.attr('data-id'));

        if (td.attr('data-name')) {
            let name = td.attr('data-name');
            name = name.slice(0, (name.lastIndexOf('.') > 0 ? name.lastIndexOf('.') : name.length));

            inputName.val(name);
            inputName.next().addClass('active');
        }
    })
});

// Show Modal if url contains modal id
$(function() {
    let url = window.location.href;
    param = url.slice(url.lastIndexOf('/'));
    
    if (param === '/~newfile') {
        history.replaceState(null, null, url.replace(/\/~newfile/gi, ''));
        $('#newFileModal').modal('show');
    }
    else if (param === '/~newfolder') {
        history.replaceState(null, null, url.replace(/\/~newfolder/gi, ''));
        $('#newFolderModal').modal('show');
    }
    else if (param === '/~rename') {
        history.replaceState(null, null, url.replace(/\/~rename/gi, ''));
        $('#renameModal').modal('show');
    }
    else if (param === '/~upload') {
        history.replaceState(null, null, url.replace(/\/~upload/gi, ''));
        $('#uploadModal').modal('show');
    }
});