$(function() {
    // tooltips
    $('[data-tooltip="tooltip"].material-tooltip-sm[data-placement="top"]').tooltip({
        template: '<div class="tooltip md-tooltip"><div class="tooltip-arrow md-arrow"></div><div class="tooltip-inner md-inner"></div></div>',
        offset: '10px 0'
    });

    $('[data-tooltip="tooltip"]').tooltip();
});