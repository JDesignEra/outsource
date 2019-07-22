// files by Joel
// Folders Card
$(function() {
    // My Drive Collapse
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
        let insert = $('<ul class="treeview-animated-list mt-2"></ul>');
        let dirData = [];

        insert.prepend(
            `<li class="text-capitalize">
                <a class="treeview-animated-element d-flex align-items-center" href="/files">
                    <i class="far fa-hdd mr-2"></i>View My Drive
                </a>
            </li>`
        );

        tree.forEach((val) => {
            // Build move-modal and copy-modal directory input autocomplete data
            dirData.push(val.child.slice(1));

            // Build Tree UI
            let li = insert.find(`[data-child="${val.parent}"]`);

            if (li.length < 1) {
                insert.append(
                    `<li class="text-capitalize" data-name="${val.name}" data-link="${val.link}" data-child="${val.child}" data-parent="${val.parent}">
                        <a class="treeview-animated-element d-flex align-items-center" href="${val.link}">
                            <i class="far fa-folder mr-2"></i>${val.name}
                        </a>
                    </li>`
                );
            }
            else {
                li = li.last();
                
                let parentName = li.attr('data-name'),
                    parentLink = li.attr('data-link');

                if (!li.hasClass('treeview-animated-items')) {
                    li.addClass('treeview-animated-items');
                    li.html(`
                        <a class="closed">
                            <i class="fas fa-angle-right mr-2 ml-2"></i>
                            <i class="far fa-folder mr-2"></i>${parentName}
                        </a>
                        <ul class="nested"></ul>
                    `);
                }
                
                let ul = li.find('.nested').last();

                ul.append(`
                    <li class="text-capitalize" data-name="${val.name}" data-link="${val.link}" data-child="${val.child}" data-parent="${val.parent}">
                        <a class="treeview-animated-element d-flex align-items-center" href="${val.link}">
                            <i class="far fa-folder mr-2"></i>${val.name}
                        </a>
                    </li>

                    <li class="text-capitalize">
                        <a class="treeview-animated-element d-flex align-items-center parent-folder" href="${parentLink}">
                            <i class="far fa-folder-open mr-2"></i>Open This Folder
                        </a>
                    </li>
                `);
            }
        });

        // Init move-modal and copy-modal autocomplete
        $('input[name="directory"]').mdbAutocomplete({ data: dirData });

        tree = undefined;
        $('script#tree-script').remove();

        let path = '';

        decodeURI(window.location.pathname).split('/').forEach(val => {
            let target = insert.find('a[href]:not(.parent-folder)');
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

    // Shared-Tree
    if (typeof shareTree !== 'undefined') {
        let insert = $('<ul class="treeview-animated-list mt-2"></ul>');

        insert.prepend(
            `<li class="text-capitalize">
                <a class="treeview-animated-element d-flex align-items-center" href="/files">
                    <i class="far fa-users mr-2"></i>View Share Drive
                </a>
            </li>`
        );

        shareTree.forEach((val) => {
            // Build Share Tree UI
            let li = insert.find(`[data-child="${val.parent}"]`);

            if (li.length < 1) {
                insert.append(
                    `<li class="text-capitalize" data-name="${val.name}" data-link="${val.link}" data-child="${val.child}" data-parent="${val.parent}">
                        <a class="treeview-animated-element d-flex align-items-center" href="${val.link}">
                            <i class="far fa-folder mr-2"></i>${val.name}
                        </a>
                    </li>`
                );
            }
            else {
                li = li.last();
                
                let parentName = li.attr('data-name'),
                    parentLink = li.attr('data-link');

                if (!li.hasClass('treeview-animated-items')) {
                    li.addClass('treeview-animated-items');
                    li.html(`
                        <a class="closed">
                            <i class="fas fa-angle-right mr-2 ml-2"></i>
                            <i class="far fa-folder mr-2"></i>${parentName}
                        </a>
                        <ul class="nested"></ul>
                    `);
                }
                
                let ul = li.find('.nested').last();

                ul.append(`
                    <li class="text-capitalize" data-name="${val.name}" data-link="${val.link}" data-child="${val.child}" data-parent="${val.parent}">
                        <a class="treeview-animated-element d-flex align-items-center" href="${val.link}">
                            <i class="far fa-folder mr-2"></i>${val.name}
                        </a>
                    </li>

                    <li class="text-capitalize">
                        <a class="treeview-animated-element d-flex align-items-center parent-folder" href="${parentLink}">
                            <i class="far fa-folder-open mr-2"></i>Open This Folder
                        </a>
                    </li>
                `);
            }
        });

        shareTree = undefined;
        $('script#share-tree-script').remove();

        let path = '';

        decodeURI(window.location.pathname).split('/').forEach(val => {
            let target = insert.find('a[href]:not(.parent-folder)');
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
        
        $('#share-tree', '#folders-card').html(insert);

        let target = $('.closed:not(.open) + .nested', '#share-tree')
        target.hide();

        let elements = $('.treeview-animated-element', '#share-tree');
        
        $('.closed', '#share-tree').click(function () {
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

    // Checkboxes
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
        let singleActions = focus.find('.single-select');
        let selectCount = focus.find('.select-count');
        let checked = focuses.filter(':checked');
        let count = checked.length;

        if (count >= focuses.length) {
            checkboxAll.prop('checked', true);
        }
        else {
            checkboxAll.prop('checked', false);
        }

        if (count < 1) {
            selectCount.html(`${count} Item Selected`);
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

            selectCount.html(`${count} Item Selected<i class="far fa-check ml-2"></i>`);
            
            // Download link
            if (count === 1) {
                let downloadAction = singleActions.find('a.download');
                
                downloadAction.attr('href', `${window.location.pathname}/${checked.last().attr('data-id')}/~download`);
            }
            
            if (count > 1) {
                selectCount.html(`${count} Items Selected<i class="far fa-check ml-2"></i>`);

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
        $('input[name="ext"]', '#newfile-modal').mdbAutocomplete({ data: types });
        types = undefined;
        $('script#types-script').remove();
    }
});

// Action Buttons
$(function() {
    // Delete
    $('.delete-action').on('click', function() {
        let form = $('#action-form');
        
        form.attr('action', form.attr('action') + '~delete');
        form.submit();
    });

    // Copy and Move Modal
    $('#move-modal, #copy-modal').on('show.bs.modal', function() {
        let modalId = $(this).attr('id');
        let form = $(this).find('form');
        let td = $('td[headers="select"] input:checked', '#files-table');
        let ids = [];
        
        td.each(function() {
            ids.push($(this).attr('data-id'));
        });

        ids = ids.join(',');
        ids = ids[ids.length - 1] === ',' ? ids.slice(0, ids.length - 1) : ids;

        form.find('input[name="fid"]', `#${modalId}`).val(ids);
    });

    // Share Modal's Users Autocomplete
    if (typeof users !== 'undefined') {
        $('input[name="shareUser"]', '#share-modal').mdbAutocomplete({ data: users });
        
        users = undefined;
        $('script#users-script').remove();
    }

    // Rename and Share Modal
    $('#rename-modal, #share-modal').on('show.bs.modal', function() {
        let modalId = $(this).attr('id');
        let form = $(this).find('form');
        let td = $('td[headers="select"] input:checked', '#files-table').last();
        
        form.find('input[name="fid"]', `#${modalId}`).val(td.attr('data-id'));

        if (modalId === 'rename-modal') {
            let input = form.find('input[name="rename"]');
            
            if (td.attr('data-name')) {
                let name = td.attr('data-name');
                name = name.slice(0, (name.lastIndexOf('.') > 0 ? name.lastIndexOf('.') : name.length));
    
                if (!input.val()) {
                    input.val(name);
                }
    
                input.next().addClass('active');
            }
        }
        else if (modalId === 'share-modal') {
            let share = {
                uids: td.attr('data-share-uids'),
                usernames: td.attr('data-share-usernames'),
                emails: td.attr('data-share-emails')
            };

            if (share['uids'] && share['usernames'] && share['emails']) {
                let table = $('#share-users-table', '#share-modal');
                let tbody = table.find('tbody');

                share['uids']  = share['uids'].split(',');
                share['usernames'] = share['usernames'].split(',');
                share['emails'] = share['emails'].split(',');

                $('.share-users', '#share-modal').removeClass('d-none');
                
                for (let i = 0, n = share['uids'].length; i < n; i++) {
                    // ToDo: profile picture
                    let uid = share['uids'][i];
                    let username = share['usernames'][i];
                    let email = share['emails'][i];

                    tbody.append(`
                        <tr>
                            <td headers="share-select">
                                <div class="form-check">
                                    <input id="su-${uid}" class="form-check-input" type="checkbox" name="uid" value="${uid}">
                                    <label class="form-check-label" for="su-${uid}"></label>
                                </div>
                            </td>
                            <td headers="share-username">
                                ${username}
                            </td>
                            <td headers="share-email">
                                ${email}
                            </td>
                        </tr>
                    `);
                }
                
                // Init or Re-init DataTable
                table.DataTable().destroy();

                table.DataTable({
                    ordering: true,
                    order: [[1, 'asc']],
                    paging: false,
                    info: false,
                    searching: false,
                    language: { emptyTable: 'Not shared with any user yet.' },
                    columnDefs: [{
                        orderable: false,
                        targets: 0
                    }],
                });

                // Checkboxes
                let checkall = table.find('#check-all-share-user');
                let checkboxes = table.find('td[headers="share-select"] input[type="checkbox"]');
                
                checkboxes.on('change', function() {
                    let removeBtn = $('.share-users button[type="submit"]', '#share-modal');
                    let checked = checkboxes.filter(':checked');
                    let count = checked.length;
                    
                    if (count > 0) {
                        if (removeBtn.hasClass('d-none')) {
                            removeBtn.removeClass('d-none');

                            removeBtn.addClass('bounceIn').one(animationEnd, function() {
                                $(this).removeClass('bounceIn');
                            });
                        }
                    }
                    else {
                        removeBtn.addClass('bounceOut').one(animationEnd, function() {
                            $(this).addClass('d-none');
                            $(this).removeClass('bounceOut');
                        });
                    }

                    if (count >= checkboxes.length) {
                        checkall.prop('checked', true);
                    }
                    else {
                        checkall.prop('checked', false);
                    }
                });

                // Check All
                checkall.on('click', function() {
                    let _this = $(this);
                    
                    if (_this.prop('checked')) {
                        _this.prop('checked', true);
                        checkboxes.prop('checked', true);
                    }
                    else {
                        _this.prop('checked', false);
                        checkboxes.prop('checked', false);
                    }

                    $(checkboxes[0]).trigger('change');
                });
            }
            else {
                $('.share-users', '#share-modal').addClass('d-none');
            }

            // Share Code
            let code = td.attr('data-share-code') ? td.attr('data-share-code') : null;

            if (code) {
                let footer = $(this).find('.modal-footer');
                let left = footer.find('.text-left:not(.text-md-right)', '.row');
                let right = footer.find('.text-md-right', '.row');

                let fid = footer.find('input[name="fid"]').last().val();
                let url = `${window.location.host}/${fid}/${code}/~shared`;

                // Left-Col
                let icon = left.find('i').clone();
                icon.removeClass('fa-unlink');
                icon.addClass('fa-link');

                left.html(`
                    ${icon[0].outerHTML}
                    <span class="align-middle cursor-default material-tooltip-sm" data-tooltip="tooltip" data-placement="bottom" title="${url}">
                        Share link created
                    </span>
                `);

                $('[data-tooltip="tooltip"].material-tooltip-sm').tooltip({
                    template: '<div class="tooltip md-tooltip"><div class="tooltip-arrow md-arrow"></div><div class="tooltip-inner md-inner"></div></div>'
                });

                // Right-Col
                right.html(`
                    <button class="btn btn-md btn-primary m-0 waves-effect waves-light" type="button">
                        <i class="far fa-clipboard mr-2"></i>Copy Link
                    </button>
                    <button class="btn btn-md btn-danger m-0 waves-effect waves-light" type="submit">
                        <i class="far fa-unlink mr-2"></i>Remove Share Link
                    </button>
                `);
                
                let copyBtn = right.find('button[type="button"]');

                copyBtn.on('click', function() {
                    let focus = $('.modal-footer', '#share-modal');
                    focus.append(`<input type="text" name="clipboard" value="${url}">`);

                    let clipboardInput = focus.find('input[name="clipboard"]');
                    clipboardInput.select();
                    document.execCommand('copy');
                    clipboardInput.remove();

                    toastr['success']('Share link copied.', null, {
                        'closeButton': true,
                        'progressBar': true,
                        'newestOnTop': true,
                        'hideDuration': 300,
                        'timeOut': 2000,
                        'extendedTimeOut': 1000
                    });
                });
            }
        }
    })
});

// Show Modal if url contains modal id
$(function() {
    let url = window.location.href;
    param = url.slice(url.lastIndexOf('/'));
    
    if (param === '/~addshareuser') {
        history.replaceState(null, null, url.replace(/\/~addshareuser/gi, ''));
        $('#share-modal').modal('show');
    }
    else if (param === '/~copy') {
        history.replaceState(null, null, url.replace(/\/~copy/gi, ''));
        $('#copy-modal').modal('show');
    }
    else if (param === '/~delshareuser') {
        history.replaceState(null, null, url.replace(/\/~delshareuser/gi, ''));
        $('#share-modal').modal('show');
    }
    else if (param === '/~move') {
        history.replaceState(null, null, url.replace(/\/~move/gi, ''));
        $('#move-modal').modal('show');
    }
    else if (param === '/~newfile') {
        history.replaceState(null, null, url.replace(/\/~newfile/gi, ''));
        $('#newfile-modal').modal('show');
    }
    else if (param === '/~newfolder') {
        history.replaceState(null, null, url.replace(/\/~newfolder/gi, ''));
        $('#newfolder-modal').modal('show');
    }
    else if (param === '/~rename') {
        history.replaceState(null, null, url.replace(/\/~rename/gi, ''));
        $('#rename-modal').modal('show');
    }
    else if (param === '/~sharecode') {
        history.replaceState(null, null, url.replace(/\/~sharecode/gi, ''));
        $('#share-modal').modal('show');
    }
    else if (param === '/~upload') {
        history.replaceState(null, null, url.replace(/\/~upload/gi, ''));
        $('#upload-modal').modal('show');
    }
});