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
                order: [[data['order'], 'desc']],
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

    // Show Modal if url contains modal id
    $(function() {
        let focus = window.location.href.split('/')[window.location.href.split('/').length - 1];
        
        if (focus == 'upload') {
            $('#uploadModal').modal('show');
        }
        else if (window.location.href.indexOf('#newFileModal') != -1) {
            $('#newFileModal').modal('show');
        }
        else if (window.location.href.indexOf('#newFolderModal') != -1) {
            $('#newFolderModal').modal('show');
        }
    });
});