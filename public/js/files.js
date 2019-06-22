/* files page collapse */
$(function() {
    $('a[data-toggle="collapse"]', '.treeview').on('click', function() {
        let focus = $(this).find('i[class*="rotate-icon"]');

        if ($('#folders', '.treeview').hasClass('show')) {
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
    function initDataTable() {
        let options = { 'order': 1, 'targets': 0 };
        let focus = $('#files-table');
        
        focus.find('td.dataTables_empty').text('No files & folder to display.');

        if (window.innerWidth <= 767.98) {
            options = { 'order': 1, 'targets': null };
        }
        else {
            options = { 'order': 1, 'targets': 0 };
        }

        focus.DataTable({
            ordering: true,
            order: [[options['order'], 'asc']],
            paging: false,
            info: false,
            searching: false,
            language: { emptyTable: 'No files or folders to display' },
            columnDefs: [{
                orderable: false,
                targets: options['targets']
            }],
        });
    }

    initDataTable();

    let focuses = $('tbody tr', '#files-table');
    let i = 1;

    $(focuses[0]).removeClass('d-none');
    $(focuses[0]).addClass('flipInX').one(animationEnd, function() {
        $(this).removeClass('flipInX');
        $(this).removeClass('d-none');
    });

    setInterval(function() {
        $(focuses[i]).removeClass('d-none');
        $(focuses[i]).addClass('flipInX').one(animationEnd, function() {
            $(this).removeClass('flipInX');
        });

        i++;

        if (i > focuses.length - 1) {
            clearInterval(this);
        }
    }, 250);

    $(window).on('resize', function() {
        focus.DataTable().destroy();

        initDataTable();

        $(function() {
            $(".sticky").sticky({
                topSpacing: 90,
                zIndex: 2,
                stopper: "footer"
            });
        });
    });

    $('.dataTables_length').addClass('bs-select');
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

        focuses.get(0).trigger('change');
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

    // $('input[name="search"]').mdbAutocomplete({
    //     data: [
    //         'name: ',
    //         'modified: ',
    //         'size: ',
    //         'shared: ',
    //         'type: ',
    //     ],
    //     inputFocus: '1px solid #ac85f0',
    //     inputFocusShadow: '0 1px 0 0 #ac85f0',
    // });

    focuses.on('keyup', function() {
        let tr = $('tbody tr', '#files-table');
        let val = $(this).val();

        tr.each(function() {
            if (val){
                let td = $(this).children('td:not(.dropleft,:has(input))');
                let show = false;

                $(this).removeClass('fadeIn');
                $(this).removeClass('fadeOut');

                for (let i = 0; i < td.length && !show; i++) {
                    if (td.get(i).text().toLowerCase().indexOf(val) > -1) {
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