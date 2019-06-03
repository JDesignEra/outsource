// Animation End Fix
let animationEnd = (function (el) {
    let animations = {
        "animation": "animationend",
        "OAnimation": "oAnimationEnd",
        "MozAnimation": "mozAnimationEnd",
        "WebkitAnimation": "webkitAnimationEnd"
    };

    for (var t in animations) {
        if (el.style[t] !== undefined) {
            return animations[t];
        }
    }
})(document.createElement("fakeelement"));

$(document).ready(function () {
    // Joel
    // ToTop Button
    $(window).scroll(function () {
        let focus = $('#toTopAction');

        if ($('nav.navbar').offset().top > 100 && focus.hasClass('d-none')) {
            focus.removeClass('d-none');

            focus.addClass('fadeIn').one(animationEnd, function () {
                $(this).removeClass('fadeIn');
            });
        }
        else if (!focus.hasClass('d-none')) {
            focus.addClass('fadeOut').one(animationEnd, function () {
                $(this).addClass('d-none');
                $(this).removeClass('fadeOut');
            });
        }
    });

    // File(s) Upload
    $(function () {
        let focuses = [];

        if ($('form.files-upload')[0] !== undefined) {
            focuses = focuses.concat($('form.files-upload').toArray());
        }

        if ($('form.file-upload')[0] !== undefined) {
            focuses = focuses.concat($('form.file-upload').toArray());
        }

        for (let i = 0; i < focuses.length; i++) {
            let input = $(focuses[i]).find(['input[type=file]']);
            let feedback = $(focuses[i]).find('.feedback');

            $(document).on({
                'dragover': function (e) {
                    e.preventDefault();
                },
                'dragleave': function (e) {
                    e.preventDefault();
                },
                'drop': function (e) {
                    e.preventDefault();
                    
                    let uploads = e.originalEvent.dataTransfer.files || (e.dataTransfer && e.dataTransfer.files) || e.target.files;
                    let error;
                    feedback.addClass('d-none');

                    if (!$(focuses[i]).hasClass('file-upload') && uploads.length > 1) {
                        error = 'Only 1 file upload is allowed';
                    }
                    else {
                        for (let x = 0; x < uploads.length; x++) {
                            if (uploads[i].size > 5368709120) {
                                error = 'File size cannot exceed 5GB.';
                            }

                            if (error !== undefined) {
                                $(input).prop('files', uploads);
                                console.log($(input).attr('files'));
                            }
                        }
                    }
                },
                'onclick': function() {
                    $(input).click();
                },
            }, focuses[i]);

            $(document).on('change', input, function() {
                $(focus[i]).submit();
            });
        }
    });

    // Tooltips
    $(function () {
        $('[data-tooltip="tooltip"].material-tooltip-sm[data-placement="top"]').tooltip({
            template: '<div class="tooltip md-tooltip"><div class="tooltip-arrow md-arrow"></div><div class="tooltip-inner md-inner"></div></div>',
            offset: '10px, 0'
        });

        $('[data-tooltip="tooltip"]').tooltip();
    });

    /* Lemuel */
    $(function () {
        objectFitImages();

        jarallax(document.querySelectorAll('.jarallax'));

        jarallax(document.querySelectorAll('.jarallax-keep-img'), {
            keepImg: true,
        });
    });

    $('#posterUpload').on('change', function () {
        let image = $("#posterUpload")[0].files[0];
        let formdata = new FormData();
        formdata.append('posterUpload', image);
        $.ajax({
            url: '/video/upload',
            type: 'POST',
            data: formdata,
            contentType: false,
            processData: false,
            'success': (data) => {
                $('#poster').attr('src', data.file);
                $('#posterURL').attr('value', data.file);// sets posterURL hidden field
                if (data.err) {
                    $('#posterErr').show();
                    $('#posterErr').text(data.err.message);
                } else {
                    $('#posterErr').hide();
                }
            }
        });
    });
});