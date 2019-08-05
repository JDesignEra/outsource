// File(s) Upload by Joel
let fileInput = (function () {
    'use strict';
    let publicFuncs = {};

    publicFuncs.init = function () {
        let focuses = $('.files-upload, .file-upload');

        focuses.each(function () {
            let _this = $(this);

            let removeBtn = _this.data('autosubmit') && _this.data('autosubmit') == false ? `
                <button type="button" class="btn btn-sm btn-danger remove">
                    <i class="far fa-trash-alt mr-1"></i> Remove
                </button>
            ` : '';

            _this.prepend(`
                <div class="wrapper card card-body primary-gradient view overlay text-center z-depth-2">
                    <div class="progress md-progress secondary-color rounded-0 d-none" style="position: absolute; top: 0; height: .5rem; z-index: 2;">
                        <div class="indeterminate teal"></div>
                    </div>

                    <div class="mask rgba-black-slight" style=""></div>

                    <div class="card-text">
                        <i class="fas fa-cloud-upload-alt fa-5x"></i>
                        <p class="font-weight-bolder">Drag and drop a file here or click</p>
                    </div>

                    ${removeBtn}
                    
                    <div class="preview deep-purple accent-3">
                        <span class="renderer"></span>
                        <div class="infos">
                            <div class="infos-inner">
                                <p class="filename"></p>
                                <p class="message">Drag and drop or click to replace</p>
                            </div>
                        </div>
                    </div>

                    <div class="invalid-tooltip animated shake" style="margin-top: -2.5rem;"></div>
                </div>
            `);

            // Attach EvenListener
            let input = _this.children('input[type=file]');
            let wrapper = _this.children('.wrapper');
            let invalid = wrapper.children('.invalid-tooltip');
            let preview = wrapper.children('.preview');
            let loader = wrapper.children('.progress');
            let renderer = preview.children('.renderer');

            // Checks for proper multiple attribute based on class.
            if (input.attr('multiple') && _this.hasClass('file-upload')) {
                input.removeAttr('multiple');
            }
            else if (!input.attr('multiple') && _this.hasClass('files-upload')) {
                input.prop('multiple', true);
            }

            _this.on({
                'dragover dragenter': function (e) {
                    e.originalEvent.dataTransfer.dropEffect = 'copy';

                    reset(_this);
                    return false;
                },
                'dragleave dragexit': function (e) {
                    reset(_this);
                    return false;
                },
                'drop': function (e) {
                    e.preventDefault();
                    e.originalEvent.dataTransfer.dropEffect = 'copy';

                    let files = e.originalEvent.dataTransfer.files || (event.dataTransfer && event.dataTransfer.files) || e.target.files;
                        
                    input.prop('files', files);
                    input.trigger('change');
                },
                'click': function () {
                    input.trigger('click');
                }
            });

            // On file input change
            input.on('change', function () {
                let files = this.files;
                let file = files[0];
                let size = 0;
                let error = null;

                for (const file of files) {
                    size += file.size;
                }

                if (size > 100000000) {
                    error = 'You are can only upload up to a maximum of 100mb.'
                }
                else {
                    if (_this.hasClass('file-upload') && files.length > 1) {
                        error = 'Only 1 file upload is allow.';
                    }
                    // else if (input.attr('accept')) {
                    //     let validation = new RegExp(input.attr('accept').replace(/\s/g, '').replace(',', '|'));
                    //     console.log(input.attr('accept').replace(/\s/g, ''));

                    //     for (let x = 0, n = files.length; x < n; x++) {
                    //         if (!validation.test(files[x].type)) {
                    //             error = `File type is not allowed, for ${files[x].name}.`;
                    //         }
                    //     }
                    // }
                }

                if (error) {
                    invalid.text(error);
                    invalid.addClass('d-block');

                    toastr['error'](error, null, {
                        closeButton: true,
                        progressBar: true,
                        newestOnTop: true,
                        hideDuration: 300,
                        timeOut: 3000,
                        extendedTimeOut: 1500
                    });
                }
                else {
                    // Render image or file extension icon, and overlay text.
                    if (file && file.type.match(/image\//)) {
                        let reader = new FileReader();

                        reader.onload = function (e) {
                            renderer.html(`<img src="${e.target.result}" loading="lazy" />`);
                        };

                        reader.readAsDataURL(file);
                    }
                    else {
                        let extension = file.name.slice(file.name.lastIndexOf('.') + 1);

                        renderer.html(`<i class="fas fa-file"><span class="extension">${extension}</span></i>`);
                    }

                    let filesName = [];

                    for (let x = 0, n = this.files.length; x < n; x++) {
                        filesName.push(this.files[x].name);
                    }

                    _this.children('.wrapper').addClass('has-preview');
                    preview.find('.filename').html(filesName.join('<br />'));
                    preview.addClass('d-block');

                    // Find parent form of current element and submit.
                    let findForm = _this;

                    if (_this.data('autosubmit') != false) {
                        while (!findForm.is('form')) {
                            findForm = findForm.parent();
                        }

                        loader.removeClass('d-none');
                        findForm.submit();
                    }
                }
            });

            _this.hover(function () {
                if (renderer.has('img')) {
                    preview.removeClass('d-none');
                }
            });

            // Attach EventListener to button remove.
            let btnRemove = _this.find('button.remove');

            btnRemove.on('click', function (e) {
                e.stopPropagation();
                reset(_this);
            });

            // Prevent Bubbling Event
            input.on('click', function (e) {
                e.stopPropagation();
                input.val(null);
            });
        });
    }

    let reset = function (focus) {
        $(focus).find('input[type=file]').val(null);
        $(focus).find('.invalid-tooltip').removeClass('d-block');
        $(focus).find('.wrapper').removeClass('has-preview');
        $(focus).find('.preview').removeClass('d-block');
        $(focus).find('.progress').addClass('d-none');
        $(focus).find('.renderer').empty();
        $(focus).find('filename').empty();
    }

    return publicFuncs;
});
