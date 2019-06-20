/* files page collapse */
$(function() {
    let focus = 'section.files a[data-toggle="collapse"]';

    $(focus).collapse('show');
    $(focus).on('click', function () {
        focus = $(this).find('i[class*="rotate-icon"]');

        if ($('section.files #treeContent').hasClass('show')) {
            $(focus).removeClass('fa-angle-up');
            $(focus).addClass('fa-angle-down');
        }
        else {
            $(focus).removeClass('fa-angle-down');
            $(focus).addClass('fa-angle-up');
        }
    });
});

// DataTable
$(function() {
    function dataTable() {
        let data = { 'order': 1, 'targets': 0 };
        let focus = $('#filesTable');
        focus.find('td.dataTables_empty').text('No files & folder to display.');

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

    dataTable();

    $(window).on('resize', function () {
        $('#filesTable').DataTable().destroy();
        dataTable();

        $(function () {
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
    $('input[type="checkbox"]#checkAll').on('change', function() {
        let focuses = $('input[type="checkbox"][name="fid"]');

        if ($(this).prop('checked') === true) {
            $(focuses).prop('checked', true);
        }
        else {
            $(focuses).prop('checked', false);
        }

        $(focuses[0]).trigger('change');
    });

    $('input[type="checkbox"][name="fid"]').on('change', function() {
        let focus = $('#cb-actions');
        let count = $('input[type="checkbox"][name="fid"]').filter(':checked').length;

        $('#cb-count').text(count + ' Item(s) Selected')

        if (count > 0) {
            if ($(focus).hasClass('d-none')) {
                $(focus).removeClass('d-none');

                $(focus).addClass('fadeIn').one(animationEnd, function() {
                    $(this).removeClass('fadeIn');
                })
            }
        }
        else {
            if (!$(focus).hasClass('d-none')) {
                $(focus).addClass('fadeOut').one(animationEnd, function() {
                    $(this).addClass('d-none');
                    $(this).removeClass('fadeOut');
                })
            }
        }
    });
});

// Show Modal if url contains modal id
$(function() {
    let focus = window.location.href.split('/')[window.location.href.split('/').length - 1];
    
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