$(document).ready(function () {
    /* files page collapse */
    (function() {
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
    (function() {
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
                order: [[data['order'], 'desc']],
                paging: false,
                info: false,
                searching: false,
                columnDefs: [{
                    orderable: false,
                    targets: data['targets']
                }],
            });
        }
    
        dataTable();
    
        $(window).on('resize', function () {
            focus.DataTable().destroy();
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

    // Show Modal if url contains modal id
    (function() {
        if (window.location.href.indexOf('#newFileModal') != -1) {
            $('#newFileModal').modal('show');
        }
        else if (window.location.href.indexOf('#newFolderModal') != -1) {
            $('#newFolderModal').modal('show');
        }
    });
});