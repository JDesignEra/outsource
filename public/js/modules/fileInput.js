// File(s) Upload by Joel
let fileInput = (function() {
    'use strict';
    let publicFuncs = {};
    
    publicFuncs.init = function() {
        let focuses = [];

        if ($('.files-upload')[0] !== undefined) {
            focuses = focuses.concat($('.files-upload').toArray());
        }

        if ($('.file-upload')[0] !== undefined) {
            focuses = focuses.concat($('.file-upload').toArray());
        }

        $(focuses).each(function (i) {
            $(focuses[i]).prepend('<div class="wrapper card card-body primary-gradient view overlay text-center z-depth-2">' +
                '<div class="mask rgba-black-slight" style=""></div>' +
                '<div class="card-text">' +
                '<i class="fas fa-cloud-upload-alt fa-5x"></i>' +
                '<p class="font-weight-bolder">Drag and drop a file here or click</p>' +
                '</div>' +
                '<button type="button" class="btn btn-sm btn-danger remove">' +
                '<i class="far fa-trash-alt mr-1"></i> Remove' +
                '</button>' +
                '<div class="preview">' +
                '<span class="renderer"></span>' +
                '<div class="infos">' +
                '<div class="infos-inner">' +
                '<p class="filename"></p>' +
                '<p class="message">Drag and drop or click to replace</p>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="invalid-tooltip animated shake" style="margin-top: -2.5rem;"></div>' +
                '</div>');

            // Attach EvenListener
            let input = $(focuses[i]).children('input[type=file]')[0];
            let wrapper = $(focuses[i]).children('.wrapper')[0];
            let invalid = $(wrapper).children('.invalid-tooltip');
            let preview = $(wrapper).children('.preview');
            let renderer = $(preview).children('.renderer');
            $(focuses[i]).on({
                'dragover dragenter': function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    e.originalEvent.dataTransfer.dropEffect = 'copy';

                    reset(focuses[i]);
                },
                'dragleave dragexit': function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    reset(focuses[i]);
                },
                'drop': function (e) {
                    e.preventDefault();
                    e.originalEvent.dataTransfer.dropEffect = 'copy';

                    let error;
                    let files = e.originalEvent.dataTransfer.files || (event.dataTransfer && event.dataTransfer.files) || e.target.files;
                    
                    if ($(focuses[i]).hasClass('file-upload') && files.length > 1) {
                        error = 'Only 1 file upload is allow.';
                    }
                    else if ($(input).attr('accept')) {
                        let validation = new RegExp($(input).attr('accept').replace(/\s/g, '').replace(',', '|'));

                        for (let x = 0; x < files.length; x++) {
                            if (!validation.test(files[x].type)) {
                                error = 'File type is not allow, for ' + files[x].name + '.';
                            }
                        }
                    }
                    else {
                        for (let x = 0; x < files.length; x++) {
                            if (files[x].size > 5368709120) {
                                error = 'File size cannot exceed 5GB, for ' + files[x] + '.';
                            }
                        }
                    }
                    if (error === undefined) {
                        $(input).prop('files', files);
                        $(input).trigger('change');
                    }
                    else {
                        invalid.text(error);
                        invalid.addClass('d-block');
                    }
                },
                'click': function (e) {
                    $(input).trigger('click');
                },
            });

            // On file input change
            $(input).on('change', function () {
                let file = input.files[0];
                
                // Render image or file extension icon, and overlay text.
                if (file && file.type.match(/image\//)) {
                    let reader = new FileReader();

                    reader.onload = function (e) {
                        $(renderer).html('<img src="' + e.target.result + '" />');
                    };
                    reader.readAsDataURL(file);
                }
                else {
                    let extension = file.name.split('.').pop();
                    $(renderer).html('<i class="fas fa-file"><span class="extension">' + extension + '</span></i>');
                }

                let filesName = [];

                for (let x = 0; x < input.files.length; x++) {
                    filesName.push(input.files[x].name);
                }

                $(focuses[i]).children('.wrapper').addClass('has-preview');
                $(preview).find('.filename').html(filesName.join('<br />'));
                $(preview).addClass('d-block');

                // Find parent form of current element and submit.
                let findForm = $(focuses[i]);

                if ($(focuses[i]).data('autosubmit') != false) {
                    while (!$(findForm).is('form')) {
                        findForm = $(findForm).parent();
                    }

                    $(findForm).submit();
                }
            });
            
            $(focuses[i]).hover(function () {
                if ($(renderer).has('img')) {
                    $(preview).removeClass('d-none');
                }
            });

            // Attach EventListener to button remove.
            let btnRemove = $(focuses[i]).find('button.remove');

            $(btnRemove).on('click', function (e) {
                e.stopPropagation();
                reset(focuses[i]);
            });
            
            // Prevent Bubbling Event
            $(input).on('click', function (e) {
                e.stopPropagation();
                $(input).val(null);
            });
        });
    }

    let reset = function (focus) {
        let input = $(focus).find('input[type=file]');
        let invalid = $(focus).find('.invalid-tooltip');
        let wrapper = $(focus).find('.wrapper');
        let preview = $(focus).find('.preview');
        let renderer = $(focus).find('.renderer');
        let filename = $(focus).find('filename');
    
        $(input).val(null);
        $(invalid).removeClass('d-block');
        $(wrapper).removeClass('has-preview');
        $(preview).removeClass('d-block');
        $(renderer).empty();
        $(filename).empty();
    }

    return publicFuncs;
});