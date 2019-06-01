
function search() {
    var input = document.getElementById('search').value;
    var filter = input.toUpperCase();
    var cards = document.querySelectorAll('.servicecards');
    var name = document.querySelectorAll('.name');
    for (var i = 0; i < cards.length; i++) {
        var compare = name[i].dataset.names;
        if (compare.toUpperCase().includes(filter)) {
            cards[i].style.display = "";
        }
        else {
            cards[i].style.display = "none";
        }
    }
}

document.getElementById('searchbut').addEventListener('click', search);

function filterSelection(category){
    var cards = document.querySelectorAll('.servicecards');
    if (category === "all"){
        for (var i = 0; i < cards.length; i++){
            cards [i].style.display = "";
        }
    }
    else{
        for (var i = 0; i< cards.length; i++){
            if (cards[i].classList.contains(category)){
                cards[i].style.display = "";
            }
            else{
                cards[i].style.display = "none";
            }
        }
    }
}
