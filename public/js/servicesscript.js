
function search() {
    var input = document.getElementById('search').value;
    var filter = input.toUpperCase();
    var cards = document.querySelectorAll('.services');
    var name = document.querySelectorAll('.name');
    for (var i = 0; i < cards.length; i++) {
        var compare = name[i].dataset.names;
        if (compare.toUpperCase() === filter) {
            cards[i].style.display = "";
        }
        else {
            cards[i].style.display = "none";
        }
    }
}
document.getElementById("searchbut").addEventListener("click", function(event){
    event.preventDefault()
  });
document.getElementById('searchbut').addEventListener('click', search);