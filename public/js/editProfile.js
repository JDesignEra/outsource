counter = 0
$('#removeButton').attr("disabled", true);
for (i = 1; i < 6; i++) {
    skillInput = document.getElementById("skill" + i)
    if (skillInput.value != "") {
        counter++
    }
}

for (j = 5; j > counter; j--) {
    emptyInput = document.getElementById("skillInput" + j).style.display = "none"
}

$("#addButton").click(function () {
    console.log("clicks")

    counter++;
    console.log(counter)

    document.getElementById("skillInput" + counter).style.display = "block"
    disableOrEnable()
});

$("#removeButton").click(function () {
    skillInput = document.getElementById("skill" + counter).value = ""
    document.getElementById("skillInput" + counter).style.display = "none"
    counter--;
    disableOrEnable()

});


function disableOrEnable() {
    if (counter == 1) {
        $('#removeButton').attr("disabled", true);
        return false
    }
    else {
        $('#removeButton').attr("disabled", false);

    }
    if (counter >= 5) {
        $('#addButton').attr("disabled", true);
        return false;
    }
    else {
        $('#addButton').attr("disabled", false);

    }
}

//================================= Croppie =================================
$(document).ready(function () {
    $('#inputImg').click(function () {
        $("#upload_image").trigger('click');
    })

    //Initialize Croppie
    $image_crop = $('#img-demo').croppie({
        enableExif: true,
        viewport: {
            width: 200,
            height: 200,
            type: 'circle'
        },
        boundary: {
            width: 300,
            height: 300
        }
    });

    //When files change
    $('#upload_image').on('change', function () {
        let reader = new FileReader();
        reader.onload = function (e) {
            $image_crop.croppie('bind', {
                url: e.target.result
            })
        }

        reader.readAsDataURL(this.files[0])
        $('#uploadimageModal').modal('show')
    })



    $('.crop_image').click(function (e) {
        newimg = $image_crop.croppie('result', {
            type: 'base64',
            size: 'viewport'
        })
            .then((image) => {
                console.log(image)
                $('#profilePic').attr('src', image)
                $('#imgString').val(image)
                // console.log(`Test Code: ${$('#profilePic')}`)
                // console.log(`Image Source: ${image}`)
                $('#uploadimageModal').modal('hide')
            }).catch(err => console.log(err))

    })


    //===================================================================

    $('#inputBorder').click(function () {
        $("#upload_banner").trigger('click');
    })

    //Initialize Croppie
    $banner_crop = $('#banner').croppie({
        enableExif: true,
        viewport: {
            width: 700,
            height: 200,
            // type: 'circle'
        },
        boundary: {
            width: 800,
            height: 400
        },

        enforceBoundary: true
    });

    //When files change
    $('#upload_banner').on('change', function () {
        let reader = new FileReader();
        reader.onload = function (e) {
            $banner_crop.croppie('bind', {
                url: e.target.result
            })
        }

        reader.readAsDataURL(this.files[0])
        $('#uploadBannerModal').modal('show')
    })



    $('.crop_banner').click(function (e) {
        newimg = $banner_crop.croppie('result', {
            type: 'base64',
            size: 'original'
        })
            .then((image) => {
                console.log(image)
                $('#bannerePic').attr('src', image)
                $('#bannerString').val(image)

                console.log($('#uploadBannerModal').modal('hide'))
                $('#uploadBannerModal').modal('hide')
            }).catch(err => console.log(err))
       
    })


})

